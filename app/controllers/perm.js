'use strict';

angular.module('picsousApp').controller('PermCtrl', function($routeParams, casConnectionCheck, serviceAjax, objectStates, API_URL, $scope, message, dateWrapper) {
	$scope.app_url = API_URL;
	$scope.categories = [];


	var initNewFacture = function(){
		const current_date = new Date();
		$scope.newFacture = {}
		$scope.newFacture.date = current_date;
	}
	initNewFacture();

	$scope.isAdmin = function() {
		return casConnectionCheck.isAdmin();
	};

	$scope.totalSales = function() {
		$scope.salesInfo = null;
		serviceAjax.get('perms/sales/' + $routeParams.id).then(function(response) {
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
			perm: article.creneau,
		};
		var endpoint = 'perm/articles';
		if (hardModifications)  {
			data.id_payutc = article.id_payutc;
			data.ventes = parseInt(article.ventes);
			endpoint += 'Admin';
		}
		serviceAjax.put(endpoint + '/' + article.id + '/', data).then(function(response) {
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

	serviceAjax.get('creneau/' + $routeParams.id + '/').then(function(response){
		$scope.perm = response.data;
		$scope.newArticle.creneau = $scope.perm.id;
		$scope.perm.state = $scope.getState($scope.perm);
		assignTva()
	});

	$scope.editPermState = function(){
		if ($scope.perm.state == 'T') {
			$scope.perm.state = 'N';
			$scope.perm.traitee = false;
		} else if ($scope.perm.state == 'N' || ($scope.perm.state == 'V' && $scope.perm.perm.asso)) {
			$scope.perm.state = 'T';
			$scope.perm.traitee = true;
		}
		$scope.savePerm();
	}

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
		serviceAjax.post('sendconvention/' + $scope.perm.id).then(function() {
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
		serviceAjax.post('sendjustificatif/' + $scope.perm.id).then(function(response){
			message.success('Justificatif envoyé !');
		});
	};


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
		serviceAjax.put('creneau/' + $routeParams.id + '/', sendPerm).then(function() {
			$scope.perm.state = $scope.getState($scope.perm);
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
		serviceAjax.get('facture/categories/')
		.then(function(response) {
			$scope.categories = response.data;
		});
	}

	$scope.addFacture = function() {
		var newFacture = angular.copy($scope.newFacture);
		var fields_errors = []
		if (!newFacture.prix) {
			fields_errors.push("Prix requis")
		} else if (!parseFloat(newFacture.prix)){
			fields_errors.push("Prix mauvais format")
		} else if (!newFacture.tva_complete) {
			fields_errors.push("TVA requise")
		} else if (newFacture.prix - newFacture.tva_complete <= 0) {
			fields_errors.push("Prix et TVA incohérents")
		}
		if (fields_errors.length > 0) {
			var error_message = ""
			for (let index = 0; index < fields_errors.length; index++) {
				error_message += fields_errors[index];
				if (index != fields_errors.length - 1) {
					error_message += ", "
				}
			}
			message.error(error_message);
			return;
		}
		
		newFacture.date = dateWrapper.DateToStringDate(newFacture.date);
		if (newFacture.date_paiement) {
			newFacture.date_paiement = dateWrapper.DateToStringDate(newFacture.date_paiement);
		}
		if (newFacture.date_remboursement) {
			newFacture.date_remboursement = dateWrapper.DateToStringDate(newFacture.date_remboursement);
		}
		var prixHT = newFacture.prix - newFacture.tva_complete;
		var pourcentage_tva = (newFacture.tva_complete / prixHT) * 100;
		newFacture.tva = pourcentage_tva.toFixed(6);
		newFacture.perm = $routeParams.id;
		delete newFacture.tva_complete;


		serviceAjax.post('facture/recue/', newFacture)
		.then(function(response) {
			$scope.perm.facturerecue_set.push(response.data);
			initNewFacture();
			$scope.addingFacture = false;
			message.success('Facture bien ajoutée !');
		}, function(error){
			console.log(error)
		});
	};

	$scope.addToPayutc = function(article) {
		article.addingToPayutc = true;
		serviceAjax.get('perms/payutc/article/' + article.id).then(function(response) {
			article.id_payutc = response.data;
			article.addingToPayutc = false;
			message.success('Article bien ajouté à PayUTC !');
		}, function() {
			article.addingToPayutc = false;
		});
	};

	$scope.updateArticleSales = function(article) {
		serviceAjax.get('perms/sales/article/' + article.id).then(function(response) {
			article.ventes = response.data.sales;
			article.ventes_last_update = new Date();
			$scope.salesInfo = null;
			message.success('Article mis à jour. Ventes de l\'article : ' + response.data.sales + ' ventes.');
		});
	}

	$scope.addArticle = function() {
		$scope.addingArticle = true;
		serviceAjax.post('perm/articles/', $scope.newArticle).then(function(response) {
			$scope.addingArticle = false;
			$scope.createArticle = false;
			$scope.newArticle.id = response.data.id;
			$scope.perm.article_set.push(angular.copy($scope.newArticle));
			message.success('Article ' + $scope.newArticle.nom + ' bien ajouté à Picsous !');
			$scope.newArticle = { perm: $routeParams.id, tva: 5.5 };
		}, function(error) {
			if (error.status == 400) {
				var key_errors = Object.keys(error.data)
				var error_message = ""
				for (let index = 0; index < key_errors.length; index++) {
					error_message+= key_errors[index] + ": " + error.data[key_errors[index]] + "\n ";
				}
				message.error(error_message)
			} 
			$scope.addingArticle = false;
		});
	}
});
