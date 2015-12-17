devflowApp.directive('request', ['userService', 'requestService', 'tagService', 'config', 'ngDialog', function(userService, requestService, tagService, config, ngDialog) {
    return {
        restrict: 'E',
        scope: {
            request: '=requestObject',
            currentUser: '=',
            isNew: '=',
            type: '='
        },
        templateUrl: 'scripts/directives/request/view.html',
        controller: function($scope) {

            var currentUser = $scope.currentUser,
                requestType = $scope.type || $scope.request.type,
                requestConfig = config.requests[requestType];

            $scope.smallLabels = requestConfig.useSmallLabels;
            $scope.rejectable = requestConfig.rejectable;
            $scope.showTeam = requestConfig.showTeam;

            $scope.getEnv = function(request) {
                return (requestService.getEnv(request));
            };

            $scope.getNumber = function(request) {
                return (requestService.getNumber(request));
            };

            $scope.getTeam = function(request) {
                return (requestService.getTeam(request));
            };

            $scope.canEdit = function(request) {
                return (requestService.canEdit(request, currentUser));
            };

            $scope.openEdit = function(request) {
                var isNew = false,
                    requestInEdit = null;

                if (!request) {
                    requestInEdit = requestService.new(requestType, requestConfig.types[0], currentUser);
                    isNew = true;
                } else {
                    requestInEdit = JSON.parse(JSON.stringify(request));
                }

                ngDialog.open({
                    template: '/views/templates/popups/editRequest.html',
                    controller: ['$scope', function($scope) {
                        var typeRegex = new RegExp(requestConfig.linkRegex);

                        $scope.request = requestInEdit;
                        $scope.isNew = isNew;
                        $scope.linkTitle = requestConfig.linkTitle;
                        $scope.typeTitle = requestConfig.typeTitle;
                        $scope.requestTypes = requestConfig.types;
                        $scope.invalidFields = {title: false, desc: false};
                        $scope.shouldSquash = false;
                        $scope.mergeable = true;

                        tagService.getTags(function(tags) {
                            $scope.tags = tags;  
                        });

                        var validateRequest = function(request) {
                            if (!request.data.title || !typeRegex.test(request.data.title)) {
                                $scope.invalidFields.title = true;
                                return (false);
                            }

                            if (!request.data.desc || request.data.desc.length > 378) {
                                $scope.invalidFields.desc = true;
                                return (false);
                            }

                            return (true);
                        }

                        $scope.saveRequest = function(request) {
                            if (validateRequest(request)) {
                                requestService.createOrUpdate(request, currentUser, isNew);

                                if (isNew && $scope.additionalType) {
                                    var secondRequest = JSON.parse(JSON.stringify(request));
                                    secondRequest.data.sub_type = $scope.additionalType;
                                    requestService.createOrUpdate(secondRequest, currentUser, true);
                                }

                                $scope.closeThisDialog();
                            }
                        }

                        $scope.fieldChanged = function(fieldName) {
                            $scope.invalidFields[fieldName] = false;
                        }

                        $scope.addAdditionalType = function() {
                            if (!$scope.additionalType) {
                                $scope.additionalTypes = $scope.requestTypes.slice(0);
                                $scope.additionalTypes.splice($scope.additionalTypes.indexOf($scope.request.data.sub_type), 1);
                                $scope.additionalType = $scope.additionalTypes[0];
                            }
                        }

                        $scope.removeAdditionalType = function() {
                            $scope.additionalType = null;
                        }

                        $scope.titleBlur = function(url) {
                            if(url) {
                                requestService.preCheck(url, function(response) {
                                    if(response) {
                                        $scope.request.data.desc = response.description;
                                        $scope.shouldSquash = response.shouldSquash;
                                        $scope.mergeable = response.mergeable;
                                    }
                                });
                            }
                        }

                    }]
                });
            };

            $scope.isPosted = function(request) {
                return (requestService.isPosted(request));
            };

            $scope.wasRejected = function(request) {
                return (requestService.wasRejected(request));
            };

            $scope.nudge = function(request) {
                requestService.nudge(request);
            };

            $scope.canComplete = function(request) {
                return (requestService.canComplete(request, currentUser));
            };

            $scope.release = function(request) {
                requestService.release(request, currentUser);
            };

            $scope.getDisplayTitle = function(request) {
                if (request.data.title.length > 50) {
                    return (request.data.title.substr(0, 47) + '...');
                } else {
                    return (request.data.title);
                }
            };

            $scope.getDisplayDate = function(date) {
              return (new Date(date).toFormattedDateTimeString());
            };

            $scope.canTake = function(request) {
                return (requestService.canTake(request, currentUser));
            };

            $scope.take = function(request) {
                requestService.take(request, currentUser);
            };

            $scope.isWaitingForReviewStart = function(request) {
                 return (!requestService.canTake(request, currentUser) && requestService.isPosted(request));
            };

            $scope.isWaitingForReviewEnd = function(request) {
                 return (requestService.isTaken(request) && !requestService.canComplete(request, currentUser));
            };

            $scope.delete = function(request) {
                requestService.delete(request);
            };

            $scope.hasReviewer = function(request) {
                return (requestService.isTaken(request) || requestService.isReviewed(request));
            };

            $scope.complete = function(request) {
                requestService.complete(request);
            };

            $scope.reject = function(request) {
                ngDialog.open({
                    template: '/views/templates/popups/rejectionReasons.html',
                    controller: ['$scope', function($scope) {
                        request.rejection_reasons = [];
                        $scope.request = request;
                        $scope.reasons = requestConfig.rejectionReasons;

                        $scope.reject = function() {
                            requestService.complete(request, true);
                            $scope.closeThisDialog();
                        };

                        $scope.toggleRejectionReason = function(reason) {
                            var reasonIndex = $scope.request.rejection_reasons.indexOf(reason);

                            if (reasonIndex > -1) {
                                $scope.request.rejection_reasons.splice(reasonIndex, 1);
                            } else {
                                $scope.request.rejection_reasons.push(reason);
                            }
                        };

                        $scope.isSelected = function(reason) {
                            return ($scope.request.rejection_reasons.indexOf(reason) > -1);
                        };
                    }]
                });
            };

            $scope.isReviewed = function(request) {
                return (requestService.isReviewed(request));
            };
        }
    }
}]);
