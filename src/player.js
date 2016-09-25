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
      this.x += (blockSize[this.columnOfGameScreen] * this.deltaX) / 4;
      this.y += (blockSize[this.columnOfGameScreen] * this.deltaY) / 4;
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
      this.frame * this.imageWidth, this.frameRow * this.imageHeight, this.imageWidth, this.imageHeight,
      // destination rectangle
      this.x, this.y, this.width, this.height
    );
}

Player.prototype.carCollision = function() {
  console.log("car collision");
}

Player.prototype.waterCollision = function() {
  console.log("water collision");
}
