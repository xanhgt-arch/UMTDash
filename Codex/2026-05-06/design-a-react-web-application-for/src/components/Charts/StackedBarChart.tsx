import { useState } from 'react';
import ChartTooltip, { getTooltipPosition } from '../Common/ChartTooltip';
import EmptyState from '../Common/EmptyState';
import { getChartColor } from './chartPalette';

const width = 760;
const height = 368;
const padding = { top: 24, right: 28, bottom: 126, left: 58 };

export default function StackedBarChart({ data, series }) {
  const [tooltip, setTooltip] = useState(null);

  if (!data.length || !series.length) return <EmptyState />;

  const max = Math.max(...data.map((item) => item.total || 0), 1);
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;
  const axisLabelY = padding.top + innerHeight + 14;
  const slotWidth = innerWidth / data.length;
  const barWidth = Math.max(26, Math.min(52, slotWidth - 14));
  const colorFor = (index: number) => getChartColor(index, series.length);

  const showTooltip = (event, item, name, value, color) => {
    setTooltip({
      ...getTooltipPosition(event),
      title: item.label,
      rows: [
        { label: name, value: value.toLocaleString(), color },
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
        <svg className="chart" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Monthly application stacked bar chart">
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

          {data.map((item, index) => {
            const x = padding.left + index * slotWidth + (slotWidth - barWidth) / 2;
            let yCursor = padding.top + innerHeight;

            return (
              <g key={item.rawDate || item.label}>
                {series.map((name, seriesIndex) => {
                  const value = item[name] || 0;
                  const segmentHeight = (value / max) * innerHeight;
                  yCursor -= segmentHeight;
                  const color = colorFor(seriesIndex);

                  if (!value) return null;

                  return (
                    <rect
                      className="bar stacked-bar-segment"
                      key={`${item.rawDate}-${name}`}
                      x={x}
                      y={yCursor}
                      width={barWidth}
                      height={Math.max(segmentHeight, 1)}
                      fill={color}
                      rx={segmentHeight > 8 ? 3 : 0}
                      onMouseEnter={(event) => showTooltip(event, item, name, value, color)}
                      onMouseMove={(event) => showTooltip(event, item, name, value, color)}
                      onMouseLeave={() => setTooltip(null)}
                    />
                  );
                })}
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
          })}
        </svg>
      </div>
      <ChartTooltip tooltip={tooltip} />
    </div>
  );
}
