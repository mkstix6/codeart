import { pseudoRandom } from "../utils";

// Useful flags
const debugging = false;
// Universal constants
const TAU = 2 * Math.PI;
const flakeAngle = TAU / 6;
// Initial setup
let flakeCount = 0;
let originX = 50;
let originY = 50;
let frameCount = 0;
const numberOfFlakes = 50;
const gridView = false;
const bgColor = "#00081850";

const canvas = <HTMLCanvasElement>document.getElementById("canvas");
const ctx = <CanvasRenderingContext2D>canvas.getContext("2d");

function fillCanvas(color = "white") {
  // Fill canvas
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

class SnowFlake {
  seed;
  pseudoRandomGen;
  originX;
  originY;
  backTrack;
  shortening;
  wholeFlakeRotationAngle;
  armSplits;
  clockwise;
  coordinates;
  rotateSpeed;
  frame = Math.floor(Math.random() * 1000);
  glitchLoop;
  lineWidth;
  constructor(seed = 1) {
    this.seed = seed;
    this.pseudoRandomGen = pseudoRandom(this.seed, "decimal");
    // this.originX = Math.floor(this.pseudoRandomGen.next().value * canvas.width);
    // this.originY = Math.floor(
    //   this.pseudoRandomGen.next().value * canvas.height
    // );
    if (!debugging) {
      this.originX = Math.floor(Math.random() * canvas.width);
      this.originY = Math.floor(Math.random() * canvas.height);
    } else {
      this.originX = 0;
      this.originY = 0;
    }
    this.gravityAdjust = this.pseudoRandomGen.next().value * 0.5 + 0.3;
    this.wholeFlakeRotationAngle = this.pseudoRandomGen.next().value * TAU;
    this.lineWidth = 1;
    // this.lineWidth = this.pseudoRandomGen.next().value * 4 + 1;
    this.clockwise = true;
    this.glitchLoop = Math.floor(this.pseudoRandomGen.next().value * 200 + 100);
    this.rotateSpeed = this.pseudoRandomGen.next().value * 0.005 + 0.003;
    if (this.pseudoRandomGen.next().value > 0.5) {
      this.rotateSpeed = -this.rotateSpeed;
    }
    this.randomiseFlakeProperties();
    this.buildCoordinates();
  }
  randomiseFlakeProperties() {
    this.backTrack = this.pseudoRandomGen.next().value * 0.7 + 0.15; // 0.55;
    this.shortening = this.pseudoRandomGen.next().value * 0.7 + 0.1; // 0.62;
    this.armSplits = Math.ceil(this.pseudoRandomGen.next().value * 100) + 2;
  }
  rotateAndDrawLine(x: number, y: number, prevAngle: number, length: number) {
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
    return [newx, newy, newAngle, newLength, backx, backy];
  }
  buildCoordinates() {
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

    const armCoordinates = [0, 0];

    for (let i = 0; i < armSplits; i++) {
      [x, y, angle, length, backx, backy] = this.rotateAndDrawLine(
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

      // path1.lineTo(x, y);
      // path1.lineTo(backx, backy);
      x = backx;
      y = backy;
    }

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
    if (!debugging) {
      for (let j = 0; j < 10; j++) {
        let startIndex = j * armCoordinates.length;
        for (
          let i = startIndex;
          i < startIndex + armCoordinates.length;
          i += 2
        ) {
          let [newx, newy] = rotate(
            [0, 0],
            [snowFlakeCoordinates[i], snowFlakeCoordinates[i + 1]],
            flakeAngle
          );
          snowFlakeCoordinates.push(newx);
          snowFlakeCoordinates.push(newy);
        }
      }
    }
    this.coordinates = snowFlakeCoordinates;
    if (!debugging) {
      this.rotateCoordinates(this.wholeFlakeRotationAngle);
    }
  }
  gravity() {
    this.originY +=
      Math.sin((0.1 * this.frame) / TAU + this.gravityAdjust * 20) * 0.2 + 0.4;

    this.originX +=
      Math.sin((0.1 * this.frame) / TAU + this.gravityAdjust * 20) * 0.2;

    if (this.originY > canvas.height + 50) {
      this.originY = -50;
      this.originX = Math.random() * canvas.width;
    }
    // this.coordinates = this.coordinates.map((c, i) => {
    //   return i % 2 === 1 ? c + 1 : c;
    // });
  }
  rotateCoordinates(angle: number) {
    // Rotate entire snowflake by random amount
    for (let i = 0; i < this.coordinates.length; i += 2) {
      let [newX, newY] = rotate(
        [0, 0],
        [this.coordinates[i], this.coordinates[i + 1]],
        angle
      );
      this.coordinates[i] = newX;
      this.coordinates[i + 1] = newY;
    }
  }
  drawFlakeArms(path, color = "white") {
    // Draw SVG from list of coordinates
    ctx.strokeStyle = color;
    for (let i = 0; i < this.coordinates.length; i += 2) {
      // If end of arm return to origin without drawing ready for next arm
      // if (0 === (i % this.coordinates.length) / 1) {
      if (0 === i % (this.coordinates.length / 12)) {
        // FIXME this could be 6 or 12 ???
        path.moveTo(
          this.originX + this.coordinates[i],
          this.originY + this.coordinates[i + 1]
        );
      } else {
        path.lineTo(
          this.originX + this.coordinates[i],
          this.originY + this.coordinates[i + 1]
        );
      }
    }
    ctx.stroke(path);
  }
  draw() {
    ctx.lineWidth = this.lineWidth;

    this.frame++;
    let path2 = new Path2D();
    this.drawFlakeArms(path2, "hsl(201.53, 100%, 30%)");
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
      this.buildCoordinates();
      // ctx.strokeStyle = "white";
    } else {
      // ctx.strokeStyle = "white";
    }

    if (!debugging) {
      this.rotateCoordinates(this.rotateSpeed);
      this.gravity();
    }

    let path3 = new Path2D();
    this.drawFlakeArms(path3, "white");

    // ctx.strokeStyle = "hsl(201.53, 100%, 66.67%)";
    // ctx.stroke(path2);
    // ctx.strokeStyle = "white";
    // ctx.stroke(path2);

    if (debugging) {
      ctx.strokeStyle = "red";
      ctx.lineWidth = 1;
      ctx.stroke(path1);
    }
  }
}
const allFlakes = [];
for (let i = 0; i < numberOfFlakes; i++) {
  allFlakes.push(new SnowFlake(i + 1));
}

function main() {
  window.requestAnimationFrame(main);
  frameCount++;
  // fillCanvas("#00000008");
  fillCanvas(bgColor);
  allFlakes.forEach((flake) => flake.draw());
}
main();

function rotate(
  origin: [number, number],
  point: [number, number],
  angle: number
) {
  // Rotate a point counterclockwise by a given angle around a given origin.
  // The angle should be given in radians.
  let [ox, oy] = origin;
  let [px, py] = point;

  let qx = ox + Math.cos(angle) * (px - ox) - Math.sin(angle) * (py - oy);
  let qy = oy + Math.sin(angle) * (px - ox) + Math.cos(angle) * (py - oy);
  return [qx, qy];
}
