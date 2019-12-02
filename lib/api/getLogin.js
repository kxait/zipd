const models = require('../models.js');

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

    models.user.findOne({name: user, password: pass})
        .then(data => {
            if(data == null) {
                res.send({status: "error", error: "no user with password"});
                return;
            }
            if(data.role == "shrek") {
                res.send({status: "shrek"});
                return;
            }
            var tok = new models.token({
                name: user,
                when: dateNow,
                until: dateUntil,
                ip: req.ip
            });
            //models.token.deleteMany({name: user}, (err) => {;});
            tok.save((err, doc) => {
                if(err || doc == null) {
                    res.send({status: "error", error: "something wrong"});
                    return;
                }
                res.send({status: "success", token: doc.id, expires: dateUntil});
            });
        });
};