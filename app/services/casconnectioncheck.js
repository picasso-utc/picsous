'use strict';

angular.module('picsousApp').factory('casConnectionCheck', function($routeParams, $http, APP_URL, $window, token, $q, $rootScope, localStorageService) {
	/*
		Module de gestion de la connexion de l'utilisateur
	*/


	
	// factory.isAuthenticated()

	var identity = null;
	// Login de l'utilisateur
	var rights = null;
	// Droits de l'utilisateur

	var authenticated = null;


	/**
	*  Enregistre les variables auth et token dans un cookie
	*/
	var saveSessionStorage = function() {

	  	// $cookies.putObject('PicAuth',
    //   	{
	   //      'identity' : identity,
	   //      'rights' : rights,
	   //      'authenticated' : authenticated,
    //   	});

    	localStorageService.set('identity', identity)
		localStorageService.set('rights', rights)
		localStorageService.set('authenticated', authenticated)
	}

	/**
	*  Charge les variables auth et token depuis un cookie
	*/
	var loadSessionStorage = function() {

		identity = localStorageService.get('identity')
		rights = localStorageService.get('rights')
		authenticated = localStorageService.get('authenticated')

		// if($cookies.getObject('PicAuth')) {
	 // 		identity = $cookies.getObject('PicAuth').identity;
		//   	rights = $cookies.getObject('PicAuth').rights;
		//   	authenticated = $cookies.getObject('PicAuth').authenticated;
		// }
	}

	/**
	*   Remove cookies
	*/
	var removeSessionStorage = function(){
		// $cookies.remove('PicAuth');
		identity = localStorageService.remove('identity')
		rights = localStorageService.remove('rights')
		authenticated = localStorageService.remove('authenticated')
	}


	// factory.login()

	var fuck = 'https://assos.utc.fr/picasso/fuck.html';
	// Lien vers l'erreur 403

	var CAS_URL = 'https://cas.utc.fr/cas/';
	// URL du CAS de l'UTC

	var logged = function() {
		
		// Fonction retournant true si l'utilisateur est connecté,
		// et false si l'utilisateur n'est pas connecté
		// return rights !== null;
		return authenticated
	};

	var getMyRights = function() {


		loadSessionStorage()

		/* Fonction interrogant le serveur pour savoir si l'utilisateur
		est authentifié - retourne la promesse $http */
		if (isUser()) {
			return $q.all();
		} else {
			return $http({
				url: 'http://localhost:8000/api/auth/me',
				method: 'GET',
				withCredentials: true,
			})

			// $http({
			// 	url: APP_URL + '/getmyrights',
			// 	method: 'GET'
			// });
		}
	};

	var isUser = function() {
		// Fonction retournant true si l'utilisateur est connecté et a des droits
		return logged() && rights;
	};

	var sendToFuck = function() {
		// Fonction renvoyant l'utilisateur vers la page 403 définie
		$window.location.href = fuck;
	};

	var sendToCAS = function(originalUrl) {
		// Fonction retournant l'utilisateur vers le serveur CAS pour une authentification
		// L'URL du service est définie en paramètre
		// $window.location.href = CAS_URL + '/login?service=' + originalUrl;
		$window.location.href = "http://localhost:8000/api/auth/login?redirect=" + originalUrl;
		// $http({
		// 	url: 'http://localhost:8000/api/auth/login',
		// 	method: 'GET'
		// }).then(function(response){
		// 	console.log(response)
		// });
	};
	
	var addToken = function(receivedToken) {
		// Fonction insérant le token passé en paramètre dans le service de sauvegarde de token
		token.setToken(receivedToken);
	};

	var callRights = function() {
		/*
			Fonction vérifiant les droits de l'utilisateur.
			- Si l'utilisateur est connecté : on sauvegarde ses droits en mémoire.
			- Si l'utilisateur n'est pas connecté :
				- Si l'utilisateur vient du serveur CAS (détecté par les paramètres dans l'URL) :
				On envoie le ticket et le service au serveur, pour l'authentifier.
					- Si l'authentification réussit, on sauvegarde le token d'authentification
					envoyé, et on redemande ses droits.
					- Si l'authentification échoue, on redirige l'utilisateur vers la page fuck.
				- Si l'utilisateur ne vient pas du CAS, on le redirige vers le CAS.
		*/
		return $q(function(resolve, failPromise) {
			getMyRights().then(function(response) {
				if (response.data && response.data.authenticated === false) {
					var originalUrl = $window.location.href.split('#')[0].split('?')[0];
					$window.location.href = "http://localhost:8000/api/auth/login?redirect=" + originalUrl;
					// Utilisateur pas connecté
					// var tick = $window.location.href.split('ticket=');
					// var originalUrl = $window.location.href.split('#')[0].split('?')[0];
					// // var originalUrl = "google.com"
					// if (tick.length > 1) {
					// 	tick = tick[1].split('#')[0].split('&')[0];
					// 	$http({
					// 		method: 'POST',
					// 		url: APP_URL + '/connexion',
					// 		data: {
					// 			ticket: tick,
					// 			service: originalUrl,
					// 		},
					// 	}).then(function(connectionResponse) {
					// 		identity = connectionResponse.data.success.login;
					// 		addToken(connectionResponse.data.success.token);
					// 		callRights();
					// 		resolve(connectionResponse);
					// 	}, function() {
					// 		sendToFuck();
					// 		failPromise();
					// 	});
					// } else {
					// 	sendToCAS(originalUrl);
					// 	failPromise();
					// }
				} else {
					if (response.data && !response.data.right) {
						sendToFuck()
					}
					// Utilisateur connecté : on sauvegarde ses droits
					// rights = response.data;
					if (response.data) {
						authenticated = response.data.authenticated
						rights = response.data.right
						identity = response.data.login
						saveSessionStorage()
					}
						
					resolve(rights);
				}
			}, function(){
				failPromise()
			});
		});
	};



	// return null;
	var searchPromise = callRights();

	return {
		identify: function() { return identity; },
		
	// 	token: function() { return token; },

		disconnect: function() {
			removeSessionStorage()
			$window.location.href = 'https://cas.utc.fr/cas/logout';
		},

		isConnected: function() {
			return logged();
		},

		isAdmin: function() {
			return rights == 'A';
		},
		
		isUser: function() {
			// return null;
			return isUser();
		},

		searchPromise: function() { return searchPromise; },
	};
});
