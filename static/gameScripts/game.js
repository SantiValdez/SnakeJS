
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
var powerUp,
    powerUpExists,
    powerUpSpawnRate,
    snakeReduceAmount;

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

//obstacle vars
var obstacles;


var Game = {
    
    preload: function(){
        game.load.image("snakeBody", "/snakeBody.png");
        game.load.image("obstacle", "/wall.png");
        game.load.image("apple", "/apple.png");
        game.load.spritesheet('powerUp', "/powerUp.png", 20, 20);
    },

    create: function(){



        canvas = $("canvas").first().css("border", "2px solid rgba(255,255,255,0.5)");

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
        snakeReduceAmount = 3;  // amount to reduce length of snake when powerup picke up

        obstacles = [];

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
            fill: "mediumaquamarine",
        });
        scoreDisplay.alpha = 1;
        scoreDisplay.anchor.set(0.5);
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

        socket.emit('score', score);

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

            if(powerUpExists){
                powerUp.animations.play("rainbow", 5, true);
            }
            
            checkCollision(snake);

            if(colidedWithPowerUp(head)){
                pickUpPowerUp();
                createObstacle();
                updateObstacleSprite();
            }

            if(colidedWithApple(head)){
                pickUpApple();
                extendSnake();
            }
            
            //if wrap mode is chosen wrap the snake, otherwise make walls deadly
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

    if(obstacles.length > 0){
        for (var i = 0; i < obstacles.length; i++) {
            if(head.x === obstacles[i].x && head.y === obstacles[i].y){
                game.state.start("Over");
            }
        }
    }
}

function generatePowerUp(){

    if(snake.length >= 18 && !powerUpExists && powerUpSpawnRate > 50){

        var position = getRandomPos();
        if(isSpaceEmpty(position[0], position[1])){
            // powerUp = game.add.sprite(position[0], position[1], "aquaPU");
            powerUp = game.add.sprite(position[0], position[1], "powerUp");
            var rainbow = powerUp.animations.add("rainbow");
            appleLayer.add(powerUp);
            powerUpExists = true;
            powerUpSpawnRate = 0;
        } else {
            console.log("skipping powerup gen for now!");
            powerUpExists = false;
        }
    }
}

function colidedWithPowerUp(head){
    if(powerUp){
        for (var i = 0; i < snake.length; i++) {
            if(head.x === powerUp.x && head.y === powerUp.y){
                return true;
            }
        }
    }
    return false;
}

function pickUpPowerUp(){
    powerUp.destroy();
    powerUpExists = false;
    powerUpSpawnRate = 0;
    score += 20;
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

function pickUpApple(){
    apple.destroy();
    appleExists = false;
    appleSpawnRate = 0;
    score++;
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

function extendSnake(){
    var lastSegment = snake[0];
    var newSegment;

    newSegment = game.add.sprite(lastSegment.x - segmentSize, lastSegment.y - segmentSize, "snakeBody");
    console.log("added segment!");
    snake.unshift(newSegment);
    snakeLayer.add(newSegment);
    snakeExtendCounter = 0;
}

function createObstacle(){
    for (var i = snakeReduceAmount; i > 0; i--) {
        var obstacle = snake.splice(i, 1);
        obstacles.push(obstacle[0]);
    }
}

function updateObstacleSprite(){
    if(obstacles.length > 0){
        for (var i = 0; i < obstacles.length; i++) {
            obstacles[i].loadTexture("obstacle");
        }
    }
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