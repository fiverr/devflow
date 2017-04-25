devflowApp.controller('apiController', ['$scope', 'userService', 'apiTokenService',
    function ($scope, userService, apiTokenService) {
        userService.getCurrentUser(function(user) {
            $scope.currentUser = user;
        });

        $scope.generateToken = function() {
            apiTokenService.generateToken(function(token) {
                $scope.token = token;
            });
        }
    }
]);
