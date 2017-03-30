(function () {
    'use strict';

    var api = 'http://localhost:8080/api/';

    // add raw response as an attribute of resource,
    // so that we can get http status, header etc from resource in controllers
    var responseInterceptor = function (response) {
        response.resource.$total = Number(response.headers('items-total'));
        response.resource.$start = Number(response.headers('items-start'));
        response.resource.$end = Number(response.headers('items-end'));
        return response.resource;
    };

    angular.module('app')
        .service('httpInterceptorService', ['$q', '$window', '$location', '$injector', httpInterceptorService])
        .service('authService', ['$window', 'userService', authService])
        .service('userService', ['$resource', 'userRolesConstant', userService])
        .service('clientService', ['$resource', clientService])
        .service('beanService', ['$resource', beanService])
        .service('logService', ['$resource', logService])
        .service('institutionService', ['$resource', institutionService])
        .service('roomService', ['$resource', roomService])
        .service('receiverService', ['$resource', receiverService])
        .service('bedService', ['$resource', bedService])
        .constant('userRolesConstant', [
            {name: 'admin', label: '管理员', abilities: ['list-institution', 'list-user', 'list-client']},
            {name: 'nurse', label: '护士', abilities: ['view-single-institution', 'list-user', 'list-client']},
            {name: 'assistant', label: '护工', abilities: []},
            {name: 'family', label: '家属', abilities: []}
        ]);

    function httpInterceptorService($q, $window, $location, $injector) {
        return {
            request: function(config) {

                if(config && config.cache === undefined){

                    var token = $window.localStorage.getItem('token');

                    if(token) {
                        config.headers['Authorization'] = token;
                    }

                    return config;
                }

                return config || $q.when(config);
            },
            requestError: function(rejection) {
                return $q.reject(rejection);
            },
            response: function(response) {
                return response || $q.when(response);
            },
            responseError: function(rejection) {

                if(rejection.status === 401){
                    $window.localStorage.removeItem('token');
                    $location.path('/signin');
                }

                var $mdToast = $injector.get('$mdToast');

                if(rejection.data && rejection.data.message) {
                    $mdToast.showSimple(rejection.data.message);
                }
                else {
                    $mdToast.showSimple('网络错误');
                }

                return $q.reject(rejection);
            }
        };
    }

    function authService($window, userService) {

        var user = new userService();

        this.login = function(username, password) {
            return userService.login({username: username, password: password}, function(user) {
                $window.localStorage.setItem('token', user.token);
            });
        };

        this.logout = function() {
            return userService.logout();
        };

        this.user = function() {
            if(!$window.localStorage.getItem('token')) {
                user.$resolved = true;
                return user;
            }

            return userService.auth();
        }
    }

    function userService($resource, userRolesConstant) {

        var user = $resource(api + 'user/:id', {id: '@_id'}, {
            query: {method: 'GET', isArray: true, interceptor: {response: responseInterceptor}},
            create: {method: 'POST'},
            update: {method: 'PUT'},
            auth: {method: 'GET', url: api + 'auth/user'},
            login: {method: 'POST', url: api + 'auth/login'},
            logout: {method: 'GET', 'url': api + 'auth/logout'}
        });
        
        // Angular mix PUT and POST methot to $save,
        // we seperate them to $create and $update here
        user.prototype.$save = function (a, b, c, d) {
            if (this._id) {
                return this.$update(a, b, c, d);
            }
            else {
                return this.$create(a, b, c, d);
            }
        }

        var roles = userRolesConstant;

        user.prototype.can = function(ability) {
            
            var abilities;
            var _self = this;

            if(!this.roles) {
                return false;
            }

            abilities = roles.filter(function(role) {
                return _self.roles.indexOf(role.name) > -1;
            }).reduce(function(previous, current) {
                return previous.concat(current.abilities);
            }, []);

            return abilities.indexOf(ability) > -1;
        }
        
        return user;
    }

    function clientService($resource) {

        var clients = $resource(api + 'client/:id', {id: '@_id'}, {
            query: {method: 'GET', isArray: true, interceptor: {response: responseInterceptor}},
            create: {method: 'POST'},
            update: {method: 'PUT'}
        });
        
        // Angular mix PUT and POST methot to $save,
        // we seperate them to $create and $update here
        clients.prototype.$save = function (a, b, c, d) {
            if (this._id) {
                return this.$update(a, b, c, d);
            }
            else {
                return this.$create(a, b, c, d);
            }
        }
        
        return clients;
    }

    function beanService($resource) {

        var bean = $resource(api + 'bean/:id', {id: '@_id'}, {
            query: {method: 'GET', isArray: true, interceptor: {response: responseInterceptor}},
            create: {method: 'POST'},
            update: {method: 'PUT'}
        });
        
        // Angular mix PUT and POST methot to $save,
        // we seperate them to $create and $update here
        bean.prototype.$save = function (a, b, c, d) {
            if (this._id) {
                return this.$update(a, b, c, d);
            }
            else {
                return this.$create(a, b, c, d);
            }
        }
        
        return bean;

    }

    function logService($resource) {

        var logs = $resource(api + 'log/:id', {id: '@_id'}, {
            query: {method: 'GET', isArray: true, interceptor: {response: responseInterceptor}},
            create: {method: 'POST'},
            update: {method: 'PUT'}
        });
        
        // Angular mix PUT and POST methot to $save,
        // we seperate them to $create and $update here
        logs.prototype.$save = function (a, b, c, d) {
            if (this._id) {
                return this.$update(a, b, c, d);
            }
            else {
                return this.$create(a, b, c, d);
            }
        }
        
        return logs;
    }

    function institutionService($resource) {

        var institutions = $resource(api + 'institution/:id', {id: '@_id'}, {
            query: {method: 'GET', isArray: true, interceptor: {response: responseInterceptor}},
            create: {method: 'POST'},
            update: {method: 'PUT'}
        });
        
        // Angular mix PUT and POST methot to $save,
        // we seperate them to $create and $update here
        institutions.prototype.$save = function (a, b, c, d) {
            if (this._id) {
                return this.$update(a, b, c, d);
            }
            else {
                return this.$create(a, b, c, d);
            }
        }
        
        return institutions;
    }

    function roomService($resource) {

        var rooms = $resource(api + 'room/:id', {id: '@_id'}, {
            query: {method: 'GET', isArray: true, interceptor: {response: responseInterceptor}},
            create: {method: 'POST'},
            update: {method: 'PUT'}
        });
        
        // Angular mix PUT and POST methot to $save,
        // we seperate them to $create and $update here
        rooms.prototype.$save = function (a, b, c, d) {
            if (this._id) {
                return this.$update(a, b, c, d);
            }
            else {
                return this.$create(a, b, c, d);
            }
        }
        
        return rooms;
    }

    function receiverService($resource) {

        var receivers = $resource(api + 'receiver/:id', {id: '@_id'}, {
            query: {method: 'GET', isArray: true, interceptor: {response: responseInterceptor}},
            create: {method: 'POST'},
            update: {method: 'PUT'}
        });
        
        // Angular mix PUT and POST methot to $save,
        // we seperate them to $create and $update here
        receivers.prototype.$save = function (a, b, c, d) {
            if (this._id) {
                return this.$update(a, b, c, d);
            }
            else {
                return this.$create(a, b, c, d);
            }
        }
        
        return receivers;
    }

    function bedService($resource) {

        var bed = $resource(api + 'bed/:id', {id: '@_id'}, {
            query: {method: 'GET', isArray: true, interceptor: {response: responseInterceptor}},
            create: {method: 'POST'},
            update: {method: 'PUT'}
        });
        
        // Angular mix PUT and POST methot to $save,
        // we seperate them to $create and $update here
        bed.prototype.$save = function (a, b, c, d) {
            if (this._id) {
                return this.$update(a, b, c, d);
            }
            else {
                return this.$create(a, b, c, d);
            }
        }
        
        return bed;

    }

})(); 