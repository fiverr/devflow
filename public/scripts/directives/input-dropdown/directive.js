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
            $scope.focusedIndex = -1;

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
                $scope.focusedIndex = -1;
            }

            $scope.itemTextChanged = function() {
                $scope.selectedItem = null;
                $scope.displayItems = [];
                $scope.focusedIndex = -1;

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
                    $scope.focusedIndex = -1;
                }, 100);
            }

            $scope.inputFocus = function() {
                $scope.inputFocused  = true;
            }

            $scope.keyDown = function(keyEvent) {
                if (!($scope.displayItems.length > 0 && $scope.selectedText.length > 0 && $scope.inputFocused)) {
                    return;
                }

                if (keyEvent.keyCode == 40 && $scope.focusedIndex < $scope.displayItems.length - 1) { // down arrow
                    $scope.focusedIndex++;
                } else if (keyEvent.keyCode == 38 && $scope.focusedIndex > 0) { // up arrow
                    $scope.focusedIndex--;
                } else if (keyEvent.keyCode == 13) { // enter
                    $scope.selectItem($scope.displayItems[$scope.focusedIndex]);
                }
            }

            $scope.isFocused = function(item) {
                return ($scope.focusedIndex == $scope.displayItems.indexOf(item));
            }
        }
    }
}]);