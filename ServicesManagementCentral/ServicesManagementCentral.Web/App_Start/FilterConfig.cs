using System.Web;
using System.Web.Mvc;

namespace ServicesManagement.Web
{
    /// <summary>
    /// Configura los filtros
    /// </summary>
    public class FilterConfig
    {
        /// <summary>
        /// Registra los filtros
        /// </summary>
        /// <param name="filters">GlobalFilterCollection object</param>
        public static void RegisterGlobalFilters(GlobalFilterCollection filters)
        {
            filters.Add(new HandleErrorAttribute());
        }
    }
}
