import ExcelExportWorker from './excelExport.worker?worker';
import type { ExportMetadata, TableRow } from '../types';

const XLSX_MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

export async function downloadExcelWorkbook(filename: string, rows: TableRow[], metadata: ExportMetadata = {}) {
  const normalizedFilename = filename.endsWith('.xlsx')
    ? filename
    : `${filename.replace(/\.(xls|xml)$/i, '')}.xlsx`;
  const buffer = await createWorkbookBuffer(normalizedFilename, rows, metadata);

  downloadBlob(new Blob([buffer], { type: XLSX_MIME }), normalizedFilename);
}

function createWorkbookBuffer(filename: string, rows: TableRow[], metadata: ExportMetadata): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const worker = new ExcelExportWorker();

    worker.onmessage = (event) => {
      worker.terminate();
      if (event.data.error) {
        reject(new Error(event.data.error));
        return;
      }

      resolve(event.data.buffer);
    };

    worker.onerror = () => {
      worker.terminate();
      reject(new Error('Excel export worker failed.'));
    };

    worker.postMessage({ filename, rows, metadata });
  });
}

function downloadBlob(blob: Blob, filename: string) {
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}
