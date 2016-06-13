var knex = require('knex')({
    client: 'postgres',
    // Uncomment to enable SQL query logging in console.
    // debug   : true,
    connection: {
        host    : '127.0.0.1',
        user    : 'postgres',
        password: 'cloud9',
        database: 'oauth_test',
        charset : 'utf8',
    }
});

var bookshelf = require('bookshelf')(knex);
bookshelf.plugin('registry'); // Resolve circular dependencies with relations

module.exports = bookshelf;
