import CsvLoaderWorker from './csvLoader.worker?worker';
import { normalizeUsageRows, parseCsv } from './csvParser';

export async function loadUsageCsv(url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`CSV request failed with status ${response.status}`);
  }

  const text = await response.text();
  return parseCsvInWorker(text);
}

export { parseCsv } from './csvParser';

function parseCsvInWorker(text) {
  if (typeof Worker === 'undefined') {
    return Promise.resolve(normalizeUsageRows(parseCsv(text)));
  }

  return new Promise((resolve, reject) => {
    const worker = new CsvLoaderWorker();

    worker.onmessage = (event) => {
      worker.terminate();
      if (event.data.error) {
        reject(new Error(event.data.error));
        return;
      }

      resolve(event.data.rows);
    };

    worker.onerror = () => {
      worker.terminate();
      try {
        resolve(normalizeUsageRows(parseCsv(text)));
      } catch (error) {
        reject(error);
      }
    };

    worker.postMessage(text);
  });
}
