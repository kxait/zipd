const models = require('../models.js')
const { getToken } = require('../common.js');
const mongo = require("mongoose");
const simpleThumb = require("simple-thumbnail");
const ffmpeg = require("ffmpeg-static");
const fs = require("fs");

getTmpPath = (file, ext) => `tmp/${file}.${ext}`;
getThumbsPath = (file) => `thumbs/${file}.jpg`;

createThumbnailStreamFromStream = (input, size, id, seek = "00:00:02.00") => new Promise((resolve, reject) => {
    var result = simpleThumb(input, getThumbsPath(id), size, {
        path: ffmpeg,
        seek: seek
    });
    result.then(() => {resolve()});
    result.catch(e => {
        if(seek == "00:00:00.00") {
            reject(e)
        } else {
            console.error("error in createThumbnailStreamFromStream, trying again without seek"); 
            createThumbnailStreamFromStream(input, size, id, "00:00:00.00")
                .then(() => resolve())
                .catch(e => {
                    console.error("could not create thumbnail after two tries");
                    reject(e);
                })
        }
    });
});

createThumbnailForGridImage = (attachment, token, id) => new Promise((resolve, reject) => {
    getToken(token)
        .then(user => {
            models.file.findOne({secuId: id})
                .then(doc => {
                    if(doc == null || doc.username != user) {
                        reject("invalid token!!");
                    }
                    const stream = attachment.read({ _id: mongo.Types.ObjectId(doc.content) });
                    stream.pipe(fs.createWriteStream(getTmpPath(id, doc.type)));

                    stream.on("close", () => {
                        try {
                            var thumbnailStream = createThumbnailStreamFromStream(getTmpPath(id, doc.type), "?x400", id);
                            thumbnailStream.then(() => {
                                console.log(`created thumbnail for ${doc.name}.${doc.type}`)
                                fs.unlinkSync(getTmpPath(id, doc.type))
                                resolve();
                            })
                            .catch(e => {
                                console.error(`could not generate thumbnail for ${doc.name}.${doc.type}`)
                                fs.unlinkSync(getTmpPath(id, doc.type))
                                reject(e);
                            });
                        }catch(e) {
                            console.error("uh oh!!! getImageThumbnail ", e);
                            reject(e);
                        }
                    })
                });
                    
                return;
        })
        .catch(err => {
            reject(err);
        })
});

respondWithImageThumbnail = (_attach) => (req, res) => {
    function pipeImageStream(id) {
        res.setHeader("Content-Disposition", `inline; filename="${id + '.jpeg'}"`);
        res.type(".jpeg");
        try {
            fs.createReadStream(getThumbsPath(id)).pipe(res).on("error", () => {res.end("internal error"); console.error(e);});
        }catch(e){
            res.end("internal error");
        }
    }

    var token, id = "";
    try {
        token = req.query.token;
        id = req.query.id;
    }catch(e){
        res.send({status: "error", error: "invalid request"});
        return;
    }

    if(fs.existsSync(getThumbsPath(id))) {
        getToken(token)
        .then(user => {
            models.file.findOne({secuId: id})
            .then(doc => {
                if(doc == null || doc.username != user) {
                    res.send({status: "error", error: "invalid token!!"});
                }else{
                    pipeImageStream(id);
                }
            })
        })
    }else{
        createThumbnailForGridImage(_attach, token, id)
        .then(() => {
            pipeImageStream(id);
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