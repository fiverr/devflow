var basicController = require('./basicController'),
    tag             = require('../models/tag');

module.exports = new basicController(tag, false, 'tags');