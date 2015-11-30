devflowApp.factory('repoService', ['$http', function($http) {
    return {

        getRepos: function(onSuccess, onFailure) {
            $http.get('/repos') 
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

        newRepo: function() {
            return {
                name: null,
                team_name: null,
                hipchat_group: null,
                slack_group: null
            }
        },

        updateRepos: function(repos, onSuccess, onFailure) {
            $http.post('/repos', {repos: repos}) 
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
    }
}]);