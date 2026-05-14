export const chartBlues = [
  '#002f5f',
  '#003f7d',
  '#005eb8',
  '#0b315b',
  '#0f4c81',
  '#0077c8',
  '#00a3e0'
];

export const chartYellows = [
  '#ffc20e',
  '#d49a00',
  '#f6d55c'
];

export const chartPalette = [...chartBlues, ...chartYellows];
export const chartBlue = '#005eb8';
export const chartYellow = '#ffc20e';

export function getChartColor(index: number, total?: number) {
  if (!total) return chartPalette[index % chartPalette.length];

  const blueCount = Math.max(1, Math.ceil(total * 0.7));
  if (index < blueCount) return chartBlues[index % chartBlues.length];
  return chartYellows[(index - blueCount) % chartYellows.length];
}
