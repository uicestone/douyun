(function () {
    'use strict';

    angular.module('app')
        .filter('friendlyDisplay', friendlyDisplay);

    function friendlyDisplay() {
        return function(input) {
            if(typeof input === 'boolean') {
                return input ? '是' : '否';
            }
            else {
                return input;
            }
        }
    }
 
})(); 


