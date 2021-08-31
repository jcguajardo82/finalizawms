using Newtonsoft.Json;
using ServicesManagementCentral.Web.Controllers.Api;
using System.Web;
using System.Web.Mvc;

namespace ServicesManagement.Web.Controllers
{
    /// <summary>
    /// home controller
    /// </summary>
    public class BaseController : Controller
    {
        public LoginViewModel Login { get; set; }
        public HttpContext _httpContext;
        public BaseController(HttpContext _context)
        {
            _httpContext = _context;
            GetLogin();
            ViewBag.Login = Login;
        }

        public LoginViewModel GetLogin()
        {

            object objLogin = _httpContext.Session["login"];
            if (objLogin == null)
            {
                Login = null;
            }
            else
            {
                string jsonLogin = objLogin.ToString();
                Login = JsonConvert.DeserializeObject<LoginViewModel>(jsonLogin);

                //object objJsonImpersonate = _httpContext.Session["jsonImpersonate"];
                //if (objJsonImpersonate != null)
                //{
                //    _httpContext.Session.Add("jsonImpersonate", jsonLogin);
                //}
                //else
                //{
                //    string jsonImpersonate = objJsonImpersonate.ToString();

                //}


                //byte[] bytesJsonLogin = Encoding.UTF8.GetBytes(jsonLogin);
                //jsonLogin = Convert.ToBase64String(bytesJsonLogin);
                //_httpContext.Session.Add("jsonImpersonate", jsonLogin);
                
            }

            //var authData = string.Format("{0}:{1}", Login.Username, Login.Password);
            //var authHeaderValue = Convert.ToBase64String(Encoding.UTF8.GetBytes(authData));
            //Session["srvCredentials"] = authHeaderValue;

            return Login;
        }
    }
}