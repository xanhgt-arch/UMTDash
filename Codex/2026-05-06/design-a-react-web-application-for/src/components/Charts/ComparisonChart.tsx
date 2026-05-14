import { useState } from 'react';
import ChartTooltip, { getTooltipPosition } from '../Common/ChartTooltip';
import EmptyState from '../Common/EmptyState';
import { chartBlue, chartYellow } from './chartPalette';

const width = 760;
const height = 340;
const padding = { top: 22, right: 28, bottom: 118, left: 58 };

export default function ComparisonChart({ data, series }) {
  const [tooltip, setTooltip] = useState(null);

  if (!data.length || !series[0] || !series[1]) return <EmptyState />;

  const max = Math.max(...data.flatMap((item) => series.map((name) => item[name] || 0)), 1);
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;
  const axisLabelY = padding.top + innerHeight + 14;
  const step = data.length > 1 ? innerWidth / (data.length - 1) : innerWidth;
  const colors = [chartBlue, chartYellow];

  const linePoints = (name) =>
    data
      .map((item, index) => {
        const x = padding.left + index * step;
        const y = padding.top + innerHeight - ((item[name] || 0) / max) * innerHeight;
        return `${x},${y}`;
      })
      .join(' ');
  const showTooltip = (event, item) => {
    setTooltip({
      ...getTooltipPosition(event),
      title: item.label,
      rows: series.map((name, index) => ({
        label: name,
        value: (item[name] || 0).toLocaleString(),
        color: colors[index]
      }))
    });
  };

  return (
    <div className="chart-hover-root">
      <div className="legend-row">
        {series.map((name, index) => (
          <span key={name}>
            <i style={{ background: colors[index] }} />
            {name}
          </span>
        ))}
      </div>
      <div className="chart-scroll">
        <svg className="chart" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Application comparison chart">
        {[0, 0.25, 0.5, 0.75, 1].map((tick) => {
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

        {series.map((name, seriesIndex) => (
          <g key={name}>
            <polyline
              className="line-path"
              points={linePoints(name)}
              fill="none"
              stroke={colors[seriesIndex]}
              strokeWidth={seriesIndex === 0 ? 5 : 2}
            />
            {data.map((item, index) => {
              const x = padding.left + index * step;
              const y = padding.top + innerHeight - ((item[name] || 0) / max) * innerHeight;
              return (
                <g key={`${name}-${item.rawDate}`}>
                  <circle
                    className="line-point"
                    cx={x}
                    cy={y}
                    r={seriesIndex === 0 ? 6 : 4}
                    fill={colors[seriesIndex]}
                    onMouseEnter={(event) => showTooltip(event, item)}
                    onMouseMove={(event) => showTooltip(event, item)}
                    onMouseLeave={() => setTooltip(null)}
                  />
                  <ValueLabel
                    x={x}
                    y={Math.max(padding.top + 12, y - (seriesIndex === 0 ? 12 : 28))}
                    value={item[name] || 0}
                  />
                </g>
              );
            })}
          </g>
        ))}

        {data.map((item, index) => {
          const x = padding.left + index * step;
          return (
            <text
              key={item.rawDate}
              className="axis-label vertical-axis-label"
              x={x}
              y={axisLabelY}
              textAnchor="end"
              transform={`rotate(-90 ${x} ${axisLabelY})`}
            >
              {item.label}
            </text>
          );
        })}
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

function formatValue(value) {
  return new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(value);
}
