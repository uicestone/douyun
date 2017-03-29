(function () {
    'use strict';

    angular.module('app.client')
    .controller('clientListCtrl', ['$scope', '$location', 'clientService', clientListCtrl])
    .controller('clientDetailCtrl', ['$scope', 'clientService', clientDetailCtrl]);

    function clientListCtrl($scope, $location, clientService) {

        $scope.query = angular.extend({page:1, limit: 20}, $location.search());

        $scope.getClient = function() {
            $scope.promise = clientService.query($scope.query).$promise.then(function(clients) {
                $scope.clients = clients;
            });
        };

        $scope.getClient();

        $scope.showClientDetail = function (client) {
            $location.path('/client/' + client._id);
        };

    }

    function clientDetailCtrl($scope, $route, clientService) {

        $scope.client = clientService.get({id:$route.params.id});

    }

})(); 



