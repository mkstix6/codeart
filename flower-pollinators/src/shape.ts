export const TAU = Math.PI * 2;

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
