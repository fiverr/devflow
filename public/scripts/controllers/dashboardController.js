devflowApp.controller('dashboardController', ['$scope', 'userService', 'requestService', 'serverService', 'reviewService', 'config',
    function ($scope, userService, requestService, serverService, reviewService, config) {

        userService.getCurrentUser(function(user) {
            $scope.currentUser = user;
        });

        requestService.getRequests('pullrequest', true, 3, function(pullrequests) {
            $scope.pullrequests = pullrequests;
        });

        requestService.getRequests('graylog', true, 3, function(graylogs) {
            $scope.graylogs = graylogs;
        });

        serverService.getServers(true, function(servers) {
            $scope.serverEnvironments = servers;
        });

        reviewService.getReviews('pullrequest', 3, function(reviews) {
            $scope.pullrequestReviews = reviews;
        });

        reviewService.getReviews('graylog', 3, function(reviews) {
            $scope.graylogReviews = reviews;
        });

        $scope.links = config.links;

        // todo: implement devops on call
}]);
