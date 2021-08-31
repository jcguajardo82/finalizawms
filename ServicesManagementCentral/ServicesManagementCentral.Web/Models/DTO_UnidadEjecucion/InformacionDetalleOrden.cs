using Newtonsoft.Json;

namespace Soriana.OMS.Ordenes.Common.DTO
{
    public class InformacionDetalleOrden
    {
        #region Public Constructors
        public InformacionDetalleOrden()
        {
            //OrdenesSalesforce = new List<InformacionOrdenSalesforce>();
        }
        #endregion
        #region Public Properties
        [JsonProperty("order-no", Order = 1)]
        public string NumeroOrden { get; set; }

        /// <summary>
        /// TODO: Validar cual es la definicion de la estructura order de SalesForce
        /// Contiene la estructura completa de la orden de Salesforce
        /// </summary>
        //[JsonProperty("order", Order = 2)]
        //public IList<InformacionOrdenSalesforce> OrdenesSalesforce { get; set; }

        [JsonProperty("order", Order = 2)]
        public string XMLOrden { get; set; }

        [JsonProperty("store-num", Order = 3)]
        public int NumeroTienda { get; set; }

        [JsonProperty("ue-no", Order = 4)]
        public string NumeroUnidadEjecucion { get; set; }

        [JsonProperty("status-ue", Order = 5)]
        public string EstatusUnidadEjecucion { get; set; }

        [JsonProperty("order-date", Order = 6)]
        public string FechaHoraCreacion { get; set; }

        [JsonProperty("order-delivery-date", Order = 7)]
        public string FechaHoraEntrega { get; set; }

        [JsonProperty("created-by", Order = 8)]
        public string Origen { get; set; }

        [JsonProperty("delivery-type", Order = 9)]
        public string TipoEntrega { get; set; }

        [JsonProperty("ue-type", Order = 10)]
        public string TipoUnidadEjecucion { get; set; }

        [JsonProperty("additionalPoints", Order = 11)]
        public string PuntosAdicionales { get; set; }

        [JsonProperty("redeemedPoints", Order = 12)]
        public string PuntosRedencion { get; set; }

        /// <summary>
        /// Indica si se requiere consumir el servicio de TIK para determinar el picking, es decir si fue manual o automatico
        /// En Picking Finaliza Automatico: Consulta Tik
        /// En Picking Finaliza Manual: Automaticamente pasa a cobro
        /// </summary>
        [JsonProperty("ismanualpicking", Order = 13)]
        public bool EsPickingManual { get; set; }
        #endregion
    }
}
