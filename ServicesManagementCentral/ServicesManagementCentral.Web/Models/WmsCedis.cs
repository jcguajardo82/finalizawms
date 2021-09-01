using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace ServicesManagement.Web.Models
{
    public class WmsCedis
    {
    }

    public class OrdersCedis {
        public int OrderNo { get; set; }
        public bool EsPickingManual { get; set; }
        public int EstatusUnidadEjecucion { get; set; }
        public string UeNo { get; set; }
        public int Store { get; set; }
        public int SurtidorID { get; set; }
        public string NombreSurtidor { get; set; }
        public string Estatus { get; set; }

    }

    public class upCorpOms_Cns_UeNoSupplyProcess
    {
        public int OrderNo { get; set; }
        public string UeNo { get; set; }
        public int SKU { get; set; }
        public string EAN { get; set; }
        public string Descripcion { get; set; }
        public double Piezas { get; set; }
        public double Precio { get; set; }
        public double PrecioOrigen { get; set; }
        public string UnidadMedida { get; set; }
        public string PesoAsignado { get; set; }
        public string Observaciones { get; set; }
        public string TipoEnvio { get; set; }
        public bool Suplido { get; set; }

    }


    public class OrderDetailCap
    {
        public decimal ProductId { get; set; }
        public decimal NewQuantity { get; set; }
    }
}