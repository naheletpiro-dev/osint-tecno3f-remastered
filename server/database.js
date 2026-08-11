import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbFilePath = path.join(__dirname, '../data/users_db.json');

// Ensure data directory exists
const dataDir = path.dirname(dbFilePath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Generate or retrieve persistent JWT Secret
const jwtSecretPath = path.join(dataDir, '.jwt_secret');
let JWT_SECRET = process.env.JWT_SECRET || process.env.SESSION_SECRET;
if (!JWT_SECRET) {
  if (fs.existsSync(jwtSecretPath)) {
    JWT_SECRET = fs.readFileSync(jwtSecretPath, 'utf8').trim();
  } else {
    JWT_SECRET = 'OSINT_TECNO3F_DEFAULT_FALLBACK_JWT_SECRET_KEY_2026';
    try { fs.writeFileSync(jwtSecretPath, JWT_SECRET, 'utf8'); } catch(e) {}
  }
}

/**
 * PBKDF2 Password Hashing & Verification
 */
export function hashPassword(plainPassword, salt = null) {
  const userSalt = salt || crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.pbkdf2Sync(plainPassword, userSalt, 100000, 64, 'sha512');
  return `pbkdf2:${userSalt}:${derivedKey.toString('hex')}`;
}

export function verifyPassword(plainPassword, storedHash) {
  if (!storedHash || typeof storedHash !== 'string') return false;

  if (!storedHash.startsWith('pbkdf2:')) {
    return plainPassword === storedHash;
  }

  const parts = storedHash.split(':');
  if (parts.length !== 3) return false;

  const salt = parts[1];
  const hashToTest = hashPassword(plainPassword, salt);
  return crypto.timingSafeEqual(Buffer.from(storedHash), Buffer.from(hashToTest));
}

/**
 * Secure JWT Token Creation & Verification
 */
export function generateAuthToken(userPayload) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({
    id: userPayload.id,
    username: userPayload.username,
    role: userPayload.role || 'user',
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60)
  })).toString('base64url');

  const signature = crypto.createHmac('sha256', JWT_SECRET)
    .update(`${header}.${payload}`)
    .digest('base64url');

  return `${header}.${payload}.${signature}`;
}

export function verifyAuthToken(token) {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  try {
    const [header, payload, signature] = parts;
    const expectedSignature = crypto.createHmac('sha256', JWT_SECRET)
      .update(`${header}.${payload}`)
      .digest('base64url');

    const sigBuf = Buffer.from(signature);
    const expSigBuf = Buffer.from(expectedSignature);

    if (sigBuf.length !== expSigBuf.length || !crypto.timingSafeEqual(sigBuf, expSigBuf)) {
      return null;
    }

    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (decoded.exp && Math.floor(Date.now() / 1000) > decoded.exp) {
      return null;
    }
    return decoded;
  } catch (e) {
    return null;
  }
}

// Ensure reports directory exists
const reportsDirPath = path.join(dataDir, 'reports');
if (!fs.existsSync(reportsDirPath)) {
  fs.mkdirSync(reportsDirPath, { recursive: true });
}

/**
 * In-Memory Sequential Write Lock Queue (prevents race conditions)
 */
let dbWriteQueue = Promise.resolve();

function executeWithQueue(asyncFn) {
  const next = dbWriteQueue.then(asyncFn);
  dbWriteQueue = next.catch(() => {});
  return next;
}

function executeWithDBLock(asyncMutationFn) {
  return executeWithQueue(async () => {
    const db = await readDBAsync();
    const result = await asyncMutationFn(db);
    await writeDBAsync(db);
    return result;
  });
}

/**
 * Isolated User Reports Storage Functions
 */
function getUserReportFilePath(userId) {
  const safeId = String(userId).replace(/[^a-zA-Z0-9_\-]/g, '_');
  return path.join(reportsDirPath, `reports_${safeId}.json`);
}

async function readUserReportsAsync(userId) {
  if (!userId) return [];
  const filePath = getUserReportFilePath(userId);
  try {
    if (!fs.existsSync(filePath)) return [];
    const raw = await fs.promises.readFile(filePath, 'utf8');
    const list = JSON.parse(raw);
    return Array.isArray(list) ? list : [];
  } catch (e) {
    return [];
  }
}

async function writeUserReportsAsync(userId, reportsList) {
  if (!userId) return;
  const filePath = getUserReportFilePath(userId);
  const tempPath = `${filePath}.tmp`;
  try {
    await fs.promises.writeFile(tempPath, JSON.stringify(reportsList, null, 2), 'utf8');
    await fs.promises.rename(tempPath, filePath);
  } catch (e) {
    console.error(`[REPORTS STORAGE ERROR] Could not write report file for ${userId}:`, e);
  }
}

/**
 * Thread-safe Atomic File Read & Write
 */
async function readDBAsync() {
  try {
    const raw = await fs.promises.readFile(dbFilePath, 'utf8');
    const data = JSON.parse(raw);
    if (!Array.isArray(data.users)) data.users = [];
    if (!Array.isArray(data.auditLogs)) data.auditLogs = [];
    if (!Array.isArray(data.watchlist)) data.watchlist = [];
    if (!Array.isArray(data.chatEvals)) data.chatEvals = [];
    return data;
  } catch (e) {
    return { users: [], auditLogs: [], watchlist: [], chatEvals: [] };
  }
}

async function writeDBAsync(data) {
  const tempPath = `${dbFilePath}.tmp`;
  await fs.promises.writeFile(tempPath, JSON.stringify(data, null, 2), 'utf8');
  await fs.promises.rename(tempPath, dbFilePath);
}

async function migrateLegacyUserReports() {
  try {
    const db = await readDBAsync();
    if (db.userReports && typeof db.userReports === 'object') {
      let migratedCount = 0;
      for (const [uId, reports] of Object.entries(db.userReports)) {
        if (Array.isArray(reports) && reports.length > 0) {
          const existing = await readUserReportsAsync(uId);
          const merged = [...reports, ...existing];
          const unique = [];
          const seen = new Set();
          for (const r of merged) {
            if (r.id && !seen.has(r.id)) {
              seen.add(r.id);
              unique.push(r);
            }
          }
          await writeUserReportsAsync(uId, unique);
          migratedCount += unique.length;
        }
      }
      delete db.userReports;
      await writeDBAsync(db);
      console.log(`[DB MIGRATION] Successfully migrated ${migratedCount} legacy reports out of database.json into isolated user storage.`);
    }
  } catch (e) {
    console.error('[DB MIGRATION ERROR]:', e);
  }
}

async function ensureInitialAdminAndSecurity() {
  await migrateLegacyUserReports();
  const db = await readDBAsync();
  db.users = db.users.filter(u => (u.username || '').toLowerCase() !== 'admin');

  const adminUsername = (process.env.ADMIN_USER || 'Tecno3F').trim();
  const adminPassword = process.env.ADMIN_PASSWORD || 'T3cn03F';

  let adminUser = db.users.find(u => (u.username || '').toLowerCase() === adminUsername.toLowerCase());
  let updated = false;

  if (!adminUser) {
    db.users.push({
      id: `usr-admin-${Date.now().toString(36)}`,
      username: adminUsername,
      displayName: `Administrador ${adminUsername}`,
      password: hashPassword(adminPassword),
      role: 'admin',
      status: 'active',
      createdAt: new Date().toISOString()
    });
    updated = true;
    console.log(`[SECURITY HARDENING] Initial Admin user (${adminUsername}) seeded with secure PBKDF2 salt hash.`);
  } else {
    adminUser.password = hashPassword(adminPassword);
    if (adminUser.role !== 'admin') { adminUser.role = 'admin'; updated = true; }
    if (adminUser.status !== 'active') { adminUser.status = 'active'; updated = true; }
    updated = true;
  }

  db.users.forEach(u => {
    if (u.password && !u.password.startsWith('pbkdf2:')) {
      u.password = hashPassword(u.password);
      updated = true;
    }
  });

  if (updated) await writeDBAsync(db);
}

await ensureInitialAdminAndSecurity();

export async function authenticateUserInDB(username, password) {
  return executeWithDBLock(async (db) => {
    const cleanUsername = username ? username.trim().toLowerCase() : '';
    const user = db.users.find(u => ((u.username || u.email || '').toLowerCase()) === cleanUsername);

    if (!user) throw new Error('Usuario no registrado. Solicite una cuenta al administrador.');
    if (!verifyPassword(password, user.password)) throw new Error('Contraseña incorrecta. Verifica tus datos.');

    if (!user.password.startsWith('pbkdf2:')) {
      user.password = hashPassword(password);
    }

    if (user.status === 'inactive') throw new Error('Su cuenta ha sido dada de baja por el administrador.');

    const tokenPayload = {
      id: user.id,
      username: user.displayName || user.username,
      role: user.role || 'user'
    };

    const token = generateAuthToken(tokenPayload);

    return {
      token,
      user: {
        id: user.id,
        username: user.displayName || user.username,
        role: user.role || 'user',
        status: user.status || 'active'
      }
    };
  });
}

export async function getAllUsersFromDB() {
  const db = await readDBAsync();
  return db.users.map(u => ({
    id: u.id,
    username: u.username,
    displayName: u.displayName || u.username,
    role: u.role || 'user',
    status: u.status || 'active',
    createdAt: u.createdAt || new Date().toISOString()
  }));
}

export async function createUserByAdmin({ username, password, displayName, role = 'user' }) {
  return executeWithDBLock(async (db) => {
    const cleanUsername = username ? username.trim().toLowerCase() : '';
    if (!cleanUsername || cleanUsername.length < 3) throw new Error('El nombre de usuario debe tener al menos 3 caracteres.');
    if (!password || password.length < 4) throw new Error('La contraseña debe tener al menos 4 caracteres.');

    const existingUser = db.users.find(u => ((u.username || u.email || '').toLowerCase()) === cleanUsername);
    if (existingUser) throw new Error('Ese nombre de usuario ya existe. Elija otro.');

    const newUser = {
      id: `usr-${Date.now()}`,
      username: cleanUsername,
      displayName: (displayName && displayName.trim()) || cleanUsername,
      password: hashPassword(password),
      role: role === 'admin' ? 'admin' : 'user',
      status: 'active',
      createdAt: new Date().toISOString()
    };

    db.users.push(newUser);
    return { id: newUser.id, username: newUser.displayName, role: newUser.role, status: newUser.status };
  });
}

export async function toggleUserStatusInDB(userId) {
  return executeWithDBLock(async (db) => {
    const user = db.users.find(u => u.id === userId);
    if (!user) throw new Error('Usuario no encontrado.');
    if (user.username.toLowerCase() === 'tecno3f') throw new Error('No se puede desactivar la cuenta Administrador Principal.');
    
    user.status = user.status === 'inactive' ? 'active' : 'inactive';
    return { id: user.id, username: user.username, status: user.status };
  });
}

export async function deleteUserFromDB(userId) {
  return executeWithDBLock(async (db) => {
    const user = db.users.find(u => u.id === userId);
    if (!user) throw new Error('Usuario no encontrado.');
    if (user.username.toLowerCase() === 'tecno3f') throw new Error('No se puede eliminar la cuenta Administrador Principal.');
    
    db.users = db.users.filter(u => u.id !== userId);
    return { success: true, deletedId: userId };
  });
}

export async function updateUserPasswordInDB(userId, newPassword) {
  return executeWithDBLock(async (db) => {
    const user = db.users.find(u => u.id === userId);
    if (!user) throw new Error('Usuario no encontrado.');
    if (!newPassword || String(newPassword).trim().length < 4) throw new Error('La nueva contraseña debe tener al menos 4 caracteres.');
    
    user.password = hashPassword(String(newPassword).trim());
    return { id: user.id, username: user.username, displayName: user.displayName || user.username };
  });
}

export async function addAuditLog({ type, username = 'Sistema', details, severity = 'info', ip = '127.0.0.1' }) {
  try {
    return await executeWithDBLock(async (db) => {
      if (!Array.isArray(db.auditLogs)) db.auditLogs = [];
      const newLog = {
        id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        timestamp: new Date().toISOString(),
        type,
        username,
        details,
        severity,
        ip
      };
      db.auditLogs.unshift(newLog);
      if (db.auditLogs.length > 500) db.auditLogs = db.auditLogs.slice(0, 500);
      return newLog;
    });
  } catch (e) {
    console.error('Audit Log Error:', e);
  }
}

export async function getAuditLogsFromDB(limit = 100) {
  const db = await readDBAsync();
  return (db.auditLogs || []).slice(0, limit);
}

export async function clearAuditLogsInDB() {
  return executeWithDBLock(async (db) => {
    db.auditLogs = [];
    return { success: true };
  });
}

export async function addChatEvaluationLog({ companyName, userQuery, botAnswer, modelUsed, isInjection = false }) {
  try {
    return await executeWithDBLock(async (db) => {
      if (!Array.isArray(db.chatEvals)) db.chatEvals = [];
      const evalRecord = {
        id: `eval-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        timestamp: new Date().toISOString(),
        companyName: (companyName || '').slice(0, 50),
        userQuery: (userQuery || '').slice(0, 200),
        botAnswerSnippet: (botAnswer || '').slice(0, 300),
        modelUsed: modelUsed || 'local-reasoning',
        isInjection
      };
      db.chatEvals.unshift(evalRecord);
      if (db.chatEvals.length > 300) db.chatEvals = db.chatEvals.slice(0, 300);
      return evalRecord;
    });
  } catch (e) {
    console.error('Chat Evaluation Log Error:', e);
  }
}

export async function getWatchlistFromDB(userId = null) {
  const db = await readDBAsync();
  if (!Array.isArray(db.watchlist)) return [];
  if (!userId) return db.watchlist;
  return db.watchlist.filter(w => w.userId === userId || !w.userId);
}

export async function addWatchlistCompany({ companyName, cuit = null, website = null, userId = null }) {
  return executeWithDBLock(async (db) => {
    if (!Array.isArray(db.watchlist)) db.watchlist = [];
    const cleanName = (companyName || '').trim();
    if (!cleanName) throw new Error('El nombre de la empresa es obligatorio.');

    const existing = db.watchlist.find(w => w.companyName.toLowerCase() === cleanName.toLowerCase() && (!userId || w.userId === userId));
    if (existing) return existing;

    const item = {
      id: `watch-${Date.now()}`,
      userId: userId || null,
      companyName: cleanName,
      cuit: cuit || 'N/D',
      website: website || '',
      addedAt: new Date().toISOString(),
      lastCheckedAt: new Date().toISOString(),
      status: 'Monitoreo Activo (Frecuencia: Cada 10 mins)',
      alerts: [
        {
          id: `alt-${Date.now()}`,
          timestamp: new Date().toISOString(),
          type: 'INITIAL_WATCHLIST_ADDED',
          severity: 'info',
          title: 'Empresa añadida al Watchlist',
          message: `Se inició el monitoreo periódico de BCRA, deudas y marcas para "${cleanName}".`
        }
      ]
    };
    db.watchlist.unshift(item);
    return item;
  });
}

export async function saveUserReportToDB(userId, report) {
  if (!userId || !report) return null;
  return executeWithQueue(async () => {
    const compName = report.query?.companyName || 'Empresa';
    const reportId = report.id || `rep-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const reportToSave = { ...report, id: reportId };

    let list = await readUserReportsAsync(userId);
    list = list.filter(r => (r.query?.companyName || '').toLowerCase() !== compName.toLowerCase());
    list.unshift(reportToSave);

    if (list.length > 30) list = list.slice(0, 30);
    await writeUserReportsAsync(userId, list);
    return reportId;
  });
}

export async function getUserHistorySummariesFromDB(userId) {
  if (!userId) return [];
  const list = await readUserReportsAsync(userId);
  return list.map(r => ({
    id: r.id,
    companyName: r.query?.companyName || 'Empresa',
    website: r.query?.website || '',
    sector: r.categorization?.sector || 'Servicios e Industria',
    riskLevel: r.financialData?.riskLevel || 'BAJO',
    creditScore: r.financialData?.creditScore || 75,
    digitalScore: r.digitalTransformation?.digitalScore || 65,
    biddingCapacity: r.financialData?.biddingCapacity?.estimatedBiddingCapacityARS || '$0 ARS',
    timestamp: r.timestamp || new Date().toISOString()
  }));
}

export async function getUserReportByIdFromDB(userId, reportId) {
  if (!userId || !reportId) return null;
  const list = await readUserReportsAsync(userId);
  return list.find(r => r.id === reportId) || null;
}

export async function clearUserHistoryFromDB(userId) {
  if (!userId) return { success: false };
  return executeWithQueue(async () => {
    await writeUserReportsAsync(userId, []);
    return { success: true };
  });
}

export async function removeWatchlistCompany(watchId, userId = null) {
  return executeWithDBLock(async (db) => {
    if (!Array.isArray(db.watchlist)) db.watchlist = [];
    db.watchlist = db.watchlist.filter(w => {
      if (w.id !== watchId) return true;
      if (userId && w.userId && w.userId !== userId) return true;
      return false;
    });
    return { success: true };
  });
}

export async function addWatchlistAlert(watchId, alertObj) {
  return executeWithDBLock(async (db) => {
    if (!Array.isArray(db.watchlist)) return null;
    const item = db.watchlist.find(w => w.id === watchId);
    if (!item) return null;

    if (!Array.isArray(item.alerts)) item.alerts = [];
    item.lastCheckedAt = new Date().toISOString();
    item.alerts.unshift({
      id: `alt-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      ...alertObj
    });
    return item;
  });
}
