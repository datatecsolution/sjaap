package net.datatecsolution.sjaap.modelo;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.NotFound;
import org.hibernate.annotations.NotFoundAction;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "factura_total")
@Data
public class FacturaTotal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "no_factura")
    private Integer noFactura;

    @Column(nullable = false)
    private LocalDateTime fecha;

    @Column(name = "total_pagar", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalPagar;

    @ManyToOne
    @NotFound(action = NotFoundAction.IGNORE)
    @JoinColumn(name = "id_conexion", nullable = false)
    private ConexionAgua conexion;

    @Column(precision = 10, scale = 2)
    private BigDecimal efectivo;

    @Column(precision = 10, scale = 2)
    private BigDecimal cambio;

    // 0 = pendiente, 1 = pagado, 2 = anulado
    @Column(nullable = false)
    private Integer estado = 0;

    @Column(name = "creado_por", length = 100)
    private String creadoPor;

    @Column(name = "pagado_por", length = 100)
    private String pagadoPor;

    @Column(name = "fecha_pago")
    private LocalDateTime fechaPago;

    @Column(name = "anulado_por", length = 100)
    private String anuladoPor;

    @Column(name = "fecha_anulacion")
    private LocalDateTime fechaAnulacion;

    @Column(name = "motivo_anulacion", length = 500)
    private String motivoAnulacion;

    @OneToMany(mappedBy = "factura", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    private List<FacturaDetalle> detalles;
}
