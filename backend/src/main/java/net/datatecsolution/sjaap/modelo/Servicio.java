package net.datatecsolution.sjaap.modelo;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "servicios")
@Data
public class Servicio {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_servicio")
    private Integer id;

    @Column(nullable = false)
    private String descripcion;

    @Column(name = "tipo_servicio")
    private Integer tipoServicio;
}
