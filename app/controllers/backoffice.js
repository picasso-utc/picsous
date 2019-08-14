'use strict';

angular.module('picsousApp').controller('BackofficeCtrl', function($http, $scope, APP_URL, message, semester, serverGetter, superadmin) {
    $scope.settings = {};
    $scope.users = [];
    $scope.newUser = {
        right: 'P',
    };
    $scope.superadmin = superadmin;

    function newEmptySemester() {
        $scope.newSemester = { annee: (new Date()).getFullYear() };
    }
    newEmptySemester();

    $scope.createSemester = function() {
        $http({ method: 'POST', url: APP_URL + '/semester/', data: $scope.newSemester }).then(function(response) {
            message.success('Semestre bien créé !');
            giveAbreviation(response.data);
            semester.allSemesters.push(response.data);
            $scope.semesters.push(response.data);
            newEmptySemester();
        });
    };
    
    var newSettings = function(response) {
        for (var val in response.data) {
            $scope.settings[response.data[val].key] = {
                'value': response.data[val].value,
                'changed': false,
            };
        }
    };
    
    function getSettings () {
        $http({ method: 'GET', url: APP_URL + '/getAdminSettings' }).then(newSettings);
        
        $http({
            method: 'GET', url: APP_URL + '/getUserList',
        }).then(function(response) {
            $scope.users = response.data;
        });
    }
    
    $scope.saveSettings = function() {
        var changedSettings = [];
        for (var key in $scope.settings) {
            if ($scope.settings[key].changed) {
                changedSettings.push({
                    name: key,
                    val: $scope.settings[key].value
                });
            }
        }
        $scope.savingSettings = true;
        $http({
            method: 'POST',
            data: changedSettings,
            url: APP_URL + '/editSettings'
        }).then(function(response) {
            message.success('Les paramètres ont bien été modifiés.');
            newSettings(response);
            $scope.savingSettings = false;
        }, function() {
            $scope.savingSettings = false;
        });
    };

	$scope.typeahead = function(q) {
		if (!q || q.length < 4) {
			return;
		}
		return serverGetter.userAutocompleteGetter(q).then(function(response){
			return response.data;
		});
	};
    
    $scope.addUserLogin = function(q) {
        $scope.newUser.login = q.name.split('(')[1].split(')')[0];
    };
    
    $scope.findUser = function(q) {
        var login = q.name.split('(')[1].split(')')[0];
        $scope.searchingBadge = true;
        $http({
            method: 'GET',
            url: APP_URL + '/getBadge?login=' + login,
        }).then(function(response) {
            $scope.settings.NEMOPAY_CONNECTION_UID.value = response.data;
            $scope.settings.NEMOPAY_CONNECTION_UID.changed = true;
            $scope.userToFind = '';
            $scope.searchingBadge = false;
        }, function() {
            $scope.searchingBadge = false;
        });
    };
    
    $scope.giveRight = function(user, right) {
        user.changingRight = true;
        $http({ method: 'PATCH', url: APP_URL + '/userright/' + user.id + '/', data: {
            id: user.id, right: right
        }}).then(function(response) {
            user.right = response.data.right;
            user.changingRight = false;
        }, function() {
            user.changingRight = false;
        });
    };
    
    $scope.createUser = function() {
        if (!$scope.newUser.login) {
            message.error('Veuillez entrer un login.');
            return;
        }
        $scope.creatingUser = true;
        $http({
            method: 'POST',
            url: APP_URL + '/userright/',
            data: $scope.newUser,
        }).then(function(response) {
            $scope.users.push(response.data);
            $scope.newUser = {
                right: 'P',
            };
            $scope.creatingUser = false;
            message.success('Utilisateur ajouté avec succès !');
        }, function() {
            $scope.creatingUser = false;
        });
    };
    
    getSettings();

    // Getting the semesters list and incorporating it in the view

    var giveAbreviation = function(s) {
        s.abreviation = semester.semesterName(s.periode) + ' ' + s.annee.toString();
    };

    serverGetter.semesterGetter().then(function(response) {
        // Adding the semesters to scope
        $scope.semesters = response.data;
        // Adding the semesters abreviation to each semester object
        $scope.semesters.forEach(giveAbreviation);
    });
});
