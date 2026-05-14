import { useId, useState } from 'react';
import ChartTooltip, { getTooltipPosition } from '../Common/ChartTooltip';
import EmptyState from '../Common/EmptyState';
import { chartYellow, getChartColor } from './chartPalette';

export default function PieChart({ data, limit = 7, size = 'default' }) {
  const filterId = useId().replace(/:/g, '');
  const [tooltip, setTooltip] = useState(null);
  const visible = data.slice(0, limit);
  const total = visible.reduce((sum, item) => sum + item.value, 0);

  if (!total) return <EmptyState />;

  let startAngle = -90;
  const colorFor = (index: number) => getChartColor(index, visible.length);
  const slices = visible.map((item, index) => {
    const share = item.value / total;
    const endAngle = startAngle + share * 360;
    const slice = {
      item,
      index,
      share,
      color: colorFor(index),
      topPath: getSlicePath(110, 110, 86, startAngle, endAngle),
      depthPath: getSlicePath(110, 122, 86, startAngle, endAngle)
    };
    startAngle = endAngle;
    return slice;
  });

  return (
    <div className={`chart-hover-root pie-wrap ${size === 'large' ? 'large' : ''}`}>
      <svg className="pie-chart" viewBox="0 0 220 220" role="img" aria-label="Pie chart">
        <defs>
          <filter id={`pie-shadow-${filterId}`} x="-20%" y="-20%" width="140%" height="150%">
            <feDropShadow dx="0" dy="9" stdDeviation="6" floodColor="#12375f" floodOpacity="0.24" />
          </filter>
        </defs>
        <g className="pie-depth-layer">
          {slices.map(({ item, depthPath }) => (
            <path key={`${item.label}-depth`} className="pie-slice-depth" d={depthPath} />
          ))}
        </g>
        <g filter={`url(#pie-shadow-${filterId})`}>
          {slices.map(({ item, color, topPath }) => (
            <path
              key={item.label}
              className="pie-slice"
              d={topPath}
              fill={color}
              onMouseEnter={(event) => showTooltip(event, item, total, color, setTooltip)}
              onMouseMove={(event) => showTooltip(event, item, total, color, setTooltip)}
              onMouseLeave={() => setTooltip(null)}
            />
          ))}
        </g>
        <ellipse className="pie-highlight" cx="86" cy="69" rx="42" ry="17" />
      </svg>

      <div className="pie-legend">
        {slices.map(({ item, color, share }) => (
          <span key={item.label}>
            <i style={{ background: color }} />
            <strong>{item.label}</strong>
            <b>{formatPercent(share)}</b>
          </span>
        ))}
      </div>
      <ChartTooltip tooltip={tooltip} />
    </div>
  );
}

function formatPercent(share) {
  const percent = share * 100;
  if (percent > 0 && percent < 1) return '<1%';
  return `${Math.round(percent)}%`;
}

function showTooltip(event, item, total, color, setTooltip) {
  setTooltip({
    ...getTooltipPosition(event),
    title: item.label,
    rows: [
      { label: 'Runs', value: item.value.toLocaleString(), color },
      { label: 'Share', value: `${Math.round((item.value / total) * 100)}%`, color: chartYellow }
    ]
  });
}

function getSlicePath(cx, cy, radius, startAngle, endAngle) {
  if (endAngle - startAngle >= 359.99) {
    return `M ${cx} ${cy - radius} A ${radius} ${radius} 0 1 1 ${cx - 0.01} ${cy - radius} L ${cx} ${cy} Z`;
  }

  const start = polarToCartesian(cx, cy, radius, endAngle);
  const end = polarToCartesian(cx, cy, radius, startAngle);
  const largeArc = endAngle - startAngle <= 180 ? '0' : '1';
  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 0 ${end.x} ${end.y} Z`;
}

function polarToCartesian(cx, cy, radius, angle) {
  const radians = (angle * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(radians),
    y: cy + radius * Math.sin(radians)
  };
}
