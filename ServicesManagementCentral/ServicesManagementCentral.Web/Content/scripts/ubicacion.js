
var Ubicacion = new function () {
    // id de la tabla
    this.idTable = '#tblUbicacion';

    //Hace referencia al DataTable creado
    this.table = null;


    // id de la ventana de dialogo de "actualizar"
    this.idDlgUpdate = '#dlgUpdateUbicacion';
    // id de la ventana de dialogo de "crear"
    this.idDlgCreate = '#dlgCreateUbicacion';


    // id del formulario de "actualizar"
    this.idFrmUpdate = '#frmUpdateUbicacion';
    // id del formulario de "crear"
    this.idFrmCreate = '#frmCreateUbicacion';



    //id  collpase object filter
    this.idFilter = '#filterUbicacion';
    //id del formulario de busqueda (filter)
    this.idFrmFilter = '#frmFilter';


    //Inicializa la vista de Ubicacion
    this.Initialize = function () {

        //Inicializa la tabla
        this.InitTable();

        //Agrega los botones de la derecha en la tabla
        this.AddButtonsToTable();
    };

    //Inicializa la tabla
    this.InitTable = function () {

        // Inicializa la tabla
        Ubicacion.table = $(Ubicacion.idTable).DataTable({
            ajax: Ubicacion.GetAllToDataTable,
            columns: [
                {
                    data: function (row) {
                      //  var btnEdit = '<button  type="button" class="btn btn-default btn-circle mr-1"  data-toggle="modal" data-target="' + Ubicacion.idDlgUpdate + '" > <i class="fa fa-edit"></i></button >';
                        var btnDel = '<button  type="button" class="btn btn-default btn-circle" onClick="Ubicacion.Delete(' + row.Id_Num_Ubicacion + ');" > <i class="fa fa-trash"></i></button >';
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
                    var item = Ubicacion.table.rows(indexes).data()[0];
                    Ubicacion.PopulateDataForUpdate(item);
                }
            });

        //Esta clase pinta de verde el header
        $(Ubicacion.table.table().header()).addClass('bg-primary');

    };

    //Agrega los botones de la derecha en la tabla
    this.AddButtonsToTable = function () {
        //Agrega los botones de la Derecha
        var buttons = '<button type="button" class="btn btn-primary btn-circle mr-2" data-toggle="modal" data-target="' + Ubicacion.idDlgCreate + '"><i class="fa fa-plus"></i></button>' +
            '<button type="button" class="btn btn-primary btn-circle mr-2" onClick="Ubicacion.ShowFilter();"><i class="fa fa-list"></i></button>' +
            '<button  type="button" class="btn btn-primary btn-circle" onClick="Ubicacion.RefreshTable();" > <i class="fa fa-refresh"></i></button >'
        utils.AddTopRightSection(Ubicacion.idTable, buttons);
    };

    //Llamada Ajax para refrescar los datos de la tabla
    this.RefreshTable = function () {

        Ubicacion.table.ajax.reload();
    };

    //Llamada Ajax para cargar los datos en la tabla
    this.GetAllToDataTable = function (data, callbackDataTable, settings) {

        // *******************************************************
        // ******* I M P O I R T A N T E  ************************
        // *******************************************************
        // LOS NOMBRES DE LOS CAMPOS DEBEN INICIAR CON MINUSCULA
        // *******************************************************

        //Obtenemos los filtros que vamos a aplicar
        var _filterParams = $(Ubicacion.idFrmFilter).formToJson();


        //Obtenemos el formato correcto de los parametros para el dataTable
        var _params = utils.DataTableParameters(data, _filterParams);

        //agregamos parametros de ordenamiento
        _params.PagingParameter.Sort = (data.order[0].dir == 'asc' ? '' : '-') + data.columns[data.order[0].column].name;
        _params.PagingParameter.Fields = "UbicacionId,KeyMap,Label";;

      
        //Mostramos el loading
        utils.showLoading(true);

         //Es necesario enviar así los parametros
        _params = $.param(_params);
      
    
        Ubicacion.GetAll(_params, function (response, header, request) {
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
            url: Api.Catalogo.Ubicacion,
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
        var values = $(Ubicacion.idFrmCreate).formToJson();
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
        if (messageError != "") {
            alert(messageError);
            return false;
        }

        var _configAjax = {
            method: 'POST',
            url: Api.Catalogo.Ubicacion,
            data: values,
        }; 

        //Mostramos el loading
        utils.showLoading(true);
        http.ajax(
            _configAjax,
            function (response, header, request) { //callBackSuccess
                //ocultamos el loading
                utils.showLoading(false);

                $(Ubicacion.idDlgCreate).modal('hide');
                $.notify({ message: "La Asignatura ha sido creado" }, { type: 'success' });
                Ubicacion.RefreshTable();
                Ubicacion.ClearCreate();
            },
            function (error) { //callBackError
                //ocultamos el loading
                utils.showLoading(false);

                $(Ubicacion.idDlgCreate).modal('hide');
                Ubicacion.ClearCreate();
            }
        );

    };

    //Llamada Ajax para actualizar un registro
    this.Update = function () {
        var values = $(Ubicacion.idFrmUpdate).formToJson();
        values.IsDeleted = (values.IsDeleted && values.IsDeleted) == 'on' ? true : false;

        var _configAjax = {
            method: 'PUT',
            url: Api.Catalogo.Ubicacion + '/' + values.UbicacionId, 
            data: values,
        }; 

        //Mostramos el loading
        utils.showLoading(true);
        http.ajax(
            _configAjax,
            function (response, header, request) { //callBackSuccess
                //ocultamos el loading
                utils.showLoading(false);

                $(Ubicacion.idDlgUpdate).modal('hide');
                $.notify({ message: "La Asignatura ha sido actualizado" }, { type: 'success' });

                Ubicacion.RefreshTable();
                Ubicacion.ClearUpdate();

            },
            function (error) { //callBackError
                //ocultamos el loading
                utils.showLoading(false);

                $(Ubicacion.idDlgUpdate).modal('hide');
                utils.ShowExceptionMessage(error);

                Ubicacion.RefreshTable();
                Ubicacion.ClearUpdate();

            }
        );


    };

    //Llamada Ajax para eliminar un registro FISICAMENTE
    this.Delete = function (id) {
        var _configAjax = {
            method: 'DELETE',
            url: Api.Catalogo.Ubicacion + '/' + id,
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
                Ubicacion.RefreshTable();
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
        $(Ubicacion.idFilter).collapse('toggle');
    };

    //Muestra los datos en la ventana  "actualizar"
    this.PopulateDataForUpdate = function (item) {
        $("input[name='Clave']", Ubicacion.idFrmUpdate).val(item.Clave);
        $("input[name='Nombre']", Ubicacion.idFrmUpdate).val(item.Nombre);
    };

    //limpia el formulario "crear"
    this.ClearCreate = function () {
        $("input", Ubicacion.idFrmCreate).val('');
    };

    //limpia el formulario "actualizar"
    this.ClearUpdate = function () {
        $("input", Ubicacion.idFrmUpdate).val('');
        $("input[type='checkbox']", Ubicacion.idFrmUpdate).iCheck('uncheck').val('on');

    };
};