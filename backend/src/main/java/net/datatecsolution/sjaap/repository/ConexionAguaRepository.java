package net.datatecsolution.sjaap.repository;

import net.datatecsolution.sjaap.modelo.ConexionAgua;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ConexionAguaRepository extends JpaRepository<ConexionAgua, Integer> {
    List<ConexionAgua> findByAbonadoId(Integer abonadoId);
    long countByEstadoConexionId(Integer idEstado);
    Page<ConexionAgua> findByDireccionContainingIgnoreCaseOrAbonadoNombreContainingIgnoreCase(
            String direccion, String nombre, Pageable pageable);
}
