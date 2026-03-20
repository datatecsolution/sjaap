package net.datatecsolution.sjaap.repository;

import net.datatecsolution.sjaap.modelo.BarrioColonia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BarrioColoniaRepository extends JpaRepository<BarrioColonia, Integer> {
}
