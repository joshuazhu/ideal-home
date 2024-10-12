export const toMillionDollars = (value: number): string => {
  const millionValue = value / 1_000_000;
  return `${millionValue.toFixed(2)}m`;
}
