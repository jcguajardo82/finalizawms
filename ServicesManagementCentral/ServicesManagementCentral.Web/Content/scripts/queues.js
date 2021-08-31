
var Queue = new function () {
    this.GetAll = function (_params, callback) {

        var _configAjax = {
            method: 'GET',
            url: Api.Catalogo.Queue,
            data: _params,
        };

        //Mostramos el loading
        utils.showLoading(true);
        //realizamos la petición
        http.ajax(
            //config 
            _configAjax,

            //callBack que se ejecuta si la respuesta es exitosa
            function (response, header, request) {
                
                //ocultamos el loading
                utils.showLoading(false);

                if (callback) {
                    callback(response, header, request);
                }
            },
            //callBack que se ejecuta si ocurre algún error
            function (error) {
                //ocultamos el loading
                utils.showLoading(false);
                utils.ShowExceptionMessage(error);
            }
        );
    };


    this.Clear = function ( _params, callback) {
        var _configAjax = {
            method: 'POST',
            url: Api.Catalogo.Queue + '/Clear',
            data: _params.data,
        };


        _params

        //Mostramos el loading
        utils.showLoading(true);
        //realizamos la petición
        http.ajax(
            //config 
            _params,

            //callBack que se ejecuta si la respuesta es exitosa
            function (response, header, request) {
                console.log(response);

                //ocultamos el loading
                utils.showLoading(false);

                if (callback) {
                    callback(response, header, request);
                }
            },
            //callBack que se ejecuta si ocurre algún error
            function (error) {
                //ocultamos el loading
                utils.showLoading(false);
                //utils.ShowExceptionMessage(error);
            }
        );
    };
};