'use strict';

angular.module('picsousApp').controller('NavCtrl', function($scope, casConnectionCheck, superadmin, semester, $http, $window, token, APP_URL) {
	$scope.cas = casConnectionCheck;
	$scope.superadmin = superadmin;
	
	$scope.logout = function() {
		// Fonction pour déconnecter l'utilisateur
		$http({
			method: 'GET',
			url: APP_URL + '/logout',
		}).then(function() {
			token.setToken();
			$window.location.href = 'https://cas.utc.fr/cas/logout';
		});
	};

	$scope.showAllSemesters = function() { semester.setSemester('all'); };
	$scope.resetSemester = function() { semester.setSemester(null); };
	$scope.setSemester = function(givenSemester) { semester.setSemester(givenSemester.id); };

	$scope.semester = function() {
		return semester.currentSemester();
	};

	$scope.getSemesters = function() {
		return semester.allSemesters;
	};

	$scope.semesterName = function(givenSemester) {
		return semester.currentSemesterName(givenSemester.id);
	};

	$scope.semesterText = function() {
		switch (semester.currentSemester()) {
			case 'all':
			return 'Archives - Tous les semestres';
			case null:
			return 'Accéder aux archives';
			default:
			return 'Archives - ' + semester.currentSemesterName(semester.currentSemester());
		}
	};
});
