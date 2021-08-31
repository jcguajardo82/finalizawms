var _isReloadTimer = null;
var _isTimes = 0;
var CPanelLocal = new function () {
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
    this.plantillaCard = '<div class="card"><div class="card-header">{processName}</div><div class="card-body text-center"><div class="widget p-0 text-center"> <div class="m-b-md"><i class="fa fa-warning fa-4x"></i><h1 class="m-xs">{processQty}</h1><h3 class="font-bold no-margins">{label}</h3></div></div><button onClick="CPanelLocal.OnClickShowDetails(\'{serviceName}\',{isWs})" class="btn btn-rounded btn-warning">Ver Detalles</button></div></div>';

    this.Initialize = function () {
       this.clearSession();
       this.GetDBServidores();
    };

    //Limpia el contenido del localstorage
    this.clearSession = function () {
        sessionStorage.removeItem(CPanelLocal.keyAllWS);
        sessionStorage.removeItem(CPanelLocal.keyWSGroups);
        sessionStorage.removeItem(CPanelLocal.keyServicios);
        sessionStorage.removeItem(CPanelLocal.keyServidores);
    };

    //crea un nuevo timer
    this.NewTimer = function () {
        var time = CPanelLocal.CalcMinutes( CPanelLocal.minutesToReload );
        _isReloadTimer = window.setInterval(function (time ) {
            _isTimes += 1;
            if (!CPanelLocal.ClearTimer()) {
                CPanelLocal.GetDBServidores();
            }
        }, time);
    };

    //limpia el timer
    this.ClearTimer = function () {
        if (_isTimes == 10) {
            window.clearInterval(_isReloadTimer);
            _isTimes = 0;
            CPanelLocal.NewTimer();
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
                    CPanelLocal.originDataTable = id;
                    CPanelLocal.InitTables(id);
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
        // CPanelLocal.clearTablesWSQueue();
        
            $('.hide-tab-ws').removeClass('super-hide');
            $('.hide-tab-msmq').removeClass('super-hide');
     
        if (isWs == undefined) {
            $('#tabWsMQ a[href="#ws"]').tab('show');
            CPanelLocal.InitTableWS(serviceName, isWs);
            CPanelLocal.InitTableQueue(serviceName, isWs);
        } else {

            if (isWs) {
                $('#tabWsMQ a[href="#ws"]').tab('show');
                CPanelLocal.InitTableWS(serviceName, isWs);
                $('.hide-tab-msmq').addClass('super-hide');
            } else {
               
                $('#tabWsMQ li a[href="#msmq"]').tab('show');
                CPanelLocal.InitTableQueue(serviceName, isWs);
                $('.hide-tab-ws').addClass('super-hide');
            }
        }
    };

    this.clearTablesWSQueue = function () {
        if (CPanelLocal.tableWS != null) {
            CPanelLocal.tableWS.clear().destroy();
        }

        if (CPanelLocal.tableQueue != null) {
            CPanelLocal.tableQueue.clear().destroy();
        }

    };

    //Inicializa la tabla que se muestra en el modal
    this.InitTableWS = function (serviceName) {
        this.ServiceName = serviceName;
        if (CPanelLocal.tableWS) {
           
            CPanelLocal.tableWS.ajax.reload();
            return null;
        }
        
        // Inicializa la tabla
        CPanelLocal.tableWS = $(CPanelLocal.idTableWS).DataTable({
            ajax: function (data, callback, settings) {
                callback({ data: CPanelLocal.GetDataToTableWS() });
            },
            serverSide: false,
            filter: true,
            columns: [
                {
                    data: function (row, event, index) {
                        var _row = utils.b64EncodeUnicode(JSON.stringify(row));
                        var btnLog = '<button  type="button" class="btn btn-default btn-circle mr-1"  onClick="CPanelLocal.EVLogs(\'' + row.Name + '\',\'' + row.StoreName + '\');"  > <i class="fa fa-search"></i></button >';
                        var btnPlay = '<button  type="button" class="btn btn-default btn-circle" title="Iniciar" onClick="CPanelLocal.Start(\'' + _row + '\');" > <i class="fa fa-play"></i></button >';
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
       
        var params = sessionStorage.getItem(CPanelLocal.keyWSGroups);
        if (params == null) {
            return null;
        }

        params = JSON.parse(params);
        if (this.originDataTable == 'gallery') {
            params = params.Services[CPanelLocal.ServiceName].data;
        } else {
            params = params.Map[this.originDataTable]['WS'].data;
        }
        
        params = $.grep(params, function (e) { return e.Status == "Stopped"; });
        if (params.length > 0) {
            $('#bdgService').html(params.length);
        } else {
            $('#bdgService').html('');
        }
        console.log(params);
        return params;
    };

    //Inicializa la tabla que se muestra en el modal
    this.InitTableQueue = function (serviceName) {
        this.ServiceName = serviceName;
        if (CPanelLocal.tableQueue) {
            CPanelLocal.tableQueue.ajax.reload();
            return null;
        }

        // Inicializa la tabla
        CPanelLocal.tableQueue = $(CPanelLocal.idTableQueue).DataTable({
           
            ajax: function (data, callback, settings) {
                callback({ data: CPanelLocal.GetDataToTableQueue() });
            },
            serverSide: false,
            filter: true,
            info: true,
            columns: [
                {
                    data: function (row, event, index) {
                        var _row = utils.b64EncodeUnicode(JSON.stringify(row));
                        var btnDelete = '<button  type="button" class="btn btn-default btn-circle" title="Iniciar" onClick="CPanelLocal.ClearQueue(\'' + _row + '\');" > <i class="fa fa-trash"></i></button >';
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
        var params = sessionStorage.getItem(CPanelLocal.keyWSGroups);
        if (params == null) {
            return null;
        }

        params = JSON.parse(params);
        if (this.originDataTable == 'gallery') {
            params = params.Queues[CPanelLocal.ServiceName].data;
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

            sessionStorage.setItem(CPanelLocal.keyServidores, JSON.stringify(arrServers));
            CPanelLocal.GetInfoFromDB();
            //if (arrServers.length > 0) {
            //    CPanelLocal.GetDBServicios(arrServers);
            //}
        });
    };

    //Obtiene la lista de ServiciosWindows y Queues
    this.GetInfoFromDB = function () {
        utils.showLoading(true);

        http.ajax(
            {
                method: 'GET',
                url: Api.CPanel + '/GetFromDataBase',
                data: {}
            },
            //callBack que se ejecuta si la respuesta es exitosa
            function (response, header, request) {
                utils.showLoading(false);
                
                var exists = false;

                var responseByStoreName = {};  //no funciona
                $.each(response.WindowsServices, function (index, row) {
                    if (!responseByStoreName[row.StoreName]) {

                        responseByStoreName[row.StoreName] = { WS: [], MsMq: [] };
                    }
                    exists = true;
                    responseByStoreName[row.StoreName].WS.push(row);
                });
               
                
                $.each(response.MessageQueues, function (index, row) {
                    exists = true;
                    responseByStoreName[row.StoreName].MsMq.push(row);
                });

                sessionStorage.setItem(CPanelLocal.keyAllWS,JSON.stringify( responseByStoreName));

                if (exists) {
                    CPanelLocal.CalcTotalesWS(responseByStoreName);
                   
                    var totals = sessionStorage.getItem(CPanelLocal.keyWSGroups);
                    
                    if (totals != null) {
                        totals = JSON.parse(totals);

                        var existIncidences = CPanelLocal.TotalesToHtml(totals);
                        
                        if (existIncidences == true) {
                            CPanelLocal.InitializeCarrusel('#carruselProcess');
                            CPanelLocal.InitializeMap(totals);
                        } else {
                            $('#carruselProcess').html('<h1>No existen incidencias reportadas.</h1>');
                        }
                    }
                } else {
                    $('#carruselProcess').html('<h1>No existen incidencias reportadas.</h1>');
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
        var servidores = JSON.parse(sessionStorage.getItem(CPanelLocal.keyServidores));
       
        var Totals = {
            Services: {},
            Queues: {},
            Map : {}
        };

        
        $.each(allWS, function (storeName, wServices) {
            Totals = CPanelLocal.LlenaServicios(servidores, wServices.WS, Totals);
            Totals = CPanelLocal.LlenaQueues(servidores, wServices.MsMq, Totals);
        });
       
        var wsTotals = JSON.stringify(Totals);
       
        sessionStorage.setItem(CPanelLocal.keyWSGroups, wsTotals);
        
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
        CPanelLocal.clearCarrusel('#carruselProcess');
        $slick = $('#carruselProcess');
        $slick.html('');

        var anyServicesStopped = false;
        $.each(Totals.Services, function (key, item) {
            
            if (item.totales.Stopped > 0) {
               
                anyServicesStopped = true;
                var plantilla = CPanelLocal.plantillaCard;
               
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
            var plantilla = CPanelLocal.plantillaCard;
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
        CPanelLocal.InitTables(serviceName, isWs);
        
        $('#dlgDetailsWS').modal('show');
    };

    //Limpia el mapa
    this.clearMap = function () {
        $(".mapcontainer").addClass('hidden');
    };

    //Actualiza los totales
    this.UpdateWSTotals= function (data) {
        var params = sessionStorage.getItem(CPanelLocal.keyWSGroups);
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
            sessionStorage.setItem(CPanelLocal.keyWSGroups, wsTotals);


            var existIncidences = CPanelLocal.TotalesToHtml(params);
            if (!existIncidences) {
                CPanelLocal.clearMap();
            } else {
                console.log(params);
                CPanelLocal.InitializeMap(params);
            }
        }


        //return params;
    };

    //Realiza la petición para iniciar un servicio
    this.Start = function (row) {
        var servers = JSON.parse(sessionStorage.getItem(CPanelLocal.keyServidores));
        row = JSON.parse(utils.b64DecodeUnicode(row));

        var server = $.grep(servers, function (e) { return e.Serv_Name == row.StoreName; });
        if (server.length > 0) {
            server = server[0];
        } else {
            alert('El servidor "' + row.StoreName + '" no tiene establecida la url de la API.');
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
                    CPanelLocal.UpdateWSTotals(response.data);
                    CPanelLocal.InitTables(row.Name);
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
       
        var servers = JSON.parse(sessionStorage.getItem(CPanelLocal.keyServidores));
        var server = $.grep(servers, function (e) { return e.Serv_Name == storeName; });
        if (server.length > 0) {
            server = server[0];
        } else {
            alert('El servidor "' + storeName + '" no tiene establecida la url de la API.' );
           // $.notify({ message: 'El servidor "' + storeName + '" no tiene establecida la url de la API.' }, { type: 'warning' });
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

      
        http.ajax(_configAjax, function (response, header, request) {
            utils.showLoading(false);
            $('#titleLogsEV').html(storeName + ' - [' + serviceName + ']');
            if (response.code == 200) {
                CPanelLocal.initDTEventViewer(response.data);
            } else {
                CPanelLocal.initDTEventViewer(null);
            }
            
            $('#dlgLogsEV').modal('show');

        }, function (error) {
            utils.showLoading(false);
            
            CPanelLocal.initDTEventViewer(null);
                $('#dlgLogsEV').modal('show');
        });

    };

    //Inicializa la tabla que muestra la información del event Viewer
    this.initDTEventViewer = function (_data) {
        if (CPanelLocal.tblEventViewer != null) {
            CPanelLocal.tblEventViewer.destroy();
            $('#tblEventViewer').empty();
        }
        // Inicializa la tabla
        CPanelLocal.tblEventViewer = $('#tblEventViewer').DataTable({
            
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

   

    this.ClearQueue = function (_queue) {
        var servers = JSON.parse(sessionStorage.getItem(CPanelLocal.keyServidores));
        _queue = JSON.parse(utils.b64DecodeUnicode(_queue));

      
        var server = $.grep(servers, function (e) { return e.Serv_Name == _queue.StoreName; });
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

