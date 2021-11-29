// Meshy Mesh Gradient code
// Either make a smooth one then mess it up
// Or probabilistically fill the canvas depending on distance from gradient point
const TAU = Math.PI * 2;
const canvasElement = <HTMLCanvasElement>document.getElementById("canvas");
let ctx: CanvasRenderingContext2D;

const renderSize = 2 ** 9;
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
    hsl: [0, 100, 50],
  },
  {
    x: 0.9,
    y: 0.9,
    hsl: [90, 100, 50],
  },
  {
    x: 0.9,
    y: 0.1,
    hsl: [180, 100, 50],
  },
  {
    x: 0.1,
    y: 0.8,
    hsl: [270, 100, 50],
  },
  // {
  //   x: 0.5,
  //   y: 0.5,
  //   hsl: [180, 100, 50],
  // },
].map((colorpoint) => {
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
      let color: string = mixColors(strongestProximities(proximities, 5));
      // let color: string = mixColors(proximities);
      drawPixel(i, j, color, pixelSize);
      // if (!(i % 20) && !(j % 20)) {
      //   console.log({ i, j, color }, pixelSize, proximities);
      // } else {
      // }
    }
  }
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

function mixColors(proximities: colorProximities[]): string {
  let totalProximity = proximities
    .map(({ proximity }) => proximity)
    .reduce(sum);
  proximities.forEach((item) => {
    item.proximity = (totalProximity - item.proximity) / totalProximity;
  });

  let colorParts = proximities.reduce(
    (acc, curr) => {
      let {
        proximity,
        hsl: [h, s, l],
      } = curr;
      acc.h = acc.h + h * proximity;
      acc.s = acc.s + s * (totalProximity - proximity);
      acc.l = acc.l + l * (totalProximity - proximity);
      return acc;
    },
    { h: 0, s: 0, l: 0 }
  );
  colorParts.h = Math.round(colorParts.h);
  colorParts.s = 100; //Math.round(colorParts.s / proximities.length);
  colorParts.l = 50; //Math.round(colorParts.l / proximities.length);

  return hsl(colorParts.h, colorParts.s, colorParts.l);
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
      proximity: proximity ** 5,
      hsl: point.hsl,
    };
  });
  // let totalProx = absoluteProximities.reduce(
  //   (acc, curr) => acc + curr.proximity,
  //   0
  // );
  // let normalisedProximities = absoluteProximities.map((prox) => {
  //   prox.proximity = (totalProx - prox.proximity) / totalProx;
  //   return prox;
  // });
  // return normalisedProximities;
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
  ctx.fillStyle = "white";
  ctx.fillRect(x, y, 1, 1);
}

startDrawing();
