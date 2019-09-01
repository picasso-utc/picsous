'use strict';

/* global confirm */

angular.module('picsousApp').controller('FactureEmiseCtrl', function($routeParams, message, objectStates, API_URL, $scope, serviceAjax) {

	serviceAjax.get('facture/emise/' + $routeParams.id).then(function(response) {
		$scope.facture = response.data;
	});

	$scope.app_url = API_URL;

	$scope.state = objectStates.factureEmiseState;
	$scope.stateLabel = objectStates.factureEmiseStateLabel;

	$scope.modifyFacture = function() {
		$scope.oldFacture = angular.copy($scope.facture);
		$scope.modifyingFacture = true;
	};

	$scope.deleteEl = function(element, index) {
		if (!confirm('Voulez-vous vraiment supprimer l\'élement ' + element.nom + ' ?')) {
			return;
		}
		serviceAjax.delete('facture/emiserow/' + element.id + '/').then(function() {
			message.success('Élément ' + element.nom + ' supprimé !');
			$scope.facture.factureemiserow_set.splice(index, 1);
		})
	};

	$scope.saveNewElement = function() {
		$scope.newElement.facture = $routeParams.id;
		serviceAjax.post('facture/emiserow/', $scope.newElement).then(function(response) {
			$scope.facture.factureemiserow_set.push(response.data);
			$scope.newFacture = {};
			$scope.addingElement = false;
		});
	};

	$scope.saveFacture = function() {
		serviceAjax.put('facture/emise/' + $routeParams.id + '/', $scope.facture).then(function(response) {
			$scope.facture = response.data;
			$scope.modifyingFacture = false;
			message.success('Facture modifiée !');
		});
	};

	$scope.cancelModifyingFacture = function() {
		$scope.facture = angular.copy($scope.oldFacture);
		$scope.modifyingFacture = false;
	};

	$scope.modifyElement = function(el) {
		el.old = angular.copy(el);
		el.modifying = true;
	};

	$scope.stopModifyingElement = function(el) {
		angular.extend(el, el.old);
		el.modifying = false;
	};

	$scope.saveElement = function(el) {
		var data = angular.copy(el);
		delete data.modifying;
		delete data.old;
		serviceAjax.put('facture/emiserow/' + el.id + '/', data).then(function() {
			el.modifying = false;
			message.success('Élément modifié !');
		});
	};
});
