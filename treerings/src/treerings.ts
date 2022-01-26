const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const renderSize = 2 ** 10;

function resizeCanvas(size = renderSize) {
  canvas.width = size;
  canvas.height = size;
}

const TAU = Math.PI * 2;
const numPoints = 260;
const wigglynessfactor = Math.random() * 4;
const smoothFactor = Math.random() * 5 + 1;
const barkWidthModifier = Math.random() * 0.04 + 0.02;
const barkRoughness = Math.random();
const barkColor = Math.random() > 0.5 ? "white" : "black"; //`hsl(${hue + 130}, 60%, 38%)`;
const centerX = renderSize / 2;
const centerY = renderSize / 2;
const hue = Math.round(Math.random() * 360);
const linecolor = `hsl(${hue}, 50%, 45%)`; // "#0003"; // "#200704"
const ringCount = 50 * Math.random() + 50;
const rings = [];
const points = new Array(numPoints).fill([centerX, centerY]);
const bigStepCadence = Math.ceil(
  Math.random() * renderSize * 0.01 + renderSize * 0.001
);

function fillCanvasBackground() {
  ctx.fillStyle = `hsl(${hue + 130}, 40%, 50%)`;
  ctx.fillRect(0, 0, renderSize, renderSize);
}

function expandPoints(growth, ringnumber = 0) {
  points.forEach((coordinates, i) => {
    let [x, y] = coordinates;
    const degree = ((i * 360) / numPoints / 360) * TAU;
    let randomJiggleDistance =
      (Math.random() - 0.5) * wigglynessfactor * ringnumber * 0.05;

    x = x + Math.round(Math.sin(degree) * (growth + randomJiggleDistance));
    y = y + Math.round(Math.cos(degree) * (growth + randomJiggleDistance));
    // Split
    // if(i === 10 && ringnumber % 2 || i === 11 && (ringnumber - 1) % 2) {
    // if(i === 10){
    //   x = centerX;
    //   y = centerY;
    // }
    //
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

// FIXME this causes 4 corner inaccuracies plainly visible when heavily smoothing at the NE NW SE SW positions
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
  const minExpand = (1 / ringCount) * 300;
  for (let i = 0; i < ringCount; i++) {
    expandPoints(expandDistance, i);
    smoothPoints();
    // Reduce expand distance after the first few steps
    expandDistance -= 0.25;
    if (expandDistance < minExpand) {
      expandDistance = minExpand;
    }
    //
    rings.push(JSON.parse(JSON.stringify(points)));
  }
}

// Fill on occasion
function drawTreeFills() {
  for (let i = rings.length - 1; i >= 0; i -= bigStepCadence) {
    let lightness = (i / rings.length) * 50;
    let thisRing = rings[i];
    fillTreeRing(thisRing, 50 + lightness);
  }
}

// Darker rings
function drawSeparatorRings() {
  for (let i = rings.length - 1; i >= 0; i -= bigStepCadence) {
    let thisRing = rings[i];
    let color = `hsl(${hue}, 50%, 45%)`;
    drawRingStroke(thisRing, 2, color);
  }
}

// Bark
function drawBarkRing() {
  let barkRing = rings[rings.length - 1];
  for (let i = 0; i < barkRing.length; i) {
    let barkStep = Math.round(Math.random() * 10) + 5;
    let j = i + barkStep + 2;
    j = j > barkRing.length - 1 ? 0 : j;
    ctx.beginPath();
    ctx.moveTo(Math.round(barkRing[i][0]), Math.round(barkRing[i][1]));
    ctx.lineTo(Math.round(barkRing[j][0]), Math.round(barkRing[j][1]));
    ctx.closePath();
    ctx.strokeStyle = barkColor;
    ctx.lineWidth =
      Math.random() * renderSize * barkWidthModifier * barkRoughness +
      renderSize * barkWidthModifier;
    ctx.stroke();
    i += barkStep;
  }
}

function drawAllRings() {
  for (let i = 0; i < rings.length; i++) {
    let thisRing = rings[i];
    let color = `hsl(${hue}, 50%, 45%)`;
    // let width = Math.ceil(renderSize * 0.001);
    drawRingStroke(thisRing, 0.5, color);
  }
}

resizeCanvas();
fillCanvasBackground();
constructRingPoints();
drawTreeFills();
drawBarkRing();
drawSeparatorRings();
drawAllRings();
// Draw
