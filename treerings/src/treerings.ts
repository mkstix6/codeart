import { pseudoRandom } from "../utils";
let seed = Math.ceil(Math.random() * 1000);
const name = "TreeRings-001";

let generator = pseudoRandom(seed);
function pseudoRandomDecimal() {
  return parseFloat(`0.${generator.next().value.toString().slice(-5)}`);
}

// Populate art info into page
document.getElementById("seed").innerHTML = `${seed}`;
document.getElementById("artname").innerHTML = `${name}`;

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const renderSize = 2 ** 10;

function resizeCanvas(size = renderSize) {
  canvas.width = size;
  canvas.height = size;
}

const TAU = Math.PI * 2;
const numPoints = 260;
const wigglynessfactor = pseudoRandomDecimal() * 5;
const smoothFactor = pseudoRandomDecimal() * 4 + 1;
const barkWidthModifier = pseudoRandomDecimal() * 0.04 + 0.02;
const barkRoughness = pseudoRandomDecimal();
const barkColor = pseudoRandomDecimal() > 0.5 ? "white" : "black"; //`hsl(${hue + 130}, 60%, 38%)`;
const centerX = renderSize / 2;
const centerY = renderSize / 2;
const hue = Math.round(pseudoRandomDecimal() * 360);
const linecolor = `hsl(${hue}, 50%, 45%)`; // "#0003"; // "#200704"
const ringCount = 200;
const rings = [];
const points = new Array(numPoints).fill([centerX, centerY]);
const bigStepCadence = Math.ceil(
  pseudoRandomDecimal() * renderSize * 0.01 + renderSize * 0.001
);
let barkThicknesses;
let barkSteps;

function fillCanvasBackground() {
  ctx.fillStyle = `hsl(${hue + 130}, 40%, 50%)`;
  ctx.fillRect(0, 0, renderSize, renderSize);
}

function expandPoints(growth, ringnumber = 0) {
  points.forEach((coordinates, i) => {
    let [x, y] = coordinates;
    const degree = ((i * 360) / numPoints / 360) * TAU;
    let randomJiggleDistance =
      (pseudoRandomDecimal() - 0.5) * wigglynessfactor * ringnumber * 0.05;

    let dx = growth + randomJiggleDistance;
    let dy = growth + randomJiggleDistance;
    if (dx < 1) dx = 1;
    if (dy < 1) dy = 1;
    x = x + Math.sin(degree) * dx;
    y = y + Math.cos(degree) * dy;

    points[i] = [x, y];
  });
}

function drawRingCoordinates(coords) {
  ctx.moveTo(coords[0][0], coords[0][1]);
  ctx.beginPath();
  coords.forEach(([x, y]) => {
    ctx.lineTo(x, y);
  });
  ctx.closePath();
}

function drawRingStroke(ringCoordinates, linewidth = 1, color = linecolor) {
  drawRingCoordinates(ringCoordinates);
  ctx.strokeStyle = color;
  ctx.lineWidth = linewidth;
  ctx.stroke();
}

function fillTreeRing(ringCoordinates, lightness) {
  drawRingCoordinates(ringCoordinates);
  ctx.fillStyle = `hsl(${hue}, 50%, ${lightness}%)`;
  ctx.fill();
}

function smoothPoints() {
  for (let i = 0; i < points.length; i++) {
    let h = i - 1;
    let j = i + 1;

    // Loop indicies
    h = h >= 0 ? h : points.length - 1;
    j = j > points.length - 1 ? 0 : j;

    let xa = points[h][0];
    let ya = points[h][1];
    let xb = points[i][0];
    let yb = points[i][1];
    let xc = points[j][0];
    let yc = points[j][1];

    let centerWeightMultiplier = Math.round(smoothFactor);
    let x =
      (xa + xb * centerWeightMultiplier + xc) / (centerWeightMultiplier + 2);
    let y =
      (ya + yb * centerWeightMultiplier + yc) / (centerWeightMultiplier + 2);

    points[i] = [x, y];
  }
}

// Construct ring points
function constructRingPoints() {
  let expandDistance = renderSize * 0.008;
  const minExpand = (1 / ringCount) * 400;
  for (let i = 0; i < ringCount; i++) {
    expandPoints(expandDistance, i);
    smoothPoints();
    // Reduce expand distance after the first few steps
    expandDistance -= 0.25;
    if (expandDistance < minExpand) {
      expandDistance = minExpand;
    }
    //
    let ringPastLargestSize = points.some((coords) => {
      return coords[0] > renderSize * 0.92;
    });
    if (ringPastLargestSize) {
      break;
    } else {
      rings.push(JSON.parse(JSON.stringify(points)));
    }
  }
}

// Fill on occasion
function drawTreeFills(ringEdge = 10) {
  for (let i = ringEdge - 1; i >= 0; i -= bigStepCadence) {
    let lightness = (i / rings.length) * 50;
    let thisRing = rings[i];
    fillTreeRing(thisRing, 50 + lightness);
  }
}

// Darker rings
function drawSeparatorRings(ringEdge = 10) {
  for (let i = 0; i < ringEdge; i += bigStepCadence) {
    let thisRing = rings[i];
    let color = `hsl(${hue}, 50%, 45%)`;
    drawRingStroke(thisRing, 2, color);
  }
}

function constructBarkThicknesses() {
  barkThicknesses = Array(rings.length)
    .fill(0)
    .map((item) => {
      return (
        pseudoRandomDecimal() * renderSize * barkWidthModifier * barkRoughness +
        renderSize * barkWidthModifier
      );
    });
  barkSteps = Array(numPoints)
    .fill(0)
    .map((item) => {
      return Math.round(pseudoRandomDecimal() * 10) + 5;
    });
}
// Bark
function drawBarkRing(ringEdge = 10) {
  let barkRing = rings[ringEdge];
  for (let i = 0; i < rings[0].length; i) {
    let barkStep = barkSteps[i];
    let j = i + barkStep + 2;
    j = j > barkRing.length - 1 ? 0 : j;
    ctx.beginPath();
    ctx.moveTo(Math.round(barkRing[i][0]), Math.round(barkRing[i][1]));
    ctx.lineTo(Math.round(barkRing[j][0]), Math.round(barkRing[j][1]));
    ctx.closePath();
    ctx.strokeStyle = barkColor;
    ctx.lineWidth = (barkThicknesses[i] * ringEdge) / rings.length;
    ctx.stroke();
    i += barkStep;
  }
}

function drawAllRings(ringEdge = 10) {
  for (let i = 0; i < ringEdge; i++) {
    let thisRing = rings[i];
    let color = `hsl(${hue}, 50%, 45%)`;
    // let width = Math.ceil(renderSize * 0.001);
    drawRingStroke(thisRing, 0.5, color);
  }
}

resizeCanvas();
constructRingPoints();
constructBarkThicknesses();
const ringsOG = JSON.parse(JSON.stringify(rings));

// Draw
let ringCounter = 0;
let frameCount = 0;
function draw(time = 0) {
  frameCount++;
  ringCounter = Math.round(frameCount * 1);
  fillCanvasBackground();
  drawTreeFills(ringCounter);
  drawBarkRing(ringCounter);
  drawSeparatorRings(ringCounter);
  drawAllRings(ringCounter);
  if (ringCounter < rings.length - 1) {
    window.requestAnimationFrame(draw);
  }
}
draw();
