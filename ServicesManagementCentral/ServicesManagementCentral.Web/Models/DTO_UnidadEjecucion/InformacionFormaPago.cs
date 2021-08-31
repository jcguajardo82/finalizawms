using Newtonsoft.Json;

namespace Soriana.OMS.Ordenes.Common.DTO
{
    public class InformacionFormaPago
    {
        #region Public Constructors
        ~InformacionFormaPago()
        {
            //if (NumeroTarjeta != null)
            //    NumeroTarjeta.Dispose();
        }
        #endregion
        #region Public Properties
        [JsonProperty("method-payment", Order = 1)]
        public string FormaPago { get; set; }

        [JsonProperty("card-number", Order = 2)]
        //SecureString
        public string NumeroTarjeta { get; set; }
        #endregion
    }
}
