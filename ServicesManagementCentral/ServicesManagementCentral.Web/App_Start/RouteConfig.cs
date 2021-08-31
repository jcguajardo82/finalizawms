using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Routing;

namespace ServicesManagement.Web
{
    /// <summary>
    /// Configura el ruteo
    /// </summary>
    public class RouteConfig
    {
        /// <summary>
        /// Registra la manera en como se manajeran las rutas
        /// </summary>
        /// <param name="routes">RouteCollection object</param>
        public static void RegisterRoutes(RouteCollection routes)
        {
            routes.IgnoreRoute("{resource}.axd/{*pathInfo}");

            routes.MapRoute(
                name: "Default",
                url: "{controller}/{action}/{id}",
                defaults: new { controller = "Home", action = "Cedis", id = UrlParameter.Optional }
                //defaults: new { controller = "Home", action = "Index", id = UrlParameter.Optional }
                //defaults: new { controller = "Ordenes", action = "Index", id = UrlParameter.Optional }
            );
        }
    }
}
