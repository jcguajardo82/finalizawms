using System.Web.Http;
using System.Net.Http.Headers;
using System.Linq;

namespace ServicesManagementCentral.Web.Controllers.Api
{
    /// <summary>
    /// Api Base Controller
    /// </summary>
    public class ApiBaseController : ApiController
    {
        public string GetJsonImpersonate(HttpRequestHeaders RequestHeader)
        {
            string jsonImpersonate = "";

            if (RequestHeader.Contains("X-JsonImpersonate"))
            {
                jsonImpersonate = RequestHeader.GetValues("X-JsonImpersonate").First();
            }
            return jsonImpersonate;
        }
    }
}