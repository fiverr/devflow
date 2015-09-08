var Repo = require('../models/repo');

function updateRepo(data, repo) {
    for (var key in data) {
        repo[key] = data[key];
    }
}

function saveRepo(repo) {
    repo.save(function (err) {
        if (err)  {
            throw err;
        }
    });
}


module.exports = {

    getAllRepos: function(req, res) {
        if (req.user.isManagingUser()) {

            Repo.find({}, function(err, repos) {
                res.json(repos);
            });
        }
    },

    saveAllRepos: function(req, res) {

        if (req.user.isManagingUser()) {

            Repo.find({}, function(err, repos) {

                // run on all repos in request and search in db repos
                for (var repoIndex = 0; repoIndex < req.body.repos.length; repoIndex++) {

                    var repo = null;

                    for (var i = 0; i < repos.length; i++) {
                        if (req.body.repos[repoIndex]._id == repos[i]._id) {
                            repo = repos[i];
                            break;
                        }
                    }

                    if (!repo) {
                        repo = new Repo();
                    }

                    updateRepo(req.body.repos[repoIndex], repo);
                    saveRepo(repo);
                }

                // run on all repos in db and check if they need to be deleted
                for (var repoIndex = 0; repoIndex < repos.length; repoIndex++) {
                    var repo = null;

                    for (var i = 0; i < req.body.repos.length; i++) {
                        if (repos[repoIndex]._id == req.body.repos[i]._id) {
                            repo = repos[repoIndex];
                            break;
                        }
                    }

                    if (!repo) {
                        repos[repoIndex].remove();
                    }
                }

                res.json({status: 'success'});
            });
        }
    }

};