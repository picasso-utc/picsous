angular.module('picsousApp').directive('dateInput', function () {
  return {
    restrict: 'E',
    scope: {
      dateGiven: '=ngModel'
    },
    controller: ['$scope', function ($scope) {
      $scope.dateOptions = {
        initDate: new Date(),
        dateDisabled: false,
        formatYear: 'yy'
      }

      $scope.popupOpen = false

      $scope.openPopup = function () {
        $scope.popupOpen = true
      }
    }],
    templateUrl: 'views/dateSelector.html'
  }
})
