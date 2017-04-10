(function () {
    'use strict';

    angular.module('app.client')
    .controller('clientListCtrl', ['$scope', '$location', 'clientService', clientListCtrl])
    .controller('clientDetailCtrl', ['$scope', '$route', '$mdBottomSheet', 'clientService', 'logService', 'userService', 'institutionService', 'roomService', 'socketIoService', clientDetailCtrl]);

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

    function clientDetailCtrl($scope, $route, $mdBottomSheet, clientService, logService, userService, institutionService, roomService, socketIoService) {

        $scope.client = clientService.get({id:$route.current.params.id}, function (client) {
            $scope.assistants = userService.query({institution:client.institution._id, roles:['assistant', 'admin', 'nurse']});
        });

        $scope.institutions = institutionService.query({limit:1000});

        $scope.$watch('client', function (newValue, oldValue) {
            if (oldValue.$resolved) {
                $scope.clientChanged = true;
            }
        }, true);

        $scope.logs = logService.query({'client':$route.current.params.id, limit:1000});

        $scope.updateClient = function (client) {
            client.$save();
        };

        socketIoService.on('temp data update', function (bean) {
            if ($scope.client.bean) {
                if ($scope.client.bean.mac === bean.mac) {
                    $scope.client.bean = bean;
                }
            } else {
                if (bean.rssi > -50) {
                    $scope.nearByBean = bean;
                }
                else {
                    $scope.nearByBean = null;
                }
            }
            $scope.$apply();
        });

        $scope.bindBean = function (bean, client) {
            client.bean = bean;
            client.$save();
        };

        $scope.editLog = function (log) {
            if(!log) {
                log = new logService();

                if (!$scope.$parent.user.can('manage-user')) {
                    log.assistant = $scope.$parent.user;
                }
                
                log.client = $scope.client;
                log.createdAt = new Date();
                log.title = '更换尿布';
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

        $scope.getRooms = function () {
            return roomService.query({institution:$scope.client.institution._id, limit:1000}).$promise;
        };

        $scope.chart = {
            labels: ['4/2', '4/3', '4/4', '4/5', '4/6', '4/7', '4/8'],
            series: ['更换尿布', '小便次数'],
            data: [
                [3, 2, 4, 3, 4, 3, 4],
                [6, 5, 7, 6, 5, 4, 5]
            ],
            options: {
                scales: {
                    yAxes: [
                        {
                            ticks: {
                                beginAtZero: true
                            }
                        }
                    ]
                },
                legend: {
                    display: true
                }
            }
        };
    }

})(); 



