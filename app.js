var express    = require("express"),
    bodyParser = require("body-parser"),
    app        = express(),
    server     = require('http').createServer(app),
    io         = require('socket.io').listen(server),
    indexRoute = require("./routes/index.js"),
    mongoose   = require("mongoose"),
    Player     = require("./models/player");

mongoose.connect("mongodb://localhost:27017/snake_js");

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('static'));
app.use(express.static('assets'));
app.use(indexRoute);

io.sockets.on("connection", function(socket){
    
    console.log("New connection: " + socket.id);


    socket.on("score", function(data){
        console.log("Nickname: " + data.playerName + "score: " + data.score);

        var currentScore;
        //find current player 
        Player.findOne({"nickname" : data.playerName}, function(err, foundPlayer){
            if(err){
                console.log(err);
            } else {
                // check if current player's score is < than the score being fed by the game in real time
                // update it
                currentScore = foundPlayer.score;

                if(currentScore < data.score){
                    Player.findOneAndUpdate({"nickname" : data.playerName}, {$set : {"score" : data.score}}, function(err, updatedPlayer){
                        if(err){
                             console.log (err); 
                        } else {
                            console.log("UPDATED " + data.playerName + "'s score. From " + currentScore + " to " + data.score);
                        }
                    });
                }
            }
        });
    });
});


server.listen(27017, function(){
    console.log("SERVER UP");
});
