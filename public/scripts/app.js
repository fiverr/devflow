var devflowApp = angular.module('devflowApp', ['ngRoute', 'ngDialog', 'ngAnimate']);

devflowApp.config(['$routeProvider',
    function($routeProvider) {
        $routeProvider.
            when('/main', {
                templateUrl: 'views/templates/dashboard.html',
                controller: 'dashboardController'
            }).
            when('/servers', {
                templateUrl: 'views/templates/servers.html',
                controller: 'serverController'
            }).
            when('/api_token', {
                templateUrl: 'views/templates/api_token.html',
                controller: 'apiController'
            }).
            when('/pullrequests', {
                templateUrl: 'views/templates/requests.html',
                controller: 'requestController'
            }).
            when('/graylogs', {
                templateUrl: 'views/templates/requests.html',
                controller: 'requestController'
            }).
            when('/manage-users', {
                templateUrl: 'views/templates/manageUsers.html',
                controller: 'usersController'
            }).
            when('/manage-servers', {
                templateUrl: 'views/templates/manageServers.html',
                controller: 'manageServersController'
            }).
            when('/manage-repos', {
                templateUrl: 'views/templates/manageRepos.html',
                controller: 'reposController'
            }).
            when('/manage-tags', {
                templateUrl: 'views/templates/manageTags.html',
                controller: 'tagController'
            }).
            otherwise({
                redirectTo: '/main'
            });
}]);

devflowApp.factory('socket', function($rootScope) {
    var socket = io.connect();

    return {
        on: function (eventName, callback) {
            socket.on(eventName, function () {
                var args = arguments;
                $rootScope.$apply(function () {
                    callback.apply(socket, args);
                });
            });
        },
        emit: function (eventName, data, callback) {
            socket.emit(eventName, data, function () {
                var args = arguments;

                $rootScope.$apply(function () {
                    if (callback) {
                        callback.apply(socket, args);
                    }
                });
            });
        }
    };
});

// ------------------- Prototypes -----------------

// Pads left a string
String.prototype.lpad = function(padString, length) {
    var str = this;

    while (str.length < length) {
        str = padString + str;
    }

    return str;
}

// Formats date to convenient time format
Date.prototype.toFormattedTimeString = function() {
    var date = this;
    return (date.getHours().toString().lpad('0', 2) + ':' + date.getMinutes().toString().lpad('0', 2));
}

// Formats date to convenient date format
Date.prototype.toFormattedDateString = function() {
    var date = this;
    return (date.getDate().toString().lpad('0', 2) + '/' + (date.getMonth() + 1).toString().lpad('0', 2)+ '/' + date.getFullYear().toString());
}

// Formats date to convenient full datetime format
Date.prototype.toFormattedDateTimeString = function() {
    var date = this;
    return (date.getDate().toString().lpad('0', 2) + '/' + (date.getMonth() + 1).toString().lpad('0',2) + '/' + date.getFullYear().toString() + ' ' +
            date.getHours().toString().lpad('0', 2) + ':' + date.getMinutes().toString().lpad('0', 2));
}

// Formats date to convenient short datetime format
Date.prototype.toFormattedShortDateTimeString = function() {
    var date = this;
    return (date.getDate().toString().lpad('0', 2) + '/' + (date.getMonth() + 1).toString().lpad('0',2) + ' ' +
            date.getHours().toString().lpad('0', 2) + ':' + date.getMinutes().toString().lpad('0', 2));
}
