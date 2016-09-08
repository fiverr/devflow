var Request     = require('../models/request'),
    Review      = require('../models/review'),
    Repo        = require('../models/repo'),
    Tag         = require('../models/tag'),
    User        = require('../models/user'),
    mailer      = require('../services/mailer'),
    notifier    = require('../services/notifier'),
    prMessages  = require('../services/messages/pullrequests'),
    github      = require('../services/github');


function getRequestMsg(request, actionName) {
    var subType = (request.type == 'graylog') ? 'graylog' : request.data.sub_type,
        msg = 'I just ' +  actionName + ' a ' +  subType + ' request: <a href="' + request.data.title + '">' + request.data.title + '</a>';

    if (request.reviewer) {
        msg += ' by ' + request.user.name;
    }

    if (request.rejected) {
        msg += ' - <b>requires additional work</b>';
    }

    if (config.requests.notifyTags && request.tag) {
        msg += ' [Owner: ' + request.tag.owner + ']';
    }

    return (msg);
}

function addReview(request) {

    Review.findOne({'user.email': request.reviewer.email, review_type: request.type}, function(err, review) {

        if (review) {
            review.count++;
        } else {
            review = new Review();
            review.user = request.reviewer;
            review.count = 1;
            review.review_type = request.type;
        }

        review.save();
    });
}

function saveRequest(request) {
    request.save(function (err) {
        if (err) {
            throw err;
        }
    });
}

function updateRequest(data, request) {
    if (request) {

        for (var key in data) {
            request[key] = data[key];
        }
    }
}

module.exports = {

    all: function (req, res) {
        var queryParams = { type: req.params.type };

        // get not taken
        if (req.query.notTaken) {
            queryParams.reviewer = null;
        }

        // check if from date
        if (req.query.fromDate) {
            queryParams.created_date = { $gt: req.query.fromDate };
        }

        var query = Request.find(queryParams);

        // limit number of requests returned
        if (req.query.count) {
            query.limit(parseInt(req.query.count));
        }

        // sort by order and inner sort by created date descending
        query.sort({sort_order: 1, created_date: -1});

        query.exec(function(err, requests) {

            if (!err) {
                res.json(requests);
            }
            else { throw err; }
        });
    },

    add: function (data) {
        var addColor = 'red';
        var request = new Request();
        updateRequest(data, request);
        saveRequest(request);
        notifier.sendMessage(request.type, data.user.name, getRequestMsg(data, 'added'), addColor);
        if (config.requests.notifyRepos) {
            var repoName = request.data.title.split('/')[4];

            Repo.find({name: repoName}, function(err, repos) {
                for (var repoIndex = 0; repoIndex < repos.length; repoIndex++) {
                    var currentRepo = repos[repoIndex];
                    notifier.sendRoomsMessage({hipchat: currentRepo.hipchat_group, slack: currentRepo.slack_group},
                                               data.user.name, getRequestMsg(data, 'added'), addColor);
                }
            });
        }

        if (config.requests.notifyTags && request.tag) {
            var tag = request.tag;
            notifier.sendRoomsMessage({
                slack: tag.owner
            }, data.user.name, getRequestMsg(data, 'added'), addColor)
        }

        return (request);
    },

    delete: function (data) {
        Request.remove({ _id: data._id }).exec();
        notifier.sendMessage(data.type, data.user.name, getRequestMsg(data, 'deleted'), 'green');
    },

    nudge: function (data) {
        Request.findById(data._id, function(err, request) {
            if (err) { throw err; }

            if (request) {
                updateRequest(data, request);
                saveRequest(request);

                notifier.sendMessage(request.type, data.user.name, getRequestMsg(data, 'NUDGED'), 'red');
            }
        });
    },

    update: function (data) {
        Request.findById(data._id, function(err, request) {
            if (err) { throw err; }

            updateRequest(data, request);
            saveRequest(request);
        });
    },

    release: function (data) {
        Request.findById(data._id, function(err, request) {
            if (err) { throw err; }

            var releaseMsg = prMessages.released(data);
            var reviewer = data.reviewer;
            data.reviewer = null;
            updateRequest(data, request);
            saveRequest(request);

            notifier.sendSlackPersonalMessage(data.user.email, reviewer.name, releaseMsg, 'orange');
        });
    },

    take: function (data) {
        Request.findById(data._id, function(err, request) {
            if (err) { throw err; }

            if (request && data.reviewer) {
                request.take(data.reviewer);
                saveRequest(request);

                // notifying user
                mailer.sendMail(data.user.email,
                                data.reviewer.name + ' has taken your request!',
                                'Hi <b>' + data.user.name + '</b>, <br/><br/><br/>' +
                                'Finally, <br/> <br/>' +
                                data.reviewer.name + ' has taken your request!<br/><br/>' +
                                'Request: <a href = "' + data.data.title  + '">' + data.data.title + '</a><br/><br/><br/><br/>' +
                                'Say Thanks :)');

                notifier.sendSlackPersonalMessage(data.user.email, data.reviewer.name, prMessages.taken(data), 'yellow');

                // notifying on global Slack channel
                notifier.sendMessage(request.type, data.reviewer.name, getRequestMsg(data, 'took'), 'yellow');
            }
        });
    },

    complete: function (data) {
        Request.findById(data._id, function(err, request) {
            if (err) { throw err; }

            request.complete(data.rejected, data.rejection_reasons);
            saveRequest(request);

            addReview(data);

            // notifying user
            mailer.sendMail(data.user.email,
                            data.reviewer.name + ' has reviewed your request!',
                            'Hi <b>' + data.user.name + '</b>, <br/><br/><br/>' +
                            'Finally, <br/> <br/>' +
                            data.reviewer.name + ' has taken your request!<br/><br/>' +
                            'Request: <a href = "' + data.data.title  + '">' + data.data.title + '</a><br/><br/><br/><br/>' +
                            'Say Thanks :)');
            
            if (data.rejected) {
                notifier.sendSlackPersonalMessage(data.user.email, data.reviewer.name, prMessages.rejected(data), 'red');
            } else {
                notifier.sendSlackPersonalMessage(data.user.email, data.reviewer.name, prMessages.approved(data), 'green');
            }

            // notifying on global Slack channel
            notifier.sendMessage(request.type, data.reviewer.name, getRequestMsg(data, 'reviewed') , 'green');
        });
    },

    reviews: function(req, res) {
        var queryParams = { review_type: req.params.type },
            query = Review.find(queryParams);

        query.sort('-count');

        if (req.query.count) {
            query.limit(parseInt(req.query.count));
        }

        query.exec(function(err, reviews) {
            if (!err) {
                res.json(reviews);
            } else { throw err; }
        });
    },

    reviewCount: function(req, res) {
        Review.findOne({'user.email': req.user.email, review_type: req.params.type}, function(err, review) {
            if (!err) {
                res.json(review ? review.count : 0);
            } else { throw err; }
        });
    },

    preChecks: function(url, callback) {
        github.performPreChecks(url, function(res) {
            callback(res);
        });
    }
}
