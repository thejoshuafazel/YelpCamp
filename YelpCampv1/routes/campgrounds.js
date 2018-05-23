//Acquire required modules
var express     = require("express"),
    router      = express.Router(),
    Campground  = require("../models/campground"),
    middleware  = require("../middleware");

//Setup maps
var NodeGeocoder = require("node-geocoder");
var options = {
    provider: "google",
    httpAdapter: "https",
    apiKey: process.env.GEOCODER_API_KEY,
    formatter: null
};
var geocoder = NodeGeocoder(options);

//Setup mutler & cloudinary for image upload
var multer  = require('multer');
var storage = multer.diskStorage({
    filename: function(req, file, callback) {
        callback(null, Date.now() + file.originalname);
    }
});
var imageFilter = function (req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter});

var cloudinary = require('cloudinary');
cloudinary.config({ 
    cloud_name: '', 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
});


//Campground view get route
router.get("/",function(req,res){
    var noMatch = null;
    var perPage = 12;
    var pageQuery = parseInt(req.query.page);
    var pageNumber = pageQuery ? pageQuery : 1;
    if(req.query.search){
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        Campground.find({name:regex}).skip((perPage * pageNumber) - perPage).limit(perPage).exec(function (err, allCampgrounds) {
            if (err) {
                req.flash("error",err.message);
                return res.redirect("back");
            }
            Campground.count({name:regex}).exec(function (err, count) {
                if (err) {
                    req.flash("error",err.message);
                    res.redirect("back");
                } else {
                    if(allCampgrounds.length<1) {
                        noMatch = "No campgrounds match that query, please try again";
                    }
                    res.render("campgrounds/index", {
                        campgrounds: allCampgrounds,
                        current: pageNumber,
                        pages: Math.ceil(count / perPage),
                        page: "campgrounds",
                        noMatch:noMatch,
                        search: req.query.search
                    });
                }
            });
        });
        
    }
    else{
        Campground.find({}).skip((perPage * pageNumber) - perPage).limit(perPage).exec(function (err, allCampgrounds) {
            if (err) {
                req.flash("error",err.message);
                return res.redirect("back");
            }
            Campground.count().exec(function (err, count) {
                if (err) {
                    req.flash("error",err.message);
                    res.redirect("back");
                } else {
                    res.render("campgrounds/index", {
                        campgrounds: allCampgrounds,
                        current: pageNumber,
                        pages: Math.ceil(count / perPage),
                        page: "campgrounds",
                        noMatch: noMatch,
                        search: false
                    });
                }
            });
        });
    }
});


//Campground post route
router.post("/", middleware.isLoggedIn, upload.single("image"), function(req, res) {
    cloudinary.v2.uploader.upload(req.file.path, function(err,result) {
        if(err){
            req.flash("error","Couldnt Not Upload the image, try again.");
            return res.redirect("back");
        }
        geocoder.geocode(req.body.location, function (err, data) {
            if (err || !data.length) {
                req.flash("error", "Invalid Location");
                return res.redirect("back");
            }
            req.body.campground.image = result.secure_url;
            req.body.campground.imageId = result.public_id;
            req.body.campground.author = {
                id: req.user._id,
                username: req.user.username
            };
            req.body.campground.location = data[0].formattedAddress;
            req.body.campground.lat = data[0].latitude;
            req.body.campground.lng = data[0].longitude;
            Campground.create(req.body.campground, function(err, campground){
                if(err){
                    req.flash("error", err.message);
                    return res.redirect("back");
                }
                res.redirect("/campgrounds/" + campground.id);
            });
        });
    });
});

//New Campground get route
router.get("/new", middleware.isLoggedIn, function(req, res) {
    res.render("campgrounds/new");
});

//Campground get route
router.get("/:id",function(req, res) {
    Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
        if(err || !foundCampground){
            req.flash("error","Campground not found");
            res.redirect("back");
        }
        else{
            res.render("campgrounds/show",{campground:foundCampground});
        }
    });
});

//Campground edit route
router.get("/:id/edit", middleware.checkCampgroundOwnership, function(req, res) {
    Campground.findById(req.params.id, function(err, foundCampground){
        if(err){
            console.log(err);
        }
        else{
                res.render("campgrounds/edit",{campground: foundCampground});
        }
    });
});


//Update campground put route
router.put("/:id", middleware.checkCampgroundOwnership, upload.single("image"), function(req, res){
    geocoder.geocode(req.body.location, function (err, data) {
        if (err || !data.length) {
            req.flash("error", "Invalid address");
            return res.redirect("back");
        }
        Campground.findById(req.params.id, async function(err,campground){
            if(err){
                req.flash("error","Error Updating campground!");
                return res.render("/campgrounds");
            }
            else{
                if(req.file){
                    try {
                        await cloudinary.v2.uploader.destroy(campground.imageId);
                        var result =  await cloudinary.v2.uploader.upload(req.file.path);
                        campground.imageId = result.public_id;
                        campground.image = result.secure_url;
                    } catch(err) {
                        req.flash("error", err.message);
                        return res.redirect("back");
                    }
                }
                campground.lat = data[0].latitude;
                campground.lng = data[0].longitude;
                campground.location = data[0].formattedAddress;
                campground.name = req.body.name;
                campground.price = req.body.price;
                campground.desc = req.body.desc;
                campground.save();
                req.flash("success","Successfully Updated Campground!");
                res.redirect("/campgrounds/"+req.params.id);
            }
        });
    });
});

//Camground delete route
router.delete("/:id", middleware.checkCampgroundOwnership, function(req,res){
    Campground.findById(req.params.id, async function(err, campground){
        if(err){
            req.flash("error","Error Deleting Campground!");
            return res.redirect("/campgrounds");
        }
        else{
            try{
                await cloudinary.v2.uploader.destroy(campground.imageId);    
                campground.remove();
                req.flash("success","Campground Successfully Deleted!");
                res.redirect("/campgrounds");
            }catch (err){
                if(err){
                    req.flash("error",err.message);
                    return res.redirect("/campgrounds");
                }
            }
        }
    });
});

//Setup the regex for campground search
function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

//Export the required model
module.exports = router;