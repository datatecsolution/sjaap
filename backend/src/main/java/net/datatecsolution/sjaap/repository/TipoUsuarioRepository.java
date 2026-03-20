package net.datatecsolution.sjaap.repository;

import net.datatecsolution.sjaap.modelo.TipoUsuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TipoUsuarioRepository extends JpaRepository<TipoUsuario, Integer> {
    Optional<TipoUsuario> findByNivelAcceso(Integer nivelAcceso);
}
