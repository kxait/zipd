const models = require("../../models.js");
const { getToken, getTokenIsAdmin } = require("../../common.js");

module.exports = (req, res) => {
    var token = "";
    try {
        token = req.query.token
    }catch(e){
        res.send({status: "error", error: "invalid request"});
        return;
    }

    getTokenIsAdmin(token)
        .then(adminName => {
            models.token.find({}, (err, docs) => {
                if(err || docs == null) {
                    res.send({status: "error", error: "something happened"});
                    return;
                }
                res.send({status: "success", tokens: docs});
            });
        })
        .catch(err => {
            res.send({status: "error", error: "invalid token"});
        })
}