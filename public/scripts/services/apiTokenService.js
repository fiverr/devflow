devflowApp.factory('apiTokenService', ['$http', function($http) {

    return {
        generateToken: function(onSuccess, onFailure) {
            $http.get('/token/generate')
                .success(function (data, status, headers, config) {
                    if (typeof onSuccess === 'function') {
                        onSuccess(data.token)
                    }
                })
                .error(function (data, status, headers, config) {
                    if (typeof onFailure === 'function') {
                        onFailure(status)
                    }
                });
        }
    }
}]);
