devflowApp.directive('serverEnv', ['userService', 'serverService', function(userService, serverService) {
    return {
        restrict: 'E',
        scope: {
            env: '=envObject',
            currentUser: '='
        },
        templateUrl: 'scripts/directives/server-env/view.html',
        controller: function($scope) {
            
            $scope.canJoinEnvQueue = function(env) {
                return (serverService.canJoinEnvQueue(env, currentUser));
            };

            $scope.isUserInQueue = function(env) {
                return (serverService.isUserInQueue(env.queue, currentUser));
            };

            $scope.joinQueue = function(env) {
                serverService.joinQueue(env, currentUser, true);
            };

            $scope.unqueue = function(env) {
                serverService.unqueue(env, currentUser, true);
            };
        }
    }
}]);
