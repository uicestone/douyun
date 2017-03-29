(function () {
    'use strict';

    angular.module('app.page')
    .controller('authCtrl', ['$scope', '$window', '$location', 'authService', authCtrl]);

    function authCtrl($scope, $window, $location, authService) {

        $scope.login = function() {
            $scope.$parent.$parent.user = authService.login($scope.username, $scope.password);
        }

        $scope.signup = function() {
            $location.url('/')
        }

        $scope.reset =    function() {
            $location.url('/')
        }

        $scope.unlock =    function() {
            $location.url('/')
        }     

        $scope.updateUser = function(user) {
            user.$save();
        };
    }

})(); 



