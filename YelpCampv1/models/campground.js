//Acquire required modules
var mongoose = require("mongoose");

//Setup the Schema
var campgroundSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    price: {
        type: String,
        required: true
    },
    image: String,
    imageId: String,
    desc: String,
    createdAt: {
        type:Date,
        default: Date.now
    },
    author: {
        id:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    },
    location: String,
    lat: Number,
    lng: Number,
    comments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref:"Comment"
        }
    ]
});

//Export the required model
module.exports = mongoose.model("Campground",campgroundSchema);