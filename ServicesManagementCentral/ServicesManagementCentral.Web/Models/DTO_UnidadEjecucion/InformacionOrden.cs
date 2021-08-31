using Newtonsoft.Json;
using System.Collections.Generic;

namespace Soriana.OMS.Ordenes.Common.DTO
{
    public class InformacionOrden
    {
        #region Public Constructors
        public InformacionOrden()
        {
            Orden = new InformacionDetalleOrden();
            FormaPago = new InformacionFormaPago();
            Cliente = new InformacionCliente();
            Envio = new InformacionEnvio();
            ProductosSuministrar = new List<InformacionProductoSuministrar>();
            ProductosSuministrados = new List<InformacionProductoSuministrado>();
            DetallePago = new InformacionDetallePago();
            Expedidor = new InformacionExpedidor();
            Entrega = new InformacionEntrega();
            //OrdenPOS = new InformacionOrdenPOS();
            Surtidor = new InformacionSurtidor();
        }
        #endregion
        #region Public Properties
        [JsonProperty("order", Order = 1)]
        public InformacionDetalleOrden Orden { get; set; }

        [JsonProperty("payment", Order = 2)]
        public InformacionFormaPago FormaPago { get; set; }

        [JsonProperty("customer", Order = 3)]
        public InformacionCliente Cliente { get; set; }

        [JsonProperty("shipments", Order = 4)]
        public InformacionEnvio Envio { get; set; }

        [JsonProperty("product-lineitem-to-supply", Order = 5)]
        public IList<InformacionProductoSuministrar> ProductosSuministrar { get; set; }

        [JsonProperty("product-lineitem-assorted", Order = 6)]
        public IList<InformacionProductoSuministrado> ProductosSuministrados { get; set; }

        [JsonProperty("detail-payment", Order = 7)]
        public InformacionDetallePago DetallePago { get; set; }

        [JsonProperty("shipper", Order = 8)]
        public InformacionExpedidor Expedidor { get; set; }

        [JsonProperty("delivery", Order = 9)]
        public InformacionEntrega Entrega { get; set; }

        //[JsonProperty("orden-pos", Order = 10)]
        //public InformacionOrdenPOS OrdenPOS { get; set; }

        [JsonProperty("surtidor-orden", Order = 11)]
        public InformacionSurtidor Surtidor { get; set; }
        #endregion
    }
}
