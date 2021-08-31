using AutoMapper;
using System.Web.Http;
using Unity;
using Unity.WebApi;

namespace ServicesManagement.Web
{
    /// <summary>
    /// Establece la inyecci�n de dependencias
    /// </summary>
    public static class UnityConfig
    {
        /// <summary>
        /// Configura la inyecci�n de depedencias
        /// </summary>
        public static void RegisterComponents()
        {
            UnityContainer container = new UnityContainer();

            RegisterAutoMapper(container);
            
            RegisterRepository(container);
            RegisterService(container);
            RegisterManager(container);


            GlobalConfiguration.Configuration.DependencyResolver = new UnityDependencyResolver(container);
        }

        private static void RegisterRepository(UnityContainer container)
        {
            //container.RegisterType<IServiciosRepository, ServiciosRepository>();
        }

        private static void RegisterManager(UnityContainer container)
        {
            //container.RegisterType<IServiciosManager, ServiciosManager>();
            
        }

        private static void RegisterService(UnityContainer container)
        {
            //container.RegisterType<IConfigStoreService, ConfigStoreService>();
            
        }

        private static void RegisterAutoMapper(UnityContainer container)
        {
            //var config = new MapperConfiguration(cfg => {
            //    cfg.AddProfile<DomainProfile>();
            //});
            //var mapper = new Mapper(config);

            //container.RegisterInstance<IMapper>(mapper);
        }
    }
}