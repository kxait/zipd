const mongoose = require('mongoose');

const user = mongoose.model('User', {
    name: String, 
    password: String,
    role: String
}, "users");

const file = mongoose.model('File', {
    username: String,
    name: String,
    type: String,
    content: String
}, "files");

const token = mongoose.model('Token', {
    name: String,
    when: Date,
    until: Date,
    ip: String
}, 'tokens');

module.exports = {
    user: user,
    file: file,
    token: token
};