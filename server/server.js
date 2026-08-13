import express from 'express';
import puppeteer from 'puppeteer';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import crypto from 'crypto';
import { scrapeCompanyWebsite } from './services/websiteScraperService.js';
import { searchCompanyOSINT } from './services/searchService.js';
import { analyzeFinancials } from './services/financialService.js';
import { getBcraOSINTData } from './services/bcraService.js';
import { getAfipPadronData } from './services/afipService.js';
import { getInpiWipoOSINTData } from './services/inpiWipoService.js';
import { getOpenCorporatesOSINTData } from './services/openCorporatesService.js';
import { categorizeCompany } from './services/categorizationService.js';
import { generateSupportPlan } from './services/supportAdvisorService.js';
import { analyzeLegalOSINT } from './services/legalOsintService.js';
import { analyzePublicContracts } from './services/publicContractsService.js';
import { generateSwotAnalysis } from './services/swotAnalysisService.js';
import { analyzeDigitalTransformation } from './services/digitalTransformationService.js';
import { analyzeCompanyWithGemini } from './services/aiExtractionService.js';
import { compareCompaniesOSINT } from './services/compareService.js';
import { answerOsintChat } from './services/aiChatService.js';
import { getTradeOSINTData } from './services/tradeService.js';
import { getPymeRegistryOSINTData } from './services/pymeRegistryService.js';
import { getBoletinOficialOSINTData } from './services/boletinOficialService.js';
import { getRepsalOSINTData } from './services/repsalService.js';
import { getDateasOSINTData } from './services/dateasService.js';
import { getLocalDatabaseOSINTData } from './services/localDbService.js';
import { refineCrossModuleSynthesis } from './services/crossModuleSynthesis.js';
import { analyzeCompanyWithAI } from './services/aiIntelligenceService.js';
import { isValidCuit } from './utils/cuitValidator.js';
import {
  authenticateUserInDB,
  getAllUsersFromDB,
  createUserByAdmin,
  toggleUserStatusInDB,
  deleteUserFromDB,
  updateUserPasswordInDB,
  addAuditLog,
  getAuditLogsFromDB,
  clearAuditLogsInDB,
  verifyAuthToken,
  getWatchlistFromDB,
  addWatchlistCompany,
  removeWatchlistCompany,
  addWatchlistAlert,
  saveUserReportToDB,
  getUserHistorySummariesFromDB,
  getUserReportByIdFromDB,
  clearUserHistoryFromDB
} from './database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// In-Memory Report Cache with TTL (15 minutes)
const scanReportCache = new Map();
const CACHE_TTL_MS = 15 * 60 * 1000;

// Persistent Share Links (Render-safe by writing to data directory)
const SHARE_FILE = path.join(__dirname, 'data', 'sharedReports.json');
let sharedReports = new Map();
try {
  if (fs.existsSync(SHARE_FILE)) {
    const raw = fs.readFileSync(SHARE_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    sharedReports = new Map(Object.entries(parsed));
  }
} catch (e) {
  console.log('[SHARE] No se pudo cargar el archivo de compartidos:', e.message);
}

const saveSharedReportsToDisk = () => {
  try {
    const obj = Object.fromEntries(sharedReports);
    fs.writeFileSync(SHARE_FILE, JSON.stringify(obj, null, 2), 'utf-8');
  } catch (e) {
    console.error('[SHARE] Error guardando links:', e);
  }
};

function getCachedScanReport(companyName, website) {
  const cleanComp = (companyName || '').trim().toLowerCase();
  const cleanUrl = (website || '').trim().toLowerCase();
  const cacheKey = `${cleanComp}_${cleanUrl}`;

  if (scanReportCache.has(cacheKey)) {
    const entry = scanReportCache.get(cacheKey);
    if (Date.now() - entry.timestamp < CACHE_TTL_MS) {
      console.log(`[OSINT CACHE HIT] Serving cached scan report for "${companyName}" (0ms latency).`);
      return { ...entry.report, isFromCache: true };
    } else {
      scanReportCache.delete(cacheKey);
    }
  }
  return null;
}

function setCachedScanReport(companyName, website, report) {
  const cleanComp = (companyName || '').trim().toLowerCase();
  const cleanUrl = (website || '').trim().toLowerCase();
  const cacheKey = `${cleanComp}_${cleanUrl}`;
  scanReportCache.set(cacheKey, { timestamp: Date.now(), report });
}

// Security Headers Middleware
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: https: http:; connect-src 'self' http: https:;"
  );
  next();
});

// Dynamic CORS Middleware with Support for Render, Netlify & Custom Domains
const defaultAllowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5000',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5000'
];

if (process.env.RENDER_EXTERNAL_URL) {
  defaultAllowedOrigins.push(process.env.RENDER_EXTERNAL_URL.trim());
}

app.use(cors({
  origin: function (origin, callback) {
    // Lista estricta de orígenes permitidos por variables de entorno
    const envOrigins = process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
      : [];

    // Validar orígenes permitidos explícitamente o permitir peticiones sin origen (ej: curl, postman local)
    const isAllowed = !origin || envOrigins.includes(origin) || defaultAllowedOrigins.includes(origin);
    
    if (isAllowed) {
      return callback(null, true);
    }

    console.warn(`[CORS Bloqueado] Intento de acceso denegado desde origen no autorizado: ${origin}`);
    return callback(new Error('Acceso CORS denegado para este origen'), false);
  },
  credentials: true
}));

app.use(express.json({ limit: '2mb' }));

// Rate Limiter for Login Endpoint (Max 5 attempts / 15 min window)
const loginAttempts = new Map();

// Prevents memory leak by clearing old IPs every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of loginAttempts.entries()) {
    if (now > record.resetTime) loginAttempts.delete(ip);
  }
}, 5 * 60 * 1000);

const loginRateLimiter = (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress || '127.0.0.1';
  const now = Date.now();
  const windowMs = 15 * 60 * 1000;
  const maxAttempts = 5;

  const record = loginAttempts.get(ip) || { count: 0, resetTime: now + windowMs };

  if (now > record.resetTime) {
    record.count = 0;
    record.resetTime = now + windowMs;
  }

  if (record.count >= maxAttempts) {
    addAuditLog({
      type: 'SECURITY_RATE_LIMIT_EXCEEDED',
      username: req.body?.username || 'IP Bloqueada',
      details: `Bloqueado por superar 5 intentos fallidos desde IP ${ip}`,
      severity: 'critical',
      ip
    });
    return res.status(429).json({
      error: 'Demasiados intentos fallidos. Su dirección IP ha sido bloqueada temporalmente por 15 minutos.'
    });
  }

  req.loginRecord = record;
  req.clientIp = ip;
  next();
};

/**
 * Generic Rate Limiter Factory Function
 */
function createRateLimiter({ windowMs, maxRequests, errorMessage, actionType }) {
  const requestsMap = new Map();

  // Prevents memory leak by clearing old IPs periodically
  const cleanupInterval = Math.min(windowMs, 5 * 60 * 1000);
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of requestsMap.entries()) {
      if (now > record.resetTime) requestsMap.delete(key);
    }
  }, cleanupInterval);

  return (req, res, next) => {
    const ip = req.ip || req.connection?.remoteAddress || '127.0.0.1';
    const key = req.userId ? `${ip}:${req.userId}` : ip;
    const now = Date.now();

    const record = requestsMap.get(key) || { count: 0, resetTime: now + windowMs };

    if (now > record.resetTime) {
      record.count = 0;
      record.resetTime = now + windowMs;
    }

    if (record.count >= maxRequests) {
      addAuditLog({
        type: actionType || 'SECURITY_RATE_LIMIT_EXCEEDED',
        username: req.userId || 'IP Bloqueada',
        details: `Límite superado (${maxRequests} peticiones en ${Math.round(windowMs / 60000)}m) desde ${key}`,
        severity: 'warning',
        ip
      });
      return res.status(429).json({ error: errorMessage });
    }

    record.count++;
    requestsMap.set(key, record);
    next();
  };
}

// Expensive Scan Rate Limiter: Max 15 scans per 15 minutes
const scanRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 15,
  errorMessage: 'Límite de exploraciones alcanzado (máx. 15 por 15 minutos). Por favor aguarde antes de realizar una nueva exploración.',
  actionType: 'SECURITY_SCAN_RATE_LIMIT'
});

// AI Chat Rate Limiter: Max 30 messages per 15 minutes
const chatRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 30,
  errorMessage: 'Límite de consultas al asistente de IA alcanzado (máx. 30 por 15 minutos). Aguarde unos minutos.',
  actionType: 'SECURITY_CHAT_RATE_LIMIT'
});

// Serve static frontend build if dist exists
const clientDistPath = path.join(__dirname, '../client/dist');
app.use(express.static(clientDistPath));

/**
 * Reusable JWT Authorization Middleware for User Endpoints.
 * Strictly verifies JWT token, extracts user identity, and blocks unauthenticated requests.
 * Completely eliminates IDOR vulnerabilities by storing req.userId from verified JWT payload.
 */
const requireAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Acceso no autorizado. Se requiere Token Bearer de sesión.' });
  }

  const token = authHeader.substring(7).trim();
  const decoded = verifyAuthToken(token);

  if (!decoded || (!decoded.id && !decoded.username)) {
    addAuditLog({
      type: 'SECURITY_INVALID_TOKEN',
      username: 'Desconocido',
      details: `Intento de acceso con token inválido o expirado en ${req.originalUrl}`,
      severity: 'warning',
      ip: req.ip
    });
    return res.status(401).json({ error: 'Token de sesión inválido o expirado. Vuelva a iniciar sesión.' });
  }

  req.user = decoded;
  req.userId = decoded.id || decoded.username;
  next();
};

/**
 * Strict Authorization Middleware for Admin Endpoints (verifies JWT Bearer token & Admin role).
 */
const requireAdminAuth = (req, res, next) => {
  requireAuth(req, res, () => {
    if (req.user.role !== 'admin') {
      addAuditLog({
        type: 'SECURITY_FORBIDDEN_ROLE',
        username: req.user.username,
        details: `Intento de acceso admin rechazado para usuario con rol ${req.user.role}`,
        severity: 'warning',
        ip: req.ip
      });
      return res.status(403).json({ error: 'Acceso denegado. Se requieren permisos de administrador verificados.' });
    }
    next();
  });
};

// Auth Endpoints
app.post('/api/auth/login', loginRateLimiter, async (req, res) => {
  const clientIp = req.clientIp || '127.0.0.1';
  const { username, password } = req.body;

  try {
    if (!username || !password) {
      if (req.loginRecord) req.loginRecord.count++;
      addAuditLog({ type: 'LOGIN_FAILED', username: username || 'Anonimo', details: 'Intento de inicio de sesion incompleto.', severity: 'warning', ip: clientIp });
      return res.status(400).json({ error: 'Ingresa usuario y contraseña.' });
    }

    const cleanUsername = String(username).trim().slice(0, 60);
    const cleanPassword = String(password).slice(0, 100);

    const authResult = await authenticateUserInDB(cleanUsername, cleanPassword);
    
    // Reset failed attempts on success
    if (req.loginRecord) req.loginRecord.count = 0;

    addAuditLog({ type: 'LOGIN_SUCCESS', username: authResult.user.username, details: `Inicio de sesion exitoso con rol ${authResult.user.role}.`, severity: 'info', ip: clientIp });
    return res.json({ success: true, token: authResult.token, user: authResult.user });
  } catch (err) {
    if (req.loginRecord) req.loginRecord.count++;
    addAuditLog({ type: 'LOGIN_FAILED', username: username || 'Desconocido', details: `Fallo de autenticacion: ${err.message}`, severity: 'warning', ip: clientIp });
    return res.status(400).json({ error: err.message });
  }
});

// Admin User Management Endpoints (Protected by Authorization Middleware)
app.get('/api/admin/users', requireAdminAuth, async (req, res) => {
  try {
    const users = await getAllUsersFromDB();
    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ error: 'Error interno al consultar usuarios.' });
  }
});

app.post('/api/admin/users/create', requireAdminAuth, async (req, res) => {
  const clientIp = req.ip || req.connection.remoteAddress || '127.0.0.1';
  try {
    const { username, password, displayName, role } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Nombre de usuario y contraseña son requeridos.' });
    }
    const cleanUser = String(username).trim().slice(0, 50);
    const cleanPass = String(password).slice(0, 100);
    const cleanDisplay = displayName ? String(displayName).trim().slice(0, 80) : cleanUser;
    const cleanRole = role === 'admin' ? 'admin' : 'user';

    const user = await createUserByAdmin({ username: cleanUser, password: cleanPass, displayName: cleanDisplay, role: cleanRole });
    addAuditLog({ type: 'USER_CREATED', username: 'Administrador', details: `Alta de usuario "${cleanUser}" con rol ${cleanRole}.`, severity: 'success', ip: clientIp });
    res.json({ success: true, user });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/admin/users/toggle-status', requireAdminAuth, async (req, res) => {
  const clientIp = req.ip || req.connection.remoteAddress || '127.0.0.1';
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: 'ID de usuario requerido.' });
    const result = await toggleUserStatusInDB(String(userId).trim());
    addAuditLog({ type: 'USER_STATUS_TOGGLED', username: 'Administrador', details: `Estado de usuario "${result.username}" cambiado a ${result.status}.`, severity: 'warning', ip: clientIp });
    res.json({ success: true, result });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/admin/users/:id', requireAdminAuth, async (req, res) => {
  const clientIp = req.ip || req.connection.remoteAddress || '127.0.0.1';
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: 'ID de usuario requerido.' });
    const result = await deleteUserFromDB(String(id).trim());
    addAuditLog({ type: 'USER_DELETED', username: 'Administrador', details: `Eliminación de cuenta ID ${id}.`, severity: 'danger', ip: clientIp });
    res.json({ success: true, result });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/admin/users/change-password', requireAdminAuth, async (req, res) => {
  const clientIp = req.ip || req.connection.remoteAddress || '127.0.0.1';
  try {
    const { userId, newPassword } = req.body;
    if (!userId || !newPassword) {
      return res.status(400).json({ error: 'ID de usuario y nueva contraseña son requeridos.' });
    }
    const result = await updateUserPasswordInDB(String(userId).trim(), String(newPassword).trim());
    addAuditLog({
      type: 'USER_PASSWORD_CHANGED',
      username: 'Administrador',
      details: `Cambio de contraseña efectuado para la cuenta de usuario "${result.username}".`,
      severity: 'warning',
      ip: clientIp
    });
    res.json({ success: true, result });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Audit Log Endpoints
app.get('/api/admin/audit-logs', requireAdminAuth, async (req, res) => {
  try {
    const logs = await getAuditLogsFromDB(150);
    res.json({ success: true, logs });
  } catch (err) {
    res.status(500).json({ error: 'Error al recuperar logs de auditoría.' });
  }
});

app.delete('/api/admin/audit-logs/clear', requireAdminAuth, async (req, res) => {
  const clientIp = req.ip || req.connection.remoteAddress || '127.0.0.1';
  try {
    await clearAuditLogsInDB();
    addAuditLog({ type: 'LOGS_CLEARED', username: 'Administrador', details: 'Purga de registro de eventos de auditoria.', severity: 'warning', ip: clientIp });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Error al purgar logs de auditoría.' });
  }
});

// Health check endpoint
app.get('/api/osint/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'OSINT Tecno3F Engine v4.0'
  });
});

// Sample Companies Endpoint
app.get('/api/osint/samples', (req, res) => {
  res.json([
    { name: 'Smartmation', website: 'smartmation.com' },
    { name: 'Baigorria Industrial', website: 'baigorriaindustrial.com' },
    { name: 'BombasNIR', website: 'bombasnir.com.ar' },
    { name: 'Mercado Libre', website: 'mercadolibre.com' }
  ]);
});

/**
 * Diagnostic Sub-Service Wrapper:
 * Measures execution time and safely catches sub-service failures without halting the overall scan.
 */
async function safeExecute(serviceName, asyncFn, fallbackValue = {}) {
  const startTime = Date.now();
  try {
    const result = await asyncFn();
    const durationMs = Date.now() - startTime;
    console.log(`[OSINT DEBUGGER - OK] ${serviceName} completado en ${durationMs}ms`);
    return result || fallbackValue;
  } catch (err) {
    const durationMs = Date.now() - startTime;
    console.error(`❌ [OSINT DEBUGGER - ERROR in ${serviceName}] (Falló tras ${durationMs}ms): ${err.message}`);
    if (err.stack) console.error(err.stack);
    return fallbackValue;
  }
}

// Watchlist & Monitored Companies Endpoints (Secured against IDOR with requireAuth middleware & per-user ownership)
app.get('/api/watchlist', requireAuth, async (req, res) => {
  try {
    const list = await getWatchlistFromDB(req.userId);
    res.json({ success: true, watchlist: list });
  } catch (e) {
    res.status(500).json({ error: 'Error al obtener lista de monitoreo.' });
  }
});

app.post('/api/watchlist', requireAuth, async (req, res) => {
  try {
    const { companyName, cuit, website } = req.body;
    if (!companyName || !companyName.trim()) return res.status(400).json({ error: 'El nombre de la empresa es obligatorio.' });
    const item = await addWatchlistCompany({ companyName, cuit, website, userId: req.userId });
    res.json({ success: true, item });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.delete('/api/watchlist/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await removeWatchlistCompany(id, req.userId);
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: 'Error al eliminar de monitoreo.' });
  }
});

// Server-Side User History Endpoints (Secured against IDOR with requireAuth middleware)
app.get('/api/history', requireAuth, async (req, res) => {
  try {
    const summaries = await getUserHistorySummariesFromDB(req.userId);
    res.json({ success: true, history: summaries });
  } catch (e) {
    res.status(500).json({ error: 'Error al consultar historial.' });
  }
});

app.get('/api/history/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const report = await getUserReportByIdFromDB(req.userId, id);
    if (!report) return res.status(404).json({ error: 'Informe no encontrado en el historial.' });

    res.json({ success: true, report });
  } catch (e) {
    res.status(500).json({ error: 'Error al recuperar el informe.' });
  }
});

app.post('/api/history/save', requireAuth, async (req, res) => {
  try {
    const { report } = req.body;
    if (!report) return res.status(400).json({ error: 'Faltan parámetros requeridos.' });

    const reportId = await saveUserReportToDB(req.userId, report);
    res.json({ success: true, reportId });
  } catch (e) {
    res.status(500).json({ error: 'Error al guardar informe en el historial.' });
  }
});

app.delete('/api/history', requireAuth, async (req, res) => {
  try {
    await clearUserHistoryFromDB(req.userId);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Error al purgar historial.' });
  }
});

// Periodic Watchlist Monitoring Worker (Checks BCRA credit changes every 10 mins with overlap prevention)
let isWatchlistWorkerRunning = false;

async function runWatchlistWorker() {
  if (isWatchlistWorkerRunning) {
    console.log('[WATCHLIST WORKER NOTICE] Skip execution: Previous worker cycle is still running.');
    return;
  }

  isWatchlistWorkerRunning = true;
  try {
    const watchlist = await getWatchlistFromDB();
    if (watchlist.length === 0) return;
    console.log(`[WATCHLIST MONITORING WORKER] Periodic inspection running for ${watchlist.length} monitored companies...`);

    for (const company of watchlist) {
      try {
        const bcra = await getBcraOSINTData(company.companyName, company.cuit !== 'N/D' ? company.cuit : null);
        if (bcra && bcra.isRealData) {
          if (bcra.situacionMax > 1 || (bcra.chequesRechazados && bcra.chequesRechazados.totalCount > 0)) {
            await addWatchlistAlert(company.id, {
              type: 'CREDIT_SITUATION_ALERT',
              severity: 'warning',
              title: `Alerta de Crédito BCRA: ${bcra.situacionLabel}`,
              message: `Registra ${bcra.chequesRechazados?.totalCount || 0} cheques rechazados por ${bcra.chequesRechazados?.totalMontoARS || '$0 ARS'}.`
            });
          }
        }
      } catch (err) {
        console.warn(`[WATCHLIST WORKER ITEM NOTICE] Inspection failed for ${company.companyName}:`, err.message);
      }
    }
  } catch (e) {
    console.error('[WATCHLIST WORKER NOTICE]:', e.message);
  } finally {
    isWatchlistWorkerRunning = false;
  }
}

setInterval(runWatchlistWorker, 10 * 60 * 1000);

// Real-Time SSE (Server-Sent Events) Scan Progress Endpoint
app.get('/api/osint/scan-stream', scanRateLimiter, async (req, res) => {
  const { companyName: inputName, website, region = 'AR', cuit } = req.query;
  let cleanCuit = (cuit && isValidCuit(cuit)) ? String(cuit).replace(/\D/g, '') : null;
  let companyName = (inputName || '').trim();

  if (!companyName && !cleanCuit) {
    return res.status(400).send('Debes ingresar el nombre de la empresa o un CUIT válido.');
  }

  if (!companyName && cleanCuit) {
    const afipDirect = await getAfipPadronData('', cleanCuit);
    companyName = afipDirect?.razonSocial || `Empresa CUIT ${cleanCuit}`;
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const sendEvent = (event, data) => {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  sendEvent('progress', { stage: 1, percent: 20, text: `Navegando y extrayendo sitio web de ${companyName}...` });

  // Check cache first
  const cachedReport = getCachedScanReport(companyName, website);
  if (cachedReport) {
    sendEvent('progress', { stage: 4, percent: 100, text: `Informe recuperado desde caché (0ms).` });
    sendEvent('complete', { report: cachedReport, isFromCache: true });
    return res.end();
  }

  try {
    const scrapedData = await safeExecute('websiteScraperService', () => scrapeCompanyWebsite(website, companyName), {});
    sendEvent('progress', { stage: 2, percent: 45, text: `Consultando Central de Deudores BCRA y Padrón AFIP/ARCA para ${companyName}...` });

    const searchData = await safeExecute('searchService', () => searchCompanyOSINT(companyName, website, region), {});
    
    let dateasData = null;
    if (!cleanCuit) {
      dateasData = await safeExecute('dateasService', () => getDateasOSINTData(companyName, null), null);
      if (dateasData && dateasData.cuitRaw) {
        cleanCuit = dateasData.cuitRaw;
        console.log(`[DATEAS CUIT DISCOVERY STREAM] Auto-resolved CUIT ${cleanCuit} for "${companyName}"`);
      } else {
        const localFallback = await safeExecute('localDbService', () => getLocalDatabaseOSINTData(null, companyName), null);
        if (localFallback && localFallback.cuit) {
          cleanCuit = localFallback.cuit;
          console.log(`[LOCAL DB CUIT DISCOVERY STREAM] Auto-resolved CUIT ${cleanCuit} from XLSX for "${companyName}"`);
        }
      }
    }

    const bcraData = await safeExecute('bcraService', () => getBcraOSINTData(companyName, cleanCuit), null);
    const afipData = await safeExecute('afipService', () => getAfipPadronData(companyName, cleanCuit), null);

    sendEvent('progress', { stage: 3, percent: 70, text: `Rastreando marcas INPI/WIPO y licitaciones públicas COMPR.AR...` });

    let [inpiWipoData, openCorporatesData, publicContracts, tradeData, pymeData, legalData, categorization, digitalTransformation, repsalData, boletinData, dateasResult, localDbData] = await Promise.all([
      safeExecute('inpiWipoService', () => getInpiWipoOSINTData(companyName), null),
      safeExecute('openCorporatesService', () => getOpenCorporatesOSINTData(companyName), null),
      safeExecute('publicContractsService', () => analyzePublicContracts(companyName, searchData, cleanCuit), {}),
      safeExecute('tradeService', () => getTradeOSINTData(companyName, cleanCuit, searchData, scrapedData), {}),
      safeExecute('pymeRegistryService', () => getPymeRegistryOSINTData(companyName, cleanCuit, searchData, scrapedData), {}),
      safeExecute('legalOsintService', () => analyzeLegalOSINT(companyName, {}, cleanCuit), {}),
      safeExecute('categorizationService', () => categorizeCompany(companyName, scrapedData, searchData), {}),
      safeExecute('digitalTransformationService', () => analyzeDigitalTransformation(companyName, scrapedData, searchData), {}),
      safeExecute('repsalService', () => getRepsalOSINTData(companyName, cleanCuit), {}),
      safeExecute('boletinOficialService', () => getBoletinOficialOSINTData(companyName, cleanCuit), {}),
      safeExecute('dateasService', () => dateasData ? Promise.resolve(dateasData) : getDateasOSINTData(companyName, cleanCuit), {}),
      safeExecute('localDbService', () => getLocalDatabaseOSINTData(cleanCuit, companyName), null)
    ]);

    if (inpiWipoData) legalData.inpiWipoData = inpiWipoData;
    if (openCorporatesData) legalData.openCorporatesData = openCorporatesData;
    
    dateasData = dateasResult || dateasData;

    if (dateasData && dateasData.isRealData) {
      legalData.dateasData = dateasData;
    }
    
    if (boletinData && boletinData.isRealData) {
      legalData.boletinOficialData = boletinData;
      if (boletinData.hasBankruptcyOrConcurso) {
        legalData.totalRecords = (legalData.totalRecords || 0) + boletinData.bankruptcyEdicts.length;
        legalData.riskRating = 'ALERTA MÁXIMA: EDICTO DE CONCURSO O QUIEBRA';
        legalData.legalSummary = `ALERTA JUDICIAL CRÍTICA: Se registraron ${boletinData.bankruptcyEdicts.length} edictos de concurso preventivo / quiebra en el Boletín Oficial (BORA).`;
      }
    }
    
    if (boletinData && boletinData.cuitRaw && !cleanCuit) {
      cleanCuit = boletinData.cuitRaw;
      console.log(`[BORA CUIT DISCOVERY STREAM] Auto-resolved CUIT ${cleanCuit} from Boletin Oficial`);
    }
    if (repsalData) {
      legalData.repsalData = repsalData;
      if (repsalData.hasSanctions) {
        legalData.totalRecords = (legalData.totalRecords || 0) + repsalData.totalSanctions;
        legalData.riskRating = 'OBSERVACIÓN LABORAL CRÍTICA (REPSAL)';
      }
    }

    sendEvent('progress', { stage: 4, percent: 90, text: `Sintetizando informe comercial y evaluación de madurez digital...` });

    const [financialData, supportPlan, swotAnalysis, aiResult, aiIntelligence] = await Promise.all([
      safeExecute('financialService', () => analyzeFinancials(companyName, scrapedData, searchData, bcraData), {}),
      safeExecute('supportAdvisorService', () => generateSupportPlan(companyName, categorization, {}, scrapedData, searchData), {}),
      safeExecute('swotAnalysisService', () => generateSwotAnalysis(companyName, categorization, {}, scrapedData, legalData), {}),
      safeExecute('aiExtractionService', () => analyzeCompanyWithGemini(companyName, scrapedData, searchData, { bcraData, afipData, inpiWipoData, openCorporatesData, publicContractsData: publicContracts, tradeData, pymeData, legalData, localDbData }), null),
      safeExecute('aiIntelligenceService', () => analyzeCompanyWithAI(companyName, scrapedData, categorization, {}, digitalTransformation), {})
    ]);

    financialData.tradeData = tradeData;
    financialData.pymeData = pymeData;
    if (financialData.taxProfile) {
      financialData.taxProfile.publicCertificates = pymeData?.pymeCategory || 'Sin registro en Padrón MiPyME Oficial';
    }

    if (afipData) {
      financialData.taxProfile = financialData.taxProfile || {};
      financialData.taxProfile.cuit = afipData.cuit;
      financialData.taxProfile.economicActivity = afipData.economicActivity;
      financialData.taxProfile.vatCondition = afipData.vatCondition;
      financialData.afipData = afipData;

      if (afipData.cuit) {
        const freshCuit = String(afipData.cuit).replace(/\D/g, '');
        try {
          const [refinedPyme, refinedLegal, refinedContracts, refinedBoletin] = await Promise.all([
            getPymeRegistryOSINTData(companyName, freshCuit, searchData, scrapedData),
            analyzeLegalOSINT(companyName, {}, freshCuit),
            analyzePublicContracts(companyName, searchData, freshCuit),
            getBoletinOficialOSINTData(companyName, freshCuit)
          ]);

          if (refinedPyme && refinedPyme.isRealData) {
            pymeData = refinedPyme;
            financialData.pymeData = refinedPyme;
            financialData.taxProfile.publicCertificates = refinedPyme.pymeCategory;
          }

          if (refinedLegal && refinedLegal.isRealData) {
            legalData.sociedadDetail = refinedLegal.sociedadDetail;
            legalData.isRealData = true;
            legalData.apiSource = refinedLegal.apiSource;
            legalData.legalSummary = refinedLegal.legalSummary;
          }

          if (refinedContracts && refinedContracts.isRealData) {
            publicContracts = refinedContracts;
          }

          if (refinedBoletin && refinedBoletin.isRealData) {
            legalData.boletinOficialData = refinedBoletin;
            if (refinedBoletin.hasBankruptcyOrConcurso) {
              legalData.totalRecords = (legalData.totalRecords || 0) + refinedBoletin.bankruptcyEdicts.length;
              legalData.riskRating = 'ALERTA MÁXIMA: EDICTO DE CONCURSO O QUIEBRA';
              legalData.legalSummary = `ALERTA JUDICIAL CRÍTICA: Se registraron ${refinedBoletin.bankruptcyEdicts.length} edictos de concurso preventivo / quiebra en el Boletín Oficial (BORA).`;
            }
          }
        } catch (e) {
          console.error('[Refined CUIT Lookup Error STREAM]:', e);
        }
      }
    }

    try {
      refineCrossModuleSynthesis({
        companyName,
        financialData,
        supportPlan,
        swotAnalysis,
        digitalTransformation,
        tradeData,
        pymeData,
        publicContracts,
        legalData,
        bcraData,
        inpiWipoData
      });
    } catch (e) {}

    if (aiResult) {
      if (aiResult.sector && aiResult.sector !== 'Información no verificada públicamente') categorization.sector = aiResult.sector;
      if (aiResult.businessModel && aiResult.businessModel !== 'Información no verificada públicamente') categorization.businessModel = aiResult.businessModel;
      if (aiResult.companyType && aiResult.companyType !== 'Información no verificada públicamente') categorization.companyType = aiResult.companyType;

      scrapedData.businessAnswers = scrapedData.businessAnswers || {};
      if (aiResult.whatItSells) scrapedData.businessAnswers.whatItSells = aiResult.whatItSells;
      if (aiResult.whoBuys) scrapedData.businessAnswers.whoBuys = aiResult.whoBuys;
      if (aiResult.whoBuys) scrapedData.businessAnswers.targetAudience = aiResult.whoBuys;
      if (aiResult.howItGeneratesRevenue) scrapedData.businessAnswers.howItGeneratesRevenue = aiResult.howItGeneratesRevenue;
      if (aiResult.mostImportantAsset) scrapedData.businessAnswers.mostImportantAsset = aiResult.mostImportantAsset;
      
      if (aiResult.executiveSummary) categorization.summary = aiResult.executiveSummary;
      if (Array.isArray(aiResult.strengths)) swotAnalysis.strengths = aiResult.strengths;
      if (Array.isArray(aiResult.weaknesses)) swotAnalysis.weaknesses = aiResult.weaknesses;
      if (Array.isArray(aiResult.opportunities)) swotAnalysis.opportunities = aiResult.opportunities;
      if (Array.isArray(aiResult.threats)) swotAnalysis.threats = aiResult.threats;

      if (aiResult.markets?.length > 0) scrapedData.markets = aiResult.markets;
      if (aiResult.industries?.length > 0) scrapedData.industries = aiResult.industries;
      if (aiResult.clients?.length > 0) scrapedData.clients = aiResult.clients;
    }

    // Safeguard and Override for Sector/Rubro
    if (localDbData?.actividad?.rubro) {
      categorization.sector = localDbData.actividad.rubro;
    } else if (localDbData?.actividad?.descripcion) {
      categorization.sector = localDbData.actividad.descripcion;
    } else if (afipData?.economicActivity) {
      categorization.sector = afipData.economicActivity;
    }

    if (categorization.sector && (categorization.sector.toLowerCase() === 'argentina' || categorization.sector.toLowerCase() === 'ar')) {
      categorization.sector = 'Servicios Generales & Comercio';
    }

    const finalReport = {
      id: `OSINT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      query: { companyName, website, region },
      categorization,
      scrapedData,
      financialData,
      legalData,
      publicContracts,
      searchData,
      supportPlan,
      swotAnalysis,
      digitalTransformation,
      aiIntelligence,
      localDbData,
      executiveSummary: aiResult?.executiveSummary || null
    };

    setCachedScanReport(companyName, website, finalReport);

    sendEvent('progress', { stage: 4, percent: 100, text: `Informe completado con éxito.` });
    sendEvent('complete', { report: finalReport });
    res.end();
  } catch (err) {
    sendEvent('error', { error: err.message });
    res.end();
  }
});

// Main OSINT Company Deep Scan API Endpoint
app.post('/api/osint/scan', scanRateLimiter, async (req, res) => {
  const scanStartTime = Date.now();
  const { companyName: inputName, website, region = 'AR', cuit } = req.body;
  let cleanCuit = (cuit && isValidCuit(cuit)) ? String(cuit).replace(/\D/g, '') : null;
  let companyName = (inputName || '').trim();

  console.log(`\n=================== [OSINT DEBUGGER SCAN START] ===================`);
  console.log(`[TARGET] Empresa: "${companyName || 'Búsqueda por CUIT'}" | CUIT Directo: "${cleanCuit || 'No provisto'}" | Sitio: "${website || 'No provisto'}" | Inicio: ${new Date().toISOString()}`);

  try {
    if (!companyName && !cleanCuit) {
      console.warn(`[OSINT DEBUGGER - WARN] Solicitud rechazada: Falta el nombre de la empresa o CUIT.`);
      return res.status(400).json({ error: 'Debes ingresar el nombre de la empresa o un CUIT válido.' });
    }

    // 0. If no name was provided, search Sociedades DB, BCRA, and AFIP using CUIT to resolve company name
    if (!companyName && cleanCuit) {
      const legalDirect = await analyzeLegalOSINT('', {}, cleanCuit);
      if (legalDirect && legalDirect.sociedadDetail?.razonSocial) {
        companyName = legalDirect.sociedadDetail.razonSocial;
      } else {
        const bcraDirect = await getBcraOSINTData('', cleanCuit);
        if (bcraDirect && bcraDirect.denominacionBCRA && bcraDirect.denominacionBCRA !== '') {
          companyName = bcraDirect.denominacionBCRA;
        } else {
          const afipDirect = await getAfipPadronData('', cleanCuit);
          companyName = (afipDirect?.isRealData && afipDirect.razonSocial) ? afipDirect.razonSocial : `Empresa CUIT ${cleanCuit}`;
        }
      }
      console.log(`[CUIT RESOLUTION] Company name resolved from CUIT ${cleanCuit} -> "${companyName}"`);
    }

    // Check In-Memory Report Cache (15 min TTL)
    const cachedReport = getCachedScanReport(companyName, website);
    if (cachedReport) {
      return res.json(cachedReport);
    }

    // 1. Fast Concurrent Primary Gathering (Scrape & Multi-Source Search)
    const [scrapedData, searchData] = await Promise.all([
      safeExecute('websiteScraperService', () => scrapeCompanyWebsite(website, companyName), {}),
      safeExecute('searchService', () => searchCompanyOSINT(companyName, website, region), {})
    ]);

    // 1.5 Dateas CUIT & Docs Auto-Resolver: If CUIT not provided, resolve via Dateas using exact input
    let dateasData = null;
    if (!cleanCuit) {
      dateasData = await safeExecute('dateasService', () => getDateasOSINTData(companyName, null), null);
      if (dateasData && dateasData.cuitRaw) {
        cleanCuit = dateasData.cuitRaw;
        console.log(`[DATEAS CUIT DISCOVERY] Auto-resolved CUIT ${cleanCuit} for "${companyName}" from Dateas.com`);
      }
    }

    // 2. Parallel Secondary OSINT & Base Modules (Run all APIs with CUIT when available)
    let [
      bcraData,
      afipData,
      inpiWipoData,
      openCorporatesData,
      publicContracts,
      tradeData,
      pymeData,
      legalData,
      repsalData,
      boletinData,
      dateasResult,
      categorization,
      digitalTransformation
    ] = await Promise.all([
      safeExecute('bcraService', () => getBcraOSINTData(companyName, cleanCuit), null),
      safeExecute('afipService', () => getAfipPadronData(companyName, cleanCuit), null),
      safeExecute('inpiWipoService', () => getInpiWipoOSINTData(companyName), null),
      safeExecute('openCorporatesService', () => getOpenCorporatesOSINTData(companyName), null),
      safeExecute('publicContractsService', () => analyzePublicContracts(companyName, searchData, cleanCuit), {}),
      safeExecute('tradeService', () => getTradeOSINTData(companyName, cleanCuit, searchData, scrapedData), {}),
      safeExecute('pymeRegistryService', () => getPymeRegistryOSINTData(companyName, cleanCuit, searchData, scrapedData), {}),
      safeExecute('legalOsintService', () => analyzeLegalOSINT(companyName, {}, cleanCuit), {}),
      safeExecute('repsalService', () => getRepsalOSINTData(companyName, cleanCuit), {}),
      safeExecute('boletinOficialService', () => getBoletinOficialOSINTData(companyName, cleanCuit), {}),
      safeExecute('dateasService', () => dateasData ? Promise.resolve(dateasData) : getDateasOSINTData(companyName, cleanCuit), {}),
      safeExecute('categorizationService', () => categorizeCompany(companyName, scrapedData, searchData), {}),
      safeExecute('digitalTransformationService', () => analyzeDigitalTransformation(companyName, scrapedData, searchData), {})
    ]);

    dateasData = dateasResult || dateasData;

    if (dateasData && dateasData.isRealData) {
      legalData.dateasData = dateasData;
    }

    if (inpiWipoData) legalData.inpiWipoData = inpiWipoData;
    if (openCorporatesData) legalData.openCorporatesData = openCorporatesData;
    if (boletinData && boletinData.isRealData) {
      legalData.boletinOficialData = boletinData;
      if (boletinData.hasBankruptcyOrConcurso) {
        legalData.totalRecords = (legalData.totalRecords || 0) + boletinData.bankruptcyEdicts.length;
        legalData.riskRating = 'ALERTA MÁXIMA: EDICTO DE CONCURSO O QUIEBRA';
        legalData.legalSummary = `ALERTA JUDICIAL CRÍTICA: Se registraron ${boletinData.bankruptcyEdicts.length} edictos de concurso preventivo / quiebra en el Boletín Oficial (BORA).`;
      }
    }
    if (repsalData) {
      legalData.repsalData = repsalData;
      if (repsalData.hasSanctions) {
        legalData.totalRecords = (legalData.totalRecords || 0) + repsalData.totalSanctions;
        legalData.riskRating = 'OBSERVACIÓN LABORAL CRÍTICA (REPSAL)';
      }
    }

    // 3. Parallel Synthesis Phase (Financials, Strategic Support, SWOT, AI Extraction, AI Intelligence)
    const [financialData, supportPlan, swotAnalysis, aiResult, aiIntelligence] = await Promise.all([
      safeExecute('financialService', () => analyzeFinancials(companyName, scrapedData, searchData, bcraData), {}),
      safeExecute('supportAdvisorService', () => generateSupportPlan(companyName, categorization, {}, scrapedData, searchData), {}),
      safeExecute('swotAnalysisService', () => generateSwotAnalysis(companyName, categorization, {}, scrapedData, legalData), {}),
      safeExecute('aiExtractionService', () => analyzeCompanyWithGemini(companyName, scrapedData, searchData, { bcraData, afipData, inpiWipoData, openCorporatesData, publicContractsData: publicContracts, tradeData, pymeData, legalData }), null),
      safeExecute('aiIntelligenceService', () => analyzeCompanyWithAI(companyName, scrapedData, categorization, {}, digitalTransformation), {})
    ]);

    financialData.tradeData = tradeData;
    financialData.pymeData = pymeData;
    if (financialData.taxProfile) {
      financialData.taxProfile.publicCertificates = pymeData?.pymeCategory || 'Sin registro en Padrón MiPyME Oficial';
    }

    if (afipData) {
      financialData.taxProfile = financialData.taxProfile || {};
      financialData.taxProfile.cuit = afipData.cuit;
      financialData.taxProfile.economicActivity = afipData.economicActivity;
      financialData.taxProfile.vatCondition = afipData.vatCondition;
      financialData.afipData = afipData;

      // Re-run PyME, Legal, Public Contracts (COMPR.AR/CONTRAT.AR) & Boletín Oficial lookups using resolved CUIT
      if (afipData.cuit) {
        const cleanCuit = String(afipData.cuit).replace(/\D/g, '');
        try {
          const [refinedPyme, refinedLegal, refinedContracts, boletinData] = await Promise.all([
            getPymeRegistryOSINTData(companyName, cleanCuit, searchData, scrapedData),
            analyzeLegalOSINT(companyName, {}, cleanCuit),
            analyzePublicContracts(companyName, searchData, cleanCuit),
            getBoletinOficialOSINTData(companyName, cleanCuit)
          ]);

          if (refinedPyme && refinedPyme.isRealData) {
            pymeData = refinedPyme;
            financialData.pymeData = refinedPyme;
            financialData.taxProfile.publicCertificates = refinedPyme.pymeCategory;
          }

          if (refinedLegal && refinedLegal.isRealData) {
            legalData.sociedadDetail = refinedLegal.sociedadDetail;
            legalData.isRealData = true;
            legalData.apiSource = refinedLegal.apiSource;
            legalData.legalSummary = refinedLegal.legalSummary;
          }

          if (refinedContracts && refinedContracts.isRealData) {
            legalData.publicContracts = refinedContracts;
          }

          if (boletinData && boletinData.isRealData) {
            legalData.boletinOficialData = boletinData;
            if (boletinData.hasBankruptcyOrConcurso) {
              legalData.totalRecords = (legalData.totalRecords || 0) + boletinData.bankruptcyEdicts.length;
              legalData.riskRating = 'ALERTA MÁXIMA: EDICTO DE CONCURSO O QUIEBRA';
              legalData.legalSummary = `ALERTA JUDICIAL CRÍTICA: Se registraron ${boletinData.bankruptcyEdicts.length} edictos de concurso preventivo / quiebra en el Boletín Oficial (BORA).`;
            }
          }
        } catch (e) {
          console.error('[Refined CUIT Lookup Error]:', e);
        }
      }
    }

    // 4. Cross-Module Synthesis & Inter-Service Data Propagation Phase
    try {
      refineCrossModuleSynthesis({
        companyName,
        financialData,
        supportPlan,
        swotAnalysis,
        digitalTransformation,
        tradeData,
        pymeData,
        publicContracts,
        legalData,
        bcraData,
        inpiWipoData
      });
      console.log(`[CROSS-MODULE SYNTHESIS] Inter-service data propagation completed for "${companyName}".`);
    } catch (e) {
      console.warn('[Cross-Module Synthesis Notice]:', e.message);
    }

    if (aiResult) {
      if (aiResult.sector && aiResult.sector !== 'Información no verificada públicamente') {
        categorization.sector = aiResult.sector;
      }
      if (aiResult.businessModel && aiResult.businessModel !== 'Información no verificada públicamente') {
        categorization.businessModel = aiResult.businessModel;
      }
      if (aiResult.companyType && aiResult.companyType !== 'Información no verificada públicamente') {
        categorization.companyType = aiResult.companyType;
      }

      if (scrapedData.businessAnswers) {
        if (aiResult.whatItSells) scrapedData.businessAnswers.whatItSells = aiResult.whatItSells;
        if (aiResult.whoBuys) scrapedData.businessAnswers.whoBuys = aiResult.whoBuys;
        if (aiResult.howItGeneratesRevenue) scrapedData.businessAnswers.howItGeneratesRevenue = aiResult.howItGeneratesRevenue;
        if (aiResult.mostImportantAsset) scrapedData.businessAnswers.mostImportantAsset = aiResult.mostImportantAsset;
      }

      if (aiResult.strengths?.length > 0) swotAnalysis.strengths = aiResult.strengths;
      if (aiResult.weaknesses?.length > 0) swotAnalysis.weaknesses = aiResult.weaknesses;
      if (aiResult.opportunities?.length > 0) swotAnalysis.opportunities = aiResult.opportunities;
      if (aiResult.threats?.length > 0) swotAnalysis.threats = aiResult.threats;

      if (aiResult.markets?.length > 0) scrapedData.markets = aiResult.markets;
      if (aiResult.industries?.length > 0) scrapedData.industries = aiResult.industries;
      if (aiResult.clients?.length > 0) scrapedData.clients = aiResult.clients;
    }

    // Consolidated OSINT Master Report
    const report = {
      id: `OSINT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      query: {
        companyName: companyName.trim(),
        website: website ? website.trim() : null,
        region
      },
      categorization,
      scrapedData,
      financialData,
      legalData,
      publicContracts,
      searchData,
      supportPlan,
      swotAnalysis,
      digitalTransformation,
      aiIntelligence,
      executiveSummary: aiResult?.executiveSummary || null
    };

    setCachedScanReport(companyName, website, report);

    return res.json(report);

  } catch (globalError) {
    const totalDurationMs = Date.now() - scanStartTime;
    console.error(`\n🔥 [OSINT DEBUGGER CRITICAL FAILURE] (Duración: ${totalDurationMs}ms):`);
    console.error(`Empresa: "${companyName}" | Error: ${globalError.message}`);
    console.error(globalError.stack);
    console.error(`=================================================================\n`);

    return res.status(500).json({
      error: 'Inconveniente interno al procesar el análisis OSINT.',
      details: globalError.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Dual Company OSINT Benchmarking Endpoint
app.post('/api/osint/compare', scanRateLimiter, async (req, res) => {
  try {
    const { companyA, websiteA, companyB, websiteB } = req.body;

    if (!companyA || !companyA.trim() || !companyB || !companyB.trim()) {
      return res.status(400).json({ error: 'Debes ingresar el nombre de ambas empresas para comparar.' });
    }

    console.log(`[OSINT COMPARE START] Benchmarking "${companyA}" VS "${companyB}"`);

    const result = await compareCompaniesOSINT(
      { companyName: companyA, website: websiteA },
      { companyName: companyB, website: websiteB }
    );

    console.log(`[OSINT COMPARE COMPLETE] Benchmarking generated for "${companyA}" vs "${companyB}"`);
    return res.json(result);

  } catch (error) {
    console.error('OSINT Compare Error:', error);
    return res.status(500).json({ error: 'Error al procesar la comparación.', details: error.message });
  }
});

// OSINT Interactive Chat Endpoint
app.post('/api/osint/chat', chatRateLimiter, async (req, res) => {
  try {
    const { reportId, userQuery, chatHistory } = req.body;
    let report = req.body.report;

    // Soft auth token decode if present
    const authHeader = req.headers['authorization'];
    let authUserId = null;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const decoded = verifyAuthToken(authHeader.substring(7).trim());
      if (decoded) authUserId = decoded.id || decoded.username;
    }

    // 1. Recover verified report from server DB if reportId and authUserId are present
    if (reportId && authUserId) {
      const serverReport = getUserReportByIdFromDB(authUserId, reportId);
      if (serverReport) report = serverReport;
    }

    // 2. Recover report from server scan cache if query matches
    if (!report && reportId) {
      const cached = getCachedScanReport(reportId);
      if (cached) report = cached;
    }

    if (!userQuery || !userQuery.trim()) {
      return res.status(400).json({ error: 'Ingresa una pregunta.' });
    }

    if (!report || typeof report !== 'object') {
      return res.status(400).json({ error: 'No se especificó un informe de empresa válido.' });
    }

    const chatResponse = await answerOsintChat(report, userQuery, chatHistory || []);
    return res.json(chatResponse);

  } catch (error) {
    console.error('OSINT Chat Error:', error);
    return res.status(500).json({ error: 'Error en el asistente conversacional.', details: error.message });
  }
});

// Fallback to React index.html for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(clientDistPath, 'index.html'), (err) => {
    if (err) {
      res.status(404).send('Servidor OSINT activo. Construya la aplicación cliente con `npm run build:client`');
    }
  });
});

app.post('/api/generate-pdf', async (req, res) => {
  try {
    const { html } = req.body;
    if (!html) return res.status(400).send('Missing HTML content');

    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    
    await page.setContent(html, { waitUntil: 'networkidle0' });
    
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '8mm', bottom: '6mm', left: '8mm', right: '6mm' }
    });
    
    await browser.close();
    
    res.set({
      'Content-Type': 'application/pdf'
    });
    res.end(pdfBuffer);
  } catch (error) {
    console.error('PDF Generation Error:', error);
    res.status(500).send('Error generating PDF');
  }
});

// --- RUTAS DE LINKS PÚBLICOS COMPARTIDOS ---
app.post('/api/share', (req, res) => {
  try {
    const { report } = req.body;
    if (!report) return res.status(400).json({ success: false, error: 'No se envió ningún reporte.' });
    
    // Prune expired tokens (older than 7 days)
    const now = Date.now();
    for (const [key, value] of sharedReports.entries()) {
      if (now - value.createdAt > 7 * 24 * 60 * 60 * 1000) sharedReports.delete(key);
    }
    
    const token = crypto.randomBytes(12).toString('hex');
    sharedReports.set(token, { report, createdAt: Date.now() });
    saveSharedReportsToDisk();
    
    res.json({ success: true, token });
  } catch (e) {
    res.status(500).json({ success: false, error: 'Error interno al generar link.' });
  }
});

app.get('/api/share/:token', (req, res) => {
  try {
    const { token } = req.params;
    const entry = sharedReports.get(token);
    
    if (!entry) return res.status(404).json({ success: false, error: 'Link inválido o expirado.' });
    if (Date.now() - entry.createdAt > 7 * 24 * 60 * 60 * 1000) {
      sharedReports.delete(token);
      saveSharedReportsToDisk();
      return res.status(404).json({ success: false, error: 'Link expirado (más de 7 días).' });
    }
    
    res.json({ success: true, report: entry.report });
  } catch (e) {
    res.status(500).json({ success: false, error: 'Error interno al leer reporte compartido.' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 OSINT Tecno3F Server running on http://localhost:${PORT}`);
});

// Trigger nodemon
