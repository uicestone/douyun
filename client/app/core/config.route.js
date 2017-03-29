(function () {
    'use strict';

    angular.module('app')
        .config(['$routeProvider', '$ocLazyLoadProvider',
                function($routeProvider, $ocLazyLoadProvider) {
                var routes, setRoutes;

                routes = [
                    'welcome', '404', '500', 'forgot-password', 'lock-screen', 'profile', 'signin', 'signup',
                    'page/blank'
                ]

                setRoutes = function(route) {
                    var config, url;
                    url = '/' + route;
                    config = {
                        templateUrl: 'app/' + route + '.html'
                    };
                    $routeProvider.when(url, config);
                    return $routeProvider;
                };

                routes.forEach(function(route) {
                    return setRoutes(route);
                });

                $routeProvider
                    .when('/', {redirectTo: '/welcome'})
                    .otherwise('/404');
                    
            }
        ]);

})(); 