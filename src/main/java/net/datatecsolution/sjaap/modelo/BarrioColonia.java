package net.datatecsolution.sjaap.modelo;

public class BarrioColonia {

    private Integer id = 0;
    private String descripcion = "NA";
    private String sector = "NA";
    public BarrioColonia() {
    }
    public void setId (Integer cod){id=cod;}
    public Integer getId (){return id;}
    public void setDescripcion (String descrip){descripcion=descrip;}
    public String getDescripcion (){return descripcion;}
    public void setSector (String sect){sector=sect;}
    public String getSector (){return sector;}

}
