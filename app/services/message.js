angular.module('picsousApp').factory('message', function() {
	return {
		message: function(message, type, overload) {
			var options = {
				message: message
			};
			if (overload) {
				angular.extend(options, overload);
			}
			$.notify(options, {
				type: type,
				delay: 3000,
			});
		},
		success: function(message) {
			this.message(message, 'success', { icon: 'glyphicon glyphicon-ok', title: 'Succès :' });
		},
		error: function(message) {
			this.message(message, 'danger', { icon: 'glyphicon glyphicon-remove', title: 'Erreur :' });
		},
	}
});
