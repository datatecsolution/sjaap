package net.datatecsolution.sjaap.repository;

import net.datatecsolution.sjaap.modelo.TipoConexion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TipoConexionRepository extends JpaRepository<TipoConexion, Integer> {
}
