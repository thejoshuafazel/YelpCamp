# YelpCamp
YelpCamp is a website aimed to help campers find campgrounds. It is a dynamic site, so it grows with the community.
Cant find a campground? Add it yourself. Liked a campground? Leave a review!
## Getting Started
Since this is primarily based on a Node.js we''ll need a *Node.js* server. we can set one up locally or find an online IDE (like Cloud9).
Before running it we need to set up a few things.

#### Setting up the database
Since this project uses *MongoDB* for storing data we have to set it up first. Again, the installation depends on the server we are running (locally or online). Local installation is straightforward but online installation depends on the IDE you are using.

#### Setting up the environment variables
##### Some Prerequisites
* Gmail Account/ Email Account
* Cloudinary Account

These usually contain sensitive data and must not be hardcoded. Read more about environment variables in Node.js [here](https://medium.com/@maxbeatty/environment-variables-in-node-js-28e951631801).
We need to set up the following environment variables
* DATABASE - The URL to your mongoose database
* CLOUDINARY_API_KEY - API for [cloudinary](http://cloudinary.com) a service which will allow us to upload pictures
* CLOUDINARY_API_SECRET - Secret key for the cloudinary service
* SECRET_KEY - Google ReCaptcha secret key
* GMAIL_USER - Your Gmail email address
* GMAIL_PWD - Your Gmail password
* ADMIN_CODE - Anything you want (Used to give admin priviledges to user signing up)
* GEOCODER_API_KEY - API Key for the Google Maps

The database URL might be a local one (which is already configured by default). After signing up on cloudinary, get the API and API_SECRET Key from the console. After logging into your gmail account get the *reCAPTCHA* secret key from [here](https://www.google.com/recaptcha/admin). Set up your gmail email and password. You can also change the mailservice by changing the service field in the contact.js (line 27). Sign up for google maps API and use the geocoder API key you get.

#### Set up URLs
Some of the urls have to be configured. I have tried to include the approximate line numbers for you to modify.

| Filename      | Line Number   | URL                  |
| ------------- |:-------------:| --------------------:|
| app.js        | Line 32       | SecretKey            |
| register.ejs  | Line 11       | Site Logo            |
| register.ejs  | Line 31       | Captcha Site Key     |
| login.ejs     | Line 11       | Site Logo            |
| landing.ejs   | Line 6        | Favicon              |
| header.ejs    | Line 6        | Favicon              |
| header.ejs    | Line 16       | Navbar Logo          |
| contact.ejs   | Line 18       | Captcha Site Key     |
| show.ejs      | Line 143      | Google Maps API Key  |
| campground.ejs| Line 34       | Cloudinary Workspace |


#### Running the Application
After completing the steps above to set up the environment, download the files and uploading it on your server you can run it using the command below (be sure to navigate into your project directory)
```
node app.js
```


## Deployment
Firstly we need to set up a server which supports Node.js (like [heroku](https://heroku.com)). Push all the files to the server.
Then we need to set up a MongoDB database, you can use another online service (like [mlab](https://mlab.com)).
Get the online database URL and update the environment variables as required.
[A live example here](https://projectyelpcamp.herokuapp.com)
* Note: Google Maps might not work in the example site because of the way Google Maps API works now.

## Built With
* MEN stack
* Bootstrap 4 - frontend framework

## Authors
* Joshua Fazel

## Acknowledgment
This is a udemy course project by Colt which was improved upon by others (with a touch of my own).
* Colt Steele
* Ian Schoonover
* Zarko
* Darrell
