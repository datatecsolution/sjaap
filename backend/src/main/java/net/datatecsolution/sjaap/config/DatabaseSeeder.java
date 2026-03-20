package net.datatecsolution.sjaap.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DatabaseSeeder {

    @Value("${admin.seed.email}")
    private String adminEmail;

    @Value("${admin.seed.password}")
    private String adminPassword;

    @Value("${admin.seed.nombre}")
    private String adminNombre;

    @Value("${admin.seed.apellido}")
    private String adminApellido;

    @Bean
    public CommandLineRunner initDatabase(JdbcTemplate jdbcTemplate, PasswordEncoder passwordEncoder) {
        return args -> {
            try {
                jdbcTemplate.execute("ALTER TABLE usuarios MODIFY COLUMN password VARCHAR(255) NOT NULL");
            } catch (Exception e) {
                // Column already correct, ignore
            }

            // Asegurar que existe el rol ADMIN
            Integer idRole;
            try {
                idRole = jdbcTemplate.queryForObject(
                        "SELECT id_tipo_usuario FROM tipos_usuarios WHERE nivel_acceso = 1 LIMIT 1", Integer.class);
            } catch (Exception e) {
                jdbcTemplate.update(
                        "INSERT INTO tipos_usuarios (descripcion, nivel_acceso) VALUES ('ADMIN', 1)");
                idRole = jdbcTemplate.queryForObject(
                        "SELECT id_tipo_usuario FROM tipos_usuarios WHERE nivel_acceso = 1 LIMIT 1", Integer.class);
            }

            // Crear usuario admin solo si no existe
            Integer count = jdbcTemplate.queryForObject(
                    "SELECT COUNT(*) FROM usuarios WHERE email = ?", Integer.class, adminEmail);
            if (count == 0) {
                String hashedPassword = passwordEncoder.encode(adminPassword);
                jdbcTemplate.update(
                        "INSERT INTO usuarios (nombre, apellido, email, password, id_tipo_usuario, celular, telefono, direccion) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                        adminNombre, adminApellido, adminEmail,
                        hashedPassword, idRole, "00000000", "00000000", "Oficina Principal");
                System.out.println("========== ADMIN USER CREATED ==========");
            }
        };
    }
}
