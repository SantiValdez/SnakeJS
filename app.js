var express    = require("express"),
    bodyParser = require("body-parser"),
    app        = express();
    indexRoute = require("./routes/index.js");


app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('static'));
app.use(express.static('assets'));
app.use(indexRoute);



app.listen(3000, function(){
    console.log("----SERVER UP----")
});