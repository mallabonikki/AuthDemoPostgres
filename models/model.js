// Bookshelf postgres db ORM object. Basically it makes
// it simple and less error port to insert/query the db.
var dbBookshelf = require('../dbknex').DB,
    knex = dbBookshelf.knex;
// Used to encrypt user password before adding it to db.
var bcrypt = require('bcrypt');

var User = dbBookshelf.Model.extend({
    tableName: 'users',
    idAttribute: 'id'
});

// ------------------------------
// createNewUser
// ------------------------------
function registerNewUser(username, password) {
    return new Promise(function(resolve, reject){
        // Before making the account, try and fetch a username to see if it already exists.
        var usernamePromise = new User({ username: username }).fetch();

        usernamePromise.then(function(model) {
            if (model) {
                reject("username already exists");
            } else {
                //var salt = bcrypt.genSaltSync(10);
                var hash = bcrypt.hashSync(password, 10);

                // Make a new postgres db row of the account
                var signUpUser = new User({ username: username, password: hash });

                signUpUser
                    .save({}, {method: 'insert'})
                    .then(function(model) {
                        resolve(model.toJSON());
                    });
            }
        });
    });
}

function logIn(username, password) {
    return new Promise(function(resolve, reject){
        new User({username: username}).fetch().then(function(data) {
            var user = data;
            if (user === null) {
                reject('Invalid username or password');
            } else {
                user = data.toJSON();
                if (!bcrypt.compareSync(password, user.password)) {
                    reject('Invalid password');
                } else {
                    resolve(user);
                }
            }
        });
    });
}


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
    registerNewUser     : registerNewUser,
    grabUserCredentials : grabUserCredentials,
    logIn               : logIn,
    User                : User,
};
