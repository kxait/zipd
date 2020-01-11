const models = require('../models.js')
const { getToken } = require('../common.js');
const mongo = require("mongoose");
const thumb = require("image-thumbnail");
const cache = require("node-cache");

const thumbCache = new cache();

createThumbnailForGridImage = (attachment, token, id) => new Promise((resolve, reject) => {
    getToken(token)
        .then(user => {
            models.file.findOne({secuId: id})
                .then(doc => {
                    if(doc == null || doc.username != user) {
                        reject("invalid token!!");
                    }
                    const stream = attachment.read({ _id: mongo.Types.ObjectId(doc.content) });

                    var buffer = ""

                    stream.on('error', (err => {
                        reject(err);
                    }));
                    stream.on('data', data => {
                        if(buffer == "")
                            buffer = data
                        else
                            buffer = Buffer.concat([buffer, data])
                    });
                    stream.on('close', close => {
                        thumb(buffer, {
                            width: 128,
                            height: 128,
                            responseType: "buffer",
                            jpeg: {force: true, quality: 1}
                        }).then(data => {
                            sent = true;
                            resolve(data);
                        }).catch(err => {
                            console.error("uh oh!!! getImageThumbnail ", err);
                            reject(err);
                        });
                    });
                    
                    return;
                })
                .catch(err => {
                    reject(err);
                })
        }).catch(err => {
            reject(err);
        })
});

respondWithImageThumbnail = (_attach) => (req, res) => {
    function respondImage(id, data) {
        res.setHeader("Content-Disposition", `inline; filename="${id + '.jpeg'}"`);
        res.type(".jpeg");
        res.write(data);
        res.end();
    }

    var token, id = "";
    try {
        token = req.query.token;
        id = req.query.id;
    }catch(e){
        res.send({status: "error", error: "invalid request"});
        return;
    }

    if(thumbCache.has(id)) {
        getToken(token)
        .then(user => {
            models.file.findOne({secuId: id})
            .then(doc => {
                if(doc == null || doc.username != user) {
                    res.send({status: "error", error: "invalid token!!"});
                }else{
                    img = thumbCache.get(id);
                    respondImage(id, img);
                }
            })
        })
    }else{
        createThumbnailForGridImage(_attach, token, id)
        .then(data => {
            thumbCache.set(id, data, 3600);
            respondImage(id, data);
        })
        .catch(err => {
            res.send({status: "error", error: err});
        });
    }

}

module.exports = {
    respondWithImageThumbnail: respondWithImageThumbnail,
    createThumbnailForGridImage: createThumbnailForGridImage
}