(function () {
    'use strict';

    angular.module('app.institution')
    .controller('institutionListCtrl', ['$scope', '$location', 'institutionService', institutionListCtrl])
    .controller('institutionDetailCtrl', ['$scope', '$route', '$mdBottomSheet', '$mdToast', 'institutionService', 'roomService', 'userService', 'clientService', institutionDetailCtrl])
    .controller('institutionRoomBottomSheetCtrl', ['$scope', '$mdBottomSheet', '$mdToast', 'room', institutionRoomBottomSheetCtrl])
    .controller('institutionNurseBottomSheetCtrl', ['$scope', '$mdBottomSheet', '$mdToast', 'user', institutionNurseBottomSheetCtrl])
    .controller('institutionClientBottomSheetCtrl', ['$scope', '$mdBottomSheet', '$mdToast', 'client', institutionClientBottomSheetCtrl]);

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

    function institutionDetailCtrl($scope, $route, $mdBottomSheet, $mdToast, institutionService, roomService, userService, clientService) {

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
                locals: {room: room}
            });
        };

        $scope.editUser = function (user) {
            if(!user) {
                user = new userService();
                user.institution = $scope.institution;
            }

            $mdBottomSheet.show({
                templateUrl: 'app/institution/nurse-bottom-sheet.html',
                controller: 'institutionNurseBottomSheetCtrl',
                locals: {user: user}
            });
        };

        $scope.editClient = function (client) {
            if(!client) {
                client = new clientService();
                client.institution = $scope.institution;
            }

            $mdBottomSheet.show({
                templateUrl: 'app/institution/client-bottom-sheet.html',
                controller: 'institutionClientBottomSheetCtrl',
                locals: {client: client}
            });
        };

    }

    function institutionRoomBottomSheetCtrl ($scope, $mdBottomSheet, $mdToast, room) {
        $scope.room = room;
        $scope.updateRoom = function (room) {
            $mdBottomSheet.hide();
            room.$save();
            if(!room._id) {
                $scope.rooms.push(room);
            }
        };
    }

    function institutionNurseBottomSheetCtrl ($scope, $mdBottomSheet, $mdToast, user) {
        $scope.user = user
        $scope.updateUser = function (user) {
            $mdBottomSheet.hide();
            user.$save();
            if(!user._id) {
                $scope.assistants.push(user);
            }
        };
    }

    function institutionClientBottomSheetCtrl ($scope, $mdBottomSheet, $mdToast, client) {
        $scope.client = client;
        $scope.updateClient = function (client) {
            $mdBottomSheet.hide();
            client.$save();
            if(!client._id) {
                $scope.clients.push(client);
            }
        };
    }

})(); 



