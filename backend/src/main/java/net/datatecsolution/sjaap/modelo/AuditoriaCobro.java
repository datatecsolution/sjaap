package net.datatecsolution.sjaap.modelo;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "auditoria_cobros")
@Data
public class AuditoriaCobro {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false)
    private LocalDateTime fecha;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_servicio")
    private Servicio servicio;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_estado_conexion")
    private EstadoConexion estadoConexion;

    private String observacion;

    private Integer totalConexiones;
    private Integer procesadas;
    private Integer yaCobradas;
    private Integer sinPrecio;

    private String usuario;
}
