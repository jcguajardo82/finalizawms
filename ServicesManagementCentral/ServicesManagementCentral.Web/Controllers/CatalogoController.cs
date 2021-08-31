using Newtonsoft.Json;

using ServicesManagement.Web.Models;

using System;

using System.Collections.Generic;

using System.Data;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;

using System.Reflection;

using System.Text;

using System.Threading.Tasks;

using System.Web.Mvc;
using System.Web.Script.Serialization;

namespace ServicesManagement.Web.Controllers

{
    public class CatalogoController : Controller

    {

        public ActionResult CPanel()

        {

            return View("CPanel/Index");

        }

        #region Transportistas

        public ActionResult Transportistas()

        {
            if (Session["Id_Num_UN"] == null)
            {
                return RedirectToAction("Index", "Ordenes");
            }
            return View("Transportistas/Index");
        }

        [HttpGet]
        public ActionResult GetTransportistas()

        {
            try
            {
                if (Session["Id_Num_UN"] == null)
                {
                    return RedirectToAction("Index", "Ordenes");
                }

                DataSet ds = DALServicesM.GetCarriersUN(int.Parse(Session["Id_Num_UN"].ToString()));
                List<CarrierModel> listC = ConvertTo<CarrierModel>(ds.Tables[0]);
                var result = new { Success = true, json = listC };
                return Json(result, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                var result = new { Success = false, Message = ex.Message };
                return Json(result, JsonRequestBehavior.AllowGet);
            }
        }

        public async Task<ActionResult> AddTransportistas(string num, string name, string un)
        {
            try
            {
                DALServicesM.AddCarriers(num, name, Session["Id_Num_UN"].ToString());
                var result = new { Success = true, Message = "Alta exitosa" };
                return Json(result, JsonRequestBehavior.AllowGet);
            }
            catch (Exception x)
            {
                var result = new { Success = false, Message = x.Message };
                return Json(result, JsonRequestBehavior.AllowGet);
            }
        }

        public async Task<ActionResult> EditTransportistas(string num, string name, string un, string status)
        {
            try
            {
                DALServicesM.EditCarriers(num, name, Session["Id_Num_UN"].ToString(), status);
                var result = new { Success = true, Message = "Alta exitosa" };
                return Json(result, JsonRequestBehavior.AllowGet);
            }
            catch (Exception x)
            {
                var result = new { Success = false, Message = x.Message };

                return Json(result, JsonRequestBehavior.AllowGet);
            }
        }

        public async Task<ActionResult> DeleteTransportistas(string num)

        {
            try
            {
                DALServicesM.DeleteCarriers(num);

                var result = new { Success = true, Message = "Eliminacion exitosa" };
                return Json(result, JsonRequestBehavior.AllowGet);
            }
            catch (Exception x)
            {
                var result = new { Success = false, Message = x.Message };
                return Json(result, JsonRequestBehavior.AllowGet);
            }
        }

        public async Task<JsonResult> GetTransportista(string num)

        {



            try

            {

                DataSet d = DALServicesM.GetCarrier(num);



                ServicesManagement.Web.Models.OMSModels.CarrierModel c = new ServicesManagement.Web.Models.OMSModels.CarrierModel();



                if (!Soriana.FWK.FmkTools.DatosDB.IsNullOrEmptyDataSet(d))

                {

                    if (!Soriana.FWK.FmkTools.DatosDB.IsNullOrEmptyDatatable(d.Tables[0]))

                    {

                        foreach (DataRow r in d.Tables[0].Rows)

                        {



                            c.Name = r["Name"].ToString();

                            c.Id_Num_UN = Convert.ToInt32(r["Id_Num_UN"]);

                            c.Id_Num_Empleado = r["Id_Num_Empleado"].ToString();

                        }

                    }



                }





                var result = new { Success = true, json = c };



                return Json(result, JsonRequestBehavior.AllowGet);



            }

            catch (Exception x)

            {

                var result = new { Success = false, Message = x.Message };



                return Json(result, JsonRequestBehavior.AllowGet);



            }

        }
        #endregion

        #region Surtidores

        public ActionResult Surtidores()

        {
            if (Session["Id_Num_UN"] == null)
            {
                return RedirectToAction("Index", "Ordenes");
            }
            return View("Surtidores/Index");
        }

        [HttpGet]
        public ActionResult GetSurtidores()
        {
            try
            {
                if (Session["Id_Num_UN"] == null)
                {
                    return RedirectToAction("Index", "Ordenes");
                }
                DataSet ds = DALServicesM.GetSuppliersUN(int.Parse(Session["Id_Num_UN"].ToString()));
                List<SupplierModel> listC = ConvertTo<SupplierModel>(ds.Tables[0]);

                var result = new { Success = true, json = listC };
                return Json(result, JsonRequestBehavior.AllowGet);
            }

            catch (Exception ex)
            {
                var result = new { Success = false, Message = ex.Message };
                return Json(result, JsonRequestBehavior.AllowGet);
            }
        }

        public ActionResult AddSurtidores(string num, string name, string un)

        {
            try
            {
                DALServicesM.AddSupplier(num, name, Session["Id_Num_UN"].ToString());
                var result = new { Success = true, Message = "Alta exitosa" };
                return Json(result, JsonRequestBehavior.AllowGet);
            }
            catch (Exception x)
            {
                var result = new { Success = false, Message = x.Message };
                return Json(result, JsonRequestBehavior.AllowGet);
            }
        }

        public ActionResult EditSurtidores(string num, string name, string un, string status, string Id_Num_Empleado)

        {
            try
            {
                DALServicesM.EditSupplier(num, name, Session["Id_Num_UN"].ToString(), status, Id_Num_Empleado);

                var result = new { Success = true, Message = "Alta exitosa" };
                return Json(result, JsonRequestBehavior.AllowGet);
            }

            catch (Exception x)

            {
                var result = new { Success = false, Message = x.Message };
                return Json(result, JsonRequestBehavior.AllowGet);
            }

        }

        public async Task<ActionResult> DeleteSurtidores(string num)

        {
            try
            {
                DALServicesM.DeleteSupplier(num);
                var result = new { Success = true, Message = "Eliminacion exitosa" };
                return Json(result, JsonRequestBehavior.AllowGet);
            }
            catch (Exception x)
            {
                var result = new { Success = false, Message = x.Message };
                return Json(result, JsonRequestBehavior.AllowGet);
            }

        }

        public async Task<JsonResult> GetSurtidor(string num)

        {



            try

            {

                DataSet d = DALServicesM.GetSupplier(num);



                var c = new ServicesManagement.Web.Models.OMSModels.SupplierModel();



                if (!Soriana.FWK.FmkTools.DatosDB.IsNullOrEmptyDataSet(d))

                {

                    if (!Soriana.FWK.FmkTools.DatosDB.IsNullOrEmptyDatatable(d.Tables[0]))

                    {

                        foreach (DataRow r in d.Tables[0].Rows)

                        {



                            c.Name = r["Name"].ToString();

                            c.Id_Num_UN = Convert.ToInt32(r["Id_Num_UN"]);

                            c.Id_Num_Empleado = r["Id_Num_Empleado"].ToString();

                        }

                    }



                }





                var result = new { Success = true, json = c };



                return Json(result, JsonRequestBehavior.AllowGet);



            }

            catch (Exception x)

            {

                var result = new { Success = false, Message = x.Message };



                return Json(result, JsonRequestBehavior.AllowGet);



            }

        }

        /// <summary>
        /// CONSULTA EL NUMERO DE EMPLEADO EN LA BD DE NOMINA
        /// </summary>
        /// <param name="num"></param>
        /// <returns></returns>
        public JsonResult GetSurtidorApi(string num)
        {
            try
            {


                string json2 = string.Empty;
                JavaScriptSerializer js = new JavaScriptSerializer();
                //json2 = js.Serialize(o);
                js = null;
                json2 = "";// JsonConvert.SerializeObject(o);
                System.Net.ServicePointManager.SecurityProtocol = SecurityProtocolType.Tls12;

                Soriana.FWK.FmkTools.RestResponse r = Soriana.FWK.FmkTools.RestClient.RequestRest(Soriana.FWK.FmkTools.HttpVerb.GET, System.Configuration.ConfigurationSettings.AppSettings["api_GetEmpleado"] + num, "", "");



                List<EmpleadoModels> list = JsonConvert.DeserializeObject<List<EmpleadoModels>>(r.message);


                var result = new { Success = true, json = list[0].Nombre + " " + list[0].Apellido_Paterno + " " + list[0].Apellido_Materno };
                return Json(result, JsonRequestBehavior.AllowGet);

            }
            catch (Exception x)
            {
                var result = new { Success = false, Message = x.Message };

                return Json(result, JsonRequestBehavior.AllowGet);
            }

        }
        #endregion

        #region Pasillos
        public ActionResult Pasillos()

        {

            if (Session["Id_Num_UN"] == null)

            {

                return RedirectToAction("Index", "Ordenes");

            }



            return View("Pasillos/Index");

        }

        public JsonResult GetPasilloUn()
        {
            try
            {
                if (Session["Id_Num_UN"] != null)
                {
                    DataSet d = DALServicesM.GetPasillos(int.Parse(Session["Id_Num_UN"].ToString()));
                    List<PasilloUnModel> listC = new List<PasilloUnModel>();
                    if (!Soriana.FWK.FmkTools.DatosDB.IsNullOrEmptyDataSet(d))

                    {

                        if (!Soriana.FWK.FmkTools.DatosDB.IsNullOrEmptyDatatable(d.Tables[0]))

                        {

                            listC = ConvertTo<PasilloUnModel>(d.Tables[0]);

                        }

                    }
                    var result = new { Success = true, json = listC };
                    return Json(result, JsonRequestBehavior.AllowGet);
                }
                else
                {
                    var result = new { Success = false, json = "OKS" };
                    RedirectToAction("Index", "Ordenes");
                    return Json(result, JsonRequestBehavior.AllowGet);
                }
            }
            catch (Exception x)
            {
                var result = new { Success = false, Message = x.Message };
                return Json(result, JsonRequestBehavior.AllowGet);
            }
        }

        [HttpPost]
        public JsonResult AddPasilloUn()

        {

            try

            {

                if (Session["Id_Num_UN"] != null)

                {

                    DataSet d = DALServicesM.AddPasilloUn(int.Parse(Session["Id_Num_UN"].ToString()));



                    var result = new { Success = true, json = "Ok" };

                    return Json(result, JsonRequestBehavior.AllowGet);

                }

                else

                {

                    var result = new { Success = false, json = "OKS" };

                    RedirectToAction("Index", "Ordenes");

                    return Json(result, JsonRequestBehavior.AllowGet);

                }

            }

            catch (Exception x)

            {

                var result = new { Success = false, Message = x.Message };

                return Json(result, JsonRequestBehavior.AllowGet);

            }

        }

        [HttpPost]
        public JsonResult DellPasilloUn(string Id_Num_UN, string Id_Cnsc_Pasillo)

        {

            try

            {

                if (Session["Id_Num_UN"] != null)

                {

                    DataSet d = DALServicesM.DelPasilloUn(int.Parse(Id_Num_UN), int.Parse(Id_Cnsc_Pasillo));



                    var result = new { Success = true, json = "Ok" };

                    return Json(result, JsonRequestBehavior.AllowGet);

                }

                else

                {

                    var result = new { Success = false, json = "OKS" };

                    RedirectToAction("Index", "Ordenes");

                    return Json(result, JsonRequestBehavior.AllowGet);

                }

            }

            catch (Exception x)

            {

                var result = new { Success = false, Message = x.Message };

                return Json(result, JsonRequestBehavior.AllowGet);

            }

        }

        [HttpPost]
        public JsonResult AddPasilloUnEsp()

        {

            try

            {

                if (Session["Id_Num_UN"] != null)

                {

                    DataSet d = DALServicesM.AddPasilloUnEspecial(int.Parse(Session["Id_Num_UN"].ToString()));



                    var result = new { Success = true, json = "Ok" };

                    return Json(result, JsonRequestBehavior.AllowGet);

                }

                else

                {

                    var result = new { Success = false, json = "OKS" };

                    RedirectToAction("Index", "Ordenes");

                    return Json(result, JsonRequestBehavior.AllowGet);

                }

            }

            catch (Exception x)

            {

                var result = new { Success = false, Message = x.Message };

                return Json(result, JsonRequestBehavior.AllowGet);

            }

        }

        [HttpGet]
        public JsonResult GetPasilloUnReporteMap(string Id_Num_Un, string Id_Cnsc_Pasillo = "0"
            , string Id_Num_Div = "0", string Id_Num_Categ = "0")

        {
            try
            {
                if (Session["Id_Num_UN"] != null)
                {
                    DataSet d = DALServicesM.ReporteMapeoPasillo(int.Parse(Id_Num_Un), int.Parse(Id_Cnsc_Pasillo)
                        , int.Parse(Id_Num_Div), int.Parse(Id_Num_Categ));
                    PasilloUnReporteMapModel ListRpt = new PasilloUnReporteMapModel();
                    List<CategoriaModel> Categoria = new List<CategoriaModel>();
                    List<DivisionModel> Division = new List<DivisionModel>();
                    List<PasilloUnDetalleRep> PasilloDetalle = new List<PasilloUnDetalleRep>();
                    List<PasilloUnRepPasillo> Pasillo = new List<PasilloUnRepPasillo>();

                    if (!Soriana.FWK.FmkTools.DatosDB.IsNullOrEmptyDataSet(d))

                    {

                        if (!Soriana.FWK.FmkTools.DatosDB.IsNullOrEmptyDatatable(d.Tables[0]))

                        {

                            Pasillo = ConvertTo<PasilloUnRepPasillo>(d.Tables[0]);

                            Division = ConvertTo<DivisionModel>(d.Tables[1]);

                            Categoria = ConvertTo<CategoriaModel>(d.Tables[2]);

                            PasilloDetalle = ConvertTo<PasilloUnDetalleRep>(d.Tables[3]);



                        }

                    }
                    ListRpt.Categoria = Categoria;
                    ListRpt.Division = Division;
                    ListRpt.Pasillo = Pasillo;
                    ListRpt.PasilloDetalle = PasilloDetalle;

                    var result = new { Success = true, json = ListRpt };

                    return Json(result, JsonRequestBehavior.AllowGet);

                }
                else
                {
                    var result = new { Success = false, json = "OKS" };
                    RedirectToAction("Index", "Ordenes");

                    return Json(result, JsonRequestBehavior.AllowGet);
                }
            }
            catch (Exception x)
            {
                var result = new { Success = false, Message = x.Message };
                return Json(result, JsonRequestBehavior.AllowGet);
            }

        }

        [HttpPost]
        public JsonResult UpdatePasilloUn(string Id_Num_UN, string Id_Cnsc_Pasillo, string Nom_PasilloTipo, string Num_Orden)

        {

            try

            {

                if (Session["Id_Num_UN"] != null)

                {



                    DataSet d = DALServicesM.UpdPasilloUN(int.Parse(Id_Num_UN), int.Parse(Id_Cnsc_Pasillo), Nom_PasilloTipo, int.Parse(Num_Orden));



                    var result = new { Success = true, json = "Ok" };

                    return Json(result, JsonRequestBehavior.AllowGet);

                }

                else

                {

                    var result = new { Success = false, json = "OKS" };

                    RedirectToAction("Index", "Ordenes");

                    return Json(result, JsonRequestBehavior.AllowGet);

                }

            }

            catch (Exception x)

            {

                var result = new { Success = false, Message = x.Message };

                return Json(result, JsonRequestBehavior.AllowGet);

            }

        }

        [HttpGet]
        public JsonResult PasilloUnEditCateg(string Id_Num_Un, string Id_Cnsc_Pasillo = "0"
    , string Id_Num_Div = "0", string Id_Num_Categ = "0")
        {
            try
            {
                if (Session["Id_Num_UN"] != null)
                {
                    var List = GetEditCateg(int.Parse(Id_Num_Un), int.Parse(Id_Cnsc_Pasillo)
                           , int.Parse(Id_Num_Div), int.Parse(Id_Num_Categ));

                    var result = new { Success = true, json = List };

                    return Json(result, JsonRequestBehavior.AllowGet);

                }

                else

                {

                    var result = new { Success = false, json = "OKS" };

                    RedirectToAction("Index", "Ordenes");

                    return Json(result, JsonRequestBehavior.AllowGet);

                }

            }

            catch (Exception x)

            {

                var result = new { Success = false, Message = x.Message };

                return Json(result, JsonRequestBehavior.AllowGet);

            }

        }

        [HttpGet]
        public ActionResult AddPasilloUnLinea(string Id_Num_UN, string Id_Cnsc_Pasillo
            , string Id_Num_Lineas, string Id_Num_Div, string Id_Num_Categ)
        {
            try
            {
                if (Session["Id_Num_UN"] != null)
                {
                    string[] lineas = Id_Num_Lineas.Split(',');

                    foreach (string value in lineas)
                    {
                        string Id_Num_Linea = value.Replace("chbElegDer-", "");
                        DataSet d = DALServicesM.AddPasilloUN_Linea(int.Parse(Id_Num_UN), int.Parse(Id_Cnsc_Pasillo), int.Parse(Id_Num_Linea));
                    }

                    var lista = GetEditCateg(int.Parse(Id_Num_UN), int.Parse(Id_Cnsc_Pasillo), int.Parse(Id_Num_Div), int.Parse(Id_Num_Categ));
                    var result = new { Success = true, json = lista };
                    return Json(result, JsonRequestBehavior.AllowGet);

                }
                else

                {

                    var result = new { Success = false, json = "OKS" };

                    RedirectToAction("Index", "Ordenes");

                    return Json(result, JsonRequestBehavior.AllowGet);

                }
            }
            catch (Exception x)
            {
                var result = new { Success = false, Message = x.Message };
                return Json(result, JsonRequestBehavior.AllowGet);

            }
        }

        [HttpGet]
        public JsonResult DelPasilloUnLinea(string Id_Num_UN, string Id_Cnsc_Pasillo
            , string Id_Num_Lineas, string Id_Num_Div, string Id_Num_Categ)

        {
            try
            {
                if (Session["Id_Num_UN"] != null)
                {
                    string[] lineas = Id_Num_Lineas.Split(',');

                    foreach (string value in lineas)
                    {
                        string Id_Num_Linea = value.Replace("chbElegIzq-", "");
                        DataSet d = DALServicesM.DelPasilloUN_Linea(int.Parse(Id_Num_UN), int.Parse(Id_Cnsc_Pasillo), int.Parse(Id_Num_Linea));
                    }

                    var lista = GetEditCateg(int.Parse(Id_Num_UN), int.Parse(Id_Cnsc_Pasillo), int.Parse(Id_Num_Div), int.Parse(Id_Num_Categ));
                    var result = new { Success = true, json = lista };
                    return Json(result, JsonRequestBehavior.AllowGet);
                }
                else

                {

                    var result = new { Success = false, json = "OKS" };

                    RedirectToAction("Index", "Ordenes");

                    return Json(result, JsonRequestBehavior.AllowGet);

                }
            }
            catch (Exception x)
            {
                var result = new { Success = false, Message = x.Message };
                return Json(result, JsonRequestBehavior.AllowGet);
            }

        }

        //================================ exporta a excel ============================================
        public FileResult PasilloRptExcel(string opcion = "")

        {

            var d = new DataSet();

            string nombreArchivo = string.Empty;

            //Excel to create an object file
            NPOI.HSSF.UserModel.HSSFWorkbook book = new NPOI.HSSF.UserModel.HSSFWorkbook();
            //Add a sheet
            NPOI.SS.UserModel.ISheet sheet1 = book.CreateSheet("Sheet1");

            //Here you can set a variety of styles seemingly font color backgrounds, but not very convenient, there is not set
            //Sheet1 head to add the title of the first row

            NPOI.SS.UserModel.IRow row1 = sheet1.CreateRow(0);

            if (opcion == "1")

            {

                d = DALServicesM.GetPasilloCapturaAvance();
                nombreArchivo = "PasilloCapturaAvance";


                row1.CreateCell(0).SetCellValue("TIENDA");
                row1.CreateCell(1).SetCellValue("DIVISION");
                row1.CreateCell(2).SetCellValue("LINEAS CATALOGADAS");
                row1.CreateCell(3).SetCellValue("LINEAS DADAS DE ALTA EN EL ORDENAMIENTO DE PASILLOS");
                row1.CreateCell(4).SetCellValue("% AVANCE DE ALTA DE LINEAS");

                //The data is written progressively sheet1 each row
                for (int i = 0; i < d.Tables[0].Rows.Count; i++)

                {

                    NPOI.SS.UserModel.IRow rowtemp = sheet1.CreateRow(i + 1);

                    rowtemp.CreateCell(0).SetCellValue(d.Tables[0].Rows[i][0].ToString());
                    rowtemp.CreateCell(1).SetCellValue(d.Tables[0].Rows[i][1].ToString());
                    rowtemp.CreateCell(2).SetCellValue(d.Tables[0].Rows[i][2].ToString());
                    rowtemp.CreateCell(3).SetCellValue(d.Tables[0].Rows[i][3].ToString());
                    rowtemp.CreateCell(4).SetCellValue(d.Tables[0].Rows[i][4].ToString());
                }

            }
            else
            {

                d = DALServicesM.GetPasilloCapturaAvanceUN(int.Parse(Session["Id_Num_UN"].ToString()));
                nombreArchivo = "PasilloCapturaAvanceUN";

                row1.CreateCell(0).SetCellValue("TIENDA");
                row1.CreateCell(1).SetCellValue("DIVISION");
                row1.CreateCell(2).SetCellValue("CATEGORIA");
                row1.CreateCell(3).SetCellValue("NUM DE LINEA");
                row1.CreateCell(4).SetCellValue("NOMBRE DE LA LINEA");
                row1.CreateCell(5).SetCellValue("STATUS DE LA LINEA");
                row1.CreateCell(6).SetCellValue("NOMBRE DEL PASILLO");

                //The data is written progressively sheet1 each row

                for (int i = 0; i < d.Tables[0].Rows.Count; i++)

                {

                    NPOI.SS.UserModel.IRow rowtemp = sheet1.CreateRow(i + 1);
                    rowtemp.CreateCell(0).SetCellValue(d.Tables[0].Rows[i][0].ToString());
                    rowtemp.CreateCell(1).SetCellValue(d.Tables[0].Rows[i][1].ToString());
                    rowtemp.CreateCell(2).SetCellValue(d.Tables[0].Rows[i][2].ToString());
                    rowtemp.CreateCell(3).SetCellValue(d.Tables[0].Rows[i][3].ToString());
                    rowtemp.CreateCell(4).SetCellValue(d.Tables[0].Rows[i][4].ToString());
                    rowtemp.CreateCell(5).SetCellValue(d.Tables[0].Rows[i][5].ToString());
                    rowtemp.CreateCell(6).SetCellValue(d.Tables[0].Rows[i][6].ToString());

                }

            }

            //.... N line
            //  Write to the client 

            System.IO.MemoryStream ms = new System.IO.MemoryStream();

            book.Write(ms);

            ms.Seek(0, SeekOrigin.Begin);

            DateTime dt = DateTime.Now;

            string dateTime = dt.ToString("yyyyMMddHHmmssfff");
            string fileName = nombreArchivo + "_" + dateTime + ".xls";

            return File(ms, "application/vnd.ms-excel", fileName);

        }

        [HttpPost]
        public ActionResult MoverLinea(string Id_Cnsc_Pasillo, string Id_Num_Linea, string Num_Orden
            , string Id_Num_Div, string Id_Num_Categ)

        {
            try
            {
                if (Session["Id_Num_UN"] != null)
                {
                    DataSet d = DALServicesM.PasilloUN_MoverLinea_uup(int.Parse(Session["Id_Num_UN"].ToString()), int.Parse(Id_Cnsc_Pasillo)
                        , int.Parse(Id_Num_Linea), int.Parse(Num_Orden));

                    var resp = GetEditCateg(int.Parse(Session["Id_Num_UN"].ToString()), int.Parse(Id_Cnsc_Pasillo), int.Parse(Id_Num_Div), int.Parse(Id_Num_Categ));
                    var result = new { Success = true, json = resp };
                    return Json(result, JsonRequestBehavior.AllowGet);
                }
                else
                {
                    return RedirectToAction("Index", "Ordenes");
                }
            }
            catch (Exception x)
            {
                var result = new { Success = false, Message = x.Message };
                return Json(result, JsonRequestBehavior.AllowGet);

            }
        }

        private PasilloUnEditCat GetEditCateg(int Id_Num_UN, int Id_Cnsc_Pasillo, int Id_Num_Div, int Id_Num_Categ)
        {
            DataSet d = DALServicesM.PasilloUnEditCateg(Id_Num_UN, Id_Cnsc_Pasillo
                        , Id_Num_Div, Id_Num_Categ);

            PasilloUnEditCat List = new PasilloUnEditCat();
            List<CategoriaModel> Categoria = new List<CategoriaModel>();

            List<DivisionModel> Division = new List<DivisionModel>();

            List<PasilloUnLinea> Linea = new List<PasilloUnLinea>();

            List<PasilloUnCategModel> PasilloUnCateg = new List<PasilloUnCategModel>();

            List<PasilloUnLinea> PasilloUnLinea = new List<PasilloUnLinea>();



            if (!Soriana.FWK.FmkTools.DatosDB.IsNullOrEmptyDataSet(d))
            {
                if (!Soriana.FWK.FmkTools.DatosDB.IsNullOrEmptyDatatable(d.Tables[0]))
                {
                    List.Id_Num_PasilloTipo = d.Tables[0].Rows[0]["Id_Num_PasilloTipo"].ToString();
                    Division = ConvertTo<DivisionModel>(d.Tables[1]);
                    Categoria = ConvertTo<CategoriaModel>(d.Tables[2]);
                    Linea = ConvertTo<PasilloUnLinea>(d.Tables[3]);
                    PasilloUnCateg = ConvertTo<PasilloUnCategModel>(d.Tables[4]);
                }
            }

            List.Categoria = Categoria;
            List.Division = Division;
            List.Linea = Linea;
            List.PasilloUnCateg = PasilloUnCateg;

            return List;
        }
        #endregion

        #region Pass



        public ActionResult PassCan()



        {

            try

            {

                string pass = string.Empty;

                if (Session["Id_Num_UN"] != null)

                {

                    DataSet d = DALServicesM.GetPassCan(int.Parse(Session["Id_Num_UN"].ToString()));

                    if (!Soriana.FWK.FmkTools.DatosDB.IsNullOrEmptyDatatable(d.Tables[0]))

                    {

                        foreach (DataRow r in d.Tables[0].Rows)

                        {

                            ViewBag.pass = r["nom"].ToString();

                        }

                    }

                }

                else

                {

                    return RedirectToAction("Index", "Ordenes");

                }



                return View("PassCan/Index");

            }

            catch (Exception)

            {

                throw;

            }

        }



        [HttpPost]

        public JsonResult UpdatePassCancel(string PassCan)



        {

            try

            {

                string pass = string.Empty;

                if (Session["Id_Num_UN"] != null)

                {

                    DataSet d = DALServicesM.UpdPassCan(int.Parse(Session["Id_Num_UN"].ToString()), PassCan);

                    var result = new { Success = true, json = "OK" };



                    return Json(result, JsonRequestBehavior.AllowGet);

                }

                else

                {

                    var result = new { Success = false, json = "OKS" };

                    RedirectToAction("Index", "Ordenes");

                    return Json(result, JsonRequestBehavior.AllowGet);

                }

            }



            catch (Exception ex)

            {

                var result = new { Success = false, Message = ex.Message };

                return Json(result, JsonRequestBehavior.AllowGet);

            }



        }




        #endregion

        public List<T> ConvertTo<T>(DataTable datatable) where T : new()
        {

            List<T> Temp = new List<T>();

            try

            {

                List<string> columnsNames = new List<string>();

                foreach (DataColumn DataColumn in datatable.Columns)

                    columnsNames.Add(DataColumn.ColumnName);

                Temp = datatable.AsEnumerable().ToList().ConvertAll<T>(row => getObject<T>(row, columnsNames));

                return Temp;

            }

            catch

            {

                return Temp;

            }



        }

        public T getObject<T>(DataRow row, List<string> columnsName) where T : new()
        {

            T obj = new T();

            try

            {

                string columnname = "";

                string value = "";

                PropertyInfo[] Properties;

                Properties = typeof(T).GetProperties();

                foreach (PropertyInfo objProperty in Properties)

                {

                    columnname = columnsName.Find(name => name.ToLower() == objProperty.Name.ToLower());

                    if (!string.IsNullOrEmpty(columnname))

                    {

                        value = row[columnname].ToString();

                        if (!string.IsNullOrEmpty(value))

                        {

                            if (Nullable.GetUnderlyingType(objProperty.PropertyType) != null)

                            {

                                value = row[columnname].ToString().Replace("$", "").Replace(",", "");

                                objProperty.SetValue(obj, Convert.ChangeType(value, Type.GetType(Nullable.GetUnderlyingType(objProperty.PropertyType).ToString())), null);

                            }

                            else

                            {

                                value = row[columnname].ToString().Replace("%", "");

                                objProperty.SetValue(obj, Convert.ChangeType(value, Type.GetType(objProperty.PropertyType.ToString())), null);

                            }

                        }

                    }

                }

                return obj;

            }

            catch

            {

                return obj;

            }

        }
    }

}