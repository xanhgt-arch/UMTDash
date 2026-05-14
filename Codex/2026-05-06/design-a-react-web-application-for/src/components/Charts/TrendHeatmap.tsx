import { useState } from 'react';
import ChartTooltip, { getTooltipPosition } from '../Common/ChartTooltip';
import EmptyState from '../Common/EmptyState';
import { chartBlue, chartYellow } from './chartPalette';

export default function TrendHeatmap({ data }) {
  const [tooltip, setTooltip] = useState(null);

  if (!data.length) return <EmptyState />;

  const max = Math.max(...data.map((item) => item.value), 1);

  return (
    <div className="chart-hover-root heatmap-grid">
      {data.map((item) => {
        const intensity = item.value / max;
        const blueShare = Math.round(36 + intensity * 54);
        const lightness = Math.round(96 - intensity * 48);
        return (
          <div
            className="heat-cell"
            key={item.rawDate}
            style={{
              backgroundColor: `color-mix(in srgb, color-mix(in srgb, ${chartBlue} ${blueShare}%, ${chartYellow}) ${42 + intensity * 58}%, white ${lightness}%)`,
              borderColor: intensity > 0.75 ? chartYellow : 'rgba(0, 94, 184, 0.22)'
            }}
            onMouseEnter={(event) =>
              setTooltip({
                ...getTooltipPosition(event),
                title: item.label,
                rows: [
                  { label: 'Monthly runs', value: item.value.toLocaleString(), color: chartBlue },
                  { label: 'Share of peak', value: `${Math.round(intensity * 100)}%`, color: chartYellow }
                ]
              })
            }
            onMouseMove={(event) =>
              setTooltip({
                ...getTooltipPosition(event),
                title: item.label,
                rows: [
                  { label: 'Monthly runs', value: item.value.toLocaleString(), color: chartBlue },
                  { label: 'Share of peak', value: `${Math.round(intensity * 100)}%`, color: chartYellow }
                ]
              })
            }
            onMouseLeave={() => setTooltip(null)}
          >
            <strong>{item.label}</strong>
            <span>{item.value.toLocaleString()}</span>
          </div>
        );
      })}
      <ChartTooltip tooltip={tooltip} />
    </div>
  );
}
