package net.datatecsolution.sjaap.modelo;

public class EstadoConexion {

    private Integer id = 0;
    private String estado = "NA";
    public EstadoConexion() {
    }
    public void setId (Integer cod) {id=cod;}
    public Integer getId (){return id;}
    public void setEstado (String est){estado=est;}
    public String getEstado (){return estado;}

}
