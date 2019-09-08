'use strict';

/* global confirm */

angular.module('picsousApp').controller('ChequesCtrl', function ($scope, casConnectionCheck, API_URL, objectStates, message, serviceAjax) {
  
	$scope.cas = casConnectionCheck
  	$scope.chequesUrl = API_URL + '/generate/cheques?val=' + (new Date().getTime())

	var loadCheques = function() {
		serviceAjax.get('facture/cheque/').then(function(response) {
			$scope.cheques = response.data;
		});
	};

	$scope.quickChange = function(cheque) {
		cheque.quicksave = true;
		const data = {
			id: cheque.id,
			state: cheque.state,
		}
		serviceAjax.patch('facture/cheque/' + cheque.id + '/', data).then(function() {
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
		serviceAjax.put('facture/cheque/' + $scope.modifiedCheque.id + '/', newCheque).then(function(response) {
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
		serviceAjax.delete('facture/cheque/' + $scope.modifiedCheque.id + '/').then(function() {
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
		serviceAjax.post('facture/cheque/', newCheque).then(function(response) {
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
