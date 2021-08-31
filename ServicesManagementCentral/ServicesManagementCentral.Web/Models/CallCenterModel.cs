using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace ServicesManagement.Web.Models
{
    public class CallCenterModel
    {
       
    }

    public class Order {
        public string orderId { get; set; }
        public string OrderNo { get; set; }
        public DateTime OrderDate { get; set; }
        public string OrderTime { get; set; }
        public DateTime OrderDeliveryDate { get; set; }
        public string OrderDeliveryTime { get; set; }
       
    }
    public class Product {

        public string ProductName { get; set; }
        public string Observations { get; set; }
        public decimal Quantity { get; set; }
        public decimal Total { get; set; }
        public decimal PosPriceNormalSale { get; set; }
        public decimal PosPriceOfferSale { get; set; }
        public string ArticuloFoto { get; set; }
    }

    public class Detail {
        public string CustomerName { get; set; }
        public string Address1 { get; set; }
        public string Address2 { get; set; }
        public string City { get; set; }
        public string StateCode { get; set; }
        public string PostalCode { get; set; }
        public string CountryCode { get; set; }
        public string Phone { get; set; }
        public string NameReceive { get; set; }
        public decimal Total { get; set; }
        public string MethodPayment { get; set; }
        public int MethodPaymentID { get; set; }
        public decimal CashPay { get; set; }
        public decimal VouchersPay { get; set; }
        public string DeliveryAddress { get; set; }

    }
}