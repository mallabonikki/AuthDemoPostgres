'use strict';

// Used to encrypt user password before adding it to db.
var bcrypt = require('bcrypt');

// Bookshelf postgres db ORM object. Basically it makes
// it simple and less error port to insert/query the db.
var dbBookshelf = require('../db');

// var User = dbBookshelf.model('User', {
var User = dbBookshelf.Model.extend({
    tableName: 'users',
    idAttribute: 'id'
},{
    registerNewUser: function(username, password) {
        var that = this;
        return new Promise(function(resolve, reject){
            // Before making the account, try and fetch a username to see if it already exists.
            var usernamePromise = new that({ username: username }).fetch();

            usernamePromise
            .then(function(model) {
                if (model) {
                    reject("username already exists");
                } else {
                    //var salt = bcrypt.genSaltSync(10);
                    var hash = bcrypt.hashSync(password, 10);

                    // Make a new postgres db row of the account
                    var signUpUser = new that({ username: username, password: hash });

                    signUpUser
                        .save({}, {method: 'insert'})
                        .then(function(model) {
                            console.log('Registered new user: ' + JSON.stringify(model));
                            resolve(model.toJSON());
                        });
                }
            })
            .catch((err) => {
                console.log("Error during register: " + err);
                reject(err);
            });
        });
    },

    logIn: function(username, password) {
        var that = this;
        return new Promise(function(resolve, reject){
            new that({username: username})
            .fetch()
            .then(function(data) {
                console.log('Logged in user: ' + JSON.stringify(data));
                if (data === null) {
                    reject('Invalid username or password');
                } else {
                    // console.log(data.get('password'));
                    var user = data.toJSON();
                    // console.log(user.password);
                    if (!bcrypt.compareSync(password, user.password)) {
                        reject('Invalid password');
                    } else {
                        resolve(user);
                    }
                }
            })
            .catch((err) => {
                console.log("Error during login: " + err);
                reject(err);
            });
        });
    },

    // ------------------------------
    // grabUserCredentials
    // ------------------------------
    // Returns a JSON list of a single user like this:
    // {
    //     username: 'sampleun',
    //     local: {
    //          username: 'sampleun'
    //          password: 'samplepw'
    //     },
    // }
    grabUserCredentials: function(userId) {
        // Skeleton JSON
        var loginUser = {
            username: null,
            local: {
                username: null,
                password: null,
            }
        };

        var that = this;
        return new Promise(function(resolve, reject){
            new that({id: userId})
            .fetch()
            .then(function(data) {

                if (!data) {
                    reject('Could not find user with that ID');
                } else {
                    // Fill in loginUser JSON
                    console.log("Found user: " + JSON.stringify(data));
                    let row = data.toJSON();
                    loginUser.username = row.username;
                    loginUser.local = data.toJSON();
                    resolve(loginUser);
                }
            })
            .catch((err) => {
                console.log("Error during grabUserCredentials: " + err);
                reject(err);
            });
        });
    }
});


(function testdb() {
    User.collection()
    .fetch()
    .then(function(collection) {
        console.log("Select all: " + collection.length + " entries.");
        console.log(collection.toJSON());
    })
    .catch(function(err) {
        console.log("Error during select all: " + err);
    });
})();

module.exports = User;
