/*
 * Powered by Ricardo Hernández
 * rherl23@gmail.com
 * 
 * funcion paranejar el Auto Completado
 * 
 * Esta funcion recibe los siguientes parametros
 *  var options = {
        source: 'el endpoint que va a consumir para obtener los datos',
        minLength: 'longitud mínima para accionar la busqueda',
        appendTo: 'El contenedor en donde se desplegará la lista de resultados',
        value :'el value, comunmente será el id o algun dato que identifique de manera unica la información',
        label: 'la etiqueta que se desplegará',
        description: 'información complementaria que se desplegará solamente en la lista de resultados'
    }

 * Ejemplo:
 * Deberá existir un objecto similar en el front
 * <div class="form-group">
        <label for="txtAutoComplete">Auto Complete</label>
        <input type="text" class="form-control" id="txtAutoComplete" aria-describedby="autCompHelp">
        <div id="containerAutComp" class="container-fluid m-0 p-0"></div>
        <small id="autCompHelp" class="form-text  text-danger hidden ">* Seleccione un elemento de la lista.</small>
    </div>
 * 
 * posterior a ello podrás llamar a está función (comunmente en el document.ready)
 * $('#txtAutoComplete').isAutoComplete(options);
 * 
 *
 *  Dependencias: 
 *      jQuery v3.1.1
 *      jQuery UI - v1.12.1 
 */


(function ($) {
    $.fn.isAutoComplete = function (options) {
        var start = Date.now();
        


        var $obj = this ;

        if (!options) {
            return false;
        }
        options.minLength = options.minLength ? options.minLength : 2;
        options.appendTo = options.appendTo ? options.appendTo : '';
        $obj.autocomplete({
            source: options.source,
            appendTo: options.appendTo,
            minLength: options.minLength,
            select: function (event, ui) {
                setTimeout(function () {
                    $obj.val(ui.item[options.label])
                        .data('value', ui.item[options.value])
                        .data('label', ui.item[options.label])
                        .data('description', ui.item[options.description])
                        ;

                    var helper = $obj.attr('aria-describedby');
                    $('#' + helper).addClass('hidden');
                }, 401);
            },
            change: function (event, ui) {
                var helper = $obj.attr('aria-describedby');
                if (ui.item == null) {
                    $obj
                        .removeData('value')
                        .removeData('label')
                        .removeData('description')
                        ;

                    $('#' + helper).removeClass('hidden');
                } else {
                    $('#' + helper).addClass('hidden');
                }
            }
            , search: function (event, ui) {
                  console.time('autocomplete');

              }

            , open: function (event, ui) {
                var end = Date.now();
                //console.log(((end - start)/1000) + 'segundos');
                console.timeEnd('autocomplete');
            }
        })
            .autocomplete("instance")._renderItem = function (ul, item) {
              
            var itemHtml = '<h5 class="p-0 m-0">' + item[options.label] + '</h5>';
            if (options.description) {
                itemHtml += ('<p class="small p-0 m-0">' + item[options.description] + '</p>');
            }
                
            return $('<li>')
                .removeClass().addClass('list-group-item is-li-autocomplete')
                .append($(itemHtml))
                .appendTo(ul);
        };


        $($obj.autocomplete().autocomplete("instance").menu.element[0])
            .removeClass()
            .addClass('list-group is-autocomplete')

    };
}(jQuery));