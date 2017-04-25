var compressor = require('node-minify'),
    files = [
        'public/scripts/app.js',
        'public/scripts/config.js',
        'public/scripts/services/userService.js',
        'public/scripts/services/notificationService.js',
        'public/scripts/services/apiTokenService.js',
        'public/scripts/services/requestService.js',
        'public/scripts/services/serverService.js',
        'public/scripts/services/reviewService.js',
        'public/scripts/services/repoService.js',
        'public/scripts/services/tagService.js',
        'public/scripts/controllers/mainController.js',
        'public/scripts/controllers/dashboardController.js',
        'public/scripts/controllers/serverController.js',
        'public/scripts/controllers/apiController.js',
        'public/scripts/controllers/userController.js',
        'public/scripts/controllers/requestController.js',
        'public/scripts/controllers/manageServersController.js',
        'public/scripts/controllers/reposController.js',
        'public/scripts/controllers/tagController.js',
        'public/scripts/directives/ngSrc.js',
        'public/scripts/directives/request/directive.js',
        'public/scripts/directives/review/directive.js',
        'public/scripts/directives/server-env/directive.js',
        'public/scripts/directives/server/directive.js',
        'public/scripts/directives/model-manager/directive.js',
        'public/scripts/directives/input-dropdown/directive.js'
    ];

module.exports = {
    compress: function(env) {
        new compressor.minify({
            type: 'uglifyjs',
            fileIn: files,
            fileOut: 'public/scripts/application.js',
            options: ['--compress'],
            callback: function(err, min) {
                console.log(err)
                console.log('minified and uglified js files');
            }
        });
    }
};
