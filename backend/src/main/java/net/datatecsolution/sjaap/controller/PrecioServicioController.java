package net.datatecsolution.sjaap.controller;

import net.datatecsolution.sjaap.modelo.PrecioServicio;
import net.datatecsolution.sjaap.repository.PrecioServicioRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/precios-servicios")
public class PrecioServicioController {

    private final PrecioServicioRepository repository;

    public PrecioServicioController(PrecioServicioRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<PrecioServicio> getAll() {
        return repository.findAll();
    }

    @GetMapping("/tipo/{idTipo}")
    public List<PrecioServicio> getByTipoConexion(@PathVariable Integer idTipo) {
        return repository.findByTipoConexionId(idTipo);
    }

    @PostMapping
    public PrecioServicio create(@RequestBody PrecioServicio precioServicio) {
        return repository.save(precioServicio);
    }

    @PutMapping("/{id}")
    public ResponseEntity<PrecioServicio> update(@PathVariable Integer id, @RequestBody PrecioServicio details) {
        return repository.findById(id)
                .map(ps -> {
                    ps.setServicio(details.getServicio());
                    ps.setPrecio(details.getPrecio());
                    ps.setTipoConexion(details.getTipoConexion());
                    return ResponseEntity.ok(repository.save(ps));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        return repository.findById(id)
                .map(ps -> {
                    repository.delete(ps);
                    return ResponseEntity.ok().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
