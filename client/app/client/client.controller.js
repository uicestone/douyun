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

        $scope.$watch('client', function (client, clientOld) {

            if (clientOld.$resolved) {
                $scope.clientChanged = true;
            }

            if (client.$resolved && !(client.bean && clientOld.bean && client.bean._id === clientOld.bean._id)) {

                if ($scope.subscribedBeans) {
                    socketIoService.emit('leave', $scope.subscribedBeans)
                        .off('reconnect');
                }

                $scope.subscribedBeans = client.bean ? 'bean ' + client.bean._id : 'unbinded beans'
                
                socketIoService.emit('join', $scope.subscribedBeans)
                    .on('reconnect', function () {
                        socketIoService.emit('join', $scope.subscribedBeans)
                    });
            }

        }, true);

        $scope.logs = logService.query({'client':$route.current.params.id, limit:1000});

        $scope.updateClient = function (client) {
            client.$save();
        };

        $scope.$on('$destroy', function () {
            socketIoService.emit('leave', $scope.subscribedBeans);
            socketIoService.off('temp data update');
            socketIoService.off('client status update');
            socketIoService.off('reconnect');
        });

        socketIoService.on('temp data update', function (bean) {

            // console.log(bean.mac, bean.rssi, bean.temp + '°C', bean.humi + '%', bean.distance + 'cm', bean.battery + '%');
            
            if ($scope.client.bean) {
                if ($scope.client.bean._id === bean._id) {
                    angular.extend($scope.client.bean, bean);
                }
            } else {
                if (bean.rssi > -50) {
                    $scope.nearByBean = bean;
                }
                else if ($scope.nearByBean && bean.mac === $scope.nearByBean.mac) {
                    $scope.nearByBean = null;
                }
            }
            $scope.$apply();
        });

        socketIoService.on('client status update', function (status) {
            // reload logs on different status
            if (!$scope.client.status || $scope.client.status.name !== status.name) {
                logService.query({'client':$route.current.params.id, limit:1000}, function (logs) {
                    $scope.logs = logs;
                });
                // also, reload client detail for latest changes count
                clientService.get({id:$route.current.params.id}, function (client) {
                    $scope.client = client;
                });
            }

            $scope.$apply();
        });

        $scope.bindBean = function (bean, client) {
            client.bean = bean;
            client.$save();
        };

        $scope.editLog = function (log) {

            var addRefreshLog = log === false;

            if(!log) {
                log = new logService();

                if (!$scope.$parent.user.can('manage-user')) {
                    log.assistant = $scope.$parent.user;
                }
                
                log.client = $scope.client;
                log.createdAt = new Date();
                log.title = '更换尿布';
            }

            if (addRefreshLog) {
                log.$save();
            }
            else {
                $scope.log = log;
                $scope.log.createdAtMoment = moment(log.createdAt);

                $mdBottomSheet.show({
                    templateUrl: 'app/client/log-bottom-sheet.html',
                    scope: $scope,
                    preserveScope: true
                });
            }
        };

        $scope.updateLog = function (log) {
            $mdBottomSheet.hide();
            log.createdAt = log.createdAtMoment;
            log.$save();
            if(!log._id) {
                $scope.logs.unshift(log);
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



