using RestSharp;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Net;
using System.Web;
using System.Web.Mvc;

namespace ServicesManagement.Web.Controllers
{
    public class ResponseBuscadorModel
    {

        //public string @search.score { get; set; }// 1.0,
        public string Barcode { get; set; }// public string 650240011351public string ,
        public string Sku { get; set; }// public string 1791346public string ,
        public string Description { get; set; }// public string Unesia Antimicotico Ung C/20 Grpublic string ,
        public string ExtendedDescription { get; set; }// public string public string ,
        public string SalesUnit { get; set; }// public string PCEpublic string ,
        public string UrlImage { get; set; }// public string https://edge.disstg.commercecloud.salesforce.com/dw/image/v2/BGBD_STG/on/demandware.static/-/Sites-soriana-grocery-master-catalog/default/dw4f7cd627/images/product/650240011351-A.jpgpublic string ,
        public string SellLimit { get; set; }// 100.0,
        public string Variants { get; set; }// public string public string ,
        public string AdditionalImages { get; set; }// public string public string ,
        public string Price { get; set; }// 86.9,
        public string PromotionalPrice { get; set; }// 0.0,
        public string PomotionalPriceCode { get; set; }// public string public string ,
        public string arrivals { get; set; }// public string public string ,
        public string beefCuts { get; set; }// public string public string ,
        public string capacity { get; set; }// public string public string ,
        public string CapacityInNumberOfPeople { get; set; }// null,
        public string Color { get; set; }// public string public string ,
        public string combo { get; set; }// public string Color 21public string ,
        public string Company { get; set; }// public string Company 6public string ,
        public string Conectivity { get; set; }// null,
        public string Country { get; set; }// public string public string ,
        public string FactorConversion { get; set; }// null,
        public string Finish { get; set; }// public string public string ,
        public string fit { get; set; }// public string public string ,
        public string fixDiscount { get; set; }// public string public string ,
        public string flavor { get; set; }// public string public string ,
        public string HealthApplication { get; set; }// public string public string ,
        public string HomeDelivery { get; set; }// public string public string ,
        public string InstorePickup { get; set; }// public string public string ,
        public string LimiteVenta { get; set; }// public string public string ,
        public string mattressSize { get; set; }// public string public string ,
        public string netContent { get; set; }// public string 16public string ,
        public string NumberOfCameras { get; set; }// public string public string ,
        public string numberOfHDMIConnections { get; set; }// public string public string ,
        public string onlineExclusive { get; set; }// public string public string ,
        public string operatingSystem { get; set; }// public string public string ,
        public string percentDiscount { get; set; }// public string public string ,
        public string PermiteFraccion { get; set; }// null,
        public string pieceCount { get; set; }// public string public string ,
        public string Platform { get; set; }// public string public string ,
        public string priceRange { get; set; }// public string public string ,
        public string processor { get; set; }// public string public string ,
        public string ProductForm { get; set; }// public string public string ,
        public string projectionDistance { get; set; }// public string public string ,
        public string RecomendedCapacity { get; set; }// public string public string ,
        public string recommendedSpecies { get; set; }// public string public string ,
        public string redeemPointsDiscount { get; set; }// public string public string ,
        public string RedeemPointsFree { get; set; }// public string public string ,
        public string region { get; set; }// public string Región de cultivo|Valor 6public string ,
        public string resolution { get; set; }// public string public string ,
        public string rin { get; set; }// public string public string ,
        public string Season { get; set; }// public string public string ,
        public string ShadeRange { get; set; }// public string public string ,
        public string Size { get; set; }// public string public string ,
        public string sizeNumber { get; set; }// public string 6public string ,
        public string sizesizeNumber { get; set; }// public string public string ,
        public string sleeves { get; set; }// public string public string ,
        public string speed { get; set; }// public string public string ,
        public string spice { get; set; }// public string public string ,
        public string Stage { get; set; }// public string public string ,
        public string stateOfReadiness { get; set; }// public string public string ,
        public string storageCapacity { get; set; }// public string public string ,
        public string SuggestedAge { get; set; }// public string public string ,
        public string SurtidoAlmacen { get; set; }// public string public string ,
        public string SurtidoTienda { get; set; }// public string public string ,
        public string technology { get; set; }// public string technology 6public string ,
        public string UnidadConversion { get; set; }// public string public string ,
        public string UnidadVenta { get; set; }// public string public string ,
        public string varietal { get; set; }// public string public string ,
        public string weight { get; set; }// public string public string ,
        public CategoryModel Category { get; set; }// {

        public BrandModel Brand { get; set; }
        public List<PromotionsModels> Promotions { get; set; }
        public string ConversionRule { get; set; }// null


    }

    public class CategoryModel
    {
        public string CategoryId { get; set; }// public string cuidado-de-los-piespublic string ,
        public string CategoryDescription { get; set; }// public string Cuidado de los piespublic string     
    }

    public class BrandModel
    {

        public string BrandId { get; set; }// public string G867public string ,
        public string BrandDescription { get; set; }// public string UNESIApublic string 
    }

    public class PromotionsModels
    {
        public string Id { get; set; }// public string 100657198public string ,
        public string Badged { get; set; }// public string u2:'dobles'|'Tarjetas Participantes'public string         
    }

    public class OrderFacts_UEModel
    {
        public Int32 OrderNo { get; set; }
        public Int64 CnscOrder { get; set; }
        public Int32 StoreNum { get; set; }
        public String UeNo { get; set; }
        public Byte StatusUe { get; set; }
        public DateTime OrderDate { get; set; }
        public TimeSpan OrderTime { get; set; }
        public DateTime OrderDeliveryDate { get; set; }
        public TimeSpan OrderDeliveryTime { get; set; }
        public String CreatedBy { get; set; }
        public String DeliveryType { get; set; }
        public String UeType { get; set; }
        public Boolean IsPickingManual { get; set; }
        public Int32 CustomerNo { get; set; }
        public String CustomerName { get; set; }
        public String Phone { get; set; }
        public String Address1 { get; set; }
        public String Address2 { get; set; }
        public String City { get; set; }
        public String StateCode { get; set; }
        public String PostalCode { get; set; }
        public String Reference { get; set; }
        public String NameReceives { get; set; }
        public Decimal Total { get; set; }
        public Int32 NumPoints { get; set; }
        public Int32 NumCashier { get; set; }
        public Int32 NumPos { get; set; }
        public String TransactionId { get; set; }
        public String MethodPayment { get; set; }
        public String CardNumber { get; set; }
        public String ShipperName { get; set; }
        public DateTime ShippingDate { get; set; }
        public String TransactionNo { get; set; }
        public String TrackingNo { get; set; }
        public Int32 NumBags { get; set; }
        public Int32 NumCoolers { get; set; }
        public Int32 NumContainers { get; set; }
        public String Terminal { get; set; }
        public DateTime DeliveryDate { get; set; }
        public TimeSpan DeliveryTime { get; set; }
        public String IdReceive { get; set; }
        public String NameReceive { get; set; }
        public String Comments { get; set; }
        public Int32 Id_Supplier { get; set; }
        public DateTime PickingDateEnd { get; set; }
        public TimeSpan PickingTimeEnd { get; set; }
        public DateTime PaymentDateEnd { get; set; }
        public TimeSpan PaymentTimeEnd { get; set; }
        public DateTime PackingDate { get; set; }
        public TimeSpan PackingTime { get; set; }
        public DateTime CancelOrderDate { get; set; }
        public TimeSpan CancelOrderTime { get; set; }
        public DateTime CarrierDate { get; set; }
        public TimeSpan CarrierTime { get; set; }
        public String CancelCause { get; set; }
        public Int32 idOwner { get; set; }
        public Boolean BitRMA { get; set; }
        public Int32 OrderRMA { get; set; }
        public String UeNoRMA { get; set; }
        public Boolean BitBigT { get; set; }
        public Int16 SplitMethod { get; set; }
        public Int32 OriginType { get; set; }
        public Int64 idSupplierWH { get; set; }
        public Int64 idSupplierWHCode { get; set; }
        public String SupplierName { get; set; }
        public String SupplierWHName { get; set; }
        public Int32 CarrierIDCotize { get; set; }
        public Decimal CarrierCostCotize { get; set; }
        public Int32 CarrierIDFinal { get; set; }
        public Decimal CarrierCostFinal { get; set; }
        public DateTime WHPickedDate { get; set; }
        public TimeSpan WHPickedTime { get; set; }
        public DateTime ShippingEstDate { get; set; }
        public TimeSpan ShippingEstTime { get; set; }
        public String ConsignmentType { get; set; }
    }



    public class CallCenterController : Controller
    {
        // GET: CallCenter
        public ActionResult CallCenter()
        {
            GetServicios();

            return View();
        }

        public void GetServicios()
        {

            System.Data.DataSet ds = new DataSet();

            var _ConnectionString = Environment.GetEnvironmentVariable("ConnectionStrings:MercurioDB");
            _ConnectionString = "Server=tcp:srvsqlmercurio.database.windows.net,1433;Initial Catalog=MercurioDesaDB;Persist Security Info=False;User ID=t_eliseogr;Password=El1530%.*314;MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;";
            _ConnectionString = "Server=tcp:srvsqlmercurioqa.database.windows.net,1433;Initial Catalog=MercurioQaDB;Persist Security Info=False;User ID=t_eliseogr;Password=W3rcur10!QA;MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;";

            using (System.Data.SqlClient.SqlConnection cnn = new System.Data.SqlClient.SqlConnection(_ConnectionString))
            {
                using (System.Data.SqlClient.SqlCommand cmd = new System.Data.SqlClient.SqlCommand("up_CorpPP_sel_ProcessPaymentWeb", cnn))
                {

                    cmd.CommandType = CommandType.StoredProcedure;


                    using (System.Data.SqlClient.SqlDataAdapter dataAdapter = new System.Data.SqlClient.SqlDataAdapter(cmd))
                        dataAdapter.Fill(ds);


                    Session["listaServicios"] = ds;

                }
            }

        }

        public JsonResult TiendasCP(string cp)
        {
            try
            {
                System.Data.DataSet ds = new DataSet();

                var _ConnectionString = Environment.GetEnvironmentVariable("ConnectionStrings:MercurioDB");
                _ConnectionString = "Server=tcp:srvsqlmercurio.database.windows.net,1433;Initial Catalog=MercurioDesaDB;Persist Security Info=False;User ID=t_eliseogr;Password=El1530%.*314;MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;";
                //_ConnectionString = "Server=tcp:srvsqlmercurioqa.database.windows.net,1433;Initial Catalog=MercurioQaDB;Persist Security Info=False;User ID=t_eliseogr;Password=W3rcur10!QA;MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;";

                using (System.Data.SqlClient.SqlConnection cnn = new System.Data.SqlClient.SqlConnection(_ConnectionString))
                {
                    using (System.Data.SqlClient.SqlCommand cmd = new System.Data.SqlClient.SqlCommand("up_CorpCallCenter_sel_UNByCp", cnn))
                    {
                        
                        cmd.CommandType = CommandType.StoredProcedure;

                        SqlParameter param;
                        
                        param = cmd.Parameters.Add("@Num_CP", SqlDbType.Int);
                        param.Value = cp;


                        using (System.Data.SqlClient.SqlDataAdapter dataAdapter = new System.Data.SqlClient.SqlDataAdapter(cmd))
                            dataAdapter.Fill(ds);


                        Session["listaServicios"] = ds;

                    }
                }

                List<object> devolver = new List<object>();
                devolver.Add(new { id = 0, nombre = "Todas..." });

                if (ds != null)
                {
                    if (ds.Tables.Count > 0)
                    {
                        foreach (DataRow r in ds.Tables[0].Rows)
                        {

                            devolver.Add(new
                            {
                                id = r[0].ToString().Trim(),
                                nombre = r[1].ToString()
                            }
                                   );
                        }
                    }
                }


                return Json(devolver, JsonRequestBehavior.AllowGet);
                //return Json("", JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                var result = new { Success = false, Message = ex.Message, urlRedirect = "" };
                return Json(result, JsonRequestBehavior.AllowGet);
            }

        }


        public JsonResult GetProduct(string product)
        {
            try
            {
                System.Net.ServicePointManager.SecurityProtocol = SecurityProtocolType.Tls12;

                //var client = new RestClient("http://localhost:7071/api/Buscador_Producto?productId="+ product.Trim());
                var client = new RestClient("https://sorianacallcenterbuscadorqa.azurewebsites.net/api/Buscador_Producto?productId=" + product.Trim());

                client.Timeout = -1;
                var request = new RestRequest(Method.POST);
                IRestResponse response = client.Execute(request);
                Console.WriteLine(response.Content);

                List<ResponseBuscadorModel> response1 = Newtonsoft.Json.JsonConvert.DeserializeObject<List<ResponseBuscadorModel>>(response.Content);

                var result = new { Success = false, data= response1 };
                return Json(result, JsonRequestBehavior.AllowGet);
                //return Json("", JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                var result = new { Success = false, Message = ex.Message, urlRedirect = "" };
                return Json(result, JsonRequestBehavior.AllowGet);
            }

        }


        public List<OrderFacts_UEModel> getRams() {

            //var client = new RestClient("http://localhost:7071/api/GetRAM");
            var client = new RestClient("https://sorianacallcentergetramqa.azurewebsites.net/api/GetRAM");

            client.Timeout = -1;
            var request = new RestRequest(Method.GET);
            IRestResponse response = client.Execute(request);
            Console.WriteLine(response.Content);

            List<OrderFacts_UEModel> lista = Newtonsoft.Json.JsonConvert.DeserializeObject<List<OrderFacts_UEModel>>(response.Content);

            return lista;
        }


        public ActionResult Historial()
        {
            Session["listaRMAS"] = getRams();

            return View();
        }

        public ActionResult ConsultaDetalle(string order)
        {

            if (string.IsNullOrEmpty(order))
            {
                return RedirectToAction("OrdenSeleccionada", "Ordenes");
            }
            else if (Session["Id_Num_UN"] == null)
            {
                return RedirectToAction("Index", "Ordenes");
            }
            else

            {
                Session["OrderSelected"] = DALServicesM.GetOrdersByOrderNo(order);
            }
            return View();

        }

        public ActionResult RMA()
        {
            return View();
        }

        public ActionResult EstatusRMA()
        {
            return View();
        }
    }
}