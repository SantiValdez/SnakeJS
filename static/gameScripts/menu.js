var title,
    play,
    canvas;

var Menu = {


    WebFontConfig : {
        
        //  'active' means all requested fonts have finished loading
        //  We set a 1 second delay before calling 'createText'.
        //  For some reason if we don't the browser cannot render the text the first time it's created.
        active: function() { game.time.events.add(Phaser.Timer.SECOND, createText, this); },
    
        //  The Google Fonts we want to load (specify as many as you like in the array)
        google: {
            families: ['Ubuntu']
        }
    
    },

    preload: function(){
        //  Load the Google WebFont Loader script
        game.load.script('webfont', '//ajax.googleapis.com/ajax/libs/webfont/1.4.7/webfont.js');
    },

    create: function(){

        canvas = $("canvas").first().css("border", "none");

        game.stage.backgroundColor = "#36393d";
        title = game.add.text(game.width / 2 + 0.5, 200 + 0.5, "SnakeJS", {
            font: "Ubuntu",
            fontWeight: "bold",
            fontSize: 60,
            fill: "#d7e0ed",
            align: "center"
        });
        title.anchor.set(0.5);

        play = game.add.text(game.width / 2 + 0.5, 350 + 0.5, "play", {
            font: "Ubuntu",
            fontSize: 20,
            fill: "#d7e0ed"
        });
        play.anchor.set(0.5);
        
        play.inputEnabled = true;
    },

    update: function(){
        play.events.onInputDown.add(startGame, this);
    }
}

function startGame(){
    game.state.start("Game");
}