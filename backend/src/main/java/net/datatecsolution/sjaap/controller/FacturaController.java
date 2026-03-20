package net.datatecsolution.sjaap.controller;

import net.datatecsolution.sjaap.modelo.*;
import net.datatecsolution.sjaap.repository.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/facturas")
public class FacturaController {

    private final FacturaTotalRepository facturaRepo;
    private final FacturaDetalleRepository detalleRepo;
    private final ConexionAguaRepository conexionRepo;
    private final ServicioRepository servicioRepo;
    private final CuentaConexionRepository cuentaRepo;

    public FacturaController(FacturaTotalRepository facturaRepo,
            FacturaDetalleRepository detalleRepo,
            ConexionAguaRepository conexionRepo,
            ServicioRepository servicioRepo,
            CuentaConexionRepository cuentaRepo) {
        this.facturaRepo = facturaRepo;
        this.detalleRepo = detalleRepo;
        this.conexionRepo = conexionRepo;
        this.servicioRepo = servicioRepo;
        this.cuentaRepo = cuentaRepo;
    }

    @GetMapping
    public List<FacturaTotal> getAll() {
        return facturaRepo.findAll();
    }

    @GetMapping("/paginado")
    public Page<FacturaTotal> getPaginated(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "-1") int estado) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("noFactura").descending());
        if (estado >= 0) {
            return facturaRepo.findByEstado(estado, pageable);
        }
        return facturaRepo.findAll(pageable);
    }

    @GetMapping("/resumen-periodo")
    public List<Map<String, Object>> getResumenPeriodo(
            @RequestParam String desde,
            @RequestParam String hasta) {
        LocalDateTime d = LocalDate.parse(desde).atStartOfDay();
        LocalDateTime h = LocalDate.parse(hasta).atTime(23, 59, 59);
        return facturaRepo.getResumenPorPeriodo(d, h).stream()
                .map(row -> {
                    java.util.HashMap<String, Object> m = new java.util.HashMap<>();
                    m.put("periodo",        row[0].toString());
                    m.put("totalFacturas",  ((Number) row[1]).longValue());
                    m.put("pagadas",        ((Number) row[2]).longValue());
                    m.put("pendientes",     ((Number) row[3]).longValue());
                    m.put("totalCobrado",   new java.math.BigDecimal(row[4].toString()));
                    m.put("totalPendiente", new java.math.BigDecimal(row[5].toString()));
                    return m;
                })
                .collect(java.util.stream.Collectors.toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<FacturaTotal> getById(@PathVariable Integer id) {
        return facturaRepo.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/conexion/{idConexion}")
    public List<FacturaTotal> getByConexion(@PathVariable Integer idConexion) {
        return facturaRepo.findByConexionId(idConexion);
    }

    @GetMapping("/verificar")
    public Map<String, Boolean> verificarServicioPagado(
            @RequestParam Integer idConexion,
            @RequestParam Integer idServicio,
            @RequestParam String anio) {
        boolean pagado = detalleRepo.existeServicioPagado(idConexion, idServicio, anio);
        return Map.of("pagado", pagado);
    }

    /**
     * Crea una factura nueva con sus detalles.
     * Body: {
     *   idConexion: int,
     *   efectivo: decimal,
     *   detalles: [{ idServicio: int, precio: decimal, observacion: string }]
     * }
     */
    @PostMapping
    @Transactional
    public ResponseEntity<?> create(@RequestBody Map<String, Object> body) {
        Integer idConexion = (Integer) body.get("idConexion");
        ConexionAgua conexion = conexionRepo.findById(idConexion).orElse(null);
        if (conexion == null) return ResponseEntity.badRequest().body("Conexión no encontrada");

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> detallesInput = (List<Map<String, Object>>) body.get("detalles");
        if (detallesInput == null || detallesInput.isEmpty())
            return ResponseEntity.badRequest().body("La factura debe tener al menos un detalle");

        BigDecimal total = BigDecimal.ZERO;
        for (Map<String, Object> d : detallesInput) {
            total = total.add(new BigDecimal(d.get("precio").toString()));
        }

        BigDecimal efectivo = body.get("efectivo") != null
                ? new BigDecimal(body.get("efectivo").toString()) : total;
        BigDecimal cambio = efectivo.subtract(total);

        String currentUser = SecurityContextHolder.getContext().getAuthentication().getName();

        FacturaTotal factura = new FacturaTotal();
        factura.setFecha(LocalDateTime.now());
        factura.setConexion(conexion);
        factura.setTotalPagar(total);
        factura.setEfectivo(efectivo);
        factura.setCambio(cambio.compareTo(BigDecimal.ZERO) < 0 ? BigDecimal.ZERO : cambio);
        factura.setEstado(0);
        factura.setCreadoPor(currentUser);
        FacturaTotal saved = facturaRepo.save(factura);

        for (Map<String, Object> d : detallesInput) {
            Integer idServicio = (Integer) d.get("idServicio");
            Servicio servicio = servicioRepo.findById(idServicio).orElse(null);
            if (servicio == null) continue;

            FacturaDetalle detalle = new FacturaDetalle();
            detalle.setFactura(saved);
            detalle.setServicio(servicio);
            detalle.setPrecio(new BigDecimal(d.get("precio").toString()));
            detalle.setObservacion(d.get("observacion") != null ? d.get("observacion").toString() : null);
            detalleRepo.save(detalle);
        }

        return ResponseEntity.ok(facturaRepo.findById(saved.getNoFactura()).orElse(saved));
    }

    /**
     * Marca una factura como pagada y crea el credito en cuenta_conexiones.
     */
    @PutMapping("/{id}/pagar")
    @Transactional
    public ResponseEntity<?> pagar(@PathVariable Integer id) {
        FacturaTotal factura = facturaRepo.findById(id).orElse(null);
        if (factura == null) return ResponseEntity.notFound().build();
        if (factura.getEstado() == 1) return ResponseEntity.badRequest().body("La factura ya está pagada");

        String currentUser = SecurityContextHolder.getContext().getAuthentication().getName();

        factura.setEstado(1);
        factura.setPagadoPor(currentUser);
        factura.setFechaPago(LocalDateTime.now());
        facturaRepo.save(factura);

        if (factura.getConexion() != null) {
            BigDecimal saldoActual = cuentaRepo.findUltimoMovimiento(factura.getConexion().getId())
                    .map(CuentaConexion::getSaldo)
                    .orElse(BigDecimal.ZERO);

            CuentaConexion credito = new CuentaConexion();
            credito.setConexion(factura.getConexion());
            credito.setFecha(LocalDate.now());
            credito.setObservacion("Pago factura #" + factura.getNoFactura());
            credito.setCredito(factura.getTotalPagar());
            credito.setNoFactura(factura.getNoFactura());
            credito.setSaldo(saldoActual.subtract(factura.getTotalPagar()));
            credito.setCreadoPor(currentUser);
            cuentaRepo.save(credito);
        }

        return ResponseEntity.ok(factura);
    }

    /**
     * Anula una factura (solo si está pendiente).
     */
    @PutMapping("/{id}/anular")
    @Transactional
    public ResponseEntity<?> anular(@PathVariable Integer id, @RequestBody Map<String, String> body) {
        FacturaTotal factura = facturaRepo.findById(id).orElse(null);
        if (factura == null) return ResponseEntity.notFound().build();
        if (factura.getEstado() != 0) return ResponseEntity.badRequest().body("Solo se pueden anular facturas pendientes");

        String motivo = body.get("motivo");
        if (motivo == null || motivo.isBlank()) return ResponseEntity.badRequest().body("Debe indicar el motivo de anulación");

        String currentUser = SecurityContextHolder.getContext().getAuthentication().getName();
        factura.setEstado(2);
        factura.setAnuladoPor(currentUser);
        factura.setFechaAnulacion(LocalDateTime.now());
        factura.setMotivoAnulacion(motivo);
        facturaRepo.save(factura);

        return ResponseEntity.ok(factura);
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        return facturaRepo.findById(id)
                .map(f -> {
                    if (f.getEstado() != 0) return ResponseEntity.badRequest().<Void>build();
                    facturaRepo.delete(f);
                    return ResponseEntity.ok().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
