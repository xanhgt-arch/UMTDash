export default function EmptyState({ title = 'No data available', message = 'Adjust the filters to widen the result set.' }) {
  return (
    <div className="empty-state">
      <strong>{title}</strong>
      <span>{message}</span>
    </div>
  );
}
