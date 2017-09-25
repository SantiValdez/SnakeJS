var gameOver,
    playAgain,
    gameOverScore;

var Over = {
    preload: function(){},

    create: function(){

        canvas = $("canvas").first().css("border", "none");

        gameOver = game.add.text(game.width / 2 + 0.5, 100 + 0.5, "Game Over", {
            font: "Ubuntu",
            fontWeight: "bold",
            fontSize: 80,
            fill: "#d7e0ed",
            align: "center"
        });
        gameOver.anchor.set(0.5);

        playAgain = game.add.text(game.width / 2 + 0.5, 600 + 0.5, "play again!", {
            font: "Ubuntu",
            fontSize: 20,
            fill: "#d7e0ed"
        });
        playAgain.anchor.set(0.5);
        
        gameOverScore = game.add.text(game.width / 2 + 0.5, 350 + 0.5, score, {
            font: "Ubuntu",
            fontSize: 300,
            fill: "mediumaquamarine"
        });
        gameOverScore.anchor.set(0.5);



        playAgain.inputEnabled = true;
    },

    update: function(){
        playAgain.events.onInputDown.add(reloadGame, this);
    }
}

function reloadGame(){
    game.state.start("Game");
}