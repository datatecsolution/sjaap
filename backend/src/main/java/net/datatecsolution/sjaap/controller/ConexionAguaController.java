package net.datatecsolution.sjaap.controller;

import net.datatecsolution.sjaap.modelo.ConexionAgua;
import net.datatecsolution.sjaap.repository.ConexionAguaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/conexiones")
public class ConexionAguaController {

    private final ConexionAguaRepository repository;

    public ConexionAguaController(ConexionAguaRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<ConexionAgua> getAll() {
        return repository.findAll();
    }

    @GetMapping("/paginado")
    public Page<ConexionAgua> getPaginated(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "") String search) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        if (search.isBlank()) {
            return repository.findAll(pageable);
        }
        return repository.findByDireccionContainingIgnoreCaseOrAbonadoNombreContainingIgnoreCase(search, search, pageable);
    }

    @GetMapping("/abonado/{abonadoId}")
    public List<ConexionAgua> getByAbonado(@PathVariable Integer abonadoId) {
        return repository.findByAbonadoId(abonadoId);
    }

    @PostMapping
    public ConexionAgua create(@RequestBody ConexionAgua conexion) {
        return repository.save(conexion);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ConexionAgua> getById(@PathVariable Integer id) {
        return repository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<ConexionAgua> update(@PathVariable Integer id, @RequestBody ConexionAgua conexionDetails) {
        return repository.findById(id)
                .map(conexion -> {
                    conexion.setAbonado(conexionDetails.getAbonado());
                    conexion.setBarrioColonia(conexionDetails.getBarrioColonia());
                    conexion.setDireccion(conexionDetails.getDireccion());
                    conexion.setNoForm(conexionDetails.getNoForm());
                    conexion.setEstadoConexion(conexionDetails.getEstadoConexion());
                    conexion.setTipoConexion(conexionDetails.getTipoConexion());
                    ConexionAgua updatedConexion = repository.save(conexion);
                    return ResponseEntity.ok(updatedConexion);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        return repository.findById(id)
                .map(conexion -> {
                    repository.delete(conexion);
                    return ResponseEntity.ok().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
