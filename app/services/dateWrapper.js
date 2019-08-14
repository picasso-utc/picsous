angular.module('picsousApp').factory('dateWrapper', function() {
	return {
		stringDate: function(val) {
			var date = val.getDate();
			return date.toString().length === 1 ? '0' + date : date;
		},

		DateToStringDate: function(val) {
			var month = (parseInt(val.getMonth()) + 1).toString();
			if (month.length == 1) {
				month = '0' + month;
			}
			return val.getFullYear() + '-' + month + '-' + this.stringDate(val);
		},

		DateToSimpleStringDate: function(val) {
			var month = (parseInt(val.getMonth()) + 1).toString();
			if (month.length == 1) {
				month = '0' + month;
			}
			return this.stringDate(val) + '/' + month;
		},
	};
});
