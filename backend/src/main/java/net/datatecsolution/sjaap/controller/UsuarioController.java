package net.datatecsolution.sjaap.controller;

import net.datatecsolution.sjaap.modelo.Usuario;
import net.datatecsolution.sjaap.repository.UsuarioRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    private final UsuarioRepository repository;
    private final PasswordEncoder passwordEncoder;

    public UsuarioController(UsuarioRepository repository, PasswordEncoder passwordEncoder) {
        this.repository = repository;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping
    public List<Usuario> getAll() {
        return repository.findAll();
    }

    @GetMapping("/paginado")
    public Page<Usuario> getPaginated(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "") String search) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        if (search.isBlank()) {
            return repository.findAll(pageable);
        }
        return repository.findByNombreContainingIgnoreCaseOrApellidoContainingIgnoreCaseOrEmailContainingIgnoreCase(
                search, search, search, pageable);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Usuario> getById(@PathVariable Integer id) {
        return repository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Usuario create(@RequestBody Usuario usuario) {
        usuario.setPassword(passwordEncoder.encode(usuario.getPassword()));
        return repository.save(usuario);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Usuario> update(@PathVariable Integer id, @RequestBody Usuario usuarioDetails) {
        return repository.findById(id)
                .map(usuario -> {
                    usuario.setNombre(usuarioDetails.getNombre());
                    usuario.setApellido(usuarioDetails.getApellido());
                    usuario.setEmail(usuarioDetails.getEmail());
                    usuario.setCelular(usuarioDetails.getCelular());
                    usuario.setTelefono(usuarioDetails.getTelefono());
                    usuario.setDireccion(usuarioDetails.getDireccion());
                    usuario.setTipoUsuario(usuarioDetails.getTipoUsuario());

                    // Only update password if provided
                    if (usuarioDetails.getPassword() != null && !usuarioDetails.getPassword().trim().isEmpty()) {
                        usuario.setPassword(passwordEncoder.encode(usuarioDetails.getPassword()));
                    }

                    return ResponseEntity.ok(repository.save(usuario));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/mi-password")
    public ResponseEntity<?> cambiarPassword(@RequestBody Map<String, String> body) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        String actual = body.get("passwordActual");
        String nuevo  = body.get("passwordNuevo");

        if (nuevo == null || nuevo.length() < 6)
            return ResponseEntity.badRequest().body("La nueva contraseña debe tener al menos 6 caracteres.");

        return repository.findByEmail(email)
                .map(u -> {
                    if (!passwordEncoder.matches(actual, u.getPassword()))
                        return ResponseEntity.status(400).<Object>body("La contraseña actual es incorrecta.");
                    u.setPassword(passwordEncoder.encode(nuevo));
                    repository.save(u);
                    return ResponseEntity.ok().<Object>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/reset-password")
    public ResponseEntity<?> resetPassword(@PathVariable Integer id, @RequestBody Map<String, String> body) {
        String nuevo = body.get("passwordNuevo");
        if (nuevo == null || nuevo.length() < 6)
            return ResponseEntity.badRequest().body("La nueva contraseña debe tener al menos 6 caracteres.");

        return repository.findById(id)
                .map(u -> {
                    u.setPassword(passwordEncoder.encode(nuevo));
                    repository.save(u);
                    return ResponseEntity.ok().<Object>body("Contraseña restablecida correctamente.");
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        return repository.findById(id)
                .map(usuario -> {
                    repository.delete(usuario);
                    return ResponseEntity.ok().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
