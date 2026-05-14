export default function KpiTile({ label, value, detail }) {
  return (
    <article className="kpi-tile">
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{detail}</small>
    </article>
  );
}
