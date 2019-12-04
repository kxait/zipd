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
const parser = bodyParser.urlencoded({ extended: false });

/* CONNECT TO MONGO */
const connStr = "mongodb+srv://admin:admin@haha-cloud-fs8by.mongodb.net/hahacloud?retryWrites=true&w=majority"
mongo.connect(connStr, {useNewUrlParser: true, useUnifiedTopology: true});
mongo.connection.once("error", console.error.bind(console, "what the fuck "));

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

app.get('/admin', (req, res) => {
    res.render("admin.ejs");
})

/* API */
function registerApi() {
    /* NORMAN */
    app.get('/api/getUserFiles', require('./lib/api/getUserFiles.js'));

    app.get('/api/getFile', require('./lib/api/getFile.js')(Attachment));

    app.get("/api/deleteLogin", require('./lib/api/deleteLogin.js'));
    
    app.get("/api/deleteFile", require('./lib/api/deleteFile.js')(Attachment));
    
    app.get("/api/getUserRole", require("./lib/api/getUserRole.js"));

    app.post("/api/changePass", parser, require('./lib/api/changePass.js'));

    app.post('/api/getLogin', parser, require('./lib/api/getLogin.js'));

    app.post("/api/uploadFile", [upload.single("file"), parser], require('./lib/api/uploadFile.js')(Attachment))

    /* ADMIN */
    app.post("/api/admin/addUser", parser, require("./lib/api/admin/addUser.js"));
    
    app.get("/api/admin/deleteUser", require("./lib/api/admin/deleteUser.js"));
    
    app.get("/api/admin/wipeUser", require("./lib/api/admin/wipeUser.js")(Attachment));
    
    app.post("/api/admin/setUserPassword", parser, require("./lib/api/admin/setUserPassword.js"));
    
    app.get("/api/admin/getUserList", require("./lib/api/admin/getUserList.js"));

    //app.get("/api/admin/getStorage", require("./lib/api/admin/getStorage.js"));
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
    console.log(`zipdisquette successfully listening on port ${ port }`);
})
