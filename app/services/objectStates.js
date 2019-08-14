angular.module('picsousApp').factory('objectStates', function() {
	return {
		permStateLabel: function(state) {
			if (state === 'T') return 'label-success';
			if (state === 'V') return 'label-warning';
			if (state === 'N') return 'label-danger';
			return 'label-default';
		},

		permState: function(state) {
			if (state === 'T') return 'Traitée';
			if (state === 'V') return 'Manque facture(s)';
			if (state === 'N') return 'Non traitée';
			return state;
		},

		factureEmiseState: function(state) {
			if (state === 'D') return 'Dûe';
			if (state === 'T') return 'Partiellement payée';
			if (state === 'A') return 'Annulée';
			if (state === 'P') return 'Payée';
			return state;
		},

		factureEmiseStateLabel: function(state) {
			if (state === 'D') return 'label-danger';
			if (state === 'T') return 'label-warning';
			if (state === 'A') return 'label-default';
			if (state === 'P') return 'label-primary';
			return 'label-default'
		},

		factureRecueState: function(state) {
			if (state === 'D') return 'À payer';
			if (state === 'R') return 'À rembourser';
			if (state === 'E') return 'En attente';
			if (state === 'P') return 'Payée';
			return state;
		},

		factureRecueStateLabel: function(state) {
			if (state === 'D') return 'label-danger';
			if (state === 'R') return 'label-primary';
			if (state === 'E') return 'label-warning';
			if (state === 'P') return 'label-success';
			return 'label-default'
		},

		chequeState: function(state) {
			if (state === 'C') return 'Caution';
			if (state === 'P') return 'En cours';
			if (state === 'A') return 'Annulé';
			if (state === 'E') return 'Encaissé';
			return state;
		},

		chequeStateLabel: function(state) {
			if (state === 'C') return 'label-default';
			if (state === 'A') return 'label-warning';
			if (state === 'E') return 'label-primary';
			if (state === 'P') return 'label-success';
			return 'label-primary';
		},
	}
});
