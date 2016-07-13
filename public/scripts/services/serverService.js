devflowApp.factory('serverService', ['$http', 'socket', 'notificationService', function($http, socket, notificationService) {
    var serverEnvironments = [],
        freeOnly = false;

    // private methods
    var methods = {
        findEnvByName: function(name) {
            for (var serverEnvIndex = 0; serverEnvIndex < serverEnvironments.length; serverEnvIndex++) {
                if (serverEnvironments[serverEnvIndex].name == name) {
                    return (serverEnvironments[serverEnvIndex]);
                }
            }

            return (null);
        },

        find: function(server) {
            for (var serverEnvIndex = 0; serverEnvIndex < serverEnvironments.length; serverEnvIndex++) {
                var serverEnv = serverEnvironments[serverEnvIndex];

                for (var serverIndex = 0; serverIndex < serverEnv.servers.length; serverIndex++) {
                    if (serverEnv.servers[serverIndex].name == server.name) {
                        return (serverEnv.servers[serverIndex]);
                    }
                }
            }

            return (null);
        },

        update: function(server, data) {
            if (server) {
                for (var field in data) {
                    server[field] = data[field];
                }
            }
        },

        userData: function(user) {
           return ({ name: user.name, image: user.image, email: user.email });
        },

        initSockets: function() {
            var that = this;

            socket.on('serverTaken', function(data) {
                var server = that.find(data);

                that.update(server, data);

                if (freeOnly) {
                    var env = that.findEnvByName(data.environment);
                    env.servers.splice(env.servers.indexOf(server), 1);
                }
            });

            socket.on('serverReleased', function(data) {
                var server = that.find(data);
                that.update(server, data);

                if (freeOnly) {
                    var env = that.findEnvByName(data.environment);
                    env.servers.push(data);
                }

                if (data.user) {
                    notificationService.add(data.name + ' is free and you are next in line, use it wisely', data.user.image, data.user);
                }
            });

            socket.on('serverDownStateChanged', function(data) {
                that.update(that.find(data), data);
            });

            socket.on('serverQueued', function(data) {
                that.update(that.find(data.server), data.server);
            });

            socket.on('serverExtended', function(data) {
                that.update(that.find(data), data);
            });

            socket.on('serverUnqueued', function(data) {
                that.update(that.find(data.server), data.server);
            });

            socket.on('envQueued', function(data) {
                that.update(that.findEnvByName(data.env.name), data.env);
            });

            socket.on('envUnqueued', function(data) {
                that.update(that.findEnvByName(data.env.name), data.env);
            });

            // On-demand
            socket.on('serverCreated', function(data) {
                var env = that.findEnvByName(data.environment);
                env.servers.push(data);
            });

            socket.on('serverKilled', function(data) {
                var env = that.findEnvByName(data.environment);
                env.servers.splice(env.servers.indexOf(data), 1);
            });
        }
    }

    methods.initSockets();

    return {
        getServers: function(freeOnly, onSuccess, onFailure) {
            var that = this,
                params = {};

            if (freeOnly) {
                params.free = true;
                freeOnly = true;
            }

            $http.get('/server', {params: params})
                .success(function (data, status, headers, config) {
                    if (typeof onSuccess === 'function') {
                        serverEnvironments = data;
                        onSuccess(data);
                    }
                })
                .error(function (data, status, headers, config) {
                    if (typeof onFailure === 'function') {
                        onFailure(data);
                    }
                });
        },

        newServer: function(envName) {
            return ({ name: '', environment: envName, url: '', user: null, queue: [],
                      taken_since: null, is_down: false, release_date: null });
        },

        updateServers: function(envs, onSuccess, onFailure) {
            $http.post('/servers', {envs: envs})
                .success(function (data, status, headers, config) {
                    if (typeof onSuccess === 'function') {
                        onSuccess(data);
                    }
                })
                .error(function (data, status, headers, config) {
                    if (typeof onFailure === 'function') {
                        onFailure(data);
                    }
                });
        },

        take: function(server, user) {
            server.user = methods.userData(user);
            server.taken_since = new Date();
            server.release_date = new Date();

            // take for 1 hour by default
            this.setReleaseDate(server, 1);
            socket.emit('takeServer', server);

            // remove taking user if in queue
            this.removeUserFromQueue(server.queue, server.user);
        },

        create: function(envName, branchName, user, customGems, callback) {
            server = {};
            server.user = methods.userData(user);
            server.taken_since = new Date();
            server.release_date = new Date();
            server.environment = envName;
            server.branch_name = branchName;
            server.custom_gemset = customGems

            this.setReleaseDate(server, 12);
            socket.emit('createServer', server, function(data) {
                var env = methods.findEnvByName(data.environment);
                env.servers.push(data);
            });
        },

        kill: function(server) {
            var env = methods.findEnvByName(server.environment);
            env.servers.splice(env.servers.indexOf(server), 1);
            socket.emit('killServer', server);
        },

        extend: function(server, hours) {
            this.setReleaseDate(server, hours);
            socket.emit('extendServer', server);
        },

        release: function(server) {
            var that = this,
                env = methods.findEnvByName(server.environment),
                unqueuEnv = false,
                nextUser = null;

            // free server if no one is in queue
            if (server.queue.length == 0 && env.queue.length == 0) {
                server.user = null;
                server.taken_since = null;
                server.release_date = null;
            } else {
                if (server.queue.length > 0) {
                   nextUser = server.queue[0];
                   server.queue.splice(0, 1);
                } else if (env.queue.length > 0) {
                   nextUser = env.queue[0];
                   env.queue.splice(0, 1);
                   unqueuEnv = true;
                }

                server.user = nextUser;
                server.taken_since = new Date();
                server.release_date = new Date();
                that.setReleaseDate(server, 1);
            }

            socket.emit('releaseServer', server);

            if (unqueuEnv) {
                socket.emit('unqueueEnv', { env: env, user: methods.userData(nextUser) });
            }
        },

        joinQueue: function(server, user, isEnv) {
            user = methods.userData(user);

            server.queue.push(user);

            if (isEnv) {
                socket.emit('queueEnv', { env: server, user: user });
            } else {
                socket.emit('queueServer', { server: server, user: user });
            }
        },

        unqueue: function(server, user, isEnv) {
            user = methods.userData(user);

            this.removeUserFromQueue(server.queue, user);

            if (isEnv) {
                socket.emit('unqueueEnv', { env: server, user: user });
            } else {
                socket.emit('unqueueServer', { server: server, user: user });
            }
        },

        changeDownState: function(server, isDown) {
            server.is_down = isDown;
            this.release(server);
            socket.emit('changeServerDownState', server);
        },

        isTaken: function(server) {
            return (typeof(server.user) !== 'undefined' && server.user !== null);
        },

        isDown: function(server) {
            return (server.is_down);
        },

        isTakenByUser: function(server, user) {
            return (server.user && server.user.email == user.email);
        },

        allowedToTakeDown: function(server, user) {
            return ((user.role == 'admin' || user.role == 'devops') && !server.on_demand);
        },

        canJoin: function(server, user, isEnv) {
            var that = this,
                env = isEnv ? server : methods.findEnvByName(server.environment);

            if (that.isDown(server) || that.isUserInQueue(env.queue, user) || (server.on_demand && !isEnv)) {
                return (false);
            }

            // Run on all servers in environment
            for (var serverIndex = 0; serverIndex < env.servers.length; serverIndex++) {
                var currServer = env.servers[serverIndex];

                // if user has taken server or queued in server - can't join
                if (that.isTakenByUser(currServer, user) || that.isUserInQueue(currServer.queue, user)) {
                    return (false);
                }
            }

            return (true);
        },

        canJoinEnvQueue: function(env, user) {

            // Run on all servers in environment
            for (var serverIndex = 0; serverIndex < env.servers.length; serverIndex++) {

                // if there is a free server, no need for env queueing
                if (!env.servers[serverIndex].user) {
                    return (false);
                }
            }

            // check if the user can join a queue in general
            return (this.canJoin(env, user, true));
        },

        isUserInQueue: function(queue, user) {
            for (var queueIndex = 0; queueIndex < queue.length; queueIndex++) {
                if (queue[queueIndex].email == user.email) {
                  return (true);
                }
            }

            return (false);
        },

        setReleaseDate: function(server, hours) {
            var releaseDate = new Date(server.release_date);
            server.release_date = releaseDate.setHours(releaseDate.getHours() + hours);
        },

        removeUserFromQueue: function(queue, user) {
            for (var i = 0; i < queue.length; i++) {
                if (queue[i].email == user.email) {
                    queue.splice(i, 1);
                }
            }
        }
    }
}]);
