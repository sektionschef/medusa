const MODE = 1  // "FINE ART";
// const MODE = 5 // all debug messages

const NOISESEED = hashFnv32a(fxhash);
console.log("Noise seed: " + NOISESEED);

let PaperDimensions = {
  "Quickie": {
    width: 800,
    height: 800
  },
  "Stammersdorf": {
    width: 3840,
    height: 2160
  },
  "1to1": {
    width: 4000,
    height: 4000
  },
}
// convert pixel to real world physics
const conv = 10;

let exportPaper = PaperDimensions['1to1']

let scaleRatio;
let exportRatio;
let canvas;
let rescaling_width;
let rescaling_height;

let PALETTE;
let PALETTE_LABEL;
let APPLESIZE = 1 //getRandomFromInterval(1, 2);  // width -> number of

let RESTITUTIONMin = 0;
let RESTITUTIONMax = 1;
let RESTITUTION = Math.round(getRandomFromInterval(RESTITUTIONMin, RESTITUTIONMax) * 100) / 100;
let RESTITUTIONLabel = label_feature(RESTITUTION, RESTITUTIONMin, RESTITUTIONMax);

const WAVECOUNT = 3;
const WAVEINDEXMAX = WAVECOUNT - 1;
let waveIndex = 0;
LIGHT = "dark";

let POX1 = false;

allPalettes = [
  "Olivenhain",
  "Autodrom",
  "Babushka",
  "Mamos",
  "Lasagne",
  "Fix Hellas",
  "Niko",
  "Ierissos",
  "Medusa",
]

// console.log(allPalettes);
PALETTE_LABEL = getRandomFromList(allPalettes);

function createPalette() {
  const PALETTESYSTEM = {
    "Medusa": [
      color("#534438"),
      color("#FBE1BB"),
      color("#785237"),
      color("#926139"),
    ],
    "Ierissos": [
      color("#e7d3a4"),
      color("#ede7d1"),
      color("#404040"),
      color("#7d9bb3"),
    ],
    "Niko": [
      color("#211f1f"),
      color("#808080"),
      color("#c0c0c0"),
      color("#ffffff"),
    ],
    "Fix Hellas": [
      color("#A10035"),
      color("#FEC260"),
      color("#3FA796"),
      color("#2A0944"),
    ],
    "Lasagne": [
      color("#ffd1a9"),
      color("#ff9e79"),
      color("#fb6d4c"),
      color("#c23b22"),
      color("#580000"),
    ],
    "Mamos": [
      color("#77d8f9"),
      color("#624c38"),
      color("#cedeed"),
      color("#c64b62"),
    ],
    "Babushka": [
      color("#d8bc00"),
      color("#040c21"),
      color("#74a2c6"),
      color("#a43b4f"),
    ],
    "Autodrom": [
      color("#d8bc00"),
      color("#894292"),
      color("#67bfee"),
      color("#3e2543"),
    ],
    "Olivenhain": [
      color("	#14140a"),
      color("#918e41"),
      color("#ffc83d"),
      color("#4e542c"),
    ],
  }

  // console.log(PALETTE_LABEL);
  PALETTE = PALETTESYSTEM[PALETTE_LABEL];
}

function preload() {
  // img = loadImage('download.png');
}

function setup() {
  noiseSeed(NOISESEED);
  randomSeed(NOISESEED);
  setAttributes('antialias', true);

  // console.log("Pixel density: " + pixelDensity())
  // exportRatio /= pixelDensity();

  scaleDynamically();

  canvas = createCanvas(rescaling_width, rescaling_height, WEBGL);
  canvas.id('badAssCanvas');

  createPalette();
  addTexture();

  world = new OIMO.World({
    timestep: 1 / 60,
    iterations: 8,
    broadphase: 2, // 1 brute force, 2 sweep and prune, 3 volume tree
    worldscale: 1, // scale full world 
    random: true,  // randomize sample
    // random: false,  // randomize sample
    info: false,   // calculate statistic or not
    // gravity: [0, -9.8, 0]
    gravity: [0, -9.8, 3]
  });

  ground = new Body({
    type: 'box', // type of shape : sphere, box, cylinder 
    size: [100, 10, 100], // size of shape
    pos: [0, -20, 0], // start position in degree
    rot: [0, 0, 0], // start rotation in degree
    move: false, // dynamic or statique
    density: 1000,
    friction: 0.6,
    restitution: 0,
    name: "ground",
    // belongsTo: 1, // The bits of the collision groups to which the shape belongs.
    // collidesWith: 0xffffffff // The bits of the collision groups with which the shape collides.
  }, color(0, 255, 0, 100));

  lowerBorder = new Body({
    type: 'box', // type of shape : sphere, box, cylinder 
    size: [100, 50, 10], // size of shape
    pos: [0, 0, 55], // start position in degree
    rot: [0, 0, 0], // start rotation in degree
    move: false, // dynamic or statique
    density: 1000,
    friction: 0.2,
    restitution: 0.2,
    name: "lowerBorder",
  }, color(0, 155, 0, 100));

  pushers = new PusherSystem(ground.body.shapes.width);

}


function draw() {

  // camera(0, 0, (height / 2) / tan(PI / 6), 0, 0, 0, 0, 1, 0);  // default
  if (MODE == 5) {
    camera(0, 800, 0, 0, 0, 0, 0, 0, 1); // debug - on top view
    // camera(-1500, 0, 0, 0, 0, 0, 0, -1, 0); // debug -- side view
  } else {
    camera(0, 700, 0, 0, 0, 0, 0, 0, 1);
  }

  if (MODE == 5) {
    // orbitControl();
  }

  // ambientLight(255, 255, 255);
  // ambientMaterial(255);
  // specularMaterial(255);

  if (LIGHT == "full") {
    ambientLight(150);
    directionalLight(200, 200, 200, 1, -1, 0);

  } else if (LIGHT == "Rembrandt") {

    ambientLight(50);
    pointLight(75, 75, 75, getRandomFromInterval(-50, 50), -10, getRandomFromInterval(-30, 30))
    pointLight(75, 75, 75, getRandomFromInterval(-50, 50), -10, getRandomFromInterval(-30, 30))
    pointLight(75, 75, 75, getRandomFromInterval(-50, 50), -10, getRandomFromInterval(-30, 30))
    pointLight(75, 75, 75, getRandomFromInterval(-50, 50), -10, getRandomFromInterval(-30, 30))
    pointLight(75, 75, 75, getRandomFromInterval(-50, 50), -10, getRandomFromInterval(-30, 30))

  } else if (LIGHT == "dark") {
    ambientLight(130);
  }



  if (MODE == 5) {
    background(100);
  }

  // update world
  world.step();

  if (typeof applesFall != "undefined") {
    applesFall.updateDisplay();
  }
  if (typeof apples != "undefined") {
    apples.updateDisplay();
  }
  if (typeof apples2 != "undefined") {
    apples2.updateDisplay();
  }
  if (typeof apples3 != "undefined") {
    apples3.updateDisplay();
  }


  ground.update();
  lowerBorder.update();

  if (MODE == 5) {
    ground.display();
    lowerBorder.display();
  }

  pushers.updateDisplay();

  if (typeof obstacles != "undefined") {
    obstacles.updateDisplay();
  }

  timing();
}

function mousePressed() {
  console.log("frameCount; " + frameCount);
}

function drawPixelBuffer(bufferWidth, bufferHeight, baseColor, secondColor, range) {
  let buffer = createGraphics(bufferWidth, bufferHeight);

  // console.log(secondColor);

  buffer.loadPixels();
  // let baseColor = color(242, 210, 169);
  // let range = 40;

  for (let y = 0; y < buffer.height; y++) {
    for (let x = 0; x < buffer.width; x++) {
      // formula to get each pixels rgba
      let index = (x + y * buffer.width) * 4;
      if (fxrand() < 0.02) {
        // buffer.pixels[index + 0] = 50;
        // buffer.pixels[index + 1] = 50;
        // buffer.pixels[index + 2] = 50;
        buffer.pixels[index + 0] = red(secondColor);
        buffer.pixels[index + 1] = green(secondColor);
        buffer.pixels[index + 2] = blue(secondColor);
      } else if (fxrand() > 0.98) {
        buffer.pixels[index + 0] = 200;
        buffer.pixels[index + 1] = 200;
        buffer.pixels[index + 2] = 200;
      } else {
        buffer.pixels[index + 0] = random(red(baseColor) - range, red(baseColor) + range);
        buffer.pixels[index + 1] = random(green(baseColor) - range, green(baseColor) + range);
        buffer.pixels[index + 2] = random(blue(baseColor) - range, blue(baseColor) + range);
      }
      buffer.pixels[index + 3] = 255;
    }
  }
  buffer.updatePixels();
  return buffer
}

function addTexture() {

  for (var i = 0; i < PALETTE.length; i++) {

    // console.log(PALETTE[i]);
    if (i == 0) {
      var j = (PALETTE.length - 1);
    } else {
      var j = i - 1;
    }

    // size of the biggest apple, inclusive conv
    PALETTE[i]["img"] = drawPixelBuffer(
      1 * conv,
      1 * conv,
      PALETTE[i],
      PALETTE[j],
      25);
  }

}

function terminate() {
  console.log("Shutting down!");
  applesFall.killAllCall();
  apples.killAllCall();
  apples2.killAllCall();
  apples3.killAllCall();
  console.log("Physical body count: " + world.numRigidBodies);
  noLoop();
  fxpreview();
}

// in frames
let SETUP = 1;
let START = 10;
let ENDFALL = 180;
let PREWAVE1 = 190;
let WAVE1 = 200;
let WAVE1END = 700;
let PREWAVE2 = 500;
let WAVE2 = 520;
let WAVE2END = 900;
let PREWAVE3 = 700;
let WAVE3 = 720;
let WAVE3END = 1100;
let END = 1120;


function timing() {

  if (frameCount == SETUP) {
    background(255);  // white background once


  }

  if (frameCount == START) {
    world.setGravity([0, -9.8, 30]);
    applesFall = new AppleSystem(100, true);
    // LIGHT = "dark";
    LIGHT = "Rembrandt";
  }

  //   console.log("index: " + waveIndex);
  //   console.log("limit: " + WAVEINDEXMAX);

  if (frameCount == ENDFALL) {
    console.log("Ending Fall")
    applesFall.killAllCall();
    world.setGravity([0, -9.8, 3]);
    LIGHT = getRandomFromList(["full", "Rembrandt"]);
    // LIGHT = getRandomFromList(["Rembrandt"]);
  }

  if (frameCount == PREWAVE1) {
    console.log("Starting wave: " + waveIndex + "/" + WAVEINDEXMAX);
    apples = new AppleSystem(400);
    obstacles = new ObstacleSystem(5); // then set position
  }


  if (frameCount == WAVE1) {
    console.log("Pushers fire.");
    pushers.fire();
  }

  if (frameCount == WAVE1END) {
    apples.killAllCall();
  }

  if (frameCount == PREWAVE2) {
    waveIndex += 1;
    console.log("Starting wave: " + waveIndex + "/" + WAVEINDEXMAX);
    apples2 = new AppleSystem(200);
  }

  if (frameCount == WAVE2) {
    console.log("Pushers fire.");
    pushers.fire();
  }

  if (frameCount == WAVE2END) {
    apples2.killAllCall();
  }

  //   // colored layer or medusa text;
  //   // push();
  //   // fill(0, 0, 0, 70);
  //   // box(300, 300, 300, 500, 100, 500);
  //   // pop();


  if (frameCount == PREWAVE3) {
    waveIndex += 1;
    console.log("Starting wave: " + waveIndex + "/" + WAVEINDEXMAX);
    apples3 = new AppleSystem(200);
  }

  if (frameCount == WAVE3) {
    console.log("Pushers fire.");
    pushers.fire();
  }

  if (frameCount == WAVE3END) {
    apples3.killAllCall();
  }

  if (frameCount == END) {
    console.log("Safety: " + fxrand());
    terminate();
  }

}
