/*

    -open connection to node with socket.io
    -receive the highest scores w/ corresponding nickkname
    -sort them highest - lowest
    -display them in real time in play.ejs table

*/

// var socket;

// var tbody = $("#leaderboards > tbody");

// socket = io.connect("http://localhost:27017/");

// socket.on("playerList", function(data){
//     var topScorers = data;

//     for (var i = 0; i < topScorers.length; i++) {
//         tbody.append("<tr><td>" + topScorers[i].nickname + "</td><td>" + topScorers[i].score + "</td></tr>");
//     }

// });