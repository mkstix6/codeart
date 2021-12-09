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

class SnowFlake {
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
  constructor(seed = 1, size = 10) {
    this.seed = seed;
    this.size = size;
    this.pseudoRandomGen = pseudoRandom(this.seed, "decimal");
    // this.gravityAdjust = this.pseudoRandomGen.next().value * 0.5 + 0.3;
    this.wholeFlakeRotationAngle = this.pseudoRandomGen.next().value * TAU;
    this.lineWidth = 1;
    this.clockwise = true;
    this.glitchLoop = Math.floor(this.pseudoRandomGen.next().value * 200 + 100);
    this.rotateSpeed = this.pseudoRandomGen.next().value * 0.005 + 0.03;
    this.armSplits = Math.ceil(this.pseudoRandomGen.next().value * 5) + 2;
    if (this.pseudoRandomGen.next().value > 0.5) {
      this.rotateSpeed = -this.rotateSpeed;
    }
    this.randomiseFlakeProperties();
    this.buildFlakeCoordinates();
  }
  set size(diameter: number) {
    this.flakeDiameter = diameter;
  }
  randomiseFlakeProperties() {
    this.backTrack = this.pseudoRandomGen.next().value * 0.9 + 0.1; // 0.55;
    this.centralPlateSize =
      this.pseudoRandomGen.next().value * this.flakeDiameter * 0.5;
    this.centralPlateSize2 =
      this.pseudoRandomGen.next().value * this.centralPlateSize;
    this.shortening = this.pseudoRandomGen.next().value * 0.9 + 0.1; // 0.62;
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

    // scaleCoordinates
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
    // let [newX, newY] = rotateCoordinates(
    //   [0, 0],
    //   [this.OGCoordinates[i], this.OGCoordinates[i + 1]],
    //   angle
    // );

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
  // gravity() {
  //   this.originY +=
  //     Math.sin((0.1 * this.frame) / TAU + this.gravityAdjust * 20) * 0.2 + 0.4;

  //   this.originX +=
  //     Math.sin((0.1 * this.frame) / TAU + this.gravityAdjust * 20) * 0.2;

  //   if (this.originY > canvas.height + 50) {
  //     this.originY = -50;
  //     this.originX = Math.random() * canvas.width;
  //   }
  //   // this.coordinates = this.coordinates.map((c, i) => {
  //   //   return i % 2 === 1 ? c + 1 : c;
  //   // });
  // }
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
  drawFlakeArms(path, color = "white") {
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
          // FIXME this could be 6 or 12 ???
          // FIXME Performance (is moveTo noticably cheaper than lineTo)??? actually… could we skip drawing every other line because they're back tracking along the arm spike
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
  draw(x, y, rotateAngle, color) {
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

class DriftOrchestrator {
  seed = 1;
  frame = 0;
  pseudoRandomGen;
  particles = [];
  constructor(ParticleClass, particleCount: number) {
    this.seed = 1;
    // Initialise a random number generator
    this.pseudoRandomGen = pseudoRandom(this.seed, "decimal");
    // Build a list of particles
    for (let i = 0; i < particleCount; i++) {
      let particle = {};
      // particle.shape = new ParticleClass(i + 1);
      let minDiameter = 24;
      let maxDiameter = 38;
      let diameter = Math.random() * (maxDiameter - minDiameter) + minDiameter;
      particle.shape = new ParticleClass(
        Math.ceil(Math.random() * 9999),
        diameter
      );
      // Set particle rotation speed
      particle.rotate = 0;
      let minRotateSpeed = 0.01;
      particle.rotateSpeed =
        this.pseudoRandomGen.next().value * minRotateSpeed +
        minRotateSpeed * 0.5;
      if (this.pseudoRandomGen.next().value > 0.5) {
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
      particle.clock = Math.floor(this.pseudoRandomGen.next().value * 2000);
      //
      this.particles.push(particle);
    }
  }
  draw() {
    this.frame++;
    // Drift particles
    this.particles.forEach((particle) => {
      particle.clock += 1;
      // let [x, y] = particle.originCoordinates;
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
      particle.gravityAdjust * 0.5 + 0.01 * Math.sin(particle.clock * 0.1);
    if (particle.y > canvas.height + 40) particle.y = -40;
  }
  particleSway(particle) {
    particle.x += 0.2 * Math.sin(particle.clock * 0.013);
  }
  bigWind(particle) {
    particle.x += 0.3 * Math.sin(this.frame * 0.001);
    // Teleport to other side if too far out of frame horizontally
    if (particle.x > canvas.width * 1.12) particle.x = -canvas.width * 0.1;
    if (particle.x < -canvas.width * 0.11) particle.x = canvas.width * 1.1;
  }
  particleRotate(particle) {
    particle.rotate += particle.rotateSpeed * Math.sin(particle.clock * 0.001);
    // Change rotation speed slightly
  }
}

const animationContainer = new DriftOrchestrator(SnowFlake, numberOfFlakes);

function main() {
  window.requestAnimationFrame(main);
  fillCanvas(bgColor);
  animationContainer.draw();
}
main();

function fillCanvas(color: string = "white"): void {
  // ctx.fillStyle = color;
  // ctx.fillRect(0, 0, canvas.width, canvas.height);
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

function rotateCoordinates(
  origin: [number, number] = [0, 0],
  point: [number, number],
  angle: number = (Math.PI * 2) / 360 // radians
) {
  // Rotate a point counterclockwise by a given angle around a given origin.
  // The angle should be given in radians.
  let [ox, oy] = origin;
  let [px, py] = point;

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

  let qx = (px - ox) * scale + ox;
  let qy = (py - oy) * scale + oy;
  return [qx, qy];
}

function hexagon(ctx, x, y, radius, startAngle) {
  polygon(ctx, x, y, radius, 6, startAngle);
}
function polygon(ctx, x, y, radius, sides, startAngle) {
  ctx.fillStyle = "#fff8";
  ctx.beginPath();
  if (sides < 3) return;
  var a = (Math.PI * 2) / sides;
  // ctx.save();
  // ctx.translate(x,y);
  // ctx.rotate(startAngle);
  ctx.moveTo(...rotateCoordinates([x, y], [radius + x, y], startAngle));
  // ctx.moveTo(radius + x, y);
  for (var i = 1; i < sides; i++) {
    ctx.lineTo(
      ...rotateCoordinates(
        [x, y],
        [x + radius * Math.cos(a * i), y + radius * Math.sin(a * i)],
        startAngle
      )
    );
    // ctx.lineTo(x + radius * Math.cos(a * i), y + radius * Math.sin(a * i));
  }
  ctx.closePath();
  ctx.stroke();
  ctx.fill();
  // ctx.restore();
}

function sunFlare(ctx, x, y, radius, sides, startAngle, anticlockwise) {
  ctx.fillStyle = "#ffffff03";
  ctx.beginPath();
  if (sides < 3) return;
  var a = (Math.PI * 2) / sides;
  // a = anticlockwise?-a:a;
  // ctx.save();
  // ctx.translate(x,y);
  // ctx.rotate(startAngle);
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
  // ctx.restore();
}
