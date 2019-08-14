'use strict';

angular.module('picsousApp').factory('token', function(localStorageService) {
    var token = localStorageService.get('authtoken') || null;
    
    function setToken(val) {
        token = val;
        localStorageService.set('authtoken', token);
    }
    
    function getToken() {
        return token;
    }
    
    return {
        getToken: getToken,
        setToken: setToken,
    };
});
