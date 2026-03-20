package net.datatecsolution.sjaap;

import net.datatecsolution.sjaap.modelo.EstadoConexion;
import net.datatecsolution.sjaap.repository.EstadoConexionRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import java.util.Arrays;

@SpringBootApplication
public class SjaapApplication {

    public static void main(String[] args) {
        SpringApplication.run(SjaapApplication.class, args);
    }

    @Bean
    public CommandLineRunner initData(EstadoConexionRepository estadoRepo) {
        return args -> {
            if (estadoRepo.count() == 0) {
                EstadoConexion activo = new EstadoConexion();
                activo.setEstado("Activo");
                
                EstadoConexion suspendido = new EstadoConexion();
                suspendido.setEstado("Suspendido");
                
                EstadoConexion cancelado = new EstadoConexion();
                cancelado.setEstado("Cancelado");
                
                estadoRepo.saveAll(Arrays.asList(activo, suspendido, cancelado));
                System.out.println("✅ Estados de conexión por defecto insertados.");
            }
        };
    }

}
