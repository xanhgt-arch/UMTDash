export function getAxisScale(maxValue: number) {
  const step = maxValue <= 100 ? 10 : maxValue <= 1000 ? 100 : 1000;
  const max = Math.max(step, Math.ceil(maxValue / step) * step);
  const ticks = Array.from({ length: max / step + 1 }, (_, index) => index * step);

  return { max, ticks };
}
