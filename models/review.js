var mongoose = require('mongoose');

var reviewSchema = new mongoose.Schema({
    user: { email : String, name : String, image : String },
    review_type: String,
    count: {type: Number, default: 0},
    weekly_data: [{from: Date, to: Date, count: Number}]
});

module.exports = mongoose.model('Review', reviewSchema, 'Reviews');

