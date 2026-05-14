export default function ChartTooltip({ tooltip }) {
  if (!tooltip) return null;

  return (
    <div className="chart-tooltip" style={{ left: tooltip.x, top: tooltip.y }}>
      <strong>{tooltip.title}</strong>
      <div>
        {tooltip.rows.map((row) => (
          <span className="tooltip-row" key={`${row.label}-${row.value}`}>
            <i style={{ background: row.color || '#005eb8' }} />
            <span>{row.label}</span>
            <b>{row.value}</b>
          </span>
        ))}
      </div>
    </div>
  );
}

export function getTooltipPosition(event) {
  const root = event.currentTarget.closest('.chart-hover-root') || event.currentTarget;
  const bounds = root.getBoundingClientRect();
  const rawX = event.clientX - bounds.left;
  const rawY = event.clientY - bounds.top;

  return {
    x: Math.min(Math.max(rawX, 132), Math.max(bounds.width - 132, 132)),
    y: Math.max(rawY, 76)
  };
}
