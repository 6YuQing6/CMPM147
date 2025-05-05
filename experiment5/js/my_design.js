/* exported getInspirations, initDesign, renderDesign, mutateDesign */

function getInspirations() {
  return [
    {
      name: "david",
      assetUrl:
        "https://cdn.shopify.com/s/files/1/0244/9349/0240/files/ClassicalRenaissanceSculptureMichelangeloDavidStatueWallArtFineArtCanvasPrintBlack_WhitePictureForLivingRoomDecor_2.jpg?v=1669300784",
    },
    {
      name: "car",
      assetUrl:
        "https://static.cdn.circlesix.co/uploads/2023-10/AE86-fifth-stage.png?width=1300",
    },
    {
      name: "samurai",
      assetUrl:
        "https://static1.moviewebimages.com/wordpress/wp-content/uploads/2022/12/samurai-rebellion.jpg",
    },
  ];
}

let minWeight = 0.8;
let maxWeight = 4;

// calculates something out of inspiration
function initDesign(inspiration) {
  let canvasWidth = inspiration.image.width / 4;
  let canvasHeight = inspiration.image.height / 4;
  resizeCanvas(canvasWidth, canvasHeight);

  const imgHTML = `<img src="${inspiration.assetUrl}" style="width:${canvasWidth}px;">`;
  $("#original").empty();
  $("#original").append(imgHTML);

  let design = {
    width: inspiration.image.width,
    height: inspiration.image.height,
    bg: 128,
    fg: {
      square: [],
      triangle: [],
      line: [],
    },
  };
  let numSquares, numLines, numLinesPerHeight, numTriangles;

  if (inspiration.name == "david") {
    numSquares = 200;
    numLines = 200;
    numLinesPerHeight = 2;
    minWeight = 0.5;
    numTriangles = 20;
  } else if (inspiration.name == "car") {
    numSquares = 20;
    numLines = 200;
    numLinesPerHeight = 1;
    maxWeight = 8;
    numTriangles = 20;
  } else if (inspiration.name == "samurai") {
    numSquares = 20;
    numLines = 20;
    numLinesPerHeight = 4;
    minWeight = 1;
    maxWeight = 6;
    numTriangles = 60;
  } else {
    numSquares = 200;
    numLines = 200;
    numLinesPerHeight = 1;
    numTriangles = 20;
  }

  let square = () => ({
    x: random(canvasWidth),
    y: random(canvasHeight),
    w: random(canvasWidth / 3),
    h: random(canvasHeight / 2),
    fill: random(255),
  });
  let triangle = () => ({
    x1: random(canvasWidth),
    y1: random(canvasHeight),
    x2: random(canvasWidth),
    y2: random(canvasHeight),
    x3: random(canvasWidth),
    y3: random(canvasHeight),
    fill: random(255),
  });

  let line = () => ({
    w: random(canvasWidth / 1.2),
    h: random(canvasHeight),
    x1: random(canvasWidth / 1.2),
    fill: random(255),
    weight: random(minWeight, maxWeight),
  });

  for (let i = 0; i < numSquares; i++) {
    design.fg.square.push(square());
  }

  // double layer lines
  for (let w = 0; w < numLinesPerHeight; w++) {
    for (let i = 0; i < numLines; i++) {
      let l = line();
      l.h = (canvasHeight / numLines) * i;
      design.fg.line.push(l);
    }
  }

  for (let i = 0; i < numTriangles; i++) {
    design.fg.triangle.push(triangle());
  }

  return design;
}

// draws the stuff using design obj from initDesign and inspiration obg
function renderDesign(design, inspiration) {
  background(design.bg);
  noStroke();

  for (let box of design.fg.square) {
    fill(box.fill, 110);
    rect(box.x, box.y, box.w, box.h);
  }
  for (let t of design.fg.triangle) {
    fill(t.fill, 110);
    triangle(t.x1, t.y1, t.x2, t.y2, t.x3, t.y3);
  }
  for (let l of design.fg.line) {
    stroke(l.fill, 110);
    strokeWeight(l.weight);
    let x2 = l.x1 + l.w;
    line(l.x1, l.h, x2, l.h);
  }
}

function mutateDesign(design, inspiration, rate) {
  design.bg = mut(design.bg, 0, 255, rate);
  for (let box of design.fg.square) {
    box.fill = mut(box.fill, 0, 255, rate);
    box.x = mut(box.x, 0, width, rate);
    box.y = mut(box.y, 0, height, rate);
    box.w = mut(box.w, 0, width / 2, rate);
    box.h = mut(box.h, 0, height / 2, rate);
  }
  for (let t of design.fg.triangle) {
    t.fill = mut(t.fill, 0, 255, rate);
    t.x1 = mut(t.x1, 0, width, rate);
    t.x2 = mut(t.x2, 0, width, rate);
    t.x3 = mut(t.x3, 0, width, rate);
    t.y1 = mut(t.y1, 0, height, rate);
    t.y2 = mut(t.y2, 0, height, rate);
    t.y3 = mut(t.y3, 0, height, rate);
  }
  for (let l of design.fg.line) {
    l.w = mut(l.w, 0, width, rate);
    //l.h = mut(l.h, 0, height, rate);
    l.x1 = mut(l.x1, 0, width, rate);
    l.fill = mut(l.fill, 0, 255, rate);
    l.weight = mut(l.weight, minWeight, maxWeight, rate);
  }
}

function mut(num, min, max, rate) {
  return constrain(randomGaussian(num, (rate * (max - min)) / 10), min, max);
}
