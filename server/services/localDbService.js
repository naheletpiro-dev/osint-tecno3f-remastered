import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let localData = [];
let isLoaded = false;

function loadData() {
  try {
    const filePath = path.join(__dirname, '../data/local3f.json');
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf-8');
      localData = JSON.parse(raw);
      isLoaded = true;
      console.log(`[Local DB] Loaded ${localData.length} records into memory.`);
    } else {
      console.warn(`[Local DB] Warning: local3f.json not found at ${filePath}`);
    }
  } catch (err) {
    console.error('[Local DB] Error loading JSON DB:', err);
  }
}

/**
 * Searches the local JSON database for a company by CUIT or name.
 */
export async function getLocalDatabaseOSINTData(cuit, companyName) {
  if (!isLoaded) loadData();

  if (localData.length === 0) return null;

  const targetCuit = (cuit || '').toString().replace(/\D/g, '');
  const targetName = (companyName || '').toLowerCase().trim();

  // 1. Exact match by CUIT
  if (targetCuit && targetCuit.length >= 10) {
    const matchByCuit = localData.find(c => c.cuit === targetCuit || (c.cuitOriginal && c.cuitOriginal.includes(targetCuit)));
    if (matchByCuit) {
      console.log(`[Local DB] Found exact match by CUIT: ${targetCuit}`);
      return matchByCuit;
    }
  }

  // 2. Fuzzy match by Name (if CUIT not found or missing)
  if (targetName && targetName.length > 3) {
    const matchByName = localData.find(c => {
      const rz = c.razonSocial.toLowerCase();
      // Simple includes logic for fuzzy match
      return rz.includes(targetName) || targetName.includes(rz);
    });

    if (matchByName) {
      console.log(`[Local DB] Found fuzzy match by Name: ${matchByName.razonSocial}`);
      return matchByName;
    }
  }

  return null;
}
