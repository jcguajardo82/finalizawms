using Soriana.FWK.Datos.SQL;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Web;

namespace ServicesManagement.Web
{
    public class DALServicesM
    {

        public static DataSet GetUN()
        {

            DataSet ds = new DataSet();

            //string conection = ConfigurationManager.AppSettings[ConfigurationManager.AppSettings["AmbienteSC"]];
            //if (System.Configuration.ConfigurationManager.AppSettings["flagConectionDBEcriptado"].ToString().Trim().Equals("1"))
            //{
            //    conection = Soriana.FWK.FmkTools.Seguridad.Desencriptar(ConfigurationManager.AppSettings[ConfigurationManager.AppSettings["AmbienteSC"]]);
            //}


            try
            {
                //System.Collections.Hashtable parametros = new System.Collections.Hashtable();
                //Soriana.FWK.FmkTools.SqlHelper.connection_Name(ConfigurationManager.ConnectionStrings["Connection_DEV"].ConnectionString);
                //ds = Soriana.FWK.FmkTools.SqlHelper.ExecuteDataSet(CommandType.StoredProcedure, "upCorpOms_Cns_UN", false);
                using (SqlConnection cnn = new SqlConnection(ConfigurationManager.ConnectionStrings["Connection_DEV"].ConnectionString))
                {
                    using (SqlCommand cmd = new SqlCommand("dbo.upCorpOms_Cns_UN", cnn))
                    {
                        cmd.CommandType = CommandType.StoredProcedure;
                        using (SqlDataAdapter dataAdapter = new SqlDataAdapter(cmd))
                            dataAdapter.Fill(ds);
                    }
                }
                return ds;
            }
            catch (SqlException ex)
            {

                throw ex;
            }
            catch (System.Exception ex)
            {

                throw ex;
            }
        }


        public static DataSet GetOrdersByUn(string Id_Num_UN)
        {


            DataSet ds = new DataSet();

            string conection = ConfigurationManager.AppSettings[ConfigurationManager.AppSettings["AmbienteSC"]];
            if (System.Configuration.ConfigurationManager.AppSettings["flagConectionDBEcriptado"].ToString().Trim().Equals("1"))
            {
                conection = Soriana.FWK.FmkTools.Seguridad.Desencriptar(ConfigurationManager.AppSettings[ConfigurationManager.AppSettings["AmbienteSC"]]);
            }


            try
            {
                Soriana.FWK.FmkTools.SqlHelper.connection_Name(ConfigurationManager.ConnectionStrings["Connection_DEV"].ConnectionString);


                System.Collections.Hashtable parametros = new System.Collections.Hashtable();
                parametros.Add("@Id_Num_UN", Id_Num_UN);



                ds = Soriana.FWK.FmkTools.SqlHelper.ExecuteDataSet(CommandType.StoredProcedure, "upCorpOms_Cns_OrdersByUN", false, parametros);

                return ds;
            }
            catch (SqlException ex)
            {

                throw ex;
            }
            catch (System.Exception ex)
            {

                throw ex;
            }

        }

        public static DataSet GetSurtidores(string Id_Num_UN)
        {


            DataSet ds = new DataSet();

            string conection = ConfigurationManager.AppSettings[ConfigurationManager.AppSettings["AmbienteSC"]];
            if (System.Configuration.ConfigurationManager.AppSettings["flagConectionDBEcriptado"].ToString().Trim().Equals("1"))
            {
                conection = Soriana.FWK.FmkTools.Seguridad.Desencriptar(ConfigurationManager.AppSettings[ConfigurationManager.AppSettings["AmbienteSC"]]);
            }


            try
            {
                Soriana.FWK.FmkTools.SqlHelper.connection_Name(ConfigurationManager.ConnectionStrings["Connection_DEV"].ConnectionString);


                System.Collections.Hashtable parametros = new System.Collections.Hashtable();
                parametros.Add("@Id_Num_UN", Id_Num_UN);



                ds = Soriana.FWK.FmkTools.SqlHelper.ExecuteDataSet(CommandType.StoredProcedure, "[upCorpOms_Cns_SupplierByUn]", false, parametros);

                return ds;
            }
            catch (SqlException ex)
            {

                throw ex;
            }
            catch (System.Exception ex)
            {

                throw ex;
            }

        }
        public static DataSet GetOrdersByOrderNo(string UeNo)
        {


            DataSet ds = new DataSet();

            string conection = ConfigurationManager.AppSettings[ConfigurationManager.AppSettings["AmbienteSC"]];
            if (System.Configuration.ConfigurationManager.AppSettings["flagConectionDBEcriptado"].ToString().Trim().Equals("1"))
            {
                conection = Soriana.FWK.FmkTools.Seguridad.Desencriptar(ConfigurationManager.AppSettings[ConfigurationManager.AppSettings["AmbienteSC"]]);
            }


            try
            {
                Soriana.FWK.FmkTools.SqlHelper.connection_Name(ConfigurationManager.ConnectionStrings["Connection_DEV"].ConnectionString);


                System.Collections.Hashtable parametros = new System.Collections.Hashtable();
                parametros.Add("@UeNo", UeNo);



                ds = Soriana.FWK.FmkTools.SqlHelper.ExecuteDataSet(CommandType.StoredProcedure, "dbo.upCorpOms_Cns_OrdersByOrderNo_V2", false, parametros);

                return ds;
            }
            catch (SqlException ex)
            {

                throw ex;
            }
            catch (System.Exception ex)
            {

                throw ex;
            }

        }

        public static DataSet upCorpOms_Cns_OrdersByOrderNoInit(string OrderNo)
        {


            DataSet ds = new DataSet();

            string conection = ConfigurationManager.AppSettings[ConfigurationManager.AppSettings["AmbienteSC"]];
            if (System.Configuration.ConfigurationManager.AppSettings["flagConectionDBEcriptado"].ToString().Trim().Equals("1"))
            {
                conection = Soriana.FWK.FmkTools.Seguridad.Desencriptar(ConfigurationManager.AppSettings[ConfigurationManager.AppSettings["AmbienteSC"]]);
            }


            try
            {
                Soriana.FWK.FmkTools.SqlHelper.connection_Name(ConfigurationManager.ConnectionStrings["Connection_DEV"].ConnectionString);


                System.Collections.Hashtable parametros = new System.Collections.Hashtable();
                parametros.Add("@OrderNo", OrderNo);



                ds = Soriana.FWK.FmkTools.SqlHelper.ExecuteDataSet(CommandType.StoredProcedure, "upCorpOms_Cns_OrdersByOrderNoInit", false, parametros);

                return ds;
            }
            catch (SqlException ex)
            {

                throw ex;
            }
            catch (System.Exception ex)
            {

                throw ex;
            }

        }


        #region Carriers

        public static DataSet GetCarriers()
        {

            DataSet ds = new DataSet();

            string conection = ConfigurationManager.AppSettings[ConfigurationManager.AppSettings["AmbienteSC"]];
            if (System.Configuration.ConfigurationManager.AppSettings["flagConectionDBEcriptado"].ToString().Trim().Equals("1"))
            {
                conection = Soriana.FWK.FmkTools.Seguridad.Desencriptar(ConfigurationManager.AppSettings[ConfigurationManager.AppSettings["AmbienteSC"]]);
            }


            try
            {
                System.Collections.Hashtable parametros = new System.Collections.Hashtable();

                Soriana.FWK.FmkTools.SqlHelper.connection_Name(ConfigurationManager.ConnectionStrings["Connection_DEV"].ConnectionString);

                ds = Soriana.FWK.FmkTools.SqlHelper.ExecuteDataSet(CommandType.StoredProcedure, "[upCorpOms_Cns_Carrier]", false);

                return ds;
            }
            catch (SqlException ex)
            {

                throw ex;
            }
            catch (System.Exception ex)
            {

                throw ex;
            }


        }


        public static DataSet GetCarriersUN(int Id_Num_UN)
        {

            DataSet ds = new DataSet();

            string conection = ConfigurationManager.AppSettings[ConfigurationManager.AppSettings["AmbienteSC"]];
            if (System.Configuration.ConfigurationManager.AppSettings["flagConectionDBEcriptado"].ToString().Trim().Equals("1"))
            {
                conection = Soriana.FWK.FmkTools.Seguridad.Desencriptar(ConfigurationManager.AppSettings[ConfigurationManager.AppSettings["AmbienteSC"]]);
            }


            try
            {
                System.Collections.Hashtable parametros = new System.Collections.Hashtable();

                Soriana.FWK.FmkTools.SqlHelper.connection_Name(ConfigurationManager.ConnectionStrings["Connection_DEV"].ConnectionString);

                parametros.Add("@Id_Num_UN", Id_Num_UN);

                ds = Soriana.FWK.FmkTools.SqlHelper.ExecuteDataSet(CommandType.StoredProcedure, "[upCorpOms_Cns_CarrierByUn]", false, parametros);

                return ds;
            }
            catch (SqlException ex)
            {

                throw ex;
            }
            catch (System.Exception ex)
            {

                throw ex;
            }


        }

        public static DataSet AddCarriers(string num, string name, string un)
        {

            DataSet ds = new DataSet();

            string conection = ConfigurationManager.AppSettings[ConfigurationManager.AppSettings["AmbienteSC"]];
            if (System.Configuration.ConfigurationManager.AppSettings["flagConectionDBEcriptado"].ToString().Trim().Equals("1"))
            {
                conection = Soriana.FWK.FmkTools.Seguridad.Desencriptar(ConfigurationManager.AppSettings[ConfigurationManager.AppSettings["AmbienteSC"]]);
            }


            try
            {
                System.Collections.Hashtable parametros = new System.Collections.Hashtable();

                Soriana.FWK.FmkTools.SqlHelper.connection_Name(ConfigurationManager.ConnectionStrings["Connection_DEV"].ConnectionString);



                parametros.Add("@Name", name);
                parametros.Add("@Id_Num_UN", un);
                parametros.Add("@Id_Num_Empleado", num);



                Soriana.FWK.FmkTools.SqlHelper.ExecuteNonQuery(CommandType.StoredProcedure, "[upCorpOms_Ins_Carrier]", false, parametros);

                return ds;
            }
            catch (SqlException ex)
            {

                throw ex;
            }
            catch (System.Exception ex)
            {

                throw ex;
            }


        }

        public static DataSet EditCarriers(string num, string name, string un, string status)
        {

            DataSet ds = new DataSet();

            string conection = ConfigurationManager.AppSettings[ConfigurationManager.AppSettings["AmbienteSC"]];
            if (System.Configuration.ConfigurationManager.AppSettings["flagConectionDBEcriptado"].ToString().Trim().Equals("1"))
            {
                conection = Soriana.FWK.FmkTools.Seguridad.Desencriptar(ConfigurationManager.AppSettings[ConfigurationManager.AppSettings["AmbienteSC"]]);
            }


            try
            {
                System.Collections.Hashtable parametros = new System.Collections.Hashtable();

                Soriana.FWK.FmkTools.SqlHelper.connection_Name(ConfigurationManager.ConnectionStrings["Connection_DEV"].ConnectionString);



                parametros.Add("@Id_Carrier", num);
                parametros.Add("@Name", name);
                parametros.Add("@Id_Num_UN", un);
                //parametros.Add("@Id_Num_Empleado", num);
                parametros.Add("@Activo", status);



                Soriana.FWK.FmkTools.SqlHelper.ExecuteNonQuery(CommandType.StoredProcedure, "[upCorpOms_Upd_Carrier]", false, parametros);

                return ds;
            }
            catch (SqlException ex)
            {

                throw ex;
            }
            catch (System.Exception ex)
            {

                throw ex;
            }


        }

        public static DataSet DeleteCarriers(string num)
        {

            DataSet ds = new DataSet();

            string conection = ConfigurationManager.AppSettings[ConfigurationManager.AppSettings["AmbienteSC"]];
            if (System.Configuration.ConfigurationManager.AppSettings["flagConectionDBEcriptado"].ToString().Trim().Equals("1"))
            {
                conection = Soriana.FWK.FmkTools.Seguridad.Desencriptar(ConfigurationManager.AppSettings[ConfigurationManager.AppSettings["AmbienteSC"]]);
            }


            try
            {
                System.Collections.Hashtable parametros = new System.Collections.Hashtable();

                Soriana.FWK.FmkTools.SqlHelper.connection_Name(ConfigurationManager.ConnectionStrings["Connection_DEV"].ConnectionString);

                parametros.Add("@Id_Carrier", num);

                Soriana.FWK.FmkTools.SqlHelper.ExecuteNonQuery(CommandType.StoredProcedure, "[upCorpOms_Del_Carrier]", false, parametros);

                return ds;
            }
            catch (SqlException ex)
            {

                throw ex;
            }
            catch (System.Exception ex)
            {

                throw ex;
            }


        }

        public static DataSet GetCarrier(string num)
        {

            DataSet ds = new DataSet();

            string conection = ConfigurationManager.AppSettings[ConfigurationManager.AppSettings["AmbienteSC"]];
            if (System.Configuration.ConfigurationManager.AppSettings["flagConectionDBEcriptado"].ToString().Trim().Equals("1"))
            {
                conection = Soriana.FWK.FmkTools.Seguridad.Desencriptar(ConfigurationManager.AppSettings[ConfigurationManager.AppSettings["AmbienteSC"]]);
            }


            try
            {
                System.Collections.Hashtable parametros = new System.Collections.Hashtable();

                Soriana.FWK.FmkTools.SqlHelper.connection_Name(ConfigurationManager.ConnectionStrings["Connection_DEV"].ConnectionString);



                parametros.Add("@Id_Carrier", num);



                ds = Soriana.FWK.FmkTools.SqlHelper.ExecuteDataSet(CommandType.StoredProcedure, "[upCorpOms_Cns_CarrierById]", false, parametros);

                return ds;
            }
            catch (SqlException ex)
            {

                throw ex;
            }
            catch (System.Exception ex)
            {

                throw ex;
            }


        }
        #endregion

        #region SURTIDORES
        public static DataSet GetSuppliers()
        {

            DataSet ds = new DataSet();

            string conection = ConfigurationManager.AppSettings[ConfigurationManager.AppSettings["AmbienteSC"]];
            if (System.Configuration.ConfigurationManager.AppSettings["flagConectionDBEcriptado"].ToString().Trim().Equals("1"))
            {
                conection = Soriana.FWK.FmkTools.Seguridad.Desencriptar(ConfigurationManager.AppSettings[ConfigurationManager.AppSettings["AmbienteSC"]]);
            }


            try
            {
                System.Collections.Hashtable parametros = new System.Collections.Hashtable();

                Soriana.FWK.FmkTools.SqlHelper.connection_Name(ConfigurationManager.ConnectionStrings["Connection_DEV"].ConnectionString);

                ds = Soriana.FWK.FmkTools.SqlHelper.ExecuteDataSet(CommandType.StoredProcedure, "[upCorpOms_Sel_Supplier]", false);

                return ds;
            }
            catch (SqlException ex)
            {

                throw ex;
            }
            catch (System.Exception ex)
            {

                throw ex;
            }


        }

        public static DataSet GetSuppliersUN(int Id_Num_UN)
        {

            DataSet ds = new DataSet();

            string conection = ConfigurationManager.AppSettings[ConfigurationManager.AppSettings["AmbienteSC"]];
            if (System.Configuration.ConfigurationManager.AppSettings["flagConectionDBEcriptado"].ToString().Trim().Equals("1"))
            {
                conection = Soriana.FWK.FmkTools.Seguridad.Desencriptar(ConfigurationManager.AppSettings[ConfigurationManager.AppSettings["AmbienteSC"]]);
            }


            try
            {
                System.Collections.Hashtable parametros = new System.Collections.Hashtable();
                Soriana.FWK.FmkTools.SqlHelper.connection_Name(ConfigurationManager.ConnectionStrings["Connection_DEV"].ConnectionString);


                parametros.Add("@Id_Num_UN", Id_Num_UN);

                ds = Soriana.FWK.FmkTools.SqlHelper.ExecuteDataSet(CommandType.StoredProcedure, "[upCorpOms_Sel_SupplierByUn]", false, parametros);

                return ds;
            }
            catch (SqlException ex)
            {

                throw ex;
            }
            catch (System.Exception ex)
            {

                throw ex;
            }


        }


        public static DataSet AddSupplier(string num, string name, string un)
        {

            DataSet ds = new DataSet();

            string conection = ConfigurationManager.AppSettings[ConfigurationManager.AppSettings["AmbienteSC"]];
            if (System.Configuration.ConfigurationManager.AppSettings["flagConectionDBEcriptado"].ToString().Trim().Equals("1"))
            {
                conection = Soriana.FWK.FmkTools.Seguridad.Desencriptar(ConfigurationManager.AppSettings[ConfigurationManager.AppSettings["AmbienteSC"]]);
            }


            try
            {
                System.Collections.Hashtable parametros = new System.Collections.Hashtable();

                Soriana.FWK.FmkTools.SqlHelper.connection_Name(ConfigurationManager.ConnectionStrings["Connection_DEV"].ConnectionString);



                parametros.Add("@Name", name);
                parametros.Add("@Id_Num_UN", un);
                parametros.Add("@Id_Num_Empleado", num);



                Soriana.FWK.FmkTools.SqlHelper.ExecuteNonQuery(CommandType.StoredProcedure, "[upCorpOms_Ins_Supplier]", false, parametros);

                return ds;
            }
            catch (SqlException ex)
            {

                throw ex;
            }
            catch (System.Exception ex)
            {

                throw ex;
            }


        }

        public static DataSet EditSupplier(string num, string name, string un, string status, string Id_Num_Empleado)
        {

            DataSet ds = new DataSet();

            string conection = ConfigurationManager.AppSettings[ConfigurationManager.AppSettings["AmbienteSC"]];
            if (System.Configuration.ConfigurationManager.AppSettings["flagConectionDBEcriptado"].ToString().Trim().Equals("1"))
            {
                conection = Soriana.FWK.FmkTools.Seguridad.Desencriptar(ConfigurationManager.AppSettings[ConfigurationManager.AppSettings["AmbienteSC"]]);
            }


            try
            {
                System.Collections.Hashtable parametros = new System.Collections.Hashtable();

                Soriana.FWK.FmkTools.SqlHelper.connection_Name(ConfigurationManager.ConnectionStrings["Connection_DEV"].ConnectionString);



                parametros.Add("@Id_Supplier", num);
                parametros.Add("@Name", name);
                parametros.Add("@Id_Num_UN", un);
                parametros.Add("@Id_Num_Empleado", Id_Num_Empleado);
                parametros.Add("@Activo", status);



                Soriana.FWK.FmkTools.SqlHelper.ExecuteNonQuery(CommandType.StoredProcedure, "[upCorpOms_Upd_Supplier]", false, parametros);

                return ds;
            }
            catch (SqlException ex)
            {

                throw ex;
            }
            catch (System.Exception ex)
            {

                throw ex;
            }


        }

        public static DataSet DeleteSupplier(string num)
        {

            DataSet ds = new DataSet();

            string conection = ConfigurationManager.AppSettings[ConfigurationManager.AppSettings["AmbienteSC"]];
            if (System.Configuration.ConfigurationManager.AppSettings["flagConectionDBEcriptado"].ToString().Trim().Equals("1"))
            {
                conection = Soriana.FWK.FmkTools.Seguridad.Desencriptar(ConfigurationManager.AppSettings[ConfigurationManager.AppSettings["AmbienteSC"]]);
            }


            try
            {
                System.Collections.Hashtable parametros = new System.Collections.Hashtable();

                Soriana.FWK.FmkTools.SqlHelper.connection_Name(ConfigurationManager.ConnectionStrings["Connection_DEV"].ConnectionString);

                parametros.Add("@Id_Supplier", num);

                Soriana.FWK.FmkTools.SqlHelper.ExecuteNonQuery(CommandType.StoredProcedure, "[upCorpOms_Del_Supplier]", false, parametros);

                return ds;
            }
            catch (SqlException ex)
            {

                throw ex;
            }
            catch (System.Exception ex)
            {

                throw ex;
            }


        }

        public static DataSet GetSupplier(string num)
        {

            DataSet ds = new DataSet();

            string conection = ConfigurationManager.AppSettings[ConfigurationManager.AppSettings["AmbienteSC"]];
            if (System.Configuration.ConfigurationManager.AppSettings["flagConectionDBEcriptado"].ToString().Trim().Equals("1"))
            {
                conection = Soriana.FWK.FmkTools.Seguridad.Desencriptar(ConfigurationManager.AppSettings[ConfigurationManager.AppSettings["AmbienteSC"]]);
            }


            try
            {
                System.Collections.Hashtable parametros = new System.Collections.Hashtable();

                Soriana.FWK.FmkTools.SqlHelper.connection_Name(ConfigurationManager.ConnectionStrings["Connection_DEV"].ConnectionString);



                parametros.Add("@Id_Supplier", num);



                ds = Soriana.FWK.FmkTools.SqlHelper.ExecuteDataSet(CommandType.StoredProcedure, "[upCorpOms_Cns_SupplierById]", false, parametros);

                return ds;
            }
            catch (SqlException ex)
            {

                throw ex;
            }
            catch (System.Exception ex)
            {

                throw ex;
            }


        }
        #endregion

        public static DataSet GetListaEmbarcar(string Id_Num_UN, string Id_Num_Apl = "2")
        {
            DataSet ds = new DataSet();

            string conection = ConfigurationManager.AppSettings[ConfigurationManager.AppSettings["AmbienteSC"]];
            if (System.Configuration.ConfigurationManager.AppSettings["flagConectionDBEcriptado"].ToString().Trim().Equals("1"))
            {
                conection = Soriana.FWK.FmkTools.Seguridad.Desencriptar(ConfigurationManager.AppSettings[ConfigurationManager.AppSettings["AmbienteSC"]]);
            }


            try
            {
                Soriana.FWK.FmkTools.SqlHelper.connection_Name(ConfigurationManager.ConnectionStrings["Connection_DEV"].ConnectionString);


                System.Collections.Hashtable parametros = new System.Collections.Hashtable();
                parametros.Add("@Id_Num_UN", Id_Num_UN);
                parametros.Add("@Id_Num_Apl", Id_Num_Apl);



                ds = Soriana.FWK.FmkTools.SqlHelper.ExecuteDataSet(CommandType.StoredProcedure, "spSurtido_ListaPorEmbarcarNvo_sup", false, parametros);

                return ds;
            }
            catch (SqlException ex)
            {

                throw ex;
            }
            catch (System.Exception ex)
            {

                throw ex;
            }
        }

        public static DataSet GetListaSurtir(string Id_Num_UN)
        {
            DataSet ds = new DataSet();

            string conection = ConfigurationManager.AppSettings[ConfigurationManager.AppSettings["AmbienteSC"]];
            if (System.Configuration.ConfigurationManager.AppSettings["flagConectionDBEcriptado"].ToString().Trim().Equals("1"))
            {
                conection = Soriana.FWK.FmkTools.Seguridad.Desencriptar(ConfigurationManager.AppSettings[ConfigurationManager.AppSettings["AmbienteSC"]]);
            }


            try
            {
                Soriana.FWK.FmkTools.SqlHelper.connection_Name(ConfigurationManager.ConnectionStrings["Connection_DEV"].ConnectionString);


                System.Collections.Hashtable parametros = new System.Collections.Hashtable();
                parametros.Add("@Id_Num_UN", Id_Num_UN);



                ds = Soriana.FWK.FmkTools.SqlHelper.ExecuteDataSet(CommandType.StoredProcedure, "spSurtido_ListaPorSurtirNvo_sup", false, parametros);

                return ds;
            }
            catch (SqlException ex)
            {

                throw ex;
            }
            catch (System.Exception ex)
            {

                throw ex;
            }
        }

        #region ActualizaOrden

        public static DataSet GetMotivoCambioFP(int Id_Num_MotCmbFP = 0, bool Bit_Eliminado = false)
        {
            DataSet ds = new DataSet();

            string conection = ConfigurationManager.AppSettings[ConfigurationManager.AppSettings["AmbienteSC"]];
            if (System.Configuration.ConfigurationManager.AppSettings["flagConectionDBEcriptado"].ToString().Trim().Equals("1"))
            {
                conection = Soriana.FWK.FmkTools.Seguridad.Desencriptar(ConfigurationManager.AppSettings[ConfigurationManager.AppSettings["AmbienteSC"]]);
            }

            try
            {
                Soriana.FWK.FmkTools.SqlHelper.connection_Name(ConfigurationManager.ConnectionStrings["Connection_DEV"].ConnectionString);

                System.Collections.Hashtable parametros = new System.Collections.Hashtable();
                parametros.Add("@Id_Num_MotCmbFP", Id_Num_MotCmbFP);
                parametros.Add("@Bit_Eliminado", Bit_Eliminado);

                ds = Soriana.FWK.FmkTools.SqlHelper.ExecuteDataSet(CommandType.StoredProcedure, "CatMotivoCambioFP_Sup", false, parametros);

                return ds;
            }
            catch (SqlException ex)
            {
                throw ex;
            }
            catch (System.Exception ex)
            {
                throw ex;
            }
        }

        public static DataSet UpdFormaPago(int Id_Num_Orden, int Id_Num_MotCmbFP, string Obs_CambioFP)
        {
            DataSet ds = new DataSet();

            string conection = ConfigurationManager.AppSettings[ConfigurationManager.AppSettings["AmbienteSC"]];
            if (System.Configuration.ConfigurationManager.AppSettings["flagConectionDBEcriptado"].ToString().Trim().Equals("1"))
            {
                conection = Soriana.FWK.FmkTools.Seguridad.Desencriptar(ConfigurationManager.AppSettings[ConfigurationManager.AppSettings["AmbienteSC"]]);
            }

            try
            {
                System.Collections.Hashtable parametros = new System.Collections.Hashtable();

                Soriana.FWK.FmkTools.SqlHelper.connection_Name(ConfigurationManager.ConnectionStrings["Connection_DEV"].ConnectionString);

                parametros.Add("@OrderNo", Id_Num_Orden);
                parametros.Add("@Id_Num_MotCmbFP", Id_Num_MotCmbFP);
                parametros.Add("@Obs_CambioFP", Obs_CambioFP);

                Soriana.FWK.FmkTools.SqlHelper.ExecuteNonQuery(CommandType.StoredProcedure, "[upCorpOms_Upd_FormaPagoOrden]", false, parametros);

                return ds;
            }
            catch (SqlException ex)
            {

                throw ex;
            }
            catch (System.Exception ex)
            {

                throw ex;
            }

        }
        #endregion

        #region Observaciones
        public static DataSet DelObservaciones(int OrderNo, int Id_Cnsc_CarObs, int CnscOrder)
        {
            DataSet ds = new DataSet();

            string conection = ConfigurationManager.AppSettings[ConfigurationManager.AppSettings["AmbienteSC"]];
            if (System.Configuration.ConfigurationManager.AppSettings["flagConectionDBEcriptado"].ToString().Trim().Equals("1"))
            {
                conection = Soriana.FWK.FmkTools.Seguridad.Desencriptar(ConfigurationManager.AppSettings[ConfigurationManager.AppSettings["AmbienteSC"]]);
            }

            try
            {
                System.Collections.Hashtable parametros = new System.Collections.Hashtable();

                Soriana.FWK.FmkTools.SqlHelper.connection_Name(ConfigurationManager.ConnectionStrings["Connection_DEV"].ConnectionString);

                parametros.Add("@OrderNo", OrderNo);
                parametros.Add("@Id_Cnsc_CarObs", Id_Cnsc_CarObs);
                parametros.Add("@CnscOrder", CnscOrder);

                Soriana.FWK.FmkTools.SqlHelper.ExecuteNonQuery(CommandType.StoredProcedure, "[upCorpOms_Del_OrderComments]", false, parametros);

                return ds;
            }
            catch (SqlException ex)
            {

                throw ex;
            }
            catch (System.Exception ex)
            {

                throw ex;
            }

        }

        public static DataSet AddObservaciones(int OrderNo, string Desc_CarObs)
        {
            DataSet ds = new DataSet();

            string conection = ConfigurationManager.AppSettings[ConfigurationManager.AppSettings["AmbienteSC"]];
            if (System.Configuration.ConfigurationManager.AppSettings["flagConectionDBEcriptado"].ToString().Trim().Equals("1"))
            {
                conection = Soriana.FWK.FmkTools.Seguridad.Desencriptar(ConfigurationManager.AppSettings[ConfigurationManager.AppSettings["AmbienteSC"]]);
            }

            try
            {
                System.Collections.Hashtable parametros = new System.Collections.Hashtable();

                Soriana.FWK.FmkTools.SqlHelper.connection_Name(ConfigurationManager.ConnectionStrings["Connection_DEV"].ConnectionString);

                parametros.Add("@OrderNo", OrderNo);
                parametros.Add("@Desc_CarObs", Desc_CarObs);


                Soriana.FWK.FmkTools.SqlHelper.ExecuteNonQuery(CommandType.StoredProcedure, "[upCorpOms_Ins_OrderComments]", false, parametros);

                return ds;
            }
            catch (SqlException ex)
            {

                throw ex;
            }
            catch (System.Exception ex)
            {

                throw ex;
            }

        }
        #endregion

        #region Pasillos especiales    
        public static DataSet GetPasillosEspeciales(int OrderNo)
        {
            DataSet ds = new DataSet();

            string conection = ConfigurationManager.AppSettings[ConfigurationManager.AppSettings["AmbienteSC"]];
            if (System.Configuration.ConfigurationManager.AppSettings["flagConectionDBEcriptado"].ToString().Trim().Equals("1"))
            {
                conection = Soriana.FWK.FmkTools.Seguridad.Desencriptar(ConfigurationManager.AppSettings[ConfigurationManager.AppSettings["AmbienteSC"]]);
            }


            try
            {
                Soriana.FWK.FmkTools.SqlHelper.connection_Name(ConfigurationManager.ConnectionStrings["Connection_DEV"].ConnectionString);


                System.Collections.Hashtable parametros = new System.Collections.Hashtable();
                parametros.Add("@OrderNo", OrderNo);



                ds = Soriana.FWK.FmkTools.SqlHelper.ExecuteDataSet(CommandType.StoredProcedure, "upCorpOms_Cns_ListPasillosEspeciales", false, parametros);

                return ds;
            }
            catch (SqlException ex)
            {

                throw ex;
            }
            catch (System.Exception ex)
            {

                throw ex;
            }
        }
        #endregion

        #region Cancelacion Pass

        public static DataSet GetPassCan(int Id_Num_UN, int Id_Num_TipoClave = 1)

        {

            DataSet ds = new DataSet();



            string conection = ConfigurationManager.AppSettings[ConfigurationManager.AppSettings["AmbienteSC"]];

            if (System.Configuration.ConfigurationManager.AppSettings["flagConectionDBEcriptado"].ToString().Trim().Equals("1"))

            {

                conection = Soriana.FWK.FmkTools.Seguridad.Desencriptar(ConfigurationManager.AppSettings[ConfigurationManager.AppSettings["AmbienteSC"]]);

            }





            try

            {

                Soriana.FWK.FmkTools.SqlHelper.connection_Name(ConfigurationManager.ConnectionStrings["Connection_DEV"].ConnectionString);



                System.Collections.Hashtable parametros = new System.Collections.Hashtable();

                parametros.Add("@Id_Num_UN ", Id_Num_UN);

                parametros.Add("@Id_Num_TipoClave ", Id_Num_TipoClave);



                ds = Soriana.FWK.FmkTools.SqlHelper.ExecuteDataSet(CommandType.StoredProcedure, "cPwdCan_Sup1", false, parametros);



                return ds;

            }

            catch (SqlException ex)

            {



                throw ex;

            }

            catch (System.Exception ex)

            {



                throw ex;

            }

        }

        public static DataSet UpdPassCan(int Id_Num_UN, string pwdnom, int Id_Num_TipoClave = 1)

        {

            DataSet ds = new DataSet();



            string conection = ConfigurationManager.AppSettings[ConfigurationManager.AppSettings["AmbienteSC"]];

            if (System.Configuration.ConfigurationManager.AppSettings["flagConectionDBEcriptado"].ToString().Trim().Equals("1"))

            {

                conection = Soriana.FWK.FmkTools.Seguridad.Desencriptar(ConfigurationManager.AppSettings[ConfigurationManager.AppSettings["AmbienteSC"]]);

            }





            try

            {

                Soriana.FWK.FmkTools.SqlHelper.connection_Name(ConfigurationManager.ConnectionStrings["Connection_DEV"].ConnectionString);



                System.Collections.Hashtable parametros = new System.Collections.Hashtable();

                parametros.Add("@Id_Num_UN ", Id_Num_UN);

                parametros.Add("@Id_Num_TipoClave ", Id_Num_TipoClave);

                parametros.Add("@pwdnom ", pwdnom);



                ds = Soriana.FWK.FmkTools.SqlHelper.ExecuteDataSet(CommandType.StoredProcedure, "cPwdCan_Uup1", false, parametros);



                return ds;

            }

            catch (SqlException ex)

            {



                throw ex;

            }

            catch (System.Exception ex)

            {



                throw ex;

            }

        }

        #endregion

        #region Catalogo Pasillos

        public static DataSet GetPasillos(int Id_Num_UN)

        {

            DataSet ds = new DataSet();



            string conection = ConfigurationManager.AppSettings[ConfigurationManager.AppSettings["AmbienteSC"]];

            if (System.Configuration.ConfigurationManager.AppSettings["flagConectionDBEcriptado"].ToString().Trim().Equals("1"))

            {

                conection = Soriana.FWK.FmkTools.Seguridad.Desencriptar(ConfigurationManager.AppSettings[ConfigurationManager.AppSettings["AmbienteSC"]]);

            }





            try

            {

                Soriana.FWK.FmkTools.SqlHelper.connection_Name(ConfigurationManager.ConnectionStrings["Connection_DEV"].ConnectionString);





                System.Collections.Hashtable parametros = new System.Collections.Hashtable();

                parametros.Add("@Id_Num_UN", Id_Num_UN);





                ds = Soriana.FWK.FmkTools.SqlHelper.ExecuteDataSet(CommandType.StoredProcedure, "PasilloUn_sUp", false, parametros);



                return ds;

            }

            catch (SqlException ex)

            {



                throw ex;

            }

            catch (System.Exception ex)

            {



                throw ex;

            }

        }

        public static DataSet AddPasilloUn(int Id_Num_UN)

        {

            DataSet ds = new DataSet();



            string conection = ConfigurationManager.AppSettings[ConfigurationManager.AppSettings["AmbienteSC"]];

            if (System.Configuration.ConfigurationManager.AppSettings["flagConectionDBEcriptado"].ToString().Trim().Equals("1"))

            {

                conection = Soriana.FWK.FmkTools.Seguridad.Desencriptar(ConfigurationManager.AppSettings[ConfigurationManager.AppSettings["AmbienteSC"]]);

            }





            try

            {

                Soriana.FWK.FmkTools.SqlHelper.connection_Name(ConfigurationManager.ConnectionStrings["Connection_DEV"].ConnectionString);





                System.Collections.Hashtable parametros = new System.Collections.Hashtable();

                parametros.Add("@Id_Num_UN", Id_Num_UN);





                ds = Soriana.FWK.FmkTools.SqlHelper.ExecuteDataSet(CommandType.StoredProcedure, "PasilloUn_iUp", false, parametros);



                return ds;

            }

            catch (SqlException ex)

            {



                throw ex;

            }

            catch (System.Exception ex)

            {



                throw ex;

            }

        }

        public static DataSet DelPasilloUn(int Id_Num_UN, int Id_Cnsc_Pasillo)

        {

            DataSet ds = new DataSet();



            string conection = ConfigurationManager.AppSettings[ConfigurationManager.AppSettings["AmbienteSC"]];

            if (System.Configuration.ConfigurationManager.AppSettings["flagConectionDBEcriptado"].ToString().Trim().Equals("1"))

            {

                conection = Soriana.FWK.FmkTools.Seguridad.Desencriptar(ConfigurationManager.AppSettings[ConfigurationManager.AppSettings["AmbienteSC"]]);

            }





            try

            {

                Soriana.FWK.FmkTools.SqlHelper.connection_Name(ConfigurationManager.ConnectionStrings["Connection_DEV"].ConnectionString);





                System.Collections.Hashtable parametros = new System.Collections.Hashtable();

                parametros.Add("@Id_Num_UN", Id_Num_UN);

                parametros.Add("@Id_Cnsc_Pasillo", Id_Cnsc_Pasillo);





                ds = Soriana.FWK.FmkTools.SqlHelper.ExecuteDataSet(CommandType.StoredProcedure, "PasilloUN_dup", false, parametros);



                return ds;

            }

            catch (SqlException ex)

            {



                throw ex;

            }

            catch (System.Exception ex)

            {



                throw ex;

            }

        }

        public static DataSet AddPasilloUnEspecial(int Id_Num_UN)

        {

            DataSet ds = new DataSet();



            string conection = ConfigurationManager.AppSettings[ConfigurationManager.AppSettings["AmbienteSC"]];

            if (System.Configuration.ConfigurationManager.AppSettings["flagConectionDBEcriptado"].ToString().Trim().Equals("1"))

            {

                conection = Soriana.FWK.FmkTools.Seguridad.Desencriptar(ConfigurationManager.AppSettings[ConfigurationManager.AppSettings["AmbienteSC"]]);

            }





            try

            {

                Soriana.FWK.FmkTools.SqlHelper.connection_Name(ConfigurationManager.ConnectionStrings["Connection_DEV"].ConnectionString);





                System.Collections.Hashtable parametros = new System.Collections.Hashtable();

                parametros.Add("@Id_Num_UN", Id_Num_UN);





                ds = Soriana.FWK.FmkTools.SqlHelper.ExecuteDataSet(CommandType.StoredProcedure, "PasilloUN_CrearEspeciales_iUp", false, parametros);



                return ds;

            }

            catch (SqlException ex)

            {



                throw ex;

            }

            catch (System.Exception ex)

            {



                throw ex;

            }

        }

        public static DataSet ReporteMapeoPasillo(int Id_Num_UN, int Id_Cnsc_Pasillo = 0, int Id_Num_Div = 0, int Id_Num_Categ = 0)

        {

            DataSet ds = new DataSet();



            string conection = ConfigurationManager.AppSettings[ConfigurationManager.AppSettings["AmbienteSC"]];

            if (System.Configuration.ConfigurationManager.AppSettings["flagConectionDBEcriptado"].ToString().Trim().Equals("1"))

            {

                conection = Soriana.FWK.FmkTools.Seguridad.Desencriptar(ConfigurationManager.AppSettings[ConfigurationManager.AppSettings["AmbienteSC"]]);

            }





            try

            {

                Soriana.FWK.FmkTools.SqlHelper.connection_Name(ConfigurationManager.ConnectionStrings["Connection_DEV"].ConnectionString);





                System.Collections.Hashtable parametros = new System.Collections.Hashtable();

                parametros.Add("@Id_Num_UN", Id_Num_UN);



                if (Id_Cnsc_Pasillo != 0)

                    parametros.Add("@Id_Cnsc_Pasillo", Id_Cnsc_Pasillo);



                if (Id_Num_Div != 0)

                    parametros.Add("@Id_Num_Div", Id_Num_Div);



                if (Id_Num_Categ != 0)

                    parametros.Add("@Id_Num_Categ", Id_Num_Categ);





                ds = Soriana.FWK.FmkTools.SqlHelper.ExecuteDataSet(CommandType.StoredProcedure, "ReporteMapeoPasillo_sUp", false, parametros);



                return ds;

            }

            catch (SqlException ex)

            {



                throw ex;

            }

            catch (System.Exception ex)

            {



                throw ex;

            }

        }

        public static DataSet GetPasilloCapturaAvance()

        {

            DataSet ds = new DataSet();



            string conection = ConfigurationManager.AppSettings[ConfigurationManager.AppSettings["AmbienteSC"]];

            if (System.Configuration.ConfigurationManager.AppSettings["flagConectionDBEcriptado"].ToString().Trim().Equals("1"))

            {

                conection = Soriana.FWK.FmkTools.Seguridad.Desencriptar(ConfigurationManager.AppSettings[ConfigurationManager.AppSettings["AmbienteSC"]]);

            }





            try

            {

                Soriana.FWK.FmkTools.SqlHelper.connection_Name(ConfigurationManager.ConnectionStrings["Connection_DEV"].ConnectionString);



                ds = Soriana.FWK.FmkTools.SqlHelper.ExecuteDataSet(CommandType.StoredProcedure, "PasilloCapturaAvance_sup", false);



                return ds;

            }

            catch (SqlException ex)

            {



                throw ex;

            }

            catch (System.Exception ex)

            {



                throw ex;

            }

        }

        public static DataSet GetPasilloCapturaAvanceUN(int Id_Num_UN)

        {

            DataSet ds = new DataSet();



            string conection = ConfigurationManager.AppSettings[ConfigurationManager.AppSettings["AmbienteSC"]];

            if (System.Configuration.ConfigurationManager.AppSettings["flagConectionDBEcriptado"].ToString().Trim().Equals("1"))

            {

                conection = Soriana.FWK.FmkTools.Seguridad.Desencriptar(ConfigurationManager.AppSettings[ConfigurationManager.AppSettings["AmbienteSC"]]);

            }





            try

            {

                Soriana.FWK.FmkTools.SqlHelper.connection_Name(ConfigurationManager.ConnectionStrings["Connection_DEV"].ConnectionString);





                System.Collections.Hashtable parametros = new System.Collections.Hashtable();

                parametros.Add("@Id_Num_UN", Id_Num_UN);





                ds = Soriana.FWK.FmkTools.SqlHelper.ExecuteDataSet(CommandType.StoredProcedure, "PasilloCapturaAvanceUN_sup", false, parametros);



                return ds;

            }

            catch (SqlException ex)

            {



                throw ex;

            }

            catch (System.Exception ex)

            {



                throw ex;

            }

        }

        public static DataSet UpdPasilloUN(int Id_Num_UN, int Id_Cnsc_Pasillo, string Nom_Pasillo, int Num_Orden)

        {



            DataSet ds = new DataSet();



            string conection = ConfigurationManager.AppSettings[ConfigurationManager.AppSettings["AmbienteSC"]];

            if (System.Configuration.ConfigurationManager.AppSettings["flagConectionDBEcriptado"].ToString().Trim().Equals("1"))

            {

                conection = Soriana.FWK.FmkTools.Seguridad.Desencriptar(ConfigurationManager.AppSettings[ConfigurationManager.AppSettings["AmbienteSC"]]);

            }





            try

            {

                Soriana.FWK.FmkTools.SqlHelper.connection_Name(ConfigurationManager.ConnectionStrings["Connection_DEV"].ConnectionString);





                System.Collections.Hashtable parametros = new System.Collections.Hashtable();

                parametros.Add("@Id_Num_UN", Id_Num_UN);

                parametros.Add("@Id_Cnsc_Pasillo", Id_Cnsc_Pasillo);

                parametros.Add("@Nom_Pasillo", Nom_Pasillo);

                parametros.Add("@Num_Orden", Num_Orden);





                ds = Soriana.FWK.FmkTools.SqlHelper.ExecuteDataSet(CommandType.StoredProcedure, "PasilloUN_uUp", false, parametros);



                return ds;

            }

            catch (SqlException ex)

            {



                throw ex;

            }

            catch (System.Exception ex)

            {



                throw ex;

            }

        }

        public static DataSet PasilloUnEditCateg(int Id_Num_UN, int Id_Cnsc_Pasillo, int Id_Num_Div, int Id_Num_Categ)

        {

            DataSet ds = new DataSet();

            string conection = ConfigurationManager.AppSettings[ConfigurationManager.AppSettings["AmbienteSC"]];

            if (System.Configuration.ConfigurationManager.AppSettings["flagConectionDBEcriptado"].ToString().Trim().Equals("1"))

            {

                conection = Soriana.FWK.FmkTools.Seguridad.Desencriptar(ConfigurationManager.AppSettings[ConfigurationManager.AppSettings["AmbienteSC"]]);

            }

            try
            {

                Soriana.FWK.FmkTools.SqlHelper.connection_Name(ConfigurationManager.ConnectionStrings["Connection_DEV"].ConnectionString);

                System.Collections.Hashtable parametros = new System.Collections.Hashtable();

                parametros.Add("@Id_Num_UN", Id_Num_UN);


                if (Id_Cnsc_Pasillo != 0)
                    parametros.Add("@Id_Cnsc_Pasillo", Id_Cnsc_Pasillo);

                if (Id_Num_Div != 0)
                    parametros.Add("@Id_Num_Div", Id_Num_Div);

                if (Id_Num_Categ != 0)
                    parametros.Add("@Id_Num_Categ", Id_Num_Categ);

                ds = Soriana.FWK.FmkTools.SqlHelper.ExecuteDataSet(CommandType.StoredProcedure, "[PasilloUN_EditCateg_V2_sup]", false, parametros);
                return ds;

            }

            catch (SqlException ex)

            {



                throw ex;

            }

            catch (System.Exception ex)

            {



                throw ex;

            }

        }

        public static DataSet AddPasilloUN_Linea(int Id_Num_UN, int Id_Cnsc_Pasillo, int Id_Num_Linea)

        {

            DataSet ds = new DataSet();
            string conection = ConfigurationManager.AppSettings[ConfigurationManager.AppSettings["AmbienteSC"]];
            if (System.Configuration.ConfigurationManager.AppSettings["flagConectionDBEcriptado"].ToString().Trim().Equals("1"))

            {

                conection = Soriana.FWK.FmkTools.Seguridad.Desencriptar(ConfigurationManager.AppSettings[ConfigurationManager.AppSettings["AmbienteSC"]]);

            }
            try
            {
                Soriana.FWK.FmkTools.SqlHelper.connection_Name(ConfigurationManager.ConnectionStrings["Connection_DEV"].ConnectionString);

                System.Collections.Hashtable parametros = new System.Collections.Hashtable();
                parametros.Add("@Id_Num_UN", Id_Num_UN);
                parametros.Add("@Id_Cnsc_Pasillo", Id_Cnsc_Pasillo);
                parametros.Add("@Id_Num_Linea", Id_Num_Linea);

                ds = Soriana.FWK.FmkTools.SqlHelper.ExecuteDataSet(CommandType.StoredProcedure, "PasilloUN_Linea_iup", false, parametros);

                return ds;
            }
            catch (SqlException ex)
            {
                throw ex;
            }
            catch (System.Exception ex)
            {
                throw ex;
            }

        }

        public static DataSet DelPasilloUN_Linea(int Id_Num_UN, int Id_Cnsc_Pasillo, int Id_Num_Linea)

        {
            DataSet ds = new DataSet();

            string conection = ConfigurationManager.AppSettings[ConfigurationManager.AppSettings["AmbienteSC"]];
            if (System.Configuration.ConfigurationManager.AppSettings["flagConectionDBEcriptado"].ToString().Trim().Equals("1"))

            {

                conection = Soriana.FWK.FmkTools.Seguridad.Desencriptar(ConfigurationManager.AppSettings[ConfigurationManager.AppSettings["AmbienteSC"]]);

            }
            try
            {
                Soriana.FWK.FmkTools.SqlHelper.connection_Name(ConfigurationManager.ConnectionStrings["Connection_DEV"].ConnectionString);

                System.Collections.Hashtable parametros = new System.Collections.Hashtable();
                parametros.Add("@Id_Num_UN", Id_Num_UN);
                parametros.Add("@Id_Cnsc_Pasillo", Id_Cnsc_Pasillo);
                parametros.Add("@Id_Num_Linea", Id_Num_Linea);

                ds = Soriana.FWK.FmkTools.SqlHelper.ExecuteDataSet(CommandType.StoredProcedure, "PasilloUN_Linea_dup", false, parametros);

                return ds;
            }
            catch (SqlException ex)
            {
                throw ex;
            }
            catch (System.Exception ex)
            {
                throw ex;
            }
        }

        public static DataSet PasilloUN_MoverLinea_uup(int Id_Num_UN, int Id_Cnsc_Pasillo, int Id_Num_Linea, int Num_Orden)
        {

            DataSet ds = new DataSet();

            string conection = ConfigurationManager.AppSettings[ConfigurationManager.AppSettings["AmbienteSC"]];

            if (System.Configuration.ConfigurationManager.AppSettings["flagConectionDBEcriptado"].ToString().Trim().Equals("1"))
            {
                conection = Soriana.FWK.FmkTools.Seguridad.Desencriptar(ConfigurationManager.AppSettings[ConfigurationManager.AppSettings["AmbienteSC"]]);
            }

            try
            {
                Soriana.FWK.FmkTools.SqlHelper.connection_Name(ConfigurationManager.ConnectionStrings["Connection_DEV"].ConnectionString);

                System.Collections.Hashtable parametros = new System.Collections.Hashtable();

                parametros.Add("@Id_Num_UN", Id_Num_UN);
                parametros.Add("@Id_Cnsc_Pasillo", Id_Cnsc_Pasillo);
                parametros.Add("@Id_Num_Linea", Id_Num_Linea);
                parametros.Add("@Num_Orden", Num_Orden);

                ds = Soriana.FWK.FmkTools.SqlHelper.ExecuteDataSet(CommandType.StoredProcedure, "PasilloUN_MoverLinea_uup", false, parametros);

                return ds;
            }
            catch (SqlException ex)

            {
                throw ex;
            }
            catch (System.Exception ex)
            {
                throw ex;
            }
        }



        #endregion

        #region Cancelacion Orden
        public static DataSet CancelaOrden_Uup(int Orden, string motivo = "", int Id_Num_MotCan = 0)
        {
            DataSet ds = new DataSet();

            string conection = ConfigurationManager.AppSettings[ConfigurationManager.AppSettings["AmbienteSC"]];
            if (System.Configuration.ConfigurationManager.AppSettings["flagConectionDBEcriptado"].ToString().Trim().Equals("1"))
            {
                conection = Soriana.FWK.FmkTools.Seguridad.Desencriptar(ConfigurationManager.AppSettings[ConfigurationManager.AppSettings["AmbienteSC"]]);
            }


            try
            {
                Soriana.FWK.FmkTools.SqlHelper.connection_Name(ConfigurationManager.ConnectionStrings["Connection_DEV"].ConnectionString);


                System.Collections.Hashtable parametros = new System.Collections.Hashtable();
                parametros.Add("@Orden", Orden);
                parametros.Add("@motivo", motivo);
                if (Id_Num_MotCan != 0)
                    parametros.Add("@Id_Num_MotCan", Id_Num_MotCan);



                ds = Soriana.FWK.FmkTools.SqlHelper.ExecuteDataSet(CommandType.StoredProcedure, "ecCancelaOrden_Uup", false, parametros);

                return ds;
            }
            catch (SqlException ex)
            {

                throw ex;
            }
            catch (System.Exception ex)
            {

                throw ex;
            }
        }

        //CatMotivoCan_Sup
        public static DataSet CatMotivoCan_Sup(int Id_Num_MotCan = 0, bool Bit_Eliminado = false)
        {
            DataSet ds = new DataSet();

            string conection = ConfigurationManager.AppSettings[ConfigurationManager.AppSettings["AmbienteSC"]];
            if (System.Configuration.ConfigurationManager.AppSettings["flagConectionDBEcriptado"].ToString().Trim().Equals("1"))
            {
                conection = Soriana.FWK.FmkTools.Seguridad.Desencriptar(ConfigurationManager.AppSettings[ConfigurationManager.AppSettings["AmbienteSC"]]);
            }

            try
            {
                Soriana.FWK.FmkTools.SqlHelper.connection_Name(ConfigurationManager.ConnectionStrings["Connection_DEV"].ConnectionString);

                System.Collections.Hashtable parametros = new System.Collections.Hashtable();

                if (Id_Num_MotCan != 0)
                    parametros.Add("@Id_Num_MotCan", Id_Num_MotCan);

                parametros.Add("@Bit_Eliminado", Bit_Eliminado);

                ds = Soriana.FWK.FmkTools.SqlHelper.ExecuteDataSet(CommandType.StoredProcedure, "CatMotivoCan_Sup", false, parametros);

                return ds;
            }
            catch (SqlException ex)
            {

                throw ex;
            }
            catch (System.Exception ex)
            {

                throw ex;
            }
        }
        #endregion

        #region Traspaso

        public static DataSet TraspasaOrdenDeTienda(int NumOrden, int NumUnNva)
        {
            DataSet ds = new DataSet();

            string conection = ConfigurationManager.AppSettings[ConfigurationManager.AppSettings["AmbienteSC"]];
            if (System.Configuration.ConfigurationManager.AppSettings["flagConectionDBEcriptado"].ToString().Trim().Equals("1"))
            {
                conection = Soriana.FWK.FmkTools.Seguridad.Desencriptar(ConfigurationManager.AppSettings[ConfigurationManager.AppSettings["AmbienteSC"]]);
            }

            try
            {
                Soriana.FWK.FmkTools.SqlHelper.connection_Name(ConfigurationManager.ConnectionStrings["Connection_DEV"].ConnectionString);

                System.Collections.Hashtable parametros = new System.Collections.Hashtable();

                parametros.Add("@NumOrden", NumOrden);
                parametros.Add("@NumUnNva", NumUnNva);


                ds = Soriana.FWK.FmkTools.SqlHelper.ExecuteDataSet(CommandType.StoredProcedure, "SP_TraspasaOrdenDeTienda", false, parametros);

                return ds;
            }
            catch (SqlException ex)
            {

                throw ex;
            }
            catch (System.Exception ex)
            {

                throw ex;
            }
        }
        #endregion

        #region reportes
        public static DataSet RepDiaSurtido(int opc, string feci, string fecf, int orden, int Id_Num_Un)
        {
            DataSet ds = new DataSet();

            string conection = ConfigurationManager.AppSettings[ConfigurationManager.AppSettings["AmbienteSC"]];
            if (System.Configuration.ConfigurationManager.AppSettings["flagConectionDBEcriptado"].ToString().Trim().Equals("1"))
            {
                conection = Soriana.FWK.FmkTools.Seguridad.Desencriptar(ConfigurationManager.AppSettings[ConfigurationManager.AppSettings["AmbienteSC"]]);
            }

            try
            {
                Soriana.FWK.FmkTools.SqlHelper.connection_Name(ConfigurationManager.ConnectionStrings["Connection_DEV"].ConnectionString);

                System.Collections.Hashtable parametros = new System.Collections.Hashtable();

                parametros.Add("@opc", opc);
                if (opc != 6)
                {
                    parametros.Add("@fecini", feci);
                    parametros.Add("@fecfin", fecf);
                }
                parametros.Add("@orden", orden);
                if (Id_Num_Un != 0)
                    parametros.Add("@Id_Num_Un", Id_Num_Un);


                ds = Soriana.FWK.FmkTools.SqlHelper.ExecuteDataSet(CommandType.StoredProcedure, "ecRepDiaSurtido_Sup", false, parametros);

                return ds;
            }
            catch (SqlException ex)
            {

                throw ex;
            }
            catch (System.Exception ex)
            {

                throw ex;
            }
        }

        public static DataTable GetImportesOEntr(int opc, string feci, string fecf, int orden, int Id_Num_Un, int Id_Num_FormaPago)
        {
            DataTable ds = GetTable();
            try
            {
                var d = RepDiaSurtido(opc, feci, fecf, orden, Id_Num_Un);
                decimal? pedido = 0;
                decimal? cobrado = 0;
                decimal? vlst1 = 0;
                decimal? vlst2 = 0;
                decimal? vlst3 = 0;
                decimal? vlst4 = 0;
                decimal? vlst5 = 0;
                decimal? vltotal = 0;
                decimal? vltotalP = 0;
                foreach (DataRow item in d.Tables[0].Rows)
                {
                    decimal? Importe = (decimal?)item["Importe"];
                    decimal? TotalNormalComp = (decimal?)item["TotalNormalComp"];
                    decimal? TotalOfertaComp = (decimal?)item["TotalOfertaComp"];
                    decimal? TotalNormalSurt = (decimal?)item["TotalNormalSurt"];
                    decimal? TotalOfertaSurt = (decimal?)item["TotalOfertaSurt"];                    


                    if (TotalOfertaComp < TotalNormalComp)
                    {
                        pedido = TotalOfertaComp;
                        vltotalP = vltotalP + TotalOfertaComp;
                    }
                    else
                    {
                        pedido = TotalNormalComp;
                        vltotalP = vltotalP + TotalNormalComp;
                    }

                    if (Importe == null)
                    {
                        if (TotalOfertaSurt == null & TotalNormalSurt == null)
                        {
                            if (TotalOfertaComp < TotalNormalComp)
                            {
                                cobrado = TotalOfertaComp;
                                vltotal = vltotal + TotalOfertaComp;
                                if (Id_Num_FormaPago == 1) { vlst1 = vlst1 + TotalOfertaComp; }
                                if (Id_Num_FormaPago == 2) { vlst2 = vlst2 + TotalOfertaComp; }
                                if (Id_Num_FormaPago == 3) { vlst3 = vlst3 + TotalOfertaComp; }
                                if (Id_Num_FormaPago == 4) { vlst4 = vlst4 + TotalOfertaComp; }
                                if (Id_Num_FormaPago == 5) { vlst5 = vlst5 + TotalOfertaComp; }
                            }
                            else
                            {
                                cobrado = TotalNormalComp;
                                vltotal = vltotal + TotalNormalComp;
                                if (Id_Num_FormaPago == 1) { vlst1 = vlst1 + TotalNormalComp; }
                                if (Id_Num_FormaPago == 2) { vlst2 = vlst2 + TotalNormalComp; }
                                if (Id_Num_FormaPago == 3) { vlst3 = vlst3 + TotalNormalComp; }
                                if (Id_Num_FormaPago == 4) { vlst4 = vlst4 + TotalNormalComp; }
                                if (Id_Num_FormaPago == 5) { vlst5 = vlst5 + TotalNormalComp; }
                            }
                        }
                        else
                        {
                            if (TotalOfertaSurt < TotalNormalSurt)
                            {
                                cobrado = TotalOfertaSurt;
                                vltotal = vltotal + TotalOfertaSurt;
                                if (Id_Num_FormaPago == 1) { vlst1 = vlst1 + TotalOfertaSurt; }
                                if (Id_Num_FormaPago == 2) { vlst2 = vlst2 + TotalOfertaSurt; }
                                if (Id_Num_FormaPago == 3) { vlst3 = vlst3 + TotalOfertaSurt; }
                                if (Id_Num_FormaPago == 4) { vlst4 = vlst4 + TotalOfertaSurt; }
                                if (Id_Num_FormaPago == 5) { vlst5 = vlst5 + TotalOfertaSurt; }
                            }
                            else {
                                cobrado = TotalNormalSurt;
                                vltotal = vltotal + TotalNormalSurt;
                                if (Id_Num_FormaPago == 1) { vlst1 = vlst1 + TotalNormalSurt; }
                                if (Id_Num_FormaPago == 2) { vlst2 = vlst2 + TotalNormalSurt; }
                                if (Id_Num_FormaPago == 3) { vlst3 = vlst3 + TotalNormalSurt; }
                                if (Id_Num_FormaPago == 4) { vlst4 = vlst4 + TotalNormalSurt; }
                                if (Id_Num_FormaPago == 5) { vlst5 = vlst5 + TotalNormalSurt; }
                            }
                        }
                    }
                    else
                    {
                        cobrado = Importe;
                        if (Id_Num_FormaPago == 1) { vlst1 = vlst1 + Importe; }
                        if (Id_Num_FormaPago == 2) { vlst2 = vlst2 + Importe; }
                        if (Id_Num_FormaPago == 3) { vlst3 = vlst3 + Importe; }
                        if (Id_Num_FormaPago == 4) { vlst4 = vlst4 + Importe; }
                        if (Id_Num_FormaPago == 5) { vlst5 = vlst5 + Importe; }

                    }
                }


                ds.Rows.Add(pedido, cobrado, vlst1, vlst2, vlst3, vlst4, vlst5);
                return ds;
            }
            catch (System.Exception ex)
            {

                throw ex;
            }
        }

        static DataTable GetTable()
        {
            // Step 2: here we create a DataTable.
            // ... We add 4 columns, each with a Type.
            DataTable table = new DataTable();
            table.Columns.Add("ImportePedido", typeof(decimal));
            table.Columns.Add("ImporteSurtido", typeof(decimal));

            table.Columns.Add("vlst1", typeof(decimal));
            table.Columns.Add("vlst2", typeof(decimal));
            table.Columns.Add("vlst3", typeof(decimal));
            table.Columns.Add("vlst4", typeof(decimal));
            table.Columns.Add("vlst5", typeof(decimal));




            return table;
        }

        #endregion

        #region Actualiza fecha Entrega
        //CalEntrega_Fec_Entrega_Uup

        public static DataSet Fec_Entrega_Uup(int Id_Num_Orden, string Fec_Entrega)
        {
            DataSet ds = new DataSet();

            string conection = ConfigurationManager.AppSettings[ConfigurationManager.AppSettings["AmbienteSC"]];
            if (System.Configuration.ConfigurationManager.AppSettings["flagConectionDBEcriptado"].ToString().Trim().Equals("1"))
            {
                conection = Soriana.FWK.FmkTools.Seguridad.Desencriptar(ConfigurationManager.AppSettings[ConfigurationManager.AppSettings["AmbienteSC"]]);
            }

            try
            {
                Soriana.FWK.FmkTools.SqlHelper.connection_Name(ConfigurationManager.ConnectionStrings["Connection_DEV"].ConnectionString);

                System.Collections.Hashtable parametros = new System.Collections.Hashtable();



                parametros.Add("@Id_Num_Orden", Id_Num_Orden);
                parametros.Add("@Fec_Entrega", Fec_Entrega);


                ds = Soriana.FWK.FmkTools.SqlHelper.ExecuteDataSet(CommandType.StoredProcedure, "CalEntrega_Fec_Entrega_Uup", false, parametros);

                return ds;
            }
            catch (SqlException ex)
            {

                throw ex;
            }
            catch (System.Exception ex)
            {

                throw ex;
            }
        }
        #endregion

        public static void UpdProductsToOrder(string OrderNo, string PosBarcode, string PosProductDescription
            , string PosQuantity, string PosPriceNormalSale, string PosPriceOfferSale
            , string ProductId, string UnitMeasure, string comments)
        {


            //upCorpOms_Upd_ProductsToOrder


            string conection = ConfigurationManager.AppSettings[ConfigurationManager.AppSettings["AmbienteSC"]];
            if (System.Configuration.ConfigurationManager.AppSettings["flagConectionDBEcriptado"].ToString().Trim().Equals("1"))
            {
                conection = Soriana.FWK.FmkTools.Seguridad.Desencriptar(ConfigurationManager.AppSettings[ConfigurationManager.AppSettings["AmbienteSC"]]);
            }


            try
            {
                Soriana.FWK.FmkTools.SqlHelper.connection_Name(ConfigurationManager.ConnectionStrings["Connection_DEV"].ConnectionString);


                System.Collections.Hashtable parametros = new System.Collections.Hashtable();
                parametros.Add("@OrderNo", OrderNo);
                parametros.Add("@PosBarcode", PosBarcode);
                parametros.Add("@PosProductDescription", PosProductDescription);
                parametros.Add("@PosQuantity", PosQuantity);
                parametros.Add("@PosPriceNormalSale", PosPriceNormalSale);
                parametros.Add("@PosPriceOfferSale", PosPriceOfferSale);
                parametros.Add("@ProductId", ProductId);
                parametros.Add("@UnitMeasure", UnitMeasure);
                parametros.Add("@Desc_ArtCarObser", comments);

                Soriana.FWK.FmkTools.SqlHelper.ExecuteNonQuery(CommandType.StoredProcedure, "upCorpOms_Upd_ProductsToOrder", false, parametros);


            }
            catch (SqlException ex)
            {

                throw ex;
            }
            catch (System.Exception ex)
            {

                throw ex;
            }
        }
    }
}