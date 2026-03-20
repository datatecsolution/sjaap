package net.datatecsolution.sjaap.controller;

import net.datatecsolution.sjaap.modelo.Servicio;
import net.datatecsolution.sjaap.repository.ServicioRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/servicios")
public class ServicioController {

    private final ServicioRepository repository;

    public ServicioController(ServicioRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<Servicio> getAll() {
        return repository.findAll();
    }

    @PostMapping
    public Servicio create(@RequestBody Servicio servicio) {
        return repository.save(servicio);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Servicio> getById(@PathVariable Integer id) {
        return repository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Servicio> update(@PathVariable Integer id, @RequestBody Servicio details) {
        return repository.findById(id)
                .map(servicio -> {
                    servicio.setDescripcion(details.getDescripcion());
                    servicio.setTipoServicio(details.getTipoServicio());
                    return ResponseEntity.ok(repository.save(servicio));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        return repository.findById(id)
                .map(servicio -> {
                    repository.delete(servicio);
                    return ResponseEntity.ok().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
