const { createReadStream, unlink } = require('fs');
const models = require('../models.js');
const { getToken, createIdMd5 } = require('../common.js');

module.exports = (_attach) => async (req, res) => {
    console.log("received upload request");
    console.log(req);
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

    if(!req.files || req.files.length == 0) {
        res.send({status: "error", error: "no files received"});
        return;
    }

    getToken(token)
        .then(user => {
            // in mb
            var sizeSum = 0;
            for(i in files) {
                var file = files[i];

                var fname, type = "";
                var size = 0;
                try {
                    var fname = file.originalname.match(/([^.]+)\.[a-zA-Z0-9]+$/)[1];
                    var type = file.originalname.match(/[^.]+\.([a-zA-Z0-9]+)$/)[1];
                    var size = file.size / 1000000;
                }catch(e){
                    res.send({status: "error", error: "invalid file name"});
                    return;
                }

                sizeSum += size;
            }

            // all the flies have been sent and accounted for, sum up the size and result

            res.send({status: "success", message: sizeSum + "mb of files received, will sync soon, may not appear in list instantly"});

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
                            if(err || doc == null){
                                console.error("couldn't send file " + currentFile.originalname + " to gridfs");
                                reject(err);
                            }
                            id = doc._id.toHexString();
                            unlink(currentFile.path, () => {});
                            console.log("sent file " + currentFile.originalname + " to gridfs & unlinked old file");
                            resolve(id)
                        })
                    }).then(id => {

                        fileOdm = models.file({
                            username: user,
                            name: fname,
                            type: type,
                            content: id,
                            uploaded: new Date(),
                            tag: tag,
                            secuId: createIdMd5(fname)
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
                    })
                })(file);
            }
        })
        .catch(e => {
            res.send({status: "error", error: "invalid token"});
            return;
        });
};