using ExcelDataReader;
using ServicesManagement.Web.Models;
using System;
using System.Collections.Generic;
using System.Data;
using System.IO;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using ServicesManagement.Web.Helpers;

namespace ServicesManagement.Web.Controllers
{
    public class OrdenesPorEmpacarController : Controller
    {
        // GET: OrdenesPorEmpacar
        public ActionResult Index()
        {
            return View();
        }
        [HttpPost]
        public ActionResult ImportFileTransPlazas(HttpPostedFileBase importFile)
        {
            if (importFile == null) return Json(new { Status = 0, Message = "No File Selected" });

            try
            {
                var fileData = GetDataFromFileOrdenes(importFile.InputStream);



                var dt = fileData.ToDataTable();


                //DALImpex.upCorpTms_Ins_TransportistaPlazas(dt);
                return Json(new { Status = 1, Message = "File Imported Successfully", list= fileData });
            }
            catch (Exception ex)
            {
                return Json(new { Status = 0, Message = ex.Message });
            }
        }
        [HttpPost]
        public ActionResult GetOrdenes()
        {
            try
            {
                List<OrdenPorEmpacarModel> lst = new List<OrdenPorEmpacarModel>();

                if (Session["lstOrdenesPorEmpacar"] != null)
                    lst = (List<OrdenPorEmpacarModel>)Session["lstOrdenesPorEmpacar"];

                return Json(new { Success = true, data = lst });
            }
            catch (Exception x)
            {
                var result = new { Success = false, Message = x.Message };
                return Json(result, JsonRequestBehavior.AllowGet);
            }
        }
        private List<OrdenPorEmpacarModel> GetDataFromFileOrdenes(Stream stream)
        {
            var List = new List<OrdenPorEmpacarModel>();
            try
            {
                using (var reader = ExcelReaderFactory.CreateReader(stream))
                {
                    var dataSet = reader.AsDataSet(new ExcelDataSetConfiguration
                    {
                        ConfigureDataTable = _ => new ExcelDataTableConfiguration
                        {
                            UseHeaderRow = true // To set First Row As Column Names    
                        }
                    });

                    if (dataSet.Tables.Count > 0)
                    {
                        var dataTable = dataSet.Tables[0];
                        foreach (DataRow objDataRow in dataTable.Rows)
                        {
                            if (objDataRow.ItemArray.All(x => string.IsNullOrEmpty(x?.ToString()))) continue;
                            List.Add(new OrdenPorEmpacarModel()
                            {
                                Cantidad = Convert.ToInt32(objDataRow[0].ToString()),
                                PK = objDataRow[1].ToString(),
                                Referencia = objDataRow[2].ToString(),
                                RazonSocial = objDataRow[3].ToString(),
                                Direccion1 = objDataRow[5].ToString(),
                                Direccion2 = objDataRow[5].ToString(),
                                Colonia = objDataRow[6].ToString(),
                                Poblacion = objDataRow[7].ToString(),
                                CP = objDataRow[8].ToString(),
                                Telefono = objDataRow[9].ToString(),
                                Contacto = objDataRow[10].ToString(),
                                TipoGuia = objDataRow[11].ToString(),
                                Vehiculo = objDataRow[12].ToString(),
                                Currier = objDataRow[13].ToString(),
                                Tienda = objDataRow[14].ToString(),
                                Receptor = objDataRow[15].ToString()
                            });
                        }
                    }
                }
            }
            catch (Exception)
            {
                throw;
            }
            Session["lstOrdenesPorEmpacar"] = List;
            return List;
        }
    }
}