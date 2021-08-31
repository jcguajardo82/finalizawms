using Newtonsoft.Json;

namespace Soriana.OMS.Ordenes.Common.DTO
{
    public class InformacionCliente
    {
        #region Public Properties
        [JsonProperty("customer-no", Order = 1)]
        public string NumeroCliente { get; set; }

        [JsonProperty("customer-name", Order = 2)]
        public string NombreCliente { get; set; }

        [JsonProperty("phone", Order = 3)]
        public string Telefono { get; set; }
        #endregion
    }
}
