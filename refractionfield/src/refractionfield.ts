// Set up a grid
// Draw triangles at each gridpoint
// - orient in a pattern
// - give each a reflective direction (think 'normal map' in 3D)
// - change color depending on difference in angle from pointer to triangle's reflective direction.

const TAU = Math.PI * 2;

let mouseX = window.innerWidth * 0.5;
let mouseY = window.innerHeight * 0.5;

const canvas = document.getElementById("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const ctx = canvas.getContext("2d");
ctx.globalCompositeOperation = "source-over";

const gridSize = 30;
const hueRange = 160;
const hueShift = 170;

let pointerLoopRAF;
function pointerLoop(t) {
  const radiusRatio = 0.35;
  const radius = canvas.width * radiusRatio;
  const rate = 0.001;
  const x =
    canvas.width * radiusRatio * Math.sin(t * rate) + canvas.width * 0.5;
  const y =
    canvas.height * radiusRatio * Math.cos(t * rate) + canvas.height * 0.5;
  mouseX = x;
  mouseY = y;
  pointerLoopRAF = window.requestAnimationFrame(pointerLoop);
}
pointerLoop();

const blends = [
  "source-over",
  "source-atop",
  // "source-in",
  // "source-out",
  // "destination-over",
  // "destination-atop",
  // "destination-in",
  // "destination-out",
  // "lighter",
  // "copy",
  "xor",
  "multiply",
  "darken",
  // "lighten",
  // "screen", // 🤷‍
  // "color-dodge",
  // "color-burn", // 🤷‍
  // "hard-light",
  // "soft-light", // 🤷‍
  // "difference", // 🤮
  // "exclusion", // 🤮
  // "hue", // 🤷‍
  // "saturation", // 🤷‍
  // "color", // 🤷‍
  // "luminosity", // 🤮
  // "overlay", // 🤷‍
];

function gridPoints(type = "square") {
  // type 'square', 'isometric'
  const coordinates = [];

  let dy = gridSize;
  if (type === "isometric") {
    dy = Math.sin((TAU * 60) / 360) * gridSize;
  }

  for (let i = 0; i - 1 < canvas.height / dy; i++) {
    for (let j = 0; j - 1 < canvas.width / gridSize; j++) {
      let x = j * gridSize;
      if (type === "isometric") {
        x = !!(i % 2) ? j * gridSize : j * gridSize + gridSize * 0.5;
      }
      let y = i * dy;
      coordinates.push({ x, y, ix: j, iy: i });
    }
  }

  return coordinates;
}

function drawGrid(points) {
  points.forEach(({ x, y }) => {
    ctx.beginPath();
    ctx.arc(x, y, 2, 0, TAU);
    ctx.strokeStyle = "black";
    ctx.stroke();
    ctx.closePath();
  });
}

const gridCoordinates = gridPoints("isometric");

// Fill canva
function clearCanvas() {
  ctx.globalCompositeOperation = "source-over";
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.globalCompositeOperation = blends[3];
}

// Draw triangle
const triangles = gridCoordinates.map((position, index) => {
  const size = gridSize * 0.87;
  const triangle = {
    x: position.x,
    y: position.y,
    size,
    spin: 0,
    tHueShift: 0,
  };

  if (!!(position.iy % 2)) {
    triangle.normal = TAU * (1 / 6) * (index % 3);
  } else {
    triangle.normal = TAU * (1 / 6) * ((index % 3) + 3);
  }
  return triangle;
});

function draw(t) {
  //   FIXME redundant variables to replace
  let mx = mouseX;
  let my = mouseY;

  clearCanvas();

  ctx.strokeStyle = "#fff8";
  ctx.fillStyle = "#fff3";

  triangles.forEach((triangle, tIndex) => {
    // Compute cursor angle from normal
    const { x, y, normal, size, spin, tHueShift } = triangle;
    triangle.normal += spin;

    const dx = mx - x;
    const dy = my - y;
    const dAngle = Math.atan2(dy, dx);

    const angle = Math.abs(
      Math.atan2(Math.sin(normal - dAngle), Math.cos(normal - dAngle))
    );

    const distance = Math.sqrt(dx ** 2 + dy ** 2);
    const luminocity = canvas.width * 0.75;
    const minDistanceFactor = 0.2;
    let distanceFactor = (luminocity - distance) / luminocity;
    distanceFactor =
      distanceFactor < minDistanceFactor ? minDistanceFactor : distanceFactor;
    const reflectiveAlignment = ((Math.PI - angle) / Math.PI) * distanceFactor;
    //     Triangle
    ctx.beginPath();
    ctx.lineTo(x + size * Math.sin(normal), y + size * Math.cos(normal));
    ctx.lineTo(
      x + size * Math.sin(normal + TAU * 0.333),
      y + size * Math.cos(normal + TAU * 0.333)
    );
    ctx.lineTo(
      x + size * Math.sin(normal + TAU * 0.666),
      y + size * Math.cos(normal + TAU * 0.666)
    );
    ctx.closePath();
    // Fill
    const hue = (angle / Math.PI) * hueRange + hueShift + tHueShift;
    const sauration = 90;
    const lightness = (reflectiveAlignment * 0.4 + 0.55) * 100;
    const alpha = reflectiveAlignment;
    ctx.fillStyle = `hsla(${hue},${sauration}%,${lightness}%,${alpha})`;
    ctx.fill();
  });

  window.requestAnimationFrame(draw);
}

function handleInteraction(e) {
  window.cancelAnimationFrame(pointerLoopRAF);
  const { x, y } = getMousePos(this, e);
  mouseX = x;
  mouseY = y;
}

canvas.addEventListener("touchmove", handleInteraction, false);
canvas.onmousemove = handleInteraction;

/// the main function
function getMousePos(canvas, e) {
  let x;
  let y;
  if (
    e.type == "touchstart" ||
    e.type == "touchmove" ||
    e.type == "touchend" ||
    e.type == "touchcancel"
  ) {
    // const touch = e?.originalEvent?.touches[0] || e?.originalEvent?.changedTouches[0];
    x = e.pageX;
    y = e.pageY;
  } else if (
    e.type == "mousedown" ||
    e.type == "mouseup" ||
    e.type == "mousemove" ||
    e.type == "mouseover" ||
    e.type == "mouseout" ||
    e.type == "mouseenter" ||
    e.type == "mouseleave"
  ) {
    /// getBoundingClientRect is supported in most browsers and gives you
    /// the absolute geometry of an element
    const rect = canvas.getBoundingClientRect();
    /// as mouse event coords are relative to document you need to
    /// subtract the element's left and top position:
    x = e.clientX - rect.left;
    y = e.clientY - rect.top;
  }

  return { x, y };
}

draw();
