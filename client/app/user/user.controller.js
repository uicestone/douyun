(function () {
    'use strict';

    angular.module('app.user')
    .controller('userListCtrl', ['$scope', '$location', 'userService', userListCtrl])
    .controller('userDetailCtrl', ['$scope', 'userService', userDetailCtrl]);

    function userListCtrl($scope, $location, userService) {

        $scope.query = angular.extend({page:1, limit: 20}, $location.search());

        $scope.userType = $location.search().roles === 'family' ? '家属亲友' : '护理人员';

        $scope.getUser = function() {
            $scope.promise = userService.query($scope.query).$promise.then(function(users) {
                $scope.users = users;
            });
        };

        $scope.getUser();

        $scope.showUserDetail = function (user) {
            $location.url('/user/' + user._id);
        };

    }

    function userDetailCtrl($scope, $route, userService) {

        $scope.user = userService.get({id:$route.params.id});

    }

})(); 



