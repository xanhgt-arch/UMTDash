import ExcelJS from 'exceljs';
import type { ExportMetadata, TableRow } from '../types';

const workerScope = self as unknown as {
  onmessage: ((event: MessageEvent<{ filename: string; rows: TableRow[]; metadata: ExportMetadata }>) => void) | null;
  postMessage: (message: unknown, transfer?: Transferable[]) => void;
};

workerScope.onmessage = async (event: MessageEvent<{ filename: string; rows: TableRow[]; metadata: ExportMetadata }>) => {
  const { filename, rows, metadata } = event.data;

  try {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Cooper Standard Usage Analytics';
    workbook.created = new Date();
    workbook.modified = new Date();

    addTableWorksheet(workbook, 'Filtered Data', rows.length ? rows : [{ Message: 'No data available' }]);
    addTableWorksheet(
      workbook,
      'Applied Filters',
      Object.entries(metadata).map(([key, value]) => ({ Field: key, Value: value || 'All' }))
    );

    const buffer = await workbook.xlsx.writeBuffer();
    const transferableBuffer = toTransferableArrayBuffer(buffer);
    workerScope.postMessage({ filename, buffer: transferableBuffer }, [transferableBuffer]);
  } catch (error) {
    workerScope.postMessage({ error: error instanceof Error ? error.message : 'Excel export failed.' });
  }
};

function addTableWorksheet(workbook: ExcelJS.Workbook, name: string, rows: TableRow[]) {
  const worksheet = workbook.addWorksheet(name, {
    views: [{ state: 'frozen', ySplit: 1 }]
  });
  const headers = Object.keys(rows[0] || {});

  worksheet.addTable({
    name: sanitizeTableName(name),
    ref: 'A1',
    headerRow: true,
    totalsRow: false,
    style: {
      theme: 'TableStyleMedium2',
      showRowStripes: true
    },
    columns: headers.map((header) => ({ name: header, filterButton: true })),
    rows: rows.map((row) => headers.map((header) => normalizeCellValue(row[header])))
  });

  headers.forEach((header, index) => {
    const width = Math.max(
      String(header).length + 2,
      ...rows.map((row) => String(row[header] ?? '').length + 2)
    );
    worksheet.getColumn(index + 1).width = Math.min(Math.max(width, 12), 38);
  });
}

function normalizeCellValue(value: TableRow[string]) {
  if (typeof value === 'boolean' || typeof value === 'number') return value;
  return String(value ?? '');
}

function sanitizeTableName(name: string) {
  return name.replace(/[^A-Za-z0-9_]/g, '_').replace(/^([^A-Za-z_])/, '_$1').slice(0, 200);
}

function toTransferableArrayBuffer(buffer: ExcelJS.Buffer | ArrayBuffer | ArrayBufferView): ArrayBuffer {
  if (buffer instanceof ArrayBuffer) return buffer;

  if (ArrayBuffer.isView(buffer)) {
    return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength) as ArrayBuffer;
  }

  return new Uint8Array(buffer).buffer;
}
