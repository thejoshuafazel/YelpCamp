//Acquire required modules
var mongoose                = require("mongoose"),
    passportLocalMongoose   = require("passport-local-mongoose");

//Setup the Schema
var UserSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: true,
        required: true
    },
    password: String,
    avatar: {
        type: String,
        default: "/images/defaultpp.jpg"
    },
    desc: String,
    firstName: String,
    lastName: String,
    email: {
        type: String,
        unique: true,
        required: true
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    isAdmin: {
        type: Boolean,
        default: false
    }
});

//Add passport-local-mongoose for the UserSchema
UserSchema.plugin(passportLocalMongoose);

//Export the required model
module.exports = mongoose.model("User",UserSchema);