package net.datatecsolution.sjaap.modelo;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "tipo_conexion_agua")
@Data
public class TipoConexion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_tipo_conexion")
    private Integer id;

    @Column(nullable = false)
    private String descripcion;

    private String observaciones;
}