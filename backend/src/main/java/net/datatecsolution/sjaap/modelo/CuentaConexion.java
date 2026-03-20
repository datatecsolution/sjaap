package net.datatecsolution.sjaap.modelo;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.NotFound;
import org.hibernate.annotations.NotFoundAction;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "cuenta_conexiones")
@Data
public class CuentaConexion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "no_mov")
    private Integer noMov;

    @ManyToOne
    @NotFound(action = NotFoundAction.IGNORE)
    @JoinColumn(name = "id_conexion", nullable = false)
    private ConexionAgua conexion;

    @Column(nullable = false)
    private LocalDate fecha;

    @Column(length = 400)
    private String observacion;

    @Column(precision = 10, scale = 0)
    private BigDecimal debito;

    @Column(precision = 10, scale = 0)
    private BigDecimal credito;

    @Column(nullable = false, precision = 10, scale = 0)
    private BigDecimal saldo;

    @Column(name = "no_factura")
    private Integer noFactura;

    @Column(name = "creado_por", length = 100)
    private String creadoPor;
}
