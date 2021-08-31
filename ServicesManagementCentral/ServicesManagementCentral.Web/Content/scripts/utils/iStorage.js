var iStorage = new function () {

    //obtiene la información de un objeto almacenado en local
    this.get = function (key) {
       return Storages.localStorage.get(key);
    };

    //almacena un objeto en local
    this.set = function (key, value) {
        Storages.localStorage.set(key, value);
    };

    this.delete = function (key) {
        Storages.localStorage.remove(key);
    }
};