
var game = new Phaser.Game(800, 800, Phaser.AUTO, '', { preload: preload, create: create, update: update });

game.state.add('Menu', Menu);
game.state.add('Game', Game);
game.state.add('Over', Over);

game.state.start('Menu');
// game.state.start('Game');


function preload(){}



function create(){

}

function update(){

}