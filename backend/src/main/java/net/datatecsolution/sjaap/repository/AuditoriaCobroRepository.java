package net.datatecsolution.sjaap.repository;

import net.datatecsolution.sjaap.modelo.AuditoriaCobro;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AuditoriaCobroRepository extends JpaRepository<AuditoriaCobro, Integer> {
    List<AuditoriaCobro> findAllByOrderByFechaDesc();
}
