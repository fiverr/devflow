var ServerEnv        = require('../models/serverEnvironment'),
    notifier         = require('../services/notifier'),
    jobConfig        = config.jobs.timeNearlyUpReminder,
    timerId          = -1;

module.exports = {

    startJob: function() {
        var that = this;

        timerId = setInterval(function () {
            console.log('Starting Reminder Job');

            that.getNearlyDoneServers(function(servers) {
                servers.forEach(function(server) {
                    var usernameHandle = '@' + server.user.email.split('@',1)[0],
                        minutesLeft = Math.ceil((server.release_date - new Date()) / (1000 * 60));

                    console.log('Notifying ' + usernameHandle + ' he has less than ' + minutesLeft + ' minutes left on ' + server.name);

                    notifier.sendMessage(usernameHandle, 'Devflow',
                        'Less than ' + minutesLeft + ' min left on ' + server.name + '\n' +
                        'Get your sh!t together or <' + config.home_url + '#/servers|request an extension>');
                });

                console.log('Reminder Job Completed');

            });
        }, jobConfig.interval);
    },

    stopJob: function() {
        clearInterval(timerId);
    },

    getNearlyDoneServers: function(callback) {
        var nearlyDoneServers = [],
            now = new Date();

        ServerEnv.find({}, function(err, envs) {
            envs.forEach(function(env) {
                env.servers.forEach(function(server) {
                    if (server.release_date && now < server.release_date && server.release_date - now < jobConfig.nearlyDoneThreshold) {
                        nearlyDoneServers.push(server);
                    }
                });
            });

            callback(nearlyDoneServers);
        });
    }
};
