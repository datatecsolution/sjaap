package net.datatecsolution.sjaap.modelo;

public class TipoConexion {

    private Integer id = 0;
    private String descripcion = "NA";
    private String observaciones = "NA";
    public TipoConexion() {
    }
    public void setId (Integer cod){id=cod;}
    public Integer getId (){return id;}
    public void setDescripcion (String descrip){descripcion=descrip;}
    public String getDescripcion (){return descripcion;}
    public void setObservaciones (String obs){observaciones=obs;}
    public String getObservaciones (){return observaciones;}

}