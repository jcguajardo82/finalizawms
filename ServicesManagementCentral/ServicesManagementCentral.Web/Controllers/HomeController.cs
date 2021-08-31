using Newtonsoft.Json;
using ServicesManagement.Web.DAL;
using ServicesManagement.Web.Helpers;
using ServicesManagement.Web.Models;
using Soriana.OMS.Ordenes.Common.DTO;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Net;
using System.Web;
using System.Web.Mvc;
using System.Web.Script.Serialization;

namespace ServicesManagement.Web.Controllers
{
    /// <summary>
    /// home controller
    /// </summary>
    public class HomeController : Controller
    {
        public HomeController() { }

        public ActionResult Index()
        {

            int OrderId = 0;
            if (Request.QueryString["order"] != null)
            {
                OrderId = int.Parse(Request.QueryString["order"].ToString());

                var ds = (DALCallCenter.OrderFacts_ArticulosRMA(OrderId));

                ViewBag.Order = DataTableToModel.ConvertTo<Order>(ds.Tables[0]).FirstOrDefault();
                ViewBag.Products = DataTableToModel.ConvertTo<Product>(ds.Tables[1]);
                ViewBag.Detail = DataTableToModel.ConvertTo<Detail>(ds.Tables[2]).FirstOrDefault();
            }

            return View();
        }


        public ActionResult Cedis()
        {
            ViewBag.Cedis = DataTableToModel.ConvertTo<OrdersCedis>(DALWmsCedis.upCorpOms_Cns_OrdersBySupplyWMS().Tables[0]);

            return View();
        }

        public ActionResult GetCedis()
        {
            try
            {
                var list = DataTableToModel.ConvertTo<OrdersCedis>(DALWmsCedis.upCorpOms_Cns_OrdersBySupplyWMS().Tables[0]);
                var result = new { Success = true, resp = list };
                return Json(result, JsonRequestBehavior.AllowGet);
            }
            catch (Exception x)
            {
                var result = new { Success = false, Message = x.Message };
                return Json(result, JsonRequestBehavior.AllowGet);
            }
        }

        public ActionResult GetCedisDetalle(string UeNo, int OrderNo)
        {
            try
            {
                var list = DataTableToModel.ConvertTo<upCorpOms_Cns_UeNoSupplyProcess>(DALWmsCedis.upCorpOms_Cns_UeNoSupplyProcess(UeNo, OrderNo).Tables[0]);
                var result = new { Success = true, resp = list };
                return Json(result, JsonRequestBehavior.AllowGet);
            }
            catch (Exception x)
            {
                var result = new { Success = false, Message = x.Message };
                return Json(result, JsonRequestBehavior.AllowGet);
            }
        }

        [HttpPost]
        public ActionResult Enviar(List<OrderDetailCap> Products, string UeNo, int OrderNo)
        {
            try
            {
                //var list = DataTableToModel.ConvertTo<upCorpOms_Cns_UeNoSupplyProcess>(DALWmsCedis.upCorpOms_Cns_UeNoSupplyProcess(UeNo, OrderNo).Tables[0]);



                string apiUrl = System.Configuration.ConfigurationManager.AppSettings["api_FinalizarSurtido"];

                var orden = DataTableToModel.ConvertTo<OrdersCedis>(DALWmsCedis.upCorpOms_Cns_OrdersBySupplyWMS_UeNo(UeNo).Tables[0]).FirstOrDefault();



                string status = orden.EstatusUnidadEjecucion.ToString()
                    , store = orden.Store.ToString();
               
                //metodo mio
                InformacionOrden o = new InformacionOrden();

                o.Orden = new InformacionDetalleOrden();
                o.Orden.NumeroOrden = OrderNo.ToString();
                o.Orden.EsPickingManual = false;
                o.Orden.EstatusUnidadEjecucion = "0";
                o.Orden.NumeroUnidadEjecucion = UeNo;
                o.Orden.NumeroTienda = Convert.ToInt32(store);
                o.Surtidor = new InformacionSurtidor();
                o.Surtidor.SurtidorID = orden.SurtidorID;
                o.Surtidor.NombreSurtidor = orden.NombreSurtidor; 

                var prodcuts = DataTableToModel.ConvertTo<upCorpOms_Cns_UeNoSupplyProcess>(DALWmsCedis.upCorpOms_Cns_UeNoSupplyProcess(UeNo, OrderNo).Tables[0]);

                foreach (var item in Products)
                {
                    var a = new InformacionProductoSuministrado();

                    var p = prodcuts.Where(x => x.SKU.ToString() == item.ProductId.ToString()).ToList();


                    a.IdentificadorProducto = p[0].SKU.ToString();                              // Product-ID
                    a.CodigoBarra = p[0].EAN;                                                   // BarCode
                    a.DescripcionArticulo = p[0].Descripcion;                                   // Product-Name
                    a.Cantidad = Convert.ToDouble(item.NewQuantity);//p[0].Piezas;                                                   // Quantity

                    a.Precio = p[0].Precio;                                                     // Price
                    a.Observaciones = p[0].Observaciones;                                       // Observations
                    a.UnidadMedida = p[0].UnidadMedida.Length == 0 ? " " : p[0].UnidadMedida;    // UnitMeasure
                    a.NumeroOrden = p[0].OrderNo.ToString();                                    // OrderNo
                    //  a.FueSuministrado = true;
                    //  a.Cantidad = p[0].Piezas;

                    o.ProductosSuministrados.Add(a);
                }



                string json2 = string.Empty;
                JavaScriptSerializer js = new JavaScriptSerializer();
                //json2 = js.Serialize(o);


                json2 = JsonConvert.SerializeObject(o);

                js = null;

                Soriana.FWK.FmkTools.LoggerToFile.WriteToLogFile(Soriana.FWK.FmkTools.LogModes.LogError, Soriana.FWK.FmkTools.LogLevel.INFO, "in_data: " + json2, false, null);

                Soriana.FWK.FmkTools.LoggerToFile.WriteToLogFile(Soriana.FWK.FmkTools.LogModes.LogError, Soriana.FWK.FmkTools.LogLevel.INFO, "Request: " + apiUrl, false, null);

                System.Net.ServicePointManager.SecurityProtocol = SecurityProtocolType.Tls12;

                Soriana.FWK.FmkTools.RestResponse r = Soriana.FWK.FmkTools.RestClient.RequestRest(Soriana.FWK.FmkTools.HttpVerb.POST, System.Configuration.ConfigurationSettings.AppSettings["api_FinalizarSurtido"], "", json2);


                if (r.code != "00")
                {
                    throw new Exception(r.message);
                }

                var result = new { Success = true, Message = "Alta exitosa" };


                return Json(result, JsonRequestBehavior.AllowGet);
            }
            catch (Exception x)
            {
                var result = new { Success = false, Message = x.Message };
                return Json(result, JsonRequestBehavior.AllowGet);
            }

        }

    }
}