import xlsx from 'xlsx';

try {
  const filePath = '../_BASE DE DATOS DP - Nuevo - ACTUAL ⭐✅.xlsx';
  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  
  // Convert to JSON array of arrays to see raw layout
  const data = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
  
  console.log('--- RAW ROWS 1 to 5 ---');
  for (let i = 0; i < 5; i++) {
    console.log(`Row ${i + 1}:`, data[i]);
  }
} catch (error) {
  console.error(error);
}
