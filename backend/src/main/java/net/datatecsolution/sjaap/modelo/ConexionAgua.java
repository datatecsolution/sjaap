package net.datatecsolution.sjaap.modelo;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.NotFound;
import org.hibernate.annotations.NotFoundAction;

@Entity
@Table(name = "conexion_agua")
@Data
public class ConexionAgua {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_conexion")
    private Integer id;

    @ManyToOne
    @NotFound(action = NotFoundAction.IGNORE)
    @JoinColumn(name = "id_abonado", nullable = false)
    private Abonado abonado;

    @ManyToOne
    @NotFound(action = NotFoundAction.IGNORE)
    @JoinColumn(name = "id_barrio_colonia", nullable = false)
    private BarrioColonia barrioColonia;

    @ManyToOne
    @NotFound(action = NotFoundAction.IGNORE)
    @JoinColumn(name = "id_tipo_conexion", nullable = false)
    private TipoConexion tipoConexion;

    @Column(nullable = false, length = 300)
    private String direccion;

    @ManyToOne
    @JoinColumn(name = "id_estado_conexion", nullable = false)
    private EstadoConexion estadoConexion;

    @Column(name = "no_form", length = 200)
    private String noForm;
}
