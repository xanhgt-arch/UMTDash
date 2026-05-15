import { useState } from 'react';
import ChartTooltip, { getTooltipPosition } from '../Common/ChartTooltip';
import EmptyState from '../Common/EmptyState';
import { getAxisScale } from './axisScale';
import { getChartColor } from './chartPalette';

const width = 760;
const height = 368;
const padding = { top: 24, right: 28, bottom: 126, left: 58 };

export default function MultiSeriesLineChart({ data, series }) {
  const [tooltip, setTooltip] = useState(null);

  if (!data.length || !series.length) return <EmptyState />;

  const rawMax = Math.max(...data.flatMap((item) => series.map((name) => item[name] || 0)), 1);
  const { max, ticks } = getAxisScale(rawMax);
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;
  const axisLabelY = padding.top + innerHeight + 14;
  const step = data.length > 1 ? innerWidth / (data.length - 1) : innerWidth;
  const colorFor = (index: number) => getChartColor(index, series.length);

  const getPoint = (item, index, name) => {
    const x = padding.left + index * step;
    const y = padding.top + innerHeight - ((item[name] || 0) / max) * innerHeight;
    return { x, y };
  };

  const linePoints = (name) =>
    data
      .map((item, index) => {
        const point = getPoint(item, index, name);
        return `${point.x},${point.y}`;
      })
      .join(' ');

  const showTooltip = (event, item, name, color) => {
    setTooltip({
      ...getTooltipPosition(event),
      title: item.label,
      rows: [
        { label: name, value: (item[name] || 0).toLocaleString(), color },
        { label: 'Month total', value: (item.total || 0).toLocaleString(), color: '#ffffff' }
      ]
    });
  };

  return (
    <div className="chart-hover-root">
      <div className="legend-row stacked-legend">
        {series.map((name, index) => (
          <span key={name}>
            <i style={{ background: colorFor(index) }} />
            {name}
          </span>
        ))}
      </div>

      <div className="chart-scroll">
        <svg className="chart" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Monthly application line chart">
          {ticks.map((tick) => {
            const y = padding.top + innerHeight - (tick / max) * innerHeight;
            return (
              <g key={tick}>
                <line className="grid-line" x1={padding.left} x2={width - padding.right} y1={y} y2={y} />
                <text className="axis-value" x={padding.left - 12} y={y + 4} textAnchor="end">
                  {tick.toLocaleString()}
                </text>
              </g>
            );
          })}

          {series.map((name, seriesIndex) => {
            const color = colorFor(seriesIndex);
            return (
              <g key={name}>
                <polyline className="line-path" points={linePoints(name)} fill="none" stroke={color} />
                {data.map((item, index) => {
                  const point = getPoint(item, index, name);
                  return (
                    <circle
                      key={`${name}-${item.rawDate}`}
                      className="line-point"
                      cx={point.x}
                      cy={point.y}
                      r="6"
                      fill={color}
                      onMouseEnter={(event) => showTooltip(event, item, name, color)}
                      onMouseMove={(event) => showTooltip(event, item, name, color)}
                      onMouseLeave={() => setTooltip(null)}
                    />
                  );
                })}
              </g>
            );
          })}

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
