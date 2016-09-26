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
