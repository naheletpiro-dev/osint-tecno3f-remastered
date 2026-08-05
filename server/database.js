import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbFilePath = path.join(__dirname, '../data/users_db.json');

// Ensure data directory exists
const dataDir = path.dirname(dbFilePath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

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
  fs.writeFileSync(dbFilePath, JSON.stringify(data, null, 2));
}

// Initial DB Structure & Admin Seeding
function ensureInitialAdmin() {
  const db = readDB();
  // Remove legacy 'admin' if present
  db.users = db.users.filter(u => (u.username || '').toLowerCase() !== 'admin');

  const adminUser = db.users.find(u => (u.username || '').toLowerCase() === 'tecno3f');
  
  if (!adminUser) {
    db.users.push({
      id: 'usr-admin-001',
      username: 'Tecno3F',
      displayName: 'Administrador Tecno3F',
      password: 'T3cn03F',
      role: 'admin',
      status: 'active',
      createdAt: new Date().toISOString()
    });
    writeDB(db);
    console.log('[DB INITIALIZATION] Default Admin user (Tecno3F) seeded successfully.');
  } else {
    let updated = false;
    if (adminUser.password !== 'T3cn03F') { adminUser.password = 'T3cn03F'; updated = true; }
    if (!adminUser.role) { adminUser.role = 'admin'; updated = true; }
    if (!adminUser.status) { adminUser.status = 'active'; updated = true; }
    if (updated) writeDB(db);
  }
}

ensureInitialAdmin();

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

  if (user.password !== password) {
    throw new Error('Contraseña incorrecta. Verifica tus datos.');
  }

  if (user.status === 'inactive') {
    throw new Error('Su cuenta ha sido dada de baja por el administrador.');
  }

  return {
    id: user.id,
    username: user.displayName || user.username,
    role: user.role || 'user',
    status: user.status || 'active'
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
    password: password,
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
    // Keep max 500 audit logs to prevent file bloat
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
