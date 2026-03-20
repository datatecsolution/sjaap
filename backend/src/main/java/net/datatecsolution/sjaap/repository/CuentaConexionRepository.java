package net.datatecsolution.sjaap.repository;

import net.datatecsolution.sjaap.modelo.CuentaConexion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface CuentaConexionRepository extends JpaRepository<CuentaConexion, Integer> {
    List<CuentaConexion> findByConexionIdOrderByNoMovAsc(Integer idConexion);

    @Query("SELECT c FROM CuentaConexion c WHERE c.conexion.id = :idConexion ORDER BY c.noMov DESC LIMIT 1")
    Optional<CuentaConexion> findUltimoMovimiento(Integer idConexion);

    @Query(value = "SELECT cc.* FROM cuenta_conexiones cc " +
                   "INNER JOIN (SELECT id_conexion, MAX(no_mov) AS max_mov " +
                   "            FROM cuenta_conexiones GROUP BY id_conexion) t " +
                   "ON cc.id_conexion = t.id_conexion AND cc.no_mov = t.max_mov",
           nativeQuery = true)
    List<CuentaConexion> findUltimoMovimientoPorConexion();

    @Query(value = "SELECT COUNT(*), COALESCE(SUM(cc.saldo), 0) " +
                   "FROM cuenta_conexiones cc " +
                   "INNER JOIN (SELECT id_conexion, MAX(no_mov) AS max_mov " +
                   "            FROM cuenta_conexiones GROUP BY id_conexion) t " +
                   "ON cc.id_conexion = t.id_conexion AND cc.no_mov = t.max_mov " +
                   "WHERE cc.saldo > 0",
           nativeQuery = true)
    List<Object[]> getResumenSaldos();

    boolean existsByConexionIdAndObservacion(Integer idConexion, String observacion);

    // Top deudores optimizado: todo en SQL sin cargar entidades
    @Query(value =
        "SELECT cc.id_conexion, " +
        "       CONCAT(COALESCE(a.nombre,''), ' ', COALESCE(a.apellido,'')) AS abonado, " +
        "       ca.direccion, " +
        "       COALESCE(tc.descripcion, '—') AS tipo, " +
        "       cc.saldo, cc.fecha, cc.observacion " +
        "FROM cuenta_conexiones cc " +
        "INNER JOIN (SELECT id_conexion, MAX(no_mov) AS max_mov " +
        "            FROM cuenta_conexiones GROUP BY id_conexion) t " +
        "   ON cc.id_conexion = t.id_conexion AND cc.no_mov = t.max_mov " +
        "INNER JOIN conexion_agua ca ON ca.id_conexion = cc.id_conexion " +
        "LEFT JOIN abonados a ON a.id_abonado = ca.id_abonado " +
        "LEFT JOIN tipo_conexiones tc ON tc.id_tipo_conexion = ca.id_tipo_conexion " +
        "WHERE cc.saldo > 0 " +
        "ORDER BY cc.saldo DESC " +
        "LIMIT :limite",
        nativeQuery = true)
    List<Object[]> findTopDeudoresNativo(@Param("limite") int limite);

    // Antigüedad de deuda optimizado: agrupación en SQL
    @Query(value =
        "SELECT " +
        "  SUM(CASE WHEN DATEDIFF(CURDATE(), cc.fecha) <= 30 THEN 1 ELSE 0 END) AS d030, " +
        "  SUM(CASE WHEN DATEDIFF(CURDATE(), cc.fecha) <= 30 THEN cc.saldo ELSE 0 END) AS m030, " +
        "  SUM(CASE WHEN DATEDIFF(CURDATE(), cc.fecha) BETWEEN 31 AND 60 THEN 1 ELSE 0 END) AS d3060, " +
        "  SUM(CASE WHEN DATEDIFF(CURDATE(), cc.fecha) BETWEEN 31 AND 60 THEN cc.saldo ELSE 0 END) AS m3060, " +
        "  SUM(CASE WHEN DATEDIFF(CURDATE(), cc.fecha) BETWEEN 61 AND 90 THEN 1 ELSE 0 END) AS d6090, " +
        "  SUM(CASE WHEN DATEDIFF(CURDATE(), cc.fecha) BETWEEN 61 AND 90 THEN cc.saldo ELSE 0 END) AS m6090, " +
        "  SUM(CASE WHEN DATEDIFF(CURDATE(), cc.fecha) > 90 THEN 1 ELSE 0 END) AS d90mas, " +
        "  SUM(CASE WHEN DATEDIFF(CURDATE(), cc.fecha) > 90 THEN cc.saldo ELSE 0 END) AS m90mas " +
        "FROM cuenta_conexiones cc " +
        "INNER JOIN (SELECT id_conexion, MAX(no_mov) AS max_mov " +
        "            FROM cuenta_conexiones GROUP BY id_conexion) t " +
        "   ON cc.id_conexion = t.id_conexion AND cc.no_mov = t.max_mov " +
        "WHERE cc.saldo > 0",
        nativeQuery = true)
    List<Object[]> getAntiguedadDeudaNativo();

    // Conteo de conexiones que ya tienen ese cobro registrado
    @Query(value = "SELECT COUNT(DISTINCT ca.id_conexion) " +
                   "FROM conexion_agua ca " +
                   "INNER JOIN cuenta_conexiones cc ON cc.id_conexion = ca.id_conexion " +
                   "WHERE ca.id_estado_conexion = :idEstado " +
                   "AND cc.observacion = :observacion",
           nativeQuery = true)
    long countYaCobradas(@Param("idEstado") Integer idEstado,
                         @Param("observacion") String observacion);

    // Conteo de conexiones sin precio para ese servicio
    @Query(value = "SELECT COUNT(*) FROM conexion_agua ca " +
                   "LEFT JOIN precio_servicios ps " +
                   "   ON ps.id_tipo_conexion = ca.id_tipo_conexion AND ps.id_servicio = :idServicio " +
                   "WHERE ca.id_estado_conexion = :idEstado " +
                   "AND ca.id_tipo_conexion IS NOT NULL " +
                   "AND ps.id_precio IS NULL",
           nativeQuery = true)
    long countSinPrecio(@Param("idEstado") Integer idEstado,
                        @Param("idServicio") Integer idServicio);

    // INSERT masivo: una sola query inserta todos los movimientos pendientes
    @Modifying
    @Query(value =
        "INSERT INTO cuenta_conexiones (id_conexion, fecha, observacion, debito, saldo, creado_por) " +
        "SELECT ca.id_conexion, CURDATE(), :observacion, ps.precio, " +
        "       COALESCE(ult.saldo, 0) + ps.precio, :creadoPor " +
        "FROM conexion_agua ca " +
        "INNER JOIN precio_servicios ps " +
        "   ON ps.id_tipo_conexion = ca.id_tipo_conexion AND ps.id_servicio = :idServicio " +
        "LEFT JOIN ( " +
        "   SELECT cc2.id_conexion, cc2.saldo " +
        "   FROM cuenta_conexiones cc2 " +
        "   INNER JOIN (SELECT id_conexion, MAX(no_mov) AS max_mov " +
        "               FROM cuenta_conexiones GROUP BY id_conexion) t " +
        "   ON cc2.id_conexion = t.id_conexion AND cc2.no_mov = t.max_mov " +
        ") ult ON ult.id_conexion = ca.id_conexion " +
        "WHERE ca.id_estado_conexion = :idEstado " +
        "AND NOT EXISTS ( " +
        "   SELECT 1 FROM cuenta_conexiones cc3 " +
        "   WHERE cc3.id_conexion = ca.id_conexion AND cc3.observacion = :observacion " +
        ")",
           nativeQuery = true)
    int insertDebitoMasivo(@Param("idServicio") Integer idServicio,
                           @Param("idEstado") Integer idEstado,
                           @Param("observacion") String observacion,
                           @Param("creadoPor") String creadoPor);
}
