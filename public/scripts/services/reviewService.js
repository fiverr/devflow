devflowApp.factory('reviewService', ['$http', function($http) {
    return {

        getReviews: function(type, count, onSuccess, onFailure) {
            var params = {};

            if (count) {
                params.count = count;
            }

            $http.get('/review/' + type, {params: params}) 
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

        getReviewCount: function(type, onSuccess, onFailure) {
            $http.get('/review/count/' + type)
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
        }
    }
}]);
