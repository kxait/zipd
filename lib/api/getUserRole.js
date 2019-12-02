const models = require('../models.js');
const { getToken } = require("../common.js");

module.exports = (req, res) => {
    var user = {};
    var token = "";
    try {
        user = req.query.user;
        token = req.query.token
    }catch(e){
        res.send({status: "error", error: "invalid request"});
        return;
    }

    getToken(token)
        .then(localUser => {
            models.user.findOne({name: user || localUser}, (err, doc) => {
                if(err || doc == null) {
                    res.send({status: "error", error: "user not found"});
                    return;
                }
                if(doc.role) {
                    res.send({status: "success", name: doc.name, role: doc.role});
                    return;
                }
            });
        }).catch(err => {
            res.send({status: "error", error: "invalid token"});
        })
}