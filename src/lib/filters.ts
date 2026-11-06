import { FILTER_IDS } from "./constants";
import type { FilterId } from "./types";

export type Filter = {
  label: string;
  css: string;
  matrix: readonly number[];
};

const IDENTITY: readonly number[] = [
  1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0,
];

function multiply(a: readonly number[], b: readonly number[]): number[] {
  const result = new Array<number>(20).fill(0);
  for (let row = 0; row < 4; row += 1) {
    for (let col = 0; col < 4; col += 1) {
      let value = 0;
      for (let k = 0; k < 4; k += 1) {
        value += a[row * 5 + k] * b[k * 5 + col];
      }
      result[row * 5 + col] = value;
    }
    let offset = a[row * 5 + 4];
    for (let k = 0; k < 4; k += 1) {
      offset += a[row * 5 + k] * b[k * 5 + 4];
    }
    result[row * 5 + 4] = offset;
  }
  return result;
}

function compose(...steps: readonly number[][]): number[] {
  return steps.reduce<number[]>(
    (combined, step) => multiply(step, combined),
    [...IDENTITY],
  );
}

function saturate(amount: number): number[] {
  return [
    0.213 + 0.787 * amount,
    0.715 - 0.715 * amount,
    0.072 - 0.072 * amount,
    0,
    0,
    0.213 - 0.213 * amount,
    0.715 + 0.285 * amount,
    0.072 - 0.072 * amount,
    0,
    0,
    0.213 - 0.213 * amount,
    0.715 - 0.715 * amount,
    0.072 + 0.928 * amount,
    0,
    0,
    0,
    0,
    0,
    1,
    0,
  ];
}

function sepia(amount: number): number[] {
  const mix = (base: number, target: number) =>
    base * (1 - amount) + target * amount;
  return [
    mix(1, 0.393),
    mix(0, 0.769),
    mix(0, 0.189),
    0,
    0,
    mix(0, 0.349),
    mix(1, 0.686),
    mix(0, 0.168),
    0,
    0,
    mix(0, 0.272),
    mix(0, 0.534),
    mix(1, 0.131),
    0,
    0,
    0,
    0,
    0,
    1,
    0,
  ];
}

function contrast(amount: number): number[] {
  const offset = (0.5 - 0.5 * amount) * 255;
  return [
    amount,
    0,
    0,
    0,
    offset,
    0,
    amount,
    0,
    0,
    offset,
    0,
    0,
    amount,
    0,
    offset,
    0,
    0,
    0,
    1,
    0,
  ];
}

function brightness(amount: number): number[] {
  return [
    amount,
    0,
    0,
    0,
    0,
    0,
    amount,
    0,
    0,
    0,
    0,
    0,
    amount,
    0,
    0,
    0,
    0,
    0,
    1,
    0,
  ];
}

function grayscale(amount: number): number[] {
  const luminanceRed = 0.2126;
  const luminanceGreen = 0.7152;
  const luminanceBlue = 0.0722;
  const mix = (base: number, target: number) =>
    base * (1 - amount) + target * amount;
  return [
    mix(1, luminanceRed),
    mix(0, luminanceGreen),
    mix(0, luminanceBlue),
    0,
    0,
    mix(0, luminanceRed),
    mix(1, luminanceGreen),
    mix(0, luminanceBlue),
    0,
    0,
    mix(0, luminanceRed),
    mix(0, luminanceGreen),
    mix(1, luminanceBlue),
    0,
    0,
    0,
    0,
    0,
    1,
    0,
  ];
}

function hueRotate(degrees: number): number[] {
  const radians = (degrees * Math.PI) / 180;
  const cosine = Math.cos(radians);
  const sine = Math.sin(radians);
  return [
    0.213 + cosine * 0.787 - sine * 0.213,
    0.715 - cosine * 0.715 - sine * 0.715,
    0.072 - cosine * 0.072 + sine * 0.928,
    0,
    0,
    0.213 - cosine * 0.213 + sine * 0.143,
    0.715 + cosine * 0.285 + sine * 0.14,
    0.072 - cosine * 0.072 - sine * 0.283,
    0,
    0,
    0.213 - cosine * 0.213 - sine * 0.787,
    0.715 - cosine * 0.715 + sine * 0.715,
    0.072 + cosine * 0.928 + sine * 0.072,
    0,
    0,
    0,
    0,
    0,
    1,
    0,
  ];
}

export const filters = {
  natural: { label: "Natural", css: "none", matrix: IDENTITY },
  warm: {
    label: "Warm",
    css: "saturate(1.08) sepia(0.08) contrast(1.02)",
    matrix: compose(saturate(1.08), sepia(0.08), contrast(1.02)),
  },
  golden: {
    label: "Golden",
    css: "sepia(0.18) saturate(1.15) brightness(1.04)",
    matrix: compose(sepia(0.18), saturate(1.15), brightness(1.04)),
  },
  faded: {
    label: "Faded",
    css: "saturate(0.82) contrast(0.92) brightness(1.05)",
    matrix: compose(saturate(0.82), contrast(0.92), brightness(1.05)),
  },
  noir: {
    label: "Noir",
    css: "grayscale(1) contrast(1.12)",
    matrix: compose(grayscale(1), contrast(1.12)),
  },
  cool: {
    label: "Cool",
    css: "saturate(1.05) hue-rotate(-8deg) brightness(1.02)",
    matrix: compose(saturate(1.05), hueRotate(-8), brightness(1.02)),
  },
  vivid: {
    label: "Vivid",
    css: "saturate(1.3) contrast(1.06)",
    matrix: compose(saturate(1.3), contrast(1.06)),
  },
} satisfies Record<FilterId, Filter>;

export const filterOrder = FILTER_IDS;

function clampChannel(value: number) {
  if (value < 0) return 0;
  if (value > 255) return 255;
  return value;
}

export function applyFilterToPixels(
  data: Uint8ClampedArray,
  filterId: FilterId,
) {
  const matrix = filters[filterId].matrix;
  for (let index = 0; index < data.length; index += 4) {
    const red = data[index];
    const green = data[index + 1];
    const blue = data[index + 2];
    const alpha = data[index + 3];

    data[index] = clampChannel(
      Math.round(
        matrix[0] * red +
          matrix[1] * green +
          matrix[2] * blue +
          matrix[3] * alpha +
          matrix[4],
      ),
    );
    data[index + 1] = clampChannel(
      Math.round(
        matrix[5] * red +
          matrix[6] * green +
          matrix[7] * blue +
          matrix[8] * alpha +
          matrix[9],
      ),
    );
    data[index + 2] = clampChannel(
      Math.round(
        matrix[10] * red +
          matrix[11] * green +
          matrix[12] * blue +
          matrix[13] * alpha +
          matrix[14],
      ),
    );
  }
}
