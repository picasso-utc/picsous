'use strict'

angular.module('picsousApp').controller('FacturesRecuesCtrl', function ($http, API_URL, $scope, tva, message, serviceAjax, dateWrapper, objectStates, casConnectionCheck) {
  $scope.cas = casConnectionCheck
  $scope.facturesUrl = API_URL + '/generate/factures?val=' + (new Date().getTime())
  $scope.tva = tva
  $scope.factures = []
  $scope.filters = {
    payees: true,
    arembourser: true,
    apayer: true,
    enattente: true
  }

  function checkCategory (cat) {
    if (cat.code.length > 1) {
      message.error('Le code ne doit pas faire plus d\'un caractère.')
      return false
    }
    return true
  };

  $http({
    method: 'GET',
    url: APP_URL + '/facture/recue/'
  }).then(function (response) {
    $scope.factures = response.data
  })

  $scope.getFactures = function () {
    return $scope.factures.filter(function (p) {
      if ($scope.filters.payees && p.etat === 'P') {
        return true
      }
      if ($scope.filters.arembourser && p.etat === 'R') {
        return true
      }
      if ($scope.filters.apayer && p.etat === 'D') {
        return true
      }
      if ($scope.filters.enattente && p.etat === 'E') {
        return true
      }
      return false
    })
	};

	$scope.getCategoryCode = function(id) {
		for (var i in $scope.categories) {
			if ($scope.categories[i].id === id) {
				return $scope.categories[i].code;
			}
		}
		return '';
	};

	$scope.addCategory = function() {
		if (!checkCategory($scope.newCategory)) {
			return;
		}
		$http({
			method: 'POST',
			data: $scope.newCategory,
			url: APP_URL + '/facture/categories/'
		}).then(function(response) {
			$scope.categories.push(response.data);
			message.success('Catégorie bien ajoutée !');
		});
	};

	$scope.editCategory = function() {
		if (!checkCategory($scope.editingCategory)) {
			return;
		}
		$http({
			method: 'PUT',
			data: $scope.editingCategory,
			url: APP_URL + '/facture/categories/' + $scope.editingCategory.id + '/',
		}).then(function() {
			message.success('Catégorie bien modifiée !');
		});
	};

	$scope.deleteCategory = function() {
		$http({
			method: 'DELETE',
			url: APP_URL + '/facture/categories/' + $scope.editingCategory.id + '/',
		}).then(function() {
			$scope.categories.forEach(function(f, i, a) {
				if (f.id === $scope.editingCategory.id) {
					a.splice(i, 1);
				}
			});
			message.success('Catégorie bien supprimée !');
		});
	};

	$scope.addFacture = function(keep) {
		var newFacture = angular.copy($scope.newFacture);
		newFacture.date = dateWrapper.DateToStringDate(newFacture.date);
		if (newFacture.date_paiement) {
			newFacture.date_paiement = dateWrapper.DateToStringDate(newFacture.date_paiement);
		}
		if (newFacture.date_remboursement) {
			newFacture.date_remboursement = dateWrapper.DateToStringDate(newFacture.date_remboursement);
		}
		var prixHT = newFacture.prix - newFacture.tva_complete;
		var pourcentage_tva = (newFacture.tva_complete / prixHT) * 100;
		newFacture.tva = pourcentage_tva.toFixed(2);
		delete newFacture.tva_complete;
		$http({
			method: 'POST',
			data: newFacture,
			url: APP_URL + '/facture/recue/',
		}).then(function(response) {
			$scope.factures.push(response.data);
			$scope.newFacture = {};
			if (!keep) {
				$scope.addingFacture = false;
			}
			message.success('Facture bien ajoutée !');
		});
	};

	$scope.modifyState = function(fac) {
		fac.modifyingState = true;
	};

	$scope.openPopup = function(index) {
		$scope['popup' + index + 'Open'] = true;
	};

	$scope.dateOptions = {
		initDate: new Date(),
		dateDisabled: false,
		formatYear: 'yy',
	};

	$scope.sendState = function(fac) {
		fac.updating = true;
		$http({
			method: 'PATCH',
			url: APP_URL + '/facture/recue/' + fac.id + '/',
			data: {
				id: fac.id,
				etat: fac.etat,
			}
		}).then(function() {
			fac.updating = false;
			fac.modifyingState = false;
			message.success('État de la facture modifié !');
		}, function() {
			fac.updating = false;
		});
	};

	$scope.state = objectStates.factureRecueState;
	$scope.stateLabel = objectStates.factureRecueStateLabel;

	$scope.loadingFactures = true;
	$http({
		method: 'GET',
		url: APP_URL + '/facture/categories/',
	}).then(function(response) {
		$scope.loadingFactures = false;
		$scope.categories = response.data;
	}, function() {
		$scope.loadingFactures = false;
	});

});
