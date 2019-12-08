const models = require("../../models.js");
const { getToken, getTokenIsAdmin, createId } = require("../../common.js");

module.exports = (req, res) => {
    var adminToken = "";
    var user = "";
    var passHash = "";
    // TODO:
    var userRole = "";
    try {
        adminToken = req.body.token;
        user = req.body.name;
        passHash = req.body.pass;
    }catch(e){
        res.send({status: "error", error: "invalid request"});
        return;
    }

    getTokenIsAdmin(adminToken)
        .then(adminName => {
            var newUser = models.user({
                name: user,
                password: createId(passHash),
                // TODO:
                role: "user"
            })
            newUser.save((err, doc) => {
                if(err || doc == null) {
                    res.send({status: "error", error: "critical: " + err});
                    return;
                }
                res.send({status: "success"});
            })
        })
        .catch(err => {
            res.send({status: "error", error: "not an admin"});
        })
}