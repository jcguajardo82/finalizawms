
var Servidores = new function () {
    // id de la tabla
    this.idTable = '#tblServidores';

    //Hace referencia al DataTable creado
    this.table = null;


    // id de la ventana de dialogo de "actualizar"
    this.idDlgUpdate = '#dlgUpdateServidores';
    // id de la ventana de dialogo de "crear"
    this.idDlgCreate = '#dlgCreateServidores';


    // id del formulario de "actualizar"
    this.idFrmUpdate = '#frmUpdateServidores';
    // id del formulario de "crear"
    this.idFrmCreate = '#frmCreateServidores';



    //id  collpase object filter
    this.idFilter = '#filterServidores';
    //id del formulario de busqueda (filter)
    this.idFrmFilter = '#frmFilter';

    //Inicializa la vista de Servidores
    this.Initialize = function () {
        this.GetAllUbicacion();

        //Inicializa la tabla
        this.InitTable();

        //Agrega los botones de la derecha en la tabla
        this.AddButtonsToTable();
    };

    //Inicializa la tabla
    this.InitTable = function () {

        // Inicializa la tabla
        Servidores.table = $(Servidores.idTable).DataTable({
            ajax: Servidores.GetAllToDataTable,
            columns: [
                {
                    data: function (row) {
                      //  var btnEdit = '<button  type="button" class="btn btn-default btn-circle mr-1"  data-toggle="modal" data-target="' + Servidores.idDlgUpdate + '" > <i class="fa fa-edit"></i></button >';
                        var btnDel = '<button  type="button" class="btn btn-default btn-circle" onClick="Servidores.Delete(' + row.Id_Num_Servidor + ');" > <i class="fa fa-trash"></i></button >';
                        return btnDel;
                    },
                    name: 'Actions',
                    title: '', "width": 100, "orderable": false, "className": "text-center",
                },
                { data: 'Serv_Name', name: 'Serv_Name', title: "Nombre", width: 300, "className": "text-center", },
                { data: 'Serv_Descripcion', name: 'Serv_Descripcion', title: "Descripción", width: 300 },
                { data: 'Id_Werks', name: 'Id_Werks', title: "Id_Werks", width: 300 },
                { data: 'Url_Api_Tienda', name: 'Url_Api_Tienda', title: "Url_Api_Tienda", width: 300 },
                {
                    data: function (row) {
                        return moment(row.Fec_Movto).format('YYYY-MM-DD h:mm:ss a');
                    }, name: 'Fec_Movto', title: "Fec_Movto", width: 300, "className": "text-center",
                },
            ],
        })
            .on('select', function (e, dt, type, indexes) {
                if (type === 'row') {
                    var item = Servidores.table.rows(indexes).data()[0];
                    Servidores.PopulateDataForUpdate(item);
                }
            });

        //Esta clase pinta de verde el header
        $(Servidores.table.table().header()).addClass('bg-primary');

    };

    //Agrega los botones de la derecha en la tabla
    this.AddButtonsToTable = function () {
        //Agrega los botones de la Derecha
        var buttons = '<button type="button" class="btn btn-primary btn-circle mr-2" data-toggle="modal" data-target="' + Servidores.idDlgCreate + '"><i class="fa fa-plus"></i></button>' +
            '<button type="button" class="btn btn-primary btn-circle mr-2" onClick="Servidores.ShowFilter();"><i class="fa fa-list"></i></button>' +
            '<button  type="button" class="btn btn-primary btn-circle" onClick="Servidores.RefreshTable();" > <i class="fa fa-refresh"></i></button >'
        utils.AddTopRightSection(Servidores.idTable, buttons);
    };

    //Llamada Ajax para refrescar los datos de la tabla
    this.RefreshTable = function () {

        Servidores.table.ajax.reload();
    };

    //Llamada Ajax para cargar los datos en la tabla
    this.GetAllToDataTable = function (data, callbackDataTable, settings) {

        // *******************************************************
        // ******* I M P O I R T A N T E  ************************
        // *******************************************************
        // LOS NOMBRES DE LOS CAMPOS DEBEN INICIAR CON MINUSCULA
        // *******************************************************

        //Obtenemos los filtros que vamos a aplicar
        var _filterParams = $(Servidores.idFrmFilter).formToJson();


        //Obtenemos el formato correcto de los parametros para el dataTable
        var _params = utils.DataTableParameters(data, _filterParams);

        //agregamos parametros de ordenamiento
        _params.PagingParameter.Sort = (data.order[0].dir == 'asc' ? '' : '-') + data.columns[data.order[0].column].name;
        _params.PagingParameter.Fields = "Id_Num_Servidor,Serv_Name,Serv_Descripcion,Id_Werks,Url_Api_Tienda,Fec_Movto";

      
        //Mostramos el loading
        utils.showLoading(true);

         //Es necesario enviar así los parametros
        _params = $.param(_params);
      
    
        Servidores.GetAll(_params, function (response, header, request) {
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
            url: Api.Catalogo.Servidores,
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

                utils.ShowExceptionMessage(error);
            }
        );
    };

    //Llamada Ajax para agregar un registro
    this.Create = function () {
        var values = $(Servidores.idFrmCreate).formToJson();
        var messageError = "";
        
        if (values.Id_Werks.trim() == "") {
            messageError = "Debe capturar el id_werks";
        }
        if (values.Serv_Name.trim() == "") {
            messageError = "Debe capturar el Nombre";
        }
        if (values.Serv_Descripcion.trim() == "") {
            messageError = "Debe capturar la Descripcion";
        }
        if (values.Url_Api_Tienda.trim() == "") {
            messageError = "Debe capturar la URL del API";
        }

        if (!values.UbicacionId || values.UbicacionId=='null') {
            messageError = "Debe capturar la ubicacion";
        }

        if (messageError != "") {
            alert(messageError);
            return false;
        }

        var _configAjax = {
            method: 'POST',
            url: Api.Catalogo.Servidores,
            data: values,
        }; 

        //Mostramos el loading
        utils.showLoading(true);
        http.ajax(
            _configAjax,
            function (response, header, request) { //callBackSuccess
                //ocultamos el loading
                utils.showLoading(false);

                $(Servidores.idDlgCreate).modal('hide');
                $.notify({ message: "La Asignatura ha sido creado" }, { type: 'success' });
                Servidores.RefreshTable();
                Servidores.ClearCreate();
            },
            function (error) { //callBackError
                //ocultamos el loading
                utils.showLoading(false);

                $(Servidores.idDlgCreate).modal('hide');
                Servidores.ClearCreate();
            }
        );

    };

    //Llamada Ajax para actualizar un registro
    this.Update = function () {
        var values = $(Servidores.idFrmUpdate).formToJson();
        values.IsDeleted = (values.IsDeleted && values.IsDeleted) == 'on' ? true : false;

        var messageError = "";
        if (values.Id_Werks.trim() == "") {
            messageError = "Debe capturar el id_werks";
        }
        if (values.Serv_Name.trim() == "") {
            messageError = "Debe capturar el Nombre";
        }
        if (values.Serv_Descripcion.trim() == "") {
            messageError = "Debe capturar la Descripcion";
        }
        if (values.Url_Api_Tienda.trim() == "") {
            messageError = "Debe capturar la URL del API";
        }

        if (!values.UbicacionId || values.UbicacionId == 'null') {
            messageError = "Debe capturar la ubicacion";
        }

        var _configAjax = {
            method: 'PUT',
            url: Api.Catalogo.Servidores + '/' + values.ServidoresId, 
            data: values,
        }; 

        //Mostramos el loading
        utils.showLoading(true);
        http.ajax(
            _configAjax,
            function (response, header, request) { //callBackSuccess
                //ocultamos el loading
                utils.showLoading(false);

                $(Servidores.idDlgUpdate).modal('hide');
                $.notify({ message: "La Asignatura ha sido actualizado" }, { type: 'success' });

                Servidores.RefreshTable();
                Servidores.ClearUpdate();

            },
            function (error) { //callBackError
                //ocultamos el loading
                utils.showLoading(false);

                $(Servidores.idDlgUpdate).modal('hide');
                utils.ShowExceptionMessage(error);

                Servidores.RefreshTable();
                Servidores.ClearUpdate();

            }
        );


    };

    //Llamada Ajax para eliminar un registro FISICAMENTE
    this.Delete = function (id) {
        var _configAjax = {
            method: 'DELETE',
            url: Api.Catalogo.Servidores + '/' + id,
            data: {},
        }; 

        //Mostramos el loading
        utils.showLoading(true);
        http.ajax(
            _configAjax,
            function (response, header, request) { //callBackSuccess
                //ocultamos el loading
                utils.showLoading(false);

                $.notify({ message: "La Asignatura ha sido eliminado" }, { type: 'success' });
                Servidores.RefreshTable();
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
        $(Servidores.idFilter).collapse('toggle');
    };

    //Muestra los datos en la ventana  "actualizar"
    this.PopulateDataForUpdate = function (item) {
        $("input[name='Clave']", Servidores.idFrmUpdate).val(item.Clave);
        $("input[name='Nombre']", Servidores.idFrmUpdate).val(item.Nombre);
    };

    //limpia el formulario "crear"
    this.ClearCreate = function () {
        $("input", Servidores.idFrmCreate).val('');
    };

    //limpia el formulario "actualizar"
    this.ClearUpdate = function () {
        $("input", Servidores.idFrmUpdate).val('');
        $("input[type='checkbox']", Servidores.idFrmUpdate).iCheck('uncheck').val('on');

    };

    this.GetAllUbicacion = function () {
        //var _filterParams = $(Ubicacion.idFrmFilter).formToJson();
        var _filterParams = {};

        //Obtenemos el formato correcto de los parametros para el dataTable
        var _params = utils.DataTableParameters(null, _filterParams);

        //agregamos parametros de ordenamiento
        _params.PagingParameter.Sort = 'UbicacionId';
        _params.PagingParameter.Fields = "UbicacionId,KeyMap,Label";
        _params.PagingParameter.AllowPaging = false;
        //Es necesario enviar así los parametros
        _params = $.param(_params);


        Ubicacion.GetAll(_params, function (response, header, request) {
            ubicaciones = response;
            var cmbUbicacion = utils.responseToComboBox(response, 'UbicacionId', 'Label');
            $('#cmbUbicacion').html(cmbUbicacion);
        });
    };
};