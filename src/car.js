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
  this.imageWidth  = 237;
  this.imageHeight = 339;
  this.width = 100;
  this.height = this.width * (this.imageHeight / this.imageWidth);
  console.log(this.height);
  this.spritesheet  = new Image();
  this.spritesheet.src = encodeURI('assets/cars_mini.svg');
  this.timer = 0;
  this.frame = 0;
  this.direction = attrs.direction;
  this.speed = 5;
}

Car.generateCars = function() {
  var cars = []; 
  for(var i = 0; i < 2; i++) {
    cars.push(new Car({x:100 * i, y:0, direction:-1}));
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
  this.y = this.direction * this.speed;
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
