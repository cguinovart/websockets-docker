var moongoose = require('mongoose');

var userSchema = new moongoose.Schema({
        nom: String,
        password: String,
        partidasguanyades: Number,
});

module.exports = moongoose.model('User', userSchema);