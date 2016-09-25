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
  this.speed = 25;
  this.spritesheet  = new Image();
  if (this.direction > 0) {
    this.spritesheet.src = encodeURI('assets/inverse_cars_mini'+this.carStyle+'.png');
  } else {
    this.spritesheet.src = encodeURI('assets/cars_mini'+this.carStyle+'.png');
  }
}  


Car.generateCars = function(canvas) {
  var cars = [];
  for(var i = 1; i <= 5; i++) {
    var randomNumber = Math.random();
    var randomDirection = (randomNumber - .5) / Math.abs(randomNumber - .5);
    var startingY = (randomDirection < 0 ? canvas.height : 0);
    var randomStyle = Math.floor(randomNumber * 5) + 1;
    cars.push(new Car({x:57* i, y:startingY, direction:randomDirection, style:randomStyle}));
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
  console.log(this.y);
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
