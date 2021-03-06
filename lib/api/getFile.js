const models = require('../models.js')
const { getToken } = require('../common.js');
const mongo = require("mongoose");

module.exports = (_attach) => (req, res) => {
    var token, id = "";
    try {
        token = req.query.token;
        id = req.query.id;
    }catch(e){
        res.send({status: "error", error: "invalid request"});
        return;
    }

    getToken(token)
        .then(user => {
            models.file.findOne({secuId: id})
                .then(doc => {
                    if(doc == null || doc.username != user) {
                        res.send({status: "error", error: "invalid token!!"});
                        return;
                    }
                    const stream = _attach.read({ _id: mongo.Types.ObjectId(doc.content) });
                    var sent = false;
                    stream.on('error', (err => {
                        res.send({status: "error", error: err});
                    }));
                    stream.on('data', data => {
                        if(!sent) {
                            res.setHeader("Content-Disposition", `inline; filename="${doc.name + '.' + doc.type}"`);
                            res.type(doc.type);
                        }
                        sent = true;
                        res.write(data);
                    });
                    stream.on('close', close => {
                        res.end();

                        // add record to gets here
                        var get = new models.gets({
                            username: user,
                            name: doc.name + "." + doc.type,
                            fileId: id,
                            when: new Date(),
                            ip: req.ip
                        })

                        get.save((err, doc) => {
                            if(err || doc == null) {
                                console.error("couldn't save new file GET in gets list", err, doc);
                                return;
                            }
                        });
                    });

                    return;
                })
                .catch(err => {
                    res.send({status: "error", error: "err: " + err});
                })
        }).catch(err => {
            res.send({status: "error", error: "error: " + err});
        })
}