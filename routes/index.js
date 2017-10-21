var express = require("express");
var Player = require("../models/player");
var router = express.Router();


router.get("/", function(req, res){
    res.render("home", {message:"Nickname"});
});

router.get("/play", function(req, res){
    res.render("play");
});

router.post("/play", function(req, res){
    var nickname = req.body.nickname;
    var score = 0;

    Player.findOne({"nickname": nickname}, function(err, foundPlayer){
        if(err){
            console.log(err);
        } else {
            // if returns null == no matches
            if(foundPlayer === null){
                var player = new Player({
                    nickname: nickname,
                    score: score,
                });
    
                player.save(function(err, player){
                    if(err){
                        console.log(err);
                    } else {
                        res.render("play", {player:player});
                    }
                });     
            } else {
                res.render("home", {message:"Name taken, pick another!"});
            }
        }
    });
});


module.exports = router;