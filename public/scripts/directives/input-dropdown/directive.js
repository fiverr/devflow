devflowApp.directive('inputDropdown', ['$timeout', function($timeout) {
    return {
        restrict: 'E',
        scope: {
            items: '=',
            selectedItem: '=',
            displayProperty: '=',
            label: '='
        },
        templateUrl: 'scripts/directives/input-dropdown/view.html',
        controller: function($scope) {
            $scope.displayItems = [];
            $scope.inputFocused = false;

            var setSelectedText = function() {
                $scope.selectedText = $scope.selectedItem[$scope.displayProperty];
            }

            if ($scope.selectedItem) {
                setSelectedText();
            }

            $scope.selectItem = function(item) {
                $scope.selectedItem = item;
                setSelectedText();
                $scope.displayItems = [];
            }

            $scope.itemTextChanged = function() {
                $scope.selectedItem = null;
                $scope.displayItems = [];

                if ($scope.selectedText && $scope.selectedText != '') {
                    for (i = 0; i < $scope.items.length; i++) {
                        if ($scope.items[i][$scope.displayProperty].toLowerCase().indexOf($scope.selectedText.toLowerCase()) >= 0) {
                            $scope.displayItems.push($scope.items[i]);
                        }
                    }
                }
            }

            $scope.inputBlur = function() {
                $timeout(function() {
                    $scope.inputFocused = false;
                }, 100);
            }

            $scope.inputFocus = function() {
                $scope.inputFocused  = true;
            }
        }
    }
}]);