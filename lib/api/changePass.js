const models = require('../models.js');
const { getToken } = require('../common.js');

module.exports = (req, res) => {
    var token, oldPass, newPass = "";
    try {
        token = req.body.token;
        oldPass = req.body.old;
        newPass = req.body.new;
    }catch(e){
        res.send({status: "error", error: "invalid request"});
        return;
    }
    
    getToken(token)
        .then(user => {
            models.user.findOne({name: user}, (err, doc) => {
                if(err || doc == null) {
                    res.send({status: "error", error: "invaid request!"});
                    return;
                }
                if(doc.password != oldPass){
                    res.send({status: "error", error: "invalid password"});
                    return;
                }
                models.user.findByIdAndUpdate(doc._id, {password: newPass}, (err, doc) => {
                    if(err || doc == null) {
                        res.send({status: "error", error: "couldn't update password"});
                        return;
                    }
                    res.send({status: "success"});
                })

            })
        })
        .catch(err => {
            res.send({status: "error", error: err});
        })
}