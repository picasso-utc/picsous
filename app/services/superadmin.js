'use strict';

angular.module('picsousApp').factory('superadmin', function(casConnectionCheck, localStorageService, message) {
    var isSuperadmin = false;
    var showOption = localStorageService.get('showadmin') || false;
    
    function setSuperadmin() {
        // Vérifie que le mode superadmin peut être activé, et l'active si possible
        if (!casConnectionCheck.isAdmin()) {
            return message.error('Vous n\'avez pas les droits pour passer en mode superadmin');
        }
        if (!showOption) {
            return message.error('Le mode admin n\'a pas été autorisé');
        }
        isSuperadmin = true;
        return;
    }
    
    function activateOption(val) {
        showOption = val;
        localStorageService.set('showadmin', val);
        if (!val) {
            removeSuperadmin();
        }
    }
    
    function isActivated() {
        // Retourne si le mode superadmin peut être activé
        return showOption;
    }
    
    function active() {
        // Retourne si le superadmin est actif
        return isSuperadmin;
    }
    
    function removeSuperadmin() {
        // Permet de retirer le mode superadmin
        isSuperadmin = false;
        return;
    }
    
    function hasAuthorization() {
        /* Fonction permettant de vérifier si le mode superadmin est autorisé
        et activé
        
        C'est la fonction standard à utiliser
        */
        return isSuperadmin && casConnectionCheck.isAdmin() && showOption;
    }
    
    return {
        setSuperadmin: setSuperadmin,
        removeSuperadmin: removeSuperadmin,
        isActive: active,
        isShowable: isActivated,
        setShowable: activateOption,
        access: hasAuthorization,
    };
});
