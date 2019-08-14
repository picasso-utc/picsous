'use strict';

angular.module('picsousApp').controller('PermCtrl', function($routeParams, casConnectionCheck, objectStates, $http, APP_URL, $scope, message, dateWrapper, superadmin, serverGetter) {
	$scope.app_url = APP_URL;
	$scope.categories = [];
	$scope.superadmin = superadmin;

	$scope.isAdmin = function() {
		return casConnectionCheck.isAdmin();
	};

	$scope.totalSales = function() {
		$scope.salesInfo = null;
		$http({
			method: 'GET',
			url: APP_URL + '/permsales/' + $routeParams.id + '/',
		}).then(function(response) {
			$scope.salesInfo = response.data;
		});
	};;

	$scope.getState = function(p) {
		if (p.state === 'T') {
			return 'T';
		}
		if (p.facturerecue_set && p.facturerecue_set.length === 0) {
			return 'V';
		}
		return 'N';
	};
	
	$scope.simpleModification = function(article) {
		article.old = angular.copy(article);
		article.simpleModifying = true;
	};
	
	$scope.hardModification = function(article) {
		article.hardModifying = true;
		if (!article.simpleModifying) {
			$scope.simpleModification(article);
		}
	};
	
	$scope.cancelSavingArticle = function(article) {
		angular.extend(article, article.old);
		delete article.old;
		delete article.simpleModifying;
		delete article.hardModifying;
	};
	
	$scope.savingArticle = function(article, hardModifications) {
		var data = {
			nom: article.nom,
			prix: article.prix,
			tva: article.tva,
		};
		var endpoint = 'perm/articles';
		if (hardModifications)  {
			data.id_payutc = article.id_payutc;
			data.ventes = parseInt(article.ventes);
			endpoint += 'Admin';
		}
		$http({
			method: 'PATCH',
			url: APP_URL + '/' + endpoint + '/' + article.id + '/',
			data: data,
		}).then(function(response) {
			angular.extend(article, response.data);
			delete article.old;
			delete article.simpleModifying;
			if (hardModifications) {
				delete article.hardModifying;
			}
			message.success('Article bien modifié !');
		});
	};

	$scope.factureRecueStateLabel = objectStates.factureRecueStateLabel;
	$scope.factureRecueState = objectStates.factureRecueState;

	$scope.stateLabel = function(state) {
		if (state === 'T') {
			return 'label-success';
		}
		if (state === 'V') {
			return 'label-warning';
		}
		if (state === 'N') {
			return 'label-danger';
		}
		return 'label-default';
	};

	$scope.stateString = function(state) {
		if (state === 'T') {
			return 'Traitée';
		}
		if (state === 'V') {
			return 'Manque facture(s)';
		}
		if (state === 'N') {
			return 'Non traitée';
		}
		return state;
	};

	serverGetter.permGetter($routeParams.id).then(function(response) {
		$scope.perm = response.data;
		$scope.newArticle.perm = $scope.perm.id;
		$scope.perm.state = $scope.getState($scope.perm);
		assignTva()
	});

	$scope.newArticle = {
		tva: 5.5
	};

	var assignTva = function(){
		if ($scope.perm) {
			$scope.newArticle.tva = ($scope.perm.perm.asso) ? 0 : 5.5
		}
		
	}

	$scope.isAdmin = function() {
		return casConnectionCheck.isAdmin();
	};

	var oldPerm;

	$scope.sendConvention = function() {
		$http({
			method: 'POST',
			url: APP_URL + '/sendconvention/' + $scope.perm.id,
		}).then(function() {
			message.success('Convention envoyée !');
		});
	};

	$scope.openPopup = function(index) {
		$scope['popup' + index + 'Open'] = true;
	};

	$scope.dateOptions = {
		initDate: new Date(),
		dateDisabled: false,
		formatYear: 'yy',
	};

	$scope.sendJustificatif = function() {
		$http({
			method: 'POST',
			url: APP_URL + '/sendjustificatif/' + $scope.perm.id,
		}).then(function() {
			message.success('Justificatif envoyé !');
		});
	};

	// $scope.modifyPerm = function() {
	// 	$scope.modifyingPerm = true;
	// 	if ($scope.perm.state === 'T') {
	// 		$scope.perm.traitee = true;
	// 	} else {
	// 		$scope.perm.traitee = false;
	// 	}
	// 	oldPerm = angular.copy($scope.perm);
	// };

	$scope.savePerm = function() {
		if ($scope.perm.traitee) {
			$scope.perm.state = 'T';
		} else {
			$scope.perm.state = 'N';
		}
		var sendPerm = angular.copy($scope.perm);
		delete sendPerm.article_set;
		delete sendPerm.facturerecue_set;
		delete sendPerm.traitee;
		$http({
			method: 'PUT',
			url: APP_URL + '/perms/' + $routeParams.id + '/',
			data: sendPerm,
		}).then(function() {
			$scope.perm.state = $scope.getState($scope.perm);
			$scope.modifyingPerm = false;
			message.success('Perm bien modifiée !');
		});
	};

	$scope.cancelModifyPerm = function() {
		$scope.modifyingPerm = false;
		$scope.perm = angular.copy(oldPerm);
	};

	$scope.getCategoryCode = function(id) {
		for (var i in $scope.categories) {
			if ($scope.categories[i].id === id) {
				return $scope.categories[i].code;
			}
		}
		return '';
	};

	if (casConnectionCheck.isAdmin()) {
		$http({
			method: 'GET',
			url: APP_URL + '/facture/categories/',
		}).then(function(response) {
			$scope.categories = response.data;
		});
	}

	$scope.addFacture = function() {
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
		newFacture.perm = $routeParams.id;
		delete newFacture.tva_complete;
		$http({
			method: 'POST',
			data: newFacture,
			url: APP_URL + '/facture/recu/',
		}).then(function(response) {
			$scope.perm.facturerecue_set.push(response.data);
			$scope.newFacture = {};
			$scope.addingFacture = false;
			message.success('Facture bien ajoutée !');
		});
	};

	$scope.addToPayutc = function(article) {
		article.addingToPayutc = true;
		$http({
			method: 'GET',
			url: APP_URL + '/createpayutcarticle/' + article.id + '/',
		}).then(function(response) {
			article.id_payutc = response.data;
			article.addingToPayutc = false;
			message.success('Article bien ajouté à PayUTC !');
		}, function() {
			article.addingToPayutc = false;
		});
	};

	$scope.updateArticle = function(article) {
		return $http({
			method: 'GET',
			url: APP_URL + '/updatearticle/' + article.id + '/',
		}).then(function(response) {
			article.ventes = response.data;
			article.ventes_last_update = new Date();
			$scope.salesInfo = null;
			message.success('Article mis à jour. Ventes de l\'article : ' + response.data + ' ventes.');
		});
	}

	$scope.addArticle = function() {
		$scope.addingArticle = true;
		$http({
			method: 'POST',
			url: APP_URL + '/perm/articles/',
			data: $scope.newArticle
		}).then(function(response) {
			$scope.addingArticle = false;
			$scope.createArticle = false;
			$scope.newArticle.id = response.data.id;
			$scope.perm.article_set.push(angular.copy($scope.newArticle));
			$scope.newArticle = { perm: $routeParams.id, tva: 5.5 };
			message.success('Article ' + $scope.newArticle.nom + ' bien ajouté à Picsous !');
		}, function() {
			$scope.addingArticle = false;
		});
	}
});
