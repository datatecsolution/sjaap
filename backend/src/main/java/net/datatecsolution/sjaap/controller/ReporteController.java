package net.datatecsolution.sjaap.controller;

import net.datatecsolution.sjaap.repository.CuentaConexionRepository;
import net.datatecsolution.sjaap.repository.FacturaTotalRepository;
import net.datatecsolution.sjaap.repository.FacturaDetalleRepository;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/reportes")
public class ReporteController {

    private final CuentaConexionRepository cuentaRepo;
    private final FacturaTotalRepository facturaRepo;
    private final FacturaDetalleRepository detalleRepo;

    public ReporteController(CuentaConexionRepository cuentaRepo,
                             FacturaTotalRepository facturaRepo,
                             FacturaDetalleRepository detalleRepo) {
        this.cuentaRepo = cuentaRepo;
        this.facturaRepo = facturaRepo;
        this.detalleRepo = detalleRepo;
    }

    /**
     * Top deudores: conexiones con mayor saldo positivo (deuda).
     * Optimizado: todo el filtrado, ordenamiento y límite se hace en SQL.
     */
    @GetMapping("/top-deudores")
    public List<Map<String, Object>> getTopDeudores(@RequestParam(defaultValue = "20") int limite) {
        return cuentaRepo.findTopDeudoresNativo(limite).stream()
                .map(row -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("idConexion",  row[0]);
                    m.put("abonado",     row[1] != null ? row[1].toString().trim() : "—");
                    m.put("direccion",   row[2]);
                    m.put("tipo",        row[3]);
                    m.put("saldo",       new BigDecimal(row[4].toString()));
                    m.put("ultimaFecha", row[5]);
                    m.put("observacion", row[6]);
                    return m;
                })
                .collect(Collectors.toList());
    }

    /**
     * Ingresos por servicio en un rango de fechas.
     */
    @GetMapping("/ingresos-servicio")
    public List<Map<String, Object>> getIngresosPorServicio(
            @RequestParam String desde,
            @RequestParam String hasta) {
        LocalDateTime d = LocalDate.parse(desde).atStartOfDay();
        LocalDateTime h = LocalDate.parse(hasta).atTime(23, 59, 59);

        var facturas = facturaRepo.findByFechaBetweenAndEstado(d, h, 1);

        Map<String, BigDecimal[]> agrupado = new LinkedHashMap<>();

        for (var factura : facturas) {
            if (factura.getDetalles() == null) continue;
            for (var detalle : factura.getDetalles()) {
                String nombreServicio = detalle.getServicio() != null
                        ? detalle.getServicio().getDescripcion() : "Sin servicio";
                agrupado.computeIfAbsent(nombreServicio, k -> new BigDecimal[]{BigDecimal.ZERO, BigDecimal.ZERO});
                BigDecimal[] vals = agrupado.get(nombreServicio);
                vals[0] = vals[0].add(BigDecimal.ONE);
                vals[1] = vals[1].add(detalle.getPrecio() != null ? detalle.getPrecio() : BigDecimal.ZERO);
            }
        }

        return agrupado.entrySet().stream()
                .map(e -> {
                    Map<String, Object> row = new LinkedHashMap<>();
                    row.put("servicio", e.getKey());
                    row.put("cantidad", e.getValue()[0].intValue());
                    row.put("totalIngreso", e.getValue()[1]);
                    return row;
                })
                .sorted((a, b) -> ((BigDecimal) b.get("totalIngreso")).compareTo((BigDecimal) a.get("totalIngreso")))
                .collect(Collectors.toList());
    }

    /**
     * Antigüedad de deuda: conexiones con deuda agrupadas por rango de tiempo.
     * Optimizado: toda la agrupación se hace en SQL.
     */
    @GetMapping("/antiguedad-deuda")
    public Map<String, Object> getAntiguedadDeuda() {
        Object[] row = cuentaRepo.getAntiguedadDeudaNativo().get(0);

        int d030    = ((Number) row[0]).intValue();
        BigDecimal m030  = new BigDecimal(row[1].toString());
        int d3060   = ((Number) row[2]).intValue();
        BigDecimal m3060 = new BigDecimal(row[3].toString());
        int d6090   = ((Number) row[4]).intValue();
        BigDecimal m6090 = new BigDecimal(row[5].toString());
        int d90mas  = ((Number) row[6]).intValue();
        BigDecimal m90mas = new BigDecimal(row[7].toString());

        List<Map<String, Object>> rangos = List.of(
                Map.of("rango", "0-30 días", "conexiones", d030, "monto", m030),
                Map.of("rango", "31-60 días", "conexiones", d3060, "monto", m3060),
                Map.of("rango", "61-90 días", "conexiones", d6090, "monto", m6090),
                Map.of("rango", "90+ días", "conexiones", d90mas, "monto", m90mas)
        );

        BigDecimal totalDeuda = m030.add(m3060).add(m6090).add(m90mas);
        int totalConexiones = d030 + d3060 + d6090 + d90mas;

        return Map.of(
                "rangos", rangos,
                "totalConexiones", totalConexiones,
                "totalDeuda", totalDeuda
        );
    }
}
