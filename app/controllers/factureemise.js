'use strict';

/* global confirm */

angular.module('picsousApp').controller('FactureEmiseCtrl', function($http, serverGetter, $routeParams, message, objectStates, APP_URL, $scope, NgTableParams) {
	serverGetter.factureEmiseGetter($routeParams.id).then(function(response) {
		$scope.facture = response.data;
	});

	$scope.app_url = APP_URL;

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
		$http({
			method: 'DELETE',
			url: APP_URL + '/facture/emiserow/' + element.id + '/',
		}).then(function() {
			message.success('Élément ' + element.nom + ' supprimé !');
			$scope.facture.factureemiserow_set.splice(index, 1);
		})
	};

	$scope.saveNewElement = function() {
		$scope.newElement.facture = $routeParams.id;
		$http({
			method: 'POST',
			url: APP_URL + '/facture/emiserow/',
			data: $scope.newElement,
		}).then(function(response) {
			$scope.facture.factureemiserow_set.push(response.data);
			$scope.newFacture = {};
			$scope.addingElement = false;
		});
	};

	$scope.saveFacture = function() {
		$http({
			method: 'PUT',
			url: APP_URL + '/facture/emise/' + $routeParams.id + '/',
			data: $scope.facture,
		}).then(function(response) {
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
		$http({
			method: 'PUT',
			url: APP_URL + '/facture/emiserow/' + el.id + '/',
			data: data,
		}).then(function() {
			el.modifying = false;
			message.success('Élément modifié !');
		});
	};
});
