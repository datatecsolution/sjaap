package net.datatecsolution.sjaap.repository;

import net.datatecsolution.sjaap.modelo.EstadoConexion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EstadoConexionRepository extends JpaRepository<EstadoConexion, Integer> {
}
