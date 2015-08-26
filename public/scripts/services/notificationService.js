devflowApp.factory('notificationService', ['userService', function(userService) {
    var notifcations = [],
        unreadCallback,
        currentUser;

    userService.getCurrentUser(function(user) {
        currentUser = user;
    });

    return {
        getNotifications: function() {
            return (notifcations);
        },

        add: function(text, image, relatedUser) {
            var notification = {text: text, image: image};

            if (relatedUser.email == currentUser.email) {
                notifcations.unshift(notification);
                
                if (unreadCallback) {
                    unreadCallback();
                }
            }
        },

        setUnreadCallback: function(callback) {
            unreadCallback = callback;
        }
    };
}]);
