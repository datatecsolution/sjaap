package net.datatecsolution.sjaap.modelo;

public class Servicio {

    private Integer id = 0;
    private String descripcion = "NA";
    private Integer tipoServicio = 0;
    public Servicio() {
    }
    public void setId (Integer cod){id=cod;}
    public Integer getId (){return id;}
    public void setDescripcion (String descrip){descripcion=descrip;}
    public String getDescripcion (){return descripcion;}
    public void setTipoServicio (Integer tipo){tipoServicio=tipo;}
    public Integer getTipoServicio (){return tipoServicio;}

}

