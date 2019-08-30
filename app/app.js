'use strict';

angular.module('picsousApp', [
	'LocalStorageModule',
	'ngRoute',
	'ngTable',
	'ui.bootstrap',
	'ui.mask',
	'ngCookies'
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

		$httpProvider.interceptors.push(function($q, message, APP_URL, token, loadingSpin) {
			return {
				request: function(config) {
					// var requestToken = token.getToken();
					// if (requestToken) {
					// 	config.headers.Authorization = 'Token ' + token.getToken();
					// } 
					loadingSpin.start();
					// if (config.url.search(APP_URL) !== '-1' && config.url.search('.html') !== '-1') {
					// 	if (config.url.indexOf('?') !== -1) {
					// 		config.url += '&randValue=' + Math.random()*10000000000000000000000;
					// 	} else {
					// 		config.url += '?randValue=' + Math.random()*10000000000000000000000;
					// 	}
					// }
					return config;
				},

				response: function(response) {
					loadingSpin.end();
					return response;
				},

				responseError: function(response) {
					loadingSpin.end();
					// if (response.config.url.search('autocomplete') !== -1) {
					// 	return;
					// }
					// if (response.data){
					// 	message.error(response.data.detail || (response.data.error ? (response.data.error.message || response.data.error.code) : false) || 'Une erreur est survenue.');
					// } else {
					// 	message.error('Impossible de se connecter au serveur.');
					// }
					// return $q.reject(response);
				}
			}
		});
	});
