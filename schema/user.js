const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const User = new Schema({
    username: String,
    log: [{
        description:String,
        duration: Number,
        date: String
    }]
});
exports.User =  mongoose.model('User', User);

//exports.User = mongoose.model("User");