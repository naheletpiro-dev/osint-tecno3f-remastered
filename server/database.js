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
let JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  if (fs.existsSync(jwtSecretPath)) {
    JWT_SECRET = fs.readFileSync(jwtSecretPath, 'utf8').trim();
  } else {
    JWT_SECRET = crypto.randomBytes(32).toString('hex');
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

  // Support legacy plain text migration automatically
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
 * Secure JWT Token Creation & Verification via Node Native HMAC-SHA256
 */
export function generateAuthToken(userPayload) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({
    id: userPayload.id,
    username: userPayload.username,
    role: userPayload.role || 'user',
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 Hours validity
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

  const [header, payload, signature] = parts;
  const expectedSignature = crypto.createHmac('sha256', JWT_SECRET)
    .update(`${header}.${payload}`)
    .digest('base64url');

  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
    return null; // Signature mismatch / Tampered token
  }

  try {
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (decoded.exp && Math.floor(Date.now() / 1000) > decoded.exp) {
      return null; // Expired token
    }
    return decoded;
  } catch (e) {
    return null;
  }
}

/**
 * Thread-safe Atomic File Read & Write
 */
function readDB() {
  try {
    const raw = fs.readFileSync(dbFilePath, 'utf8');
    const data = JSON.parse(raw);
    if (!Array.isArray(data.users)) data.users = [];
    if (!Array.isArray(data.auditLogs)) data.auditLogs = [];
    return data;
  } catch (e) {
    return { users: [], auditLogs: [] };
  }
}

function writeDB(data) {
  const tempPath = `${dbFilePath}.tmp`;
  fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf8');
  fs.renameSync(tempPath, dbFilePath);
}

/**
 * Initial DB Security Seeding & Password Migration
 */
function ensureInitialAdminAndSecurity() {
  const db = readDB();
  db.users = db.users.filter(u => (u.username || '').toLowerCase() !== 'admin');

  let adminUser = db.users.find(u => (u.username || '').toLowerCase() === 'tecno3f');
  let updated = false;

  if (!adminUser) {
    db.users.push({
      id: 'usr-admin-001',
      username: 'Tecno3F',
      displayName: 'Administrador Tecno3F',
      password: hashPassword('T3cn03F'),
      role: 'admin',
      status: 'active',
      createdAt: new Date().toISOString()
    });
    updated = true;
    console.log('[SECURITY HARDENING] Default Admin user (Tecno3F) seeded with PBKDF2 salt hash.');
  } else {
    if (!adminUser.password || !adminUser.password.startsWith('pbkdf2:')) {
      adminUser.password = hashPassword('T3cn03F');
      updated = true;
    }
    if (adminUser.role !== 'admin') { adminUser.role = 'admin'; updated = true; }
    if (adminUser.status !== 'active') { adminUser.status = 'active'; updated = true; }
  }

  // Migrate any remaining unhashed user passwords in DB
  db.users.forEach(u => {
    if (u.password && !u.password.startsWith('pbkdf2:')) {
      u.password = hashPassword(u.password);
      updated = true;
    }
  });

  if (updated) writeDB(db);
}

ensureInitialAdminAndSecurity();

/**
 * Authenticate User with Username and Password
 */
export function authenticateUserInDB(username, password) {
  const db = readDB();
  const cleanUsername = username ? username.trim().toLowerCase() : '';

  const user = db.users.find(u => ((u.username || u.email || '').toLowerCase()) === cleanUsername);

  if (!user) {
    throw new Error('Usuario no registrado. Solicite una cuenta al administrador.');
  }

  if (!verifyPassword(password, user.password)) {
    throw new Error('Contraseña incorrecta. Verifica tus datos.');
  }

  // If password was verified via plain text legacy match, update to PBKDF2 hash on login
  if (!user.password.startsWith('pbkdf2:')) {
    user.password = hashPassword(password);
    writeDB(db);
  }

  if (user.status === 'inactive') {
    throw new Error('Su cuenta ha sido dada de baja por el administrador.');
  }

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
}

/**
 * Admin: Get All Users
 */
export function getAllUsersFromDB() {
  const db = readDB();
  return db.users.map(u => ({
    id: u.id,
    username: u.username,
    displayName: u.displayName || u.username,
    role: u.role || 'user',
    status: u.status || 'active',
    createdAt: u.createdAt || new Date().toISOString()
  }));
}

/**
 * Admin: Create New User
 */
export function createUserByAdmin({ username, password, displayName, role = 'user' }) {
  const db = readDB();
  const cleanUsername = username ? username.trim().toLowerCase() : '';

  if (!cleanUsername || cleanUsername.length < 3) {
    throw new Error('El nombre de usuario debe tener al menos 3 caracteres.');
  }

  if (!password || password.length < 4) {
    throw new Error('La contraseña debe tener al menos 4 caracteres.');
  }

  const existingUser = db.users.find(u => ((u.username || u.email || '').toLowerCase()) === cleanUsername);
  if (existingUser) {
    throw new Error('Ese nombre de usuario ya existe. Elija otro.');
  }

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
  writeDB(db);

  return {
    id: newUser.id,
    username: newUser.displayName,
    role: newUser.role,
    status: newUser.status
  };
}

/**
 * Admin: Toggle User Active/Inactive Status
 */
export function toggleUserStatusInDB(userId) {
  const db = readDB();
  const user = db.users.find(u => u.id === userId);

  if (!user) throw new Error('Usuario no encontrado.');
  if (user.username.toLowerCase() === 'tecno3f') throw new Error('No se puede desactivar la cuenta Administrador Principal.');

  user.status = user.status === 'inactive' ? 'active' : 'inactive';
  writeDB(db);

  return { id: user.id, username: user.username, status: user.status };
}

/**
 * Admin: Delete User
 */
export function deleteUserFromDB(userId) {
  const db = readDB();
  const user = db.users.find(u => u.id === userId);

  if (!user) throw new Error('Usuario no encontrado.');
  if (user.username.toLowerCase() === 'tecno3f') throw new Error('No se puede eliminar la cuenta Administrador Principal.');

  db.users = db.users.filter(u => u.id !== userId);
  writeDB(db);

  return { success: true, deletedId: userId };
}

/**
 * Admin: Change User Password
 */
export function updateUserPasswordInDB(userId, newPassword) {
  const db = readDB();
  const user = db.users.find(u => u.id === userId);

  if (!user) throw new Error('Usuario no encontrado.');

  if (!newPassword || String(newPassword).trim().length < 4) {
    throw new Error('La nueva contraseña debe tener al menos 4 caracteres.');
  }

  user.password = hashPassword(String(newPassword).trim());
  writeDB(db);

  return { id: user.id, username: user.username, displayName: user.displayName || user.username };
}

/**
 * Security Audit Log Functions
 */
export function addAuditLog({ type, username = 'Sistema', details, severity = 'info', ip = '127.0.0.1' }) {
  try {
    const db = readDB();
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
    if (db.auditLogs.length > 500) {
      db.auditLogs = db.auditLogs.slice(0, 500);
    }

    writeDB(db);
    return newLog;
  } catch (e) {
    console.error('Audit Log Error:', e);
  }
}

export function getAuditLogsFromDB(limit = 100) {
  const db = readDB();
  return (db.auditLogs || []).slice(0, limit);
}

export function clearAuditLogsInDB() {
  const db = readDB();
  db.auditLogs = [];
  writeDB(db);
  return { success: true };
}

/**
 * Log Anonymized Chat Q&A Pairs for AI Prompt Iteration & Quality Evaluation
 */
export function addChatEvaluationLog({ companyName, userQuery, botAnswer, modelUsed, isInjection = false }) {
  try {
    const db = readDB();
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
    if (db.chatEvals.length > 300) {
      db.chatEvals = db.chatEvals.slice(0, 300);
    }

    writeDB(db);
    return evalRecord;
  } catch (e) {
    console.error('Chat Evaluation Log Error:', e);
  }
}

/**
 * Watchlist & Active Monitoring Functions
 */
export function getWatchlistFromDB() {
  const db = readDB();
  return Array.isArray(db.watchlist) ? db.watchlist : [];
}

export function addWatchlistCompany({ companyName, cuit = null, website = null }) {
  const db = readDB();
  if (!Array.isArray(db.watchlist)) db.watchlist = [];

  const cleanName = (companyName || '').trim();
  if (!cleanName) throw new Error('El nombre de la empresa es obligatorio.');

  const existing = db.watchlist.find(w => w.companyName.toLowerCase() === cleanName.toLowerCase());
  if (existing) return existing;

  const item = {
    id: `watch-${Date.now()}`,
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
  writeDB(db);
  return item;
}

/**
 * Server-Side User History Storage (Persists full reports on server, returns lightweight summaries)
 */
export function saveUserReportToDB(userId, report) {
  if (!userId || !report) return null;
  const db = readDB();
  if (!db.userReports) db.userReports = {};
  if (!Array.isArray(db.userReports[userId])) db.userReports[userId] = [];

  const compName = report.query?.companyName || 'Empresa';
  const reportId = report.id || `rep-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const reportToSave = { ...report, id: reportId };

  // Remove existing report for same company if present to avoid duplicates
  db.userReports[userId] = db.userReports[userId].filter(r => (r.query?.companyName || '').toLowerCase() !== compName.toLowerCase());
  db.userReports[userId].unshift(reportToSave);

  // Cap at 30 reports per user
  if (db.userReports[userId].length > 30) {
    db.userReports[userId] = db.userReports[userId].slice(0, 30);
  }

  writeDB(db);
  return reportId;
}

export function getUserHistorySummariesFromDB(userId) {
  if (!userId) return [];
  const db = readDB();
  const list = db.userReports?.[userId] || [];

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

export function getUserReportByIdFromDB(userId, reportId) {
  if (!userId || !reportId) return null;
  const db = readDB();
  const list = db.userReports?.[userId] || [];
  return list.find(r => r.id === reportId) || null;
}

export function clearUserHistoryFromDB(userId) {
  if (!userId) return { success: false };
  const db = readDB();
  if (db.userReports) {
    db.userReports[userId] = [];
    writeDB(db);
  }
  return { success: true };
}

export function removeWatchlistCompany(watchId) {
  const db = readDB();
  if (!Array.isArray(db.watchlist)) db.watchlist = [];
  db.watchlist = db.watchlist.filter(w => w.id !== watchId);
  writeDB(db);
  return { success: true };
}

export function addWatchlistAlert(watchId, alertObj) {
  const db = readDB();
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

  writeDB(db);
  return item;
}
