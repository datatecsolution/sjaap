package net.datatecsolution.sjaap.modelo;

import java.util.List;

public class Abonado {

    private Integer id = 0;//inclir en la vista
    private String nombre = "NA";//incluir en la vista
    private String apellido = "NA";//incluir enla vista
    private String direccion = "NA";//incluir en la vista
    private String telefono = "NA";//incluir en la vista
    private String email = "NA";//incluir en la vista
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



