'use strict'

angular.module('picsousApp').controller('FacturesRecuesCtrl', function (API_URL, $scope, tva, message, serviceAjax, dateWrapper, objectStates, casConnectionCheck) {
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

  serviceAjax.get('facture/recue/').then(function (response) {
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
		serviceAjax.post('facture/categories/', $scope.newCategory).then(function(response) {
			$scope.categories.push(response.data);
			message.success('Catégorie bien ajoutée !');
		});
	};

	$scope.editCategory = function() {
		if (!checkCategory($scope.editingCategory)) {
			return;
		}
		serviceAjax.put('facture/categories/' + $scope.editingCategory.id + '/', $scope.editingCategory).then(function() {
			message.success('Catégorie bien modifiée !');
		});
	};

	$scope.deleteCategory = function() {
		serviceAjax.delete('facture/categories/' + $scope.editingCategory.id + '/').then(function() {
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
		var prixHT = newFacture.prix - newFacture.tva_complete;
		var pourcentage_tva = (newFacture.tva_complete / prixHT) * 100;
		

		if (isFinite(pourcentage_tva)) {
			newFacture.tva = pourcentage_tva.toFixed(2);
			newFacture.date = dateWrapper.DateToStringDate(newFacture.date);
			if (newFacture.date_paiement) {
				newFacture.date_paiement = dateWrapper.DateToStringDate(newFacture.date_paiement);
			}
			if (newFacture.date_remboursement) {
				newFacture.date_remboursement = dateWrapper.DateToStringDate(newFacture.date_remboursement);
			}
			
			delete newFacture.tva_complete;
			serviceAjax.post('facture/recue/', newFacture).then(function(response) {
				$scope.factures.push(response.data);
				$scope.newFacture = {};
				if (!keep) {
					$scope.addingFacture = false;
				}
				message.success('Facture bien ajoutée !');
			});
		} else {
			message.error('Pourcentage TVA aberrant ! ')
		}
			
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
		serviceAjax.patch('facture/recue/' + fac.id + '/', {etat: fac.etat}).then(function() {
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
	serviceAjax.get('facture/categories/').then(function(response) {
		$scope.loadingFactures = false;
		$scope.categories = response.data;
	}, function() {
		$scope.loadingFactures = false;
	});

});
