(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict;"

/* Classes */
const Game = require('./game.js');
const Player = require('./player.js');
const Car = require('./car.js');
const Log = require('./log.js');

/* Global variables */
var canvas = document.getElementById('screen');
var background = new Image();
background.src = encodeURI('assets/background.png'); 
var keyCode;
var game = new Game(canvas, update, render, applyUserInput);
var player = new Player({x: 10, y: 240});
var cars = Car.generateCars(canvas); 
var logs = Log.generateLogs(canvas); 

var isGameOver = false;
var lives = 3;
var score = 0;
var level = 1;

/**
  * Listener that passes key code of user input to global variable keyCode
  */
document.addEventListener("keydown", function(event) {
  game.keyCode = event.which;
});

/**
 * @function masterLoop
 * Advances the game in sync with the refresh rate of the screen
 * @param {DOMHighResTimeStamp} timestamp the current time
 */
var masterLoop = function(timestamp) {
  if(isGameOver) {
    if (lives > 0) {
      player.x = 0;
      lives--;
      isGameOver = false;
    } else {
      ctx = canvas.getContext('2d');
      ctx.fillRect(0,0,canvas.width,canvas.height);
      ctx.fillStyle = "white";
      ctx.fillText("GAME OVER", 100, 100);
      return;
    }
  }
  game.loop(timestamp);
  window.requestAnimationFrame(masterLoop);
}
masterLoop(performance.now());


/**
 * @function update
 * Updates the game state, moving
 * game objects and handling interactions
 * between them.
 * @param {DOMHighResTimeStamp} elapsedTime indicates
 * the number of milliseconds passed since the last frame.
 */
function update(elapsedTime) {
  player.update(elapsedTime);
  cars.forEach(function(car){car.update(elapsedTime)});
  logs.forEach(function(log){log.update(elapsedTime)});
  collisionCheck();
}

function collisionCheck() {
  console.log(player.x);
  if (player.x > 600) {
    player.x = 0;
    cars.forEach(function(car){car.speed+=5;});
    logs.forEach(function(log){log.speed+=5;});
    score += 100;
    level += 1;
    return;
  }
  cars.forEach(function(car) {
    if (player.x < car.x + car.width &&
        player.x + player.width > car.x &&
        player.y < car.y + car.height &&
        player.height + player.y > car.y) {
	  isGameOver = true;
    }
  });
  logs.forEach(function(log) {
    if (player.x < log.x + log.width && player.x + player.width > log.x && player.state != "jumping") {
      if (player.y + player.height < log.y || player.y > log.y + log.height) {
	isGameOver = true;
      } else {
	player.rideLog(log);
      }
    }
  });
}

/**
  * @function render
  * Renders the current game state into a back buffer.
  * @param {DOMHighResTimeStamp} elapsedTime indicates
  * the number of milliseconds passed since the last frame.
  * @param {CanvasRenderingContext2D} ctx the context to render to
  */
function render(elapsedTime, ctx) {
  ctx.drawImage(background, 0, 0, background.width, background.height, 0, 0, canvas.width, canvas.height);
  cars.forEach(function(car){car.render(elapsedTime, ctx)});
  logs.forEach(function(log){log.render(elapsedTime, ctx)});
  player.render(elapsedTime, ctx);
  drawScoreLevelLives();
}

/**
  * @function applyUserInput
  * Refreshes states of all game objects based on most recent user keyCode.
  * @param {int} keyCode -- the user's keyboard keyCode for the current 
  *    iteration of game loop (defaults to null)
  */
function applyUserInput(keyCode) {
  game.keyCode = null;
  player.applyUserInput(keyCode); 
}

/**
  * Listener that passes key code of user input to global variable keyCode
  */
document.addEventListener("keydown", function(event) {
  game.keyCode = event.which;
});

function drawScoreLevelLives() {
  ctx = canvas.getContext('2d');
  ctx.font = "30px Arial";
  ctx.fillStyle = "red 30px";
  ctx.fillText("Lives: "+lives, 350, 20);
  ctx.fillText("Score: "+score, 460, 20);
  ctx.fillText("Level: "+level, 570, 20);
}

},{"./car.js":2,"./game.js":3,"./log.js":4,"./player.js":5}],2:[function(require,module,exports){
"use strict";

const MS_PER_FRAME = 1000/8;

/**
 * @module exports the Car class
 */
module.exports = exports = Car;

/**
 * @constructor Car 
 * Creates a new car object
 * @param {Postition} position object specifying an x and y
 */
function Car(attrs) {
  this.canvas = document.getElementsByTagName('canvas')[0];
  this.state = "idle";
  this.x = attrs.x;
  this.y = attrs.y;
  this.carStyle = attrs.style;
  this.imageWidth  = 211;
  this.imageHeight = 338;
  this.width = 48;
  this.height = this.width * (this.imageHeight / this.imageWidth);
  this.timer = 0;
  this.direction = attrs.direction;
  this.speed = 10;
  this.spritesheet  = new Image();
  if (this.direction > 0) {
    this.spritesheet.src = encodeURI('assets/inverse_cars_mini'+this.carStyle+'.png');
  } else {
    this.spritesheet.src = encodeURI('assets/cars_mini'+this.carStyle+'.png');
  }
}  


Car.generateCars = function(canvas) {
  var cars = [];
  for(var i = 0; i < 5; i++) {
    var randomNumber = Math.random();
    var randomDirection = (randomNumber - .5) / Math.abs(randomNumber - .5);
    var startingY = (randomDirection < 0 ? canvas.height : 0);
    var randomStyle = Math.floor(randomNumber * 5) + 1;
    cars.push(new Car({x:(54 * i) + 63, y:startingY, direction:randomDirection, style:randomStyle}));
  }
  return cars;
}

/**
 * @function updates the car object
 * {DOMHighResTimeStamp} time the elapsed time since the last frame
 */
Car.prototype.update = function(time) {
  this.timer += time;
  if(this.timer > MS_PER_FRAME) {
    this._move();
    this.timer = 0;
  }
  //place car at beginning of path when car goes offscreen
  if (this.direction == 1 && this.y > this.canvas.height) {
    this.y = 0 - this.height;
  }
  if (this.direction == -1 && (this.y + this.height) < 0) {
    this.y = this.canvas.height;
  }
}

Car.prototype._move = function(){
  this.y += this.direction * this.speed;
}

/**
 * @function renders the car into the provided context
 * {DOMHighResTimeStamp} time the elapsed time since the last frame
 * {CanvasRenderingContext2D} ctx the context to render into
 */
Car.prototype.render = function(time, ctx) {
  this._draw(ctx);
}

Car.prototype._draw = function(ctx) {
  ctx.drawImage(
    // image
    this.spritesheet,
    // source rectangle
    0, 0, this.imageWidth, this.imageHeight,
    // destination rectangle
    this.x, this.y, this.width, this.height
  );
}

},{}],3:[function(require,module,exports){
"use strict";

/**
 * @module exports the Game class
 */
module.exports = exports = Game;

/**
 * @constructor Game
 * Creates a new game object
 * @param {canvasDOMElement} screen canvas object to draw into
 * @param {function} updateFunction function to update the game
 * @param {function} renderFunction function to render the game
 */
function Game(screen, updateFunction, renderFunction, applyUserInputFunction) {
  this.update = updateFunction;
  this.render = renderFunction;
  this.applyUserInput = applyUserInputFunction;

  // Set up buffers
  this.frontBuffer = screen;
  this.frontCtx = screen.getContext('2d');
  this.backBuffer = document.createElement('canvas');
  this.backBuffer.width = screen.width;
  this.backBuffer.height = screen.height;
  this.backCtx = this.backBuffer.getContext('2d');

  // Start the game loop
  this.oldTime = performance.now();
  this.paused = false;

  //User input
  this.keyCode = null;
}

/**
 * @function pause
 * Pause or unpause the game
 * @param {bool} pause true to pause, false to start
 */
Game.prototype.pause = function(flag) {
  this.paused = (flag == true);
}

/**
 * @function loop
 * The main game loop.
 * @param{time} the current time as a DOMHighResTimeStamp
 */
Game.prototype.loop = function(newTime) {
  var game = this;
  var elapsedTime = newTime - this.oldTime;
  this.oldTime = newTime;
  
  this.applyUserInput(this.keyCode);
  
  if(!this.paused) this.update(elapsedTime);
  this.render(elapsedTime, this.frontCtx);

  // Flip the back buffer
  this.frontCtx.drawImage(this.backBuffer, 0, 0);
}

},{}],4:[function(require,module,exports){
"use strict";

const MS_PER_FRAME = 1000/8;

/**
 * @module exports the Log class
 */
module.exports = exports = Log;

/**
 * @constructor Log 
 * Creates a new log object
 * @param {Postition} position object specifying an x and y
 */
function Log(attrs) {
  this.canvas = document.getElementsByTagName('canvas')[0];
  this.state = "idle";
  this.x = attrs.x;
  this.y = attrs.y;
  this.imageWidth  = 53;
  this.imageHeight = 196;
  this.width = 50;
  this.height = this.width * (this.imageHeight / this.imageWidth);
  this.timer = 0;
  this.frame = 0;
  this.direction = attrs.direction;
  this.speed = 5;
  this.spritesheet  = new Image();
  this.spritesheet.src = encodeURI('assets/log.png');
}  


Log.generateLogs = function(canvas) {
  var logs = [];
  for(var i = 0; i < 4; i++) {
    var randomNumber = Math.random();
    var randomDirection = (randomNumber - .5) / Math.abs(randomNumber - .5);
    var startingY = (randomDirection < 0 ? canvas.height : 0);
    var randomStyle = Math.floor(randomNumber * 5);
    logs.push(new Log({x:(60 * i) + 400, y:startingY, direction:randomDirection})); 
  }
  return logs;
}

/**
 * @function updates the log object
 * {DOMHighResTimeStamp} time the elapsed time since the last frame
 */
Log.prototype.update = function(time) {
  this.timer += time;
  if(this.timer > MS_PER_FRAME) {
    this._move();
    this.timer = 0;
  }
  //place log at beginning of path when log goes offscreen
  if (this.direction == 1 && this.y > this.canvas.height) {
    this.y = 0 - this.height;
  }
  if (this.direction == -1 && (this.y + this.height) < 0) {
    this.y = this.canvas.height;
  }
}

Log.prototype._move = function(){
  this.y += this.direction * this.speed;
}

/**
 * @function renders the log into the provided context
 * {DOMHighResTimeStamp} time the elapsed time since the last frame
 * {CanvasRenderingContext2D} ctx the context to render into
 */
Log.prototype.render = function(time, ctx) {
  this._draw(ctx);
}

Log.prototype._draw = function(ctx) {
  ctx.drawImage(
    // image
    this.spritesheet,
    // source rectangle
    0, 0, this.imageWidth, this.imageHeight,
    // destination rectangle
    this.x, this.y, this.width, this.height
  );
}

},{}],5:[function(require,module,exports){
"use strict";

const MS_PER_FRAME = 1000/8;
const blockSize = [53, 53, 54, 54, 54, 60, 60, 60, 55, 55, 105];

/**
 * @module exports the Player class
 */
module.exports = exports = Player;

/**
 * @constructor Player
 * Creates a new player object
 * @param {Postition} position object specifying an x and y
 */
function Player(position) {
  this.state = "idle";
  this.x = position.x;
  this.y = position.y;
  this.imageWidth = 64;
  this.imageHeight = 64;
  this.width  = 53;
  this.height = this.width * (this.imageHeight / this.imageWidth);
  this.spritesheet  = new Image();
  this.spritesheet.src = encodeURI('assets/PlayerSprite2.png');
  this.timer = 0;
  this.frame = 0;
  this.frameRow;
  this.framesBeforeNewInput = 0;
  this.columnOfGameScreen = -1;
  this.log;
}

/**
 * @function updates the player object
 * {DOMHighResTimeStamp} time the elapsed time since the last frame
 */
Player.prototype.applyUserInput = function(kc) {
  if (this.state != "jumping") {
    switch(kc) {
      case 38: //down arrow key
        this.deltaX = 0;
        this.deltaY = -1;
        this.state = "jumping";
        this.frame = 0;
        this.framesBeforeNewInput = 4;
        break;
      case 39: //right arrow key
        this.deltaX = 1;
        this.deltaY = 0; 
        this.state = "jumping";
        this.frame = 0;
        this.framesBeforeNewInput = 4;
        this.columnOfGameScreen++;
        break;
      case 40: //up arrow key
        this.deltaX = 0;
        this.deltaY = 1; 
        this.state = "jumping";
        this.frame = 0;
        this.framesBeforeNewInput = 4;
        break;
      default:
	if (this.state != "ridingLog") {
          this.state = "idle";
	}
    }  
  }
}

/**
 * @function updates the player object
 * {DOMHighResTimeStamp} time the elapsed time since the last frame
 */
Player.prototype.update = function(time) {
  this.timer += time;
  if(this.timer > MS_PER_FRAME) {
    this._move();
    this.timer = 0;
    this.frame += 1;
    if(this.frame > 3) this.frame = 0;
  }
}

Player.prototype._move = function(){
  switch(this.state) {
    case "idle":
      break;
    case "jumping":
      if (this.framesBeforeNewInput == 0) { 
        this.state = "idle"; 
        return;
      }
      this.x += (blockSize[this.columnOfGameScreen] * this.deltaX) / 4;
      this.y += (blockSize[this.columnOfGameScreen] * this.deltaY) / 4;
      this.framesBeforeNewInput--;
      break;
    case "ridingLog":
      if (this.framesBeforeNewInput > 0) { 
        this.x += (blockSize[this.columnOfGameScreen] * this.deltaX) / 4;
        this.framesBeforeNewInput--;
      }
      this.y += this.log.direction * this.log.speed;
      break;
  }
}

/**
 * @function renders the player into the provided context
 * {DOMHighResTimeStamp} time the elapsed time since the last frame
 * {CanvasRenderingContext2D} ctx the context to render into
 */
Player.prototype.render = function(time, ctx) {
  switch(this.state) {
    case "idle":
      this.frameRow = 1;
      break;
    case "jumping":
      this.frameRow = 0;
      break;
    case "ridingLog":
      this.frameRow = 1;
      break;
  }
  this._draw(ctx);
}

Player.prototype._draw = function(ctx) {
    ctx.drawImage(
      // image
      this.spritesheet,
      // source rectangle
      this.frame * this.imageWidth, this.frameRow * this.imageHeight, this.imageWidth, this.imageHeight,
      // destination rectangle
      this.x, this.y, this.width, this.height
    );
}

Player.prototype.gameOver = function(ctx) {
  ctx.fillRect(0,0,ctx.width,ctx.height); 
  ctx.fillText("GAME OVER", 100, 100);
}
 
Player.prototype.rideLog = function(log) {
  this.state = "ridingLog";
  this.log = log;
}

},{}]},{},[1,3,5,2,4]);
