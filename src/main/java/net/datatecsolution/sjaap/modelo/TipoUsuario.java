package net.datatecsolution.sjaap.modelo;

public class TipoUsuario {

    private Integer id = 0;
    private String descripcion = "NA";
    private Integer nivelAcceso = 1;
    public TipoUsuario() {
    }
    public void setId (Integer cod){id=cod;}
    public Integer getId (){return id;}
    public void setDescripcion (String descrip){descripcion=descrip;}
    public String getDescripcion (){return descripcion;}
    public void setNivelAcceso (Integer nivel){nivelAcceso=nivel;}
    public Integer getNivelAcceso (){return nivelAcceso;}

}

