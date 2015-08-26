var mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
    id : String,
    email : String,
    name : String,
    image : String,
    associated: Boolean,
    role: String
});

userSchema.methods.isManagingUser = function() {
	return (this.role == 'admin' || this.role == 'devops');
}

module.exports = mongoose.model('User', userSchema, 'Users');
