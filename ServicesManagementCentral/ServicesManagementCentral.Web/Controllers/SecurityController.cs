
using Newtonsoft.Json;
using ServicesManagementCentral.Web.Controllers.Api;
using System;
using System.Configuration;
using System.Text;
using System.Web.Mvc;

namespace ServicesManagement.Web.Controllers
{
    /// <summary>
    /// Security controller
    /// </summary>
    public class SecurityController : Controller
    {
        
        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="securityManager">The interface SecuritysManager.</param>
        public SecurityController()
        {
        }

        /// <summary>
        /// login page
        /// </summary>
        public ActionResult Login(string MessageLogin="")
        {
            ViewBag.MessageLogin = MessageLogin;
            return View();
        }


        /// <summary>
        /// Login with user and password
        /// </summary>
        /// <response code="200">Returns the Security ViewModel</response>
        /// <response code="404">If the Security doesn´t exits</response>
        /// <response code="500">If server error exists</response>
        public ActionResult DoLogin( LoginViewModel input)
        {
            ViewBag.MessageLogin = "Accceso Denegado!";
            try
            {

                //ResponseViewModel results = _securityManager.LoginActiveDirectory(input);
                //if (results.Code == 200)
                {
                    string loginSerialized = JsonConvert.SerializeObject(input);
                    Session["login"] = loginSerialized;

                    //Agregamos el domain para guardarlo en session
                    input.Domain = ConfigurationManager.AppSettings["Domain"];
                    loginSerialized = JsonConvert.SerializeObject(input);
                    Session.Add("jsonImpersonate", Convert.ToBase64String(Encoding.UTF8.GetBytes(loginSerialized)));

                    ViewBag.MessageLogin = "";
                    return RedirectToAction("Index", "Home");
                }
                //else
                //{
                //    Session.Remove("login");
                //    return RedirectToAction("Login", "Security");
                //}
            }
            catch (System.Exception ex)
            {
                ViewBag.MessageLogin = ex.Message; 
                Session.Remove("login");
                return RedirectToAction("Login", "Security", new { MessageLogin = ViewBag.MessageLogin });
            }
        }

        public ActionResult DoLogout()
        {
            ViewBag.MessageLogin = "";
            Session.Remove("login");
            Session.Remove("jsonImpersonate");
            return RedirectToAction("Login", "Security");
        }
    }
}