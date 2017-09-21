
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
    appleSpawnRate;

//powerUp vars
var powerUpExists,
    powerUpSpawnRate;

//controls vars
var left,
    right,
    up,
    down;

//game vars
var score,
    scoreDisplay,
    speed,
    frameRate,
    gameWidth,
    gameHeight,
    appleLayer,         //layers so that snake body goes over the apples
    snakeLayer,
    frontLayer;

    var called = false;


var Game = {
    
    preload: function(){
        game.load.image("snakeBody", "/snakeBody.png");
        game.load.image("apple", "/apple.png");
        game.load.image("aquaPU", "/aquaPU.png");
    },

    create: function(){

        game.stage.backgroundColor = "#36393d";
    
        snake = [];
        segmentSize = 20;
        snakeDirection = "right";
        newDirection = null;

        appleExists = false;
        appleSpawnRate = 5;
        appleSpawnRate = 0;

        powerUpExists = false;
        powerUpSpawnRate = 0;

        appleLayer = game.add.group();
        snakeLayer = game.add.group();
        frontLayer = game.add.group();
        score = 0;
        frameRate = 0;
        speed = 0;
        gameWidth = 800;
        gameHeight = 800;

        //score display
        scoreDisplay = game.add.text(50, 50, "", {
            font: "60px Ubuntu",
            fill: "#d7e0ed",
        });
        scoreDisplay.alpha = 1;
        frontLayer.add(scoreDisplay);

        //generating snake, increasing X each iteration
        for(var i = 0; i < 10; i++){
            snake[i] = game.add.sprite(300 + i * segmentSize, 20 * segmentSize, "snakeBody" );
            snakeLayer.add(snake[i]);
        }
    
        //setting up controls to check if key was JUST pressed
        left = game.input.keyboard.addKey(Phaser.Keyboard.LEFT);
        right = game.input.keyboard.addKey(Phaser.Keyboard.RIGHT);
        up = game.input.keyboard.addKey(Phaser.Keyboard.UP);
        down = game.input.keyboard.addKey(Phaser.Keyboard.DOWN);
        game.input.keyboard.addKeyCapture([ Phaser.Keyboard.LEFT, Phaser.Keyboard.RIGHT, Phaser.Keyboard.SPACEBAR ]);
    },

    update: function(){

        game.world.bringToTop(frontLayer);
        getDirection();
    
        speed = Math.min(4, Math.floor(score/2));
        // Increase a counter on every update call.
        frameRate++;

        scoreDisplay.text = score;

        if(frameRate % (6 - speed) === 0){
            generateApple();
            appleSpawnRate++;

            generatePowerUp();
            powerUpSpawnRate++;

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

function generatePowerUp(){
    /* if snake >= 18 && !powerUpExists && powerUpSpawnRate > X
            give random x and y in the grid
            isSpaceEmpty(x, y)
                spawn

    */
    if(snake.length >= 18 && !powerUpExists && powerUpSpawnRate > 50){

        var position = getRandomPos();
        if(isSpaceEmpty(position[0], position[1])){
            powerUp = game.add.sprite(position[0], position[1], "aquaPU");
            appleLayer.add(powerUp);
            powerUpExists = true;
            powerUpSpawnRate = 0;
        } else {
            console.log("skipping powerup gen for now!");
            powerUpExists = false;
        }
    }
}

function generateApple(){

    if(!appleExists && appleSpawnRate > 15){



        var position = getRandomPos();

        appleX = position[0];
        appleY = position[1];

        if(isSpaceEmpty(appleX, appleY)){
            apple = game.add.sprite(appleX, appleY, "apple");
            appleLayer.add(apple);
            appleSpawnRate = 0;
            appleExists = true;
        } else {
            console.log("Skipping apple generation for now!");
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

function isSpaceEmpty(x, y){
    for (var i = 0; i < snake.length; i++) {
        if(snake[i].x === x && snake[i].y === y){
            return false;
        }
    }

    if(apple && apple.x === x && apple.y === y){
        return false;
    }
    return true;
}

function pickUpApple(){
    apple.destroy();
    appleExists = false;
    appleSpawnRate = 0;
    score++;
}

function extendSnake(){
    var lastSegment = snake[0];
    var newSegment;

    newSegment = game.add.sprite(lastSegment.x - segmentSize, lastSegment.y - segmentSize, "snakeBody");
    console.log("added segment!");
    snake.unshift(newSegment);
    snakeLayer.add(newSegment);
    snakeExtendCounter = 0;
}

//returns an array with a valid random X and Y coordinate
function getRandomPos(){
    var result = [];
    var x, y;

    x = random(780 / segmentSize);
    y = random(780 / segmentSize);
    x *= segmentSize;
    y *= segmentSize;

    result.push(x);
    result.push(y);

    return result;
}

function random(max){
    return Math.floor(Math.random() * max) + 1;
}