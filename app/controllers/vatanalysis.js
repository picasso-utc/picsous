'use strict';

/* global confirm */

angular.module('picsousApp').controller('VATAnalysisCtrl', function($http, APP_URL, $scope, dateWrapper, message) {
	$http({
		method: 'GET',
		url: APP_URL + '/periodetva/'
	}).then(function(response) {
		$scope.periods = response.data;
	});
	$scope.newPeriod = {};

	$scope.state = function(state) {
		if (state === 'N') {
			return 'Non déclarée';
		}
		if (state === 'D') {
			return 'Déclarée';
		}
		return state;
	};

	$scope.stateLabel = function(state) {
		if (state === 'N') {
			return 'label-danger';
		}
		if (state === 'D') {
			return 'label-primary';
		}
		return 'label-default';
	};

	$scope.addPeriod = function() {
		var period = angular.copy($scope.newPeriod);
		period.debut = dateWrapper.DateToStringDate(period.debut);
		period.fin = dateWrapper.DateToStringDate(period.fin);
		$http({
			method: 'POST',
			url: APP_URL + '/periodetva/',
			data: period,
		}).then(function(response) {
			message.success('Période bien ajoutée !');
			$scope.periods.push(response.data);
			$scope.addingVatPeriod = false;
		});
	};

	$scope.popupOpen1 = false;
	$scope.popupOpen2 = false;

	$scope.openPopup1 = function() {
		$scope.popupOpen1 = true;
	};

	$scope.openPopup2 = function() {
		$scope.popupOpen2 = true;
	};

	$scope.dateOptions = {
		dateDisabled: false,
		formatYear: 'yy',
	};

	$scope.analysis = function(period) {
		$scope.analysisResult = null;
		$scope.analysisUndergoing = true;
		$http({
			method: 'GET',
			url: APP_URL + '/tvainfo/' + period.id,
		}).then(function(response) {
			$scope.analyzedPeriod = period;
			$scope.analysisUndergoing = false;
			$scope.analysisResult = response.data;
		}, function() {
			$scope.analysisUndergoing = false;
		});
	};

	$scope.considerDeclared = function(vatperiod) {
		if (!confirm('Vous vous apprêtez à déclarer cette période de TVA comme déclarée. Voulez-vous confirmer ?')) {
			return;
		}
		vatperiod.state = 'D';
		$http({
			method: 'PUT',
			url: APP_URL + '/periodetva/' + vatperiod.id + '/',
			data: vatperiod,
		});
	};
});
