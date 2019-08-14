'use strict';

/* global confirm */

angular.module('picsousApp').controller('ChequesCtrl', function ($scope, casConnectionCheck, APP_URL, $http, objectStates, message, serverGetter) {
  $scope.cas = casConnectionCheck
  $scope.chequesUrl = APP_URL + '/generate/cheques?val=' + (new Date().getTime())
	var loadCheques = function() {
		serverGetter.chequesGetter().then(function(response) {
			$scope.cheques = response.data;
		});
	};

	$scope.quickChange = function(cheque) {
		cheque.quicksave = true;
		$http({
			url: APP_URL + '/facture/cheques/' + cheque.id + '/',
			method: 'PATCH',
			data: {
				id: cheque.id,
				state: cheque.state,
			}
		}).then(function() {
			message.success('État du chèque bien modifié !');
			delete cheque.quickChange;
			delete cheque.quicksave;
		}, function() {
			delete cheque.quicksave;
		});
	};

	$scope.modifyCheque = function(cheque) {
		$scope.chequeInModification = cheque;
		$scope.modifiedCheque = angular.copy(cheque);
	};

	$scope.sendChequeModification = function() {
		$scope.sendingChequeModification = true;
		var newCheque = $scope.modifiedCheque
		if (newCheque.date_emission) newCheque.date_emission = dateFormat(newCheque.date_emission)
		if (newCheque.date_encaissement) newCheque.date_encaissement = dateFormat(newCheque.date_encaissement)
		$http({
			method: 'PUT',
			url: APP_URL + '/facture/cheques/' + $scope.modifiedCheque.id + '/',
			data: newCheque,
		}).then(function(response) {
			angular.copy(response.data, $scope.chequeInModification);
			$scope.chequeInModification = null;
			$scope.sendingChequeModification = false;
			message.success('Chèque bien enregistré !');
			loadCheques();
		}, function() {
			$scope.sendingChequeModification = false;
		});
	};

	$scope.deleteCheque = function(cheque) {
		if (!confirm('Voulez-vous vraiment supprimer ce chèque ?')) {
			return;
		}
		$http({
			method: 'DELETE',
			url: APP_URL + '/facture/cheques/' + $scope.modifiedCheque.id + '/',
		}).then(function() {
			$scope.cheques = $scope.cheques.filter(function(c) {
				return c.id !== cheque.id;
			});
			$scope.chequeInModification = null;
		});
	};

	var init = function() {
		loadCheques();
	};

	$scope.addCheque = function() {
		var newCheque = $scope.newCheque
		if (newCheque.date_emission) newCheque.date_emission = dateFormat(newCheque.date_emission)
		if (newCheque.date_encaissement) newCheque.date_encaissement = dateFormat(newCheque.date_encaissement)
		$http({
			method: 'POST',
			url: APP_URL + '/facture/cheques/',
			data: newCheque
		}).then(function(response) {
			$scope.cheques.push(response.data)
			$scope.newCheque = {}
			$scope.addingCheque = false
			message.success('Chèque bien ajouté !')
		})
	};

	function pad(number) {
		if (number < 10) {
			return '0' + number
		}
		return number
	}

	var dateFormat = function (givenDate) {
		var m = givenDate.getMonth()
		return givenDate.getFullYear() + '-' + pad(givenDate.getUTCMonth() + 1) + '-' + pad(givenDate.getUTCDate())
	}

	$scope.dateOptions = {
		initDate: new Date(),
		dateDisabled: false,
		formatYear: 'yy'
	}

	$scope.popupOpen = [false, false]

	$scope.openPopup = function (i) {
		$scope.popupOpen[i] = true
	}

	$scope.getChequeState = objectStates.chequeState;
	$scope.getChequeStateLabel = objectStates.chequeStateLabel;

	init();
});
