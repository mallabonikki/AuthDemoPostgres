var express               = require("express"),
    mongoose              = require("mongoose"),
    passport              = require("passport"),
    bodyParser            = require("body-parser"),
    User                  = require("./models/user");
var dbBookshelf           = require("./models/model");
// Used to encrypt user password before adding it to db.
var bcrypt = require('bcrypt-nodejs');

// Bookshelf postgres db ORM object. Basically it makes
// it simple and less error port to insert/query the db.
var Model = require('./models/model.js');

// var dbPromise             = require("./dbpromise");

// (function testdb() {
// 	dbPromise.any('SELECT * FROM users', [])
// 		.then((rows) => {
// 			console.log(rows.length);
// 			console.log("sendAllData: " + JSON.stringify(rows));
// 		})
// 		.catch(err => {
// 			console.error('error happened during query: ', err);
// 			console.log('--------');
// 		});
// })();

mongoose.connect("mongodb://localhost/auth_demo_app");
var app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(require("express-session")({
    secret: "Rusty is the best and cutest dog in the world",
    resave: false,  // TODO: change to true (why?)
    saveUninitialized: false  // TODO: change to true (why?)
}));

require('./passportconfig.js')(passport);

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

    // Before making the account, try and fetch a username to see if it already exists.
    var usernamePromise = new Model.User({ username: user.username }).fetch();

    return usernamePromise.then(function(model) {
        if (model) {
            console.log("username already exists");
            res.render('register');
        } else {
            var password = user.password;
            var hash = bcrypt.hashSync(password);

            // Make a new postgres db row of the account
            var signUpUser = new Model.User({ username: user.username, password: hash });

            signUpUser.save({}, {method: 'insert'}).then(function(model) {
                // Sign in the newly registered uesr
                // res.redirect(307, '/login');

                // Another way:
                passport.authenticate("local")(req, res, function(){
                  res.redirect("/secret");
                });
            });
        }
    });
});


// app.post("/register", function(req, res){
//     User.register(new User({username: req.body.username}), req.body.password, function(err, user){
//         if(err){
//             console.log(err);
//             return res.render('register');
//         }
//         passport.authenticate("local")(req, res, function(){
//           res.redirect("/secret");
//         });
//     });
// });

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