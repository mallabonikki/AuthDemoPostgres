'use strict';

// Used to encrypt user password before adding it to db.
var bcrypt = require('bcrypt');

// Bookshelf postgres db ORM object. Basically it makes
// it simple and less error port to insert/query the db.
var dbBookshelf = require('../db'),
    knex = dbBookshelf.knex;

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

            usernamePromise.then(function(model) {
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
            });
        });
    }
});

// ------------------------------
// createNewUser
// ------------------------------



// ------------------------------
// grabUserCredentials
// ------------------------------
// Returns a JSON list of a single user like this:
// {
//     local: {
//          username: 'sampleun'
//          password: 'samplepw'
//     },
// }
function grabUserCredentials(userId, callback) {
    // Skeleton JSON
    var loginUser = {
        local: {
            username: null,
            password: null,
        }
    };

    // SQL joins to get all credentials/tokens of a single user
    // to fill in loginUser JSON.
    knex.select('users.id', 'users.username', 'users.password')
                .from('users')
                .where('users.id', '=', userId).then(function(row) {
        row = row[0];

        if (!row) {
            callback('Could not find user with that ID', null);
        } else {
            // Fill in loginUser JSON
            loginUser.local.username      = row.username;
            loginUser.local.password      = row.password;

            callback(null, loginUser);
        }
    });
}

// (function testdb() {
//     knex.select('users.id', 'users.username', 'users.password')
//                 .from('users')
//                 .then(function(row) {
//         console.log("Knex results: ");
//         console.log(JSON.stringify(row));
//         console.log('--------');
//     });
// })();

module.exports = {
    grabUserCredentials : grabUserCredentials,
    User                : User,
};
