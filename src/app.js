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
