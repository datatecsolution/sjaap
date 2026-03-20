package net.datatecsolution.sjaap.modelo;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "estados_conexion_agua")
@Data
public class EstadoConexion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_estado_conexion")
    private Integer id;

    @Column(name = "descripcion", nullable = false)
    private String estado;
}
