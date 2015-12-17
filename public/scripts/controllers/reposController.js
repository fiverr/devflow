devflowApp.controller('reposController', ['$scope',
    function ($scope) {

    $scope.service = { name: 'repoService',
                       fetchAllAction: 'getRepos',
                       updateAllAction: 'updateRepos',
                       newModel: 'newRepo' }

    $scope.fields = [
        { key: 'name', type: 'text',  name: 'Name', placeholder: 'New Repo', unique: true },
        { key: 'team_name', type: 'text',  name: 'Team Name' },
        { key: 'hipchat_group', type: 'text',  name: 'Hipchat Group' },
        { key: 'slack_group', type: 'text',  name: 'Slack Tag' },
    ];

}]);
