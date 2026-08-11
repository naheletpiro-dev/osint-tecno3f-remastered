import fs from 'fs';
import path from 'path';
import readline from 'readline';
import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const csvPath = path.join(__dirname, '../data/sociedades/registro-nacional-sociedades.csv');
const dbDir = path.join(__dirname, '../data');
const dbPath = path.join(dbDir, 'sociedades_database.db');

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Remove old database if exists
if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath);
}

console.log(`🚀 Creating Registro Nacional de Sociedades SQLite database at: ${dbPath}`);
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('synchronous = NORMAL');

db.exec(`
  CREATE TABLE sociedades_registry (
    cuit TEXT PRIMARY KEY,
    razon_social TEXT,
    fecha_contrato_social TEXT,
    tipo_societario TEXT,
    fecha_actualizacion TEXT,
    numero_inscripcion TEXT,
    dom_fiscal_provincia TEXT,
    dom_fiscal_localidad TEXT,
    dom_fiscal_calle TEXT,
    dom_fiscal_numero TEXT,
    dom_fiscal_cp TEXT,
    dom_fiscal_estado TEXT,
    dom_legal_provincia TEXT,
    dom_legal_localidad TEXT,
    dom_legal_calle TEXT,
    dom_legal_numero TEXT,
    dom_legal_cp TEXT,
    dom_legal_estado TEXT,
    actividad_codigo TEXT,
    actividad_descripcion TEXT,
    actividad_estado TEXT
  );
`);

const insertStmt = db.prepare(`
  INSERT OR REPLACE INTO sociedades_registry (
    cuit, razon_social, fecha_contrato_social, tipo_societario,
    fecha_actualizacion, numero_inscripcion, dom_fiscal_provincia, dom_fiscal_localidad,
    dom_fiscal_calle, dom_fiscal_numero, dom_fiscal_cp, dom_fiscal_estado,
    dom_legal_provincia, dom_legal_localidad, dom_legal_calle, dom_legal_numero,
    dom_legal_cp, dom_legal_estado, actividad_codigo, actividad_descripcion, actividad_estado
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const rl = readline.createInterface({
  input: fs.createReadStream(csvPath, { encoding: 'utf8' }),
  crlfDelay: Infinity
});

let headerParsed = false;
let count = 0;
let insertedCount = 0;
let batch = [];
const BATCH_SIZE = 5000;

function flushBatch() {
  if (batch.length === 0) return;
  const insertMany = db.transaction((rows) => {
    for (const row of rows) {
      try {
        insertStmt.run(...row);
      } catch (e) {
        // Skip duplicate errors
      }
    }
  });
  insertMany(batch);
  insertedCount += batch.length;
  batch = [];
}

rl.on('line', (line) => {
  if (!headerParsed) {
    headerParsed = true;
    return;
  }
  if (!line || !line.trim()) return;

  count++;
  // Parse CSV line correctly
  const cols = line.split(/,(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)/).map(c => c.replace(/^"|"$/g, '').trim());
  const [
    cuit, razon_social, fecha_contrato, tipo_societario, fecha_actualizacion, num_inscripcion,
    dom_f_prov, dom_f_loc, dom_f_calle, dom_f_num, dom_f_piso, dom_f_dpto, dom_f_cp, dom_f_estado,
    dom_l_prov, dom_l_loc, dom_l_calle, dom_l_num, dom_l_piso, dom_l_dpto, dom_l_cp, dom_l_estado,
    act_cod, act_desc, act_orden, act_estado, act_vigencia
  ] = cols;

  if (cuit) {
    batch.push([
      cuit, razon_social || '', fecha_contrato || '', tipo_societario || '',
      fecha_actualizacion || '', num_inscripcion || '', dom_f_prov || '', dom_f_loc || '',
      dom_f_calle || '', dom_f_num || '', dom_f_cp || '', dom_f_estado || '',
      dom_l_prov || '', dom_l_loc || '', dom_l_calle || '', dom_l_num || '',
      dom_l_cp || '', dom_l_estado || '', act_cod || '', act_desc || '', act_estado || ''
    ]);
  }

  if (batch.length >= BATCH_SIZE) {
    flushBatch();
  }
});

rl.on('close', () => {
  flushBatch();
  console.log('\n⚡ Creating DB Indexes on CUIT, Razón Social, and Tipo Societario...');
  db.exec(`
    CREATE INDEX idx_socidades_razon ON sociedades_registry(razon_social);
    CREATE INDEX idx_sociedades_tipo ON sociedades_registry(tipo_societario);
    CREATE INDEX idx_sociedades_provincia ON sociedades_registry(dom_fiscal_provincia);
  `);

  console.log(`✅ Sociedades SQLite Database successfully built! Total: ${insertedCount.toLocaleString('es-AR')} records inserted.`);
  db.close();
});
