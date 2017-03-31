(function () {
    'use strict';

    angular.module('app.room')
    .controller('roomStatusCtrl', ['$scope', '$route', 'roomService', 'clientService', roomStatusCtrl]);

    function roomStatusCtrl($scope, $route, roomService, clientService) {
    	$scope.room = roomService.get({id:$route.current.params.id});
    	$scope.clients = clientService.query({'room._id':$route.current.params.id, limit:1000});
    }

})(); 



