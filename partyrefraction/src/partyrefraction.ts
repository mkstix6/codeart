// Universal constants
const TAU = Math.PI * 2;

// Artwork variables
const gridSize = 20;
const hueRange = 720;
const hueShift = 160;

// Prepare canvas
const canvas = document.getElementById("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const ctx = canvas.getContext("2d");
ctx.globalCompositeOperation = "source-over";

// Initialise pointer position to the center of the canvas
let mouseX = window.innerWidth * 0.5;
let mouseY = window.innerHeight * 0.5;

// Fill canvas
function clearCanvas() {
  ctx.globalCompositeOperation = "source-over";
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// Prepare triangle data
const triangleCount = Math.round(
  (2 * (canvas.width * canvas.height)) / gridSize ** 2
);
const triangles = Array(triangleCount)
  .fill({})
  .map((item, index) => {
    return {
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      normal: Math.random() * TAU * 0.5,
      size: gridSize * 0.5,
      spin: Math.random() * 0.04 - 0.02,
      tHueShift: 0,
    };
  });

function drawArtwork(t = 0) {
  clearCanvas();
  ctx.globalCompositeOperation = "multiply";
  triangles.forEach(drawTriangle);
  window.requestAnimationFrame(drawArtwork);
}

// Start the art
drawArtwork();

function drawTriangle(triangle, tIndex) {
  // Compute cursor angle from normal
  const { x, y, normal, size, spin, tHueShift } = triangle;
  triangle.normal += spin;

  const dx = mouseX - x;
  const dy = mouseY - y;
  const dAngle = Math.atan2(dy, dx);

  // x is the target angle. y is the source or starting angle:
  const pointerAlignmentAngle = Math.abs(
    Math.atan2(Math.sin(normal - dAngle), Math.cos(normal - dAngle))
  );

  const distance = Math.sqrt(dx ** 2 + dy ** 2);
  const luminocity = canvas.width * 0.75;
  const minDistanceFactor = 0.2;
  let distanceFactor = (luminocity - distance) / luminocity;
  distanceFactor =
    distanceFactor < minDistanceFactor ? minDistanceFactor : distanceFactor;
  const reflectanceStrength =
    ((Math.PI - pointerAlignmentAngle) / Math.PI) * distanceFactor;
  // Triangle path shape setup
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
  // Fill triangle
  const hue =
    (pointerAlignmentAngle / Math.PI) * hueRange + hueShift + tHueShift;
  const sauration = 90;
  const lightness = (reflectanceStrength * 0.4 + 0.6) * 100;
  const alpha = reflectanceStrength;
  ctx.fillStyle = `hsla(${hue},${sauration}%,${lightness}%,${alpha})`;
  ctx.fill();

  const doStroke = false;
  if (doStroke) {
    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  const diagnostics = false;
  if (diagnostics && tIndex === 55) {
    if (angle < 0.25) {
      ctx.stroke();
    }
    ctx.strokeStyle = "#f008";
    ctx.stroke();
    document.getElementById("readout").innerHTML = `
      DST:${distanceFactor}<br>
      dxdy:${dx}:${dy}<br>
      NORM:${normal}<br>
      ATAN2:${Math.atan2(dy, dx)}<br>
      ANG:${angle}<br/>
      BRI: ${reflectanceStrength}
      `;

    ctx.closePath();
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + dx, y + dy);
    ctx.strokeStyle = "#f008";
    ctx.stroke();
    ctx.closePath();
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(normal) * 50, y + Math.sin(normal) * 50);
    ctx.strokeStyle = "#00f8";
    ctx.stroke();

    ctx.strokeStyle = "#fff8";
  }
}

// Pointer animation before interaction
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

// Interactions and Helper functions
canvas.addEventListener("touchmove", handleInteraction, false);
canvas.onmousemove = handleInteraction;

function handleInteraction(e) {
  // Stop the automated cursor animation
  window.cancelAnimationFrame(pointerLoopRAF);
  // Update global cursor coordinate variables
  const { x, y } = getMousePos(this, e);
  mouseX = x;
  mouseY = y;
}

function getMousePos(canvas, e) {
  let x;
  let y;
  if (
    e.type == "touchstart" ||
    e.type == "touchmove" ||
    e.type == "touchend" ||
    e.type == "touchcancel"
  ) {
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
    const rect = canvas.getBoundingClientRect();
    // subtract the element's left and top position:
    x = e.clientX - rect.left;
    y = e.clientY - rect.top;
  }
  return { x, y };
}

// Unused but useful and reference
const canvasGlobalCompositeOperationOptions = [
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
