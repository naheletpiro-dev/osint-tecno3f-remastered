import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';
import readline from 'readline';
import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.join(__dirname, '../data/contrataciones');
const dbPath = path.join(__dirname, '../data/contrataciones_database.db');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const filesToDownload = [
  {
    name: 'sipro.csv',
    url: 'https://infra.datos.gob.ar/catalog/jgm/dataset/4/distribution/4.23/download/SiPRO.csv'
  },
  {
    name: 'contratar_contratos.csv',
    url: 'https://infra.datos.gob.ar/catalog/jgm/dataset/30/distribution/30.4/download/onc-contratar-contratos.csv'
  },
  {
    name: 'contratar_obras.csv',
    url: 'https://infra.datos.gob.ar/catalog/jgm/dataset/30/distribution/30.5/download/onc-contratar-obras.csv'
  },
  {
    name: 'adjudicaciones.csv',
    url: 'https://infra.datos.gob.ar/catalog/jgm/dataset/4/distribution/4.22/download/Adjudicaciones.csv'
  }
];

function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath);
    function req(downloadUrl) {
      const client = downloadUrl.startsWith('https') ? https : http;
      client.get(downloadUrl, { rejectUnauthorized: false }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          return req(res.headers.location);
        }
        if (res.statusCode !== 200) {
          return reject(new Error(`HTTP ${res.statusCode}`));
        }
        res.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve();
        });
      }).on('error', (err) => {
        fs.unlink(destPath, () => {});
        reject(err);
      });
    }
    req(url);
  });
}

async function run() {
  console.log('📦 Downloading COMPR.AR & CONTRAT.AR Open Data Datasets...');
  for (const item of filesToDownload) {
    const dest = path.join(dataDir, item.name);
    console.log(`  -> Downloading ${item.name}...`);
    try {
      await downloadFile(item.url, dest);
      const sizeMB = (fs.statSync(dest).size / (1024 * 1024)).toFixed(2);
      console.log(`  ✅ Downloaded ${item.name} (${sizeMB} MB)`);
    } catch (e) {
      console.warn(`  ⚠️ Could not download ${item.name}: ${e.message}`);
    }
  }

  console.log('\n🚀 Building SQLite database at: ' + dbPath);
  if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);

  const db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  db.pragma('synchronous = NORMAL');

  db.exec(`
    CREATE TABLE sipro_suppliers (
      cuit TEXT PRIMARY KEY,
      razon_social TEXT,
      estado TEXT,
      rubro TEXT,
      fecha_alta TEXT
    );

    CREATE TABLE comprar_adjudicaciones (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cuit TEXT,
      razon_social TEXT,
      numero_proceso TEXT,
      objeto TEXT,
      monto_ars REAL,
      organismo TEXT,
      fecha_adjudicacion TEXT
    );

    CREATE TABLE contratar_obras (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cuit TEXT,
      razon_social TEXT,
      titulo_obra TEXT,
      monto_ars REAL,
      organismo TEXT,
      estado_obra TEXT
    );

    CREATE INDEX idx_sipro_cuit ON sipro_suppliers(cuit);
    CREATE INDEX idx_comprar_cuit ON comprar_adjudicaciones(cuit);
    CREATE INDEX idx_contratar_cuit ON contratar_obras(cuit);
  `);

  // 1. Import SiPRO
  const siproPath = path.join(dataDir, 'sipro.csv');
  if (fs.existsSync(siproPath)) {
    console.log('⏳ Importing SiPRO suppliers dataset...');
    const rl = readline.createInterface({ input: fs.createReadStream(siproPath), crlfDelay: Infinity });
    let header = true;
    const stmt = db.prepare('INSERT OR REPLACE INTO sipro_suppliers (cuit, razon_social, estado, rubro, fecha_alta) VALUES (?, ?, ?, ?, ?)');
    let count = 0;
    db.exec('BEGIN TRANSACTION;');
    for await (const line of rl) {
      if (header) { header = false; continue; }
      const cols = line.split(',').map(c => c.replace(/^"|"$/g, '').trim());
      const [cuit, razon, estado, rubro, fecha] = cols;
      if (cuit && cuit.length >= 10) {
        stmt.run(cuit.replace(/\D/g, ''), razon || '', estado || '', rubro || '', fecha || '');
        count++;
      }
    }
    db.exec('COMMIT;');
    console.log(`  ✅ Imported ${count.toLocaleString('es-AR')} SiPRO suppliers.`);
  }

  // 2. Import CONTRAT.AR Obras
  const obrasPath = path.join(dataDir, 'contratar_obras.csv');
  if (fs.existsSync(obrasPath)) {
    console.log('⏳ Importing CONTRAT.AR Public Works dataset...');
    const rl = readline.createInterface({ input: fs.createReadStream(obrasPath), crlfDelay: Infinity });
    let header = true;
    const stmt = db.prepare('INSERT INTO contratar_obras (cuit, razon_social, titulo_obra, monto_ars, organismo, estado_obra) VALUES (?, ?, ?, ?, ?, ?)');
    let count = 0;
    db.exec('BEGIN TRANSACTION;');
    for await (const line of rl) {
      if (header) { header = false; continue; }
      const cols = line.split(',').map(c => c.replace(/^"|"$/g, '').trim());
      const [id, cuit, razon, titulo, montoStr, org, estado] = cols;
      if (cuit) {
        const monto = parseFloat(montoStr) || 0;
        stmt.run(cuit.replace(/\D/g, ''), razon || '', titulo || '', monto, org || '', estado || '');
        count++;
      }
    }
    db.exec('COMMIT;');
    console.log(`  ✅ Imported ${count.toLocaleString('es-AR')} Public Works contracts.`);
  }

  // 3. Import COMPR.AR Adjudicaciones
  const adjPath = path.join(dataDir, 'adjudicaciones.csv');
  if (fs.existsSync(adjPath)) {
    console.log('⏳ Importing COMPR.AR Awarded Contracts dataset...');
    const rl = readline.createInterface({ input: fs.createReadStream(adjPath), crlfDelay: Infinity });
    let header = true;
    const stmt = db.prepare('INSERT INTO comprar_adjudicaciones (cuit, razon_social, numero_proceso, objeto, monto_ars, organismo, fecha_adjudicacion) VALUES (?, ?, ?, ?, ?, ?, ?)');
    let count = 0;
    db.exec('BEGIN TRANSACTION;');
    for await (const line of rl) {
      if (header) { header = false; continue; }
      const cols = line.split(/,(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)/).map(c => c.replace(/^"|"$/g, '').trim());
      // Typical CSV header mapping
      const [id, procNum, cuit, razon, montoStr, fecha, org, objeto] = cols;
      if (cuit && cuit.length >= 10) {
        const monto = parseFloat(montoStr) || 0;
        stmt.run(cuit.replace(/\D/g, ''), razon || '', procNum || '', objeto || '', monto, org || '', fecha || '');
        count++;
      }
      if (count >= 100000) break; // Index top 100k awarded contracts for ultra fast performance
    }
    db.exec('COMMIT;');
    console.log(`  ✅ Imported ${count.toLocaleString('es-AR')} COMPR.AR awarded contracts.`);
  }

  console.log('✅ Contrataciones SQLite Database successfully built!');
  db.close();
}

run().catch(console.error);
