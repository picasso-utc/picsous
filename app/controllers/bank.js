/* global angular */

'use strict'

angular.module('picsousApp').controller('BankSimulationCtrl', function ($scope, serviceAjax, dateWrapper, semester) {
  $scope.soldeLoaded = false
  $scope.editingCredit = false

  semester.currentCredit().then(function (response) {
    $scope.solde = response.data.solde / 100
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

  serviceAjax.get('facture/reversements/').then(function (response) {
    $scope.reversements = response.data
  })

  $scope.newR = {}
  $scope.saveReversement = function (r) {
    r.prix = (typeof r.prix === 'number' ? r.prix : parseFloat(r.prix.replace(',', '.')))
    let newReversement = !r.id
    let reversement = angular.copy(r)
    var dateEffectue = dateWrapper.DateToStringDate(reversement.date_effectue)
    r.saving = true
    const data = {
      id: reversement.id,
      prix: reversement.prix,
      date_effectue: dateEffectue
    }
    serviceAjax.post('facture/reversements/', data).then(function (response) {
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
    const data = {
      solde_debut: Math.floor(parseFloat($scope.solde.toString().replace(',', '.')) * 100)
    }
    serviceAjax.put('core/semester/credit', data).then(function (response) {
      $scope.solde = response.data.solde / 100
      $scope.editingCredit = false
    })
  }

  serviceAjax.get('core/semester/state').then(function (res) {
    $scope.sumReceivedBills = res.data.sum_paid_received_bills
    $scope.sumOutvoicedBills = res.data.sum_paid_outvoiced_bills
  })
})
