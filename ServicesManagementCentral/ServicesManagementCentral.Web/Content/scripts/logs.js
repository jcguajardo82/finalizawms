
var Logs = new function () {
    this.table = null;
    this.idTable = '#tblLogs';
    this.keyServidores = 'DbServidores';
    this.idDlgCreate = '#dlgCreateLogs';
    this.idFilter = '#filterLogs';
    this.idFrmCreate = '#frmCreateLogs';

    this.Initialize = function () {
        //Inicializa la tabla
        this.InitTable();

        //Agrega los botones de la derecha en la tabla
        this.AddButtonsToTable();
    };

    //Inicializa la tabla
    this.InitTable = function () {
        // Inicializa la tabla
        Logs.table = $(Logs.idTable).DataTable({
            ajax: Logs.GetAllToDataTable,
            columns: [
                {
                    data: function (row) {
                        console.log(row);
                        var btnDel = '<button  type="button" class="btn btn-default btn-circle" onClick="Logs.Delete(' + row.Id_Num_Log + ');" > <i class="fa fa-trash"></i></button >';
                        return btnDel;
                    },
                    name: 'Actions',
                    title: '', "width": 100, "orderable": false, "className": "text-center",
                },
                { data: 'Log_Name', name: 'Log_Name', title: "Nombre", width: 300, "className": "text-center", },
                { data: 'Descripcion', name: 'Descripcion', title: "Descripción", width: 300 },
               
            ],
        });
          

        //Esta clase pinta de verde el header
        $(Logs.table.table().header()).addClass('bg-primary');

    };

    //Agrega los botones de la derecha en la tabla
    this.AddButtonsToTable = function () {
        //Agrega los botones de la Derecha
        var buttons = '<button type="button" class="btn btn-primary btn-circle mr-2" data-toggle="modal" data-target="' + Logs.idDlgCreate + '"><i class="fa fa-plus"></i></button>' +
            '<button type="button" class="btn btn-primary btn-circle mr-2" onClick="Logs.ShowFilter();"><i class="fa fa-list"></i></button>' +
            '<button  type="button" class="btn btn-primary btn-circle" onClick="Logs.RefreshTable();" > <i class="fa fa-refresh"></i></button >'
        utils.AddTopRightSection(Logs.idTable, buttons);
    };

    //Llamada Ajax para cargar los datos en la tabla
    this.GetAllToDataTable = function (data, callbackDataTable, settings) {
        // *******************************************************
        // ******* I M P O I R T A N T E  ************************
        // *******************************************************
        // LOS NOMBRES DE LOS CAMPOS DEBEN INICIAR CON MINUSCULA
        // *******************************************************

        //Obtenemos los filtros que vamos a aplicar
        var _filterParams = $(Logs.idFrmFilter).formToJson();


        //Obtenemos el formato correcto de los parametros para el dataTable
        var _params = utils.DataTableParameters(data, _filterParams);

        //agregamos parametros de ordenamiento
        _params.PagingParameter.Sort = (data.order[0].dir == 'asc' ? '' : '-') + data.columns[data.order[0].column].name;
        _params.PagingParameter.Fields = "Id_Num_Log,Log_Name,Descripcion,Fec_Movto";




        //Es necesario enviar así los parametros
        _params = $.param(_params);


        Logs.GetAll(_params, function (response, header, request) {
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
            url: Api.Catalogo.Logs,
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

    //Toggle que se encarga de mostrar u ocultar el filter
    this.ShowFilter = function () {
        $(Logs.idFilter).collapse('toggle');
    };

    //Llamada Ajax para refrescar los datos de la tabla
    this.RefreshTable = function () {
        Logs.table.ajax.reload();
    };

    //Llamada Ajax para agregar un registro
    this.Create = function () {
        var values = $(Logs.idFrmCreate).formToJson();

        var _configAjax = {
            method: 'POST',
            url: Api.Catalogo.Logs,
            data: values,
        };

        //Mostramos el loading
        utils.showLoading(true);
        http.ajax(
            _configAjax,
            function (response, header, request) { //callBackSuccess
                //ocultamos el loading
                utils.showLoading(false);

                $(Logs.idDlgCreate).modal('hide');

                $.notify({ message: "El Log ha sido creado" }, { type: 'success' });
                Logs.RefreshTable();
                Logs.ClearCreate();
            },
            function (error) {
                utils.showLoading(false);

                $(Logs.idDlgCreate).modal('hide');
                Logs.ClearCreate();
            }
        );

    };

    //limpia el formulario "crear"
    this.ClearCreate = function () {
        $("input", Logs.idFrmCreate).val('');
    };

    //Llamada Ajax para eliminar un registro FISICAMENTE
    this.Delete = function (id) {
        var _configAjax = {
            method: 'DELETE',
            url: Api.Catalogo.Logs + '/' + id,
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
                Logs.RefreshTable();
            },
            function (error) { //callBackError
                //ocultamos el loading
                utils.showLoading(false);
                utils.ShowExceptionMessage(error);

            }
        );
    };

};