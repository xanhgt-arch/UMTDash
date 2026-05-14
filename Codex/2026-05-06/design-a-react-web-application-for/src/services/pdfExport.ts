import PdfExportWorker from './pdfExport.worker?worker';
import type { ExportMetadata, TableRow } from '../types';

const PDF_MIME = 'application/pdf';

export async function downloadPdfReport(filename: string, rows: TableRow[], metadata: ExportMetadata = {}) {
  const normalizedFilename = filename.endsWith('.pdf')
    ? filename
    : `${filename.replace(/\.(xlsx|xls|xml)$/i, '')}.pdf`;
  const buffer = await createPdfBuffer(normalizedFilename, rows, metadata);

  downloadBlob(new Blob([buffer], { type: PDF_MIME }), normalizedFilename);
}

function createPdfBuffer(filename: string, rows: TableRow[], metadata: ExportMetadata): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const worker = new PdfExportWorker();

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
      reject(new Error('PDF export worker failed.'));
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
