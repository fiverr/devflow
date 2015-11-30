devflowApp.controller('reposController', ['$scope', 'repoService',
    function ($scope, repoService) {
        repoService.getRepos(function (repos) {
            $scope.repos = repos;
        });

        $scope.invalidFields = [];
        $scope.saving = false;

        var validateRepos = function() {
            var fieldCounts = {},
                fieldsToCheck = ['name', 'team_name', 'hipchat_group'],
                setInvalid = function(i, fieldName) {
                    $scope.invalidFields[i] = {};
                    $scope.invalidFields[i][fieldName] = true;
                };
 
            for (var i=0; i < $scope.repos.length; i++) {
                var repo = $scope.repos[i];

                for (var fieldIndex=0; fieldIndex < fieldsToCheck.length; fieldIndex++) {
                    var fieldName = fieldsToCheck[fieldIndex],
                        fieldValue = repo[fieldName] || '';

                    if (!fieldCounts[fieldValue]) {
                        fieldCounts[fieldValue] = 0;
                    }

                    fieldCounts[fieldValue]++;

                    if (fieldCounts[fieldValue] > 1 && fieldName == 'name') {
                        setInvalid($scope.repos[0][fieldName] == fieldValue ? 0 : i, fieldName);
                        return (false);
                    }
                    
                    if (fieldValue.length < 3) {
                        setInvalid(i, fieldName);
                        return (false);
                    }
                }
            }

            return (true);
        };

        $scope.addRepo = function() {
            $scope.repos.unshift(repoService.newRepo());
        }

        $scope.deleteRepo = function(repo) {
            var repoIndex = $scope.repos.indexOf(repo);

            if ($scope.invalidFields.length && $scope.invalidFields[repoIndex]) {
                $scope.invalidFields.splice(repoIndex, 1);
            }

            $scope.repos.splice(repoIndex, 1);
        }

        $scope.saveRepos = function() {
            if (validateRepos()) {
                $scope.saving = true;

                repoService.updateRepos($scope.repos, function() {
                    $scope.saving = false;
                });
            }
        }

        $scope.fieldChanged = function(repo, fieldName) {
            if ($scope.invalidFields.length && $scope.invalidFields[$scope.repos.indexOf(repo)]) {
                $scope.invalidFields[$scope.repos.indexOf(repo)][fieldName] = false;
            }
        }

        $scope.isInvalid = function(repo, fieldName) {
            if (!$scope.invalidFields.length || !$scope.invalidFields[$scope.repos.indexOf(repo)]) {
                return (false);
            }

            return ($scope.invalidFields[$scope.repos.indexOf(repo)][fieldName]);
        }
}]);
