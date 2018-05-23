//Acquire required modules and initialize a middleware object
var Campground      = require("../models/campground"),
    Comment         = require("../models/comment"),
    middlewareObj   = {};

//Check Campground Ownership
middlewareObj.checkCampgroundOwnership = function(req, res, next) {
    if(req.isAuthenticated()){
        Campground.findById(req.params.id, function(err, foundCampground){
            if(err || !foundCampground){
                req.flash("error","Campground not found");
                res.redirect("back");
            }
            else{
                if(foundCampground.author.id.equals(req.user._id) || req.user.isAdmin){
                    next();
                }
                else{
                    req.flash("error","You dont have permission to do that");
                    res.redirect("back");
                }
            }
        });
    }
    else{
        req.flash("error","Please Log In First");
        res.redirect("back");
    }
}

//Check Comment Ownership
middlewareObj.checkCommentOwnership = function(req, res, next)
{
    if(req.isAuthenticated()){
        Comment.findById(req.params.comment_id, function(err, foundComment){
            if(err || !foundComment){
                req.flash("error","Comment not found");
                res.redirect("back");
            }
            else{
                if(foundComment.author.id.equals(req.user._id) || req.user.isAdmin){
                    next();
                }
                else{
                    req.flash("error","You dont have permission to do that");
                    res.redirect("back");
                }
            }
        });
    }
    else{
        req.flash("error","Please Log In First");
        res.redirect("back");
    }
}

//Check if user is logged in
middlewareObj.isLoggedIn = function(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error","Please Log In First");
    res.redirect("/login");
}

//Export the required object
module.exports = middlewareObj;