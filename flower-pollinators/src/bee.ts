import { formatOKLCHColor } from "./color.ts";
import { initialiseDrawCircleHelper } from "./shape.ts";

export const createBeeAgent = (
  ctx: CanvasRenderingContext2D,
  flowerDrawList: []
) => {
  const drawCircle = initialiseDrawCircleHelper(ctx);

  return {
    origin: [0, 0],
    speed: 0.5,
    target: undefined,
    pollen: null,
    chooseTarget() {
      if (!flowerDrawList || flowerDrawList.size === 0) return;
      const currentFlowerList = [...flowerDrawList].filter(
        (flower) => flower.lifeStatus === "grown"
      );
      this.target =
        currentFlowerList[Math.floor(Math.random() * currentFlowerList.length)];
    },
    isTouchingTarget() {
      return (
        Math.abs(this.origin[0] - this.target.origin[0]) < 10 &&
        Math.abs(this.origin[1] - this.target.origin[1]) < 10
      );
    },
    move() {
      if (!this.target) return;

      if (this.isTouchingTarget()) {
        if (this.pollen) {
          this.target.pollen = this.pollen;
        }
        this.pollen = this.target.species;
        this.chooseTarget();
      }

      if (this.target) {
        this.origin = [
          this.origin[0] - this.target.origin[0] > 0
            ? this.origin[0] - this.speed
            : this.origin[0] + this.speed,
          this.origin[1] - this.target.origin[1] > 0
            ? this.origin[1] - this.speed
            : this.origin[1] + this.speed,
        ];
      }
    },
    draw() {
      if (!this.target) {
        this.chooseTarget();
      }
      this.move();
      ctx.fillStyle = "black";
      drawCircle([this.origin[0] + 0, this.origin[1] + 0], 5);
      ctx.fillStyle = "yellow";
      drawCircle([this.origin[0] + 3, this.origin[1] + 3], 10);
      ctx.fillStyle = "black";
      drawCircle([this.origin[0] + 6, this.origin[1] + 6], 10);
      ctx.fillStyle = "yellow";
      drawCircle([this.origin[0] + 9, this.origin[1] + 9], 5);
      ctx.fillStyle = "black";
      drawCircle([this.origin[0] + 10, this.origin[1] + 10], 4);

      //   if (this.target) {
      //     ctx.strokeStyle = "red";
      //     ctx.beginPath();
      //     ctx.moveTo(...this.origin);
      //     ctx.lineTo(...this.target.origin);
      //     ctx.stroke();
      //     ctx.closePath();
      //   }
    },
  };
};
