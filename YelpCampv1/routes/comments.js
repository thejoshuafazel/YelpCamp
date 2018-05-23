//Acquire required modules
var express     = require("express"),
    router      = express.Router({mergeParams: true}),
    Campground  = require("../models/campground"),
    Comment     = require("../models/comment"),
    middleware  = require("../middleware");

//New Campground post route
router.post("/", middleware.isLoggedIn,function(req, res){
    Campground.findById(req.params.id,function(err, campground){
        if(err){
            req.flash("error",err.message);
            res.redirect("/campgrounds");
        }
        else{
            Comment.create(req.body.comment, function(err, comment){
                if(err){
                    req.flash("error","Something went wrong... try again later");
                    res.redirect("back");
                }
                else{
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    comment.save();
                    campground.comments.push(comment);
                    campground.save();
                    req.flash("success","Successfully Added Comment");
                    res.redirect("/campgrounds/" + campground._id);
                }
            });
        }
    });
});

//Update campground route
router.put("/:comment_id", middleware.checkCommentOwnership, function(req, res){
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComments){
        if(err){
            req.flash("error",err.message);
            res.redirect("back");
        }
        else{
            req.flash("error","Comment Updated");
            res.redirect("/campgrounds/"+req.params.id);
        }
    });
});

//Delete campground route
router.delete("/:comment_id", middleware.checkCommentOwnership, function(req, res){
    Comment.findByIdAndRemove(req.params.comment_id, function(err){
        if(err){
            req.flash("error",err.message);
            res.redirect("back");
        }
        else{
            req.flash("success","Comment Deleted");
            res.redirect("/campgrounds/"+req.params.id);
        }
    });
});

//Export the required model
module.exports = router;