const models = require("../../models.js");
const { getTokenIsAdmin } = require("../../common.js");

module.exports = (_attach) => (req, res) => {
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
            models.file.find({username: user}, (err, docs) => {
                if(err || docs == null || docs.length == 0) {
                    res.send({status: "error", error: "couldn't find user docs"});
                    return;
                }
                for(i in docs) {
                    var gridId = docs[i].content;
                    _attach.unlink({_id: gridId}, (err, doc) => {
                        if(err || doc == null) {
                            res.write({status: "error", error: "couldn't delete file #" + i});
                            return;
                        }
                    })
                    models.file.findByIdAndDelete(docs[i].id, (err, deleted) => {
                        if(err || deleted == null) {
                            res.write({status: "error", error: "couldn't delete file index " + docs[i].name});
                            return;
                        }
                    })
                }
                res.send({status: "success", filesDeleted: docs.length});
            })
        })
        .catch(err => {
            res.send({status: "error", error: "not an admin"});
        })
}