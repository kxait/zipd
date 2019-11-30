const mongoose = require('mongoose');
const models = require("./models.js");

module.exports = (token) => new Promise((resolve, reject) => {
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
            console.error("critical in getToken");
            reject(err);
        })
});