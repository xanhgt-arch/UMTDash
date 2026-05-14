export default function FilterBar({ filters, onChange, fields, datePresets = [] }) {
  const hasDateRange = fields.some((field) => field.name === 'startDate') && fields.some((field) => field.name === 'endDate');
  const applyPreset = (preset) => {
    onChange('startDate', preset.startDate);
    onChange('endDate', preset.endDate);
  };

  return (
    <div className="filter-bar">
      {hasDateRange && datePresets.length ? (
        <div className="filter-presets" aria-label="Date range presets">
          {datePresets.map((preset) => (
            <button
              key={preset.preset}
              type="button"
              onClick={() => applyPreset(preset)}
              disabled={!preset.startDate || !preset.endDate}
            >
              {preset.label}
            </button>
          ))}
        </div>
      ) : null}
      {fields.map((field) => {
        if (field.type === 'multiselect') {
          const selected = Array.isArray(filters[field.name]) ? filters[field.name] : [];
          const label = selected.length ? `${selected.length} selected` : 'All';

          return (
            <fieldset className="field multiselect-field" key={field.name}>
              <legend>{field.label}</legend>
              <details className="multi-select">
                <summary>{label}</summary>
                <div className="multi-select-menu">
                  <button type="button" className="multi-select-clear" onClick={() => onChange(field.name, [])}>
                    All
                  </button>
                  {(field.options || []).map((option) => {
                    const checked = selected.includes(option);
                    return (
                      <label className="check-option" key={option}>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(event) => {
                            const next = event.target.checked
                              ? [...selected, option]
                              : selected.filter((value) => value !== option);
                            onChange(field.name, next);
                          }}
                        />
                        <span>{option}</span>
                      </label>
                    );
                  })}
                </div>
              </details>
            </fieldset>
          );
        }

        if (field.type === 'date' || field.type === 'month') {
          return (
            <label className="field" key={field.name}>
              <span>{field.label}</span>
              <input
                type={field.type}
                value={filters[field.name] || ''}
                onChange={(event) => onChange(field.name, event.target.value)}
              />
            </label>
          );
        }

        return (
          <label className="field" key={field.name}>
            <span>{field.label}</span>
            <select value={filters[field.name] || ''} onChange={(event) => onChange(field.name, event.target.value)}>
              {field.includeAll !== false ? <option value="">All</option> : null}
              {(field.options || []).map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        );
      })}
    </div>
  );
}
