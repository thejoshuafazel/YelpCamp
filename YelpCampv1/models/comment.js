//Acquire required modules
var mongoose = require("mongoose");

//Setup the Schema
var commentSchema = mongoose.Schema({
    text: {
        type: String,
        required: true
    },
    createdAt: {
        type:Date,
        default: Date.now
    },
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    }
});

//Export the required model
module.exports = mongoose.model("Comment", commentSchema);