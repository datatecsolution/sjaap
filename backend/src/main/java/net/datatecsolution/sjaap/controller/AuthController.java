package net.datatecsolution.sjaap.controller;

import net.datatecsolution.sjaap.modelo.Usuario;
import net.datatecsolution.sjaap.repository.UsuarioRepository;
import net.datatecsolution.sjaap.security.JwtUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.bind.annotation.*;
import lombok.Data;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final Logger log = LoggerFactory.getLogger(AuthController.class);

    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;
    private final JwtUtil jwtUtil;
    private final UsuarioRepository usuarioRepository;

    public AuthController(AuthenticationManager authenticationManager, UserDetailsService userDetailsService,
            JwtUtil jwtUtil, UsuarioRepository usuarioRepository) {
        this.authenticationManager = authenticationManager;
        this.userDetailsService = userDetailsService;
        this.jwtUtil = jwtUtil;
        this.usuarioRepository = usuarioRepository;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));
            UserDetails userDetails = userDetailsService.loadUserByUsername(request.getEmail());
            String jwt = jwtUtil.generateToken(userDetails);
            return ResponseEntity.ok(new AuthResponse(jwt, "Bearer"));
        } catch (org.springframework.security.core.AuthenticationException e) {
            log.warn("Login fallido para {}: {}", request.getEmail(), e.getMessage());
            return ResponseEntity.status(401).body("Credenciales incorrectas.");
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> me() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return usuarioRepository.findByEmail(email)
                .map(usuario -> {
                    Map<String, Object> info = new LinkedHashMap<>();
                    info.put("id", usuario.getId());
                    info.put("nombre", usuario.getNombre());
                    info.put("apellido", usuario.getApellido());
                    info.put("email", usuario.getEmail());
                    info.put("rol", usuario.getTipoUsuario() != null
                            ? usuario.getTipoUsuario().getDescripcion().toUpperCase() : "USER");
                    info.put("nivelAcceso", usuario.getTipoUsuario() != null
                            ? usuario.getTipoUsuario().getNivelAcceso() : 0);
                    return ResponseEntity.ok((Object) info);
                })
                .orElse(ResponseEntity.notFound().build());
    }
}

@Data
class LoginRequest {
    private String email;
    private String password;
}

@Data
class AuthResponse {
    private final String token;
    private final String type;
}
