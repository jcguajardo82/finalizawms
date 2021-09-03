using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace ServicesManagement.Web.Models
{
    public class OrdenPorEmpacarModel
    {
        public int Cantidad { get; set; }
        public string PK { get; set; }
        public string Referencia { get; set; }
        public string RazonSocial { get; set; }
        public string Direccion1 { get; set; }
        public string Direccion2 { get; set; }
        public string Colonia { get; set; }
        public string Poblacion { get; set; }
        public string CP { get; set; }
        public string Telefono { get; set; }
        public string Contacto { get; set; }
        public string TipoGuia { get; set; }
        public string Vehiculo { get; set; }
        public string Currier { get; set; }
        public string Tienda { get; set; }
        public string Receptor { get; set; }
    }
}