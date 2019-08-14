angular.module('picsousApp').factory('loadingSpin', function() {
	return {
		value: 0,

		start: function() {
			this.value += 1;
			this.update();
		},

		update: function() {
			if (this.value === 0) {
				angular.element('#loading-spinner').css('display', 'none');
			} else {
				angular.element('#loading-spinner').css('display', 'initial');
			}
		},

		element: function() {
			return angular.element('#loading-spinner');
		},

		end: function() {
			this.value -= 1;
			if (this.value < 0) {
				this.value = 0;
			}
			this.update();
		},
	};
});
