using Newtonsoft.Json;

namespace Soriana.OMS.Ordenes.Common.DTO
{
    public class InformacionProductoSuministrado
    {
        #region Public Properties
        [JsonProperty("s-product-id", Order = 1)]
        public string IdentificadorProducto { get; set; }

        [JsonProperty("s-barcode", Order = 2)]
        public string CodigoBarra { get; set; }

        [JsonProperty("s-lineitem-text", Order = 3)]
        public string DescripcionArticulo { get; set; }

        [JsonProperty("s-quantity", Order = 4)]
        public double Cantidad { get; set; }

        [JsonProperty("s-price", Order = 5)]
        public double Precio { get; set; }

        [JsonProperty("s-observations", Order = 6)]
        public string Observaciones { get; set; }

        [JsonProperty("s-unit-measure", Order = 7)]
        public string UnidadMedida { get; set; }

        [JsonProperty("order-no", Order = 8)]
        public string NumeroOrden { get; set; }
        #endregion
    }
}
