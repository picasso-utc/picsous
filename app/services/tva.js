angular.module('picsousApp').factory('tva', function() {
	return {
		getHTFromTTCAndPercentage: function(TTC, percentage) {
			var fullPerc = (100 + percentage) / 100;
			return TTC / fullPerc;
		},

		getVATFromTTCAndPercentage: function(TTC, percentage) {
			return TTC - this.getHTFromTTCAndPercentage(TTC, percentage);
		},

		getVATPercentageFromHTAndVAT: function(HT, VAT) {
			return (VAT / HT) * 100;
		},

		getVATPercentageFromTTCAndVAT: function(TTC, VAT) {
			return (VAT / (TTC - VAT)) * 100;
		},
	}
});
