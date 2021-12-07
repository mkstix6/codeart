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
const gridView = false;

const canvas = <HTMLCanvasElement>document.getElementById("canvas");
const ctx = <CanvasRenderingContext2D>canvas.getContext("2d");

function drawFlake() {
  // Flake settings
  const backTrack = Math.random() * 0.3 + 0.5; // 0.55;
  const shortening = Math.random() * 0.3 + 0.5; // 0.62;
  const wholeFlakeRotationAngle = Math.random() * TAU;
  const armSplits = Math.ceil(Math.random() * 100) + 2;

  //   Move origin
  if (gridView) {
    originX += 100;
    if (originX > 390) {
      originY += 100;
    }
    originX = originX % 400;
    originY = originY % 400;
  } else {
    originX = Math.random() * canvas.width;
    originY = Math.random() * canvas.height;
  }

  //
  let clockwise = true;
  function rotateAndDrawLine(
    x: number,
    y: number,
    prevAngle: number,
    length: number
  ) {
    const newAngle = clockwise
      ? prevAngle + flakeAngle
      : prevAngle - flakeAngle;
    if (Math.random() > 0.5) {
      clockwise = !clockwise;
    }
    const newLength = length * shortening;
    const newx = x + Math.sin(newAngle) * newLength;
    const newy = y + Math.cos(newAngle) * newLength;
    const backx = x + Math.sin(newAngle) * (newLength * backTrack);
    const backy = y + Math.cos(newAngle) * (newLength * backTrack);
    return [newx, newy, newAngle, newLength, backx, backy];
  }

  let x = originX;
  let y = originY;
  let angle = -flakeAngle; // I would make this angle zero (0) but we rotate first and this makes reflecting the arm for symmetry convenient
  let initialLength = 20;
  let length = initialLength / shortening;
  let backx;
  let backy;
  let newx;
  let newy;

  let path1 = new Path2D();
  path1.moveTo(x, y);
  let path2 = new Path2D();
  path2.moveTo(x, y);

  const armCoordinates = [originX, originY];

  for (let i = 0; i < armSplits; i++) {
    [x, y, angle, length, backx, backy] = rotateAndDrawLine(
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

    path1.lineTo(x, y);
    path1.lineTo(backx, backy);
    x = backx;
    y = backy;
  }

  // Reflect points for symmetrical arm shape
  let reflectedArmCoordinates = [...armCoordinates];
  let halfArmArrayLength = reflectedArmCoordinates.length;
  for (let i = 0; i < halfArmArrayLength; i += 2) {
    newx = originX - reflectedArmCoordinates[i] + originX;
    newy = reflectedArmCoordinates[i + 1];
    reflectedArmCoordinates.push(newx);
    reflectedArmCoordinates.push(newy);
  }

  // Create points for 5 other snowflake arms
  let snowFlakeCoordinates = [...reflectedArmCoordinates];
  if (!debugging) {
    for (let j = 0; j < 10; j++) {
      let startIndex = j * armCoordinates.length;
      for (let i = startIndex; i < startIndex + armCoordinates.length; i += 2) {
        let [newx, newy] = rotate(
          [originX, originY],
          [snowFlakeCoordinates[i], snowFlakeCoordinates[i + 1]],
          flakeAngle
        );
        snowFlakeCoordinates.push(newx);
        snowFlakeCoordinates.push(newy);
      }
    }
  }

  // Rotate entire snowflake by random amount
  if (!debugging) {
    for (let i = 0; i < snowFlakeCoordinates.length; i += 2) {
      let [newX, newY] = rotate(
        [originX, originY],
        [snowFlakeCoordinates[i], snowFlakeCoordinates[i + 1]],
        wholeFlakeRotationAngle
      );
      snowFlakeCoordinates[i] = newX;
      snowFlakeCoordinates[i + 1] = newY;
    }
  }

  // Draw SVG from list of coordinates
  for (let i = 0; i < snowFlakeCoordinates.length; i += 2) {
    // If end of arm return to origin without drawing ready for next arm
    if (0 === i % armCoordinates.length) {
      path2.moveTo(originX, originY);
    }
    path2.lineTo(snowFlakeCoordinates[i], snowFlakeCoordinates[i + 1]);
  }

  ctx.strokeStyle = "white";
  ctx.lineWidth = 2;
  ctx.stroke(path2);

  if (debugging) {
    ctx.strokeStyle = "red";
    ctx.lineWidth = 1;
    ctx.stroke(path1);
  }
}

function fadeCanvas() {
  // Fill canvas
  ctx.fillStyle = "#00000004";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function main() {
  frameCount++;
  flakeCount++;
  fadeCanvas();
  if (gridView) {
    if (flakeCount < 16) {
      drawFlake();
    }
  } else {
    if (!(frameCount % 10)) {
      drawFlake();
    }
  }

  window.requestAnimationFrame(main);
}

main();

function rotate(origin, point, angle) {
  // Rotate a point counterclockwise by a given angle around a given origin.
  // The angle should be given in radians.
  let [ox, oy] = origin;
  let [px, py] = point;

  let qx = ox + Math.cos(angle) * (px - ox) - Math.sin(angle) * (py - oy);
  let qy = oy + Math.sin(angle) * (px - ox) + Math.cos(angle) * (py - oy);
  return [qx, qy];
}
