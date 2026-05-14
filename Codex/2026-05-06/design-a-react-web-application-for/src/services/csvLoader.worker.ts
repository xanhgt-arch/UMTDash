import { normalizeUsageRows, parseCsv } from './csvParser';

self.onmessage = (event) => {
  try {
    const rows = normalizeUsageRows(parseCsv(event.data));
    self.postMessage({ rows });
  } catch (error) {
    self.postMessage({ error: error.message || 'Unable to parse CSV data.' });
  }
};
