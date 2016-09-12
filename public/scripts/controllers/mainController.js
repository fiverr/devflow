devflowApp.controller('mainController', ['$scope', '$interval', 'userService', 'reviewService', 'ngDialog', 'notificationService', 'config',
    function($scope, $interval, userService, reviewService, ngDialog, notificationService, config) {

        userService.getCurrentUser(function(user) {
            $scope.currentUser = user;
            $scope.isManagingUser = userService.isManagingUser(user);
        });

        $scope.userCounts = {};

        reviewService.getReviewCount('pullrequest', function(count) {
            $scope.userCounts.pullrequest = count;
        });

        reviewService.getReviewCount('graylog', function(count) {
            $scope.userCounts.graylog = count;
        });

        // notifications handling
        $scope.showNotifications = false;
        $scope.notifications = notificationService.getNotifications();
        $scope.hasUnreadNotifications = false;

        notificationService.setUnreadCallback(function() {
            $scope.hasUnreadNotifications = true;
        });

        // full page reload every timeout
        $interval(function() {
            window.location.reload();
        }, config.refreshInterval);

        $scope.isSelected = function(path) {
            return (window.location.hash == ('#/' + path));
        };

        $scope.isFeatureEnabled = function(featureName) {
            return config.features[featureName];
        };

        $scope.showUserImagePopup = function() {
            ngDialog.open({
                template: '/views/templates/popups/userImage.html',
                controller: ['$scope', 'userService', function($scope, userService) {
                    userService.getCurrentUser(function(user) {
                        $scope.currentUser = user;
                    });

                    $scope.saveUserImage = function() {
                        userService.updateUser($scope.currentUser);
                        $scope.closeThisDialog();
                    };
                }]
            });
        };

        $scope.showAboutPopup = function() {
            ngDialog.open({ template: '/views/templates/popups/about.html' });
        };

        $scope.toggleNotifications = function(show) {
            $scope.showNotifications = show;

            if (show) {
                $scope.hasUnreadNotifications = false;
            }
        }

        // todo: implement global search
        $scope.search = function() {

        }
}]);


