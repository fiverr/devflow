devflowApp.controller('serverController', ['$scope', 'userService', 'serverService',
    function ($scope, userService, serverService, socket) {

        userService.getCurrentUser(function(user) {
            $scope.currentUser = user;
        });

        serverService.getServers(false, function(servers) {
            $scope.serverEnvironments = servers;
        });

}]);
