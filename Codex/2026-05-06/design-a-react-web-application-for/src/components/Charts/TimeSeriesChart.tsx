import { useId, useState } from 'react';
import ChartTooltip, { getTooltipPosition } from '../Common/ChartTooltip';
import EmptyState from '../Common/EmptyState';
import { chartBlue, chartYellow } from './chartPalette';

const width = 760;
const height = 340;
const padding = { top: 22, right: 28, bottom: 118, left: 58 };

export default function TimeSeriesChart({ data, variant = 'line', color = chartBlue, showValues = false }) {
  const gradientId = useId().replace(/:/g, '');
  const [tooltip, setTooltip] = useState(null);

  if (!data.length) return <EmptyState />;

  const max = Math.max(...data.map((item) => item.value), 1);
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;
  const axisLabelY = padding.top + innerHeight + 14;
  const step = data.length > 1 ? innerWidth / (data.length - 1) : innerWidth;
  const barWidth = Math.max(18, Math.min(46, innerWidth / data.length - 12));

  const points = data
    .map((item, index) => {
      const x = padding.left + index * step;
      const y = padding.top + innerHeight - (item.value / max) * innerHeight;
      return `${x},${y}`;
    })
    .join(' ');
  const areaPoints = `${padding.left},${padding.top + innerHeight} ${points} ${padding.left + (data.length - 1) * step},${
    padding.top + innerHeight
  }`;
  const showTooltip = (event, item) => {
    setTooltip({
      ...getTooltipPosition(event),
      title: item.label,
      rows: [{ label: 'Monthly runs', value: item.value.toLocaleString(), color }]
    });
  };

  return (
    <div className="chart-hover-root">
      <div className="chart-scroll">
        <svg className="chart" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Time series chart">
        <defs>
          <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.2" />
            <stop offset="70%" stopColor={color} stopOpacity="0.1" />
            <stop offset="100%" stopColor={chartYellow} stopOpacity="0.08" />
          </linearGradient>
        </defs>
        <ChartGrid max={max} />

        {variant === 'bar'
          ? data.map((item, index) => {
              const x = padding.left + index * (innerWidth / data.length) + (innerWidth / data.length - barWidth) / 2;
              const barHeight = (item.value / max) * innerHeight;
              const y = padding.top + innerHeight - barHeight;
              const valueLabelY = Math.max(padding.top + 12, y - 8);

              return (
                <g key={item.rawDate || item.label}>
                  <rect
                    className="bar"
                    x={x}
                    y={y}
                    width={barWidth}
                    height={barHeight}
                    rx="4"
                    fill={color}
                    onMouseEnter={(event) => showTooltip(event, item)}
                    onMouseMove={(event) => showTooltip(event, item)}
                    onMouseLeave={() => setTooltip(null)}
                  />
                  {showValues ? (
                    <ValueLabel x={x + barWidth / 2} y={valueLabelY} value={item.value} />
                  ) : null}
                  <text
                    className="axis-label vertical-axis-label"
                    x={x + barWidth / 2}
                    y={axisLabelY}
                    textAnchor="end"
                    transform={`rotate(-90 ${x + barWidth / 2} ${axisLabelY})`}
                  >
                    {item.label}
                  </text>
                </g>
              );
            })
          : null}

        {variant === 'line' ? (
          <>
            <polygon points={areaPoints} fill={`url(#${gradientId})`} />
            <polyline className="line-path" points={points} fill="none" stroke={color} />
            <polyline className="line-path chart-yellow-accent" points={points} fill="none" stroke={chartYellow} pathLength="100" />
            {data.map((item, index) => {
              const x = padding.left + index * step;
              const y = padding.top + innerHeight - (item.value / max) * innerHeight;
              const valueLabelY = Math.max(padding.top + 12, y - (index % 2 === 0 ? 12 : 28));
              return (
                <g key={item.rawDate || item.label}>
                  <circle
                    className="line-point"
                    cx={x}
                    cy={y}
                    r="6"
                    fill={color}
                    onMouseEnter={(event) => showTooltip(event, item)}
                    onMouseMove={(event) => showTooltip(event, item)}
                    onMouseLeave={() => setTooltip(null)}
                  />
                  {showValues ? <ValueLabel x={x} y={valueLabelY} value={item.value} /> : null}
                  <text
                    className="axis-label vertical-axis-label"
                    x={x}
                    y={axisLabelY}
                    textAnchor="end"
                    transform={`rotate(-90 ${x} ${axisLabelY})`}
                  >
                    {item.label}
                  </text>
                </g>
              );
            })}
          </>
        ) : null}
        </svg>
      </div>
      <ChartTooltip tooltip={tooltip} />
    </div>
  );
}

function ValueLabel({ x, y, value }) {
  const label = formatValue(value);
  const width = Math.max(28, label.length * 6 + 10);

  return (
    <g className="chart-value-label" aria-hidden="true">
      <rect x={x - width / 2} y={y - 11} width={width} height="18" rx="4" />
      <text x={x} y={y + 2} textAnchor="middle">
        {label}
      </text>
    </g>
  );
}

function ChartGrid({ max }) {
  const ticks = [0, 0.25, 0.5, 0.75, 1];
  const innerHeight = height - padding.top - padding.bottom;

  return (
    <>
      {ticks.map((tick) => {
        const y = padding.top + innerHeight - tick * innerHeight;
        return (
          <g key={tick}>
            <line className="grid-line" x1={padding.left} x2={width - padding.right} y1={y} y2={y} />
            <text className="axis-value" x={padding.left - 12} y={y + 4} textAnchor="end">
              {Math.round(max * tick).toLocaleString()}
            </text>
          </g>
        );
      })}
    </>
  );
}

function formatValue(value) {
  return new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(value);
}
