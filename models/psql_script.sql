drop database if exists oauth_test;

create database oauth_test;

\connect oauth_test;

DROP TABLE IF EXISTS users;

CREATE TABLE IF NOT EXISTS users (
    id              SERIAL,
    username        VARCHAR(100),
    password        VARCHAR(100),
    PRIMARY KEY (id)
);

