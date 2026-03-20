package net.datatecsolution.sjaap.repository;

import net.datatecsolution.sjaap.modelo.FacturaDetalle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface FacturaDetalleRepository extends JpaRepository<FacturaDetalle, Integer> {
    List<FacturaDetalle> findByFacturaNoFactura(Integer noFactura);

    @Query("SELECT COUNT(d) > 0 FROM FacturaDetalle d " +
           "WHERE d.factura.conexion.id = :idConexion " +
           "AND d.servicio.id = :idServicio " +
           "AND d.observacion = :anio " +
           "AND d.factura.estado = 1")
    boolean existeServicioPagado(Integer idConexion, Integer idServicio, String anio);
}
