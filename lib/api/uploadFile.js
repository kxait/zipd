const { createReadStream, unlink } = require('fs');
const models = require('../models.js');

module.exports = (_attach) => async (req, res) => {
    console.log("received upload request");
    var file = {};
    var token = "";
    try {
        file = req.file;
        token = req.body.token
    }catch(e){
        res.send({status: "error", error: "invalid request"});
        return;
    }

    // todo: convert to getToken
    var user = "";
    models.token.findById(token, (err, doc) => {
        if(err || doc == null || doc.name == null) {
            res.send({status: "error", error: "invalid token"});
            return;
        }
        
        user = doc.name;
        
        if(!user) {
            console.log("findbyid user null");
            res.send({status: "error", error: "invalid token, user null"});
            return;
        }

        var fname, type = "";
        var size = 0;
        try {
            var fname = req.file.originalname.match(/([^.]+)\.[a-zA-Z0-9]+$/)[1];
            var type = req.file.originalname.match(/[^.]+\.([a-zA-Z0-9]+)$/)[1];
            var size = req.file.size / 1000000;
        }catch(e){
            res.send({status: "error", error: "invalid file name"});
            return;
        }

        // limit size to 3mb here

        res.send({status: "success", message: size + "mb file received, will sync soon, may not appear in list instantly"});

        const readStream = createReadStream(req.file.path);
        const options = ({ filename: req.file.originalname, contentType: req.file.mimetype});
        
        var id = "";
        new Promise((resolve, reject) => {
            _attach.write(options, readStream, (err, file) => {
                if(err || file == null){
                    console.error("couldn't send file " + req.file.originalname + " to gridfs");
                    reject(err);
                }
                id = file._id.toHexString();
                unlink(req.file.path, () => {});
                console.log("sent file " + req.file.originalname + " to gridfs & unlinked old file");
                resolve(id)
            })
        }).then(id => {

            fileOdm = models.file({
                username: user,
                name: fname,
                type: type,
                content: id,
                uploaded: new Date()
            });
            fileOdm.save((err, doc) => {
                if(err || doc == null) {
                    console.error("error in fileOdm.save: err or doc null");
                    //res.send({status: "error", error: "something is wrong"});
                    return;
                }
                console.log("fileOdm save success");
                //res.send({status: "success"});
            });
        }).catch(e => {
            console.error("attachment promise fail");
        });
    });
};