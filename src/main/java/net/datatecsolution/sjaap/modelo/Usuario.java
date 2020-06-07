package net.datatecsolution.sjaap.modelo;

public class Usuario {

    private Integer id = 0;
    private String nombre = "NA";
    private String apellido = "NA";
    private String telefono = "NA";
    private String celular = "NA";
    private Integer idTipoUsuario = 0;
    private String password = "NA";
    private String email = "NA";
    private String direccion = "NA";
    public TipoUsuario tipoUsuario = null;
    public Usuario() {
    }
    public void setId (Integer cod){id=cod;}
    public Integer getId (){return id;}
    public void setNombre (String nom){nombre=nom;}
    public String getNombre (){return nombre;}
    public void setApellido (String apelli){apellido=apelli;}
    public String getApellido (){return apellido;}
    public void setTelefono (String telef){telefono=telef;}
    public String getTelefono (){return telefono;}
    public void setCelular (String cel){celular=cel;}
    public String getCelular (){return celular;}
    public void setIdTipoUsuario (Integer idTipo){idTipoUsuario=idTipo;}
    public Integer getIdTipoUsuario (){return idTipoUsuario;}
    public void setPassword (String pass){password=pass;}
    public String getPassword (){return password;}
    public void setEmail (String e){email=e;}
    public String getEmail (){return email;}
    public void setDireccion (String dire){direccion=dire;}
    public String getDireccion (){return direccion;}
    public void setTipoUsuario (TipoUsuario tipo){tipoUsuario=tipo;}
    public TipoUsuario getTipoUsuario (){return tipoUsuario;}

}

