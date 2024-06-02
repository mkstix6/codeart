type Coordinates = [number, number];
type LCHValues = { l: number; c: number; h: number };

type LIFESTATUS = "seed" | "growing" | "grown" | "dying" | "dead" | "dormant";

interface SpeciesFeatures {
  centreColor?: string;
  petalColor: LCHValues;
  petalCount: number;
  petalDistance: number;
  petalSize: number;
  structureTolerence: number;
  maxSize: number;
  growthSpeed: number;
  colorTolerence: LCHValues;
}

interface CuteCirclyFlower extends SpeciesFeatures {
  species: SpeciesFeatures;
  age: number;
  draw: () => void;
  entityRotater: (point: Coordinates) => Coordinates;
  lifeCycleTick: () => void;
  lifeStatus: LIFESTATUS;
  lifetime: number;
  maxSize: number;
  origin: Coordinates;
  petals: { petalColor: LCHValues }[];
  rotation: number;
  rotationSpeed: number;
  size: number;
}

const formatOKLCHColor = (
  { l: luminosity, c: chroma, h: hue }: LCHValues = { l: 0, c: 0, h: 0 }
): string => `oklch(${luminosity}% ${chroma} ${hue})`;

export function flowers() {
  const TAU = Math.PI * 2;
  // Prepare canvas
  const canvas = <HTMLCanvasElement>document.getElementById("canvas");
  const canvasSize = 2 ** 8;
  canvas.width = canvasSize;
  canvas.height = canvasSize;
  canvas.style.borderRadius = "2em";
  const ctx = <CanvasRenderingContext2D>(
    canvas.getContext("2d", { colorSpace: "display-p3" })
  );
  const bgGradient = ctx.createLinearGradient(0, 0, 0, canvasSize);
  const cloverGreenHue = 148;
  // Add three color stops
  bgGradient.addColorStop(0, formatOKLCHColor({ l: 25, c: 0.022, h: 43 }));
  bgGradient.addColorStop(1, formatOKLCHColor({ l: 23, c: 0.022, h: 43 }));

  const flowerDrawList = new Set();

  // Fill canvas
  function clearCanvas() {
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, canvasSize, canvasSize);
  }

  clearCanvas();

  const numberJitter = (value: number, tolerance: number) =>
    value + tolerance * (Math.random() * 2 - 1);

  function colorJitter(color: LCHValues, tolerance: LCHValues) {
    return {
      l: numberJitter(color.l, tolerance.l),
      c: numberJitter(color.c, tolerance.c),
      h: numberJitter(color.h, tolerance.h),
    };
  }

  const CreateCuteCirclyFlower = ({
    species,
    age = 0,
    centreColor = "white",
    colorTolerence = { l: 0, c: 0, h: 0 },
    growthSpeed = canvasSize * 0.01,
    lifeStatus = "growing" as "growing",
    lifetime = 500,
    maxSize = Infinity,
    origin = [0, 0],
    petalColor = { l: 73, c: 3, h: 89 },
    petalCount = 5,
    petalDistance = 1,
    petalSize = 1,
    rotation = 0,
    rotationSpeed = 0,
    size = 0,
    structureTolerence = 0,
  }: Partial<CuteCirclyFlower>): CuteCirclyFlower => {
    const createPetal = (petalColor: LCHValues) => {
      return {
        petalColor,
      };
    };
    const petals = Array.from({ length: petalCount }, (petal) =>
      createPetal(colorJitter(petalColor, colorTolerence))
    );
    return {
      species,
      age: Math.random() * lifetime,
      centreColor,
      colorTolerence,
      entityRotater: makeEntityPointRotator(origin, 0),
      growthSpeed,
      lifeStatus,
      lifetime,
      maxSize,
      origin: [origin[0], origin[1]],
      petalColor,
      petalCount,
      petalDistance,
      petals,
      petalSize,
      rotation,
      rotationSpeed,
      size,
      structureTolerence,
      lifeCycleTick() {
        this.age++;
        if (this.pollen) {
          //   flowerDrawList.delete(this);
          const h1 = this.petalColor.h;
          const h2 = this.pollen.petalColor.h;
          const newh =
            Math.abs(h1 - h2) < 180
              ? (h1 + h2) / 2
              : h1 - h2 > 0
              ? (h1 + (h2 + 360 - h1) / 2) % 360
              : (h2 + (h1 + 360 - h2) / 2) % 360;
          const newColor = {
            ...this.pollen.petalColor,
            h: newh + (Math.random() * 2 - 1) * 20,
          };
          this.pollen = null;
          this.petalColor = newColor;
          this.species.petalColor = newColor;
          this.petals.forEach((petal) => {
            petal.petalColor = newColor;
          });
          this.lifeStatus = "dying";
        }
        if (!this.species.petalDistance) {
          this.species.petalDistance = this.petalDistance;
        }

        switch (this.lifeStatus) {
          case "dormant": {
            // nothing doing
            break;
          }
          case "seed": {
            this.size = 10;
            this.petalSize = 0;
            if (this.age > this.lifetime) {
              this.age = 0;
              this.lifeStatus = "growing";
            }
            break;
          }
          case "growing": {
            this.size +=
              this.size < this.species.maxSize ? this.growthSpeed : 0;
            this.petalSize +=
              this.petalSize < this.species.petalSize
                ? this.growthSpeed * 0.5
                : 0;
            if (
              this.petalSize >= this.species.petalSize &&
              this.size >= this.species.maxSize
            ) {
              this.lifeStatus = "grown";
            }
            break;
          }
          case "grown": {
            this.rotation += this.rotationSpeed;

            break;
          }
          case "dying": {
            this.size -= 0.1;
            this.petalDistance += 0.1;
            break;
          }
          case "dead": {
            flowerDrawList.delete(this);
            break;
          }

          default:
            break;
        }
        // if (this.age > this.lifetime) {
        //   this.lifeStatus = "dying";
        // }
        if (this.lifeStatus === "dying" && this.size < 0) {
          this.lifeStatus = "dead";
        }
        if (this.size > this.maxSize) {
          this.size = this.maxSize;
        }
      },
      move() {
        this.origin = [Math.random() * canvasSize, Math.random() * canvasSize];
        this.entityRotater = makeEntityPointRotator(this.origin, this.rotation);
      },
      draw() {
        this.lifeCycleTick();
        if (this.size < 0) {
          return;
        }
        this.entityRotater = makeEntityPointRotator(this.origin, this.rotation);

        for (let i = 0; i < petalCount; i++) {
          ctx.fillStyle = formatOKLCHColor(petals[i].petalColor);
          const petalCoordinates: Coordinates = [
            this.origin[0] + this.size * this.petalDistance,
            this.origin[1],
          ];
          const startCoordinates = this.entityRotater(
            entityRotaterAroundPoint(
              <Coordinates>this.origin,
              <Coordinates>(
                petalCoordinates.map((value: number): number => value)
              ),
              (i * 360) / petalCount
            )
          );
          drawCircle(startCoordinates, this.size * this.petalSize);
        }
        if (this.centreColor) {
          ctx.fillStyle = this.centreColor;
          drawCircle([this.origin[0], this.origin[1]], this.size);
        }
      },
    };
  };

  const getCloverVariantConfig = (): Omit<
    CuteCirclyFlower,
    | "draw"
    | "grow"
    | "age"
    | "entityRotater"
    | "lifeStatus"
    | "petals"
    | "petalSize"
  > => {
    let gridSpacing = 50;
    let tolerance = gridSpacing / 2;

    const speciesFeatures: SpeciesFeatures = {
      centreColor: null,
      petalCount: Math.random() > 0.9 ? 4 : 3,
      petalDistance: 1,
      petalSize: 1, // Math.random() * 2 + 0.3,
      maxSize: canvasSize * 0.03,
      structureTolerence: 10,
      growthSpeed: Math.random() * 0.03 + 0.01,
      petalColor: {
        l:
          (Math.ceil(Math.random() * 5) + 5) *
          Math.ceil(Math.random() * 3) *
          1.7,
        c: 0.12,
        h: cloverGreenHue,
      },
    };

    return {
      colorTolerence: { l: 0, c: 0, h: 1 },
      growthSpeed: canvasSize * 0.00005 + 0.01 * Math.random(),
      lifeStatus: "growing",
      lifetime: Infinity,
      origin: [Math.random() * canvasSize, Math.random() * canvasSize],
      rotation: Math.floor(360 * Math.random()),
      rotationSpeed: numberJitter(0, 0.1),
      size: 0,
      species: speciesFeatures,
      ...speciesFeatures,
    };
  };

  const createBeeAgent = () => {
    return {
      origin: [0, 0],
      speed: 2,
      target: undefined,
      pollen: null,
      chooseTarget() {
        if (!flowerDrawList || flowerDrawList.size === 0) return;
        const currentFlowerList = [...flowerDrawList].filter(
          (flower) => flower.lifeStatus === "grown"
        );
        this.target =
          currentFlowerList[
            Math.floor(Math.random() * currentFlowerList.length)
          ];
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
        ctx.fillStyle = formatOKLCHColor(this.pollen?.petalColor) || "black";
        drawCircle(this.origin, 10);

        if (this.target) {
          ctx.strokeStyle = "red";
          ctx.beginPath();
          ctx.moveTo(...this.origin);
          ctx.lineTo(...this.target.origin);
          ctx.stroke();
          ctx.closePath();
        }
      },
    };
  };

  const beeList = [createBeeAgent(), createBeeAgent()];

  const generateFlowerSpeciesConfig = ({
    petalHue,
    maxSize,
    origin,
    lifeStatus = "growing",
  }: {
    petalHue?: number;
    maxSize: number;
    origin: [number, number] | undefined;
    lifeStatus: string;
  }): (() => Partial<CuteCirclyFlower>) => {
    petalHue = petalHue || Math.random() * 360;
    const baseLifetime = Math.random() * 2000 + 300;

    const speciesFeatures = {
      centreColor: Math.random() > 0.5 ? "white" : "#ffffcc",
      petalCount: Math.round(3 + Math.random() * 10),
      petalSize: Math.random() * 2 + 0.3,
      structureTolerence: Math.random() * 2,
      petalDistance: Math.random() * 2,
      maxSize: maxSize || canvasSize * (0.03 * Math.random() ** 2 + 0.01),
      growthSpeed: canvasSize * (0.0001 * Math.random()),
      colorTolerence: { l: 3, c: 0.01, h: 3 },
      lifetime: baseLifetime + baseLifetime * 0.1 * Math.random(),
      petalColor: {
        l: 75,
        c: 0.2,
        h: petalHue,
      },
    };

    return () => ({
      species: speciesFeatures,
      origin: origin || [(petalHue * 50) % canvasSize, petalHue * 2],
      rotation: Math.floor(360 * Math.random()),
      rotationSpeed: numberJitter(0, 0.5),
      size: 0,
      lifeStatus,
      age: 0,
      ...speciesFeatures,
    });
  };

  const cloverGrid = Array.from({ length: 1000 }, (_cell) =>
    CreateCuteCirclyFlower({
      ...getCloverVariantConfig(),
    })
  ).sort((cloverA, cloverB) => cloverA.petalColor.l - cloverB.petalColor.l);

  const cloverDrawList = [...cloverGrid];

  //   generate random flowers
  //   for (let i = 0; i < 360; i++) {
  //     let petalHue = i;
  ////     if (Math.abs(petalHue - cloverGreenHue) < 40) {
  ////       petalHue += Math.random() * 90 + (petalHue - cloverGreenHue);
  ////     }
  //     const getFlowerVariantConfig = generateFlowerSpeciesConfig({
  //       petalHue,
  //       maxSize: canvasSize * (0.03 * Math.random() ** 2 + 0.01),
  //     });
  //     const flower = CreateCuteCirclyFlower(getFlowerVariantConfig());
  //     flowerDrawList.push(flower);
  //   }

  let drawingActive = false;

  canvas.addEventListener(
    "mousedown",
    (event) => (drawingActive = true),
    false
  );

  canvas.addEventListener("mouseup", (event) => (drawingActive = false), false);

  // create flowers on click
  canvas.addEventListener(
    "mousemove",
    // "click",
    function (event) {
      if (!drawingActive) return;

      //   let petalHue = Math.random() * 360;
      let rect = canvas.getBoundingClientRect();
      let x = event.clientX - rect.left;
      let y = event.clientY - rect.top;
      const getFlowerVariantConfig = generateFlowerSpeciesConfig({
        // petalHue,
        maxSize: canvasSize * (0.03 * Math.random() ** 2 + 0.01),
        origin: [x, y],
        lifeStatus: "seed",
      });
      const flower = CreateCuteCirclyFlower(getFlowerVariantConfig());
      flowerDrawList.add(flower);
    },
    false
  );

  // create flowers at start
  for (let index = 0; index < 5; index++) {
    const getFlowerVariantConfig = generateFlowerSpeciesConfig({
      // petalHue,
      maxSize: canvasSize * (0.03 * Math.random() ** 2 + 0.01),
      origin: [canvasSize * Math.random(), canvasSize * Math.random()],
      lifeStatus: "seed",
    });
    const flower = CreateCuteCirclyFlower(getFlowerVariantConfig());
    flowerDrawList.add(flower);
  }

  (function drawArtwork(t = 0) {
    clearCanvas();
    cloverDrawList.forEach((entity) => {
      entity.draw();
    });
    flowerDrawList
      //   .sort(({ size: a }, { size: b }) => a - b)
      .forEach((entity) => {
        entity.draw();
      });
    beeList.forEach((entity) => entity.draw());

    window.requestAnimationFrame(drawArtwork);
  })();

  function drawCircle(origin: Coordinates, size: number): void {
    if (size < 0) {
      console.warn("circle size too small", size);
      return;
    }
    ctx.beginPath();
    ctx.moveTo(...origin);
    ctx.arc(...origin, size, 0, TAU);
    ctx.fill();
    ctx.closePath();
  }

  //   function drawClover(
  //     origin: Coordinates = [0, 0],
  //     rotation: number = 0,
  //     size: number = 30
  //   ): void {
  //     drawCloverLeafHalf(origin, rotation + 0, size);
  //     drawCloverLeafHalf(origin, rotation + 50, size);
  //     drawCloverLeafHalf(origin, rotation + 120, size);
  //     drawCloverLeafHalf(origin, rotation + 170, size);
  //     drawCloverLeafHalf(origin, rotation + 240, size);
  //     drawCloverLeafHalf(origin, rotation + 290, size);
  //   }

  //   function drawCloverLeafHalf(
  //     origin: Coordinates = [300, 300],
  //     rotation: number = 30,
  //     size: number = 50
  //   ): void {
  //     ctx.fillStyle = `#004400`;
  //     const length = size * 2;
  //     const leafBulge = length * 1.4;
  //     const entityRotater = makeEntityPointRotator(origin, rotation);
  //     const startPoint: Coordinates = [...origin];
  //     const [x, y] = origin;
  //     const corner1: Coordinates = entityRotater([x + size, y + length]);
  //     const controlPoint1a: Coordinates = entityRotater([x + 5, y + 10]);
  //     const controlPoint1b: Coordinates = entityRotater([
  //       x + size,
  //       y + length * 0.75,
  //     ]);
  //     const controlPoint2a: Coordinates = entityRotater([
  //       x + size,
  //       y + leafBulge,
  //     ]);
  //     const controlPoint2b: Coordinates = entityRotater([
  //       x - size,
  //       y + leafBulge,
  //     ]);
  //     const corner2: Coordinates = entityRotater([x - size, y + length]);
  //     const controlPoint3a: Coordinates = entityRotater([
  //       x - size,
  //       y + length * 0.75,
  //     ]);
  //     const controlPoint3b: Coordinates = entityRotater([x - 5, y + 10]);
  //     ctx.beginPath();
  //     ctx.moveTo(...startPoint);
  //     ctx.bezierCurveTo(...controlPoint1a, ...controlPoint1b, ...corner1);
  //     ctx.bezierCurveTo(...controlPoint2a, ...controlPoint2b, ...corner2);
  //     ctx.bezierCurveTo(...controlPoint3a, ...controlPoint3b, ...startPoint);
  //     ctx.fill();
  //     ctx.closePath();
  //   }

  function makeEntityPointRotator(
    origin: Coordinates = [0, 0],
    angle: number = 0
  ): (point: Coordinates) => Coordinates {
    return (point) => {
      return entityRotaterAroundPoint(origin, point, angle);
    };
  }

  function entityRotaterAroundPoint(
    centerOfRotation: Coordinates = [0, 0],
    CoordinatesToRotate: Coordinates,
    angle: number
  ): Coordinates {
    const [cx, cy] = centerOfRotation;
    const [x, y] = CoordinatesToRotate;
    const radians = (Math.PI / 180) * angle;
    const cos = Math.cos(radians);
    const sin = Math.sin(radians);
    const nx = cos * (x - cx) + sin * (y - cy) + cx;
    const ny = cos * (y - cy) - sin * (x - cx) + cy;
    return [nx, ny];
  }
}
