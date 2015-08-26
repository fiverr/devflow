devflowApp.controller('manageServersController', ['$scope', 'serverService',
    function ($scope, serverService) {
        serverService.getServers(false, function (envs) {
            $scope.envs = envs;
        });

        $scope.addServer = function(env) {
            env.servers.unshift(serverService.newServer(env.name));
        }

        $scope.deleteServer = function(env, server) {
            env.servers.splice(env.servers.indexOf(server), 1);
        }

        $scope.saveServers = function() {
            serverService.updateServers($scope.envs);
        }
}]);
