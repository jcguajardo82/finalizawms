using System.Web;
using System.Web.Optimization;

namespace ServicesManagement.Web
{
    /// <summary>
    /// Configura los scripts y estilos que se utilizarán
    /// </summary>
    public class BundleConfig
    {
        /// <summary>
        /// Registra los bundles
        /// </summary>
        /// <param name="bundles">BundleCollection object</param>
        public static void RegisterBundles(BundleCollection bundles)
        {
            BundleTable.EnableOptimizations = false;

            bundles.Add(new ScriptBundle("~/Content/jquery")
                .Include("~/Content/plugins/jquery/jquery-3.5.1.min.js")
                .Include("~/Content/plugins/jquery-ui/jquery-ui.min.js")
                );

            bundles.Add(new ScriptBundle("~/Content/slick")
                .Include("~/Content/plugins/slick/slick.js"));

            bundles.Add(new ScriptBundle("~/Content/mapael")
                .Include(
                "~/Content/plugins/mapael/js/jquery.mousewheel.min.js",
                "~/Content/plugins/mapael/js/raphael.min.js",
                "~/Content/plugins/mapael/js/jquery.mapael.min.js",
                "~/Content/plugins/mapael/js/mexico.min.js"
               
                ));

            //bundles.Add(new ScriptBundle("~/Content/d3")
            //    .Include(
            //        "~/Content/plugins/d3/d3.min.js"
            //    ));
            //bundles.Add(new ScriptBundle("~/Content/topojson")
            //    .Include(
            //        "~/Content/plugins/topojson/topojson.min.js"
            //    ));
            //bundles.Add(new ScriptBundle("~/Content/datamaps")
            //    .Include(
            //        "~/Content/plugins/datamaps/datamaps.all.js"
            //    ));
            //bundles.Add(new ScriptBundle("~/Content/datamapsMEX")
            //   .Include(
            //       "~/Content/plugins/datamaps/datamaps.mex.js"
            //   ));

            bundles.Add(new ScriptBundle("~/Content/formToJson")
                .Include( "~/Content/plugins/jquery/formToJson.min.js"));

            bundles.Add(new ScriptBundle("~/Content/fullscreen")
               .Include("~/Content/plugins/fullscreen/fullscreen.min.js"));

            bundles.Add(new ScriptBundle("~/Content/mentismenu").Include(
                        "~/Content/plugins/metismenu/metisMenu.min.js",
                         "~/Content/plugins/momment/moment.min.js"
                    ));

            bundles.Add(new ScriptBundle("~/Content/momment").Include(
                         "~/Content/plugins/momment/moment.min.js",
                         "~/Content/plugins/momment/moment-with-locales.min.js"
                    ));

            bundles.Add(new ScriptBundle("~/Content/storage").Include(
                         "~/Content/plugins/js-storage/js.storage.min.js"
                    ));

            bundles.Add(new ScriptBundle("~/Content/bootstrap").Include(
                         "~/Content/plugins/bootstrap/js/bootstrap.min.js"
                    ));
            bundles.Add(new ScriptBundle("~/Content/popper").Include(
                         "~/Content/plugins/popper/popper.min.js"
                    ));

            bundles.Add(new ScriptBundle("~/Content/bootstrap-datetimepicker/js").Include(
                         "~/Content/plugins/bootstrap-datetime/js/bootstrap-datetimepicker.min.js"
                    ));
            bundles.Add(new ScriptBundle("~/Content/bootstrap-notify").Include(
                         "~/Content/plugins/bootstrap-notify/bootstrap-notify.min.js"
                    ));

            bundles.Add(new ScriptBundle("~/Content/datatable").Include(
                         "~/Content/plugins/datatables/datatables.js",
                         "~/Content/plugins/datatables/DataTables-1.10.22/js/dataTables.bootstrap4.min.js"
                    ));

            bundles.Add(new ScriptBundle("~/Content/slimscroll").Include(
                     "~/Content/Inspinia/plugins/slimscroll/jquery.slimscroll.min.js"
                     ));

            bundles.Add(new ScriptBundle("~/Content/metisMenu").Include(
                           "~/Content/Inspinia/plugins/metisMenu/metisMenu.min.js"
                      ));

            bundles.Add(new ScriptBundle("~/Content/inspiniatheme").Include(
                        "~/Content/Inspinia/app/inspinia.js",
                         "~/Content/Inspinia/plugins/pace/pace.min.js"
                     // "~/Content/Inspinia/plugins/iCheck/icheck.min.js"
                      ));

            bundles.Add(new ScriptBundle("~/Content/custoscripts").Include(
                            "~/Content/Scripts/utils/iStorage.js"
                            , "~/Content/Scripts/utils/utils.js"
                            , "~/Content/Scripts/utils/http.js"
                            , "~/Content/Scripts/servicios.js"
                            , "~/Content/Scripts/servidores.js"
                            , "~/Content/Scripts/cpanel.js"
                            , "~/Content/Scripts/logs.js"
                            , "~/Content/Scripts/logsViewer.js"
                            , "~/Content/Scripts/queues.js"
                            , "~/Content/Scripts/configStores.js"
                            , "~/Content/Scripts/sistemas.js"
                            , "~/Content/Scripts/dllVersion.js"
                            , "~/Content/Scripts/articulo.js"
                            , "~/Content/Scripts/ubicacion.js"
                            , "~/Content/Scripts/security.js"
                            , "~/Content/Scripts/cpanelLocal.js"
                      ));

            bundles.Add(new ScriptBundle("~/Content/jqueryExtensions/js").Include(
                            "~/Content/Scripts/jqueryExtensions/jqueryExtensions.js"
                      ));
            bundles.Add(new StyleBundle("~/Content/jqueryExtensions/css").Include(
                     "~/Content/Scripts/jqueryExtensions/jqueryExtensions.css"
                      ));


            bundles.Add(new StyleBundle("~/Content/base/css").Include(
                      "~/Content/plugins/bootstrap/css/bootstrap.css",
                      "~/Content/plugins/bootstrap-datetime/css/bootstrap-datetimepicker.min.css",
                      "~/Content/plugins/datatables/DataTables-1.10.22/css/dataTables.bootstrap4.min.css",
                      "~/Content/plugins/slick/slick.css",
                      "~/Content/plugins/slick/slick-theme.css"
                      //"~/Content/plugins/fontawesome/css/all.css",
                      //"~/Content/plugins/fontawesome/css/fontawesome.min.css",

                      ));

            bundles.Add(new StyleBundle("~/Content/fontawesome")
                .Include("~/Content/plugins/fontawesome/css/all.css")
                .Include("~/Content/plugins/fontawesome/css/fontawesome.css")
                .Include("~/Content/Inspinia/fonts/font-awesome/css/font-awesome.css") //, new CssRewriteUrlTransform()

                );
            


            bundles.Add(new StyleBundle("~/Content/Inspinia/css")
                .Include(
                      "~/Content/Inspinia/Styles/iCheck/custom.css",
                      "~/Content/Inspinia/animate.css",
                      "~/Content/Inspinia/style.css"
                      ));


            bundles.Add(new StyleBundle("~/Content/custom")
                .Include("~/Content/site.css"));
        }
    }
}
