(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict;"

/* Classes */
const Game = require('./game.js');
const Player = require('./player.js');
const Car = require('./car.js');

/* Global variables */
var canvas = document.getElementById('screen');
var keyCode;
var game = new Game(canvas, update, render, applyUserInput);
var player = new Player({x: 0, y: 240})
var cars = Car.generateCars(canvas); 
console.log(player.state);

/**
 * @function masterLoop
 * Advances the game in sync with the refresh rate of the screen
 * @param {DOMHighResTimeStamp} timestamp the current time
 */
var masterLoop = function(timestamp) {
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
}

/**
  * @function render
  * Renders the current game state into a back buffer.
  * @param {DOMHighResTimeStamp} elapsedTime indicates
  * the number of milliseconds passed since the last frame.
  * @param {CanvasRenderingContext2D} ctx the context to render to
  */
function render(elapsedTime, ctx) {
  ctx.fillStyle = "lightblue";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  player.render(elapsedTime, ctx);
  cars.forEach(function(car){car.render(elapsedTime, ctx)});
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

},{"./car.js":2,"./game.js":3,"./player.js":4}],2:[function(require,module,exports){
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
  this.state = "idle";
  this.x = attrs.x;
  this.y = attrs.y;
  this.carStyle = attrs.style;
  this.imageWidth  = 237;
  this.imageHeight = 339;
  this.width = 100;
  this.height = this.width * (this.imageHeight / this.imageWidth);
  this.timer = 0;
  this.frame = 0;
  this.direction = attrs.direction;
  this.speed = 5;
  this.spritesheet  = new Image();
  //this.spritesheet.src = (this.direction > 0 ? encodeURI('assets/inverse_cars_mini.png') : encodeURI('assets/cars_mini.svg'));  
  if (this.direction > 0) {
    this.spritesheet.src = encodeURI('assets/inverse_cars_mini.png');
  } else {
    this.spritesheet.src = encodeURI('assets/cars_mini.png');
  }
}  


Car.generateCars = function(canvas) {
  var cars = []; 
  for(var i = 0; i < 2; i++) {
    var randomNumber = Math.random();
    var randomDirection = (randomNumber - .5) / Math.abs(randomNumber - .5);
    var startingY = (randomDirection < 0 ? canvas.height : 0);
    console.log(randomDirection);
    var randomStyle = Math.floor(randomNumber * 5);
    cars.push(new Car({x:100 * i, y:startingY, direction:randomDirection, style:randomStyle}));
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
      (this.carStyle * this.imageWidth), 0, this.imageWidth, this.imageHeight,
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
  this.width  = 64;
  this.height = 64;
  this.spritesheet  = new Image();
  this.spritesheet.src = encodeURI('assets/PlayerSprite2.png');
  this.timer = 0;
  this.frame = 0;
  this.frameRow;
  this.framesBeforeNewInput = 0;
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
        break;
      case 40: //up arrow key
        this.deltaX = 0;
        this.deltaY = 1; 
        this.state = "jumping";
        this.frame = 0;
        this.framesBeforeNewInput = 4;
        break;
      default:
        this.state = "idle";
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
      this.x += (this.width * this.deltaX) / 4;
      this.y += (this.height * this.deltaY) / 4;
      this.framesBeforeNewInput--;
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
    // TODO: Implement your player's redering according to state
  }
  this._draw(ctx);
}

Player.prototype._draw = function(ctx) {
    ctx.drawImage(
      // image
      this.spritesheet,
      // source rectangle
      this.frame * this.width, this.frameRow * this.height, this.width, this.height,
      // destination rectangle
      this.x, this.y, this.width, this.height
    );
}

},{}]},{},[1,4,3,2]);
