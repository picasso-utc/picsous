'use strict';

/**
 * @ngdoc service
 * @name picsousApp.serviceAjax
 * @description
 * # serviceAjax
 * Factory in the picsousApp.
 */
function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie != '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = jQuery.trim(cookies[i]);
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) == (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;

}

var csrftoken =  getCookie('csrftoken');

angular.module('picsousApp')
  .factory('serviceAjax', function serviceAjax($http, API_URL) {
        return{
            get: function(path){
                return $http.get(API_URL + '/' + path, {withCredentials: true});
            },

            post: function(path, object){
                return $http.post(API_URL + '/' + path, object, {withCredentials: true});
            },
            put: function(path, object){
                return $http.put(API_URL + '/' + path, object, {withCredentials: true});
            },
            delete : function(path){
                return $http.delete(API_URL + '/' + path, {withCredentials: true});
            }
        }
    });