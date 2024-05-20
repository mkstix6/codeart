import { pseudoRandom } from "../utils";

const canvasElement = <HTMLCanvasElement>document.getElementById("canvas");
let ctx: CanvasRenderingContext2D;

const renderSize = 2 ** 11;
let seed = Math.ceil(Math.random() * 100);
let preset: number = 0;
let preferAccuracyOverPerformance: boolean = true;

const TAU = Math.PI * 2;
let bgColor;
let numberGrass = 30000;

const captureWEBM = true;
let loopsRecord = 3;
let loopTime = 8000;
const recordDuration = loopsRecord * loopTime;
let cutTime = loopTime * 0.5;
const doCut = false;
const doGrow = false;
const doCapture = false;

var capturer = doCapture
  ? new CCapture({ format: "webm", framerate: 60, verbose: false })
  : null;

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

function startDrawing() {
  // Pre setup
  ctx = <CanvasRenderingContext2D>canvasElement.getContext("2d");
  frameNumber = 0;
  canvasElement.width = renderSize;
  canvasElement.height = renderSize;
  // Setup
  var grd = ctx.createLinearGradient(0, 0, renderSize / 5, renderSize);
  grd.addColorStop(0, "#8cbf90");
  grd.addColorStop(1, "#78bacc");
  bgColor = grd;
  setupField();

  // Prep a bunch of random numbers so they're stable as we add more presets
  let optionsPRDs = [];
  for (let i = 0; i < 100; i++) {
    optionsPRDs.push(pseudoRandomDecimal());
  }

  const artStyles: OptionsObject[] = [
    {
      artname: "___new___",
    },
  ];
  options = artStyles[preset];

  // Populate art info into page
  document.getElementById("seed").innerHTML = `${seed}`;
  document.getElementById("artname").innerHTML = `${options.name}`;

  // Start
  fillCanvas(bgColor);
  if (doCapture) {
    capturer.start();
  }
  draw();
}

let generator = pseudoRandom(seed);
function pseudoRandomDecimal() {
  return parseFloat(`0.${generator.next().value.toString().slice(-5)}`);
}

function draw(time: number = 0) {
  if (doCapture) {
    if (time < recordDuration + 100) {
      window.requestAnimationFrame(draw);
    } else if (doCapture) {
      capturer.stop();
      capturer.save();
    }
  } else {
    window.requestAnimationFrame(draw);
  }

  // if (preferAccuracyOverPerformance) {
  //   frameNumber++;
  //   hardTime = frameNumber * miliSecondsPerFrame;
  // } else {
  //   hardTime = time;
  // }

  fillCanvas(bgColor);
  drawField(time);
  if (doCapture) {
    capturer.capture(canvasElement);
  }
}

function drawCustomLine(color: string, tipX: number, tipY: number) {
  //xStart, yStart, xBend, yBend, xEnd, yEnd) {
  let xStart = tipX - 5 - 5;
  let yStart = tipY + 100;
  let xBend = tipX - 5 + 5;
  let yBend = tipY + 10 + 50;
  let xEnd = tipX + 5 + 5;
  let yEnd = tipY + 100;
  ctx.beginPath();
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.moveTo(xStart, yStart);
  ctx.quadraticCurveTo(xBend, yBend, tipX, tipY);
  ctx.quadraticCurveTo(tipX, tipY, xEnd, yEnd);
  ctx.fill();
  ctx.stroke();
  ctx.closePath();
}

class grassBlade {
  variance;
  hue;
  saturation;
  lightness;
  color;
  xb1;
  xb2;
  yt;
  yb;
  constructor() {
    this.variance = pseudoRandomDecimal();
    this.saturation = pseudoRandomDecimal() * 20 + 30;
    this.lightness = pseudoRandomDecimal() * 20 + 60;
    this.yb =
      ((pseudoRandomDecimal() ** 10 * 1.3) / 0.25) * canvasElement.height;
    this.yt = this.yb;
    this.xb1 = (pseudoRandomDecimal() * 1.2 - 0.1) * canvasElement.width;
    this.xb2 = this.xb1 + this.yb * 0.02;
    // Color
    this.hue = pseudoRandomDecimal() * 15 + 120 + this.yt * 0.025;
  }
  draw(time: number) {
    let maxLength = this.yb * 0.8 ** 2 + 20;
    if (!doGrow) {
      this.yt = this.yb - maxLength;
    }
    // drawCustomLine(
    //   this.color,
    //   this.x + Math.sin(this.y * 0.01 + time * 0.001) * 10,
    //   this.y
    // );
    //xStart, yStart, xBend, yBend, xEnd, yEnd) {
    // let xStart = tipX - 5 - 5;
    // let yStart = tipY + 100;
    // let xBend = tipX - 5 + 5;
    // let yBend = tipY + 10 + 50;
    // let xEnd = tipX + 5 + 5;
    // let yEnd = tipY + 100;
    ctx.beginPath();
    ctx.fillStyle = HSLColor(this.hue, this.saturation, this.lightness);
    // ctx.strokeStyle = HSLColor(
    //   this.hue,
    //   this.saturation - 5,
    //   this.lightness - 5
    // );
    ctx.moveTo(this.xb1, this.yb);
    let currentBladeLength = this.yt - this.yb;
    // let bigWave =
    //   Math.sin((time * TAU) / loopTime) +
    //   Math.sin((3 * ((time * TAU) / loopTime)) / 3) * currentBladeLength * 0.2 +
    //   currentBladeLength * 0.2;

    let bigWave;
    let tempTime = this.xb1 * renderSize * 0.001 + time;
    if ((tempTime % loopTime) / loopTime < 0.5) {
      bigWave =
        (Math.sin((tempTime - loopTime / 8) * ((TAU * 2) / loopTime)) * 0.5 +
          0.5) *
        currentBladeLength *
        0.8;
    } else {
      bigWave = 0;
    }

    let wiggle =
      Math.sin(this.variance + time * ((TAU * 2) / loopTime)) *
      currentBladeLength *
      0.1;

    let littleWiggle =
      Math.sin(
        this.variance * 30 +
          time * ((TAU * Math.ceil(this.variance * 5)) / loopTime)
      ) *
      currentBladeLength *
      this.variance *
      0.005;

    ctx.quadraticCurveTo(
      this.xb1 + bigWave + wiggle + littleWiggle,
      this.yt + this.variance * 5,
      this.xb2,
      this.yb
    );
    ctx.fill();
    // ctx.stroke();
    ctx.closePath();
    if (this.yb - this.yt < maxLength) {
      this.yt -= this.variance * this.yb * 0.002 + 0.4;
    }

    // Trim
    if (!doGrow) {
      this.yt = this.yb - maxLength;
    } else {
      if (
        doCut &&
        ((this.xb1 + Math.floor(this.yb / 100) * 600 + time * 0.3) % cutTime) +
          100 >
          cutTime
      ) {
        this.yt = this.yb - 4;
      }
    }
  }
}

const HSLColor = (hue, saturation, lightness) =>
  `hsl(${hue},${saturation}%,${lightness}%)`;

let bladeNumber = numberGrass;
let blades: grassBlade[] = [];

function setupField() {
  for (let i = 0; i < bladeNumber; i++) {
    blades.push(new grassBlade());
  }
  blades.sort(({ yb: a }, { yb: b }) => (a > b ? 1 : a < b ? -1 : 0));
}

function drawField(time: number) {
  // ctx.transform(1, 1, (Math.sin(time * 0.001) + 1) / 2, 1, 1, 1);
  blades.forEach((blade) => {
    blade.draw(time);
  });
}

function fillCanvas(color: string) {
  ctx.globalCompositeOperation = "source-over";
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, canvasElement.width, canvasElement.height);
}

startDrawing();
