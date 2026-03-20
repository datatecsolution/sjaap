package net.datatecsolution.sjaap.repository;

import net.datatecsolution.sjaap.modelo.PrecioServicio;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface PrecioServicioRepository extends JpaRepository<PrecioServicio, Integer> {
    List<PrecioServicio> findByTipoConexionId(Integer idTipoConexion);
    Optional<PrecioServicio> findFirstByServicioIdAndTipoConexionId(Integer idServicio, Integer idTipoConexion);
}
