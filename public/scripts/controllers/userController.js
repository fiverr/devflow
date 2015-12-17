devflowApp.controller('usersController', ['$scope',
    function ($scope) {
        $scope.service = { name: 'userService',
                           fetchAllAction: 'allUsers',
                           updateAllAction: 'updateUsers',
                           newModel: 'newUser' }

        var emailValidator = function(value) {
            var emailRegex = new RegExp("^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$");
            return (emailRegex.test(value));
        };

        var nameValidator = function(value) {
            return (value.length >= 3);
        };

        $scope.fields = [
            { key: 'image', type: 'image',  name: 'Photo', viewClass: 'user-image' },
            { key: 'name', type: 'text',  name: 'Name', placeholder: 'New User', unique: true, validator: nameValidator },
            { key: 'id', type: 'readonly',  name: 'Google ID' },
            { key: 'email', type: 'text',  name: 'Email', unique: true, validator: emailValidator },
            { key: 'image', type: 'text',  name: 'Image' },
            { key: 'associated', type: 'checkbox',  name: 'Associated?' },
            { key: 'role', type: 'text',  name: 'Role' }
        ];
}]);
