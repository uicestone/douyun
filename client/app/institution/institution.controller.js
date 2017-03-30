(function () {
    'use strict';

    angular.module('app.institution')
    .controller('institutionListCtrl', ['$scope', '$location', 'institutionService', institutionListCtrl])
    .controller('institutionDetailCtrl', ['$scope', '$route', '$mdBottomSheet', 'institutionService', 'roomService', 'userService', 'clientService', institutionDetailCtrl]);

    function institutionListCtrl($scope, $location, institutionService) {

        $scope.query = angular.extend({page:1, limit: 20}, $location.search());

        $scope.getInstitution = function() {
            $scope.promise = institutionService.query($scope.query).$promise.then(function(institutions) {
                $scope.institutions = institutions;
            });
        };

        $scope.getInstitution();

        $scope.showInstitutionDetail = function (institution) {
            $location.url('/institution/' + institution._id);
        };

    }

    function institutionDetailCtrl($scope, $route, $mdBottomSheet, institutionService, roomService, userService, clientService) {

        $scope.institution = institutionService.get({id:$route.current.params.id});

        $scope.$watch('institution', function (newValue, oldValue) {
            if (oldValue.$resolved) {
                $scope.institutionChanged = true;
            }
        }, true);

        $scope.rooms = roomService.query({'inititution._id':$scope.institution._id, limit:1000});
        $scope.assistants = userService.query({'inititution._id':$scope.institution._id, limit:1000});
        $scope.clients = clientService.query({'inititution._id':$scope.institution._id, limit:1000});

        $scope.updateInstitution = function (institution) {
            institution.$save();
        };

        $scope.editRoom = function (room) {
            if(!room) {
                room = new roomService();
                room.institution = $scope.institution;
            }

            $scope.room = room;

            $mdBottomSheet.show({
                templateUrl: 'app/institution/room-bottom-sheet.html',
                scope: $scope,
                preserveScope: true
            });
        };

        $scope.updateRoom = function (room) {
            $mdBottomSheet.hide();
            room.$save();
            if(!room._id) {
                $scope.rooms.push(room);
            }
        };

        $scope.editUser = function (user) {
            if(!user) {
                user = new userService();
                user.institution = $scope.institution;
            }

            $scope.user = user;

            $mdBottomSheet.show({
                templateUrl: 'app/institution/nurse-bottom-sheet.html',
                scope: $scope,
                preserveScope: true
            });
        };

        $scope.updateUser = function (user) {
            $mdBottomSheet.hide();
            user.$save();
            if(!user._id) {
                $scope.assistants.push(user);
            }
        };

        $scope.editClient = function (client) {
            if(!client) {
                client = new clientService();
                client.institution = $scope.institution;
            }

            $scope.client = client;

            $mdBottomSheet.show({
                templateUrl: 'app/institution/client-bottom-sheet.html',
                scope: $scope,
                preserveScope: true
            });
        };

        $scope.updateClient = function (client) {
            $mdBottomSheet.hide();
            client.$save();
            if(!client._id) {
                $scope.clients.push(client);
            }
        };

    }

})(); 



