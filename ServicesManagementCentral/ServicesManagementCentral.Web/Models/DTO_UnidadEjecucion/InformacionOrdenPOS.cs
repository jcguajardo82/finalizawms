//using Newtonsoft.Json;
////using Soriana.OMS.Ordenes.Common.Entities;
//using System.Collections.Generic;

//namespace Soriana.OMS.Ordenes.Common.DTO
//{
//    public class InformacionOrdenPOS
//    {
//        #region Public Constructors
//        public InformacionOrdenPOS()
//        {
//            OrderStatus = new OrderStatusPOS();
//            Products = new List<ProductPOS>();
//            MethodPayment = new MethodPaymentPOS();
//            Client = new ClientPOS();
//            Promotions = new List<PromotionPOS>();
//        }
//        #endregion
//        #region Public Properties
//        [JsonProperty("order-status", Order = 1)]
//        public OrderStatusPOS OrderStatus { get; set; }

//        [JsonProperty("products", Order = 2)]
//        public IList<ProductPOS> Products { get; set; }

//        [JsonProperty("method-payment", Order = 3)]
//        public MethodPaymentPOS MethodPayment { get; set; }

//        [JsonProperty("client", Order = 4)]
//        public ClientPOS Client { get; set; }

//        [JsonProperty("promotions", Order = 5)]
//        public IList<PromotionPOS> Promotions { get; set; }
//        #endregion
//    }
//}
