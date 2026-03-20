package net.datatecsolution.sjaap.controller;

import net.datatecsolution.sjaap.modelo.*;
import net.datatecsolution.sjaap.repository.*;
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
@RequestMapping("/api/cuenta")
public class CuentaConexionController {

    private final CuentaConexionRepository cuentaRepo;
    private final ConexionAguaRepository conexionRepo;
    private final PrecioServicioRepository precioRepo;
    private final ServicioRepository servicioRepo;
    private final EstadoConexionRepository estadoRepo;
    private final AuditoriaCobroRepository auditoriaRepo;

    public CuentaConexionController(CuentaConexionRepository cuentaRepo,
            ConexionAguaRepository conexionRepo,
            PrecioServicioRepository precioRepo,
            ServicioRepository servicioRepo,
            EstadoConexionRepository estadoRepo,
            AuditoriaCobroRepository auditoriaRepo) {
        this.cuentaRepo = cuentaRepo;
        this.conexionRepo = conexionRepo;
        this.precioRepo = precioRepo;
        this.servicioRepo = servicioRepo;
        this.estadoRepo = estadoRepo;
        this.auditoriaRepo = auditoriaRepo;
    }

    @GetMapping("/historial-cobros")
    public List<AuditoriaCobro> getHistorialCobros() {
        return auditoriaRepo.findAllByOrderByFechaDesc();
    }

    @GetMapping("/resumen")
    public List<CuentaConexion> getResumen() {
        return cuentaRepo.findUltimoMovimientoPorConexion();
    }

    @GetMapping("/{idConexion}")
    public List<CuentaConexion> getMovimientos(@PathVariable Integer idConexion) {
        return cuentaRepo.findByConexionIdOrderByNoMovAsc(idConexion);
    }

    @GetMapping("/{idConexion}/saldo")
    public ResponseEntity<BigDecimal> getSaldo(@PathVariable Integer idConexion) {
        return ResponseEntity.ok(
            cuentaRepo.findUltimoMovimiento(idConexion)
                .map(CuentaConexion::getSaldo)
                .orElse(BigDecimal.ZERO)
        );
    }

    /**
     * Debita un servicio a una conexion especifica.
     * Body: { idConexion, idServicio, observacion }
     */
    @PostMapping("/debitar")
    @Transactional
    public ResponseEntity<?> debitarConexion(@RequestBody Map<String, Object> body) {
        Integer idConexion = (Integer) body.get("idConexion");
        Integer idServicio = (Integer) body.get("idServicio");
        String observacion = (String) body.get("observacion");

        ConexionAgua conexion = conexionRepo.findById(idConexion).orElse(null);
        if (conexion == null) return ResponseEntity.badRequest().body("Conexión no encontrada");

        Servicio servicio = servicioRepo.findById(idServicio).orElse(null);
        if (servicio == null) return ResponseEntity.badRequest().body("Servicio no encontrado");

        Integer idTipoConexion = conexion.getTipoConexion() != null ? conexion.getTipoConexion().getId() : null;
        if (idTipoConexion == null) return ResponseEntity.badRequest().body("La conexión no tiene tipo definido");

        PrecioServicio precio = precioRepo.findFirstByServicioIdAndTipoConexionId(idServicio, idTipoConexion)
                .orElse(null);
        if (precio == null) return ResponseEntity.badRequest().body("No hay precio configurado para este servicio/tipo de conexión");

        BigDecimal saldoActual = cuentaRepo.findUltimoMovimiento(idConexion)
                .map(CuentaConexion::getSaldo)
                .orElse(BigDecimal.ZERO);

        String currentUser = SecurityContextHolder.getContext().getAuthentication().getName();

        CuentaConexion mov = new CuentaConexion();
        mov.setConexion(conexion);
        mov.setFecha(LocalDate.now());
        mov.setObservacion(observacion != null ? observacion : servicio.getDescripcion());
        mov.setDebito(precio.getPrecio());
        mov.setSaldo(saldoActual.add(precio.getPrecio()));
        mov.setCreadoPor(currentUser);

        return ResponseEntity.ok(cuentaRepo.save(mov));
    }

    /**
     * Abona (acredita) un pago a la cuenta de una conexión.
     * Body: { idConexion, monto, observacion }
     */
    @PostMapping("/abonar")
    @Transactional
    public ResponseEntity<?> abonarConexion(@RequestBody Map<String, Object> body) {
        Integer idConexion = (Integer) body.get("idConexion");
        String montoStr    = body.get("monto").toString();
        String observacion = (String) body.get("observacion");

        ConexionAgua conexion = conexionRepo.findById(idConexion).orElse(null);
        if (conexion == null) return ResponseEntity.badRequest().body("Conexión no encontrada");

        BigDecimal monto = new BigDecimal(montoStr);
        if (monto.compareTo(BigDecimal.ZERO) <= 0)
            return ResponseEntity.badRequest().body("El monto debe ser mayor a cero");

        BigDecimal saldoActual = cuentaRepo.findUltimoMovimiento(idConexion)
                .map(CuentaConexion::getSaldo)
                .orElse(BigDecimal.ZERO);

        String currentUser = SecurityContextHolder.getContext().getAuthentication().getName();

        CuentaConexion mov = new CuentaConexion();
        mov.setConexion(conexion);
        mov.setFecha(LocalDate.now());
        mov.setObservacion(observacion != null && !observacion.isBlank() ? observacion : "Pago recibido");
        mov.setCredito(monto);
        mov.setSaldo(saldoActual.subtract(monto));
        mov.setCreadoPor(currentUser);

        return ResponseEntity.ok(cuentaRepo.save(mov));
    }

    /**
     * Debita un servicio a todas las conexiones activas (cobro masivo).
     * Body: { idServicio, idEstadoConexion, observacion }
     */
    @PostMapping("/debitar-masivo")
    @Transactional
    public ResponseEntity<Map<String, Object>> debitarMasivo(@RequestBody Map<String, Object> body) {
        Integer idServicio = (Integer) body.get("idServicio");
        Integer idEstado = (Integer) body.get("idEstadoConexion");
        String observacion = (String) body.get("observacion");

        Servicio servicio = servicioRepo.findById(idServicio).orElse(null);
        if (servicio == null) return ResponseEntity.badRequest().body(Map.of("error", "Servicio no encontrado"));

        String obsEfectiva = observacion != null ? observacion : servicio.getDescripcion();

        // Conteos previos (queries rápidas en MySQL)
        long total      = conexionRepo.countByEstadoConexionId(idEstado);
        long yaCobradas = cuentaRepo.countYaCobradas(idEstado, obsEfectiva);
        long sinPrecio  = cuentaRepo.countSinPrecio(idEstado, idServicio);

        String currentUser = SecurityContextHolder.getContext().getAuthentication().getName();

        // Un solo INSERT masivo — hace todo en MySQL sin loop Java
        int procesadas = cuentaRepo.insertDebitoMasivo(idServicio, idEstado, obsEfectiva, currentUser);

        // Guardar registro de auditoría
        EstadoConexion estadoConexion = estadoRepo.findById(idEstado).orElse(null);
        AuditoriaCobro auditoria = new AuditoriaCobro();
        auditoria.setFecha(LocalDateTime.now());
        auditoria.setServicio(servicio);
        auditoria.setEstadoConexion(estadoConexion);
        auditoria.setObservacion(obsEfectiva);
        auditoria.setTotalConexiones((int) total);
        auditoria.setProcesadas(procesadas);
        auditoria.setYaCobradas((int) yaCobradas);
        auditoria.setSinPrecio((int) sinPrecio);
        auditoria.setUsuario(currentUser);
        auditoriaRepo.save(auditoria);

        return ResponseEntity.ok(Map.of(
                "procesadas", procesadas,
                "sinPrecio",  sinPrecio,
                "yaCobradas", yaCobradas,
                "total",      total
        ));
    }
}
