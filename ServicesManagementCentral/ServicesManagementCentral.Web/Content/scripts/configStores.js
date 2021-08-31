var ConfigStores = new function () {
    this.table = null;
    this.idTable = '#tblConfigStores';
    this.idFrmFilter = '#frmFilterConfigStores';
    this.keyServidores = 'DbServidores';
    this.keySistemas = 'DbSistemas';
    this.Initialize = function () {
        this.GetDBServidores();
        
        this.InitTable();
    };

    //1.-  una vez que carga sevidores, busca los servicios GetDBServidores
    this.GetDBServidores = function (fnCallBack) {
        ////Mostramos el loading
        utils.showLoading(true);

        $('#cmbStores').html('');


        //Obtenemos el formato correcto de los parametros para el dataTable
        var _params = utils.DataTableParameters({ AllowPaging: false }, {});

        //agregamos parametros de ordenamiento
        _params.PagingParameter.Sort = "Id_Num_Servidor";
        _params.PagingParameter.Fields = "Id_Num_Servidor,Serv_Name,Serv_Descripcion,Id_Werks,Url_Api_Tienda,Fec_Movto,KeyMap,OsVersion";


        //Es necesario enviar así los parametros
        _params = $.param(_params);
        Servidores.GetAll(_params, function (response) {
            utils.showLoading(false);
            var arrServers = $(response)
                .map(function () {
                    if (this.Serv_Name != null && this.Url_Api_Tienda != null && this.Serv_Name != "" && this.Url_Api_Tienda != "")
                        return this;
                })
                .get();
            sessionStorage.setItem(ConfigStores.keyServidores, JSON.stringify(arrServers));
            if (arrServers.length > 0) {
                var optionsHTML = utils.responseToComboBox(arrServers, 'Serv_Name', 'Serv_Name', ['Serv_Name', 'Url_Api_Tienda']);
                $('#cmbStores').html(optionsHTML);
            }

            ConfigStores.GetDBApplications();
            if (fnCallBack) {
                fnCallBack(response);
            }
        });
    };

    //2.-  una vez que carga sevidores, busca las aplicaciones
    this.GetDBApplications = function (fnCallBack) {
        ////Mostramos el loading
        utils.showLoading(true);

        //Obtenemos el formato correcto de los parametros para el dataTable
        var _params = utils.DataTableParameters({ AllowPaging: false }, {});

        //agregamos parametros de ordenamiento
        _params.PagingParameter.Sort = "Id_Sistema";
        _params.PagingParameter.Fields = "Id_Sistema,Nombre,Descripcion,Fecha_Creacion,Fecha_Actualizacion,Activo,NombrePublicacion,bit_multipleSesion";


        //Es necesario enviar así los parametros
        _params = $.param(_params);
        Sistemas.GetAll(_params, function (response) {
            utils.showLoading(false);
           
            var arrSistemas = $(response)
                .map(function () {
                    if (this.Nombre != null && this.NombrePublicacion != null) {
                        return this;
                    }
                }).get();

            sessionStorage.setItem(ConfigStores.keySistemas, JSON.stringify(arrSistemas));
           

            if (fnCallBack) {
                fnCallBack(response);
            }
        });
    };

    this.onChangeStore = function () {
        $('#btnSendWebConfig').prop("disabled", true);
        var isSelected = $('#cmbStores option:selected').val();
        if (isSelected == 'null') {
            $('#divSoVersion').html('');
        } else {
            var servers = JSON.parse(sessionStorage.getItem(ConfigStores.keyServidores));
            var server = $.grep(servers, function (e) { return e.Serv_Name == isSelected; });
            var osVersion = server[0].OsVersion;
            //console.log(server);
            //var osVersion = $('#cmbStores option:selected').data('osversion');
            
            if (osVersion == undefined || osVersion == null || osVersion == 'undefined' || osVersion == 'null' || osVersion.trim() == '') {
                $('#divSoVersion').html('<b>Sistema Operativo Desconocido.</b>');
            } else {
                osVersion = JSON.parse(osVersion);
                var SO = osVersion.Name + ' ' + (osVersion.OSBits =='Bit64'?'x64':'x32') + ' ' + osVersion.ServicePack + ' v' + osVersion.MajorVersion + '.' + osVersion.MinorVersion
                $('#divSoVersion').html('SO Version: <b>' + SO + '</b>');
                $('#btnSendWebConfig').prop("disabled", false);
            }
        }
    };

    this.GetOsVersion = function () {
        utils.showLoading(true);

        var _storeName = $('#cmbStores option:selected').val();
        var servers = JSON.parse(sessionStorage.getItem(ConfigStores.keyServidores));
        var server = $.grep(servers, function (e) { return e.Serv_Name == _storeName; });
        if (server.length > 0) {
            server = server[0];
        } else {
            return null;
        }

        var sistemas = JSON.parse(sessionStorage.getItem(ConfigStores.keySistemas));

        var _extraParams = {
            Servidor: server,
            Sistemas: sistemas
        };
       

        var _configAjax = {
            method: 'POST',
            url: Api.ConfigStore + '/GetOsVersion',
            data: _extraParams
        };


        http.ajax(_configAjax,
            function (response, header, request) {
                if (response.code == 200) {
                    ConfigStores.GetDBServidores(function () {

                        $('#cmbStores option[value="' + _storeName + '"]').prop('selected', 'selected').change();

                    });
                }
                utils.showLoading(false);
            
            },
            function (error) {
                utils.showLoading(false);
              //  utils.ShowExceptionMessage(error);
            }
        );
    };

    this.ScanStore = function () {
        this.GetOsVersion();
        ConfigStores.table.ajax.reload();
    };

    //Inicializa la tabla
    this.InitTable = function () {
        // Inicializa la tabla
        ConfigStores.table = $(ConfigStores.idTable).DataTable({
            ajax: ConfigStores.GetAllToDataTable,
            filter: true,
            //searchDelay: 1000,
            columns: [
                { data: 'Id_Sistema', name: 'Id_Sistema', title: "Id_Sistema", width: 100 },
                { data: 'Nombre', name: 'Nombre', title: "Nombre" },
                { data: 'NombrePublicacion', name: 'NombrePublicacion', title: "NombrePublicacion", visible:false },
                { data: 'Status', name: 'Status', title: "Status", width:200 },
            ]
        })
        .on('select', function (e, dt, type, indexes) {
                if (type === 'row') {
                    //var item = ConfigStores.table.rows(indexes).data()[0];
                    //ConfigStores.PopulateDataForUpdate(item);   
                }
            });

        //Esta clase pinta de verde el header
        $(ConfigStores.table.table().header()).addClass('bg-primary');

    };

    //Llamada Ajax para cargar los datos en la tabla
    this.GetAllToDataTable = function (data, callbackDataTable, settings) {

        // *******************************************************
        // ******* I M P O I R T A N T E  ************************
        // *******************************************************
        // LOS NOMBRES DE LOS CAMPOS DEBEN INICIAR CON MINUSCULA
        // *******************************************************

        //Obtenemos los filtros que vamos a aplicar
        var _filterParams = $(ConfigStores.idFrmFilter).formToJson();
        _filterParams.Nombre = data.search.value;
        

        //Obtenemos el formato correcto de los parametros para el dataTable
        var _params = utils.DataTableParameters(data, _filterParams);
        
        //agregamos parametros de ordenamiento
        _params.PagingParameter.Sort = (data.order[0].dir == 'asc' ? '' : '-') + data.columns[data.order[0].column].name;
        _params.PagingParameter.Fields = "Id_Sistema,Nombre,NombrePublicacion,Status";


        //Mostramos el loading
        utils.showLoading(true);
      
        //Es necesario enviar así los parametros
        _params = $.param(_params);

        ConfigStores.GetAll(_params, function (response, header, request) {
            //Hasta este momento recibimos la lista de datos, pero para el DataTable necesitamos convertir esa respuesta a un formato especial
            response = utils.DataTableResponse(data, response, request, null);
            // Llamamos al CallBack del DataTable, para que se encargue de dibujar la información
            callbackDataTable(response);

            //ocultamos el loading
            utils.showLoading(false);
        });
    };

    this.GetAll = function (_params, callback) {

        var _storeName = $('#cmbStores option:selected').val();
        if (_storeName == undefined || _storeName == null) {
            return [];
        }
        var servers = JSON.parse(sessionStorage.getItem(ConfigStores.keyServidores));
        var server = $.grep(servers, function (e) { return e.Serv_Name == _storeName; });
        if (server.length > 0) {
            server = server[0];
        } else {
            return null;
        }

        var sistemas = JSON.parse(sessionStorage.getItem(ConfigStores.keySistemas));

        var _extraParams = {
            Servidor: server,
            Sistemas: sistemas
        };

        var _configAjax = {
            method: 'POST',
            url: Api.ConfigStore + '/GetStatusWebConfig?' + _params,
            data: _extraParams,
        };
        //Mostramos el loading
        utils.showLoading(true);

        //realizamos la petición
        http.ajax(
            //config 
            _configAjax,

            //callBack que se ejecuta si la respuesta es exitosa
            function (response, header, request) {
                console.log(response);
                //Mostramos el loading
                utils.showLoading(false);

                if (callback) {
                    callback(response, header, request);
                }
            },
            //callBack que se ejecuta si ocurre algún error
            function (error) {
                //ocultamos el loading
                utils.showLoading(false);
               // utils.ShowExceptionMessage(error);
            }
        );
    };


    this.SendWebConfig = function () {
        utils.showLoading(true);
        var _storeName = $('#cmbStores option:selected').val();
     
        var servers = JSON.parse(sessionStorage.getItem(ConfigStores.keyServidores));
        var server = $.grep(servers, function (e) { return e.Serv_Name == _storeName; });
        if (server.length > 0) {
            server = server[0];
        } else {
            return null;
        }

        var sistemas = JSON.parse(sessionStorage.getItem(ConfigStores.keySistemas));

        var _configAjax = {
            method: 'POST',
            url: Api.ConfigStore +'/SendWebConfig',
            data: {
                Servidor: server,
                Sistemas: sistemas
            }
        };


        http.ajax(_configAjax, function (response, header, request) {
            utils.showLoading(false);
            if (response.code == 200) {
                $.notify({ message: "El archivo ha sido actualizado" }, { type: 'success' });
            } else {
                $.notify({ message: "No fue posible actualizar el archivo" }, { type: 'danger' });
            }
        }, function (error) {
            utils.showLoading(false);
           // utils.ShowExceptionMessage(error);
        });
    };

};