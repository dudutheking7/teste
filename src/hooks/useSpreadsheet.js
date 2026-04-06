import * as XLSX from 'xlsx';

export function parseExcel(file, onSuccess) {
  const reader = new FileReader();
  reader.onload = (event) => {
    const data = new Uint8Array(event.target.result);
    const workbook = XLSX.read(data, { type: 'array' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const json = XLSX.utils.sheet_to_json(sheet, { defval: '' });
    onSuccess(json);
  };
  reader.readAsArrayBuffer(file);
}

export function exportExcel(data, filename = 'base-atualizada.xlsx') {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Empresas');
  XLSX.writeFile(workbook, filename);
}
