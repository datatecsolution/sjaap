package net.datatecsolution.sjaap.modeloDao;

import java.sql.PreparedStatement;
import java.util.List;


public abstract class ModeloDaoBasic {
	
	protected static final String dbNameCaja="sjaap_caja_";
	protected static final String DbNameBase="sjaap";
	protected  String DbName="sjaap";
	protected PreparedStatement psConsultas = null;
	protected  String tableName="";
	protected  String idColumnName="";
	
	protected  String sqlQuerySelectJoin=null;
	//filtro para el esta de los registros 1=activo, 0=inactivos, 2=todos
	protected  int estado=2;
	
	public ModeloDaoBasic(String tablaName,String idColumnName){
		this.tableName=tablaName;
		this.idColumnName=idColumnName;
	}
	
	
	abstract public  boolean eliminar(Object c);
	abstract public boolean registrar(Object c);
	abstract public boolean actualizar(Object c);
	abstract public List todos(int limInf,int limSupe);
	abstract public Object buscarPorId(int id);
	
	protected String getQuerySelect(){
		return (sqlQuerySelectJoin== null) ? "SELECT * FROM "+DbName+ "."+tableName+"  " : this.sqlQuerySelectJoin;
	}
	protected String getQueryUpdate(){
		return "UPDATE "+DbName+ "."+tableName+" ";
	}
	
	protected String getQueryDelete(){
		return "DELETE FROM "+DbName+ "."+tableName+" ";
	}
	
	protected String getQueryInsert(){
		return "INSERT INTO "+DbName+ "."+tableName;
	}
	
	protected String getQuerySelectCaja(){
		return "SELECT * FROM "+DbName+ "."+tableName+" ";
	}
	protected String getQueryUpdateCaja(){
		return "UPDATE "+DbName+ "."+tableName+" ";
	}
	
	protected String getQueryDeleteCaja(){
		return "DELETE FROM "+DbName+ "."+tableName+" ";
	}
	
	protected String getQueryInsertCaja(){
		return "INSERT INTO "+DbName+ "."+tableName;
	}
	
	protected String getQuerySearch(String campo,String operador){
		return getQuerySelect()+" join (select "+this.idColumnName+ " from "+this.DbName+"."+this.tableName+" where "+campo+" "+operador+" ? "+((estado!=2) ? " and "+ this.tableName+".estado=?":" ") + " ORDER BY "+this.idColumnName+" desc limit ?,?) tabla2 on ( tabla2."+this.idColumnName+"="+this.tableName+"."+this.idColumnName+") ORDER BY "+this.tableName+"."+this.idColumnName+" DESC ";
	}
	/**
	 * @param campo de la busque
	 * @param operador operador para el campo de la busqueda
	 * @param tableJoin nombre de tabla con que desea unir 
	 * @param campoTableJoin nombre del campo con que desea unir, en la tabla Join
	 * @param campoJoin nombre del la tabla con que desea unir tabla original
	 * @return
	 */
	protected String getQuerySearchJoin(String campo,String operador,String tableJoin,String campoTableJoin,String campoJoin){
		return getQuerySelect()+" join (select "+tableName+"."+idColumnName+ " from "+this.DbName+"."+this.tableName+" join "+this.DbNameBase+"."+tableJoin+" on ("+tableName+"."+campoJoin+"="+tableJoin+"."+campoTableJoin + ") where "+campo+" "+operador+" ? "+((estado!=2) ? " and "+ this.tableName+".estado=?":" ") + " ORDER BY "+this.tableName+"."+idColumnName+" desc limit ?,?) tabla2 on ( tabla2."+this.idColumnName+"="+this.tableName+"."+this.idColumnName+") ORDER BY "+this.tableName+"."+this.idColumnName+" DESC ";
	}
	protected String getQueryRecord(){
		return getQuerySelect()+" join ( select "+this.idColumnName+ " from "+this.DbName +"."+this.tableName+" where  "+this.idColumnName+ "<=((SELECT max( "+this.idColumnName+ ") from "+ this.DbName+"."+this.tableName+")-?) "+((estado!=2) ? " and "+ this.tableName+".estado=?":" ") + " ORDER BY "+this.idColumnName+ " desc LIMIT ?) tabla2 on( tabla2."+this.idColumnName+ "= "+this.tableName+"."+this.idColumnName+ ") ORDER BY "+this.tableName+"."+this.idColumnName+ " DESC";
	}


	/**
	 * @return the sqlQuerySelectJoin
	 */
	public String getSqlQuerySelectJoin() {
		return sqlQuerySelectJoin;
	}


	/**
	 * @param sqlQuerySelectJoin the sqlQuerySelectJoin to set
	 */
	public void setSqlQuerySelectJoin(String sqlQuerySelectJoin) {
		this.sqlQuerySelectJoin = sqlQuerySelectJoin;
	}


	/**
	 * @return the idColumnName
	 */
	public String getIdColumnName() {
		return idColumnName;
	}


	/**
	 * @param idColumnName the idColumnName to set
	 */
	public void setIdColumnName(String idColumnName) {
		this.idColumnName = idColumnName;
	}


	/**
	 * @return the estado
	 */
	public int getEstado() {
		return estado;
	}


	/**
	 * @param estado the estado to set
	 */
	public void setEstado(int estado) {
		this.estado = estado;
	}
	
}
