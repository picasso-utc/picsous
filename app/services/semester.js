'use strict';

angular.module('picsousApp').factory('semester', function(serviceAjax, $route, casConnectionCheck, localStorageService) {
    /*
    Module permettant de gérer le semestre actuel, et de changer de semestre à
    la volée.
    */

    // Liste des semestres
    var semesters = [];
    // Fonction permettant de mettre à jour la liste des semestres.
    var getSemesters = function() {
        return serviceAjax.get('semesters/').then(function(response) {
            semesters.length = 0;
            response.data.forEach(function(s) {
                semesters.push(s);
            });
        });
    };
    /*
    Semestre dont on a choisi de forcer la data.
    Si currentSemester est nul, le client n'altère pas les requêtes et charge la data du semestre actuel.
    Sinon :
    - si currentSemester est un chiffre, on considère que c'est l'ID du semestre dans la BDD dont on veut
    charger les données
    - si currentSemester vaut "all", on considère qu'on veut charger la data de tous les semestres 
    */
    var currentSemester = null;
    localStorageService.set("semester", null)
    // Fonction permettant de changer le semestre actuel.
    var setSemester = function(id) {
        currentSemester = id;
        localStorageService.set("semester", id)
        $route.reload();
    };

    var semesterTypeName = function(abv) {
        if (abv === 'P') {
            return 'Printemps';
        } else if (abv === 'A') {
            return 'Automne';
        }
    };

    var semesterName = function(semester) {
        return semesterTypeName(semester.periode) + ' ' + semester.annee.toString();
    };

    var semesterNameById = function(id) {
        for (var semId in semesters) {
            if (semesters[semId].id === id) {
                return semesterName(semesters[semId]);
            }
        }
    };

    var init = function(){
        casConnectionCheck.searchPromise().then(function() {
            getSemesters();
        });
    }
    init()

    return {
        allSemesters: semesters,
        setSemester: setSemester,
        semesterName: semesterTypeName,
        currentSemester: function() {
            return currentSemester;
        },
        currentCredit: function () { return  serviceAjax.get('core/semester/credit')},
        currentSemesterName: function(id) { return semesterNameById(id); },
    };
});
