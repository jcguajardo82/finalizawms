using Newtonsoft.Json;

namespace Soriana.OMS.Ordenes.Common.DTO
{
    public class InformacionProductoSuministrar
    {
        #region Public Properties
        [JsonProperty("product-id", Order = 1)]
        public string IdentificadorProducto { get; set; }

        [JsonProperty("barcode", Order = 2)]
        public string CodigoBarra { get; set; }

        [JsonProperty("lineitem-text", Order = 3)]
        public string DescripcionArticulo { get; set; }

        [JsonProperty("quantity", Order = 4)]
        public double Cantidad { get; set; }

        [JsonProperty("price", Order = 5)]
        public double Precio { get; set; }

        [JsonProperty("observations", Order = 6)]
        public string Observaciones { get; set; }

        [JsonProperty("unit-measure", Order = 7)]
        public string UnidadMedida { get; set; }

        [JsonProperty("order-no", Order = 8)]
        public string NumeroOrden { get; set; }

        [JsonProperty("was-supplied", Order = 9)]
        public bool FueSuministrado { get; set; }
        #endregion
    }
}
