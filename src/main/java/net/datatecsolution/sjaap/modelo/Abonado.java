package net.datatecsolution.sjaap.modelo;

import java.util.List;

public class Abonado {

    private Integer id = 0;
    private String nombre = "NA";
    private String apellido = "NA";
    private String direccion = "NA";
    private String telefono = "NA";
    private String email = "NA";
    private List<ConexionAgua> conexiones;
    public Abonado() {
    }
    public void setId (Integer cod){id=cod;}
    public Integer getId (){return id;}
    public void setNombre (String nom){nombre=nom;}
    public String getNombre (){return nombre;};
    public void setApellido (String apell){apellido=apell;}
    public String getApellido (){return apellido;}
    public void setDireccion (String direc){direccion=direc;}
    public String getDireccion (){return direccion;}
    public void setTelefono (String telef){telefono=telef;}
    public String getTelefono (){return telefono;}
    public void setEmail (String correo){email=correo;}
    public String getEmail (){return email;}
    public void setConexiones (List<ConexionAgua> conexs){conexiones=conexs;}
    public List<ConexionAgua> getConexiones (){return conexiones;}

}



