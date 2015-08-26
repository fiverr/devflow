var User = require('../models/user');

function updateUser(data, user) {
    for (var key in data) {
        user[key] = data[key];
    }
}

function saveUser(user) {
    user.save(function (err) {
        if (err)  {
            throw err;
        }
    });
}

module.exports = {

    authenticate: function(request, accessToken, refreshToken, profile, done)  {

        User.findOne({email: profile.emails[0].value.toLowerCase()}, function(err, user) {

            // check if user found
            if (user) {
                if (err) { throw err; } 

                if (!user.associated) {
                    user.id = profile.id;
                    user.image = profile.photos ? profile.photos[0].value : "";

                    if (profile.displayName != '') {
                        user.name = profile.displayName;
                    }

                    user.associated = true;
                    saveUser(user);
                }

                // update id to the oauth one - legacy
                if (user.id != profile.id) {
                    user.id = profile.id;
                    user.save();
                }

              done(err, user);
              console.log(user.name + ' Connected');
            } else {
                done(null, false);
            }
        });
    },

    serializeUser: function(user, done) {
        done(null, user._id);
    },

    deserializeUser: function(id, done)  {
        User.findOne({_id: id}, function(err, user) {
            if (err) { throw err; } 
            done(null, user);
        });
    },

    getCurrentUser: function(req, res) {
        if (req.user) {
            res.json(req.user);
        }
    },

    updateCurrentUser: function(req, res) {
        if (req.body.user) {
            User.findOne({_id: req.body.user._id}, function(err, user) {
                updateUser(req.body.user, user);
                saveUser(user);
            });
        }
    },

    getAllUsers: function(req, res) {
        if (req.user.isManagingUser()) {

            User.find({}, function(err, users) {
                res.json(users);
            });
        }
    },

    saveAllUsers: function(req, res) {

        if (req.user.isManagingUser()) {

            User.find({}, function(err, users) {

                // run on all users in request and search in db users
                for (var userIndex = 0; userIndex < req.body.users.length; userIndex++) {

                    var user = null;

                    for (var i = 0; i < users.length; i++) {
                        if (req.body.users[userIndex]._id == users[i]._id) {
                            user = users[i];
                            break;
                        }
                    }

                    if (!user) {
                        user = new User();
                    }

                    updateUser(req.body.users[userIndex], user);
                    saveUser(user);
                }

                // run on all users in db and check if they need to be deleted
                for (var userIndex = 0; userIndex < users.length; userIndex++) {
                    var user = null;

                    for (var i = 0; i < req.body.users.length; i++) {
                        if (users[userIndex]._id == req.body.users[i]._id) {
                            user = users[userIndex];
                            break;
                        }
                    }

                    if (!user) {
                        users[userIndex].remove();
                    }
                }

                res.json({status: 'success'});
            });
        }
    },

    loginError: function(req, res) {
        res.sendfile('public/views/loginError.html');
    }
}
