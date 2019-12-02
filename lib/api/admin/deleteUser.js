const models = require("../../models.js");
const { getTokenIsAdmin } = require("../../common.js");

module.exports = (req, res) => {
    var adminToken = "";
    var user = "";
    try {
        adminToken = req.query.token;
        user = req.query.name;
    }catch(e){
        res.send({status: "error", error: "invalid request"});
        return;
    }

    getTokenIsAdmin(adminToken)
        .then(adminName => {
            models.token.deleteMany({name: user}, (err) => {
                if(err) {
                    res.send({status: "error", error: "wtf"});
                    return;
                }
            })
            models.user.findOneAndDelete({name: user}, (err, doc) => {
                if(err || doc == null) {
                    res.send({status: "error", error: "couldn't delete"});
                    return;
                }
                res.send({status: "success"});
            })
        })
        .catch(err => {
            res.send({status: "error", error: "not an admin"});
        })
}