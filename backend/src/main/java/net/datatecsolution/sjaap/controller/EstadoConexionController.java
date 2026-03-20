package net.datatecsolution.sjaap.controller;

import net.datatecsolution.sjaap.modelo.EstadoConexion;
import net.datatecsolution.sjaap.repository.EstadoConexionRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/estados-conexiones")
public class EstadoConexionController {

    private final EstadoConexionRepository repository;

    public EstadoConexionController(EstadoConexionRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<EstadoConexion> getAll() {
        return repository.findAll();
    }

    @PostMapping
    public EstadoConexion create(@RequestBody EstadoConexion estado) {
        return repository.save(estado);
    }

    @PutMapping("/{id}")
    public ResponseEntity<EstadoConexion> update(@PathVariable Integer id, @RequestBody EstadoConexion details) {
        return repository.findById(id)
                .map(estado -> {
                    estado.setEstado(details.getEstado());
                    return ResponseEntity.ok(repository.save(estado));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        return repository.findById(id)
                .map(estado -> {
                    repository.delete(estado);
                    return ResponseEntity.ok().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
