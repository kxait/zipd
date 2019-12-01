const express = require('express');
const mongo = require('mongoose');

const models = require('./lib/models.js');
const getToken = require('./lib/common.js');

const { createReadStream, unlink } = require('fs');
const { createModel } = require('mongoose-gridfs');

var multer  = require('multer');
var upload = multer({ dest: 'uploads/' });

const connStr = "mongodb+srv://admin:admin@haha-cloud-fs8by.mongodb.net/hahacloud?retryWrites=true&w=majority"
mongo.connect(connStr, {useNewUrlParser: true, useUnifiedTopology: true});
mongo.connection.once("error", console.error.bind(console, "what the fuck "));

var Attachment = {};
mongo.connection.once("open", () => {
    console.log("connected to mongo!");
    Attachment = createModel({modelName: "files", connection: mongo.connection});
})


const bodyParser = require('body-parser');
const parser = bodyParser.urlencoded({ extended: false });
const jsonParser = bodyParser.json();

const app = express();
app.set('view engine', 'ejs');
app.use(express.static("public"));
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.render("login.ejs");
})

app.get('/list', (req, res) => {
    res.render("list.ejs");
})

app.get('/list/upload', (req, res) => {
    res.render("upload.ejs");
})

app.get('/api/getUserFiles', (req, res) => {
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
});

app.get('/api/getFile', (req, res) => {
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
            models.file.findById(id)
                .then(doc => {
                    const stream = Attachment.read({ _id: mongo.Types.ObjectId(doc.content) });
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
                    });

                    return;
                })
                .catch(err => {
                    res.send({status: "error", error: err});
                })
        }).catch(err => {
            res.send({status: "error", error: err});
        })
})

app.post('/api/getLogin', parser, (req, res) => {
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
            var tok = new models.token({
                name: user,
                when: dateNow,
                until: dateUntil,
                ip: req.ip
            });
            models.token.deleteMany({name: user}, (err) => {;});
            tok.save((err, doc) => {
                if(err || doc == null) {
                    res.send({status: "error", error: "something wrong"});
                    return;
                }
                res.send({status: "success", token: doc.id, expires: dateUntil});
            });
        });
});

app.get("/api/deleteLogin", (req, res) => {
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
});

app.post("/api/uploadFile", [upload.single("file"), parser], async (req, res) => {
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

    var user = "";
    models.token.findById(token, (err, doc) => {
        console.log("entered await findbyid");
        if(err || doc == null || doc.name == null) {
            res.send({status: "error", error: "invalid token"});
            return;
        }
        
        user = doc.name;
    }).catch(err => {
        console.log("await findbyid caught");
    }).then(doc => {
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
            Attachment.write(options, readStream, (err, file) => {
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
                content: id
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
})

app.get("/api/deleteFile", (req, res) => {
    var token = "";
    var id = "";
    try {
        token = req.query.token;
        id = req.query.id
    }catch(e){
        res.send({status: "error", error: "invalid request"});
        return;
    }

    getToken(token)
        .then(user => {
            models.file.findOne({username: user, _id: id}, (err, doc) => {
                if(err || doc == null) {
                    res.send({status: "error", error: "invaid request!"});
                    return;
                }
                var gridfsId = doc.content;
                models.file.findByIdAndDelete({_id: id}, (err, doc) => {})
                Attachment.unlink({_id: gridfsId}, error => {
                    if(!error) res.send({status: "success"});
                    else res.send({status: "error", error: error});
                    return;
                })
            })
        })
        .catch(err => {
            res.send({status: "error", error: err});
        })
});

app.listen(port, () => {
    console.log(`haha-cloud successfully listening on port ${ port }`);
})
