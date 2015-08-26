devflowApp.controller('usersController', ['$scope', 'userService',
    function ($scope, userService) {
        userService.allUsers(function (users) {
            $scope.users = users;
        });

        $scope.invalidFields = [];
        $scope.saving = false;

        var validateUsers = function() {
            var fieldCounts = {},
                fieldsToCheck = ['email', 'name'],
                setInvalid = function(i, fieldName) {
                    $scope.invalidFields[i] = {};
                    $scope.invalidFields[i][fieldName] = true;
                };
 
            for (var i=0; i < $scope.users.length; i++) {
                var user = $scope.users[i];

                for (var fieldIndex=0; fieldIndex < fieldsToCheck.length; fieldIndex++) {
                    var fieldName = fieldsToCheck[fieldIndex],
                        fieldValue = user[fieldName];

                    if (!fieldCounts[fieldValue]) {
                        fieldCounts[fieldValue] = 0;
                    }

                    fieldCounts[fieldValue]++;

                    if (fieldCounts[fieldValue] > 1) {
                        setInvalid($scope.users[0][fieldName] == fieldValue ? 0 : i, fieldName);
                        return (false);
                    }

                    if (fieldName == 'email') {
                        var emailRegex = new RegExp("^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$");

                        if (!emailRegex.test(fieldValue)) {
                            setInvalid(i, fieldName);
                            return (false);
                        }
                    } else if (fieldName == 'name') {
                        if (fieldValue.length < 3) {
                            setInvalid(i, fieldName);
                            return (false);
                        }
                    }
                }
            }

            return (true);
        };

        $scope.addUser = function() {
            $scope.users.unshift(userService.newUser());
        }

        $scope.deleteUser = function(user) {
            var userIndex = $scope.users.indexOf(user);

            if ($scope.invalidFields.length && $scope.invalidFields[userIndex]) {
                $scope.invalidFields.splice(userIndex, 1);
            }

            $scope.users.splice(userIndex, 1);
        }

        $scope.saveUsers = function() {
            if (validateUsers()) {
                $scope.saving = true;

                userService.updateUsers($scope.users, function() {
                    $scope.saving = false;
                });
            }
        }

        $scope.fieldChanged = function(user, fieldName) {
            if ($scope.invalidFields.length && $scope.invalidFields[$scope.users.indexOf(user)]) {
                $scope.invalidFields[$scope.users.indexOf(user)][fieldName] = false;
            }
        }

        $scope.isInvalid = function(user, fieldName) {
            if (!$scope.invalidFields.length || !$scope.invalidFields[$scope.users.indexOf(user)]) {
                return (false);
            }

            return ($scope.invalidFields[$scope.users.indexOf(user)][fieldName]);
        }
}]);
