var Security = new function () {
    this.idFrmLogin = '#frmLogin';

    this.login = function () {
        var $frm = $(this.idFrmLogin);
        var values = $(this.idFrmLogin).formToJson();
        if (this.validateLogin(values) == false) {
            return false;
        }
        
        //utils.showLoading(true);

        $frm.submit();

        //http.ajax(
        //    {
        //        method: 'POST',
        //        url: ,
        //        data: values,
        //    },
        //    function (response, header, request) {
        //        utils.showLoading(false);
        //        console.log(response);
        //    },
        //    function (error) {
        //        utils.showLoading(false);
        //    }
        //);

        //console.log(values);
    };

    this.validateLogin = function (values) {
        var isValid = true;
        if (values.username.trim() == '') {
            $.notify({ message: 'Debe introducir su usuario de Active Directory.' }, { type: 'danger' });
            isValid = false;
        }
        if (values.password.trim() == '') {
            $.notify({ message: 'Debe introducir su contraseña.' }, { type: 'danger' });
            isValid = false;
        }
       
        return isValid;
    }
};