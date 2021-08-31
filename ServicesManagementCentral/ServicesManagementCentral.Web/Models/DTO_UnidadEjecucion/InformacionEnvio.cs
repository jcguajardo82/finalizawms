using Newtonsoft.Json;

namespace Soriana.OMS.Ordenes.Common.DTO
{
    public class InformacionEnvio
    {
        #region Public Properties
        [JsonProperty("address1", Order = 1)]
        public string Domicilio { get; set; }

        [JsonProperty("address2", Order = 2)]
        public string Colonia { get; set; }

        [JsonProperty("city", Order = 3)]
        public string Ciudad { get; set; }

        [JsonProperty("state-code", Order = 4)]
        public string CodigoEstado { get; set; }

        [JsonProperty("postal-code", Order = 5)]
        public string CodigoPostal { get; set; }

        [JsonProperty("reference", Order = 6)]
        public string Referencia { get; set; }

        [JsonProperty("name-receives", Order = 7)]
        public string NombreRecibe { get; set; }
        #endregion
    }
}
