const { createReadStream, unlink } = require('fs');
const models = require('../models.js');
const { getToken, createIdMd5 } = require('../common.js');

module.exports = (_attach) => async (req, res) => {
    console.log("received single upload request");
    var files = {};
    var token = "";
    var tag = "";
    try {
        files = req.files;
        token = req.body.token
        tag = req.body.tag;
    }catch(e){
        res.send({status: "error", error: "invalid request"});
        return;
    }

    if(!req.files || req.files.length != 1) {
        res.send({status: "error", error: "invalid amount of files"});
        return;
    }

    getToken(token)
        .then(user => {
            // in mb
            var fname = ""
            var type = ""
            var size = 0;
            for(i in files) {
                var file = files[i];

                var fname, type = "";
                try {
                    fname = file.originalname.match(/([^.]+)\.[a-zA-Z0-9]+$/)[1];
                    type = file.originalname.match(/[^.]+\.([a-zA-Z0-9]+)$/)[1];
                    size = file.size / 1000;
                }catch(e){
                    res.send({status: "error", error: "invalid file name"});
                    return;
                }
            }

            // for each of the files
            for(var i in files) {
                var file = files[i];
                console.log(file.path);

                const readStream = createReadStream(file.path);
                const options = ({ filename: file.originalname, contentType: file.mimetype});
                
                var id = "";
                (currentFile => {
                    new Promise((resolve, reject) => {
                        _attach.write(options, readStream, (err, doc) => {
                            unlink(currentFile.path, () => {});
                            if(err || doc == null){
                                console.error("couldn't send file " + currentFile.originalname + " to gridfs");
                                reject(err);
                            }
                            id = doc._id.toHexString();
                            console.log("sent file " + currentFile.originalname + " to gridfs & unlinked old file");
                            currentFile.id = id;
                            resolve(currentFile)
                        })
                    }).then((currentFile) => {
                        id = currentFile.id;
                        
                        var fname = currentFile.originalname.match(/([^.]+)\.[a-zA-Z0-9]+$/)[1];
                        var type = currentFile.originalname.match(/[^.]+\.([a-zA-Z0-9]+)$/)[1];

                        var obj = {
                            username: user,
                            name: fname,
                            type: type,
                            content: id,
                            uploaded: new Date(),
                            tag: tag,
                            secuId: createIdMd5(fname)
                        };

                        fileOdm = models.file(obj);
                        fileOdm.save((err, doc) => {
                            if(err || doc == null) {
                                console.error("error in fileOdm.save: err or doc null");
                                res.send({status: "error", error: "something is wrong"});
                                return;
                            }
                            console.log("fileOdm save success");
                            res.send({status: "success", file: obj});
                        });
                    }).catch(e => {
                        console.error("attachment promise fail");
                        res.send({status: "error", error: e});
                    })
                })(file);
            }
        })
        .catch(e => {
            res.send({status: "error", error: "invalid token"});
            return;
        });
};