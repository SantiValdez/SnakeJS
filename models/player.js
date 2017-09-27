var mongoose = require("mongoose");

var playerSchema = new mongoose.Schema({
    nickname: String,
    score: Number,
});

module.exports = mongoose.model("Player", playerSchema);