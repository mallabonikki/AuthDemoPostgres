var LocalStrategy    = require('passport-local').Strategy,
    Model            = require('../models/model');

module.exports = function(passport) {

    // The result of this done() is stored in the session of HTTP
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // The result of this done() is stored as req.user
    passport.deserializeUser(function(id, done) {
        Model.grabUserCredentials(id, function(err, user) {
            done(err, user);
        });
    });

    // Tries to log-in
    passport.use(new LocalStrategy(function(username, password, done) {
        Model.User.logIn(username, password)
            .then(function(user){
                return done(null, user);
            })
            .catch(function(err){
                return done(null, false, { message: err });
            });
    }));

};
