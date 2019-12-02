const models = require('../models.js');

module.exports = (req, res) => {
    var token = "";
    try {
        token = req.body.password;
    }catch(e){
        res.send({error: "invalid request"});
        return;
    }

    models.token.findByIdAndDelete(token, (err, doc) => {
        if(err || doc == null){
            res.send({status: "error"});
            return;
        }
        res.send({status: "success"});
    });
}