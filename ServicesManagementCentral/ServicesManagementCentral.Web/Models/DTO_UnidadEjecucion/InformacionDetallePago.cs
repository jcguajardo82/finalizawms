using Newtonsoft.Json;

namespace Soriana.OMS.Ordenes.Common.DTO
{
    public class InformacionDetallePago
    {
        #region Public Properties
        [JsonProperty("total", Order = 1)]
        public double Total { get; set; }

        [JsonProperty("num-points", Order = 2)]
        public int NumeroPuntos { get; set; }

        [JsonProperty("num-cashier", Order = 3)]
        public int NumeroCajero { get; set; }

        [JsonProperty("num-pos", Order = 4)]
        public int NumeroPosicion { get; set; }

        [JsonProperty("transaction-id", Order = 5)]
        public int IdentificadorTransaccion { get; set; }
        #endregion
    }
}
