/* */
const express = require('express');
const mongo = require('mongoose');

/* LOCAL MODULES */
const models = require('./lib/models.js');
const { getToken } = require('./lib/common.js');

const md5 = require("blueimp-md5");

/* FILE STUFF */
const { createModel } = require('mongoose-gridfs');

/* FILE UPLOADS */
var multer  = require('multer');
var upload = multer({ dest: 'uploads/' });

/* FOR POST */
const bodyParser = require('body-parser');

/* CONNECT TO MONGO */
const connStr = "mongodb+srv://admin:admin@haha-cloud-fs8by.mongodb.net/hahacloud?retryWrites=true&w=majority"
mongo.connect(connStr, {useNewUrlParser: true, useUnifiedTopology: true});
mongo.connection.once("error", console.error.bind(console, "what the fuck "));

const parser = bodyParser.urlencoded({ extended: false });

/* GRIDFS CONFIG */
var Attachment = {};
mongo.connection.once("open", () => {
    console.log("connected to mongo!");
    Attachment = createModel({modelName: "files", connection: mongo.connection});
    registerApi();
    deleteOldTokens();
})

/* EXPRESS CONFIG */
const app = express();
app.set('view engine', 'ejs');
app.use(express.static("public"));
const port = process.env.PORT || 3000;

/* FRONTEND */
app.get('/', (req, res) => {
    res.render("login.ejs");
})

app.get('/list', (req, res) => {
    res.render("list.ejs");
})

app.get('/list/upload', (req, res) => {
    res.render("upload.ejs");
})

app.get('/changePass', (req, res) => {
    res.render("changePass.ejs");
})

/* API */
function registerApi() {
    app.get('/api/getUserFiles', require('./lib/api/getUserFiles.js'));

    app.get('/api/getFile', require('./lib/api/getFile.js')(Attachment));

    app.post('/api/getLogin', parser, require('./lib/api/getLogin.js'));

    app.get("/api/deleteLogin", require('./lib/api/deleteLogin.js'));

    app.post("/api/uploadFile", [upload.single("file"), parser], require('./lib/api/uploadFile.js')(Attachment))

    app.get("/api/deleteFile", require('./lib/api/deleteFile.js')(Attachment));

    app.get("/api/changePass", require('./lib/api/changePass.js'));
}

function deleteOldTokens() {
    models.token.deleteMany({until: { $lt: new Date() }}, (err) => {
        if(err)
            console.error("couldn't delete old tokens: ", err);
        else
            console.log("deleted old tokens");
    });
}

app.listen(port, () => {
    // delete old tokens every hour
    setInterval(deleteOldTokens, 1000 * 3600);
    console.log(`haha-cloud successfully listening on port ${ port }`);
})
