devflowApp.controller('requestController', ['$scope', 'userService', 'requestService', 'reviewService',
    function ($scope, userService, requestService, reviewService) {

        $scope.requestType = window.location.hash.replace('#/', '').slice(0, -1);

        userService.getCurrentUser(function(user) {
            $scope.currentUser = user;
        });
            
        requestService.getRequests($scope.requestType, false, 8, function(requests) {
            $scope.requests = requests;
        });

        reviewService.getReviews($scope.requestType, 6, function(reviews) {
            $scope.reviews = reviews;
        });

        $scope.loadMore = function() {
            requestService.loadMore($scope.requestType);
        };

        $scope.isFirstReview = function(review) {
            return ($scope.reviews.indexOf(review) == 0);
        };
}]);
