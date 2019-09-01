'use strict';

angular.module('picsousApp').factory('casConnectionCheck', function($http, $window, $q, localStorageService) {
	/*
		Module de gestion de la connexion de l'utilisateur
	*/



	/**
	*  Enregistre les variables auth et token dans un cookie
	*/
	var saveSessionStorage = function(data) {
    	localStorageService.set('identity', data.identity)
		localStorageService.set('right', data.right)
		localStorageService.set('authenticated', data.authenticated)
	}

	/**
	*  Charge les variables auth et token depuis un cookie
	*/
	var loadSessionStorage = function() {

		var data = {};
		data.identity = localStorageService.get('identity');
		data.right = localStorageService.get('right');
		data.authenticated = localStorageService.get('authenticated');
		return data;

	}

	/**
	*   Remove cookies
	*/
	var removeSessionStorage = function(){
		// $cookies.remove('PicAuth');
		localStorageService.remove('identity')
		localStorageService.remove('right')
		localStorageService.remove('authenticated')
	}


	// factory.login()

	var fuck = 'https://assos.utc.fr/picasso/fuck.html';
	// Lien vers l'erreur 403

	var CAS_URL = 'https://cas.utc.fr/cas/';
	// URL du CAS de l'UTC

	var logged = function() {
		
		// Fonction retournant true si l'utilisateur est connecté,
		// et false si l'utilisateur n'est pas connecté
		// Vérifie également les droits M pour Member et A pour Admin
		const data = loadSessionStorage()
		return data.authenticated && (data.right == "M" || data.right == "A")
	};


	var getMyRights = function() {

		const data = loadSessionStorage()
		/* Fonction interrogant le serveur pour savoir si l'utilisateur
		est authentifié - retourne la promesse $http */
		if (logged()) {
			return $q.all();
		} else {
			return $http({
				url: 'http://localhost:8000/api/auth/me',
				method: 'GET',
				withCredentials: true,
			})
		}
	};

	var isUser = function() {
		// Fonction retournant true si l'utilisateur est connecté et a des droits
		return logged();
	};


	var isAdmin = function(){
		const data = loadSessionStorage();
		return data.authenticated && data.right == "A";
	}

	var sendToFuck = function() {
		// Fonction renvoyant l'utilisateur vers la page 403 définie
		$window.location.href = fuck;
	};

	var sendToCAS = function(originalUrl) {
		// Fonction retournant l'utilisateur vers le serveur CAS pour une authentification
		// L'URL du service est définie en paramètre
		$window.location.href = "http://localhost:8000/api/auth/login?redirect=" + originalUrl;
	};


	var logout = function(){
		$window.location.href = 'https://cas.utc.fr/cas/logout';
	}
	

	var goLogin = function(){
		var originalUrl = $window.location.href.split('#')[0].split('?')[0];
		sendToCAS(originalUrl);
	}


	var callRights = function() {

		/*
			Fonction vérifiant les droits de l'utilisateur.
			- Si l'utilisateur est connecté et est membre du Pic : on sauvegarde ses informations dans la session locale.
			- Si l'utilisateur n'est pas connecté :
				On l'envoie vers le CAS via l'API Kraken
				- Si l'utilisateur vient du serveur CAS (détecté par les paramètres dans l'URL) :
				On envoie le ticket et le service au serveur, pour l'authentifier.
					- Si l'authentification réussit, on sauvegarde le token d'authentification
					envoyé, et on redemande ses droits.
					- Si l'authentification échoue, on redirige l'utilisateur vers la page fuck.
				- Si l'utilisateur ne vient pas du CAS, on le redirige vers le CAS.
		*/
		return $q(function(resolve, failPromise) {

			$http({
				url: 'http://localhost:8000/api/auth/me',
				method: 'GET',
				withCredentials: true,
			}).then(function(response){
				if (response) {
					if (response.data.authenticated && (response.data.right == "A" || response.data.right == "M")) {
						saveSessionStorage(response.data);	
						resolve();
					} else {
						failPromise();
						sendToFuck();
					}
				} else {
					goLogin();
					failPromise();
				}
			}, function(error){
				goLogin();
				failPromise();
			})
		});
	};


	var searchPromise = callRights();

	return {
		identify: function() { return identity; },
		
		disconnect: function() {
			removeSessionStorage()
			logout();
		},

		isConnected: function() {
			return logged();
		},

		isAdmin: function() {
			return isAdmin();
		},
		
		isUser: function() {
			return isUser();
		},

		searchPromise: function() { return searchPromise; },
	};
});
