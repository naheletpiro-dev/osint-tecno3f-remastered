import fs from 'fs';
import initSqlJs from 'sql.js';

/**
 * Pure WebAssembly / Cross-Platform SQLite Helper for Node.js
 * No C++ compilers, no node-gyp, 100% compatible with Render Linux Node 20/22/26.
 */
export async function openSqliteDb(dbFilePath) {
  if (!fs.existsSync(dbFilePath)) return null;

  try {
    const SQL = await initSqlJs();
    const fileBuffer = fs.readFileSync(dbFilePath);
    const db = new SQL.Database(fileBuffer);

    return {
      get: (sql, params = []) => {
        try {
          const stmt = db.prepare(sql);
          stmt.bind(Array.isArray(params) ? params : [params]);
          if (stmt.step()) {
            const row = stmt.getAsObject();
            stmt.free();
            return row;
          }
          stmt.free();
        } catch (e) {
          console.warn('[SQLite Helper Notice]:', e.message);
        }
        return null;
      },
      all: (sql, params = []) => {
        const results = [];
        try {
          const stmt = db.prepare(sql);
          stmt.bind(Array.isArray(params) ? params : [params]);
          while (stmt.step()) {
            results.push(stmt.getAsObject());
          }
          stmt.free();
        } catch (e) {
          console.warn('[SQLite Helper Notice]:', e.message);
        }
        return results;
      },
      close: () => {
        try { db.close(); } catch (e) {}
      }
    };
  } catch (e) {
    console.error('[SQLite Init Error]:', e.message);
  }
  return null;
}
