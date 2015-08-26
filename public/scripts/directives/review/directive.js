devflowApp.directive('review', [function() {
    return {
        restrict: 'E',
        scope: {
            review: '=reviewObject',
            isFirst: '=',
            index: '='
        },
        templateUrl: 'scripts/directives/review/view.html',
        controller: function($scope) {
        }
    }
}]);
