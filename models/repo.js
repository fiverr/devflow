var mongoose = require('mongoose');

var repoSchema = new mongoose.Schema({
    name: String,
    team_name: String,
    hipchat_group: String,
    slack_group: String
});

module.exports = mongoose.model('Repo', repoSchema, 'Repos');