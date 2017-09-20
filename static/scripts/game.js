
/*
TODO
-make countdown
*/


//snake vars
var snake,
    snakeDirection,
    newDirection,
    segmentSize;

//apple vars
var apple,
    appleExists,
    appleSpawnRate,
    appleSpawnCounter;


//controls vars
var left,
    right,
    up,
    down;

//game vars
var score,
    speed,
    frameRate,
    gameWidth,
    gameHeight,
    backLayer,         //layers so that snake body goes over the apples
    frontLayer;

    var called = false;


var Game = {
    
    preload: function(){
        game.load.image("snakeBody", "/snakeBody.png");
        game.load.image("apple", "/apple.png");
    },

    create: function(){

        game.stage.backgroundColor = "#36393d";
    
        snake = [];
        segmentSize = 20;
        snakeDirection = "right";
        newDirection = null;

        appleExists = false;
        appleSpawnRate = 5;
        appleSpawnCounter = 0;

        backLayer = game.add.group();
        frontLayer = game.add.group();
        score = 0;
        frameRate = 0;
        speed = 0;
        gameWidth = 800;
        gameHeight = 800;
    
        //generating snake, increasing X each iteration
        for(var i = 0; i < 10; i++){
            snake[i] = game.add.sprite(300 + i * segmentSize, 20 * segmentSize, "snakeBody" );
            frontLayer.add(snake[i]);
        }
    
        //setting up controls to check if key was JUST pressed
        left = game.input.keyboard.addKey(Phaser.Keyboard.LEFT);
        right = game.input.keyboard.addKey(Phaser.Keyboard.RIGHT);
        up = game.input.keyboard.addKey(Phaser.Keyboard.UP);
        down = game.input.keyboard.addKey(Phaser.Keyboard.DOWN);
        game.input.keyboard.addKeyCapture([ Phaser.Keyboard.LEFT, Phaser.Keyboard.RIGHT, Phaser.Keyboard.SPACEBAR ]);
    },

    update: function(){

        getDirection();
    
        speed = Math.min(4, Math.floor(score/2));
        // Increase a counter on every update call.
        frameRate++;

        if(frameRate % (6 - speed) === 0){
            generateApple();
            appleSpawnCounter++;

            checkCollision(snake);
            if(colidedWithApple(head)){
                pickUpApple();
                extendSnake();
            }
            
            //if wrap mode is chosen wrap snake, otherwise make walls deadly
            if(wrapMode){
                wrapSnake();
            } else {
                containSnake();
            }

            var firstSegment = snake[snake.length - 1];
            var lastSegment = snake.shift();
            var firstSegmentX = firstSegment.x;
            var firstSegmentY = firstSegment.y;
        
            checkNewDirection();
    
            if(snakeDirection === "left"){
                lastSegment.x = firstSegmentX - segmentSize;
                lastSegment.y = firstSegmentY;
            }
    
            if(snakeDirection === "right"){
                lastSegment.x = firstSegmentX + segmentSize;
                lastSegment.y = firstSegmentY;
            }
    
            if(snakeDirection === "up"){
                lastSegment.x = firstSegmentX;
                lastSegment.y = firstSegmentY - segmentSize;
            }
    
            if(snakeDirection === "down"){
                lastSegment.x = firstSegmentX;
                lastSegment.y = firstSegmentY + segmentSize;
            }
    
            snake.push(lastSegment);
            firstSegment = lastSegment; 
        }

    }
}   

function wrapSnake(){
    head = snake[snake.length - 1];
    if(head.x < 0){
        head.x = 780;
    }
    if(head.x > 780){
        head.x = 0;
    }
    if(head.y < 0){
        head.y = 780;
    }
    if(head.y > 780){
        head.y = 0;
    }
}

function containSnake(){
    head = snake[snake.length -1];
    if(head.x < 0 || head.x > 780 || head.y < 0 || head.y > 780){
        game.state.start("Over");
    }
}

function checkNewDirection(){
    if(newDirection){
        snakeDirection = newDirection;
        newDirection = null;
    }
}

function getDirection(){
    if (left.downDuration(10) && snakeDirection !== "right"){
        newDirection = "left";
    }

    if (right.downDuration(10) && snakeDirection !== "left"){
        newDirection = "right";        
    }

    if (up.downDuration(10) && snakeDirection !== "down"){
        newDirection = "up";        
    }

    if (down.downDuration(10) && snakeDirection !== "up"){
        newDirection = "down";        
    } 
}

function checkCollision(snake){
    head = snake[snake.length - 1];

    for (var i = 0; i < snake.length - 1; i++) {
        //if snake[i] x and y same as rest of snake body, then load game over
        if(head.x === snake[i].x && head.y === snake[i].y){
            game.state.start("Over");
        }
    }
}

function generateApple(){

    var counter = 0;  // helper variable to determine if position of apple is not occupied by snake

    if(!appleExists && appleSpawnCounter > 15){

        appleSpawnCounter = 0;
        appleExists = true;

        appleX = getRand(780 / segmentSize); // 780 so that apples dont spawn halfway offscreen
        appleY = getRand(780 / segmentSize);
        appleX *= segmentSize;
        appleY *= segmentSize;

        for (var i = 0; i < snake.length; i++) {
            if(appleX === snake[i].x && appleY === snake[i].y){
                counter++;
            } 
        }

        if(counter === 0){
            apple = game.add.sprite(appleX, appleY, "apple");
            backLayer.add(apple);
        } else {
            console.log("skipping apple generation for now!");
            appleExists = false;
        }        
    }
}

function colidedWithApple(head){
    if(apple){
        for (var i = 0; i < snake.length; i++) {
            if(head.x === apple.x && head.y === apple.y){
                return true;
            }
        }
    }
    return false;
}

function pickUpApple(){
    apple.destroy();
    appleExists = false;
    appleSpawnCounter = 0;
    score++;
}

function extendSnake(){
    var lastSegment = snake[0];
    var newSegment;

    newSegment = game.add.sprite(lastSegment.x - segmentSize, lastSegment.y - segmentSize, "snakeBody");
    console.log("added segment!");
    snake.unshift(newSegment);
    frontLayer.add(newSegment);
    snakeExtendCounter = 0;
}

function getRand(max){
    return Math.floor(Math.random() * max) + 1; //min 20 so that apples dont spawn halfway offscreen
}