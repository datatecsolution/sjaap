package net.datatecsolution.sjaap.controller;

import net.datatecsolution.sjaap.modelo.BarrioColonia;
import net.datatecsolution.sjaap.repository.BarrioColoniaRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/barrios")
public class BarrioColoniaController {

    private final BarrioColoniaRepository repository;

    public BarrioColoniaController(BarrioColoniaRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<BarrioColonia> getAll() {
        return repository.findAll();
    }

    @PostMapping
    public BarrioColonia create(@RequestBody BarrioColonia barrio) {
        return repository.save(barrio);
    }

    @PutMapping("/{id}")
    public ResponseEntity<BarrioColonia> update(@PathVariable Integer id, @RequestBody BarrioColonia details) {
        return repository.findById(id)
                .map(barrio -> {
                    barrio.setDescripcion(details.getDescripcion());
                    barrio.setSector(details.getSector());
                    return ResponseEntity.ok(repository.save(barrio));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        return repository.findById(id)
                .map(barrio -> {
                    repository.delete(barrio);
                    return ResponseEntity.ok().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
