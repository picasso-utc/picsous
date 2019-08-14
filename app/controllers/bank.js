/* global angular */

'use strict'

angular.module('picsousApp').controller('BankSimulationCtrl', function ($scope, APP_URL, dateWrapper, semester, serverGetter, $http) {
  $scope.soldeLoaded = false
  $scope.editingCredit = false

  semester.currentCredit().then(function (response) {
    $scope.solde = response.data / 100
    $scope.soldeLoaded = true
  })

  $scope.editCredit = function () {
    $scope.savedSolde = $scope.solde
    $scope.editingCredit = true
  }

  $scope.cancelCreditEdit = function () {
    $scope.solde = $scope.savedSolde
    $scope.editingCredit = false
  }

  $scope.reversements = []

  serverGetter.reversementsGetter().then(function (response) {
    $scope.reversements = response.data
  })

  $scope.newR = {}
  $scope.saveReversement = function (r) {
    console.log(r)
    r.prix = (typeof r.prix === 'number' ? r.prix : parseFloat(r.prix.replace(',', '.')))
    let newReversement = !r.id
    let reversement = angular.copy(r)
    var dateEffectue = dateWrapper.DateToStringDate(reversement.date_effectue)
    r.saving = true
    $http({
      method: 'POST',
      url: APP_URL + '/facture/reversements/',
      data: {
        id: reversement.id,
        prix: reversement.prix,
        date_effectue: dateEffectue
      }
    }).then(function (response) {
      delete r.saving
      if (newReversement) {
        $scope.reversements.push(response.data)
        $scope.newR = {}
      }
    }, function () {
      delete r.saving
    })
  }

  $scope.editReversement = function (r) {
    r.old = angular.copy(r)
    r.editing = true
  }

  $scope.sumReversements = function (rList) {
    if (!rList || !rList.length) return 0
    var t = rList.map(function (r) { return r.prix }).reduce(function (a, b) { return a + b }, 0)
    return t
  }

  $scope.saveCreditEdit = function () {
    $http({
      method: 'PUT',
      data: {
        solde_debut: Math.floor(parseFloat($scope.solde.toString().replace(',', '.')) * 100)
      },
      url: APP_URL + '/getCurrentCredit'}).then(function (response) {
        $scope.solde = response.data / 100
        $scope.editingCredit = false
      })
  }

  $http({ method: 'GET', url: APP_URL + '/getSemestreState' }).then(function (res) {
    $scope.sumReceivedBills = res.data.sum_paid_received_bills
    $scope.sumOutvoicedBills = res.data.sum_paid_outvoiced_bills
  })
})
