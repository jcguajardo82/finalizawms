
var LogsViewer = new function () {
    this.table = null;
    this.idTable = '#tblLogsViewer';
    this.keyServidores = 'DbServidores';
    

    this.Initialize = function () {
        this.GetDBServidores();
    };


    //1.-  una vez que carga sevidores, busca los servicios GetDBLogsViewer
    this.GetDBServidores = function () {
        ////Mostramos el loading
        utils.showLoading(true);

        $('#cmbStores').html('');


        //Obtenemos el formato correcto de los parametros para el dataTable
        var _params = utils.DataTableParameters({ AllowPaging: false }, {});

        //agregamos parametros de ordenamiento
        _params.PagingParameter.Sort = "Id_Num_Servidor";
        _params.PagingParameter.Fields = "Id_Num_Servidor,Serv_Name,Serv_Descripcion,Id_Werks,Url_Api_Tienda,Fec_Movto,KeyMap";


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

            sessionStorage.setItem(LogsViewer.keyServidores, JSON.stringify(arrServers));
            if (arrServers.length > 0) {
                LogsViewer.GetDBLogsViewer();
                var optionsHTML = utils.responseToComboBox(arrServers, 'Serv_Name', 'Serv_Name');
                $('#cmbStores').html(optionsHTML);
            }
        });
    };

    //2.-  una vez que carga servicios, escanea todos los servidores ScanAllStores
    this.GetDBLogsViewer = function () {
        //Mostramos el loading
        utils.showLoading(true);

        $('#cmbLogsViewer').html('');

        //Obtenemos el formato correcto de los parametros para el dataTable
        var _params = utils.DataTableParameters({ AllowPaging: false }, {});

        //agregamos parametros de ordenamiento
        _params.PagingParameter.Sort = "Id_Num_Log";
        _params.PagingParameter.Fields = "Id_Num_Log,Log_Name,Descripcion,Fec_Movto,LogLevel";
        console.log(_params);

        //Es necesario enviar así los parametros
        _params = $.param(_params);
        var _configAjax = {
            method: 'GET',
            url: Api.Catalogo.LogsViewer,
            data: _params,
        };

       
        //realizamos la petición
        http.ajax(
            //config 
            _configAjax,

            //callBack que se ejecuta si la respuesta es exitosa
            function (response, header, request) {
                //ocultamos el loading
                utils.showLoading(false);
              
                if (response && response.length >0) {
                    var optionsHTML = utils.responseToComboBox(response, 'Log_Name', 'Log_Name', ['Id_Num_Log']);
                    $('#cmbLogsViewer').html(optionsHTML);
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

    //Busca los logs correspondientes a una tienda a 'X' log
    this.Search = function () {
        var _storeName = $('#cmbStores option:selected').val();
        var _logName = $('#cmbLogsViewer option:selected').val();
        var _IdNumLog = $('#cmbLogsViewer option:selected').data('id_num_log');
     

        if (_storeName == 'null' || _logName == 'null') {
            $.notify({ message: "Es necesario que seleccione la tienda y el log que quiere revisar" }, { type: 'warning' });
            return false;
        }

        utils.showLoading(true);
        var servers = JSON.parse(sessionStorage.getItem(LogsViewer.keyServidores));
        var server = $.grep(servers, function (e) { return e.Serv_Name == _storeName; });
        if (server.length > 0) {
            server = server[0];
        } else {
            return null;
        }

       
        var _configAjax = {
            method: 'GET',
            url: server.Url_Api_Tienda + '/LogViewer/GetByName',
            data: {
                "LogName": _logName,
                "StoreName": _storeName
            }
        };
      
       
        http.ajax(_configAjax, function (response, header, request) {
            if (response.code == 200) {
                LogsViewer.initDTLogsViewerViewer(response.data);
                LogsViewer.SaveTotals(response.data, server.Id_Num_Servidor, _IdNumLog);
            } else {
                LogsViewer.initDTLogsViewerViewer(null);
            }
            utils.showLoading(false);

        }, function (error) {
            LogsViewer.initDTLogsViewerViewer(null);
            utils.showLoading(false);
        });
    };

    //Inicializa el DataTable para mostrar los logs
    this.initDTLogsViewerViewer = function (_data) {
        

        if (LogsViewer.tblLogsViewerViewer != null) {
            LogsViewer.tblLogsViewerViewer.destroy();
            $(LogsViewer.idTable).empty();
        }

        // Inicializa la tabla
        LogsViewer.tblLogsViewerViewer = $(LogsViewer.idTable).DataTable({
            filter: true,
            data: _data,
            serverSide: false,
            columns: [
                { data: 'Id', name: 'Id', title: "Event Id", width: 100 },
                { data: 'EntryType', name: 'EntryType', title: "Level", width: 100 },
                { data: 'Message', name: 'Message', title: "Message" },
                { data: 'Source', name: 'Source', title: "Source" },
                {
                    data: function (row) {
                        var time = moment(row.Date); //2020-10-15T18:30:39-05:00
                        return time.format("YYYY-MM-DD HH:mm");
                    }, name: 'Date', title: "Date", width: 100
                },
            ],
        });

        utils.showLoading(false);
    };

    this.SaveTotals = function (logs, Id_Num_Servidor, _IdNumLog) {
        var totalInformations = $.grep(logs, function (e) { return e.EntryType == Constant.LogLevel.Information; }).length;
        var totalWarnings = $.grep(logs, function (e) { return e.EntryType == Constant.LogLevel.Warning; }).length;
        var totalErros = $.grep(logs, function (e) { return e.EntryType == Constant.LogLevel.Error; }).length;

        var _data = {
            Ids_Cnsc_Actividad: 0,
            Id_Num_Log: _IdNumLog,

            Cant_MsgInfo: totalInformations,
            Cant_MsgWarn: totalWarnings,
            Cant_MsgError: totalErros,
            Cant_LastMinute: 0,

            Id_Num_Servidor: Id_Num_Servidor
        };

        var _configAjax = {
            method: 'POST',
            url: Api.Catalogo.MonActivLog,
            data: _data
        };


        console.log(_data);
        http.ajax(_configAjax, function (response, header, request) {
            console.log(response);
            if (response.code == 200) {
                
            } 
            utils.showLoading(false);

        }, function (error) {
            console.log(error);
        });
    }
};