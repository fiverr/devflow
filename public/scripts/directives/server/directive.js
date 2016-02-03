devflowApp.directive('server', ['userService', 'serverService', 'ngDialog', function(userService, serverService, ngDialog) {
    return {
        restrict: 'E',
        scope: {
            server: '=serverObject',
            currentUser: '='
        },
        templateUrl: 'scripts/directives/server/view.html',
        controller: function($scope) {
            $scope.isTaken = function(server) {
                return (serverService.isTaken(server));
            }

            $scope.canJoin = function(server) {
                return (serverService.canJoin(server, currentUser, false));
            }

            $scope.canTakeDown = function(server) {
                return (serverService.allowedToTakeDown(server, currentUser) && !serverService.isDown(server));
            }

            $scope.canTakeUp = function(server) {
                return (serverService.allowedToTakeDown(server, currentUser) && serverService.isDown(server));
            }

            $scope.changeDownState = function(server, isDown) {
                serverService.changeDownState(server, isDown);
            }

            $scope.showExtendForm = function(server) {

                ngDialog.open({
                    template: '/views/templates/popups/serverExtend.html',
                    controller: ['$scope', function($scope) {
                        $scope.server = server;
                        $scope.time = 1;
                        $scope.timeInvalid = false;

                        $scope.extend = function(server) {

                            if ($scope.time >= 1 && $scope.time <= 12) {
                                serverService.extend(server, $scope.time);
                                $scope.closeThisDialog();
                            } else {
                                $scope.timeInvalid = true;
                            }
                        }

                        $scope.fieldChanged = function() {
                            $scope.timeInvalid = false;
                        }
                    }]
                });
            }

            $scope.releaseTime = function(server) {
                var releaseDate = new Date(server.release_date);
                return (releaseDate.toFormattedShortDateTimeString());
            }

            $scope.isCurrentUser = function(server) {
                return (serverService.isTakenByUser(server, currentUser));
            }

            $scope.isOnDemand = function(server) {
                return (server.on_demand);
            }

            $scope.take = function(server) {
                serverService.take(server, currentUser);
                window.open(server.url, '_blank');
            }

            $scope.navigateToServer = function(server) {
                window.open(server.server_url, '_blank');
            }

            $scope.navigateToDeploy = function(server) {
                window.open(server.url, '_blank');
            }

            $scope.kill = function(server) {
                serverService.kill(server, currentUser, true);
            };

            $scope.release = function(server) {
                serverService.release(server);
            }

            $scope.joinQueue = function(server) {
                serverService.joinQueue(server, currentUser, false);
            }

            $scope.isUserInQueue = function(server) {
                return (serverService.isUserInQueue(server.queue, currentUser));
            }

            $scope.unqueue = function(server) {
                serverService.unqueue(server, currentUser, false);
            }

            $scope.getState = function(server) {
                if (serverService.isDown(server)) {
                    return ('down');
                } else if (serverService.isTaken(server)) {
                    return ('taken');
                } else {
                    return ('free');
                }
            }
        }
    }
}]);
