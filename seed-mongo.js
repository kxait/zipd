const models = require('./lib/models.js');
const mongo = require('mongoose');
const md5 = require("blueimp-md5");
const { createId } = require("./lib/common.js");

const connStr = process.env.mongo
if(!connStr){
    console.error("set environment variable mongo to connect");
    process.exit(-1);
}

mongo.connect(connStr, {useNewUrlParser: true, useUnifiedTopology: true});
mongo.connection.once("error", e => {
    console.error("couldnt connect to mongo with url " + connStr, e);
    process.exit(-2);
});
mongo.connection.once("open", () => {
    console.log("connected to mongoDB, adding new user with credentials admin:admin to admins list");
    models.user.insertMany([{name: "admin", pass: createId("admin"), role: "admin"}], (err, doc) => {
        if(err || doc == null) {
            console.error("couldn't add new user");
            exit(-2);
        }
        console.log("added new user, exiting");
        exit(0);
    });
    
})