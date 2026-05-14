import { useState } from 'react';
import ChartTooltip, { getTooltipPosition } from '../Common/ChartTooltip';
import EmptyState from '../Common/EmptyState';
import { chartBlue, getChartColor } from './chartPalette';

export default function HorizontalBarChart({ data, color = chartBlue, limit = 6 }) {
  const [tooltip, setTooltip] = useState(null);
  const visible = data.slice(0, limit);
  const max = Math.max(...visible.map((item) => item.value), 1);

  if (!visible.length) return <EmptyState />;

  return (
    <div className="chart-hover-root horizontal-bars">
      {visible.map((item, index) => {
        const barColor = color === chartBlue ? getChartColor(index, visible.length) : color;
        return (
        <div
          className="hbar-row"
          key={item.label}
          onMouseEnter={(event) =>
            setTooltip({
              ...getTooltipPosition(event),
              title: item.label,
              rows: [{ label: 'Monthly runs', value: item.value.toLocaleString(), color: barColor }]
            })
          }
          onMouseMove={(event) =>
            setTooltip({
              ...getTooltipPosition(event),
              title: item.label,
              rows: [{ label: 'Monthly runs', value: item.value.toLocaleString(), color: barColor }]
            })
          }
          onMouseLeave={() => setTooltip(null)}
        >
          <div className="hbar-label">
            <span>{item.label}</span>
            <strong>{item.value.toLocaleString()}</strong>
          </div>
          <div className="hbar-track">
            <span style={{ width: `${(item.value / max) * 100}%`, background: barColor }} />
          </div>
        </div>
        );
      })}
      <ChartTooltip tooltip={tooltip} />
    </div>
  );
}
