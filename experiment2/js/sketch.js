// sketch.js - purpose and description here
// Author: Your Name
// Date:

// Here is how you might set up an OOP p5.js project
// Note that p5.js looks for a file called sketch.js

// Constants - User-servicable parts
// In a longer project I like to put these in a separate file
const VALUE1 = 1;
const VALUE2 = 2;

// Globals
let myInstance;
let canvasContainer;
var centerHorz, centerVert;

class MyClass {
  constructor(param1, param2) {
    this.property1 = param1;
    this.property2 = param2;
  }

  myMethod() {
    // code to run when method is called
  }
}

function resizeScreen() {
  centerHorz = canvasContainer.width() / 2; // Adjusted for drawing logic
  centerVert = canvasContainer.height() / 2; // Adjusted for drawing logic
  console.log("Resizing...");
  resizeCanvas(canvasContainer.width(), canvasContainer.height());
  // redrawCanvas(); // Redraw everything based on new size
}

/* exported setup, draw */

let seed = 239;
const leafColor1 = "rgb(104,126,0)"; // rgb(104, 126, 18)
const leafColor2 = "rgb(169,181,0)"; // rgb(183, 195, 18)
const rootColor = "rgb(158,146,126)";

// #6a8742
// #9fc26f
// #9e927e
let roots = [];
let numRoots = 5;
let leaf;

function growVines(numRoots = 1, originX = 0, originY = 0) {
  roots = [];
  for (let i = 0; i < numRoots; i++) {
    let length = width;
    let angleNoise = noise(i, seed);
    let safeAngle = getSafeAngle(originX, originY, length);
    let angle = map(angleNoise, 0, 1, safeAngle.min, safeAngle.max); // maps to right side
    let r = new Vine(originX, originY, length, angle);
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

// // takes in a point, length, and angle and creates a line using noise from start to end point
class Vine {
  constructor(
    x1,
    y1,
    length,
    angleDegrees,
    {
      start = random(width),
      inc = 0.01,
      wiggle = 40,
      color = rootColor,
      steps = null,
      strokeWeight = 10,
      childStrokeMult = 0.5,
      depth = 0, // recusrion depth
      maxDepth = 3, // max depth before stopping
      branchEvery = width / 4, // branches recursively every x steps
      leafFrequency = 0.03,
      leafSize = { min: 0.1, max: 1.5 },
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
        let angleOffset = random(-45, 45);
        let newAngle = baseAngle + angleOffset;
        let newLength = this.length * 0.5;

        this.children.push(
          new Vine(x, y, newLength, newAngle, {
            start: this.start + i * this.inc,
            inc: this.inc,
            wiggle: this.wiggle * 1.5,
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
            pt.x,
            pt.y,
            random(this.leafSize.min, this.leafSize.max),
            random(150, 180)
          )
        );
      }
    }
  }

  display() {
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

// setup() function is called once when the program starts
function setup() {
  createButton("reimagine").mousePressed(() => {
    seed++;
    growVines(numRoots, 0, random(height / 4, (3 * height) / 4));
  });
  // place our canvas, making it fit our container
  canvasContainer = $("#canvas-container");
  let canvas = createCanvas(canvasContainer.width(), canvasContainer.height());
  canvas.parent("canvas-container");
  // resize canvas is the page is resized

  // create an instance of the class
  myInstance = new MyClass("VALUE1", "VALUE2");

  growVines(numRoots, 0, random(height / 4, (3 * height) / 4));

  $(window).resize(function () {
    resizeScreen();
  });
  resizeScreen();
}

// draw() function is called repeatedly, it's the main animation loop
function draw() {
  // call a method on the instance
  myInstance.myMethod();
  background(225);

  // my stuff
  randomSeed(seed);

  noStroke();

  for (let r of roots) {
    // r.grow(); // progressively generate vine
    r.display(); // show the drawn portion
  }
}

function mousePressed() {
  // Create a new leaf at the mouse position with a random angle
  leaf = new Leaf(mouseX, mouseY, 1, random(PI / 2));
  leaf.display();
}

// leaf shape taken from https://editor.p5js.org/pphoebelemonn/sketches/9k-zBl-NF
class Leaf {
  constructor(x, y, size, angle) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.angle = radians(angle);
    this.current_size = size / 10;
  }

  update() {
    if (this.current_size < this.size) {
      this.current_size += 0.005;
      this.current_size = min(this.current_size, this.size);
    }
  }

  display() {
    push();
    translate(this.x, this.y);
    scale(this.current_size);
    rotate(this.angle);

    noStroke();
    beginShape();

    fill(leafColor1);
    vertex(0, 0);
    vertex(15, 5);
    vertex(30, -15);
    vertex(16, -20);
    vertex(10, -50);
    vertex(-8, -25);
    vertex(-25, -25);
    vertex(-20, 0);
    endShape(CLOSE);

    // strokeWeight(3);
    // line(0, 0, 10, -47); // central vein
    // line(0, 0, 28, -12); // side vein
    // line(0, 0, -23, -22); // side vein
    pop();
  }
}
