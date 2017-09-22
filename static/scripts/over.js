var gameOver,
    playAgain,
    gameOverScore;

var Over = {
    preload: function(){},

    create: function(){
        gameOver = game.add.text(200, 50, "Game Over", {
            font: "Ubuntu",
            fontWeight: "bold",
            fontSize: 80,
            fill: "#d7e0ed",
            align: "center"
        });

        playAgain = game.add.text(300, 200, "play again!", {
            font: "Ubuntu",
            fontSize: 20,
            fill: "#d7e0ed"
        });
        
        gameOverScore = game.add.text(300, 350, score, {
            font: "Ubuntu",
            fontSize: 300,
            fill: "#d7e0ed"
        });



        playAgain.inputEnabled = true;
    },

    update: function(){
        playAgain.events.onInputDown.add(reloadGame, this);
    }
}

function reloadGame(){
    game.state.start("Game");
}