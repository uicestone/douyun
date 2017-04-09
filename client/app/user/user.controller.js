(function () {
    'use strict';

    angular.module('app.user')
    .controller('userListCtrl', ['$scope', '$location', '$mdBottomSheet', 'userService', 'institutionService', userListCtrl])
    .controller('userDetailCtrl', ['$scope', '$route', 'userService', 'institutionService', 'logService', 'userRolesConstant', userDetailCtrl])
    .controller('userBottomSheetCtrl', ['$scope', '$mdBottomSheet', '$mdToast', 'userRolesConstant', 'user', 'users', 'institutions', userBottomSheetCtrl]);

    function userListCtrl($scope, $location, $mdBottomSheet, userService, institutionService) {

        $scope.query = angular.extend({page:1, limit: 20}, $location.search());

        $scope.userType = $location.search().roles === 'family' ? '家属亲友' : '护理人员';

        $scope.getUser = function() {
            $scope.promise = userService.query($scope.query).$promise.then(function(users) {
                $scope.users = users;
            });
        };

        $scope.getUser();

        $scope.institutions = institutionService.query({limit:1000});

        $scope.showUserDetail = function (user) {
            $location.url('/user/' + user._id);
        };

        $scope.editUser = function (user) {
            if(!user) {
                user = new userService();
                user.roles = [];
                user.institution = $scope.institution;
            }

            $mdBottomSheet.show({
                templateUrl: 'app/user/user-bottom-sheet.html',
                controller: 'userBottomSheetCtrl',
                locals: {user: user, users: $scope.users, institutions: $scope.institutions}
            });
        };

    }

    function userDetailCtrl($scope, $route, userService, institutionService, logService, userRolesConstant) {

        $scope.user = userService.get({id:$route.current.params.id}, function (user) {
            $scope.assistants = userService.query({institution:user.institution._id, roles:['assistant', 'admin', 'nurse']});
        });

        $scope.roles = userRolesConstant;

        $scope.institutions = institutionService.query({limit:1000});

        $scope.logs = logService.query({'assistant':$route.current.params.id, limit:1000});

        $scope.$watch('user', function (newValue, oldValue) {
            if (oldValue.$resolved) {
                $scope.userChanged = true;
            }
        }, true);

        $scope.updateUser = function (user) {
            user.$save();
        };

        $scope.editLog = function (log) {
            if(!log) {
                log = new logService();
                log.user = $scope.user;
            }

            $scope.log = log;

            $mdBottomSheet.show({
                templateUrl: 'app/user/log-bottom-sheet.html',
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
            return roomService.query({institution:$scope.user.institution._id, limit:1000}).$promise;
        };

        $scope.chart = {
            labels: ['4/2', '4/3', '4/4', '4/5', '4/6', '4/7', '4/8'],
            series: ['更换尿布'],
            data: [
                [9, 14, 15, 11, 12, 10, 10]
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

    function userBottomSheetCtrl ($scope, $mdBottomSheet, $mdToast, userRolesConstant, user, users, institutions) {
        $scope.user = user;
        $scope.users = users;
        $scope.institutions = institutions;
        $scope.roles = userRolesConstant;
        $scope.updateUser = function (user) {
            $mdBottomSheet.hide();
            user.$save();
            if(!user._id) {
                $scope.users.push(user);
            }
        };
    }

})(); 



