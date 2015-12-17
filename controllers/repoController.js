var basicController = require('./basicController'),
    repo            = require('../models/repo');

module.exports = new basicController(repo, true, 'repos');