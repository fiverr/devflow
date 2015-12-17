devflowApp.controller('tagController', ['$scope',
    function ($scope) {
        
        $scope.service = { name: 'tagService',
                           fetchAllAction: 'getTags',
                           updateAllAction: 'updateTags',
                           newModel: 'newTag' }

        $scope.fields = [
            { key: 'name', type: 'text',  name: 'Name', placeholder: 'New Tag', unique: true },
            { key: 'owner', type: 'text',  name: 'Owner' }
        ];

}]);
