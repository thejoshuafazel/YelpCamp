//Acquire required modules
var express         = require("express"),
    app             = express(),
    bodyparser      = require("body-parser"),
    mongoose        = require("mongoose"),
    passport        = require("passport"),
    LocalStrategy   = require("passport-local"),
    methodOverride  = require("method-override"),
    User            = require("./models/user"),
    flash           = require("connect-flash");

//Acquire the required Routes
var commentRoutes = require("./routes/comments");
var campgroundRoutes = require("./routes/campgrounds");
var indexRoutes = require("./routes/index");
var contactRoutes = require("./routes/contact");

//Connect to the database
var url = process.env.DATABASE || "mongodb://localhost/yelp_camp";
mongoose.connect(url);

//Setup the required modules
app.use(bodyparser.urlencoded({extended:true}));
app.set("view engine","ejs");
app.use(express.static(__dirname+"/public"));
app.use(methodOverride("_method"));
app.use(flash());
app.locals.moment = require('moment');

//Configure Passport
app.use(require("express-session")({
    secret: "EnterSecretHere",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//Setup Flash Messages
app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});

//Routes
app.use(indexRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);
app.use("/contact", contactRoutes);

//Setup listening port and IP address
app.listen(process.env.PORT,process.env.IP,function(){
    console.log("Server Started"); 
});