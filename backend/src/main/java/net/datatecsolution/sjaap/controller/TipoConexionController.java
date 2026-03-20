package net.datatecsolution.sjaap.controller;

import net.datatecsolution.sjaap.modelo.TipoConexion;
import net.datatecsolution.sjaap.repository.TipoConexionRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tipos-conexiones")
public class TipoConexionController {

    private final TipoConexionRepository repository;

    public TipoConexionController(TipoConexionRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<TipoConexion> getAll() {
        return repository.findAll();
    }

    @PostMapping
    public TipoConexion create(@RequestBody TipoConexion tipoConexion) {
        return repository.save(tipoConexion);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TipoConexion> update(@PathVariable Integer id, @RequestBody TipoConexion details) {
        return repository.findById(id)
                .map(tipo -> {
                    tipo.setDescripcion(details.getDescripcion());
                    tipo.setObservaciones(details.getObservaciones());
                    return ResponseEntity.ok(repository.save(tipo));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        return repository.findById(id)
                .map(tipo -> {
                    repository.delete(tipo);
                    return ResponseEntity.ok().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
