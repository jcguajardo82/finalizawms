
var Servicios = new function () {
    // id de la tabla
    this.idTable = '#tblServicios';

    //Hace referencia al DataTable creado
    this.table = null;


    // id de la ventana de dialogo de "actualizar"
    this.idDlgUpdate = '#dlgUpdateServicios';
    // id de la ventana de dialogo de "crear"
    this.idDlgCreate = '#dlgCreateServicios';


    // id del formulario de "actualizar"
    this.idFrmUpdate = '#frmUpdateServicios';
    // id del formulario de "crear"
    this.idFrmCreate = '#frmCreateServicios';



    //id  collpase object filter
    this.idFilter = '#filterServicios';
    //id del formulario de busqueda (filter)
    this.idFrmFilter = '#frmFilter';


    //Inicializa la vista de Servicios
    this.Initialize = function () {

        //Inicializa la tabla
        this.InitTable();

        //Agrega los botones de la derecha en la tabla
        this.AddButtonsToTable();
    };

    //Inicializa la tabla
    this.InitTable = function () {

        // Inicializa la tabla
        Servicios.table = $(Servicios.idTable).DataTable({
            ajax: Servicios.GetAllToDataTable,
            columns: [
                {
                    data: function (row) {
                        var btnEdit = '<button  type="button" class="btn btn-default btn-circle mr-1"  data-toggle="modal" data-target="' + Servicios.idDlgUpdate + '" > <i class="fa fa-edit"></i></button >';
                        var btnDel = '<button  type="button" class="btn btn-default btn-circle" onClick="Servicios.Delete(' + row.Id_Num_Servicio + ');" > <i class="fa fa-trash"></i></button >';
                        return btnDel;
                    },
                    name: 'Actions',
                    title: '', "width": 100, "orderable": false, "className": "text-center",
                },
                { data: 'Nom_Servicio', name: 'Nom_Servicio', title: "Nombre", width: 300, "className": "text-center", },
                { data: 'Desc_Servicio', name: 'Desc_Servicio', title: "Descripción", width: 300 },
                { data: 'Disp_Servicio', name: 'Disp_Servicio', title: "Disp_Servicio", width: 300 },
                {
                    data: function (row) {
                        return moment(row.Fec_Movto).format('YYYY-MM-DD h:mm:ss a');
                    }, name: 'Fec_Movto', title: "Fec_Movto", width: 300, "className": "text-center",
                },
            ],
        })
            .on('select', function (e, dt, type, indexes) {
                if (type === 'row') {
                    var item = Servicios.table.rows(indexes).data()[0];
                    Servicios.PopulateDataForUpdate(item);
                }
            });

        //Esta clase pinta de verde el header
        $(Servicios.table.table().header()).addClass('bg-primary');

    };

    //Agrega los botones de la derecha en la tabla
    this.AddButtonsToTable = function () {
        //Agrega los botones de la Derecha
        var buttons = '<button type="button" class="btn btn-primary btn-circle mr-2" data-toggle="modal" data-target="' + Servicios.idDlgCreate + '"><i class="fa fa-plus"></i></button>' +
            '<button type="button" class="btn btn-primary btn-circle mr-2" onClick="Servicios.ShowFilter();"><i class="fa fa-list"></i></button>' +
            '<button  type="button" class="btn btn-primary btn-circle" onClick="Servicios.RefreshTable();" > <i class="fa fa-refresh"></i></button >'
        utils.AddTopRightSection(Servicios.idTable, buttons);
    };

    //Llamada Ajax para refrescar los datos de la tabla
    this.RefreshTable = function () {

        Servicios.table.ajax.reload();
    };

    //Llamada Ajax para cargar los datos en la tabla
    this.GetAllToDataTable = function (data, callbackDataTable, settings) {



        // *******************************************************
        // ******* I M P O I R T A N T E  ************************
        // *******************************************************
        // LOS NOMBRES DE LOS CAMPOS DEBEN INICIAR CON MINUSCULA
        // *******************************************************

        //Obtenemos los filtros que vamos a aplicar
        var _filterParams = $(Servicios.idFrmFilter).formToJson();


        //Obtenemos el formato correcto de los parametros para el dataTable
        var _params = utils.DataTableParameters(data, _filterParams);

        //agregamos parametros de ordenamiento
        _params.PagingParameter.Sort = (data.order[0].dir == 'asc' ? '' : '-') + data.columns[data.order[0].column].name;
        _params.PagingParameter.Fields = "Id_Num_Servicio,Nom_Servicio,Desc_Servicio,Disp_Servicio,Fec_Movto";

      
        

         //Es necesario enviar así los parametros
        _params = $.param(_params);
      
    
        Servicios.GetAll(_params, function (response, header, request) {
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
            url: Api.Catalogo.Servicios,
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
        var values = $(Servicios.idFrmCreate).formToJson();

        var _configAjax = {
            method: 'POST',
            url: Api.Catalogo.Servicios,
            data: values,
        }; 

        //Mostramos el loading
        utils.showLoading(true);
        http.ajax(
            _configAjax,
            function (response, header, request) { //callBackSuccess
                //ocultamos el loading
                utils.showLoading(false);

                $(Servicios.idDlgCreate).modal('hide');

                $.notify({ message: "El Servicio ha sido creado" }, { type: 'success' });
                Servicios.RefreshTable();
                Servicios.ClearCreate();
            },
            function (error) { //callBackError
                //ocultamos el loading
                utils.showLoading(false);

                $(Servicios.idDlgCreate).modal('hide');
               // $.notify({ message: error.Message }, { type: 'danger' });
                Servicios.ClearCreate();
            }
        );

    };

    //Llamada Ajax para actualizar un registro
    this.Update = function () {
       

        var values = $(Servicios.idFrmUpdate).formToJson();
        values.IsDeleted = (values.IsDeleted && values.IsDeleted) == 'on' ? true : false;

        var _configAjax = {
            method: 'PUT',
            url: Api.Catalogo.Servicios + '/' + values.ServiciosId, 
            data: values,
        }; 

        //Mostramos el loading
        utils.showLoading(true);
        http.ajax(
            _configAjax,
            function (response, header, request) { //callBackSuccess
                //ocultamos el loading
                utils.showLoading(false);

                $(Servicios.idDlgUpdate).modal('hide');
                $.notify({ message: "El Servicio ha sido actualizado" }, { type: 'success' });

                Servicios.RefreshTable();
                Servicios.ClearUpdate();
            },
            function (error) { //callBackError
                //ocultamos el loading
                utils.showLoading(false);

                $(Servicios.idDlgUpdate).modal('hide');
                utils.ShowExceptionMessage(error);

                Servicios.RefreshTable();
                Servicios.ClearUpdate();

            }
        );


    };

    //Llamada Ajax para eliminar un registro FISICAMENTE
    this.Delete = function (id) {
        var _configAjax = {
            method: 'DELETE',
            url: Api.Catalogo.Servicios + '/' + id,
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
                Servicios.RefreshTable();
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
        $(Servicios.idFilter).collapse('toggle');
    };

    //Muestra los datos en la ventana  "actualizar"
    this.PopulateDataForUpdate = function (item) {
        $("input[name='Clave']", Servicios.idFrmUpdate).val(item.Clave);
        $("input[name='Nombre']", Servicios.idFrmUpdate).val(item.Nombre);
    };

    //limpia el formulario "crear"
    this.ClearCreate = function () {
        $("input", Servicios.idFrmCreate).val('');
    };

    //limpia el formulario "actualizar"
    this.ClearUpdate = function () {
        $("input", Servicios.idFrmUpdate).val('');
        $("input[type='checkbox']", Servicios.idFrmUpdate).iCheck('uncheck').val('on');

    };
};