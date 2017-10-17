
var game = new Phaser.Game(800, 800, Phaser.CANVAS, 'gameContainer', { preload: preload, create: create, update: update });


game.state.add('Menu', Menu);
game.state.add('Game', Game);
game.state.add('Over', Over);


function preload(){}



function create(){
    

    game.state.start('Menu');
    // game.state.start('Game');
}

function update(){

}