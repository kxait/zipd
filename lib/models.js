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
    secuId: String
}, 'tokens');

module.exports = {
    user: user,
    file: file,
    token: token
};