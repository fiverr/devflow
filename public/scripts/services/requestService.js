devflowApp.factory('requestService', ['$http', 'socket', 'notificationService', 'repoService', 'config', function($http, socket, notificationService, repoService, config) {
    var requests = {},
        repos    = [];

    // private methods
    var methods = {
        userData: function(user) {
           return ({ name: user.name, image: user.image, email: user.email });
        },

        update: function(request, data, raiseEvent) {
            if (request) {
                for (var field in request) {
                    request[field] = data[field];
                }

                if (raiseEvent) {
                    socket.emit('updateRequest', request);
                }
            }
        },

        getCollection: function(request) {
            return (requests[request.type]);
        },

        find: function(request) {
            var requestCollection = this.getCollection(request);

            for (var requestIndex = 0; requestIndex < requestCollection.length; requestIndex++) {
                if (requestCollection[requestIndex]._id == request._id || requestCollection[requestIndex].data.title == request.data.title) {
                    return (requestCollection[requestIndex]);
                }
            }

            return (null);
        },

        nudge: function(request, isCallback) {
            var requestCollection = methods.getCollection(request);

            requestCollection.splice(requestCollection.indexOf(request), 1);
            requestCollection.unshift(request);
            request.created_date = new Date();

            if (!isCallback) {
                socket.emit('nudgeRequest', request);
            }
        },

        initSockets: function() {
            var that = this;

            socket.on('requestTaken', function(data) {
                that.update(that.find(data), data);
                notificationService.add(data.reviewer.name + ' has taken your request', data.reviewer.image, data.user);
            });

            socket.on('requestCompleted', function(data) {
                that.update(that.find(data), data);
                notificationService.add(data.reviewer.name + ' has reviewed your request', data.reviewer.image, data.user);
            });

            socket.on('requestUpdated', function(data) {
                that.update(that.find(data), data);

                if (data.reviewer) {
                    notificationService.add(data.user.name + ' has updated the request you took', data.user.image, data.reviewer);
                }
            });

            socket.on('requestAdded', function(data) {
                that.getCollection(data).unshift(data);
            });

            socket.on('requestNudged', function(data) {
                that.nudge(that.find(data), true);
            });

            socket.on('requestDeleted', function(data) {
                var collection = that.getCollection(data),
                    request = that.find(data);
                    index = collection.indexOf(request);

                if (index >= 0) {
                    collection.splice(index, 1);
                }
            });
        },

        fetchRepos: function() {
            if (!repos.length) {
                repoService.getRepos(function(data) {
                    repos = data;
                });
            }
        }
    };

    methods.initSockets();
    methods.fetchRepos();

    return {
        getRequests: function(type, notTaken, count, onSuccess, onFailure, skipStore) {
            var params = {};

            if (notTaken) {
                params.notTaken = true;
            }

            if (count) {
                params.count = count;
            }

            $http.get('/request/' + type, {params: params})
                .success(function (data, status, headers, config) {
                    if (typeof onSuccess === 'function') {

                        if (!skipStore) {
                            requests[type] = data;
                        }

                        onSuccess(data);
                    }
                })
                .error(function (data, status, headers, config) {
                    if (typeof onFailure === 'function') {
                        onFailure(data);
                    }
                });
        },

        allowedToReview: function(user) {
            return (user.role == 'reviewer' || user.role == 'admin' || user.role == 'devops');
        },

        take: function(request, user) {
            request.state = 'taken';
            request.sort_order = 2;
            request.reviewer = methods.userData(user);
            request.taken_date = new Date();
            socket.emit('takeRequest', request);
        },

        getEnv: function(request) {
            if (config.requests[request.type].constantEnv) {
                return (config.requests[request.type].constantEnv);
            }

            // default github implementation
            if (request.data.title && request.data.title.indexOf('http') >=0) {
                var arr = request.data.title.split('/'),
                    env = arr[arr.length - 3];

                env = (env == 'pull') ? arr[arr.length - 4] : env;
                return (env.replace('_', ' '));
            }

            return ('Pull Request');
        },

        getNumber: function(request) {
            if (!config.requests[request.type].hasNumber) {
                return ('');
            }

            // default github implementation
            if (request.data.title && request.data.title.indexOf('http') >= 0) {
                var arr = request.data.title.split('/'),
                    pullNum = arr[arr.length - 1];

                return ('#' + (pullNum == 'files' ? arr[arr.length - 2] : pullNum));
            }

            return ('Not Valid');
        },

        new: function(type, defaultType, user) {
            user = methods.userData(user);

            return  ({  type : type,
                        urgency : 'high',
                        state : 'posted',
                        data : { title : null, desc : null, sub_type : defaultType },
                        user: user,
                        sort_order: 1,
                        reviewer: null,
                        created_date : null,
                        taken_date : null,
                        reviewed_date : null,
                        rejected: false,
                        tag: null });
        },

        complete: function(request, rejected) {
            request.state = 'reviewed';
            request.sort_order = 3;
            request.reviewed_date = new Date();
            request.rejected = rejected ? true : false;

            socket.emit('completeRequest', request);
        },

        isUserRequest: function(request, user) {
            return (request.user.email == user.email);
        },

        isPosted: function(request) {
            return (request.state == 'posted');
        },

        isTaken: function(request) {
            return (request.state == 'taken');
        },

        isReviewed: function(request) {
            return (request.state == 'reviewed');
        },

        wasRejected: function(request) {
            return (request.rejected);
        },

        canEdit: function(request, user) {
            return (this.isUserRequest(request, user) && request.state != 'reviewed');
        },

        canComplete: function(request, user) {
            var selfTakable = config.requests[request.type].selfTakable;
            return (request.state == 'taken' && request.reviewer.email == user.email && this.allowedToReview(user) && (request.user.email != user.email || selfTakable));
        },

        canTake: function(request, user) {
           var selfTakable = config.requests[request.type].selfTakable;
           return (request.state == 'posted' && this.allowedToReview(user) && (request.user.email != user.email || selfTakable));
        },

        release: function(request) {
            request.state = 'posted';
            request.taken_date = null;
            request.sort_order = 1;
            socket.emit('releaseRequest', request);
        },

        nudge: methods.nudge,

        delete: function(request) {
            var collection = methods.getCollection(request);
            index = collection.indexOf(request);

            if (index >= 0) {
                collection.splice(index, 1);
            }

            socket.emit('deleteRequest', request);
        },

        createOrUpdate: function(request, user, isNew) {
            if (isNew) {
                if (request.data.title.length > 0) {
                    request.user = methods.userData(user);
                    request.created_date = new Date();
                    methods.getCollection(request).unshift(request);

                    // add request and get id back
                    socket.emit('addRequest', request, function(newRequest) {
                        request._id = newRequest._id;
                    });
                }
            } else {
                var realRequest = methods.find(request);

                if (realRequest) {
                    methods.update(realRequest, request, true);
                }
            }
        },

        loadMore: function(type) {
            this.getRequests(type, false, requests[type].length + 9, function(newRequests) {

                // todo: normal paging
                var requestsToAdd = newRequests.slice(requests[type].length);

                for (var i=0; i<requestsToAdd.length; i++) {
                    requests[type].push(requestsToAdd[i]);
                }
            }, null, true);
        },

        preCheck: function(url, callback) {
            socket.emit('preCheckRequest', url, callback);
        },

        getTeam: function(request) {
            for (var repoIndex = 0; repoIndex < repos.length; repoIndex++) {
                if (request.data.title.split('/')[4] == repos[repoIndex].name)  {
                    return (repos[repoIndex].team_name);
                }
            }

            return ('None');
        }

    }
}]);
