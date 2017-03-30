(function () {
    'use strict';

    angular.module('app.core', [
        // Angular modules
         'ngAnimate'
        ,'ngAria'
        ,'ngMessages'
        ,'ngResource'
        ,'ngRoute'

        // Custom modules
        ,'app.layout'
        
        // 3rd Party Modules
        ,'oc.lazyLoad'
        ,'ngMaterial'
        ,'duScroll'
        ,'angular-clipboard'
        ,'as.sortable'
        ,'ngMaterialDatePicker'
    ]);

})();

