using Newtonsoft.Json;

namespace Soriana.OMS.Ordenes.Common.DTO
{
    public class InformacionEntrega
    {
        #region Public Properties
        [JsonProperty("delivery-date", Order = 1)]
        public string FechaEntrega { get; set; }

        [JsonProperty("id-receive", Order = 2)]
        public string IdentificadorQuienRecibe { get; set; }

        [JsonProperty("name-receive", Order = 3)]
        public string NombreQuienRecibe { get; set; }

        [JsonProperty("comments", Order = 4)]
        public string Comentarios { get; set; }

        [JsonProperty("delivered-order", Order = 5)]
        public bool OrdenEntregada { get; set; }
        #endregion
    }
}
