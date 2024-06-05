export const TAU = Math.PI * 2;

export function entityRotaterAroundPoint(
  centerOfRotation: Coordinates = [0, 0],
  CoordinatesToRotate: Coordinates,
  angle: number
): Coordinates {
  const [cx, cy] = centerOfRotation;
  const [x, y] = CoordinatesToRotate;
  //   const radians = (Math.PI / 180) * angle;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const nx = cos * (x - cx) + sin * (y - cy) + cx;
  const ny = cos * (y - cy) - sin * (x - cx) + cy;
  return [nx, ny];
}

export function makeEntityPointRotator(
  origin: Coordinates = [0, 0],
  angle: number = 0
): (point: Coordinates) => Coordinates {
  return (point) => {
    return entityRotaterAroundPoint(origin, point, angle);
  };
}

export function initialiseDrawCircleHelper(ctx) {
  return function drawCircle(origin: Coordinates, size: number): void {
    if (size < 0) {
      //   console.warn("circle size too small", size);
      return;
    }
    ctx.beginPath();
    ctx.moveTo(...origin);
    ctx.arc(...origin, size, 0, TAU);
    ctx.fill();
    ctx.closePath();
  };
}
