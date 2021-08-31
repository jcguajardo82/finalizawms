/**
 * NO TOCAR a menos que sepas que estás haciendo
 * 
 * Contiene metodos necesarios para realizar la llamada ajax, inyectando la información necesaria para validar el JWT
 * y si fuera el caso poder hacer un refresh del token de Zoom 
 * Además si el token local ya caduco redirecciona a la vista de LOGIN
 * 
 * Powered by:
 * Ricardo Hernández 
 * 
 * */

var http = new function () {
    this.refreshTokenExecute = false;

    this.ajax = function (_config, _callBackSuccess, _callBackError, ) {
        var config = {};
        if (_config != undefined && _config != null) {
            config = _config;
        }

        ///config['Accept']= 'Application/Json';
        //config['contentType'] = 'Application/Json';
        config['crossDomain'] = true;
        //config['beforeSend'] = function (xhr) {
        //    xhr.setRequestHeader("x-data", 'asdasd');
        //};
        //config['xhrFields'] = {
        //    withCredentials: true
        //};
       // config.url = config.url + '?jsoncallback=?';
        //config = {
        //    beforeSend: function (xhr) {
        //        xhr.setRequestHeader("Authorization", 'Bearer ' + iStorage.get('Token'));
        //    },
        //    method: config.method,
        //    url: config.url,
        //    data: config.data

        //}

       

       // config['method'] = _config;
       // config['url'] = _url;
       // config['data'] = _data;
       
        //config = {
        //    beforeSend: function (xhr) {
        //        xhr.setRequestHeader("Authorization", 'Bearer ' + jsonImpersonate);
        //    },
        //    method: _method,
        //    url: _url,
        //  //  dataType: "json",
        //   // contentType: "application/x-www-form-urlencoded; charset=utf-8;",
        //    data: _data
        //};
      
        $.ajax(config)
            .done(function (response, headers, opt) {
                if (response != undefined && response.Error != null) {
                    http.processError(response.Error, _callBackError);
                    
                } else {
                    if (_callBackSuccess) {
                        _callBackSuccess(response, headers, opt);
                    } else {
                        utils.showLoading(false);
                    }
                    this.refreshTokenExecute = false;
                }
                
            })
            .fail(function (response) {
                utils.showLoading(false);
                var responseJson = response.responseJSON;

                http.processError(responseJson, _callBackError );
            });
    }



    this.refreshToken = function (_method, _url, _data, _callBackSuccess, _callBackError) {
        this.refreshTokenExecute = true;
      
        var _configAjax = {
            method: 'POST',
            url: api.access.refreshToken,
            data: {},
        }; 

        http.ajax(_configAjax,
            function (response) {
                if (response.Error != null) {
                    window.location.href = redirect.login;
                } else {
                   
                    this.refreshTokenExecute = false;

                    _configAjax = {
                        method: _method,
                        url: _url,
                        data: _data,
                    };
                    http.ajax(_configAjax, _callBackSuccess, _callBackError);
                }
            },
            function (error) {
                utils.showLoading(false);
                this.refreshTokenExecute = false;
            }
        );
    };


    //procesa los errores
    this.processError = function (error, _callBackError) {
        console.log(error);
        if (error && (error.code || error.Code)) {
            if (error.Code) {
                error.code = error.Code;
                error.message = error.Message;
            }
            var errorCode = parseInt(error.code);
            if (errorCode >= 600) {
                debugger;
            }
            if (errorCode == 124 && http.refreshTokenExecute == false) {
                //el token zoom es necesario refrescarlo               
                http.refreshToken();
                return false;
            } else if (errorCode == 401) {
                //el token escolar es necesario refrendarlo
                //window.location.href = redirect.login;
                $.notify({ message: error.message }, { type: 'danger' });
            } else if (errorCode == 600 || errorCode== 125) {
                if ($('#dlgPermissions').length) {
                    $('#dlgPermissions').modal('show');
                } else {
                    $.notify({ message: error.message }, { type: 'danger' });
                }
                
            } else if (errorCode == 624) {
                //requiere accion especial
                $.notify({ message: error.message }, { type: 'danger' });
            } else {
                // cualueir otro código muestra el error
                $.notify({ message: error.message }, { type: 'danger' });
            }


            
        } 

        //show the error
        if (_callBackError) {
            _callBackError(error);
        } else {
            utils.showLoading(false);
        }
        this.refreshTokenExecute = false;
    };
};
