var mongoose = require("mongoose");

var playerSchema = new mongoose.Schema({
    nickname: String,
    hiScore: Number,
});

module.exports = mongoose.model("Player", playerSchema);