var ServerEnv        = require('../models/serverEnvironment'),
    serverController = require('../controllers/serverController'),
    jobConfig        = config.jobs.serverRelease,
    timerId          = -1;

module.exports = {

    startJob: function() {
        var that = this;

        timerId = setInterval(function () {
            console.log('Starting release Job');

            that.getTimedOutServers(function(servers) {

                for (var serverIndex = 0; serverIndex < servers.length; serverIndex++) {
                    var server = servers[serverIndex].server;

                    if (server.on_demand) {
                        serverController.kill(server);
                        sockets.emit('serverKilled', servers[serverIndex].env);
                        console.log(server.name + ' Killed!');
                    } else {
                        var envQueueCount = servers[serverIndex].env.queue.length;

                        serverController.release(server.toObject(), function(data) {
                            sockets.emit('serverReleased', data.server);
                            console.log(data.server.name + ' Released');

                            // unqueued from env
                            if (data.env.queue.length < envQueueCount) {
                                sockets.emit('envUnqueued', { env: data.env });
                            }
                        });
                    }
                }

                console.log('Release Job Completed');

            });
        }, jobConfig.timeout);
    },

    stopJob: function() {
        clearInterval(timerId);
    },

    getTimedOutServers: function (callback) {

        // Run on all servers in all envs
        ServerEnv.find({}, function(err, envs) {

            var timedoutServers = [],
                now = new Date();

            // run on all server envs
            for (var envIndex = 0; envIndex < envs.length; envIndex++) {

                var servers = envs[envIndex].servers;

                for (var serverIndex = 0; serverIndex < servers.length; serverIndex++) {

                    // check if the date passed
                    if (servers[serverIndex].release_date && now > servers[serverIndex].release_date) {
                        timedoutServers.push({ server: servers[serverIndex], env: envs[envIndex] });
                    }
                }
            }

            // report finish
            callback(timedoutServers);
        });
    }
}
