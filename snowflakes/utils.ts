export const pseudoRandomMax: number = 2147483647;

export function* pseudoRandom(seed: number, kind = "int") {
  // protect against zero
  if (seed === 0) {
    seed = pseudoRandomMax - 1;
  }

  let value: number = seed;
  let formatted: number;

  while (true) {
    value = (value * 16807) % pseudoRandomMax;
    if (kind === "decimal") {
      formatted = parseFloat(`0.${value.toString().slice(-5)}`);
    } else {
      formatted = value;
    }
    yield formatted;
  }
}

export function randomInt(): number {
  return Math.ceil(Math.random() * pseudoRandomMax);
}

export const clamp = (
  value: number,
  min: number = -Infinity,
  max: number = Infinity
): number => (value < min ? min : value > max ? max : value);
