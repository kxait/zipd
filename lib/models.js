const mongoose = require('mongoose');

const user = mongoose.model('User', {
    name: String, 
    password: String,
    role: String,
    secuId: String
}, "users");

const file = mongoose.model('File', {
    username: String,
    name: String,
    type: String,
    content: String,
    uploaded: Date,
    tag: String,
    secuId: String
}, "files");

const token = mongoose.model('Token', {
    name: String,
    when: Date,
    until: Date,
    ip: String,
    secuId: String,
    active: Boolean
}, 'tokens');

const gets = mongoose.model("File Gets", {
    username: String,
    name: String,
    fileId: String,
    when: String,
    ip: String,
}, "gets");

const publicFiles = mongoose.model("Public Files", {
    username: String,
    name: String,
    fileId: String,
    created: Date,
    until: Date
}, "public");

module.exports = {
    user: user,
    file: file,
    token: token,
    gets: gets,
    publicFiles: publicFiles
};