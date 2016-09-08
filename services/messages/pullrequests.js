var User = require('../../models/user');

module.exports = {
    taken: function(request) {
        var reviewerSocialName = User.socialName(request.reviewer.email);
        var msg = ':eyes: ' + reviewerSocialName + ' is reviewing your <' + request.data.title + '|PR>. Stay tuned for the results.';
        return msg;
    },
    approved: function(request) {
        var reviewerSocialName = User.socialName(request.reviewer.email);
        var msg = ':clap: ' + reviewerSocialName + ' has just approved your <' + request.data.title + '|PR>. You rock :sports_medal:';
        return msg;
    },
    rejected: function(request) {
        var reviewerSocialName = User.socialName(request.reviewer.email);
        var msg = ':rage: ' + reviewerSocialName + ' has just rejected your <' + request.data.title + '|PR>. ';
        if (request.rejection_reasons && request.rejection_reasons.length > 0) {
            msg += 'This is why:\n>>>';
            msg += request.rejection_reasons.map(function(reasonKey) {
                return config.client.requests.pullrequest.rejectionReasons[reasonKey];
            }).join('\n');
        }
        return msg;
    },
    released: function(request) {
        var reviewerSocialName = User.socialName(request.reviewer.email);
        var msg = ':anguished: ' + reviewerSocialName + ' which was reviewing your <' + request.data.title + '|PR> has just released it without taking any action. WTF??';
        return msg;
    }
}
