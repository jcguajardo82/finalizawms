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
using System.Net;

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
        public ActionResult ImportFileOrdenes(HttpPostedFileBase importFile)
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
        public ActionResult Enviar()
        {
            try
            {

                if (Session["lstOrdenesPorEmpacar"] != null)
                    ConsumirWS();

                Session["lstOrdenesPorEmpacar"] = null;
                
                return Json(new { Status = 1, Message = "Successfully" });
            }
            catch (AggregateException ex)
            {
                return Json(new { Status = 0, Message = ex.Message });
            }
        }
        private void ConsumirWS()
        {
            List<OrdenPorEmpacarModel> lst = new List<OrdenPorEmpacarModel>();

            if (Session["lstOrdenesPorEmpacar"] != null)
            {
                lst = (List<OrdenPorEmpacarModel>)Session["lstOrdenesPorEmpacar"];
                var ordenes = lst.Select(x => x.Referencia).Distinct();

                foreach (var order in ordenes)
                {
                    var item = lst.Where(x => x.Referencia == order).FirstOrDefault();

                    //wsOrdenesPorEmpacar.UccList lstUcc = new wsOrdenesPorEmpacar.UccList();
                    string[] lstUcc = new string[30];
                    var uccs = lst.Where(x => x.Referencia == order).Select(x => x.PK);

                    //foreach(var ucc in uccs)
                    //{
                    //    lstUcc.Add(ucc);
                    //}
                    var count = 0;
                    foreach (var ucc in uccs)
                    {
                        lstUcc[count] = ucc;
                        count++;
                    }

                    wsOrdenesPorEmpacar2.Embarque embarque = new wsOrdenesPorEmpacar2.Embarque();
                    embarque.cantidad = item.Cantidad;
                    embarque.codigoPostal = int.Parse(item.CP);
                    embarque.colonia = item.Colonia;
                    embarque.contacto = item.Contacto;
                    embarque.direccion = item.Direccion1;
                    embarque.montoAsegurado = 0;
                    embarque.poblacion = item.Poblacion;
                    embarque.razonSocial = item.RazonSocial;
                    embarque.referencia2 = item.Referencia;
                    embarque.referencia3 = item.Direccion2;
                    embarque.referencia4 = item.Vehiculo;
                    embarque.referencia5 = item.Currier;
                    embarque.referencia6 = item.Tienda;
                    embarque.referencia7 = item.Receptor;
                    embarque.servicio = item.TipoGuia;
                    var tel = item.Telefono.Replace(" ", "");
                    embarque.telefono = double.Parse(tel);
                    embarque.uccList = lstUcc;

                    wsOrdenesPorEmpacar2.Embarques embarques = new wsOrdenesPorEmpacar2.Embarques();
                    embarques.Embarque = embarque;

                    wsOrdenesPorEmpacar2.EmbarqueRequest Request = new wsOrdenesPorEmpacar2.EmbarqueRequest();
                    Request.Embarques = embarques;
                    Request.siglasCliente = "SOR";
                    wsOrdenesPorEmpacar2.Soriana_WMS client = new wsOrdenesPorEmpacar2.Soriana_WMS();

                    System.Net.ServicePointManager.SecurityProtocol = SecurityProtocolType.Tls12 | SecurityProtocolType.Tls11 | SecurityProtocolType.Tls;

                    //client.Credentials = System.Net.CredentialCache.DefaultCredentials;
                    //client.PreAuthenticate = true;
                    //client.Credentials = new System.Net.NetworkCredential("t_juangch", "Agosto.2021");
                    //wsOrdenesPorEmpacar.GeneraEmbarqueResponse response = new wsOrdenesPorEmpacar.GeneraEmbarqueResponse();

                    var result = client.GeneraEmbarque(Request);

                }
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

                return Json(new { draw = 1, recordsFilter = lst.Count(), recordsTotal = lst.Count(), data = lst });
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