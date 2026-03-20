package net.datatecsolution.sjaap.controller;

import net.datatecsolution.sjaap.repository.CuentaConexionRepository;
import net.datatecsolution.sjaap.repository.FacturaTotalRepository;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final FacturaTotalRepository facturaRepo;
    private final CuentaConexionRepository cuentaRepo;

    public DashboardController(FacturaTotalRepository facturaRepo,
                               CuentaConexionRepository cuentaRepo) {
        this.facturaRepo = facturaRepo;
        this.cuentaRepo  = cuentaRepo;
    }

    @GetMapping("/stats")
    public Map<String, Object> getStats() {
        LocalDateTime inicioMes = LocalDateTime.now()
                .withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0).withNano(0);

        long facturasPendientes = facturaRepo.countByEstado(0);
        BigDecimal ingresosMes  = facturaRepo.sumIngresosMes(inicioMes);

        Object[] saldos = cuentaRepo.getResumenSaldos().get(0);
        long totalDeudores    = ((Number) saldos[0]).longValue();
        BigDecimal montoPorCobrar = new BigDecimal(saldos[1].toString());

        return Map.of(
                "facturasPendientes", facturasPendientes,
                "ingresosMes",        ingresosMes != null ? ingresosMes : BigDecimal.ZERO,
                "totalDeudores",      totalDeudores,
                "montoPorCobrar",     montoPorCobrar
        );
    }
}
