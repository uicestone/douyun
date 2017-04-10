(function () {
    'use strict';

    angular.module('app.institution')
    .controller('institutionListCtrl', ['$scope', '$location', 'institutionService', institutionListCtrl])
    .controller('institutionDetailCtrl', ['$scope', '$route', '$location', '$mdBottomSheet', '$mdToast', 'institutionService', 'roomService', 'userService', 'clientService', institutionDetailCtrl])
    .controller('institutionRoomBottomSheetCtrl', ['$scope', '$mdBottomSheet', '$mdToast', 'room', 'rooms', 'assistants', institutionRoomBottomSheetCtrl])
    .controller('institutionNurseBottomSheetCtrl', ['$scope', '$mdBottomSheet', '$mdToast', 'userRolesConstant', 'user', 'assistants', institutionNurseBottomSheetCtrl])
    .controller('institutionClientBottomSheetCtrl', ['$scope', '$mdBottomSheet', '$mdToast', 'client', 'clients', 'rooms', 'assistants', institutionClientBottomSheetCtrl]);

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

    function institutionDetailCtrl($scope, $route, $location, $mdBottomSheet, $mdToast, institutionService, roomService, userService, clientService) {

        if ($route.current.params.id === 'create') {
            $scope.institution = new institutionService();
        }
        else {
            $scope.institution = institutionService.get({id:$route.current.params.id}, function (institution) {
                $scope.rooms = roomService.query({institution:institution._id, limit:1000});
                $scope.assistants = userService.query({institution:institution._id, roles:['assistant', 'admin', 'nurse']});
                $scope.clients = clientService.query({institution:institution._id, limit:1000});
            });
        }

        $scope.$watch('institution', function (newValue, oldValue) {
            if (oldValue.$resolved) {
                $scope.institutionChanged = true;
            }
        }, true);

        $scope.updateInstitution = function (institution) {
            institution.$save();
            $mdToast.showSimple('护理机构已保存');
        };

        $scope.editRoom = function (room) {
            if(!room) {
                room = new roomService();
                room.institution = $scope.institution;
            }

            $mdBottomSheet.show({
                templateUrl: 'app/institution/room-bottom-sheet.html',
                controller: 'institutionRoomBottomSheetCtrl',
                locals: {room: room, rooms: $scope.rooms, assistants: $scope.assistants}
            });
        };

        $scope.editUser = function (user) {
            if(!user) {
                user = new userService();
                user.roles = [];
                user.institution = $scope.institution;
            }

            $mdBottomSheet.show({
                templateUrl: 'app/institution/nurse-bottom-sheet.html',
                controller: 'institutionNurseBottomSheetCtrl',
                locals: {user: user, assistants: $scope.assistants}
            });
        };

        $scope.showUserDetail = function (user) {
            $location.url('/user/' + user._id);
        };

        $scope.editClient = function (client) {
            if(!client) {
                client = new clientService();
                client.institution = $scope.institution;
            }

            $mdBottomSheet.show({
                templateUrl: 'app/institution/client-bottom-sheet.html',
                controller: 'institutionClientBottomSheetCtrl',
                locals: {client: client, clients: $scope.clients, rooms: $scope.rooms, assistants: $scope.assistants}
            });
        };

        $scope.showClientDetail = function (client) {
            $location.url('/client/' + client._id);
        };

    }

    function institutionRoomBottomSheetCtrl ($scope, $mdBottomSheet, $mdToast, room, rooms, assistants) {
        $scope.room = room;
        $scope.rooms = rooms;
        $scope.assistants = assistants;
        $scope.updateRoom = function (room) {
            $mdBottomSheet.hide();
            room.$save();
            if(!room._id) {
                $scope.rooms.push(room);
            }
        };
    }

    function institutionNurseBottomSheetCtrl ($scope, $mdBottomSheet, $mdToast, userRolesConstant, user, assistants) {
        $scope.user = user;
        $scope.assistants = assistants;
        $scope.roles = userRolesConstant;
        $scope.updateUser = function (user) {
            $mdBottomSheet.hide();
            user.$save();
            if(!user._id) {
                $scope.assistants.push(user);
            }
        };
    }

    function institutionClientBottomSheetCtrl ($scope, $mdBottomSheet, $mdToast, client, clients, rooms, assistants) {
        $scope.client = client;
        $scope.clients = clients;
        $scope.rooms = rooms;
        $scope.assistants = assistants;
        $scope.updateClient = function (client) {
            $mdBottomSheet.hide();
            client.$save();
            if(!client._id) {
                $scope.clients.push(client);
            }
        };
    }

})(); 



