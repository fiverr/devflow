var ServerEnv = require('../models/serverEnvironment'),
    mailer = require('../services/mailer'),
    hipchat = require('../services/hipchat'),
    request = require('request');

    request.debug = true;

function saveServerEnv(serverEnv) {
    serverEnv.save(function (err) {
        if (err) {
            throw err;
        }
    });
}

function updateEnv(data, env) {
    for (var key in data) {
        env[key] = data[key];
    }
}

function getHipChatMsg(server, actionName) {
    return ('I just ' + actionName + ' ' + server.name)
}

function checkIfInQueue(user, queue) {
    for (var queueIndex = 0; queueIndex < queue.length; queueIndex++) {
        if (queue[queueIndex].email == user.email) {
          return (true);
        }
    }

    return (false);
}

module.exports = {

    all: function (req, res) {

        if (!req.user) {
            res.json([]);
            return;
        }

        try {

            var query = ServerEnv.find({}).sort('name');

            query.exec(function(err, serverEnvs) {

                if (!err) {

                    if (!req.user) { // fix for strange server error
                        serverEnvs = [];
                    } else if (req.query.free) {

                        // run on all server envs and remove taken servers
                        for (var envIndex = 0; envIndex < serverEnvs.length; envIndex++) {

                            // if in env queue, remove all servers from this env
                            if (checkIfInQueue(req.user, serverEnvs[envIndex].queue)) {
                                serverEnvs[envIndex].servers = [];
                            }

                            var servers = serverEnvs[envIndex].servers;
                            for (var serverIndex = 0; serverIndex < servers.length; serverIndex++) {

                                // if user is in queue or on one of the servers - remove all servers
                                if (servers[serverIndex].user.email == req.user.email ||
                                    checkIfInQueue(req.user, servers[serverIndex].queue)) {
                                    serverEnvs[envIndex].servers = [];
                                    break;
                                } else if (servers[serverIndex].user.name) {
                                    servers.splice(serverIndex, 1);
                                    serverIndex--;
                                }
                            }

                        }
                    }

                    res.json(serverEnvs);

                } else { throw err; }
            });

        } catch (ex) {
            console.log(ex);
        }
    },

    saveAllServerEnvs: function(req, res) {
        if (req.user.isManagingUser()) {

            ServerEnv.find({}, function(err, serverEnvs) {

                // run on all envs in request and search in db envs
                for (var envIndex = 0; envIndex < req.body.envs.length; envIndex++) {

                    var env = null;

                    for (var i = 0; i < serverEnvs.length; i++) {
                        if (req.body.envs[envIndex]._id == serverEnvs[i]._id) {
                            env = serverEnvs[i];
                            break;
                        }
                    }

                    if (!env) {
                        env = new ServerEnv();
                    }

                    updateEnv(req.body.envs[envIndex], env);
                    saveServerEnv(env);
                }
            });
        }
    },

    serverData: function(req, res) {
        var serverName = req.params.name;

        ServerEnv.find({}, function(err, serverEnvs) {

            // run on all envs in request and search in db envs
            for (var envIndex = 0; envIndex < serverEnvs.length; envIndex++) {
                var server = serverEnvs[envIndex].getServerData(serverName);

                if (server) {
                    res.json(server);
                    return;
                }
            }

            res.json({});
        });
    },

    take: function (data, callback) {
        ServerEnv.findOne({name: data.environment}, function(err, env) {
            if (err) { throw err; }

            env.take(data.name, data.user, data.release_date);
            saveServerEnv(env);
            hipchat.sendMessage('server', data.user.name, getHipChatMsg(data, 'took'), 'red');

            if (callback) { callback(env); }
        });
    },

    extend : function(data, callback) {
        ServerEnv.findOne({name: data.environment}, function(err, env) {
            if (err) { throw err; }

            env.setReleaseDate(data.name, new Date(data.release_date));
            saveServerEnv(env);

            if (callback) { callback(env); }
        });
    },

    release: function (data, callback) {
        ServerEnv.findOne({name: data.environment}, function(err, env) {
            if (err) { throw err; }

            env.release(data.name);
            saveServerEnv(env);

            hipchat.sendMessage('server', "Devflow", data.name + " released", "green");

            if (data.user) {
                mailer.sendMail(data.user.email,
                            data.name + ' is finally free for you',
                            'Hi <b>' + data.user.name + '</b>, <br/><br/><br/>' +
                            'Finally, <br/> <br/>' +
                            '<i>' + data.name + '</i> is FREE, and <u>you</u> are next in line...<br/><br/><br/><br/>' +
                            'The server has been marked as taken by you automatically :)');

                hipchat.sendMessage('server', data.user.name, getHipChatMsg(data, 'took by queue'), 'red');
            }

            if (callback) { callback(env); }
        });
    },

    queue: function (data, callback) {
        ServerEnv.findOne({name: data.server.environment}, function(err, env) {
            if (err) { throw err; }

            env.queueServer(data.server.name, data.user);
            saveServerEnv(env);

            hipchat.sendMessage('server', data.user.name, getHipChatMsg(data.server, 'queued in'), 'yellow');

            if (callback) { callback(env); }
        });
    },

    unqueue: function(data, callback) {
        ServerEnv.findOne({name: data.server.environment}, function(err, env) {
            if (err) { throw err; }

            env.unqueueServer(data.server.name, data.user);
            saveServerEnv(env);

            hipchat.sendMessage('server', data.user.name, getHipChatMsg(data.server, 'unqueued in'), 'green');

            if (callback) { callback(env); }
        });
    },

    queueEnv: function(data, callback) {
        ServerEnv.findOne({_id: data.env._id}, function(err, env) {
            if (err) { throw err; }

            env.queueEnv(data.user);
            saveServerEnv(env);

            hipchat.sendMessage('server', data.user.name, getHipChatMsg(data.env, 'queued in ENV: '), 'red');

            if (callback) { callback(env); }
        });
    },

    unqueueEnv: function(data, callback) {
        ServerEnv.findOne({_id: data.env._id}, function(err, env) {
            if (err) { throw err; }

            env.unqueueEnv(data.user);
            saveServerEnv(env);

            hipchat.sendMessage('server', data.user.name, getHipChatMsg(data.env, 'unqueued in ENV: '), 'green');

            if (callback) { callback(env); }
        });
    },

    downStateChanged: function(data, callback) {
        ServerEnv.findOne({name: data.environment}, function(err, env) {
            if (err) { throw err; }

            env.changeServerDownState(data.name, data.is_down);
            saveServerEnv(env);

            var strState = data.is_down ? 'DOWN' : 'UP';
            hipchat.sendMessage('server', 'Devflow', data.name + ' has been marked as ' + strState, 'red');

            if (callback) { callback(env); }
        });
    },

    // On-demand
    create: function (data, callback) {
        ServerEnv.findOne({name: data.environment}, function(err, env) {
            if (err) { throw err; }

            var options = {
                uri: config.pod.url,
                method: 'POST',
                json: { "branch_name": data.branch_name }
            };

            request(options, function (error, response, body) {
                if (error) { throw error; }
                env.create(body.instance_id, data.user, data.release_date, body.deploy_url, body.server_url, data.custom_gemset);
                saveServerEnv(env);

                if (callback) { callback(env); }
            });
        });
    },
    kill: function (data, callback) {
        ServerEnv.findOne({name: data.environment}, function(err, env) {
            if (err) { throw err; }

            request.del(config.pod.url + "/" + data.name, function (error, response, body) {
                if (error) { throw error; }

                console.log(body);
            });

            env.kill(data.name);
            saveServerEnv(env);

            if (callback) { callback(env); }
        });
    },

    rest: {
        take: function (req, res) {
            try {
                module.exports.take(req.body, function(env) { res.json(env); });
            } catch (err) { res.send(500); }
        },

        extend: function (req, res) {
            try {
                module.exports.extend(req.body, function(env) { res.json(env); });
            } catch (err) { res.send(500); }
        },

        release: function(req, res) {
            try {
                module.exports.release(req.body, function(env) { res.json(env); });
            } catch (err) { res.send(500); }
        },

        queue: function(req, res) {
            try {
                module.exports.queue(req.body, function(env) { res.json(env); });
            } catch (err) { res.send(500); }
        },

        unqueue: function(req, res) {
            try {
                module.exports.unqueue(req.body, function(env) { res.json(env); });
            } catch (err) { res.send(500); }
        }
    }
}
