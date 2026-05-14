export const chartColors = [
  '#002f5f',
  '#003f7d',
  '#005eb8',
  '#0b315b',
  '#0f4c81',
  '#0077c8',
  '#00a3e0',
  '#ffc20e',
  '#d49a00',
  '#f6d55c'
];

export function getFilterOptions(rows) {
  const fields = [
    'applicationName',
    'functionality',
    'cadTool',
    'productLine',
    'status',
    'region',
    'environment',
    'accessMode'
  ];

  return fields.reduce((options, field) => {
    options[field] = [...new Set(rows.map((row) => row[field]).filter(Boolean))].sort();
    return options;
  }, {});
}

export function getDateRange(rows) {
  if (!rows.length) {
    return { startDate: '', endDate: '' };
  }

  const sorted = [...rows].sort((a, b) => a.timestamp - b.timestamp);
  return {
    startDate: sorted[0].date,
    endDate: sorted[sorted.length - 1].date
  };
}

export function getDatePresetOptions(rows) {
  return [
    ['currentMonth', 'Current Month'],
    ['previousMonth', 'Previous Month'],
    ['currentYear', 'Current Year'],
    ['previousYear', 'Previous Year']
  ].map(([preset, label]) => ({
    preset,
    label,
    ...getDatePresetRange(rows, preset)
  }));
}

export function getDatePresetRange(rows, preset) {
  if (!rows.length) return { startDate: '', endDate: '' };

  const dates = rows.map((row) => row.date).sort();
  const latest = dates[dates.length - 1];
  const latestDate = new Date(`${latest}T00:00:00`);
  const offset = preset === 'previousMonth' ? -1 : 0;
  const yearOffset = preset === 'previousYear' ? -1 : 0;

  if (preset === 'currentMonth' || preset === 'previousMonth') {
    const target = new Date(latestDate.getFullYear(), latestDate.getMonth() + offset, 1);
    const startDate = toDateInput(target);
    const endDate = toDateInput(new Date(target.getFullYear(), target.getMonth() + 1, 0));
    return { startDate, endDate };
  }

  const year = latestDate.getFullYear() + yearOffset;
  return {
    startDate: `${year}-01-01`,
    endDate: `${year}-12-31`
  };
}

export function filterRows(rows, filters) {
  const start = filters.startDate ? getRangeStart(filters.startDate) : -Infinity;
  const end = filters.endDate ? getRangeEnd(filters.endDate) : Infinity;

  return rows.filter((row) => {
    if (row.timestamp < start || row.timestamp > end) return false;

    return Object.entries(filters).every(([field, value]) => {
      if (!value || field === 'startDate' || field === 'endDate') return true;
      if (Array.isArray(value)) return value.length === 0 || value.includes(row[field]);
      return row[field] === value;
    });
  });
}

export function aggregateByMonth(rows, metric = 'usageCount') {
  const totals = new Map();

  rows.forEach((row) => {
    const month = row.month || getMonthKey(row.date);
    totals.set(month, (totals.get(month) || 0) + row[metric]);
  });

  return [...totals.entries()]
    .sort(([monthA], [monthB]) => monthA.localeCompare(monthB))
    .map(([month, value]) => ({ label: formatMonth(month), rawDate: month, month, value }));
}

export const aggregateByDate = aggregateByMonth;

export function aggregateByField(rows, field, metric = 'usageCount') {
  const totals = new Map();

  rows.forEach((row) => {
    totals.set(row[field], (totals.get(row[field]) || 0) + row[metric]);
  });

  return [...totals.entries()]
    .sort(([, valueA], [, valueB]) => valueB - valueA)
    .map(([label, value]) => ({ label, value }));
}

export function aggregateMonthlySeries(rows, field, preferredSeries = [], limit = 6) {
  const topSeries = preferredSeries.length
    ? preferredSeries
    : aggregateByField(rows, field)
        .slice(0, limit)
        .map((item) => item.label);
  const series = [...topSeries];
  const seriesSet = new Set(series);
  const hasOther = !preferredSeries.length && rows.some((row) => !seriesSet.has(row[field]));

  if (hasOther) {
    series.push('Other');
  }

  const byMonth = new Map();

  rows.forEach((row) => {
    const month = row.month || getMonthKey(row.date);
    const key = seriesSet.has(row[field]) ? row[field] : hasOther ? 'Other' : row[field];

    if (!byMonth.has(month)) {
      byMonth.set(month, {
        label: formatMonth(month),
        rawDate: month,
        month,
        total: 0
      });
    }

    const bucket = byMonth.get(month);
    bucket[key] = (bucket[key] || 0) + row.usageCount;
    bucket.total += row.usageCount;
  });

  return {
    series,
    data: [...byMonth.values()].sort((a, b) => a.month.localeCompare(b.month))
  };
}

export function compareApplications(rows, appA, appB) {
  const selected = rows.filter((row) => row.applicationName === appA || row.applicationName === appB);
  const byMonth = new Map();

  selected.forEach((row) => {
    const month = row.month || getMonthKey(row.date);
    if (!byMonth.has(month)) {
      byMonth.set(month, { label: formatMonth(month), rawDate: month, month, [appA]: 0, [appB]: 0 });
    }

    byMonth.get(month)[row.applicationName] += row.usageCount;
  });

  return [...byMonth.values()].sort((a, b) => a.month.localeCompare(b.month));
}

export function getKpis(rows) {
  const totalUsage = rows.reduce((sum, row) => sum + row.usageCount, 0);
  const successCount = rows.filter((row) => row.status === 'Success').length;
  const failedCount = rows.filter((row) => row.status === 'Failed').length;
  const activeApps = new Set(rows.map((row) => row.applicationName)).size;
  const cadTool = aggregateByField(rows, 'cadTool')[0];

  return [
    { label: 'Total runs', value: compactNumber(totalUsage), detail: 'CSV usage events' },
    { label: 'Success rate', value: `${getPercent(successCount, rows.length)}%`, detail: `${failedCount} failed runs` },
    { label: 'Active apps', value: String(activeApps), detail: 'Applications in report' },
    { label: 'Top CAD tool', value: cadTool?.label || '-', detail: cadTool ? `${cadTool.value} runs` : 'No data' }
  ];
}

export function getTrendSummary(rows) {
  const byApp = aggregateByField(rows, 'applicationName');
  const byFunctionality = aggregateByField(rows, 'functionality');
  const byCadTool = aggregateByField(rows, 'cadTool');
  const byProductLine = aggregateByField(rows, 'productLine');
  const byStatus = aggregateByField(rows, 'status');
  const byRegion = aggregateByField(rows, 'region');
  const byEnvironment = aggregateByField(rows, 'environment');
  const byAccessMode = aggregateByField(rows, 'accessMode');
  const byMonth = aggregateByMonth(rows);
  const first = byMonth[0]?.value || 0;
  const last = byMonth[byMonth.length - 1]?.value || 0;
  const busiestMonth = [...byMonth].sort((a, b) => b.value - a.value)[0];
  const successCount = rows.filter((row) => row.status === 'Success').length;
  const failedCount = rows.filter((row) => row.status === 'Failed').length;
  const productionCount = rows.filter((row) => row.isProd).length;
  const vdiCount = rows.filter((row) => row.isVDI).length;

  return {
    byApp,
    byFunctionality,
    byCadTool,
    byProductLine,
    byStatus,
    byRegion,
    byEnvironment,
    byAccessMode,
    byMonth,
    byDate: byMonth,
    busiestMonth,
    change: first ? Math.round(((last - first) / first) * 100) : 0,
    successRate: getPercent(successCount, rows.length),
    failedCount,
    productionShare: getPercent(productionCount, rows.length),
    vdiShare: getPercent(vdiCount, rows.length)
  };
}

export function formatShortDate(date) {
  return formatMonth(getMonthKey(date));
}

export function formatMonth(month) {
  return new Intl.DateTimeFormat('en', { month: 'short', year: 'numeric' }).format(new Date(`${month}-01T00:00:00`));
}

export function getMonthKey(date) {
  return String(date || '').slice(0, 7);
}

function getRangeStart(value) {
  if (String(value).length === 7) {
    return new Date(`${getMonthKey(value)}-01T00:00:00`).getTime();
  }

  return new Date(`${value}T00:00:00`).getTime();
}

function getRangeEnd(value) {
  if (String(value).length === 7) {
    const [year, monthIndex] = getMonthKey(value).split('-').map(Number);
    return new Date(year, monthIndex, 0, 23, 59, 59, 999).getTime();
  }

  return new Date(`${value}T23:59:59`).getTime();
}

function toDateInput(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function compactNumber(value) {
  return new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(value);
}

export function getPercent(part, total) {
  return total ? Math.round((part / total) * 100) : 0;
}
