export function computeBmi(weightKg: number, heightCm: number): number {
  const heightM = heightCm / 100;
  return weightKg / (heightM * heightM);
}
