devflowApp.directive('ngSrc', function() {
    return {
        link: function(scope, element, attrs) {
            element.bind('error', function() {
                element.attr('src', '../images/noimage.jpg');
            });
        }
    }
});
