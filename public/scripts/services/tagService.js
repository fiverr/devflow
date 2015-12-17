devflowApp.factory('tagService', ['$http', function($http) {
    return {

        getTags: function(onSuccess, onFailure) {
            $http.get('/tags') 
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

        newTag: function() {
            return {
                name: null,
                owner: null
            }
        },

        updateTags: function(tags, onSuccess, onFailure) {
            $http.post('/tags', {tags: tags}) 
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