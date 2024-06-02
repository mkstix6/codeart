export type LCHValues = { l: number; c: number; h: number };

export const formatOKLCHColor = (
  { l: luminosity, c: chroma, h: hue }: LCHValues = { l: 0, c: 0, h: 0 }
): string => `oklch(${luminosity}% ${chroma} ${hue})`;
