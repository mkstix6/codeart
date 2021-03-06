import { pseudoRandom } from "../utils";

const canvasElement = <HTMLCanvasElement>document.getElementById("canvas");
let ctx: CanvasRenderingContext2D;

const renderSize = 2 ** 9;
let seed = Math.ceil(Math.random() * 100);
let preset: number = 2;
let preferAccuracyOverPerformance: boolean = false;

interface OptionsObject {
  name: string;
  forLoopParameters: [number, number, number];
  wiggleCharacter: (time: number, i: number) => WiggleParams;
}

type WiggleParams = {
  color: string;
  ellipseArguments: [number, number, number, number, number, number, number];
};

let options: OptionsObject;
let hardTime = 0;
const miliSecondsPerFrame = 1000 / 60;
let frameNumber: number;
let radius: number = canvasElement.width * 0.5;

function startDrawing() {
  frameNumber = 0;
  canvasElement.width = renderSize;
  canvasElement.height = renderSize;
  ctx = <CanvasRenderingContext2D>canvasElement.getContext("2d");

  // Prep a bunch of random numbers so they're stable as we add more presets
  let optionsPRDs = [];
  for (let i = 0; i < 100; i++) {
    optionsPRDs.push(pseudoRandomDecimal());
  }

  const artStyles: OptionsObject[] = [
    {
      name: "wigglyRandom",
      forLoopParameters: [-100, canvasElement.width + 100, 4],
      wiggleCharacter(time: number, i: number) {
        let hue = canvasElement.width * 0.0002507 * i - time * 0.016;

        let xPos =
          canvasElement.width / 2 +
          Math.sin((time * 0.14321 + i * 1.1523) * 0.003 * 2.62634) *
            hDistance *
            2.3 -
          (Math.sin((time * 0.7343 + i * 2.3321) * 0.00952345) + 2) *
            hDistance *
            0.2;

        let yPos =
          i +
          Math.sin((time + i ** 1.32345) / 1000) * vDistance +
          Math.sin((time + i * 0.4231) / 1000) * vDistance;

        let rad =
          canvasElement.width * 0.1 +
          i * 0.05 +
          (Math.sin((time * 0.5 + i * 1.1654) * 0.003412421) + 2) *
            radius *
            0.152453 -
          (Math.sin((time * 0.5 + i * 1.7321) * 0.00952345) + 2) *
            radius *
            0.1643;

        let color: string = `hsl(${hue}, 85%, 55%)`;

        let ellipseArguments: [
          number,
          number,
          number,
          number,
          number,
          number,
          number
        ] = [
          xPos,
          yPos,
          rad,
          rad + rad * 0.1 * Math.sin(time * 0.001234),
          time * 0.000235,
          0 + time * 0.001,
          Math.PI * 2 + time * 0.001,
        ];

        return {
          color,
          ellipseArguments,
        };
      },
    },
    {
      name: "wigglyPerfectLoop",
      forLoopParameters: [-100, canvasElement.width + 100, 4],
      wiggleCharacter(time: number, i: number) {
        const fps = 60;
        const loopDurationSeconds = 7;
        const totalFrames = loopDurationSeconds * fps;
        const totalLoopMiliSeconds = loopDurationSeconds * 1000;
        const frameFraction = 1 / totalFrames;
        const loopTime = time % totalLoopMiliSeconds;
        const loopProgressDecimal = loopTime / totalLoopMiliSeconds;

        let hue = loopProgressDecimal * 360 - i / 3;

        let xPos =
          canvasElement.width / 2 +
          Math.sin(Math.PI * 2 * loopProgressDecimal * 2 + i * 0.02) *
            hDistance *
            0.5 +
          Math.cos(Math.PI * 2 * loopProgressDecimal * 3 + i * 0.02) *
            hDistance *
            0.25;

        let yPos =
          i +
          Math.cos(Math.PI * 2 * loopProgressDecimal + i * 0.02) *
            vDistance *
            0.5 +
          Math.cos(Math.PI * 2 * loopProgressDecimal * 5 + i * 0.02) *
            vDistance *
            0.1;

        let rad =
          (Math.sin(Math.PI * 2 * loopProgressDecimal + i * 0.01) + 1.5) *
            canvasElement.width *
            0.05 +
          i * 0.1;

        let color: string = `hsl(${hue}, 85%, 55%)`;

        let ellipseArguments: [
          number,
          number,
          number,
          number,
          number,
          number,
          number
        ] = [xPos, yPos, rad, rad, 0, 0, Math.PI * 2];

        return {
          color,
          ellipseArguments,
        };
      },
    },
    {
      name: "wigglyChromieBlue",
      forLoopParameters: [-100, canvasElement.width + 100, 2],
      wiggleCharacter(time: number, i: number) {
        const fps = 60;
        const loopDurationSeconds = 7;
        const totalFrames = loopDurationSeconds * fps;
        const totalLoopMiliSeconds = loopDurationSeconds * 1000;
        const frameFraction = 1 / totalFrames;
        const loopTime = time % totalLoopMiliSeconds;
        const loopProgressDecimal = loopTime / totalLoopMiliSeconds;

        const hueRange = 75;
        const hueShift = 170;

        let hue: number =
          hueShift +
          hueRange *
            (Math.sin(Math.PI * 2 * -loopProgressDecimal * 2 + i * 0.011) *
              0.5 +
              0.5);

        let saturation: number =
          70 + 30 * Math.sin(Math.PI * 2 * loopProgressDecimal * 2 + i * 0.001);

        let lightness: number =
          30 + 30 * Math.sin(Math.PI * 2 * loopProgressDecimal * 2 + i * 0.001);

        saturation = 100;
        lightness = 50;

        let xPos =
          canvasElement.width / 2 +
          Math.sin(Math.PI * 2 * loopProgressDecimal * 2 + i * 0.02) *
            hDistance *
            0.5 +
          Math.cos(Math.PI * 2 * loopProgressDecimal * 3 + i * 0.02) *
            hDistance *
            0.25;

        let yPos =
          i +
          Math.cos(Math.PI * 2 * loopProgressDecimal + i * 0.02) *
            vDistance *
            0.5 +
          Math.cos(Math.PI * 2 * loopProgressDecimal * 5 + i * 0.02) *
            vDistance *
            0.1;

        let rad =
          (Math.sin(Math.PI * 2 * loopProgressDecimal + i * 0.01) + 1.5) *
            canvasElement.width *
            0.05 +
          i * 0.1;

        let color: string = `hsl(${hue}, ${saturation}%, ${lightness}%)`;

        let ellipseArguments: [
          number,
          number,
          number,
          number,
          number,
          number,
          number
        ] = [xPos, yPos, rad, rad, 0, 0, Math.PI * 2];

        return {
          color,
          ellipseArguments,
        };
      },
    },
  ];
  options = artStyles[preset];

  // Populate art info into page
  document.getElementById("seed").innerHTML = `${seed}`;
  document.getElementById("artname").innerHTML = `${options.name}`;

  // Start
  fillWithBlack();
  draw();
}

let generator = pseudoRandom(seed);
function pseudoRandomDecimal() {
  return parseFloat(`0.${generator.next().value.toString().slice(-5)}`);
}

function draw(time: number = 0) {
  if (preferAccuracyOverPerformance) {
    frameNumber++;
    hardTime = frameNumber * miliSecondsPerFrame;
  } else {
    hardTime = time;
  }
  fillWithBlack();
  drawColumn(hardTime);
  window.requestAnimationFrame(draw);
}

let hDistance = canvasElement.width * 0.5;
let vDistance = canvasElement.width * 0.4;

function drawColumn(time: number) {
  let [start, end, increment] = options.forLoopParameters;
  for (let i = start; i < end; i += increment) {
    let { color, ellipseArguments } = options.wiggleCharacter(time, i);
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.ellipse(...ellipseArguments);
    ctx.fill();
    ctx.closePath();
  }
}

function fillWithBlack() {
  ctx.globalCompositeOperation = "source-over";
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, canvasElement.width, canvasElement.height);
}

startDrawing();
