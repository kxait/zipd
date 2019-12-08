const mongoose = require('mongoose');
const models = require("./models.js");
const bcrypt = require("bcryptjs");
const md5 = require('blueimp-md5');

var createId = (id) => {
    return bcrypt.hashSync(id, 8);
}

var createIdMd5 = (id) => {
    return md5(createId(id));
}
/*
var getToken = (token) => new Promise((resolve, reject) => {
    models.token.findById(token)
        .then((doc, err) => {
            if(err || doc == null) {
                reject(0);
            }
            var now = new Date().getTime();
            var until = new Date(doc.until).getTime();
            if(now < until)
                resolve(doc.name);
            else
                reject(1);
        })
        .catch(err => {
            console.error("critical in getToken: " + err);
            reject(err);
        })
});
*/

var getToken = (token) => new Promise((resolve, reject) => {
    models.token.findOne({secuId: token})
        .then((doc, err) => {
            if(err || doc == null) {
                reject(0);
            }
            console.log("found secuId token for user " + doc.name);
            var now = new Date().getTime();
            var until = new Date(doc.until).getTime();
            if(now < until)
                resolve(doc.name);
            else
                reject(1);
        })
        .catch(err => {
            console.error("critical in getToken: " + err);
            reject(err);
        })
});

var getTokenIsAdmin = (token) => new Promise((resolve, reject) => {
    getToken(token)
        .then(user => {
            if(user == null) {
                reject(4)
                return;
            }
            models.user.findOne({name: user}, (err, doc) => {
                if(err || doc == null) {
                    reject(5);
                    return;
                }
                if(doc.role == "admin") {
                    resolve(user);
                    return;
                }
            })
        })
        .catch(err => {
            console.error("critical in getTokenIsAdmin: " + err);
            reject(err);
        })
})

module.exports = {
    getToken: getToken,
    getTokenIsAdmin: getTokenIsAdmin,
    createId: createId,
    createIdMd5: createIdMd5
}