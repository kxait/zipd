const models = require('../../models.js');
const { getTokenIsAdmin, createIdMd5 } = require('../../common.js');

module.exports = (req, res) => {
    var token = "";
    try {
        token = req.query.token;
    }catch(e){
        res.send({status: "error", error: "invalid request"});
        return;
    }
    
    getTokenIsAdmin(token)
        .then(adminUser => {
            models.file.find({}, (err, docs) => {
                for(doc of docs) {
                    console.log("generated secuId for file " + doc.name);
                    doc.secuId = createIdMd5(doc.name);
                    doc.save();
                }
            });
            res.send({status: "success"});
        })
        .catch(err => {
            res.send({status: "error", error: "not an admin"});
        })
}