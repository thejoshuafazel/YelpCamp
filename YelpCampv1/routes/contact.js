//Acquire required modules
var express     = require("express"),
    router      = express.Router(),
    nodemailer  = require("nodemailer"),
    request     = require("request");

//Contact route
router.get("/", function(req, res) {
   res.render("contact/contact", {page: "contact"});
});

//Contact post route
router.post("/send", function(req, res) {
    const captcha = req.body["g-recaptcha-response"];
    if (!captcha) {
        req.flash("error", "Please select captcha");
        return res.redirect("back");
    }
    var secretKey = process.env.SECRET_KEY;
    var verifyURL = "https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${captcha}&remoteip=${req.connection.remoteAddress}";
    request.get(verifyURL, function(err, response, body) {
        if ((body.success !== undefined && !body.success)|| err) {
            req.flash("error", "Captcha Failed");
            return res.redirect("/contact");
        }
        var smtpTransport = nodemailer.createTransport({
            service: "Gmail",
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_PWD
            }
        });
         
        var mailOptions = {
            from: process.env.GMAIL_USER,
            to: process.env.GMAIL_USER,
            replyTo: req.body.email,
            subject: "YelpCamp contact request from: " + req.body.name,
            text: "You have received an email from... Name: "+ req.body.name + " Phone: " + req.body.phone + " Email: " + req.body.email + " Message: " + req.body.message,
            html: "<h3>You have received an email from...</h3><ul><li>Name: " + req.body.name + " </li><li>Phone: " + req.body.phone + " </li><li>Email: " + req.body.email + " </li></ul><p>Message: <br/><br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + req.body.message + "</p>"
        };
        
        smtpTransport.sendMail(mailOptions, function(err, info){
            if(err) {
                req.flash("error", "Something went wrong... Please try again later!");
                res.redirect("/contact");
            } else {
                req.flash("success", "Your email has been sent, we will get back to you.");
                res.redirect("/campgrounds");
            }
        });
    });
});

//Export the required model
module.exports = router;