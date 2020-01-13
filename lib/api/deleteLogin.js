const models = require('../models.js');

module.exports = (req, res) => {
    var token = "";
    try {
        token = req.query.token;
    }catch(e){
        res.send({error: "invalid request"});
        return;
    }

    models.token.findOneAndUpdate({secuId: token}, {active: false}, (err, doc) => {
        if(err || doc == null){
            res.send({status: "error", error: "token not found", detailed: err});
            return;
        }
        res.send({status: "success"});
    });
}