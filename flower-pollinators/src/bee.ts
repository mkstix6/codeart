import { makeEntityPointRotator, initialiseDrawCircleHelper } from "./shape.ts";

export const createBeeAgent = (
  ctx: CanvasRenderingContext2D,
  flowerDrawList: []
) => {
  const drawCircle = initialiseDrawCircleHelper(ctx);

  return {
    origin: [0, 0],
    speed: 0.5,
    direction: 0,
    drawRotator: undefined,
    target: undefined,
    pollen: null,
    unique: Math.random(),
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
        this.target &&
        Math.abs(this.origin[0] - this.target.origin[0]) < 10 &&
        Math.abs(this.origin[1] - this.target.origin[1]) < 10
      );
    },
    tryPollinate() {
      if (this.isTouchingTarget()) {
        if (this.pollen) {
          this.target.pollen = this.pollen;
        }
        this.pollen = this.target.species;
        this.chooseTarget();
      }
    },
    move() {
      if (this.target) {
        this.origin = [
          this.origin[0] + this.speed * Math.cos(this.direction),
          this.origin[1] + this.speed * Math.sin(this.direction),
        ];
      }
    },
    calculateDirection() {
      if (this.target) {
        const distance = Math.sqrt(
          (this.target.origin[0] - this.origin[0]) ** 2 +
            (this.target.origin[1] - this.origin[1]) ** 2
        );
        this.direction =
          Math.atan2(
            this.target.origin[1] - this.origin[1],
            this.target.origin[0] - this.origin[0]
          ) + Math.sin(Math.cbrt(distance) + this.unique * 360);
      }
    },
    draw() {
      if (!this.target) {
        this.chooseTarget();
      } else {
        if (this.target.lifeStatus !== "grown") {
          this.chooseTarget();
        }
        this.calculateDirection();
      }

      //   if (!this.isTouchingTarget()) {
      this.move();
      this.drawRotator = makeEntityPointRotator(this.origin, -this.direction);
      this.tryPollinate();
      //   }
      const beeDrawCommands = [
        { location: [0, 0], size: 5, color: "black" },
        { location: [3, 0], size: 6, color: "yellow" },
        { location: [6, 0], size: 7, color: "black" },
        { location: [9, 0], size: 5, color: "yellow" },
        { location: [11, 0], size: 4, color: "black" },
      ];

      if (this.target) {
        beeDrawCommands.push({
          location: [6, Math.random() * 6],
          size: 8,
          color: "#fff5",
        });
        beeDrawCommands.push({
          location: [6, Math.random() * -6],
          size: 8,
          color: "#fff5",
        });
      }

      beeDrawCommands.forEach((command) => {
        const rotatedLocation = this.drawRotator([
          this.origin[0] + command.location[0],
          this.origin[1] + command.location[1],
        ]);
        ctx.fillStyle = command.color;
        drawCircle(rotatedLocation, command.size);
      });

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
