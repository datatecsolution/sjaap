package net.datatecsolution.sjaap.modelo;

public class ConexionAgua {
    private Integer id = 0;
    private Integer idAbonado = 0;
    private Integer idBarrioColonia = 0;
    private Integer idTipoConexion = 0;
    private Integer idEstadoConexion = 0;
    private String direccion = "NA";
    private String coordenadas = "NA";
    private String noFormFisico = "NA";
    private Abonado abonado = null;
    private BarrioColonia barrio = null;
    private EstadoConexion estado = null;
    private TipoConexion tipoConexion = null;
    public ConexionAgua() {
    }
    public void setId (Integer cod){id=cod;}
    public Integer getId (){return id;}
    public void setIdAbonado (Integer codAbonado){idAbonado=codAbonado;}
    public Integer getIdAbonado (){return idAbonado;}
    public void setIdBarrioColonia (Integer idBarrio){idBarrioColonia=idBarrio;}
    public Integer getIdBarrioColonia (){return idBarrioColonia;}
    public void getIdTipoConexion (Integer idTipo){idTipoConexion=idTipo;}
    public Integer getIdTipoConexion (){return idTipoConexion;}
    public void setIdEstadoConexion (Integer idEstado){idEstadoConexion=idEstado;}
    public Integer getIdEstadoConexion (){return idEstadoConexion;}
    public void setDireccion (String direc){direccion=direc;}
    public String getDireccion (){return direccion;}
    public void setCoordenadas (Double lat,Double longs){coordenadas=lat+","+longs;}
    public String getCoordenadas (){return coordenadas;}
    public void setNoFormFisico (String noForm){noFormFisico=noForm;}
    public String getNoFormFisico (){return noFormFisico;}
    public void setAbonado (Abonado abon){abonado=abon;}
    public Abonado getAbonado (){return abonado;}
    public void setBarrio (BarrioColonia bar){barrio=bar;}
    public BarrioColonia getBarrio (){return barrio;}
    public void setEstado (EstadoConexion estad){estado=estad;}
    public EstadoConexion getEstado (){return estado;}
    public void setTipoConexion (TipoConexion tipoConex){tipoConexion=tipoConex;}
    public TipoConexion getTipoConexion (){return tipoConexion;}
}
