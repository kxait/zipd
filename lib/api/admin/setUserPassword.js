const models = require('../../models.js');
const { getTokenIsAdmin } = require('../../common.js');

module.exports = (req, res) => {
    var token, user, newPass = "";
    try {
        token = req.body.token;
        user = req.body.name;
        newPass = req.body.password;
    }catch(e){
        res.send({status: "error", error: "invalid request"});
        return;
    }
    
    getTokenIsAdmin(token)
        .then(adminUser => {
            models.user.findOne({name: user}, (err, doc) => {
                if(err || doc == null) {
                    res.send({status: "error", error: "invaid request!"});
                    return;
                }
                models.user.findByIdAndUpdate(doc._id, {password: newPass}, (err, doc) => {
                    if(err || doc == null) {
                        res.send({status: "error", error: "couldn't update password"});
                        return;
                    }
                    models.token.deleteMany({name: user}, (err) => {
                        if(err)
                            res.send({status: "error", error: "couldn't delete tokens"})
                        else
                            res.send({status: "success"});
                    })
                })

            })
        })
        .catch(err => {
            res.send({status: "error", error: "not an admin"});
        })
}