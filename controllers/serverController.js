var ServerEnv = require('../models/serverEnvironment'),
    notifier  = require('../services/notifier'),
    mailer = require('../services/mailer'),
    serverMessages  = require('../services/messages/servers'),
    request = require('request');

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

function getNotifierMsg(server, actionName) {
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

function findServerByName(serverName, servers){

    for (var i = 0; i < servers.length; i++) {
        if (servers[i].name.toLowerCase() == serverName.toLowerCase()) {
            return (servers[i]);
        }
    }

    return (null);
}

module.exports = {

    all: function (req, res) {
        if (req.query.token) {
            try {
                var decodedUser = jwt.verify(req.query.token, req.app.get('superSecret'));
            } catch(ex) {
                res.send(500, { error: "Bad token" });
                return;
            }
        }

        if (!req.user && !decodedUser) {
            res.json([]);
            return;
        }

        try {

            var query = ServerEnv.find({}).sort('order');

            query.exec(function(err, serverEnvs) {

                if (!err) {

                    if (!req.user && !decodedUser) { // fix for strange server error
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

            try {

                if (err) { throw err; }

                env.take(data.name, data.user, data.release_date);
                saveServerEnv(env);
                notifier.sendMessage('server', data.user.name, getNotifierMsg(data, 'took'), 'red');

                if (callback) { callback(env); }

            } catch (exp) {

               if (callback) { callback(null, exp); }

            }

        });
    },

    extend : function(data, callback) {
        ServerEnv.findOne({name: data.environment}, function(err, env) {
            try {

                if (err) { throw err; }

                env.setReleaseDate(data.name, new Date(data.release_date));
                saveServerEnv(env);

                if (callback) { callback(env); }

            } catch (exp) {

                if (callback) { callback(null, exp); }

            }

        });
    },

    release: function (data, callback) {
        ServerEnv.findOne({name: data.environment}, function(err, env) {
            try {

                if (err) { throw err; }

                var server = env.release(data.name).toObject();
                saveServerEnv(env);

                notifier.sendMessage('server', "Devflow", server.name + " released", "green");

                if (server.user) {
                    mailer.sendMail(server.user.email,
                                server.name + ' is finally free for you',
                                'Hi <b>' + server.user.name + '</b>, <br/><br/><br/>' +
                                'Finally, <br/> <br/>' +
                                '<i>' + server.name + '</i> is FREE, and <u>you</u> are next in line...<br/><br/><br/><br/>' +
                                'The server has been marked as taken by you automatically :)');

                    notifier.sendMessage('server', server.user.name, getNotifierMsg(server, 'took by queue'), 'red');
                    notifier.sendSlackPersonalMessage(server.user.email, 'system', serverMessages.automaticallyAssigned(server.user, server), 'orange');
                }

                if (callback) { callback({env: env, server: server}); }

            } catch (exp) {

                if (callback) { callback(null, exp); }

            }

        });
    },

    queue: function (data, callback) {

        ServerEnv.findOne({name: data.server.environment}, function(err, env) {
            try {

                if (err) { throw err; }

                env.queueServer(data.server.name, data.user);
                saveServerEnv(env);

                notifier.sendMessage('server', data.user.name, getNotifierMsg(data.server, 'queued in'), 'yellow');
                notifier.sendSlackPersonalMessage(data.server.user.email, 'system', serverMessages.spareAServer(data.user, data.server), 'orange');
                
                if (callback) { callback(env); }

            } catch (exp) {

                if (callback) { callback(null, exp); }

            }

        });
    },

    unqueue: function(data, callback) {
        ServerEnv.findOne({name: data.server.environment}, function(err, env) {
            try {

                if (err) { throw err; }

                env.unqueueServer(data.server.name, data.user);
                saveServerEnv(env);

                notifier.sendMessage('server', data.user.name, getNotifierMsg(data.server, 'unqueued in'), 'green');

                if (callback) { callback(env); }

            } catch (exp) {

                if (callback) { callback(null, exp); }

            }

        });
    },

    queueEnv: function(data, callback) {
        ServerEnv.findOne({_id: data.env._id}, function(err, env) {
            try {

                if (err) { throw err; }

                env.queueEnv(data.user);
                saveServerEnv(env);

                notifier.sendMessage('server', data.user.name, getNotifierMsg(data.env, 'queued in ENV: '), 'red');

                // notifying personally for each user who has a plike
                env.servers.map(function(server) {
                    notifier.sendSlackPersonalMessage(server.user.email, 'system', serverMessages.spareAServer(data.user, server), 'orange');
                });

                if (callback) { callback(env); }

            } catch (exp) {

                if (callback) { callback(null, exp); }

            }

        });
    },

    unqueueEnv: function(data, callback) {
        ServerEnv.findOne({_id: data.env._id}, function(err, env) {
            try {

                if (err) { throw err; }

                env.unqueueEnv(data.user);
                saveServerEnv(env);

                notifier.sendMessage('server', data.user.name, getNotifierMsg(data.env, 'unqueued in ENV: '), 'green');
                notifier.sendSlackPersonalMessage(server.user.email, 'system', serverMessages.automaticallyAssigned(server.user, server), 'orange');
                
                if (callback) { callback(env); }

            } catch (exp) {

                if (callback) { callback(null, exp); }

            }

        });
    },

    downStateChanged: function(data, callback) {
        ServerEnv.findOne({name: data.environment}, function(err, env) {
            if (err) { throw err; }

            env.changeServerDownState(data.name, data.is_down);
            saveServerEnv(env);

            var strState = data.is_down ? 'DOWN' : 'UP';
            notifier.sendMessage('server', 'Devflow', data.name + ' has been marked as ' + strState, 'red');

            if (callback) { callback(env); }
        });
    },

    // On-demand
    create: function (data, callback) {
        ServerEnv.findOne({name: data.environment}, function(err, env) {
            try {

                if (err) {
                    if (callback) { callback(null, err); }
                    return;
                }

                var options = {
                    uri: config.pod.url,
                    method: 'POST',
                    json: { "branch_name": data.branch_name }
                };

                request(options, function (error, response, body) {

                    if (error) {
                        if (callback) { callback(null, error); }
                        return;
                    }

                    var srv = env.create(body.instance_id, data.user, data.release_date, body.deploy_url, body.server_url, data.custom_gemset);
                    saveServerEnv(env);

                    if (callback) { callback(srv); }
                });

            } catch (exp) {

                if (callback) { callback(null, exp); }

            }
        });
    },

    kill: function (data, callback) {

        try {

            ServerEnv.findOne({name: data.environment}, function(err, env) {

                if (err) {
                    if (callback) { callback(null, err); }
                    return;
                }

                request.del(config.pod.url + '/' + data.name, function (error, response, body) {

                    if (error) {
                        if (callback) { callback(null, error); }
                        return;
                    }

                });

                var srv = env.kill(data.name);
                saveServerEnv(env);

                if (callback) { callback(srv); }
            });
        } catch (exp) {

            if (callback) { callback(null, exp); }

        }
    },

    rest: {
        all: function (req, res) {

            var query = ServerEnv.find({name: req.query.environment}).sort('order');

            query.exec(function(err, serverEnvs) {

                try {

                    res.json(serverEnvs[0]);

                } catch (exp) {

                    res.send(500, {error: exp.toString()});

                }
            });

        },

        take: function (req, res) {
            if (req.body.token) {
                try {
                    token = jwt.verify(req.body.token, req.app.get('superSecret'));
                    req.body.user = token._doc
                } catch(ex) {
                    res.send(500, { error: "bad token" });
                    return;
                }
            }
            module.exports.take(req.body, function(env, err) {

                if (err) {
                    res.send(500, {error: err.toString()});
                    return;
                }

                if (env == null) {
                    res.send(500, { error: "Environment not found!" });
                    return;
                }

                // Extract and return just the requested server!
                var srv = findServerByName(req.body.name, env.servers)
                if (srv == null) {
                    res.send(404, { error: "Server not found!" });
                    return;
                }

                res.json(srv);
            });
        },

        extend: function (req, res) {

            module.exports.extend(req.body, function(env, err) {

                if (err) {
                    res.send(500, {error: err.toString()});
                    return;
                }

                if (!env) {
                    res.send(500, { error: "Environment not found!" });
                    return;
                }

                // Extract and return just the requested server!
                var srv = findServerByName(req.body.name, env.servers)
                if (srv == null) {
                    res.send(404, { error: "Server not found!" });
                    return;
                }
                res.json(srv);
            });
        },

        release: function(req, res) {

            module.exports.release(req.body, function(env, err) {

                if (err) {
                    res.send(500, {error: err.toString()});
                    return;
                }

                res.json(env);

            });

        },

        queue: function(req, res) {

            module.exports.queue({ server: req.body, user: req.body.user }, function(env, err) {

                if (err) {
                    res.send(500, {error: err.toString()});
                    return;
                }

                if (!env) {
                    res.send(500, { error: "Environment not found!" });
                    return;
                }

                // Extract and return just the requested server!
                var srv = findServerByName(req.body.name, env.servers)
                if (srv == null) {
                    res.send(404, { error: "Server not found!" });
                    return;
                }
                res.json(srv);
            });

        },

        unqueue: function(req, res) {

            module.exports.unqueue({ server: req.body, user: req.body.user }, function(env, err) {

                if (err) {
                    res.send(500, {error: err.toString()});
                    return;
                }

                res.json(env);
            });

        }
    }
}
