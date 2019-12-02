const { getToken } = require('../common.js');
const models = require('../models.js')

module.exports = (req, res) => {
    if(req.query.hasOwnProperty("token")) {
        getToken(req.query.token)
            .then(user => {
                models.file.find({username: user})
                    .then((docs, err) => {
                        if(err || docs == null) {
                            res.send({status: "error", error: "wtf"});
                        }
                        res.send({
                            status: "success", 
                            name: user,
                            files: docs
                        });
                    })
                    .catch(err => {
                        res.send({status: "error", error: "wtf?"});
                    })
                return;
            })
            .catch(err => {
                res.send({status: "error", error: "invalid token! " + err});
            })
            return;
    }
    res.send(JSON.stringify({error: "invalid token"}));
}