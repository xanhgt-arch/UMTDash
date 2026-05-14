import { jsPDF } from 'jspdf';
import type { ExportMetadata, TableRow } from '../types';

const workerScope = self as unknown as {
  onmessage: ((event: MessageEvent<{ filename: string; rows: TableRow[]; metadata: ExportMetadata }>) => void) | null;
  postMessage: (message: unknown, transfer?: Transferable[]) => void;
};

workerScope.onmessage = (event: MessageEvent<{ filename: string; rows: TableRow[]; metadata: ExportMetadata }>) => {
  const { filename, rows, metadata } = event.data;

  try {
    const buffer = toTransferableArrayBuffer(createPdfBuffer(rows, metadata));
    workerScope.postMessage({ filename, buffer }, [buffer]);
  } catch (error) {
    workerScope.postMessage({ error: error instanceof Error ? error.message : 'PDF export failed.' });
  }
};

function createPdfBuffer(rows: TableRow[], metadata: ExportMetadata = {}) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 28;
  const columns = Object.keys(rows[0] || { Message: 'No data available' });
  const dataRows = rows.length ? rows : [{ Message: 'No data available' }];
  const columnWidth = (pageWidth - margin * 2) / columns.length;
  let y = 36;

  const drawHeader = () => {
    doc.setFillColor(0, 94, 184);
    doc.rect(0, 0, pageWidth, 64, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.text('Cooper Standard Usage Export', margin, 26);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated: ${new Date().toLocaleString()}`, margin, 44);
    y = 82;
  };

  const drawMetadata = () => {
    doc.setTextColor(31, 41, 51);
    doc.setFontSize(8);
    Object.entries(metadata).forEach(([key, value]) => {
      doc.text(`${key}: ${value || 'All'}`, margin, y);
      y += 12;
    });
    y += 8;
  };

  const drawTableHeader = () => {
    doc.setFillColor(255, 194, 14);
    doc.rect(margin, y, pageWidth - margin * 2, 18, 'F');
    doc.setTextColor(18, 54, 90);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.8);
    columns.forEach((column, index) => {
      doc.text(truncate(column, columnWidth), margin + index * columnWidth + 4, y + 12);
    });
    y += 18;
  };

  const addPageIfNeeded = () => {
    if (y < pageHeight - 34) return;
    doc.addPage('a4', 'landscape');
    drawHeader();
    drawTableHeader();
  };

  drawHeader();
  drawMetadata();
  drawTableHeader();

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.4);

  dataRows.forEach((row, rowIndex) => {
    addPageIfNeeded();
    if (rowIndex % 2 === 0) {
      doc.setFillColor(246, 250, 253);
      doc.rect(margin, y - 2, pageWidth - margin * 2, 14, 'F');
    }
    doc.setTextColor(31, 41, 51);
    columns.forEach((column, index) => {
      doc.text(truncate(String(row[column] ?? ''), columnWidth), margin + index * columnWidth + 4, y + 8);
    });
    y += 14;
  });

  return doc.output('arraybuffer');
}

function truncate(value: string, width: number) {
  const max = Math.max(8, Math.floor(width / 4.2));
  return value.length > max ? `${value.slice(0, max - 1)}...` : value;
}

function toTransferableArrayBuffer(buffer: ArrayBuffer | ArrayBufferView): ArrayBuffer {
  if (buffer instanceof ArrayBuffer) return buffer;

  if (ArrayBuffer.isView(buffer)) {
    return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength) as ArrayBuffer;
  }

  return new Uint8Array(buffer).buffer;
}
