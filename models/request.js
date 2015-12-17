var mongoose = require('mongoose');

var requestSchema = new mongoose.Schema({
    type: String,
    urgency: String,
    state: String,
    sort_order: {type: Number, default: 1},
    data: { title : String, desc : String, sub_type: String },
    user: { email : String, name : String, image : String },
    reviewer: { email : String, name : String, image : String },
    created_date: Date,
    taken_date: Date,
    reviewed_date: Date,
    rejected: Boolean,
    rejection_reasons: [String],
    tag: { name: String, owner: String }
});

requestSchema.methods.take = function(user) {
    this.reviewer = user;
    this.taken_date = new Date();
    this.state = 'taken';
    this.sort_order = 2;
}

requestSchema.methods.complete = function(rejected, rejection_reasons) {
    this.reviewed_date = new Date();
    this.state = 'reviewed';
    this.sort_order = 3;
    this.rejected = rejected;
    this.rejection_reasons = rejection_reasons;
}

module.exports = mongoose.model('Request', requestSchema, 'Requests');
