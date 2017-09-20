var title;
var play;

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

        game.stage.backgroundColor = "#36393d";
        title = game.add.text(300, 200, "SnakeJS", {
            font: "Ubuntu",
            fontWeight: "bold",
            fontSize: 40,
            fill: "#d7e0ed"
        });

        play = game.add.text(350, 300, "play", {
            font: "Ubuntu",
            fontSize: 20,
            fill: "#d7e0ed"
        });

        play.inputEnabled = true;
    },

    update: function(){
        play.events.onInputDown.add(loadGame, this);
    }
}

function loadGame(){
    game.state.start("Game");
}