var express = require("express");
var Player = require("../models/player");
var router = express.Router();

router.get("/", function(req, res){
    res.render("home");
});

router.post("/", function(req, res){
    //create player entry in mongo
    //redirect to /play
    var nickname = req.body.nickname;
    var score = 0;

    var player = new Player({
        nickname: nickname,
        hiScore: score,
        latestScore: score
    });
    
    player.save(function(err, player){
        if(err){
            console.log(err);
        } else {
            console.log(player.nickname);
            res.render("play", {player:player});
        }
    });
});

router.get("/play", function(req, res){
    res.render("play");
});

module.exports = router;