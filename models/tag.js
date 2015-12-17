var mongoose = require('mongoose');

var tagSchema = new mongoose.Schema({
    name: String,
    owner: String
});

module.exports = mongoose.model('Tag', tagSchema, 'Tags');