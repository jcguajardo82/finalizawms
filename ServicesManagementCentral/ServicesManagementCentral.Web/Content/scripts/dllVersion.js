
var DllVersion = new function () {
    // id de la tabla
    this.idTable = '#tblDllVersion';

    //Hace referencia al DataTable creado
    this.table = null;


    // id de la ventana de dialogo de "actualizar"
    this.idDlgUpdate = '#dlgUpdateDllVersion';
    // id de la ventana de dialogo de "crear"
    this.idDlgCreate = '#dlgCreateDllVersion';


    // id del formulario de "actualizar"
    this.idFrmUpdate = '#frmUpdateDllVersion';
    // id del formulario de "crear"
    this.idFrmCreate = '#frmCreateDllVersion';



    //id  collpase object filter
    this.idFilter = '#filterDllVersion';
    //id del formulario de busqueda (filter)
    this.idFrmFilter = '#frmFilter';


    //Inicializa la vista de DllVersion
    this.Initialize = function () {
        this.GetDBServidores();

       
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

            DllVersion.GetDBApplications();
            if (fnCallBack) {
                fnCallBack(response);
            }
        });
    };

    //2.-  una vez que carga sevidores, busca las aplicaciones  (sistemas)
    this.GetDBApplications = function (fnCallBack) {
        ////Mostramos el loading
        utils.showLoading(true);

        //Obtenemos el formato correcto de los parametros para el dataTable
        var _params = utils.DataTableParameters({ AllowPaging: false }, {});

        //agregamos parametros de ordenamiento
        _params.PagingParameter.Sort = "Id_Sistema";
        _params.PagingParameter.Fields = "Id_Sistema,Nombre,Descripcion,NombrePublicacion";


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
            
            if (arrSistemas.length > 0) {
                var optionsHTML = utils.responseToComboBox(arrSistemas, 'Id_Sistema', 'Nombre');
                $('#cmbSistemas').html(optionsHTML);
            }


            //Inicializa la tabla
            DllVersion.InitTable();

            //Agrega los botones de la derecha en la tabla
            DllVersion.AddButtonsToTable();
            if (fnCallBack) {
                fnCallBack(response);
            }
        });
    };

    //Inicializa la tabla
    this.InitTable = function () {

        // Inicializa la tabla
        DllVersion.table = $(DllVersion.idTable).DataTable({
            ajax: DllVersion.GetAllToDataTable,
            filter: true,
            columns: [
                {
                    data: function (row) {
                        var btnDel = '<button  type="button" class="btn btn-default btn-circle" onClick="DllVersion.Delete(' + row.Id_Dll + ');" > <i class="fa fa-trash"></i></button >';
                        return btnDel;
                    },
                    name: 'Actions',
                    title: '', "width": 100, "orderable": false, "className": "text-center",
                },
                { data: 'NombreSistema', name: 'NombreSistema', title: "Sistema", width: 300 },
                { data: 'Nombre', name: 'Nombre', title: "Nombre", width: 300, "className": "text-center", },
                { data: 'Version', name: 'Version', title: "Versión", width: 300 },
                { data: 'ID_Sistema', name: 'ID_Sistema', title: "ID_Sistema", width: 300, visible:false },
                { data: 'NombrePublicacion', name: 'NombrePublicacion', title: "NombrePublicacion", width: 300, visible:false },
            ],
        })
            .on('select', function (e, dt, type, indexes) {
                if (type === 'row') {
                    var item = DllVersion.table.rows(indexes).data()[0];
                    DllVersion.PopulateDataForUpdate(item);
                }
            });

        //Esta clase pinta de verde el header
        $(DllVersion.table.table().header()).addClass('bg-primary');

    };

    //Agrega los botones de la derecha en la tabla
    this.AddButtonsToTable = function () {
        //Agrega los botones de la Derecha
        var buttons = '<button type="button" class="btn btn-primary btn-circle mr-2" data-toggle="modal" data-target="' + DllVersion.idDlgCreate + '"><i class="fa fa-plus"></i></button>' +
            '<button type="button" class="btn btn-primary btn-circle mr-2" onClick="DllVersion.ShowFilter();"><i class="fa fa-list"></i></button>' +
            '<button  type="button" class="btn btn-primary btn-circle" onClick="DllVersion.RefreshTable();" > <i class="fa fa-refresh"></i></button >'
        utils.AddTopRightSection(DllVersion.idTable, buttons);
    };

    //Llamada Ajax para refrescar los datos de la tabla
    this.RefreshTable = function () {

        DllVersion.table.ajax.reload();
    };

    //Llamada Ajax para cargar los datos en la tabla
    this.GetAllToDataTable = function (data, callbackDataTable, settings) {
        // *******************************************************
        // ******* I M P O I R T A N T E  ************************
        // *******************************************************
        // LOS NOMBRES DE LOS CAMPOS DEBEN INICIAR CON MINUSCULA
        // *******************************************************

        //Obtenemos los filtros que vamos a aplicar
        var _filterParams = $(DllVersion.idFrmFilter).formToJson();
       // _filterParams.Nombre = "";
        _filterParams.Nombre = data.search.value;

        //Obtenemos el formato correcto de los parametros para el dataTable
        var _params = utils.DataTableParameters(data, _filterParams);

        //agregamos parametros de ordenamiento
        _params.PagingParameter.Sort = (data.order[0].dir == 'asc' ? '' : '-') + data.columns[data.order[0].column].name;
        _params.PagingParameter.Fields = "Id_Dll,Nombre,Version,ID_Sistema,NombreSistema,NombrePublicacion";

      
        

         //Es necesario enviar así los parametros
        _params = $.param(_params);
      
    
        DllVersion.GetAll(_params, function (response, header, request) {
            //Hasta este momento recibimos la lista de datos, pero para el DataTable necesitamos convertir esa respuesta a un formato especial
            response = utils.DataTableResponse(data, response, request, null);

            // Llamamos al CallBack del DataTable, para que se encargue de dibujar la información
            callbackDataTable(response);

            //ocultamos el loading
            utils.showLoading(false);
        });
    };

    this.GetAll = function (_params, callback) {

        var _configAjax = {
            method: 'GET',
            url: Api.Catalogo.DllVersion,
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

    //Llamada Ajax para agregar un registro
    this.Create = function () {
        

        var values = $(DllVersion.idFrmCreate).formToJson();

        var _configAjax = {
            method: 'POST',
            url: Api.Catalogo.DllVersion,
            data: values,
        }; 

        //Mostramos el loading
        utils.showLoading(true);
        http.ajax(
            _configAjax,
            function (response, header, request) { //callBackSuccess
                //ocultamos el loading
                utils.showLoading(false);

                $(DllVersion.idDlgCreate).modal('hide');

                $.notify({ message: "El Servicio ha sido creado" }, { type: 'success' });
                DllVersion.RefreshTable();
                DllVersion.ClearCreate();
            },
            function (error) { //callBackError
                //ocultamos el loading
                utils.showLoading(false);

                $(DllVersion.idDlgCreate).modal('hide');
               // $.notify({ message: error.Message }, { type: 'danger' });
                DllVersion.ClearCreate();
            }
        );

    };

    //Llamada Ajax para actualizar un registro
    this.Update = function () {
       

        var values = $(DllVersion.idFrmUpdate).formToJson();
        values.IsDeleted = (values.IsDeleted && values.IsDeleted) == 'on' ? true : false;

        var _configAjax = {
            method: 'PUT',
            url: Api.Catalogo.DllVersion + '/' + values.DllVersionId, 
            data: values,
        }; 

        //Mostramos el loading
        utils.showLoading(true);
        http.ajax(
            _configAjax,
            function (response, header, request) { //callBackSuccess
                //ocultamos el loading
                utils.showLoading(false);

                $(DllVersion.idDlgUpdate).modal('hide');
                $.notify({ message: "El Servicio ha sido actualizado" }, { type: 'success' });

                DllVersion.RefreshTable();
                DllVersion.ClearUpdate();
            },
            function (error) { //callBackError
                //ocultamos el loading
                utils.showLoading(false);

                $(DllVersion.idDlgUpdate).modal('hide');
                utils.ShowExceptionMessage(error);

                DllVersion.RefreshTable();
                DllVersion.ClearUpdate();

            }
        );


    };

    //Llamada Ajax para eliminar un registro FISICAMENTE
    this.Delete = function (id) {
        var _configAjax = {
            method: 'DELETE',
            url: Api.Catalogo.DllVersion + '/' + id,
            data: {},
        }; 


        //Mostramos el loading
        utils.showLoading(true);
        http.ajax(
            _configAjax,
            function (response, header, request) { //callBackSuccess
                //ocultamos el loading
                utils.showLoading(false);

                $.notify({ message: "El registro ha sido eliminado" }, { type: 'success' });
                DllVersion.RefreshTable();
            },
            function (error) { //callBackError
                //ocultamos el loading
                utils.showLoading(false);

                utils.ShowExceptionMessage(error);

            }
        );
    };

    //Toggle que se encarga de mostrar u ocultar el filter
    this.ShowFilter = function () {
        $(DllVersion.idFilter).collapse('toggle');
    };

    //Muestra los datos en la ventana  "actualizar"
    this.PopulateDataForUpdate = function (item) {
        $("input[name='Clave']", DllVersion.idFrmUpdate).val(item.Clave);
        $("input[name='Nombre']", DllVersion.idFrmUpdate).val(item.Nombre);
    };

    //limpia el formulario "crear"
    this.ClearCreate = function () {
        $("input", DllVersion.idFrmCreate).val('');
    };

    //limpia el formulario "actualizar"
    this.ClearUpdate = function () {
        $("input", DllVersion.idFrmUpdate).val('');
        $("input[type='checkbox']", DllVersion.idFrmUpdate).iCheck('uncheck').val('on');

    };


    this.GetDllVersion = function () {
        utils.showLoading(true);

        var _storeName = $('#cmbStores option:selected').val();
        var servers = JSON.parse(sessionStorage.getItem(ConfigStores.keyServidores));
        var server = $.grep(servers, function (e) { return e.Serv_Name == _storeName; });
        if (server.length > 0) {
            server = server[0];
        } else {
            return null;
        }

        var _configAjax = {
            method: 'POST',
            url: Api.Catalogo.DllVersion + '/GetDllVersion',
            data: server
        };


        http.ajax(_configAjax, function (response, header, request) {
            utils.showLoading(false);
            if (response.code == 200) {
                DllVersion.RefreshTable();
            }
            

        }, function (error) {
            utils.showLoading(false);
           // utils.ShowExceptionMessage(error);
        });
    };


    this.onChangeStore = function () {
        $('#btnGetDllVersion').prop("disabled", true);
        var isSelected = $('#cmbStores option:selected').val();
        if (isSelected != 'null') {
            $('#btnGetDllVersion').prop("disabled", false);
        }
    };

};