import xlsx from 'xlsx';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

try {
  console.log('Leyendo archivo XLSX...');
  const filePath = path.join(__dirname, '../../_BASE DE DATOS DP - Nuevo - ACTUAL ⭐✅.xlsx');
  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  
  // Convertir a array asumiendo que la fila 4 (index 3) tiene los headers
  const data = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
  
  // Extraer headers (fila 4 / indice 3)
  const rawHeaders = data[3];
  
  const cleanData = [];

  for (let i = 4; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;

    // Columna 2 es CUIT AFIP
    let cuitRaw = row[2] ? row[2].toString().trim() : '';
    let razonSocial = row[1] ? row[1].toString().trim() : '';

    if (!cuitRaw && !razonSocial) continue;

    // Si tiene varios cuits separados por |, tomamos el primero
    let mainCuit = '';
    if (cuitRaw) {
      mainCuit = cuitRaw.split('|')[0].replace(/\D/g, '').trim();
    }

    const companyObj = {
      razonSocial: razonSocial,
      cuitOriginal: cuitRaw,
      cuit: mainCuit,
      tipoOrganizacion: row[3] || '',
      direccion: {
        calle: row[4] || '',
        numero: row[5] || '',
        localidad: row[6] || '',
        cp: row[7] || ''
      },
      actividad: {
        codigo: row[8] || '',
        rubro: row[9] || '',
        descripcion: row[10] || '',
        tipoProducto: row[11] || '',
        productosPrincipales: row[12] || ''
      },
      empleados: row[13] || 0,
      contactos: [
        { nombre: row[14] || '', celular: row[15] || '' },
        { nombre: row[16] || '', celular: row[17] || '' }
      ].filter(c => c.nombre || c.celular),
      telefonos: [row[18], row[19], row[20]].filter(Boolean).map(t => t.toString().trim()),
      web: row[21] || '',
      comex: {
        importa: row[22] || 'No',
        exporta: row[23] || 'No'
      },
      activa: row[24] || 'Si'
    };

    cleanData.push(companyObj);
  }

  const outPath = path.join(__dirname, '../data/local3f.json');
  if (!fs.existsSync(path.dirname(outPath))) {
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
  }

  fs.writeFileSync(outPath, JSON.stringify(cleanData, null, 2), 'utf-8');
  console.log(`✅ Éxito: Se procesaron y guardaron ${cleanData.length} empresas en local3f.json`);

} catch (error) {
  console.error('Error procesando XLSX:', error);
}
