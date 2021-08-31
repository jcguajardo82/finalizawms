var _isReloadTimer = null;
var _isTimes = 0;
var CPanel = new function () {
    this.keyAllWS = 'AllWS';
    this.keyWSGroups = 'keyWSGroups';
    this.keyServicios = 'DbServicios';
    this.keyServidores = 'DbServidores';

    //Almacena el nombre del servicio que actualmente se está consultando
    this.ServiceName = '';

    //Hace referencia al DataTable creado
    this.tableWS = null;
    this.tableQueue = null;

    //Id del Data Table de servicios windows
    this.idTableWS = '#tblDetailWS';
    this.idTableQueue = '#tblDetailQueue';

    //Cantidad de minutos para que el timer vuevla a ejecutar las acciones que contenga
    this.minutesToReload = 1;

    // Origin del data table, permite saber cuando se hizo click en el gallery o en el mapa y así mostrar la información correcta
    this.originDataTable = 'gallery';

    //Referencia al data Table del event viewer
    this.tblEventViewer = null;

    //Plantilla para los cards del carrusel
    this.plantillaCard = '<div class="card"><div class="card-header">{processName}</div><div class="card-body text-center"><div class="widget p-0 text-center"> <div class="m-b-md"><i class="fa fa-warning fa-4x"></i><h1 class="m-xs">{processQty}</h1><h3 class="font-bold no-margins">{label}</h3></div></div><button onClick="CPanel.OnClickShowDetails(\'{serviceName}\',{isWs})" class="btn btn-rounded btn-warning">Ver Detalles</button></div></div>';

    this.Initialize = function () {
       this.clearSession();
       //this.GetDBServidores();
    };

    //Limpia el contenido del localstorage
    this.clearSession = function () {
        sessionStorage.removeItem(CPanel.keyAllWS);
        sessionStorage.removeItem(CPanel.keyWSGroups);
        sessionStorage.removeItem(CPanel.keyServicios);
        sessionStorage.removeItem(CPanel.keyServidores);
    };

    //crea un nuevo timer
    this.NewTimer = function () {
        var time = CPanel.CalcMinutes( CPanel.minutesToReload );
        _isReloadTimer = window.setInterval(function (time ) {
            _isTimes += 1;
            if (!CPanel.ClearTimer()) {
                CPanel.GetDBServidores();
            }
        }, time);
    };

    //limpia el timer
    this.ClearTimer = function () {
        if (_isTimes == 10) {
            window.clearInterval(_isReloadTimer);
            _isTimes = 0;
            CPanel.NewTimer();
            return true;
        }

        return false;
    };

    //Retorna la cantidad de milisegundos que equivalen a la cantidad de minutos que recibió como parametro
    this.CalcMinutes = function (minutos) {
        return (1000 * 30) * minutos;
    }

    //Inicializa el mapa
    this.InitializeMap = function (totals) {
      
        $(".mapcontainer").removeClass('hidden');
        var _configMap = {
            name: "mexico",
            // Enable zoom on the map
            zoom: {
                enabled: true,
                maxLevel: 10
            },
            defaultArea: {
                attrs: {
                    fill: "#f4f4e8",
                    stroke: "#ced8d0"
                },
                attrsHover: {
                    fill: "#a4e100"
                },
                text: {
                    attrs: {
                        fill: "#505444"
                    },
                    attrsHover: {
                        fill: "#000"
                    }
                }
            }
        };
        var _stateConfig = {
            attrs: {
                fill: "#c70619",
                data: {
                    name: "ricardo"
                },
            },
            attrsHover: {
                fill: "#ed2d40"
            },
            eventHandlers: {
                click: function (e, id, mapElement, textElement) {
                    CPanel.originDataTable = id;
                    CPanel.InitTables(id);
                    $('#dlgDetailsWS').modal('show');
                }
            }
        };


        var _mapConfig = {};
        $.each(totals.Map, function (stateName, row) {
            _mapConfig[stateName] = _stateConfig;
        });
        $(".mapcontainer").mapael({
            map: _configMap,
            areas: _mapConfig
        });
    };

    this.InitTables = function (serviceName, isWs) {
        // CPanel.clearTablesWSQueue();
        
            $('.hide-tab-ws').removeClass('super-hide');
            $('.hide-tab-msmq').removeClass('super-hide');
     
        if (isWs == undefined) {
            $('#tabWsMQ a[href="#ws"]').tab('show');
            CPanel.InitTableWS(serviceName, isWs);
            CPanel.InitTableQueue(serviceName, isWs);
        } else {

            if (isWs) {
                $('#tabWsMQ a[href="#ws"]').tab('show');
                CPanel.InitTableWS(serviceName, isWs);
                $('.hide-tab-msmq').addClass('super-hide');
            } else {
               
                $('#tabWsMQ li a[href="#msmq"]').tab('show');
                CPanel.InitTableQueue(serviceName, isWs);
                $('.hide-tab-ws').addClass('super-hide');
            }
        }
    };

    this.clearTablesWSQueue = function () {
        if (CPanel.tableWS != null) {
            CPanel.tableWS.clear().destroy();
        }

        if (CPanel.tableQueue != null) {
            CPanel.tableQueue.clear().destroy();
        }

    };

    //Inicializa la tabla que se muestra en el modal
    this.InitTableWS = function (serviceName) {
        this.ServiceName = serviceName;
        if (CPanel.tableWS) {
           
            CPanel.tableWS.ajax.reload();
            return null;
        }
        
        // Inicializa la tabla
        CPanel.tableWS = $(CPanel.idTableWS).DataTable({
            ajax: function (data, callback, settings) {
                callback({ data: CPanel.GetDataToTableWS() });
            },
            serverSide: false,
            filter: true,
            columns: [
                {
                    data: function (row, event, index) {
                        var _row = utils.b64EncodeUnicode(JSON.stringify(row));
                        var btnLog = '<button  type="button" class="btn btn-default btn-circle mr-1"  onClick="CPanel.EVLogs(\'' + row.Name + '\',\'' + row.StoreName + '\');"  > <i class="fa fa-search"></i></button >';
                        var btnPlay = '<button  type="button" class="btn btn-default btn-circle" title="Iniciar" onClick="CPanel.Start(\'' + _row + '\');" > <i class="fa fa-play"></i></button >';
                        return btnLog + btnPlay;
                    },
                    name: 'Actions',
                    title: '', "width": 100, "orderable": false, "className": "text-center",
                },

                { data: 'StoreId', name: 'StoreId', title: "IdTienda", width: 300, visible: false },
                { data: 'StoreName', name: 'StoreName', title: "Tienda", width: 300 },
                { data: 'DisplayName', name: 'DisplayName', title: "Servicio", width: 300 },
                { data: 'Status', name: 'Status', title: "Status", width: 300 },

            ],
        });
    };

    //Obtiene los datos que se muestran en la tabla de Detalle
    this.GetDataToTableWS = function () {
        
        var params = sessionStorage.getItem(CPanel.keyWSGroups);
        if (params == null) {
            return null;
        }

        params = JSON.parse(params);
        if (this.originDataTable == 'gallery') {
            params = params.Services[CPanel.ServiceName].data;
        } else {
            params = params.Map[this.originDataTable]['WS'].data;
        }

        params = $.grep(params, function (e) { return e.Status == "Stopped"; });
        if (params.length > 0) {
            $('#bdgService').html(params.length);
        } else {
            $('#bdgService').html('');
        }
        return params;
    };

    //Inicializa la tabla que se muestra en el modal
    this.InitTableQueue = function (serviceName) {
        this.ServiceName = serviceName;
        if (CPanel.tableQueue) {
            CPanel.tableQueue.ajax.reload();
            return null;
        }

        // Inicializa la tabla
        CPanel.tableQueue = $(CPanel.idTableQueue).DataTable({
           
            ajax: function (data, callback, settings) {
                callback({ data: CPanel.GetDataToTableQueue() });
            },
            serverSide: false,
            filter: true,
            info: true,
            columns: [
                {
                    data: function (row, event, index) {
                        var _row = utils.b64EncodeUnicode(JSON.stringify(row));
                        var btnDelete = '<button  type="button" class="btn btn-default btn-circle" title="Iniciar" onClick="CPanel.ClearQueue(\'' + _row + '\');" > <i class="fa fa-trash"></i></button >';
                        return btnDelete;
                    },
                    name: 'Actions',
                    title: '', "width": 100, "orderable": false, "className": "text-center",
                },

                { data: 'StoreId', name: 'StoreId', title: "IdTienda", width: 300, visible: false },
                { data: 'StoreName', name: 'StoreName', title: "Tienda", width: 300 },
                { data: 'Name', name: 'Name', title: "Message Queue", width: 300 },
                { data: 'Total', name: 'Total', title: "Total", width: 300 },

            ],
        });
    };

    //Obtiene los datos que se muestran en la tabla de Detalle
    this.GetDataToTableQueue = function () {
        var params = sessionStorage.getItem(CPanel.keyWSGroups);
        if (params == null) {
            return null;
        }

        params = JSON.parse(params);
        if (this.originDataTable == 'gallery') {
            params = params.Queues[CPanel.ServiceName].data;
        } else {
            params = params.Map[this.originDataTable]['Queue'].data;
        }
       
       // params = $.grep(params, function (e) { return e.Status == "Stopped"; });
        if (params.length > 0) {
            $('#bdgQueue').html(params.length);
        } else {
            $('#bdgQueue').html('');
        }
        return params;
    };

    //Inicializa el carrusel que muestra los procesos
    this.InitializeCarrusel = function (container) {

        $(container).slick({
            infinite: true,
            slidesToShow: 3,
            slidesToScroll: 1,
            centerMode: true,
            responsive: [
                {
                    breakpoint: 1024,
                    settings: {
                        slidesToShow: 3,
                        slidesToScroll: 3,
                        infinite: true,
                        dots: true
                    }
                },
                {
                    breakpoint: 600,
                    settings: {
                        slidesToShow: 2,
                        slidesToScroll: 2
                    }
                },
                {
                    breakpoint: 480,
                    settings: {
                        slidesToShow: 1,
                        slidesToScroll: 1
                    }
                }
            ]
        });

        //return true;
    };

    //1.-  una vez que carga sevidores, busca los servicios GetDBServicios
    this.GetDBServidores = function () {
       
        var dtParams = {
            AllowPaging: false
        };

        //Obtenemos el formato correcto de los parametros para el dataTable
        var _params = utils.DataTableParameters(dtParams, {});

        //agregamos parametros de ordenamiento
        _params.PagingParameter.Sort = "Id_Num_Servidor";
        _params.PagingParameter.Fields = "Id_Num_Servidor,Serv_Name,Serv_Descripcion,Id_Werks,Url_Api_Tienda,Fec_Movto,KeyMap";


        ////Mostramos el loading
        utils.showLoading(true);

        //Es necesario enviar así los parametros
        _params = $.param(_params);
        Servidores.GetAll(_params, function (response) {
            utils.showLoading(false);
            
            var arrServers = $(response)
                .map(function () {
                    if (this.Serv_Name != null && this.Url_Api_Tienda != null && this.Serv_Name != "" && this.Url_Api_Tienda!="")
                    return this;
                })
                .get();

            sessionStorage.setItem(CPanel.keyServidores, JSON.stringify(arrServers));
            if (arrServers.length > 0) {
                CPanel.GetDBServicios(arrServers);
            }
        });
    };

    //2.- Obtiene la lista de servicios windows que se quieren escanear
    this.GetDBServicios = function (arrServerName) {
        var dtParams = {

            AllowPaging: false
        };

        //Obtenemos el formato correcto de los parametros para el dataTable
        var _params = utils.DataTableParameters(dtParams, {});

        //agregamos parametros de ordenamiento
        _params.PagingParameter.Sort = "Id_Num_Servicio";
        _params.PagingParameter.Fields = "Id_Num_Servicio,Nom_Servicio,Desc_Servicio,Disp_Servicio,Fec_Movto";



        //Mostramos el loading
        utils.showLoading(true);

        //Es necesario enviar así los parametros
        _params = $.param(_params);
        Servicios.GetAll(_params, function (response) {
            utils.showLoading(false);

            var arrServiceName = $(response)
                .map(function () {
                    return this.Nom_Servicio;
                })
                .get();
            
            CPanel.GetDBQueues(arrServerName, arrServiceName);
        });
    };

    //3.-  Obtiene la lista de Queue que se van a escanear
    this.GetDBQueues = function (arrServerName, arrServiceName) {
        //Obtenemos el formato correcto de los parametros para el dataTable
        var _params = utils.DataTableParameters({ AllowPaging: false }, {});
        _params.PagingParameter.Sort = "Id_Num_Queue";
        _params.PagingParameter.Fields = "Id_Num_Queue,Nom_Queue,Nombre,Fec_Movto";



        //Mostramos el loading
        utils.showLoading(true);

        
        Queue.GetAll($.param(_params), function (arrQueue) {
            utils.showLoading(false);
            if (arrServiceName && arrQueue && arrServiceName.length > 0 && arrQueue.length > 0) {
                CPanel.clearCarrusel('#carruselProcess');
                CPanel.clearMap();
                CPanel.ScanAllStores(arrServerName, arrServiceName, arrQueue);
            }
        });
    };

    // 4.- Obtiene la lista de Servicios Windows de cada servidor
    // inicializa el carrusel
    // inicializa el mapa
    this.ScanAllStores = function (arrServers, arrServiceName, arrQueue) {
        $.each(arrServers, function (index, item) {
            var url = item.Url_Api_Tienda + '/CPanel/GetInfo';
            CPanel.GetCPanelInfo(url, item.Serv_Name, item.Id_Num_Servidor, arrServiceName, arrQueue);
           
        });
        
        // Pintamos Calculamos los totalesel gallery data
        var ws = sessionStorage.getItem(CPanel.keyAllWS);
        if (ws != null) {
            ws = JSON.parse(ws);
            CPanel.CalcTotalesWS(ws);

            var totals = sessionStorage.getItem(CPanel.keyWSGroups);
            if (totals != null) {
                totals = JSON.parse(totals);

                var existIncidences = this.TotalesToHtml(totals);

                if (existIncidences == true) {
                    CPanel.InitializeCarrusel('#carruselProcess');
                    CPanel.InitializeMap(totals);
                } else {
                    $('#carruselProcess').html('<h1>No existen incidencias reportadas.</h1>');
                }
            }
        } else {
            $('#carruselProcess').html('<h1>No existen incidencias reportadas.</h1>');
        }
        
    };

    //Realiza la petición AJAX para solicitar la lista de servicios windows
    this.GetCPanelInfo = function (url, storeName, storeId, arrServicesNames, arrQueue) {
        utils.showLoading(true);
        
        var _configAjax = {
            method: 'POST',
            url: url,
            async: false,
            timeout:20000,
            data: {
                "Servicios": arrServicesNames,
                "MsgQs": arrQueue ,
                "StoreId": storeId,
                "StoreName": storeName
            }
        }; 
      
        http.ajax(
            //config
            _configAjax,

            //callBack que se ejecuta si la respuesta es exitosa
            function (response, header, request) {
                utils.showLoading(false);
                if (response.code == 200) {
                    var ws = sessionStorage.getItem(CPanel.keyAllWS);
                    if (ws == null) {
                        ws = {};
                    } else {
                        ws = JSON.parse(ws);
                    }
                   
                    //response.data['StoreId'] = storeId;
                    //response.data['StoreName'] = storeName;
                    ws[storeName] = response.data;

                    
                    ws = JSON.stringify(ws);
                    sessionStorage.setItem(CPanel.keyAllWS, ws);
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

    //calcula el total de servicios Windows
    this.CalcTotalesWS = function (allWS) {
        var servidores = JSON.parse(sessionStorage.getItem(CPanel.keyServidores));
       
        var Totals = {
            Services: {},
            Queues: {},
            Map : {}
        };

        $.each(allWS, function (storeName, wServices) {
            Totals = CPanel.LlenaServicios(servidores, wServices.WS, Totals);
            Totals = CPanel.LlenaQueues(servidores, wServices.MsMq, Totals);
        });
       
        var wsTotals = JSON.stringify(Totals);
       
        sessionStorage.setItem(CPanel.keyWSGroups, wsTotals);
        
    };

    this.LlenaServicios = function (servidores, _servicios, Totals) {
        $.each(_servicios, function (index, ws) {
            if (!Totals.Services[ws.Name]) {
                Totals.Services[ws.Name] = {
                    data: [],
                    totales: {
                        Stopped: 0,
                        StartPending: 0,
                        StopPending: 0,
                        Running: 0,
                        ContinuePending: 0,
                        PausePending: 0,
                        Paused: 0,
                    },
                };

            }
            if (!Totals.Map) {
                Totals.Map = {};
            }

            var server = $.grep(servidores, function (e) { return e.Serv_Name == ws.StoreName; });
            if (server.length > 0) {
                server = server[0];
            } else {
                server = '';
            }

            ws.KeyMap = server.KeyMap;
            Totals.Services[ws.Name].data.push(ws);

            var addToMap = false;
            switch (ws.NumStatus) {
                case Constant.WsStatus.Stopped: {
                    Totals.Services[ws.Name].totales.Stopped += 1;
                    addToMap = true;
                    break;
                }
                case Constant.WsStatus.StartPending: {
                    Totals.Services[ws.Name].totales.StartPending += 1;
                    break;
                }
                case Constant.WsStatus.StopPending: {
                    Totals.Services[ws.Name].totales.StopPending += 1;
                    break;
                }
                case Constant.WsStatus.Running: {
                    Totals.Services[ws.Name].totales.Running += 1;
                    break;
                }
                case Constant.WsStatus.ContinuePending: {
                    Totals.Services[ws.Name].totales.ContinuePending += 1;
                    break;
                }
                case Constant.WsStatus.PausePending: {
                    Totals.Services[ws.Name].totales.PausePending += 1;
                    break;
                }
                case Constant.WsStatus.Paused: {
                    Totals.Services[ws.Name].totales.Paused += 1;
                    addToMap = true;
                    break;
                }
            };

            if (addToMap && server != '') {
              
                if (!(Totals.Map[server.KeyMap] && Totals.Map[server.KeyMap]['WS'])) {
                    Totals.Map[server.KeyMap] = {
                        'WS': {
                            total: 0,
                            data: []
                        },
                        'Queue': {
                            total: 0,
                            data: []
                        }
                    };
                } 
                Totals.Map[server.KeyMap]['WS'].total = Totals.Map[server.KeyMap]['WS'].total + 1;
                Totals.Map[server.KeyMap]['WS'].data.push(ws);

            }
        });

        return Totals;
    };

    this.LlenaQueues = function (servidores, _servicios, Totals) {
        $.each(_servicios, function (index, item) {
            if (!Totals.Queues[item.Name]) {
                Totals.Queues[item.Name] = {
                    data: [],
                    total:0,
                };

            }
            if (!Totals.Map) {
                Totals.Map = {};
            }

            var server = $.grep(servidores, function (e) { return e.Serv_Name == item.StoreName; });
            if (server.length > 0) {
                server = server[0];
            } else {
                server = '';
            }

            item.KeyMap = server.KeyMap;
            Totals.Queues[item.Name].data.push(item);
            Totals.Queues[item.Name].total = Totals.Queues[item.Name].total + item.Total;

            if (!(Totals.Map[server.KeyMap] && Totals.Map[server.KeyMap]['WS'])) {
                Totals.Map[server.KeyMap] = {
                    'WS': {
                        total: 0,
                        data: []
                    },
                    'Queue': {
                        total: 0,
                        data: []
                    }
                };
            }
            Totals.Map[server.KeyMap]['Queue'].total = Totals.Map[server.KeyMap]['Queue'].total + 1;
            Totals.Map[server.KeyMap]['Queue'].data.push(item);

        });

        return Totals;
    };

    //Convierte los totales en HTML para mostrarlos en el carrusel
    this.TotalesToHtml = function (Totals) {
        CPanel.clearCarrusel('#carruselProcess');
        $slick = $('#carruselProcess');
        $slick.html('');

        var anyServicesStopped = false;
        $.each(Totals.Services, function (key, item) {
            
            if (item.totales.Stopped > 0) {
               
                anyServicesStopped = true;
                var plantilla = CPanel.plantillaCard;
               
                plantilla = plantilla
                    .replace('{processName}', key)
                    .replace('{processQty}', item.totales.Stopped)
                    .replace('{serviceName}', key)
                    .replace('{label}', 'Servicio Windows')
                    .replace('{isWs}', true)
                    ;
                $slick.append(plantilla);
            }
        });


        $.each(Totals.Queues, function (key, item) {
            anyServicesStopped = true;
            var plantilla = CPanel.plantillaCard;
            plantilla = plantilla
                .replace('{processName}', key)
                .replace('{processQty}', item.total)
                .replace('{serviceName}', key)
                .replace('{label}', 'Message Queue')
                .replace('{isWs}', false)
                ;
            $slick.append(plantilla);
        });

        return anyServicesStopped;
    };

    //Limpia el carrusel
    this.clearCarrusel = function (container) {
        $slick = $(container);
        if ($slick.hasClass('slick-initialized')) {
            $slick.slick('destroy');
            $slick.slick('unslick');
        }
    };

    //Muestra los detalles
    this.OnClickShowDetails = function (serviceName, isWs) {
        this.originDataTable = 'gallery';
        CPanel.InitTables(serviceName, isWs);
        
        $('#dlgDetailsWS').modal('show');
    };

    //Limpia el mapa
    this.clearMap = function () {
        $(".mapcontainer").addClass('hidden');
    };

    //Actualiza los totales
    this.UpdateWSTotals= function (data) {
        var params = sessionStorage.getItem(CPanel.keyWSGroups);
        if (params == null) {
            return null;
        }

        params = JSON.parse(params);
        var myArray = params.Services[data.Name].data;
        //var result = $.grep(myArray, function (e) { return e.StoreName == data.StoreName; });
        var index = myArray.findIndex(x => x.StoreName == data.StoreName);
      
        if (index > -1) {
           
            params.Services[data.Name].data.splice(index, 1);
            params.Services[data.Name].totales.Running+=1;
            params.Services[data.Name].totales.Stopped-=1;

           
            //Guardamos los cambios
            var wsTotals = JSON.stringify(params);
            sessionStorage.setItem(CPanel.keyWSGroups, wsTotals);


            var existIncidences = CPanel.TotalesToHtml(params);
            if (!existIncidences) {
                CPanel.clearMap();
            } else {
                console.log(params);
                CPanel.InitializeMap(params);
            }
        }


        //return params;
    };

    //Realiza la petición para iniciar un servicio
    this.Start = function (row) {
        var servers = JSON.parse(sessionStorage.getItem(CPanel.keyServidores));
        row = JSON.parse(utils.b64DecodeUnicode(row));
       
        var server = $.grep(servers, function (e) { return e.Serv_Name == row.StoreName; });
        if (server.length > 0) {
            server = server[0];
        } else {
            return null;
        }

       
        utils.showLoading(true);

        var arrNames = [];
        arrNames.push(row.Name);
        var _params = {
            "Servicios": arrNames,
            "StoreId": row.StoreId,
            "StoreName": row.StoreName
        };
       
        var _configAjax = {
            method: 'post',
            url: server.Url_Api_Tienda + '/WindowsServices/Start',
            data: _params
        }; 
      

        http.ajax(
            //config
            _configAjax,

            //callBack que se ejecuta si la respuesta es exitosa
            function (response, header, request) {
                utils.showLoading(false);
                if (response.code == 200) {
                    CPanel.UpdateWSTotals(response.data);
                    CPanel.InitTables(row.Name);
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

    //Solicita los logs del servicio
    this.EVLogs = function (serviceName, storeName) {
        utils.showLoading(true);

        var servers = JSON.parse(sessionStorage.getItem(CPanel.keyServidores));
        var server = $.grep(servers, function (e) { return e.Serv_Name == storeName; });
        if (server.length > 0) {
            server = server[0];
        } else {
            return null;
        }
        var _configAjax = {
            method: 'GET',
            url: server.Url_Api_Tienda + '/EventViewer/GetByName',
            data: {
                "ServiceName": serviceName,
                "StoreName": storeName
            }
        };

      
        http.ajax(_configAjax,
            function (response, header, request) {
                utils.showLoading(false);

                $('#titleLogsEV').html(storeName + ' - [' + serviceName + ']');
                if (response.code == 200) {
                    CPanel.initDTEventViewer(response.data);
                } else {
                    CPanel.initDTEventViewer(null);
                }
            
                $('#dlgLogsEV').modal('show');

            },
            function (error) {
                utils.showLoading(false);
                
                CPanel.initDTEventViewer(null);
                $('#dlgLogsEV').modal('show');
            }
        );

    };

    //Inicializa la tabla que muestra la información del event Viewer
    this.initDTEventViewer = function (_data) {
        if (CPanel.tblEventViewer != null) {
            CPanel.tblEventViewer.destroy();
            $('#tblEventViewer').empty();
        }
        // Inicializa la tabla
        CPanel.tblEventViewer = $('#tblEventViewer').DataTable({
            
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
    };

    //Solicita los logs del servicio
    this.bk_EVLogs = function (serviceName, storeName) {
        var servers = JSON.parse(sessionStorage.getItem(CPanel.keyServidores));

        var server = $.grep(servers, function (e) { return e.Serv_Name == storeName; });
        if (server.length > 0) {
            server = server[0];
        } else {
            return null;
        }


        utils.showLoading(true);
        var _configAjax = {
            method: 'GET',
            url: server.Url_Api_Tienda + '/EventViewer/GetByName',
            data: {
                "ServiceName": serviceName,
                "StoreName": storeName
            }
        };


        http.ajax(
            //config
            _configAjax,

            //callBack que se ejecuta si la respuesta es exitosa
            function (response, header, request) {
                console.log(response);
                utils.showLoading(false);
                $('#titleLogsEV').html('Logs de: ' + storeName + ' - [' + serviceName + ']');

                if (response.code == 200) {
                    var TextArea = '';
                    $.each(response.data, function (index, text) {
                        TextArea += text + '\r';
                    });
                    $('#ContentLogsEV').html('<textarea style="height:20rem; width:100%;">' + TextArea + '</textarea>');
                } else {
                    $('#ContentLogsEV').html(response.message);
                }

                $('#dlgLogsEV').modal('show');
            },

            //callBack que se ejecuta si ocurre algún error
            function (error) {
                //ocultamos el loading
                utils.showLoading(false);
                utils.ShowExceptionMessage(error);
            }
        );
    };

    this.ClearQueue = function (row) {
        var servers = JSON.parse(sessionStorage.getItem(CPanel.keyServidores));
        row = JSON.parse(utils.b64DecodeUnicode(row));

        var server = $.grep(servers, function (e) { return e.Serv_Name == row.StoreName; });
        if (server.length > 0) {
            server = server[0];
        } else {
            alert('El servidor "' + _queue.StoreName + '" no tiene establecida la url de la API.');
            return null;
        }


        var _configAjax = {
            method: 'POST',
            url: server.Url_Api_Tienda + '/MessageQueue/Clear',
            data: _queue,
        };


        Queue.Clear(_configAjax, function (response) {
            console.log(response);
        });

    };
};

