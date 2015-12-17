devflowApp.directive('modelManager', ['$injector', function($injector) {
    return {
        restrict: 'E',
        scope: {
            caption: '=',
            service: '=',
            fields: '='
        },
        templateUrl: 'scripts/directives/model-manager/view.html',
        controller: function($scope) {

            var service = $injector.get($scope.service.name); 

            service[$scope.service.fetchAllAction](function (models) {
                $scope.models = models;
            });

            $scope.invalidFields = [];
            $scope.saving = false;

            var validateModels = function() {

                var fieldCounts = {},
                    setInvalid = function(i, fieldName) {
                        $scope.invalidFields[i] = {};
                        $scope.invalidFields[i][fieldName] = true;
                    };
     
                for (var i=0; i < $scope.models.length; i++) {
                    var model = $scope.models[i];

                    for (var fieldIndex=0; fieldIndex < $scope.fields.length; fieldIndex++) {
                        var field = $scope.fields[fieldIndex],
                            fieldValue = model[field.key];

                        if (field.unique) {
                            if (!fieldCounts[fieldValue]) {
                                fieldCounts[fieldValue] = 0;
                            }

                            fieldCounts[fieldValue]++;

                            if (fieldCounts[fieldValue] > 1) {
                                setInvalid($scope.models[0][field.key] == fieldValue ? 0 : i, field.key);
                                return (false);
                            }
                        }

                        if (field.validator && !field.validator(fieldValue)) {
                            setInvalid(i, field.key);
                            return (false);
                        }
                    }
                }

                return (true);
            };

            $scope.addModel = function() {
                $scope.models.unshift(service[$scope.service.newModel]());
            }

            $scope.deleteModel = function(model) {
                var modelIndex = $scope.models.indexOf(model);

                if ($scope.invalidFields.length && $scope.invalidFields[modelIndex]) {
                    $scope.invalidFields.splice(modelIndex, 1);
                }

                $scope.models.splice(modelIndex, 1);
            }

            $scope.saveModels = function() {
                if (validateModels()) {
                    $scope.saving = true;

                    service[$scope.service.updateAllAction]($scope.models, function() {
                        $scope.saving = false;
                    });
                }
            }

            $scope.fieldChanged = function(model, fieldName) {
                if ($scope.invalidFields.length && $scope.invalidFields[$scope.models.indexOf(model)]) {
                    $scope.invalidFields[$scope.models.indexOf(model)][fieldName] = false;
                }
            }

            $scope.isInvalid = function(model, fieldName) {
                if (!$scope.invalidFields.length || !$scope.invalidFields[$scope.models.indexOf(model)]) {
                    return (false);
                }

                return ($scope.invalidFields[$scope.models.indexOf(model)][fieldName]);
            }
        }
    }
}]);