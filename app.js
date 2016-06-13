var express     = require("express"),
    passport    = require("passport"),
    bodyParser  = require("body-parser");
var Model       = require('./models/model');

var app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(require("express-session")({
    secret: "Rusty is the best and cutest dog in the world",
    resave: false,  // TODO: change to true (why?)
    saveUninitialized: false  // TODO: change to true (why?)
}));

require('./auth/passportconfig.js')(passport);
app.use(passport.initialize());
app.use(passport.session());

//============
// ROUTES
//============

app.get("/", function(req, res){
    res.render("home");
});

app.get("/secret",isLoggedIn, function(req, res){
   res.render("secret");
});

// Auth Routes

//show sign up form
app.get("/register", function(req, res){
  res.render("register");
});

//handling user sign up
app.post("/register", function(req, res){
    // Here, req.body is { username, password }
    var user = req.body;
    Model.registerNewUser(user.username, user.password)
        .then(function(registeredUser){
            // Sign in the newly registered uesr
            // res.redirect(307, '/login');

            // Another way:
            passport.authenticate("local")(req, res, function(){
              res.redirect("/secret");
            });
        })
        .catch(function(err){
            console.log(err);
            res.render('register');
        });
});

// LOGIN ROUTES
//render login form
app.get("/login", function(req, res){
   res.render("login");
});
//login logic
//middleware
app.post("/login", passport.authenticate("local", {
    successRedirect: "/secret",
    failureRedirect: "/login"
}) ,function(req, res){
});

app.get("/logout", function(req, res){
    req.logout();
    res.redirect("/");
});


function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}


app.listen(process.env.PORT, process.env.IP, function(){
    console.log("server started.......");
})