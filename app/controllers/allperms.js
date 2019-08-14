'use strict';

angular.module('picsousApp').controller('AllPermsCtrl', function($scope, NgTableParams, serverGetter, objectStates) {
	$scope.perms = [];
	$scope.filters = {
		traite: true,
		nontraite: true,
		sansfacture: true,
	};
	
	var init = function() {
		serverGetter.permsGetter().then(function(response) {
			$scope.perms = response.data;
			$scope.perms.forEach(function(perm) {
				perm.perm.state = $scope.getState(perm.perm);
			})
			$scope.loaded = true;
		});
	};

	$scope.getPerms = function(filters) {
		return $scope.perms.filter(function(p) {
			if (filters.traite && p.state === 'T') {
				return true;
			}
			if (filters.nontraite && p.state === 'N') {
				return true;
			}
			if (filters.sansfacture && p.state === 'V') {
				return true;
			}
			return false;
		});
	};

	$scope.getState = function(p) {
		if (p.state === 'T') {
			return 'T';
		}
		if (p.facturerecue_set && p.facturerecue_set.length === 0) {
			return 'V';
		}
		return 'N';
	};

	$scope.stateLabel = objectStates.permStateLabel;
	$scope.stateString = objectStates.permState;

	init();
});
