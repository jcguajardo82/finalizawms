using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Text;

namespace Soriana.OMS.Ordenes.Common.DTO
{
    public class InformacionSurtidor
    {
        #region Public Properties
        [JsonProperty("surtidor-id", Order = 1)]
        public int SurtidorID { get; set; }

        [JsonProperty("surtidor-name", Order = 2)]
        public string NombreSurtidor { get; set; }
        #endregion
    }
}
