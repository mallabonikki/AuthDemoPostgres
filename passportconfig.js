var LocalStrategy    = require('passport-local').Strategy,
    Model            = require('./models/model');

module.exports = function(passport) {
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function(id, done) {
        Model.grabUserCredentials(id, function(err, user) {
            done(err, user);
        });
    });

    passport.use(new LocalStrategy(function(username, password, done) {
        Model.logIn(username, password)
            .then(function(user){
                return done(null, user);
            })
            .catch(function(err){
                return done(null, false, { message: err });
            });
    }));

};
