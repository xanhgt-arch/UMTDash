import type { ReactNode } from 'react';

interface ChartPanelProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}

export default function ChartPanel({ title, subtitle, actions, children, className = '' }: ChartPanelProps) {
  return (
    <section className={`chart-panel ${className}`}>
      <div className="chart-panel-header">
        <div>
          <h2>{title}</h2>
          {subtitle ? <p>{subtitle}</p> : null}
        </div>
        {actions ? <div className="chart-actions">{actions}</div> : null}
      </div>
      {children}
    </section>
  );
}
