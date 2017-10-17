
//snake vars
var snake,
    snakeDirection,
    newDirection,
    segmentSize,
    firstSegment,
    lastSegment,
    firstSegmentX,
    firstSegmentY;

//apple vars
var apple,
    appleExists,
    appleEmitter,
    appleSpawnRate;

//lock vars
var lock, 
    lockExists,
    lockSpawnRate,
    lockEmitter,
    lockDuration;


//powerUp vars
var powerUp,
    powerUpExists,
    powerUpSpawnRate,
    snakeReduceAmount;

//extension vars
var extension,
    extensionExists,
    extensionSpawnRate;

//checkpoint vars
var checkpoint,
    checkpointExists;

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
    //layers so that snake body overlaps the apples
    appleLayer,
    snakeLayer,
    frontLayer,
    canWrap = true;

//obstacle vars
var obstacles,
    obstacleEmitter;

//player vars
var playerName;



var socket = io.connect("http://localhost:27017/");
var tbody = $("#leaderboards > tbody");

socket.on("playerList", function(data){    
        tbody.children().remove();
    
        var topScorers = data;
    
        for (var i = 0; i < topScorers.length; i++) {
            tbody.append("<tr><td>" + topScorers[i].nickname + "</td><td>" + topScorers[i].score + "</td></tr>");
        }
    });


var Game = {

    preload: function(){
        //snake
        game.load.image("snakeHeadLeft", "/snake/snakeHeadLeft.png");
        game.load.image("snakeHeadRight", "/snake/snakeHeadRight.png");
        game.load.image("snakeHeadUp", "/snake/snakeHeadUp.png");
        game.load.image("snakeHeadDown", "/snake/snakeHeadDown.png");
        game.load.image("snakeBody", "/snake/snakeBody.png");
        game.load.image("snakeBodyAnim", "/snake/snakeBodyAnim.png");
        //walls
        game.load.image("obstacle", "/wall/wall.png");
        game.load.image("obstacleParticle", "/wall/wallParticles/wallParticle.png");
        //locks
        game.load.image("lock", "/lock/lock.png");
        game.load.image("lockParticle", "/lock/lockParticles/lockParticle.png");
        //apples
        game.load.image("apple", "/apple/apple.png");
        game.load.image("appleParticle", "/apple/appleParticles/appleParticle.png");
        //powerup
        game.load.atlasJSONHash( "powerUp" , "/powerup/powerUp.png", "/powerup/powerUp.json" );
        //extensions
        game.load.atlasJSONHash( "extension" , "/extension/extension.png", "/extension/extension.json" );
        game.load.image("extensionParticle", "/extension/extensionParticles/extensionParticle.png");
        //checkpoint
        game.load.atlasJSONHash( "checkpoint" , "/checkpoint/checkpoint.png", "/checkpoint/checkpoint.json" );
        // game.load.atlasJSONHash( "checkpointSpawn" , "/checkpoint/checkpointSpawn.png", "/checkpoint/checkpointSpawn.json" );      
    },

    create: function(){

        
        canvas = $("canvas").first().css("border", "2px solid rgba(255,255,255,0.5)");
        playerName = $("#player-name-display").first().text();

        canWrap = true;

        game.stage.backgroundColor = "rgb(35, 60, 80)";

        Phaser.Camera.x = -10;
        Phaser.Camera.y = 10;
    
        snake = [];
        segmentSize = 20;
        snakeDirection = "right";
        newDirection = null;

        appleExists = false;
        appleSpawnRate = 0;
        
        extensionExists = false;
        extensionSpawnRate = 0;

        powerUpExists = false;
        powerUpSpawnRate = 0;
        snakeReduceAmount = 3;  // amount to reduce length of snake when powerup picked up

        lockExists = false;
        lockSpawnRate = 0;
        lockDuration = 100;

        checkpointExists = false;

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
            fill: "white",
        });
        scoreDisplay.alpha = 1
        frontLayer.add(scoreDisplay);

        //generating snake, increasing X each iteration
        for(var i = 0; i < 10; i++){
            snake[i] = game.add.sprite(300 + i * segmentSize,20 * segmentSize, "snakeBody" );
            snake[i].animations.add("pickupAnim");
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
        

        socket.emit('score', {
            score,
            playerName   
        });

        game.world.bringToTop(frontLayer);
        getDirection();

        speed = Math.min(4, Math.floor(score/2));
        // Increase a counter on every update call.
        frameRate++;

        scoreDisplay.text = score;

        if(frameRate % (6 - speed) === 0){

            scaleSnake(1);

            firstSegment = snake[snake.length - 1];
            lastSegment = snake.shift();
            firstSegmentX = firstSegment.x;
            firstSegmentY = firstSegment.y;

            checkNewDirection();
            moveSnakeInDirection();
    
            snake.push(lastSegment);
            firstSegment = lastSegment; 

            generateApple();
            appleSpawnRate++;

            generatePowerUp();
            powerUpSpawnRate++;

            generateLock();
            if(!lockExists){
                 lockSpawnRate++; 
            }
            lockDuration--;

            generateExtension();
            extensionSpawnRate++;

            generateCheckpoint();
            

            if(powerUpExists){
                powerUp.animations.play("rainbow", 10, true);
            }
            
            checkCollision(snake);

            if(colidedWithPowerUp(head)){
                pickUpPowerUp();
                createObstacle();
                updateObstacleSprite();
            }

            if(extensionExists){
                extension.animations.play("colorSwitch", 10, true);
            }

            if(colidedWithExtension(head)){
                pickUpExtension();
                extendSnake(5);
            }

            if(checkpointExists){
                checkpoint.animations.play("colorSwitch", 5, true);
            }

            if(colidedWithcheckpoint(head)){
                pickUpcheckpoint();
                clearObstacles();
            }

            if(colidedWithApple(head)){
                pickUpApple();
                extendSnake();
                scaleSnake(1.1);
            }
            
            if(colidedWithLock(head)){
                pickUpLock();
                deadlyWalls();
            }
            if(lockDuration === 0){
                safeWalls();
            }
            
            //if wrap mode is chosen wrap the snake, otherwise make walls deadly
            if(canWrap){
                wrapSnake();
            } else {
                containSnake();
            }
        }
    }
}   

function moveSnakeInDirection(){
    if(snakeDirection === "left"){
        lastSegment.x = firstSegmentX - segmentSize;
        lastSegment.y = firstSegmentY;
        lastSegment.loadTexture("snakeHeadLeft");
        firstSegment.loadTexture("snakeBody");
    }

    if(snakeDirection === "right"){
        lastSegment.x = firstSegmentX + segmentSize;
        lastSegment.y = firstSegmentY;
        lastSegment.loadTexture("snakeHeadRight");
        firstSegment.loadTexture("snakeBody");
    }

    if(snakeDirection === "up"){
        lastSegment.x = firstSegmentX;
        lastSegment.y = firstSegmentY - segmentSize;
        lastSegment.loadTexture("snakeHeadUp");
        firstSegment.loadTexture("snakeBody");
    }

    if(snakeDirection === "down"){
        lastSegment.x = firstSegmentX;
        lastSegment.y = firstSegmentY + segmentSize;
        lastSegment.loadTexture("snakeHeadDown");
        firstSegment.loadTexture("snakeBody");
    }
}

function wrapSnake(){
    head = snake[snake.length - 1];
    if(head.x < 0){
        head.x = 800 - segmentSize;
    }
    if(head.x > 800 - segmentSize){
        head.x = 0;
    }
    if(head.y < 0){
        head.y = 800 - segmentSize;
    }
    if(head.y > 800 - segmentSize){
        head.y = 0;
    }
}

function containSnake(){
    head = snake[snake.length -1];
    if(head.x < 0 || head.x > (800 - segmentSize) || head.y < 0 || head.y > (800 - segmentSize)){
        game.state.start("Over", Phaser.Plugin.StateTransition.Out.SlideLeft, Phaser.Plugin.StateTransition.In.SlideLeft);
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
            game.state.start("Over", Phaser.Plugin.StateTransition.Out.SlideLeft, Phaser.Plugin.StateTransition.In.SlideLeft);
        }
    }

    if(obstacles.length > 0){
        for (var i = 0; i < obstacles.length; i++) {
            if(head.x === obstacles[i].x && head.y === obstacles[i].y){
                game.state.start("Over", Phaser.Plugin.StateTransition.Out.SlideLeft, Phaser.Plugin.StateTransition.In.SlideLeft);
            }
        }
    }
}

function generatePowerUp(){
    if(!powerUpExists && powerUpSpawnRate > 150){

        var position = getRandomPos();
        if(isSpaceEmpty(position[0], position[1])){
            powerUp = game.add.sprite(position[0], position[1], "powerUp");
            powerUp.animations.add("rainbow");
            powerUp.scale.setTo(0.1,0.1);
            game.add.tween(powerUp.scale).to( { x: 1, y: 1 }, 200, Phaser.Easing.Linear.None, true);
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
    score += 5;
}

function generateApple(){

    if(!appleExists && appleSpawnRate > 15){



        var position = getRandomPos();

        appleX = position[0];
        appleY = position[1];

        if(isSpaceEmpty(appleX, appleY)){
            apple = game.add.sprite(appleX, appleY, "apple");
            apple.scale.setTo(0.1,0.1);
            game.add.tween(apple.scale).to( { x: 1, y: 1 }, 200, Phaser.Easing.Linear.None, true);
            appleLayer.add(apple);
            appleSpawnRate = 0;
            appleExists = true;

            
            appleEmitter = game.add.emitter(apple.x, apple.y);
            appleEmitter.makeParticles("appleParticle");
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
    appleEmitter.start(true, 300, null, 6);
}

function generateLock(){
    if(!lockExists && lockSpawnRate > 400){

        lockSpawnRate = 0;

        var position = getRandomPos();
        
        lockX = position[0];
        lockY = position[1];

        if(isSpaceEmpty(lockX, lockY)){
            lock = game.add.sprite(lockX, lockY, "lock");
            lock.scale.setTo(0.1,0.1);
            game.add.tween(lock.scale).to( { x: 1, y: 1 }, 200, Phaser.Easing.Linear.None, true);
            appleLayer.add(lock);
            lockExists = true;

            lockEmitter = game.add.emitter(lock.x, lock.y);
            lockEmitter.makeParticles("lockParticle");
        } else {
            console.log("Skipping lock generation for now!");
            lockExists = false;
        }  
    }
}

function colidedWithLock(head){
    if(lock){
        for (var i = 0; i < snake.length; i++) {
            if(head.x === lock.x && head.y === lock.y){
                return true;
            }
        }
    }
    return false;
}

function pickUpLock(){
    lock.destroy();
    lockExists = false;
    score += 10;
    lockEmitter.start(true, 300, null, 4);
}

function generateExtension(){
    if(!extensionExists && extensionSpawnRate > 500 && snake.length < 50 && obstacles.length > 9){

        extensionSpawnRate = 0;

        var position = getRandomPos();
        
        extensionX = position[0];
        extensionY = position[1];

        if(isSpaceEmpty(extensionX, extensionY)){
            extension = game.add.sprite(extensionX, extensionY, "extension");
            colorSwitch = extension.animations.add("colorSwitch");
            appleLayer.add(extension);
            extensionExists = true;

            extensionEmitter = game.add.emitter(extension.x, extension.y);
            extensionEmitter.makeParticles("extensionParticle");
        } else {
            console.log("Skipping extension generation for now!");
            extensionExists = false;
        }  
    }
}

function colidedWithExtension(head){
    if(extension){
        for (var i = 0; i < snake.length; i++) {
            if(head.x === extension.x && head.y === extension.y){
                return true;
            }
        }
    }
    return false;
}

function pickUpExtension(){
    extension.destroy();
    extensionExists = false;
    score += 15;
    extensionEmitter.start(false, 300, 20, 4);
}

function generateCheckpoint(){
    if(!checkpointExists && obstacles.length >= 20){

        var position = getRandomPos();
        
        checkpointX = position[0];
        checkpointY = position[1];

        if(isSpaceEmpty(checkpointX, checkpointY)){
            checkpoint = game.add.sprite(checkpointX, checkpointY, "checkpoint");
            checkpoint.scale.setTo(0.1,0.1);
            game.add.tween(checkpoint.scale).to( { x: 1, y: 1 }, 200, Phaser.Easing.Linear.None, true);
            checkpoint.animations.add("colorSwitch");
            appleLayer.add(checkpoint);
            checkpointExists = true;
        } else {
            console.log("Skipping checkpoint generation for now!");
            checkpointExists = false;
        }  
    }
}

function colidedWithcheckpoint(head){
    if(checkpoint){
        for (var i = 0; i < snake.length; i++) {
            if(head.x === checkpoint.x && head.y === checkpoint.y){
                return true;
            }
        }
    }
    return false;
}

function pickUpcheckpoint(){
    checkpoint.destroy();
    checkpointExists = false;
    score += obstacles.length;
}

function deadlyWalls(){
    lockDuration = 100;
    canWrap = false;
    canvas.css("border", "2px solid #ff0000");
}

function safeWalls(){
    canWrap = true;
    canvas.css("border", "2px solid rgba(255, 255, 255, 0.5)");
}

function isSpaceEmpty(x, y){
    for (var i = 0; i < snake.length; i++) {
        if(snake[i].x === x && snake[i].y === y){
            return false;
        }
    }

    for (var i = 0; i < obstacles.length; i++) {
        if(obstacles[i].x === x && obstacles[i].y === y){
            return false;
        }
    }

    if(apple && apple.x === x && apple.y === y){
        return false;
    }
    return true;
}

function extendSnake(amount){

    var lastSegment = snake[0];
    var newSegment;

    if(!amount || amount <= 0){
        newSegment = game.add.sprite(lastSegment.x, lastSegment.y, "snakeBodyAnim")
        console.log("added segment!");
        snake.unshift(newSegment);
        snakeLayer.add(newSegment);
    } else {
        for (var i = 0; i < amount; i++) {
            newSegment = game.add.sprite(lastSegment.x, lastSegment.y, "snakeBodyAnim");
            newSegment.scale.setTo(0.1,0.1);
            game.add.tween(newSegment.scale).to( { x: 1, y: 1 }, 200, Phaser.Easing.Linear.None, true);
            console.log("added segment!");
            snake.unshift(newSegment);
            snakeLayer.add(newSegment);
            lastSegment = snake[0];
            newSegment = null;    
        }
    }
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

function clearObstacles(){
    for (var i = 0; i < obstacles.length; i++) {
        obstacles[i].destroy();
    }
    obstacles = [];
    game.camera.flash(0xffff, 500);
}

function scaleSnake(amount){
    for (var i = 0; i < snake.length; i++) {
        snake[i].scale.setTo(amount, amount);
        
    }
}

// returns an array with a valid random X and Y coordinate
function getRandomPos(){
    var result = [];
    var x, y;

    x = game.rnd.integerInRange(0, (800 - segmentSize) / segmentSize);
    y = game.rnd.integerInRange(0, (800 - segmentSize) / segmentSize);
    x *= segmentSize;
    y *= segmentSize;
    
    switch(x){
        case 0: 
            x += segmentSize;
            break;
        case 800:
            x -= segmentSize;
            break;
        default:
            x = x;
    }

    switch(y){
        case 0: 
            y += segmentSize;
            break;
        case 800:
            y -= segmentSize;
            break;
        default:
            y = y;
    }

    result.push(x);
    result.push(y);

    return result;
}