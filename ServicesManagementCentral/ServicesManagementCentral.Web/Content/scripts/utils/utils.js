var utils = new function () {

    this.$sectionToast = $('#sectionToast');
    
    //obtiene el query param que se le indique.
    this.getQueryParam = function (name) {
        var regexS = "[\\?&]" + name + "=([^&#]*)",
            regex = new RegExp(regexS),
            results = regex.exec(window.location.search);

        if (results == null) {
            return "";
        } else {
            return decodeURIComponent(results[1].replace(/\+/g, " "));
        }
    };

    //remueve los query params
    this.removeQueryParams = function () {
        var uri = window.location.toString();
        if (uri.indexOf("?") > 0) {
            var clean_uri = uri.substring(0, uri.indexOf("?"));
            window.history.replaceState({}, document.title, clean_uri);
        }
    };


    this.showToast = function (text, title) {
        if (title == undefined || title == null || title.trim() == "") {
            title = '<label class="text-warning">Warning!</label>';
        }

        $toastAlert = $('<div class="toast" id="toastAlert" role="alert" aria-live="assertive" aria-atomic="true" data-delay="10000" style="position: relative; min-width:30rem; max-width:30rem; width:30rem;">' +
            '<div class="toast-header"><strong class="mr-auto" id="toastTitle">' + title + '</strong> <button type="button" class="ml-2 mb-1 close" data-dismiss="toast" aria-label="Close"> <span aria-hidden="true">&times;</span> </button> </div>' +
            '<div class="toast-body" id="toastBody">' + text + '</div></div >');


        this.$sectionToast.append($toastAlert);
        $toastAlert.toast('show');

    };

    //formatea una fecha 
    this.formatDate = function (value) {
        return moment(value, "YYYY-MM-DDThh:mm:ss").format('YYYY-MM-DD')
    };

    //formatea una fecha-hora 
    this.formatDateTime = function (value) {
        return moment(value, "YYYY-MM-DDThh:mm:ss").format('YYYY-MM-DD hh:mm:ss')
    };

    this.DataTableParameters = function (data, entityFilter) {
        var start = 0;
        var length = 10;
        var AllowPaging = true;

        if (data != undefined && data != null) {
            start = data.start == undefined || data.start == null ? 0 : data.start;
            length = data.length == undefined || data.length == null ? 10 : data.length;
            AllowPaging =  data.AllowPaging == undefined || data.AllowPaging == null ? true : data.AllowPaging;

        }
        
      
        var response =  {
            "PagingParameter": {
                "Sort": "",
                "Fields": "",
                "AllowPaging": AllowPaging,
                "PageSize": length,
                "pageNumber": (start / length) + 1
            },
            EntityFilter: entityFilter
        };
       
        return response;
    };

    this.DataTableResponse = function (data, response, request, error) {
        var dtResponse = {
            draw: data.draw, //response == null?0:  _header.CurrentPage, //lo utiliza el dataTable
            recordsTotal: 0, //cuantos registros se muestran actualmente
            recordsFiltered: 0, //cuantos registros en total produjo la consulta
            data: [], //contiene los datos
            error: null // Contiene el error 
        };

        var _header = request == undefined || request == null ? null : JSON.parse(request.getResponseHeader('X-Pagination'));
        
        if (_header) {
            dtResponse = {
                draw: data.draw, //response == null?0:  _header.CurrentPage, //lo utiliza el dataTable
                recordsTotal: response == null ? 0 : _header.PageSize, //cuantos registros se muestran actualmente
                recordsFiltered: response == null ? 0 : _header.Total, //cuantos registros en total produjo la consulta
                data: response, //contiene los datos
                error: error // Contiene el error 
            };
        }

        return dtResponse;
    };

    this.DataTableError = function ( error) {
        return {
            draw: 0, //lo utiliza el dataTable
            recordsTotal: 0, //cuantos registros se muestran actualmente
            recordsFiltered: 0, //cuantos registros en total produjo la consulta
            data: null, //contiene los datos
            error: error // Contiene el error 
        };
    };

    this.AddTopRightSection = function (idTable, html) {
        var idRapper = idTable + '_wrapper';
        var $filterSection = $('#tblDllVersion_filter');
        if ($filterSection.length) {
            $('#topRightSection div:nth-child(1)', idRapper).append('<div style="float:right">' + html + '</div>');
        } else {
            $('#topRightSection', idRapper).html(html);
        }
    }

    // Muestra un modal que ocupa toda la pantalla para indicar que está ejecutandose algún proceso
    // https://gasparesganga.com/labs/jquery-loading-overlay/
    this.timeLoading = null;
    this.showLoading = function (status) {
        if (status && utils.timeLoading == null) {
            this.timeLoading = setTimeout(function () {
                clearTimeout(utils.timeLoading);
                $.LoadingOverlay("hide");
                $.notify({ message: 'El proceso que estaba ejecutandose está tardano demasiado' }, { type: 'danger' });
                
                utils.timeLoading = null;
            }, (1000 * 60));

            $.LoadingOverlay("show", {
                image: "",
                fontawesome: "fa fa-cog fa-spin"
            });


        } else {
            $.LoadingOverlay("hide");
            clearTimeout(utils.timeLoading);
            utils.timeLoading = null;
        }
        
    };

    //retorna una lista de '<option>' en HTML
    this.responseToComboBox = function (data, value, label, dataKeys) {

        var comboHtml = '<option value="null">- Seleccione -</option>';
        $.each(data, function (_index, item) {
           
            var strLabel = '';
            var arrLabel = label.split('+');
            $.each(arrLabel, function (_, _labelName) {
                strLabel += (strLabel==''?'':' - ') + item[_labelName];
            });

            var _dataKeys = '';
            if (dataKeys) {
                $.each(dataKeys, function (_, key) {
                    _dataKeys += "data-" + key+'="' + item[key]+'" ';
                });
            }
           
            comboHtml += '<option value="' + item[value] + '" ' + _dataKeys +'>' + strLabel + '</option>';
           
        });

        return comboHtml;
    };
    


    this.b64DecodeUnicode = function (str) {
        // Going backwards: from bytestream, to percent-encoding, to original string.
        return decodeURIComponent(atob(str).split('').map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
    };

    this.b64EncodeUnicode= function(str) {
        // first we use encodeURIComponent to get percent-encoded UTF-8,
        // then we convert the percent encodings into raw bytes which
        // can be fed into btoa.
        return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g,
            function toSolidBytes(match, p1) {
                return String.fromCharCode('0x' + p1);
            }));
    };


    this.ShowExceptionMessage = function (error) {
        if (error.ExceptionMessage) {
            $.notify({ message: error.ExceptionMessage }, { type: 'danger' });
        } else if (error.Message) {
            $.notify({ message: error.Message }, { type: 'danger' });
        } else {
            console.log(error);
            $.notify({ message: "Error desconocido." }, { type: 'danger' });
        }
    };
};

