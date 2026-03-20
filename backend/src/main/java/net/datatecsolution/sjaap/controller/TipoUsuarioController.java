package net.datatecsolution.sjaap.controller;

import net.datatecsolution.sjaap.modelo.TipoUsuario;
import net.datatecsolution.sjaap.repository.TipoUsuarioRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tipos-usuarios")
public class TipoUsuarioController {

    private final TipoUsuarioRepository repository;

    public TipoUsuarioController(TipoUsuarioRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<TipoUsuario> getAll() {
        return repository.findAll();
    }

    @PostMapping
    public TipoUsuario create(@RequestBody TipoUsuario tipoUsuario) {
        return repository.save(tipoUsuario);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TipoUsuario> update(@PathVariable Integer id, @RequestBody TipoUsuario details) {
        return repository.findById(id)
                .map(tipo -> {
                    tipo.setDescripcion(details.getDescripcion());
                    tipo.setNivelAcceso(details.getNivelAcceso());
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
