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
});

server.listen(27017, function(){
    console.log("SERVER UP");
});
