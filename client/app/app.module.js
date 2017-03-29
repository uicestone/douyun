(function () {
    'use strict';

    angular.module('app', [
        // Core modules
         'app.core'
        
        // Custom Feature modules
        ,'app.page'
        ,'app.client'
        ,'app.institution'
        ,'app.room'
        ,'app.user'
        
        // 3rd party feature modules
        ,'md.data.table'
    ]);

})();

