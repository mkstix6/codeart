// Crunch Gradient code
// Either make a smooth one then mess it up
// Or probabilistically fill the canvas depending on distance from gradient point
const TAU = Math.PI * 2;
const canvasElement = <HTMLCanvasElement>document.getElementById("canvas");
let ctx: CanvasRenderingContext2D;
const debug: boolean = false;

const renderSize = 2 ** 10;
const renderWidth = renderSize;
const renderHeight = renderSize;
const pixelSize = 10;
let bgColor = "#000";

interface colorPoint {
  x: number;
  y: number;
  hsl: [number, number, number];
}

interface colorProximities {
  proximity: number;
  hsl: [number, number, number];
}

let colorPoints: colorPoint[] = [
  {
    x: 0.3,
    y: 0.3,
    hsl: [171, 48, 52],
  },
  {
    x: 0.9,
    y: 0.9,
    hsl: [46, 100, 50],
  },
].map((colorpoint: colorPoint): colorPoint => {
  colorpoint.x = colorpoint.x * renderWidth;
  colorpoint.y = colorpoint.y * renderHeight;
  colorpoint.hsl = colorpoint.hsl;
  return colorpoint;
});

function startDrawing() {
  // Pre setup
  ctx = <CanvasRenderingContext2D>canvasElement.getContext("2d");
  canvasElement.width = renderSize;
  canvasElement.height = renderSize;
  // Setup

  // Start
  fillCanvas(bgColor);
  draw();
}

const strongestProximities = (
  proximities: colorProximities[],
  count: number = proximities.length
) =>
  [...proximities]
    .sort(({ proximity: a }, { proximity: b }) => (a > b ? 1 : a < b ? -1 : 0))
    .slice(0, count);

function draw(time: number = 0) {
  for (let i = 0; i < canvasElement.width; i += pixelSize) {
    for (let j = 0; j < canvasElement.height; j += pixelSize) {
      let fuzzyI = Math.random() > 0.5 ? i - 5 : i + 5;
      let fuzzyJ = Math.random() > 0.5 ? j - 5 : j + 5;
      let proximities: colorProximities[] = colorPointProximities(
        fuzzyI,
        fuzzyJ
      );
      let color: string = chooseColor(strongestProximities(proximities, 5));
      drawPixel(i, j, color, pixelSize);
    }
  }
  // Overlay color points onto gradient
  if (debug) {
    drawColorHandles();
  }
}

function drawColorHandles() {
  // Draw actual points
  colorPoints.forEach(({ x, y, hsl: [h, s, l] }) => {
    ctx.beginPath();
    ctx.arc(x, y, 10, 0, TAU);
    ctx.fillStyle = hsl(h, s, l);
    ctx.strokeStyle = "#000";
    ctx.fill();
    ctx.stroke();
    ctx.closePath();
  });
}

const sum = (acc, curr) => acc + curr;

function chooseColor(proximities: colorProximities[]): string {
  // Normalise proximities
  let totalProximity = proximities
    .map(({ proximity }) => proximity)
    .reduce(sum);
  proximities.forEach((item) => {
    item.proximity = (totalProximity - item.proximity) / totalProximity;
  });

  let breakPoint = proximities[0].proximity;
  let colorParts =
    Math.random() < breakPoint ? proximities[0].hsl : proximities[1].hsl;

  return hsl(...colorParts);
}

const hsl = (h: number, s: number, l: number): string =>
  `hsl(${h},${s}%,${l}%)`;

function colorPointProximities(
  pixelX: number,
  pixelY: number
): colorProximities[] {
  let absoluteProximities = colorPoints.map((point) => {
    let proximity = Math.sqrt(
      (point.x - pixelX) ** 2 + (point.y - pixelY) ** 2
    );
    return {
      proximity: proximity ** 2,
      hsl: point.hsl,
    };
  });
  return absoluteProximities;
}

function fillCanvas(color: string) {
  ctx.globalCompositeOperation = "source-over";
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, canvasElement.width, canvasElement.height);
}

function drawPixel(x: number, y: number, color: string, size: number) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, pixelSize, pixelSize);
  if (debug) {
    ctx.fillStyle = "white";
    ctx.fillRect(x, y, 1, 1);
  }
}

startDrawing();
