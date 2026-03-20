package net.datatecsolution.sjaap.modelo;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "barrios_colonias")
@Data
public class BarrioColonia {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_barrio_colonia")
    private Integer id;

    @Column(nullable = false)
    private String descripcion;

    private String sector;
}
