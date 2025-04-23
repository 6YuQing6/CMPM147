// sketch.js - purpose and description here
// Author: Your Name
// Date:

// Here is how you might set up an OOP p5.js project
// Note that p5.js looks for a file called sketch.js

// Constants - User-servicable parts

// Globals
let canvasContainer;
var centerHorz, centerVert;

function resizeScreen() {
  centerHorz = canvasContainer.width() / 2; // Adjusted for drawing logic
  centerVert = canvasContainer.height() / 2; // Adjusted for drawing logic
  console.log("Resizing...");
  resizeCanvas(canvasContainer.width(), canvasContainer.height());
  // redrawCanvas(); // Redraw everything based on new size
}

/* exported setup, draw */

let seed = 239;
const LEAF_COLOR_DARK = "rgb(84, 96, 20)"; // rgb(104, 126, 18) // #556014
const LEAF_COLOR_LIGHT = "rgb(219, 239, 90)"; // rgb(183, 195, 18) // #dbef5a
const ROOT_COLOR = "rgb(158,146,126)"; // #9e927e
const BACKGROUND_COLOR = "rgb(205,211,217)"; // #cdd3d9
const backgroundShadowColor = "rgba(56,56,57,0.8)";

// 239	232	90
// #6a8742
// #9fc26f
// #9e927e
let roots = [];

// Constants
let NUMROOTS = 5;
let Y_OFFSET;
let Y_ORIGIN_MAX;
let Y_ORIGIN_MIN;

let ROOT_WIGGLE = 40;
let ROOT_STROKE = 10;
let BRANCH_STEP; // width / 4

let LEAF_FREQUENCY = 0.03;
let LEAF_SIZE = { min: 0.1, max: 1.5 };
let SWAY = true;

function calculateConstants() {
  // CONSTANTS
  Y_OFFSET = height / 8;
  Y_ORIGIN_MIN = 2 * Y_OFFSET;
  Y_ORIGIN_MAX = 3 * 2 * Y_OFFSET;
  BRANCH_STEP = width / 4;
}

// setup() function is called once when the program starts
function setup() {
  // place our canvas, making it fit our container
  canvasContainer = $("#canvas-container");
  let canvas = createCanvas(canvasContainer.width(), canvasContainer.height());
  canvas.parent("canvas-container");

  calculateConstants();
  // resize canvas is the page is resized
  // reimagine button
  reimagineButton = $("#clicker");
  reimagineButton.click(() => {
    seed++;
    calculateConstants();
    growVines(NUMROOTS, 0, random(Y_ORIGIN_MIN, Y_ORIGIN_MAX));
  });

  growVines(NUMROOTS, 0, random(Y_ORIGIN_MIN, Y_ORIGIN_MAX));

  $(window).resize(function () {
    resizeScreen();
  });
  resizeScreen();
}

// draw() function is called repeatedly, it's the main animation loop
function draw() {
  // call a method on the instance
  background(BACKGROUND_COLOR);

  // my stuff
  randomSeed(seed);

  noStroke();

  for (let r of roots) {
    // r.grow(); // progressively generate vine
    r.display(); // show the drawn portion
  }
}

function growVines(numRoots, originX = 0, originY = 0) {
  roots = [];
  let length = width;
  let safeAngle = getSafeAngle(originX, originY, length);
  for (let i = 0; i < numRoots; i++) {
    let angleNoise = noise(i, seed);
    let angle = map(angleNoise, 0, 1, safeAngle.min, safeAngle.max); // maps to right side
    let r = new Vine(
      originX,
      originY + map(noise(i), 0, 1, -Y_OFFSET, Y_OFFSET),
      length,
      angle
    );
    roots.push(r);
  }
}

// checks all the endpoints to see what the min and max angle can be
function getSafeAngle(x1, y1, length) {
  let angles = [];

  for (let a = -180; a <= 180; a += 1) {
    let angleRad = radians(a);
    let x2 = x1 + cos(angleRad) * length;
    let y2 = y1 + sin(angleRad) * length;

    if (x2 >= 0 && x2 <= width && y2 >= 0 && y2 <= height) {
      angles.push(a);
    }
  }

  return {
    min: min(angles),
    max: max(angles),
  };
}

// takes in a point, length, and angle and creates a line using noise from start to end point
class Vine {
  constructor(
    x1,
    y1,
    length,
    angleDegrees,
    {
      start = random(width),
      inc = 0.01,
      wiggle = ROOT_WIGGLE,
      color = ROOT_COLOR,
      steps = null,
      strokeWeight = ROOT_STROKE,
      childStrokeMult = 0.5,
      depth = 0, // recusrion depth
      maxDepth = 3, // max depth before stopping
      branchEvery = BRANCH_STEP, // branches recursively every x steps
      leafFrequency = LEAF_FREQUENCY,
      leafSize = LEAF_SIZE,
    } = {}
  ) {
    // points configuration
    this.x1 = x1;
    this.y1 = y1;
    this.length = length;
    let angle = radians(angleDegrees);
    this.angle = angle;

    // calculates second point using length and angle
    this.x2 = this.x1 + cos(angle) * length;
    this.y2 = this.y1 + sin(angle) * length;

    // line settings
    this.start = start;
    this.inc = inc;
    this.wiggle = wiggle;
    this.color = color;
    this.strokeWeight = strokeWeight;
    this.childStrokeMult = childStrokeMult;
    this.depth = depth;
    this.maxDepth = maxDepth;
    this.branchEvery = branchEvery;

    this.children = []; // stores sub-roots
    this.drawnPoints = []; // stores drawn root points
    this.leafs = []; // stores leafs
    this.leafFrequency = leafFrequency;
    this.leafSize = leafSize;

    // number of steps plotted
    this.steps = steps || int(length);
    this.currentSteps = 0;

    this.generateInitialVine();
    if (this.depth < this.maxDepth) {
      this.branch();
    }
  }

  branch() {
    for (let i = this.branchEvery; i < this.steps; i += this.branchEvery) {
      let t = i / this.steps;
      let x = lerp(this.x1, this.x2, t);
      let y = lerp(this.y1, this.y2, t);

      let baseAngle = degrees(this.angle);

      // grow new root
      for (let j = 0; j < 1; j++) {
        let angleOffset = random(-60, 60);
        let newAngle = baseAngle + angleOffset;
        let newLength = this.length * 0.55;

        this.children.push(
          new Vine(x, y, newLength, newAngle, {
            start: this.start + i * this.inc,
            inc: this.inc,
            wiggle: this.wiggle * 1.2,
            color: this.color,
            strokeWeight: this.strokeWeight * this.childStrokeMult,
            depth: this.depth + 1,
            maxDepth: this.maxDepth,
            branchEvery: this.branchEvery,
            leafFrequency: this.leafFrequency * 0.5,
            leafSize: { min: this.leafSize.min, max: this.leafSize.max / 1.5 },
          })
        );
      }
    }
  }

  generateInitialVine() {
    let xoff = this.start;
    // draw root
    for (let i = 0; i <= this.steps; i++) {
      let t = i / this.steps;
      let x = lerp(this.x1, this.x2, t);
      let y = lerp(this.y1, this.y2, t);
      let offset = map(noise(xoff), 0, 1, -this.wiggle, this.wiggle);
      let xWiggle = x + cos(this.angle + HALF_PI) * offset;
      let yWiggle = y + sin(this.angle + HALF_PI) * offset;
      this.drawnPoints.push({ x: xWiggle, y: yWiggle });
      xoff += this.inc;
    }
    // draw leafs
    for (let pt of this.drawnPoints) {
      if (random() < this.leafFrequency) {
        this.leafs.push(
          new Leaf(
            pt.x + random(5),
            pt.y + random(5),
            random(this.leafSize.min, this.leafSize.max),
            random(150, 180)
          )
        );
      }
    }
  }

  display() {
    // vine shadow
    push();
    translate(0, 3);
    stroke(backgroundShadowColor);
    strokeWeight(this.strokeWeight);
    noFill();
    beginShape();
    let xoff = this.start;
    for (let i = 0; i <= this.steps && i < this.drawnPoints.length; i++) {
      let pt = this.drawnPoints[i];
      let shadowVariable = map(noise(xoff), 0, 1, -1, 1);
      vertex(pt.x, pt.y + shadowVariable);
      xoff += this.inc;
    }
    endShape();
    pop();

    noFill();
    stroke(this.color);
    strokeWeight(this.strokeWeight);

    beginShape();

    for (let i = 0; i <= this.steps && i < this.drawnPoints.length; i++) {
      let pt = this.drawnPoints[i];
      vertex(pt.x, pt.y);
    }
    endShape();

    for (let child of this.children) {
      child.display();
    }

    for (let l of this.leafs) {
      l.update();
      l.display();
    }
  }
}

// leaf shape taken from https://editor.p5js.org/pphoebelemonn/sketches/9k-zBl-NF
class Leaf {
  constructor(x, y, size, angle) {
    this.x = x;
    this.y = y;
    this.angle = radians(angle);
    this.current_size = size / 10;

    // Scale final size based on X position (left = full size, right = smaller)
    // https://p5js.org/examples/calculating-values-constrain/
    let xNorm = constrain(x / width, 0, 0.5);
    let sizeScale = 1 - xNorm; // left = 1, right = 0
    this.size = size * sizeScale;

    this.colorOffset = random(-0.2, 0.2); // to make color a little more random
    this.swayAmount = constrain(this.size, 0, 0.3);
    this.swayAngle = 0;
  }

  update() {
    if (this.current_size < this.size) {
      // Normalize x position from 0 (left) to 1 (right)
      let xNorm = constrain(this.x / width, 0, 1);

      // Invert so left = 1 (faster), right = 0 (slower)
      let growthFactor = 1 - xNorm;

      // Adjust growth speed based on x
      let growthSpeed = 0.01 * growthFactor;

      this.current_size += growthSpeed;
    }
    if (SWAY) {
      this.swayAngle = noise(millis() / 1500) * this.swayAmount;
    }
  }

  display() {
    // https://p5js.org/tutorials/color-gradients/
    // Interpolate leaf color based on Y position
    let xNorm = constrain(this.x / width + this.colorOffset, 0, 1);
    let baseColor = lerpColor(
      color(LEAF_COLOR_DARK),
      color(LEAF_COLOR_LIGHT),
      xNorm
    );

    // make shadow color basecolor but darker
    let shadowColor = color(
      red(baseColor) * 0.2,
      green(baseColor) * 0.2,
      blue(baseColor) * 0.2,
      100
    );

    push();
    translate(this.x, this.y);
    scale(this.current_size);
    rotate(this.angle + this.swayAngle);

    push();
    translate(5, -5);

    noStroke();
    beginShape();

    noStroke();
    fill(shadowColor);

    vertex(0, 0);
    vertex(15, 5);
    vertex(30, -15);
    vertex(16, -20);
    vertex(10, -50);
    vertex(-8, -25);
    vertex(-25, -25);
    vertex(-20, 0);
    endShape(CLOSE);
    pop();

    noStroke();
    beginShape();

    // https://p5js.org/tutorials/color-gradients/
    // Interpolate leaf color based on Y position
    fill(baseColor);

    vertex(0, 0);
    vertex(15, 5);
    vertex(30, -15);
    vertex(16, -20);
    vertex(10, -50);
    vertex(-8, -25);
    vertex(-25, -25);
    vertex(-20, 0);

    stroke(shadowColor);
    strokeWeight(2);

    endShape(CLOSE);

    let veinColor = color(
      red(baseColor) * 1.2,
      green(baseColor) * 1.2,
      blue(baseColor) * 1.2,
      100
    );
    stroke(veinColor);
    line(0, 0, 10, -47); // central vein
    line(0, 0, 28, -12); // side vein
    line(0, 0, -23, -22); // side vein
    pop();
  }
}
