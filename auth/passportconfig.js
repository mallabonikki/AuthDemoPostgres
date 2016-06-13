'use strict';
var LocalStrategy   = require('passport-local').Strategy,
    User            = require('../models/model');

module.exports = function(passport) {
    // See the answers here:
    // http://stackoverflow.com/questions/27637609/understanding-passport-serialize-deserialize

    // Given the "user" information, this function determines what information
    // can be stored in the session in the headers of HTTP communication.
    // The result of this done() is stored in the session of HTTP
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // If we get a session in the header of HTTP communication and we find
    // some "id" there, this function helps us match this "id" to the "user" information.
    // The result of this done() is stored as req.user
    passport.deserializeUser(function(id, done) {
        User.grabUserCredentials(id)
            .then(user => done(null, user))
            .catch(err => done(err, null));
    });

    // Tries to log-in. This function is used to check if user exists in database and if
    // correct password was provided.
    passport.use(new LocalStrategy(function(username, password, done) {
        User.logIn(username, password)
            .then(function(user){
                return done(null, user);
            })
            .catch(function(err){
                return done(null, false, { message: err });
            });
    }));
};
