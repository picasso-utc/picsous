'use strict';

angular.module('picsousApp', [
	'LocalStorageModule',
	'ngRoute',
	'ngTable',
	'ui.bootstrap',
	'ui.mask',
	]).config(function($routeProvider, $httpProvider, localStorageServiceProvider, APP_URL) {
		localStorageServiceProvider.setPrefix('Picsous' + APP_URL)
			.setStorageType('sessionStorage')
			.setNotify(false, false);

		$routeProvider.when('/', {
			templateUrl: 'views/home.html',
			controller: 'HomeCtrl',
			reloadOnSearch: false,
		}).when('/bank', {
			templateUrl: 'views/bank.html',
			controller: 'BankSimulationCtrl',
			reloadOnSearch: false,
		}).when('/addperm', {
			templateUrl: 'views/addperm.html',
			controller: 'AddPermCtrl',
			reloadOnSearch: false,
		}).when('/allperms', {
			templateUrl: 'views/allperms.html',
			controller: 'AllPermsCtrl',
			reloadOnSearch: false,
		}).when('/perm/:id', {
			templateUrl: 'views/perm.html',
			controller: 'PermCtrl',
			reloadOnSearch: false,
		}).when('/facturesemises', {
			templateUrl: 'views/facturesemises.html',
			controller: 'FacturesEmisesCtrl',
			reloadOnSearch: false,
		}).when('/factureemise/:id', {
			templateUrl: 'views/factureemise.html',
			controller: 'FactureEmiseCtrl',
			reloadOnSearch: false,
		}).when('/facturesrecues', {
			templateUrl: 'views/facturesrecues.html',
			controller: 'FacturesRecuesCtrl',
			reloadOnSearch: false,
		}).when('/facturesrecues/:id', {
			templateUrl: 'views/facturerecue.html',
			controller: 'FactureRecueCtrl',
			reloadOnSearch: false,
		}).when('/analyse', {
			templateUrl: 'views/vatanalysis.html',
			controller: 'VATAnalysisCtrl',
			reloadOnSearch: false,
		}).when('/cheques', {
			templateUrl: 'views/cheques.html',
			controller: 'ChequesCtrl',
			reloadOnSearch: false,
		}).when('/stats', {
			templateUrl: 'views/stats.html',
			controller: 'StatsCtrl',
			reloadOnSearch: false,
		}).otherwise({
			redirectTo: '/'
		});

		$httpProvider.interceptors.push(function($q, loadingSpin, localStorageService, message) {
			return {
				request: function(config) {
					const semester = localStorageService.get("semester")
					if (semester) {
						config.url += '?semestre=' + semester; 
					}
					loadingSpin.start();
					return config;
				},

				response: function(response) {
					loadingSpin.end();
					return response;
				},

				responseError: function(response) {
					loadingSpin.end();
					if (message.status && message.status >= 500) {
						message.error("Problème serveur, contacter un administrateur.");
					}
					return $q.reject(response);
				}
			}
		});
	});
