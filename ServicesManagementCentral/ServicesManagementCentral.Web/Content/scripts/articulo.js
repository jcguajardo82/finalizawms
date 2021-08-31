
var Articulo = new function () {
    // id de la tabla
    this.idTable = '#tblArticulo';

    //Hace referencia al DataTable creado
    this.table = null;


    // id de la ventana de dialogo de "actualizar"
    this.idDlgUpdate = '#dlgUpdateArticulo';
    // id de la ventana de dialogo de "crear"
    this.idDlgCreate = '#dlgCreateArticulo';


    // id del formulario de "actualizar"
    this.idFrmUpdate = '#frmUpdateArticulo';
    // id del formulario de "crear"
    this.idFrmCreate = '#frmCreateArticulo';



    //id  collpase object filter
    this.idFilter = '#filterArticulo';
    //id del formulario de busqueda (filter)
    this.idFrmFilter = '#frmArticuloFilter';


    //Inicializa la vista de Articulo
    this.Initialize = function () {

        //Inicializa la tabla
        this.InitTable();

        //Agrega los botones de la derecha en la tabla
        this.AddButtonsToTable();

        this.InitAutoComplete('Id_Num_SKUint', 'ddDesc_Ensamb','Num_CodBarra');
    };

    //Inicializa la tabla
    this.InitTable = function () {

        // Inicializa la tabla
        Articulo.table = $(Articulo.idTable).DataTable({
            ajax: Articulo.GetAllToDataTable,
            columns: [
                { data: 'Id_Num_SKUint', name: 'Id_Num_SKUint', title: "Id_Num_SKUint" },
                { data: 'Num_CodBarra', name: 'Num_CodBarra', title: "Num_CodBarra" },
                { data: 'ddDesc_Ensamb', name: 'ddDesc_Ensamb', title: "ddDesc_Ensamb" },
            ],
        })
            .on('select', function (e, dt, type, indexes) {
                if (type === 'row') {
                    //var item = Articulo.table.rows(indexes).data()[0];
                    //Articulo.PopulateDataForUpdate(item);
                }
            });

        //Esta clase pinta de verde el header
        $(Articulo.table.table().header()).addClass('bg-primary');

    };

    //Agrega los botones de la derecha en la tabla
    this.AddButtonsToTable = function () {
        //Agrega los botones de la Derecha
        var buttons = '<button type="button" class="btn btn-primary btn-circle mr-2" onClick="Articulo.ShowFilter();"><i class="fa fa-list"></i></button>' +
            '<button  type="button" class="btn btn-primary btn-circle" onClick="Articulo.RefreshTable();" > <i class="fa fa-refresh"></i></button >';
        utils.AddTopRightSection(Articulo.idTable, buttons);
    };

    //Llamada Ajax para refrescar los datos de la tabla
    this.RefreshTable = function () {
        Articulo.table.ajax.reload();
    };

    //Llamada Ajax para cargar los datos en la tabla
    this.GetAllToDataTable = function (data, callbackDataTable, settings) {

        // *******************************************************
        // ******* I M P O I R T A N T E  ************************
        // *******************************************************
        // LOS NOMBRES DE LOS CAMPOS DEBEN INICIAR CON MINUSCULA
        // *******************************************************

        //Obtenemos los filtros que vamos a aplicar
        var _filterParams = $(Articulo.idFrmFilter).formToJson();


        //Obtenemos el formato correcto de los parametros para el dataTable
        var _params = utils.DataTableParameters(data, _filterParams);

        //agregamos parametros de ordenamiento
        _params.PagingParameter.Sort = (data.order[0].dir == 'asc' ? '' : '-') + data.columns[data.order[0].column].name;
        _params.PagingParameter.Fields = "Id_Num_SKUint,Num_CodBarra,ddDesc_Ensamb";

      
        //Mostramos el loading
        utils.showLoading(true);

         //Es necesario enviar así los parametros
        _params = $.param(_params);
      
    
        Articulo.GetAll(_params, function (response, header, request) {
            //Hasta este momento recibimos la lista de datos, pero para el DataTable necesitamos convertir esa respuesta a un formato especial
            response = utils.DataTableResponse(data, response, request, null);

            // Llamamos al CallBack del DataTable, para que se encargue de dibujar la información
            callbackDataTable(response);

            //ocultamos el loading
            utils.showLoading(false);
        });
    };

    this.GetAll = function (_params, callback) {
        console.time('DataTable');

        var _configAjax = {
            method: 'GET',
            url: Api.Catalogo.Articulo +'/GetDT',
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
                console.timeEnd('DataTable');
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
        $(Articulo.idFilter).collapse('toggle');
    };


    this.InitAutoComplete = function (value,label,description) {
        var options = {
            source: Api.Catalogo.Articulo + '/AutoComplete',
            minLength: 2,
            appendTo: '#containerAutComp',
            value: value,
            label: label,
            description: description
        }
        $('#txtAutoComplete').isAutoComplete(options);
    }
};