using Newtonsoft.Json;
using System;
using System.Net;
using System.Threading.Tasks;
using System.Web.Http;
using System.Web.Http.Cors;

namespace ServicesManagementCentral.Web.Controllers.Api
{
    public class LoginViewModel
    {
        public string Username { get; set; }
        public string Password { get; set; }
        public string Domain { get; set; }
    }

    public class ResponseViewModel
    {
        /// <summary>
        /// Any data response
        /// </summary>
        [JsonProperty("data")]
        public dynamic Data { get; set; }

        /// <summary>
        /// The code of response
        /// </summary>
        [JsonProperty("code")]
        public int Code { get; set; }

        /// <summary>
        /// The message response
        /// </summary>
        [JsonProperty("message")]
        public string Message { get; set; }

        public ResponseViewModel()
        {

        }
        public ResponseViewModel(int code, string message)
        {
            this.Code = code;
            this.Message = message;
        }
        public ResponseViewModel(int code, string message, dynamic data)
        {
            this.Code = code;
            this.Message = message;
            this.Data = data;
        }
    }

    /// <summary>
    /// Administra los security de windows
    /// </summary>
    [RoutePrefix("api/Security")]
    [EnableCors(origins: "*", headers: "*", methods: "*")]
    public class SecurityController : ApiController
    {
        
        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="securityManager">The interface SecuritysManager.</param>
        public SecurityController()
        {
        }

        /// <summary>
        /// Login with user and password
        /// </summary>
        /// <response code="200">Returns the Security ViewModel</response>
        /// <response code="404">If the Security doesn´t exits</response>
        /// <response code="500">If server error exists</response>
        [HttpGet]
        public async Task<IHttpActionResult> Login([FromUri] LoginViewModel input )
        {
            try
            {
                //ResponseViewModel results =  await _securityManager.LoginActiveDirectoryAsync(input);
                return Content(HttpStatusCode.OK, "");

            }
            catch (InvalidOperationException ex)
            {
                return Content(HttpStatusCode.InternalServerError, new ResponseViewModel(500, "Ocurrio un problema al realizar la petición.", ex));
            }
            catch (Exception ex)
            {
                return Content(HttpStatusCode.InternalServerError, new ResponseViewModel(500, "Ocurrio un problema al realizar la petición.", ex));
            }
        }
    }
}