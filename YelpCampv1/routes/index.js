//Acquire required modules
var express     = require("express"),
    router      = express.Router(),
    passport    = require("passport"),
    User        = require("../models/user"),
    Campground  = require("../models/campground"),
    async       = require("async"),
    nodemailer  = require("nodemailer"),
    crypto      = require("crypto"),
    request     = require("request");

//Landing page route
router.get("/",function(req,res){
    res.render("landing");
});

//===========================
// USER AUTHENTICATION ROUTES
//===========================

//Register get route
router.get("/register",function(req, res) {
    res.render("register", {page: "register"});
});

//Register post route
router.post("/register", function(req, res) {
    const captcha = req.body["g-recaptcha-response"];
    if (!captcha) {
      console.log(req.body);
      req.flash("error", "Please select captcha");
      return res.redirect("/register");
    }
    var secretKey = process.env.SECRET_KEY;
    var verifyURL = 'https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${captcha}&remoteip=${req.connection.remoteAddress}';
    request.get(verifyURL, function(err, response, body){
        if ((body.success !== undefined && !body.success)||err) {
            req.flash("error", "Captcha Failed");
            return res.redirect("/register");
        }
        var newUser = new User({
            username: req.body.username,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            desc: req.body.desc,
            email: req.body.email
        });
        if (req.body.avatar.length > 0) {
            newUser.avatar = req.body.avatar;
        }
        if(req.body.adminCode==process.env.ADMIN_CODE){
            newUser.isAdmin = true;
        }
        User.register(newUser,req.body.password,function(err,user){
            if(err){
                return res.render("register", {"error": err.message});
            }
            passport.authenticate("local")(req, res, function(){
                req.flash("success","Welcome to YelpCamp, " + user.username);
                res.redirect("/campgrounds");
            });
        });
    });
});


//Login get route
router.get("/login", function(req,res){
    res.render("login", {page: "login"});
});

//Login post route
router.post("/login", passport.authenticate("local",
    {
        successRedirect: "/campgrounds",
        failureRedirect: "/login",
        failureFlash: "Invalid username or password",
        successFlash: "Welcome to YelpCamp!"
    }),function(req,res){
});

//User profile Route
router.get("/users/:id",function(req,res){
    User.findById(req.params.id, function(err,foundUser){
        if(err){
            req.flash("error","User Not Found");
            res.redirect("/");
        }
        Campground.find().where("author.id").equals(foundUser._id).exec(function(err,foundCampgrounds){
            if(err){
                req.flash("error","User Not Found");
                res.redirect("/");
            }
            res.render("users/show", {user: foundUser, campgrounds: foundCampgrounds});
        });
    });
});

//Logout route
router.get("/logout",function(req, res) {
    req.logout();
    req.flash("success","Logged you out");
    res.redirect("/campgrounds");
});

//Forgot password get route
router.get("/forgot", function(req, res) {
    res.render("forgot");
});

//Forgot password post route
router.post("/forgot", function(req, res, next) {
    async.waterfall([
        function(done) {
            crypto.randomBytes(20, function(err, buf) {
                var token = buf.toString('hex');
                done(err, token);
            });
        },
        function(token, done) {
            User.findOne({ email: req.body.email }, function(err, user) {
                if (!user || err) {
                    req.flash("error", "No account with that email address exists.");
                    return res.redirect("/forgot");
                }
                user.resetPasswordToken = token;
                user.resetPasswordExpires = Date.now() + 360000;
                user.save(function(err) {
                    done(err, token, user);
                });
            });
        },
        function(token, user, done) {
            var smtpTransport = nodemailer.createTransport({
                service: 'Gmail', 
                auth: {
                    user: process.env.GMAIL_USER,
                    pass: process.env.GMAIL_PWD
                }
            });
            var mailOptions = {
                to: user.email,
                from: process.env.GMAIL_USER,
                subject: 'YelpCamp Password Reset',
                text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
                      'Please click on the following link(Avaiable for the next 10 Minutes), or paste this into your browser to complete the process:\n\n' +
                      'http://' + req.headers.host + '/reset/' + token + '\n\n' +
                      'If you did not request this, please ignore this email and your password will remain unchanged.\n'
            };
            smtpTransport.sendMail(mailOptions, function(err) {
                req.flash("success", 'An e-mail has been sent to ' + user.email + ' with further instructions.');
                done(err, "done");
            });
        }
    ],function(err) {
        if (err) return next(err);
        res.redirect("/forgot");
    });
});

//Password reset get route
router.get("/reset/:token", function(req, res) {
    User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
        if (!user || err) {
            req.flash("error", "Password reset token is invalid or has expired");
            return res.redirect("/forgot");
        }
        res.render("reset", {token: req.params.token});
    });
});

//Password reset post route
router.post("/reset/:token", function(req, res) {
    async.waterfall([
        function(done) {
            User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
                if (!user||err) {
                    req.flash("error", "Password reset token is invalid or has expired");
                    return res.redirect("back");
                }
                if(req.body.password === req.body.confirm) {
                    user.setPassword(req.body.password, function(err) {
                        if(err){
                            req.flash("error","Password reset token is invalid or has expired");
                            return res.redirect("back");
                        }
                        user.resetPasswordToken = undefined;
                        user.resetPasswordExpires = undefined;
                        user.save(function(err) {
                            if(err)
                                req.flash("error","Something went out");
                            req.logIn(user, function(err) {
                                done(err, user);
                            });
                        });
                    });
                } else {
                    req.flash("error", "Passwords do not match.");
                    return res.redirect("back");
                }
            });
        },
        function(user, done) {
            var smtpTransport = nodemailer.createTransport({
                service: 'Gmail', 
                auth: {
                    user: process.end.GMAIL_USER,
                    pass: process.env.GMAILPW
                }
            });
            var mailOptions = {
                to: user.email,
                from: process.env.GMAIL_USER,
                subject: 'Your YelpCamp password has been changed',
                text: 'Hello,\n\n' +
                      'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
            };
            smtpTransport.sendMail(mailOptions, function(err) {
                req.flash("success", "Success! Your password has been changed");
                done(err);
            });
        }],
        function(err) {
            req.flash("error","Something went wrong");
            res.redirect("/campgrounds");
        });
});

//Export the required model
module.exports = router;