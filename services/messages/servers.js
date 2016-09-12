var User = require('../../models/user');

module.exports = {
    spareAServer: function(candidate, server) {
        var serverOwner = server.user;
        var candidateSocialName = User.socialName(candidate.email);
        var msg = 'Yo ' + serverOwner.name + ', please release <' + config.home_url + '#/servers|' + server.name + ' (' + server.environment + ')> if you do not need it. ' + candidateSocialName + ' is waiting for it.'; 
        return msg;
    },
    automaticallyAssigned: function(newOwner, server) {
        var msg = ':tada: Good news ' + newOwner.name + '!! <' + config.home_url + '#/servers|' + server.name + ' (' + server.environment + ')> has been released and been assigned to you. Thank you for patience.';
        return msg;
    }
}
