package net.datatecsolution.sjaap.modelo;

import jakarta.persistence.*;
import lombok.Data;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "abonados")
@Data
public class Abonado {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_abonado")
    private Integer id;

    @Column(nullable = false)
    private String nombre;

    @Column(nullable = false)
    private String apellido;

    private String direccion;
    private String telefono;
    private String celular;
    private String email;

    @OneToMany(mappedBy = "abonado", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<ConexionAgua> conexiones;
}
