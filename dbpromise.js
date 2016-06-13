var pgp = require('pg-promise')();

const conString = process.env.STARSDBPOSTGRES || 'postgres://postgres:cloud9@localhost/oauth_test'; // make sure to match your own database's credentials
console.log(conString);
var db = pgp(conString);

module.exports = db;
