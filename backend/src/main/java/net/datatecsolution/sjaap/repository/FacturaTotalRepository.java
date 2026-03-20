package net.datatecsolution.sjaap.repository;

import net.datatecsolution.sjaap.modelo.FacturaTotal;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public interface FacturaTotalRepository extends JpaRepository<FacturaTotal, Integer> {
    List<FacturaTotal> findByConexionId(Integer idConexion);
    Page<FacturaTotal> findByEstado(Integer estado, Pageable pageable);
    List<FacturaTotal> findByFechaBetweenAndEstado(LocalDateTime desde, LocalDateTime hasta, Integer estado);

    long countByEstado(Integer estado);

    @Query("SELECT COALESCE(SUM(f.totalPagar), 0) FROM FacturaTotal f WHERE f.estado = 1 AND f.fecha >= :inicio")
    BigDecimal sumIngresosMes(@Param("inicio") LocalDateTime inicio);

    @Query(value =
        "SELECT DATE_FORMAT(fecha, '%Y-%m') AS periodo, " +
        "       COUNT(*) AS totalFacturas, " +
        "       SUM(CASE WHEN estado = 1 THEN 1 ELSE 0 END) AS pagadas, " +
        "       SUM(CASE WHEN estado = 0 THEN 1 ELSE 0 END) AS pendientes, " +
        "       COALESCE(SUM(CASE WHEN estado = 1 THEN total_pagar ELSE 0 END), 0) AS totalCobrado, " +
        "       COALESCE(SUM(CASE WHEN estado = 0 THEN total_pagar ELSE 0 END), 0) AS totalPendiente " +
        "FROM factura_total " +
        "WHERE fecha BETWEEN :desde AND :hasta " +
        "GROUP BY periodo ORDER BY periodo DESC",
        nativeQuery = true)
    List<Object[]> getResumenPorPeriodo(@Param("desde") LocalDateTime desde,
                                        @Param("hasta") LocalDateTime hasta);
}
