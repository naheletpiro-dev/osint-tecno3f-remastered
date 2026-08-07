import fs from 'fs';
import path from 'path';
import readline from 'readline';
import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const csvPath = path.join(__dirname, '../../pyme csv/registro_mipyme_21-07-2026.csv');
const dbDir = path.join(__dirname, '../data');
const dbPath = path.join(dbDir, 'pyme_database.db');

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Remove old database if exists
if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath);
}

console.log(`🚀 Creating SQLite database at: ${dbPath}`);
const db = new Database(dbPath);

// Enable WAL mode and synchronous=NORMAL for ultra fast bulk insertion
db.pragma('journal_mode = WAL');
db.pragma('synchronous = NORMAL');

db.exec(`
  CREATE TABLE pyme_registry (
    id TEXT PRIMARY KEY,
    regimen_tributario TEXT,
    emision_certificado TEXT,
    vencimiento_certificado TEXT,
    categoria TEXT,
    sector TEXT,
    provincia TEXT,
    id_provincia INTEGER,
    clae6 TEXT,
    vigente INTEGER
  );
`);

const insertStmt = db.prepare(`
  INSERT OR REPLACE INTO pyme_registry (
    id, regimen_tributario, emision_certificado, vencimiento_certificado,
    categoria, sector, provincia, id_provincia, clae6, vigente
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const rl = readline.createInterface({
  input: fs.createReadStream(csvPath, { encoding: 'utf8' }),
  crlfDelay: Infinity
});

let headerParsed = false;
let count = 0;
let insertedCount = 0;
let transaction = null;

const BATCH_SIZE = 50000;
let batch = [];

function flushBatch() {
  if (batch.length === 0) return;
  const insertMany = db.transaction((rows) => {
    for (const row of rows) {
      insertStmt.run(...row);
    }
  });
  insertMany(batch);
  insertedCount += batch.length;
  batch = [];
}

console.log('📦 Starting streaming CSV import into SQLite...');
const startTime = Date.now();

rl.on('line', (line) => {
  if (!headerParsed) {
    headerParsed = true;
    return;
  }
  if (!line || !line.trim()) return;

  count++;
  const cols = line.split(',').map(c => c.replace(/^"|"$/g, '').trim());
  const [idx, id, regimen, emision, vencimiento, categoria, sector, provincia, idProvincia, clae6, vigenteStr] = cols;

  if (id) {
    const vigente = parseInt(vigenteStr, 10) || 0;
    const idProv = parseInt(idProvincia, 10) || 0;
    batch.push([id, regimen || '', emision || '', vencimiento || '', categoria || '', sector || '', provincia || '', idProv, clae6 || '', vigente]);
  }

  if (batch.length >= BATCH_SIZE) {
    flushBatch();
    console.log(`  Processed ${count.toLocaleString('es-AR')} records (${insertedCount.toLocaleString('es-AR')} inserted)...`);
  }
});

rl.on('close', () => {
  flushBatch();
  console.log('\n⚡ Creating DB Indexes for fast querying...');
  db.exec(`
    CREATE INDEX idx_pyme_sector ON pyme_registry(sector);
    CREATE INDEX idx_pyme_provincia ON pyme_registry(provincia);
    CREATE INDEX idx_pyme_clae6 ON pyme_registry(clae6);
    CREATE INDEX idx_pyme_vigente ON pyme_registry(vigente);
    CREATE INDEX idx_pyme_regimen ON pyme_registry(regimen_tributario);
  `);

  const durationSec = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`✅ PyME SQLite Database successfully built! Total: ${insertedCount.toLocaleString('es-AR')} records in ${durationSec}s.`);

  // Verify total count in DB
  const totalCount = db.prepare('SELECT COUNT(*) as count FROM pyme_registry').get().count;
  const activeCount = db.prepare('SELECT COUNT(*) as count FROM pyme_registry WHERE vigente = 1').get().count;
  console.log(`📊 DB Summary: ${totalCount.toLocaleString('es-AR')} total records (${activeCount.toLocaleString('es-AR')} vigentes).`);

  db.close();
});
