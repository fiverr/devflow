devflowApp.factory('userService', ['$http', function($http) {
    return {
        currentUser: null,

        getCurrentUser: function(onSuccess, onFailure) {
            var that = this;

            // return current user of already exists
            if (this.currentUser) {
                onSuccess(this.currentUser);
                return (this.currentUser);
            }

            $http.get('/users/currentUser') 
                .success(function (data, status, headers, config) {
                    if (typeof onSuccess === 'function') {
                        this.currentUser = data;
                        onSuccess(data);
                    }
                })
                .error(function (data, status, headers, config) {
                    if (typeof onFailure === 'function') {
                        onFailure(data);
                    }
                });
        },

        newUser: function() {
            return ({ id: null,
                      email: null,
                      name: null,
                      image: null,
                      associated: false,
                      role: 'user' });
        },

        updateUser: function(user, onSuccess, onFailure) {
            $http.post('/users/currentUser', {user: user}) 
                .success(function (data, status, headers, config) {
                    if (typeof onSuccess === 'function') {
                        onSuccess(data);
                    }
                })
                .error(function (data, status, headers, config) {
                    if (typeof onFailure === 'function') {
                        onFailure(data);
                    }
                });
        },

        allUsers: function(onSuccess, onFailure) {
            $http.get('/users') 
                .success(function (data, status, headers, config) {
                    if (typeof onSuccess === 'function') {
                        onSuccess(data);
                    }
                })
                .error(function (data, status, headers, config) {
                    if (typeof onFailure === 'function') {
                        onFailure(data);
                    }
                });
        },

        updateUsers: function(users, onSuccess, onFailure) {
            $http.post('/users', {users: users}) 
                .success(function (data, status, headers, config) {
                    if (typeof onSuccess === 'function') {
                        onSuccess(data);
                    }
                })
                .error(function (data, status, headers, config) {
                    if (typeof onFailure === 'function') {
                        onFailure(data);
                    }
                });
        },

        isManagingUser: function(user) {
            return (user.role == 'admin' || user.role == 'devops');
        }
    }
}]);
