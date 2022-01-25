import { pseudoRandom } from "../utils";

// Universal constants
const TAU = 2 * Math.PI;
const flakeAngle = TAU / 6;
// Initial setup
const numberOfFlakes = 300;
const niceBlueColor = "hsl(201.53, 100%, 30%)";
const darkBlueColor = "#000818";
const lightBlueColor = "#85dcfb";
const bgColor = lightBlueColor;

const canvas = <HTMLCanvasElement>document.getElementById("canvas");
const ctx = <CanvasRenderingContext2D>canvas.getContext("2d");

const renderSize = 1080; //2 ** 11;
canvas.width = renderSize;
canvas.height = renderSize;

const artSpeedModifier = 0.6;

// Set up create capture to record animation frames to WebM Video (Chrome only)
const recordAndCaptureWEBM = false;
const recordSeconds = 30;
const recordFPS = 60;
const recordDuration = recordSeconds * recordFPS;
var capturer = new CCapture({
  format: "webm",
  framerate: recordFPS,
  verbose: true,
});
if (recordAndCaptureWEBM) {
  capturer.start();
}

interface CanvasPathShape {
  rotateCoordinates(angle: number): void;
  draw(x: number, y: number, rotateAngle: number, color: string): void;
}

class SnowFlake implements CanvasPathShape {
  seed: number = 0;
  pseudoRandomGen;
  originX: number = 0;
  originY: number = 0;
  backTrack: number = 0.5;
  shortening: number = 0.5;
  wholeFlakeRotationAngle: number = 0;
  armSplits: number = 5;
  clockwise: boolean = true;
  coordinates: number[] = [0, 0];
  rotateSpeed: number = 0;
  frame = Math.floor(Math.random() * 1000);
  glitchLoop: number = 200;
  lineWidth: number = 1;
  centralPlateSize: number = 0.5;
  centralPlateSize2: number = 0.25;
  flakeDiameter: number = 30;
  OGCoordinates: number[] = [];
  drawCoordinates: number[] = [];
  constructor(seed = 1, size = 10) {
    this.seed = seed;
    this.size = size;
    this.pseudoRandomGen = pseudoRandom(this.seed, "decimal");
    this.wholeFlakeRotationAngle =
      <number>this.pseudoRandomGen.next().value * TAU;
    this.lineWidth = 1;
    this.clockwise = true;
    this.glitchLoop = Math.floor(
      <number>this.pseudoRandomGen.next().value * 200 + 100
    );
    this.rotateSpeed = <number>this.pseudoRandomGen.next().value * 0.005 + 0.03;
    this.armSplits =
      Math.ceil(<number>this.pseudoRandomGen.next().value * 5) + 2;
    if (<number>this.pseudoRandomGen.next().value > 0.5) {
      this.rotateSpeed = -this.rotateSpeed;
    }
    this.randomiseFlakeProperties();
    this.buildFlakeCoordinates();
  }
  set size(diameter: number) {
    this.flakeDiameter = diameter;
  }
  randomiseFlakeProperties() {
    this.backTrack = <number>this.pseudoRandomGen.next().value * 0.9 + 0.1; // 0.55;
    this.centralPlateSize =
      <number>this.pseudoRandomGen.next().value * this.flakeDiameter * 0.3;
    this.centralPlateSize2 =
      <number>this.pseudoRandomGen.next().value * this.centralPlateSize * 0.8;
    this.shortening = <number>this.pseudoRandomGen.next().value * 0.9 + 0.1; // 0.62;
  }
  stepGrowHalfArmPoints(
    x: number,
    y: number,
    prevAngle: number,
    length: number
  ) {
    const newAngle = this.clockwise
      ? prevAngle + flakeAngle
      : prevAngle - flakeAngle;
    if (this.pseudoRandomGen.next().value > 0.5) {
      this.clockwise = !this.clockwise;
    }
    const newLength = length * this.shortening;
    const newx = x + Math.sin(newAngle) * newLength;
    const newy = y + Math.cos(newAngle) * newLength;
    const backx = x + Math.sin(newAngle) * (newLength * this.backTrack);
    const backy = y + Math.cos(newAngle) * (newLength * this.backTrack);
    this.randomiseFlakeProperties();
    return [newx, newy, newAngle, newLength, backx, backy];
  }
  buildFlakeCoordinates() {
    this.pseudoRandomGen = pseudoRandom(this.seed, "decimal");
    // Flake settings
    const armSplits = this.armSplits;
    let x = 0;
    let y = 0;
    let angle = -flakeAngle; // I would make this angle zero (0) but we rotate first and this makes reflecting the arm for symmetry convenient
    // let initialLength = this.lineWidth * 10;
    let initialLength = 15;
    let length = initialLength / this.shortening;
    let backx;
    let backy;
    let newx;
    let newy;
    let armCoordinates = [0, 0, 0, 0];
    for (let i = 0; i < armSplits; i++) {
      [x, y, angle, length, backx, backy] = this.stepGrowHalfArmPoints(
        x,
        y,
        angle,
        length
      );
      // Collect list of coordinates
      armCoordinates.push(x);
      armCoordinates.push(y);
      armCoordinates.push(backx);
      armCoordinates.push(backy);
      x = backx;
      y = backy;
    }
    // Scale arm to be target length
    let maxX = Math.max(
      ...armCoordinates.filter((c, i) => i % 2).map((x) => Math.abs(x))
    );
    let maxY = Math.max(
      ...armCoordinates.filter((c, i) => (i + 1) % 2).map((y) => Math.abs(x))
    );
    // FIXME this is a bit inaccurate because we jsut look for the largest x or y but not the largest hypotenuse from the origin
    let farthest = Math.max(maxX, maxY);
    let scaleValue = (this.flakeDiameter * 0.5) / farthest;
    armCoordinates = armCoordinates.map((c) => c * scaleValue);
    // Reflect points for symmetrical arm shape
    let reflectedArmCoordinates = [...armCoordinates];
    let halfArmArrayLength = reflectedArmCoordinates.length;
    for (let i = 0; i < halfArmArrayLength; i += 2) {
      newx = 0 - reflectedArmCoordinates[i];
      newy = reflectedArmCoordinates[i + 1];
      reflectedArmCoordinates.push(newx);
      reflectedArmCoordinates.push(newy);
    }
    // Create points for 5 other snowflake arms
    let snowFlakeCoordinates = [...reflectedArmCoordinates];
    for (let j = 0; j < 10; j++) {
      let startIndex = j * armCoordinates.length;
      for (let i = startIndex; i < startIndex + armCoordinates.length; i += 2) {
        let [newx, newy] = rotateCoordinates(
          [0, 0],
          [snowFlakeCoordinates[i], snowFlakeCoordinates[i + 1]],
          flakeAngle
        );
        snowFlakeCoordinates.push(newx);
        snowFlakeCoordinates.push(newy);
      }
    }
    this.OGCoordinates = snowFlakeCoordinates;
    this.drawCoordinates = snowFlakeCoordinates;
    this.coordinates = snowFlakeCoordinates;
  }
  rotateCoordinates(angle: number) {
    // Rotate entire snowflake by random amount
    for (let i = 0; i < this.OGCoordinates.length; i += 2) {
      let [newX, newY] = rotateCoordinates(
        [0, 0],
        [this.OGCoordinates[i], this.OGCoordinates[i + 1]],
        angle
      );
      this.drawCoordinates[i] = newX;
      this.drawCoordinates[i + 1] = newY;
    }
  }
  drawFlakeArms(path: Path2D, color = "white") {
    // Draw SVG from list of coordinates
    ctx.strokeStyle = color;
    ctx.lineWidth = this.lineWidth;

    for (let i = 0; i < this.drawCoordinates.length; i += 2) {
      // If end of arm return to origin without drawing ready for next arm
      // if (0 === (i % this.drawCoordinates.length) / 1) {
      if (this.drawCoordinates[i] === 0) {
        path.moveTo(
          this.originX + this.drawCoordinates[i],
          this.originY + this.drawCoordinates[i + 1]
        );
      } else {
        if (0 === i % 1) {
          path.lineTo(
            this.originX + this.drawCoordinates[i],
            this.originY + this.drawCoordinates[i + 1]
          );
        } else {
          path.moveTo(
            this.originX + this.drawCoordinates[i],
            this.originY + this.drawCoordinates[i + 1]
          );
        }
      }
    }
    ctx.stroke(path);
  }
  draw(x: number, y: number, rotateAngle: number, color: string): void {
    hexagon(ctx, x, y, this.centralPlateSize, rotateAngle + flakeAngle / 2);
    hexagon(ctx, x, y, this.centralPlateSize2, rotateAngle + flakeAngle / 2);
    // sunFlare(ctx, x, y, 10, 6, rotateAngle);
    this.originX = x;
    this.originY = y;
    this.drawCoordinates = [...this.OGCoordinates];
    this.rotateCoordinates(rotateAngle);
    let flakePath = new Path2D();
    this.drawFlakeArms(flakePath, color);
  }
}

interface ParticleOrchestrator {
  seed: number;
  frame: number;
  pseudoRandomGen: Generator;
  particles: [];
  draw(): void;
}

class DriftOrchestrator implements ParticleOrchestrator {
  seed = 1;
  frame = 0;
  pseudoRandomGen;
  particles: [] = [];
  gravityAdjust: number = 0;
  clock: number = 0;
  constructor(ParticleClass, particleCount: number) {
    this.seed = 1;
    // Initialise a random number generator
    this.pseudoRandomGen = pseudoRandom(this.seed, "decimal");
    // Build a list of particles
    for (let i = 0; i < particleCount; i++) {
      let particle = {};
      // particle.shape = new ParticleClass(i + 1);
      let minDiameter = 10;
      let maxDiameter = 100;
      let diameter = Math.random() * (maxDiameter - minDiameter) + minDiameter;
      particle.shape = new ParticleClass(
        Math.ceil(Math.random() * 9999),
        diameter
      );
      // Set particle rotation speed
      particle.rotate = 0;
      let minRotateSpeed = 0.01;
      particle.rotateSpeed =
        minRotateSpeed * <number>this.pseudoRandomGen.next().value +
        minRotateSpeed * 0.5;
      if (<number>this.pseudoRandomGen.next().value > 0.5) {
        particle.rotateSpeed = -particle.rotateSpeed;
      }
      // Set initial location
      particle.x = Math.floor(
        Math.random() * canvas.width * 1.2 - canvas.width * 0.1
      );
      particle.y = Math.floor(
        Math.random() * canvas.height * 1.2 - canvas.height * 0.1
      );
      // Set gravity variation (helps with staggered floaty paricles)
      particle.gravityAdjust = this.pseudoRandomGen.next().value;
      // Give each an internal clock and stagger the start points
      particle.clock = Math.floor(
        <number>this.pseudoRandomGen.next().value * 2000
      );
      //
      this.particles.push(particle);
    }
  }
  draw() {
    this.frame++;
    // Drift particles
    this.particles.forEach((particle) => {
      particle.clock += 1;
      this.particleGravity(particle);
      this.particleSway(particle);
      this.bigWind(particle);
      this.particleRotate(particle);
      particle.shape.draw(particle.x, particle.y, particle.rotate);
    });

    // TODO reimplement glitch
    if (false) {
      // Glitch animation
      if ((this.frame - 1) % this.glitchLoop === 0) {
        this.originX -= 10;
        // ctx.strokeStyle = "white";
      } else if (this.frame % this.glitchLoop === 0) {
        // ctx.strokeStyle = "hsl(201.53, 100%, 66.67%)";
      } else if ((this.frame + 1) % this.glitchLoop === 0) {
        this.originX += 10;
        this.seed = Math.floor(Math.random() * 10000);
        this.randomiseFlakeProperties();
        this.buildFlakeCoordinates();
        // ctx.strokeStyle = "white";
      } else {
        // ctx.strokeStyle = "white";
      }
    }
  }
  particleGravity(particle) {
    particle.y +=
      particle.gravityAdjust * 0.5 * artSpeedModifier +
      0.01 * Math.sin(particle.clock * artSpeedModifier * 0.1);
    if (particle.y > canvas.height + 40) particle.y = -40;
  }
  particleSway(particle) {
    particle.x +=
      artSpeedModifier *
      0.2 *
      Math.sin(particle.clock * artSpeedModifier * 0.013);
  }
  bigWind(particle) {
    particle.x += 0.3 * Math.sin(this.frame * artSpeedModifier * 0.004);
    // Teleport to other side if too far out of frame horizontally
    if (particle.x > canvas.width * 1.12) particle.x = -canvas.width * 0.1;
    if (particle.x < -canvas.width * 0.11) particle.x = canvas.width * 1.1;
  }
  particleRotate(particle) {
    // Change rotation speed slightly
    particle.rotate +=
      particle.rotateSpeed *
      Math.sin(artSpeedModifier * particle.clock * 0.001);
  }
}

const animationContainer = new DriftOrchestrator(SnowFlake, numberOfFlakes);

let frameCount = 0;
function main() {
  frameCount++;
  if (recordAndCaptureWEBM) {
    if (frameCount < recordDuration + 10) {
      window.requestAnimationFrame(main);
    } else {
      capturer.stop();
      capturer.save();
    }
  } else {
    window.requestAnimationFrame(main);
  }
  fillBackgroundGradient();
  animationContainer.draw();
  if (recordAndCaptureWEBM) {
    capturer.capture(canvas);
  }
}
main();

function fillBackgroundGradient(): void {
  // Create gradient
  var grd = ctx.createLinearGradient(
    canvas.width * 0.1,
    canvas.width * 0.25,
    canvas.width * 0.25,
    canvas.height
  );
  grd.addColorStop(0, niceBlueColor);
  grd.addColorStop(1, lightBlueColor);
  // Fill with gradient
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function fillCanvas(color: string = "white"): void {
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function rotateCoordinates(
  origin: [number, number] = [0, 0],
  point: [number, number],
  angle: number = (Math.PI * 2) / 360 // radians
): [number, number] {
  // Rotate a point counterclockwise by a given angle around a given origin.
  // The angle should be given in radians.
  let [ox, oy]: [number, number] = origin;
  let [px, py]: [number, number] = point;
  // Compute rotated x and y values
  let qx = ox + Math.cos(angle) * (px - ox) - Math.sin(angle) * (py - oy);
  let qy = oy + Math.sin(angle) * (px - ox) + Math.cos(angle) * (py - oy);
  return [qx, qy];
}

function scaleCoordinates(
  origin: [number, number] = [0, 0],
  point: [number, number],
  scale: number = 2
) {
  // Rotate a point counterclockwise by a given angle around a given origin.
  // The angle should be given in radians.
  let [ox, oy] = origin;
  let [px, py] = point;
  // Compute scaled x and y values
  let qx = (px - ox) * scale + ox;
  let qy = (py - oy) * scale + oy;
  return [qx, qy];
}

function hexagon(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  startAngle: number
) {
  polygon(ctx, x, y, radius, 6, startAngle);
}

function polygon(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  sides: number,
  startAngle: number
) {
  ctx.fillStyle = "#fff8";
  ctx.beginPath();
  if (sides < 3) return;
  var a = (Math.PI * 2) / sides;
  ctx.moveTo(...rotateCoordinates([x, y], [radius + x, y], startAngle));
  for (var i = 1; i < sides; i++) {
    ctx.lineTo(
      ...rotateCoordinates(
        [x, y],
        [x + radius * Math.cos(a * i), y + radius * Math.sin(a * i)],
        startAngle
      )
    );
  }
  ctx.closePath();
  ctx.stroke();
  ctx.fill();
}

function sunFlare(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  sides: number,
  startAngle: number
) {
  ctx.fillStyle = "#ffffff03";
  ctx.beginPath();
  if (sides < 3) return;
  var a = (Math.PI * 2) / sides;
  ctx.moveTo(...rotateCoordinates([x, y], [radius + x, y], startAngle));
  ctx.moveTo(0, 0);

  for (var i = 1; i < sides; i++) {
    ctx.lineTo(
      ...rotateCoordinates(
        [x, y],
        [radius * Math.cos(a * i), radius * Math.sin(a * i)],
        startAngle
      )
    );
    ctx.lineTo(x + radius * Math.cos(a * i), y + radius * Math.sin(a * i));
  }
  ctx.closePath();
  ctx.fill();
}
