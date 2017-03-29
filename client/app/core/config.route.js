(function () {
    'use strict';

    angular.module('app')
        .config(['$routeProvider', '$ocLazyLoadProvider',
            function($routeProvider, $ocLazyLoadProvider) {
                
                $routeProvider
                    .when('/', {redirectTo: '/welcome'})
                    .when('/welcome', {
                        templateUrl: 'app/page/welcome.html'
                    })
                    .when('/client/list', {
                        templateUrl: 'app/client/list.html'
                    })
                    .when('/client/:id', {
                        templateUrl: 'app/client/detail.html'
                    })
                    .when('/institution/list', {
                        templateUrl: 'app/institution/list.html'
                    })
                    .when('/institution/:id', {
                        templateUrl: 'app/institution/detail.html'
                    })
                    .when('/room/:id', {
                        templateUrl: 'app/room/status.html'
                    })
                    .when('/signin', {
                        templateUrl: 'app/user/signin.html'
                    })
                    .when('/signup', {
                        templateUrl: 'app/user/signup.html'
                    })
                    .when('/profile', {
                        templateUrl: 'app/user/profile.html'
                    })
                    .when('/forgot-password', {
                        templateUrl: 'app/user/forgot-password.html'
                    })
                    .when('/user/list', {
                        templateUrl: 'app/user/list.html'
                    })
                    .when('/user/:id', {
                        templateUrl: 'app/user/detail.html'
                    })
                    .when('/404', {
                        templateUrl: 'app/page/404.html'
                    })
                    .when('/500', {
                        templateUrl: 'app/page/500.html'
                    })
                    .otherwise('/404');
                    
            }
        ]);

})(); 