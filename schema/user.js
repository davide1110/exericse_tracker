const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const User = new Schema({
    username: String
});
exports.User =  mongoose.model('User', User);

//exports.User = mongoose.model("User");