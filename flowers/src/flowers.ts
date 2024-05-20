type Coordinates = [number, number];
type HSLValues = [number, number, number];

type LIFESTATUS = "growing" | "dying" | "dead" | "dormant";

interface CuteCirclyFlower {
  age: number;
  centreColor: string | null;
  colorTolerence: HSLValues;
  draw: () => void;
  entityRotater: (point: Coordinates) => Coordinates;
  grow: () => void;
  growthSpeed: number;
  lifeStatus: LIFESTATUS;
  lifetime: number;
  maxSize: number;
  origin: Coordinates;
  petalColor: HSLValues;
  petalCount: number;
  petalDistance: number;
  petalDistanceOG: number;
  petals: { petalColor: HSLValues }[];
  petalSize: number;
  rotation: number;
  rotationSpeed: number;
  size: number;
  structureTolerence: number;
}

const formatHSLColor = ([h, s, l]: HSLValues): string => `hsl(${h} ${s} ${l})`;

export function flowers() {
  const TAU = Math.PI * 2;
  // Prepare canvas
  const canvas = <HTMLCanvasElement>document.getElementById("canvas");
  const canvasSize = 2 ** 9;
  canvas.width = canvasSize;
  canvas.height = canvasSize;
  const ctx = <CanvasRenderingContext2D>canvas.getContext("2d");
  const bgGradient = ctx.createLinearGradient(0, 0, 0, canvasSize);
  const cloverGreenHue = 136;
  // Add three color stops
  bgGradient.addColorStop(0, `hsl(${cloverGreenHue} 10 15`);
  bgGradient.addColorStop(1, `hsl(${cloverGreenHue} 10 10`);

  // Fill canvas
  function clearCanvas() {
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, canvasSize, canvasSize);
  }

  clearCanvas();

  const CreateCuteCirclyFlower = ({
    age = 0,
    centreColor = "white",
    colorTolerence = [3, 4, 4],
    growthSpeed = canvasSize * 0.01,
    lifeStatus = "growing" as "growing",
    lifetime = 500,
    maxSize = Infinity,
    origin = [0, 0],
    petalColor = [0, 73, 89],
    petalCount = 5,
    petalDistance = 1,
    petalDistanceOG = 1,
    petalSize = 1,
    rotation = 0,
    rotationSpeed = 0,
    size = 0,
    structureTolerence = 0,
  }: Partial<CuteCirclyFlower>): CuteCirclyFlower => {
    const createPetal = (petalColor: HSLValues) => {
      return {
        petalColor,
      };
    };
    const petals = Array.from({ length: petalCount }, (petal) =>
      createPetal(
        <HSLValues>(
          petalColor.map(
            (value, i) => value + (Math.random() * 2 - 1) * colorTolerence[i]
          )
        )
      )
    );
    return {
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
      petalDistanceOG,
      petals,
      petalSize,
      rotation,
      rotationSpeed,
      size,
      structureTolerence,
      grow() {
        if (!this.petalDistanceOG) {
          this.petalDistanceOG = this.petalDistance;
        }
        this.age++;
        if (this.lifeStatus === "growing") {
          this.size += this.growthSpeed;
          this.rotation += this.rotationSpeed;
        }
        if (this.lifeStatus === "dormant") {
          // nothing doing
        }
        if (this.age > this.lifetime) {
          this.lifeStatus = "dying";
          this.size -= 0.1;
          this.petalDistance += 0.1;
        }
        if (this.lifeStatus === "dying" && this.size < 0) {
          this.lifeStatus = "dead";

          //   this.entityRotater = makeEntityPointRotator(this.origin, 0);
        }
        if (this.lifeStatus === "dead") {
          //   this.origin = [
          //     Math.random() * canvasSize,
          //     Math.random() * canvasSize,
          //   ];
          this.petalDistance = this.petalDistanceOG;
          this.size = 0;
          this.age = 0;
          //   this.origin = [10, 10];
          this.lifeStatus = Math.random() > 0.5 ? "growing" : "dormant";
        }
        if (this.size > this.maxSize) {
          this.size = this.maxSize;
        }
      },
      draw() {
        this.entityRotater = makeEntityPointRotator(this.origin, this.rotation);

        this.grow();

        for (let i = 0; i < petalCount; i++) {
          ctx.fillStyle = formatHSLColor(petals[i].petalColor);
          const petalCoordinates: Coordinates = [
            origin[0] + this.size * this.petalDistance,
            origin[1],
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
          drawCircle([origin[0], origin[1]], this.size);
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

    return {
      centreColor: null,
      colorTolerence: [0, 0, 0],
      growthSpeed: canvasSize * 0.00005 + 0.01 * Math.random(),
      lifetime: Infinity,
      maxSize: canvasSize * 0.02,
      origin: [Math.random() * canvasSize, Math.random() * canvasSize],
      petalColor: [
        cloverGreenHue,
        Math.random() * 10 + 40,
        (Math.ceil(Math.random() * 5) + 5) * Math.ceil(Math.random() * 3),
      ],
      petalCount: Math.random() > 0.9 ? 4 : 3,
      petalDistance: 1,
      petalDistanceOG: 1,
      rotation: Math.floor(360 * Math.random()),
      rotationSpeed: 0.2 * (Math.random() - 0.5),
      size: 0,
      structureTolerence: 10,
    };
  };

  const generateFlowerSpeciesConfig = ({
    petalHue,
    maxSize,
  }: {
    petalHue: number;
    maxSize: number;
  }): (() => Partial<CuteCirclyFlower>) => {
    const baseLifetime = Math.random() * 2000 + 300;

    const speciesFeatures = {
      centreColor: Math.random() > 0.5 ? "white" : "#ffffcc",
      petalCount: Math.round(3 + Math.random() * 10),
      petalSize: Math.random() * 2 + 0.3,
      structureTolerence: Math.random() * 2,
      petalDistance: Math.random() * 2,
    };

    return () => ({
      origin: [Math.random() * canvasSize, Math.random() * canvasSize],
      rotation: Math.floor(360 * Math.random()),
      rotationSpeed: 0.5 * (Math.random() - 0.5),
      size: 0,
      maxSize, //canvasSize * (0.03 * Math.random() ** 2 + 0.01),
      growthSpeed: canvasSize * (0.0001 * Math.random()),
      petalColor: [petalHue, Math.random() * 10 + 70, Math.random() * 10 + 60],
      lifetime: baseLifetime + baseLifetime * 0.1 * Math.random(),
      lifeStatus: "growing",
      age: 0,
      petalDistanceOG: speciesFeatures.petalDistance,
      ...speciesFeatures,
    });
  };

  const cloverGrid = Array.from({ length: 2000 }, (_cell) =>
    CreateCuteCirclyFlower({
      ...getCloverVariantConfig(),
      colorTolerence: [0, 0, 0],
    })
  ).sort((cloverA, cloverB) => cloverA.petalColor[2] - cloverB.petalColor[2]);

  const cloverDrawList = [...cloverGrid];
  const flowerDrawList = [];

  //   generate random flowers
  for (let i = 0; i < Math.random() * 10 + 3; i++) {
    let petalHue = Math.random() * 360;
    if (Math.abs(petalHue - cloverGreenHue) < 40) {
      petalHue += Math.random() * 90 + (petalHue - cloverGreenHue);
    }
    const getFlowerVariantConfig = generateFlowerSpeciesConfig({
      petalHue,
      maxSize: canvasSize * (0.03 * Math.random() ** 2 + 0.01),
    });
    for (let j = 0; j < Math.random() * 300; j++) {
      const flower = CreateCuteCirclyFlower(getFlowerVariantConfig());
      flowerDrawList.push(flower);
    }
  }

  (function drawArtwork(t = 0) {
    clearCanvas();
    cloverDrawList.forEach((entity) => {
      entity.draw();
    });
    flowerDrawList
      .sort(({ size: a }, { size: b }) => a - b)
      .forEach((entity) => {
        entity.draw();
      });
    window.requestAnimationFrame(drawArtwork);
  })();

  function drawCircle(origin: Coordinates, size: number): void {
    ctx.beginPath();
    ctx.moveTo(...origin);
    ctx.arc(...origin, size, 0, TAU);
    ctx.fill();
    ctx.closePath();
  }

  function drawClover(
    origin: Coordinates = [0, 0],
    rotation: number = 0,
    size: number = 30
  ): void {
    drawCloverLeafHalf(origin, rotation + 0, size);
    drawCloverLeafHalf(origin, rotation + 50, size);
    drawCloverLeafHalf(origin, rotation + 120, size);
    drawCloverLeafHalf(origin, rotation + 170, size);
    drawCloverLeafHalf(origin, rotation + 240, size);
    drawCloverLeafHalf(origin, rotation + 290, size);
  }

  function drawCloverLeafHalf(
    origin: Coordinates = [300, 300],
    rotation: number = 30,
    size: number = 50
  ): void {
    ctx.fillStyle = `#004400`;
    const length = size * 2;
    const leafBulge = length * 1.4;
    const entityRotater = makeEntityPointRotator(origin, rotation);
    const startPoint: Coordinates = [...origin];
    const [x, y] = origin;
    const corner1: Coordinates = entityRotater([x + size, y + length]);
    const controlPoint1a: Coordinates = entityRotater([x + 5, y + 10]);
    const controlPoint1b: Coordinates = entityRotater([
      x + size,
      y + length * 0.75,
    ]);
    const controlPoint2a: Coordinates = entityRotater([
      x + size,
      y + leafBulge,
    ]);
    const controlPoint2b: Coordinates = entityRotater([
      x - size,
      y + leafBulge,
    ]);
    const corner2: Coordinates = entityRotater([x - size, y + length]);
    const controlPoint3a: Coordinates = entityRotater([
      x - size,
      y + length * 0.75,
    ]);
    const controlPoint3b: Coordinates = entityRotater([x - 5, y + 10]);
    ctx.beginPath();
    ctx.moveTo(...startPoint);
    ctx.bezierCurveTo(...controlPoint1a, ...controlPoint1b, ...corner1);
    ctx.bezierCurveTo(...controlPoint2a, ...controlPoint2b, ...corner2);
    ctx.bezierCurveTo(...controlPoint3a, ...controlPoint3b, ...startPoint);
    ctx.fill();
    ctx.closePath();
  }

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
