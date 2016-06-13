# The simplest example with Postgres + Passport + LocalStrategy + bookshelf

This is an example of how to use Passport authentication with Postgres. I tried to keep things as simple as possible and as modular as possible. If you look in the initial commits, you will see how this application was migrated from MongoDb to Postgres.

## Introduction

The application has four registration routes and a secret route:
* GET **/**
* GET **/register**
* POST **/register** - this is where a new user is created.
* GET **/login**
* POST **/login**
* GET **/logout**
* GET **/secret** - accessible only if the user is logged. Otherwise the user will be redirected to the login page.

## Folders

* **db** has the database configuration using _knex_ and _bookshelf_ libraries. This defines only the connection and nothing else.
* **models** uses _bookshelf_ to define the _User_ model. The model has all queries inside it. Other modules do not need to write any queries to database.
* **auth** configures the _passport_ module. It uses the _User_ module to retrieve information about users. I added extensive comments about each function.
* **app.js** contains routes. Only the POST **/register** route tempers with the _User_ model. No route does any direct query to the database.
* **views** has ejs files as usually.

## Set up

1. Git clone
2. Make sure you have postgres set up with user `postgres` with password `postgres`. So create the user with that password. To use another user, change the knex connection config in the code.
3. `postgres` user should have createdb priviledges. To do so: `ALTER USER postgres createdb` in psql.
4. Run the `models/psql_script.sql` script into postgres. Try using
    `psql -U postgres -a -f models/psql_script.sql`.
5. Download all dependencies using `npm install`
6. Run the application using `npm start`

## Thanks
Special thanks to this repository: https://github.com/keithyong/postgres-oauth-example
