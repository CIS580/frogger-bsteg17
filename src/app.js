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
var cars = Car.generateCars(); 
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
