const models = require('../models');
const { getToken } = require('../common.js');

module.exports = (_attach) => (req, res) => {
    var token = "";
    var id = "";
    try {
        token = req.query.token;
        id = req.query.id
    }catch(e){
        res.send({status: "error", error: "invalid request"});
        return;
    }

    getToken(token)
        .then(user => {
            models.file.findOne({username: user, secuId: id}, (err, doc) => {
                if(err || doc == null) {
                    res.send({status: "error", error: "invaid request!"});
                    return;
                }
                var gridfsId = doc.content;
                models.file.findOneAndDelete({secuId: id}, (err, doc) => {})
                _attach.unlink({_id: gridfsId}, error => {
                    if(!error) res.send({status: "success"});
                    else res.send({status: "error", error: error});
                    return;
                })
            })
        })
        .catch(err => {
            res.send({status: "error", error: err});
        })
}