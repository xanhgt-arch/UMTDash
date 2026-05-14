export function parseCsv(text) {
  const lines = text.trim().split(/\r?\n/);
  const headerIndex = lines.findIndex((line) => {
    const columns = parseCsvLine(line).map((value) => value.trim());
    return columns.includes('ApplicationName') && columns.includes('StartDate');
  });

  if (headerIndex < 0) {
    throw new Error('CSV header row was not found. Expected ApplicationName and StartDate columns.');
  }

  const headers = parseCsvLine(lines[headerIndex]).map((header) => header.trim());

  return lines.slice(headerIndex + 1).filter(Boolean).map((line) => {
    const values = parseCsvLine(line);
    return headers.reduce((row, header, index) => {
      row[header] = values[index]?.trim() ?? '';
      return row;
    }, {});
  });
}

export function normalizeUsageRows(rows) {
  return rows
    .map((row, index) => {
      const startDate = normalizeDate(row.StartDate);
      const stopDate = normalizeDate(row.StopDate) || startDate;
      const isProd = parseBoolean(row.isProd);
      const isVDI = parseBoolean(row.isVDI);

      return {
        id: `${row.ApplicationName || 'row'}-${index}`,
        source: row,
        applicationName: cleanValue(row.ApplicationName),
        functionality: cleanValue(row.Functionality),
        cadTool: cleanValue(row.cadTool),
        productLine: cleanValue(row.ProductLine),
        status: cleanValue(row.Status),
        region: cleanValue(row.Region),
        startDate,
        stopDate,
        date: startDate,
        month: startDate.slice(0, 7),
        isProd,
        isVDI,
        environment: isProd ? 'Production' : 'Non-production',
        accessMode: isVDI ? 'VDI' : 'Local',
        usageCount: 1,
        uniqueUsers: 0,
        timestamp: startDate ? new Date(`${startDate}T00:00:00`).getTime() : 0,
        durationDays: getDurationDays(startDate, stopDate)
      };
    })
    .filter((row) => row.date && Number.isFinite(row.timestamp));
}

function parseCsvLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];

    if (char === '"' && inQuotes && next === '"') {
      current += '"';
      index += 1;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current);
  return result;
}

function cleanValue(value) {
  const normalized = String(value || '').trim();
  return normalized || 'Not Available';
}

function parseBoolean(value) {
  return String(value || '').trim().toLowerCase() === 'true';
}

function normalizeDate(value) {
  const raw = String(value || '').trim();
  const match = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);

  if (match) {
    const [, month, day, year] = match;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }

  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? '' : parsed.toISOString().slice(0, 10);
}

function getDurationDays(startDate, stopDate) {
  if (!startDate || !stopDate) return 1;

  const start = new Date(`${startDate}T00:00:00`).getTime();
  const end = new Date(`${stopDate}T00:00:00`).getTime();
  const duration = Math.round((end - start) / 86400000) + 1;
  return Math.max(duration, 1);
}
