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
        start = game.add.text(game.width / 2 + 0.5, 300 + 0.5, "ssstart!", {
            font: "Ubuntu",
            fontWeight: "bold",
            fontSize: 100,
            fill: "#d7e0ed",
            align: "center"
        });
        start.anchor.set(0.5);
        
        start.inputEnabled = true;
    },

    update: function(){
        start.events.onInputDown.add(startGame, this);
    }
}

function startGame(){
    game.state.start("Game");
}