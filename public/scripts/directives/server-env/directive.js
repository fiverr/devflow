devflowApp.directive('serverEnv', ['userService', 'serverService', 'ngDialog',  function(userService, serverService, ngDialog) {
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

            $scope.canAddServer = function(env) {
                return (env.on_demand && serverService.canJoin(env, currentUser, true));
            }

            $scope.unqueue = function(env) {
                serverService.unqueue(env, currentUser, true);
            };

            $scope.openCreate = function(env) {
                ngDialog.open({
                    template: '/views/templates/popups/createServer.html',
                    controller: ['$scope', function($scope) {

                        $scope.env = JSON.parse(JSON.stringify(env));

                        var validateServer = function(env) {
                            if (!env.data.branchName) {
                                $scope.invalidFields.branchName = true;
                                return (false);
                            }

                            return (true);
                        }

                        $scope.saveServer = function(env) {
                            if (validateServer(env)) {
                                serverService.create(env.name, env.data.branchName, currentUser, env.data.customGems, env);
                            }

                            $scope.closeThisDialog();
                        }
                    }]
                });
            };
        }
    }
}]);
