package net.datatecsolution.sjaap.controller;

import net.datatecsolution.sjaap.modelo.Abonado;
import net.datatecsolution.sjaap.repository.AbonadoRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/abonados")
public class AbonadoController {

    private final AbonadoRepository repository;

    public AbonadoController(AbonadoRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<Abonado> getAll() {
        return repository.findAll();
    }

    @GetMapping("/paginado")
    public Page<Abonado> getPaginated(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "") String search) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        if (search.isBlank()) {
            return repository.findAll(pageable);
        }
        return repository.findByNombreContainingIgnoreCaseOrApellidoContainingIgnoreCase(search, search, pageable);
    }

    @PostMapping
    public Abonado create(@RequestBody Abonado abonado) {
        return repository.save(abonado);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Abonado> getById(@PathVariable Integer id) {
        return repository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Abonado> update(@PathVariable Integer id, @RequestBody Abonado abonadoDetails) {
        return repository.findById(id)
                .map(abonado -> {
                    abonado.setNombre(abonadoDetails.getNombre());
                    abonado.setApellido(abonadoDetails.getApellido());
                    abonado.setDireccion(abonadoDetails.getDireccion());
                    abonado.setTelefono(abonadoDetails.getTelefono());
                    abonado.setCelular(abonadoDetails.getCelular());
                    abonado.setEmail(abonadoDetails.getEmail());
                    return ResponseEntity.ok(repository.save(abonado));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        return repository.findById(id)
                .map(abonado -> {
                    repository.delete(abonado);
                    return ResponseEntity.ok().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
