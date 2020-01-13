const models = require('../models.js');
const { createIdMd5 } = require('../common.js');
const { compareSync } = require('bcryptjs');

// generates a token
module.exports = (req, res) => {
    var user, pass = "";
    try {
        user = req.body.username;
        pass = req.body.password;
    }catch(e){
        res.send({error: "invalid request"});
        return;
    }

    var dateNow = new Date();
    var dateUntil = new Date();
    dateUntil.setDate(dateUntil.getDate() + 1);

    models.user.findOne({name: user})
        .then(data => {
            if(data == null) {
                res.send({status: "error", error: "invalid credentials!"});
                return;
            }
            // check password
            if(compareSync(pass, data.password)) {
                // generate bcrypt token
                var bcryptToken = createIdMd5(data.id + '.' + Math.random());

                var tok = new models.token({
                    name: user,
                    when: dateNow,
                    until: dateUntil,
                    ip: req.ip,
                    secuId: bcryptToken,
                    active: true
                });
                //models.token.deleteMany({name: user}, (err) => {;});
                tok.save((err, doc) => {
                    if(err || doc == null) {
                        res.send({status: "error", error: "something wrong"});
                        return;
                    }
                    res.send({status: "success", token: bcryptToken, expires: dateUntil});
                });
            }else{
                res.send({status: "error", error: "invalid credentials"});
                return;
            }
        });
};