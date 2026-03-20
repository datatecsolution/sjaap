package net.datatecsolution.sjaap.modelo;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "tipos_usuarios")
@Data
public class TipoUsuario {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_tipo_usuario")
    private Integer id;

    @Column(nullable = false)
    private String descripcion;

    @Column(name = "nivel_acceso")
    private Integer nivelAcceso;
}
