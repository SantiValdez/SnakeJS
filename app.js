var express    = require("express"),
    bodyParser = require("body-parser"),
    app        = express(),
    server = require('http').createServer(app);
    indexRoute = require("./routes/index.js"),
    mongoose   = require("mongoose"),
    io = require('socket.io').listen(server);

mongoose.connect("mongodb://localhost:27017/snake_js");

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('static'));
app.use(express.static('assets'));
app.use(indexRoute);

io.sockets.on("connection", function(socket){
    
    console.log("New connection: " + socket.id);

    socket.on('score', function(score){
        console.log(score);
    });
});

server.listen(27017, function(){
    console.log("SERVER UP");
});
