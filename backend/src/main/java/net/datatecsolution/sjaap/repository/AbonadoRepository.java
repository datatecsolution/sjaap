package net.datatecsolution.sjaap.repository;

import net.datatecsolution.sjaap.modelo.Abonado;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AbonadoRepository extends JpaRepository<Abonado, Integer> {
    Page<Abonado> findByNombreContainingIgnoreCaseOrApellidoContainingIgnoreCase(
            String nombre, String apellido, Pageable pageable);
}
