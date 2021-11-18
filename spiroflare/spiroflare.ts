import { pseudoRandom } from "./utils";

const c = <HTMLCanvasElement>document.getElementById("canvas");
const ctx = <CanvasRenderingContext2D>c.getContext("2d");
let frameNumber = 0;

const canvasSize = 2 ** 11;
c.width = canvasSize;
c.height = canvasSize;

// let seed = 130;
let seed = Math.ceil(Math.random() * 100);
document.getElementById("seed").innerHTML = `${seed}`;

let generator = pseudoRandom(seed);
function pseudoRandomDecimal() {
  return parseFloat(`0.${generator.next().value.toString().slice(-5)}`);
}

const artStyles = [
  {
    name: "NeonFossils",
    clearBetweenFrames: false,
    fadeAlpha: false,
    fadeAlphaRate: 0.001,
    stopAtZeroWidth: true,
    concentricLines: false,
    coverageChange: 0.999995,
    coverageStart: c.width * 0.2,
    rotateMagnitude: 0.2,
    actorCount: 10,
    globalCompositeOperation: "source-over",
    actorStepDistance: 10,
    actorStepsPerFrame: 200,
    lineRadiusStart: 4,
    lineRadiusChangeRate: 0.99999,
    arcPosition(time, coverage, variance): [number, number] {
      return [
        c.width / 2 +
          Math.sin(time * 0.000153245 + variance * 2345645) *
            coverage *
            variance +
          Math.sin(time * 0.00174565342 + variance * 3.73645) *
            coverage *
            variance,
        c.height / 2 +
          Math.cos(time * 0.000132546 + variance * 76456543) *
            coverage *
            variance +
          Math.cos(time * 0.0012536345 + variance * 2.65484564) *
            coverage *
            variance,
      ];
    },
  },
  {
    name: "StarBurst",
    clearBetweenFrames: false,
    fadeAlpha: false,
    fadeAlphaRate: 0.001,
    stopAtZeroWidth: true,
    concentricLines: false,
    coverageChange: 1,
    coverageStart: c.width * 0.3,
    rotateMagnitude: 0.2,
    actorCount: 10,
    globalCompositeOperation: "source-over",
    actorStepDistance: 10,
    actorStepsPerFrame: 200,
    lineRadiusStart: 4,
    lineRadiusChangeRate: 0.99999,
    arcPosition(time, coverage, variance): [number, number] {
      return [
        c.width / 2 + Math.sin(time * 0.001) * coverage,
        c.height / 2 + Math.sin(time * 0.001) * coverage,
      ];
    },
  },
  {
    name: "TorusSpectre",
    clearBetweenFrames: false,
    maxFrames: 80,
    fadeAlpha: false,
    fadeAlphaRate: 0.001,
    stopAtZeroWidth: true,
    concentricLines: false,
    coverageChange: 0.999999,
    coverageStart: c.width * 0.3,
    rotateMagnitude: 0.04,
    actorCount: 3,
    globalCompositeOperation: "source-over",
    actorStepDistance: 15,
    actorStepsPerFrame: 60,
    lineRadiusStart: 4,
    lineRadiusChangeRate: 1,
    arcPosition(time, coverage, variance): [number, number] {
      // prettier-ignore
      return [
        c.width / 2 + Math.sin((time * 0.001+variance*500) * Math.PI * 2 * (1 / 2) ) * coverage,
        c.height / 2 + Math.cos((time * 0.001+variance*500) * Math.PI * 2 * (1 / 6)) * coverage,
      ];
    },
  },
  {
    name: "PetalNebula",
    clearBetweenFrames: false,
    maxFrames: undefined,
    fadeAlpha: false,
    fadeAlphaRate: 0.001,
    stopAtZeroWidth: true,
    concentricLines: false,
    coverageChange: 0.999997,
    coverageStart: c.width * 0.73,
    rotateMagnitude: 0.007,
    actorCount: 7,
    globalCompositeOperation: "source-over",
    actorStepDistance: 10,
    actorStepsPerFrame: 400,
    lineRadiusStart: 4,
    lineRadiusChangeRate: 1,
    arcPosition(time, coverage, variance): [number, number] {
      // prettier-ignore
      return [
        c.width / 2 + Math.sin(time*0.002 + variance * 6523) * coverage * variance*0.4
        + Math.sin(time*0.001142) * coverage * 0.3,
        c.height / 2 + Math.cos(time*0.002 + variance * 2543) * coverage * variance*0.4
        + Math.cos(time*0.001142) * coverage * 0.3,
      ];
    },
  },
  {
    name: "SpiroCoil",
    clearBetweenFrames: false,
    maxFrames: undefined,
    fadeAlpha: false,
    fadeAlphaRate: 0.001,
    stopAtZeroWidth: true,
    concentricLines: false,
    coverageChange: 0.999997,
    coverageStart: c.width * 0.65,
    rotateMagnitude: 0.1,
    actorCount: 7,
    globalCompositeOperation: "source-over",
    actorStepDistance: 10,
    actorStepsPerFrame: 400,
    lineRadiusStart: 4,
    lineRadiusChangeRate: 0.99995,
    arcPosition(time, coverage, variance): [number, number] {
      // prettier-ignore
      return [
        c.width / 2 + Math.sin(time*0.002 + variance * 6523) * coverage * variance*0.4
        + Math.sin(time*0.001142) * coverage * 0.3,
        c.height / 2 + Math.cos(time*0.002 + variance * 2543) * coverage * variance*0.4
        + Math.cos(time*0.001142) * coverage * 0.3,
      ];
    },
  },
];

const options = artStyles[2];
document.getElementById("artname").innerHTML = `${options.name}`;

let globalAlpha = 1;
const colorRange = options.colorRange;
const hueShift = options.colorHueShift;

function draw(time: number) {
  frameNumber++;
  if (options.fadeAlpha) {
    globalAlpha -= options.fadeAlphaRate;
    globalAlpha = globalAlpha < 0 ? 0 : globalAlpha;
    ctx.globalAlpha = globalAlpha;
  }
  if (options.clearBetweenFrames) {
    fillWithBlack();
  }
  rotateCanvas();
  drawParticles(time);
  if (!options.maxFrames || options.maxFrames > frameNumber) {
    if (!options.stopAtZeroWidth || coverage > 1) {
      window.requestAnimationFrame(draw);
    }
  }
}

function rotateCanvas() {
  ctx.translate(c.width / 2, c.height / 2);
  ctx.rotate(options.rotateMagnitude);
  ctx.translate(-c.width / 2, -c.height / 2);
}

const variances: number[] = [];
for (let i = 0; i < options.actorCount; i++) {
  variances.push(pseudoRandomDecimal());
}

function drawParticles(time: number) {
  ctx.globalCompositeOperation = options.globalCompositeOperation;

  colors.forEach(([tDiff, color]) => {
    variances.forEach((v) => {
      drawParticle(time, v, tDiff, color);
    });
  });
}

const colors: [number, string][] = [];
for (
  let i = -options.actorStepsPerFrame / 2;
  i < options.actorStepsPerFrame / 2;
  i++
) {
  let linearDecimalPeak =
    1 - Math.abs(i) * (1 / (options.actorStepsPerFrame / 2));
  let hue = i * (colorRange / options.actorStepsPerFrame) + hueShift;
  let saturation = 100;
  let lightness = linearDecimalPeak * 80 + 40;
  let alpha = linearDecimalPeak;
  colors.push([
    i * options.actorStepDistance,
    `hsla(${hue}, ${saturation}%, ${lightness}%, ${alpha})`,
  ]);
}

function drawParticle(
  time: number,
  variance: number = 2.6432557,
  tDiff: number = 0,
  color: string = "#fff"
) {
  drawCircle(time + tDiff, color, variance);
}

let coverage = options.coverageStart;
let radius = options.lineRadiusStart;
function drawCircle(time: number, color: string, variance: number) {
  ctx.beginPath();
  radius *= options.lineRadiusChangeRate;
  if (options.concentricLines) {
    coverage -= options.coverageChange;
  } else {
    coverage *= options.coverageChange;
  }
  let [arcX, arcY] = options.arcPosition(time, coverage, variance);
  ctx.arc(arcX, arcY, radius, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.closePath();
}

function fillWithBlack() {
  ctx.globalCompositeOperation = "source-over";
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, c.width, c.height);
}

fillWithBlack();
draw(0);
