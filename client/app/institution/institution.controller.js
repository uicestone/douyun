(function () {
    'use strict';

    angular.module('app.institution')
    .controller('institutionListCtrl', ['$scope', '$location', 'institutionService', institutionListCtrl])
    .controller('institutionDetailCtrl', ['$scope', 'institutionService', institutionDetailCtrl]);

    function institutionListCtrl($scope, $location, institutionService) {

        $scope.query = {page:1, limit: 20};

        $scope.getInstitution = function() {
            $scope.promise = institutionService.query($scope.query).$promise.then(function(institutions) {
                $scope.institutions = institutions;
            });
        };

        $scope.getInstitution();

        $scope.showInstitutionDetail = function (institution) {
            $location.path('/institution/' + institution._id);
        };

    }

    function institutionDetailCtrl($scope, $route, institutionService) {

        $scope.institution = institutionService.get({id:$route.params.id});

    }

})(); 



