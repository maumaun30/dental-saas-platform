const UPPER_FDI = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28];
const LOWER_FDI = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38];

const FDI_TO_UNIVERSAL: Record<number, number> = {};
UPPER_FDI.forEach((fdi, i) => (FDI_TO_UNIVERSAL[fdi] = i + 1));
LOWER_FDI.forEach((fdi, i) => (FDI_TO_UNIVERSAL[fdi] = 32 - i));

export type NumberingSystem = 'FDI' | 'Universal';

export const TEETH = {
  upper: UPPER_FDI.map(fdi => ({ fdi, universal: FDI_TO_UNIVERSAL[fdi] })),
  lower: LOWER_FDI.map(fdi => ({ fdi, universal: FDI_TO_UNIVERSAL[fdi] })),
};

export function toothLabel(fdi: number | null, numberingSystem: NumberingSystem): string {
  if (fdi == null) {
    return '—';
  }
  if (numberingSystem === 'Universal') {
    return String(FDI_TO_UNIVERSAL[fdi] ?? fdi);
  }
  return String(fdi);
}

export function fdiToUniversal(fdi: number): number | null {
  return FDI_TO_UNIVERSAL[fdi] ?? null;
}
