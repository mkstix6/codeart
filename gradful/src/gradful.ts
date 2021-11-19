import { pseudoRandom } from "../utils";

const canvasElement = <HTMLCanvasElement>document.getElementById("canvas");
let ctx: CanvasRenderingContext2D;

let seed = Math.ceil(Math.random() * 100);
let preset: number = 0;

const renderSize = 2 ** 10;
let options;
let hardTime = 0;
let frameNumber = 0;
let radius: number = canvasElement.width * 0.5;

function startDrawing() {
  canvasElement.width = renderSize;
  canvasElement.height = renderSize;
  ctx = <CanvasRenderingContext2D>canvasElement.getContext("2d");

  // Prep a bunch of random numbers so they're stable as we add more presets
  let optionsPRDs = [];
  for (let i = 0; i < 100; i++) {
    optionsPRDs.push(pseudoRandomDecimal());
  }

  const artStyles = [
    {
      name: "___gradful___",
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
  fillWithBlack();
  hardTime += 16;
  frameNumber++;
  // drawColumn(hardTime, -canvasElement.width * 0.1);
  drawColumn(hardTime, 0);
  // drawColumn(hardTime, canvasElement.width * 0.1);
  window.requestAnimationFrame(draw);
}

let hDistance = canvasElement.width * 0.5;
let vDistance = canvasElement.width * 0.4;

function drawColumn(time, offset) {
  let hue = 0;

  time += offset * 100;
  for (let i = -canvasElement.width * 3; i < canvasElement.width * 3; i += 3) {
    hue -= canvasElement.width * 0.0007523;

    let xPos =
      offset +
      canvasElement.width / 2 +
      Math.sin((time * 0.14321 + i * 1.1523) * 0.003 * 2.62634) *
        hDistance *
        2.3 -
      (Math.sin((time * 0.7343 + i * 2.3321) * 0.00952345) + 2) *
        hDistance *
        0.2;

    let yPos =
      i +
      Math.sin((time + i ** 1.32345) / 1000) * vDistance -
      canvasElement.height * 1.3 +
      Math.sin((time + i * 0.4231) / 1000) * vDistance -
      canvasElement.height * 0.2;

    let rad =
      canvasElement.width * 0.1 +
      i * 0.01 +
      (Math.sin((time * 0.5 + i * 1.1654) * 0.003412421) + 2) *
        radius *
        0.152453 -
      (Math.sin((time * 0.5 + i * 1.7321) * 0.00952345) + 2) * radius * 0.1643;
    ctx.beginPath();
    ctx.ellipse(
      xPos,
      yPos,
      rad,
      rad + rad * 0.1 * Math.sin(time * 0.001234),
      time * 0.000235,
      0 + time * 0.001,
      Math.PI * 2 + time * 0.001
    );
    ctx.fillStyle = `hsl(${hue + time * 0.05}, 85%, 55%)`;
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
