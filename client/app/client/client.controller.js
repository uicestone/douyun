(function () {
    'use strict';

    angular.module('app.client')
    .controller('clientListCtrl', ['$scope', '$location', 'clientService', clientListCtrl])
    .controller('clientDetailCtrl', ['$scope', '$route', '$mdBottomSheet', 'clientService', 'logService', 'userService', clientDetailCtrl]);

    function clientListCtrl($scope, $location, clientService) {

        $scope.query = angular.extend({page:1, limit: 20}, $location.search());

        $scope.getClient = function() {
            $scope.promise = clientService.query($scope.query).$promise.then(function(clients) {
                $scope.clients = clients;
            });
        };

        $scope.getClient();

        $scope.showClientDetail = function (client) {
            $location.url('/client/' + client._id);
        };

    }

    function clientDetailCtrl($scope, $route, $mdBottomSheet, clientService, logService, userService) {

        $scope.client = clientService.get({id:$route.current.params.id}, function (client) {
            $scope.assistants = userService.query({'institution._id':client.institution._id, roles:['assistant', 'admin', 'nurse']});
        });

        $scope.$watch('client', function (newValue, oldValue) {
            if (oldValue.$resolved) {
                $scope.clientChanged = true;
            }
        }, true);

        $scope.logs = logService.query({'client._id':$scope.client._id, limit:1000});

        $scope.updateClient = function (client) {
            client.$save();
        };

        $scope.editLog = function (log) {
            if(!log) {
                log = new logService();
                log.client = $scope.client;
            }

            $scope.log = log;

            $mdBottomSheet.show({
                templateUrl: 'app/client/log-bottom-sheet.html',
                scope: $scope,
                preserveScope: true
            });
        };

        $scope.updateLog = function (log) {
            $mdBottomSheet.hide();
            log.$save();
            if(!log._id) {
                $scope.logs.push(log);
            }
        };
    }

})(); 



