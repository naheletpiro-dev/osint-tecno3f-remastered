import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
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
import { refineCrossModuleSynthesis } from './services/crossModuleSynthesis.js';
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
    // 1. Allow requests without origin (same-origin, server-to-server, cURL)
    if (!origin) {
      return callback(null, true);
    }

    // 2. Parse environment variable ALLOWED_ORIGINS
    const envOrigins = process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
      : [];

    if (envOrigins.includes('*') || process.env.ALLOWED_ORIGINS === '*') {
      return callback(null, true);
    }

    const allAllowed = [...defaultAllowedOrigins, ...envOrigins];

    // 3. Check exact allowed origins
    if (allAllowed.includes(origin)) {
      return callback(null, true);
    }

    // 4. Automatically permit deployments on .onrender.com, .netlify.app, .vercel.app
    try {
      const originUrl = new URL(origin);
      if (
        originUrl.hostname.endsWith('.onrender.com') ||
        originUrl.hostname.endsWith('.netlify.app') ||
        originUrl.hostname.endsWith('.vercel.app') ||
        originUrl.hostname === 'localhost' ||
        originUrl.hostname === '127.0.0.1'
      ) {
        return callback(null, true);
      }
    } catch (e) {
      // Ignore URL parse failures
    }

    // 5. Allow all origins in non-production mode
    if (process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }

    // Block unallowed origins safely without throwing 500 internal server error crash
    console.warn(`[CORS Bloqueado] Petición proveniente de un origen no permitido: ${origin}`);
    return callback(null, false);
  },
  credentials: true
}));

app.use(express.json({ limit: '2mb' }));

// Rate Limiter for Login Endpoint (Max 5 attempts / 15 min window)
const loginAttempts = new Map();

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

// Serve static frontend build if dist exists
const clientDistPath = path.join(__dirname, '../client/dist');
app.use(express.static(clientDistPath));

// Strict Authorization Middleware for Admin Endpoints (verifies JWT Bearer token)
const requireAdminAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Acceso no autorizado. Se requiere Token Bearer de sesión.' });
  }

  const token = authHeader.substring(7).trim();
  const decoded = verifyAuthToken(token);

  if (!decoded) {
    addAuditLog({
      type: 'SECURITY_INVALID_TOKEN',
      username: 'Desconocido',
      details: `Intento de acceso con token inválido o expirado en ${req.originalUrl}`,
      severity: 'warning',
      ip: req.ip
    });
    return res.status(401).json({ error: 'Token de sesión inválido o expirado. Vuelva a iniciar sesión.' });
  }

  if (decoded.role !== 'admin') {
    addAuditLog({
      type: 'SECURITY_FORBIDDEN_ROLE',
      username: decoded.username,
      details: `Intento de acceso admin rechazado para usuario con rol ${decoded.role}`,
      severity: 'warning',
      ip: req.ip
    });
    return res.status(403).json({ error: 'Acceso denegado. Se requieren permisos de administrador verificados.' });
  }

  req.user = decoded;
  next();
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

    const authResult = authenticateUserInDB(cleanUsername, cleanPassword);
    
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
app.get('/api/admin/users', requireAdminAuth, (req, res) => {
  try {
    const users = getAllUsersFromDB();
    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ error: 'Error interno al consultar usuarios.' });
  }
});

app.post('/api/admin/users/create', requireAdminAuth, (req, res) => {
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

    const user = createUserByAdmin({ username: cleanUser, password: cleanPass, displayName: cleanDisplay, role: cleanRole });
    addAuditLog({ type: 'USER_CREATED', username: 'Administrador', details: `Alta de usuario "${cleanUser}" con rol ${cleanRole}.`, severity: 'success', ip: clientIp });
    res.json({ success: true, user });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/admin/users/toggle-status', requireAdminAuth, (req, res) => {
  const clientIp = req.ip || req.connection.remoteAddress || '127.0.0.1';
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: 'ID de usuario requerido.' });
    const result = toggleUserStatusInDB(String(userId).trim());
    addAuditLog({ type: 'USER_STATUS_TOGGLED', username: 'Administrador', details: `Estado de usuario "${result.username}" cambiado a ${result.status}.`, severity: 'warning', ip: clientIp });
    res.json({ success: true, result });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/admin/users/:id', requireAdminAuth, (req, res) => {
  const clientIp = req.ip || req.connection.remoteAddress || '127.0.0.1';
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: 'ID de usuario requerido.' });
    const result = deleteUserFromDB(String(id).trim());
    addAuditLog({ type: 'USER_DELETED', username: 'Administrador', details: `Eliminación de cuenta ID ${id}.`, severity: 'danger', ip: clientIp });
    res.json({ success: true, result });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/admin/users/change-password', requireAdminAuth, (req, res) => {
  const clientIp = req.ip || req.connection.remoteAddress || '127.0.0.1';
  try {
    const { userId, newPassword } = req.body;
    if (!userId || !newPassword) {
      return res.status(400).json({ error: 'ID de usuario y nueva contraseña son requeridos.' });
    }
    const result = updateUserPasswordInDB(String(userId).trim(), String(newPassword).trim());
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
app.get('/api/admin/audit-logs', requireAdminAuth, (req, res) => {
  try {
    const logs = getAuditLogsFromDB(150);
    res.json({ success: true, logs });
  } catch (err) {
    res.status(500).json({ error: 'Error al recuperar logs de auditoría.' });
  }
});

app.delete('/api/admin/audit-logs/clear', requireAdminAuth, (req, res) => {
  const clientIp = req.ip || req.connection.remoteAddress || '127.0.0.1';
  try {
    clearAuditLogsInDB();
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

/**
 * Strict Authentication Helper: Extracts & verifies JWT token from Authorization header.
 * Completely ignores unauthenticated X-User-Id headers or req.body.userId to prevent IDOR attacks.
 */
function getAuthenticatedUserId(req) {
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    if (token) {
      const decoded = verifyAuthToken(token);
      if (decoded && (decoded.id || decoded.username)) {
        return decoded.id || decoded.username;
      }
    }
  }
  return null;
}

// Watchlist & Monitored Companies Endpoints (Secured against IDOR)
app.get('/api/watchlist', (req, res) => {
  try {
    const userId = getAuthenticatedUserId(req);
    if (!userId) return res.status(401).json({ error: 'Token de autenticación requerido o inválido.' });
    const list = getWatchlistFromDB();
    res.json({ success: true, watchlist: list });
  } catch (e) {
    res.status(500).json({ error: 'Error al obtener lista de monitoreo.' });
  }
});

app.post('/api/watchlist', (req, res) => {
  try {
    const userId = getAuthenticatedUserId(req);
    if (!userId) return res.status(401).json({ error: 'Token de autenticación requerido o inválido.' });
    const { companyName, cuit, website } = req.body;
    if (!companyName || !companyName.trim()) return res.status(400).json({ error: 'El nombre de la empresa es obligatorio.' });
    const item = addWatchlistCompany({ companyName, cuit, website, userId });
    res.json({ success: true, item });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.delete('/api/watchlist/:id', (req, res) => {
  try {
    const userId = getAuthenticatedUserId(req);
    if (!userId) return res.status(401).json({ error: 'Token de autenticación requerido o inválido.' });
    const { id } = req.params;
    const result = removeWatchlistCompany(id);
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: 'Error al eliminar de monitoreo.' });
  }
});

// Server-Side User History Endpoints (Secured against IDOR)
app.get('/api/history', (req, res) => {
  try {
    const userId = getAuthenticatedUserId(req);
    if (!userId) return res.status(401).json({ error: 'Token de autenticación requerido o inválido.' });

    const summaries = getUserHistorySummariesFromDB(userId);
    res.json({ success: true, history: summaries });
  } catch (e) {
    res.status(500).json({ error: 'Error al consultar historial.' });
  }
});

app.get('/api/history/:id', (req, res) => {
  try {
    const userId = getAuthenticatedUserId(req);
    if (!userId) return res.status(401).json({ error: 'Token de autenticación requerido o inválido.' });

    const { id } = req.params;
    const report = getUserReportByIdFromDB(userId, id);
    if (!report) return res.status(404).json({ error: 'Informe no encontrado en el historial.' });

    res.json({ success: true, report });
  } catch (e) {
    res.status(500).json({ error: 'Error al recuperar el informe.' });
  }
});

app.post('/api/history/save', (req, res) => {
  try {
    const userId = getAuthenticatedUserId(req);
    if (!userId) return res.status(401).json({ error: 'Token de autenticación requerido o inválido.' });

    const { report } = req.body;
    if (!report) return res.status(400).json({ error: 'Faltan parámetros requeridos.' });

    const reportId = saveUserReportToDB(userId, report);
    res.json({ success: true, reportId });
  } catch (e) {
    res.status(500).json({ error: 'Error al guardar informe en el historial.' });
  }
});

app.delete('/api/history', (req, res) => {
  try {
    const userId = getAuthenticatedUserId(req);
    if (!userId) return res.status(401).json({ error: 'Token de autenticación requerido o inválido.' });

    clearUserHistoryFromDB(userId);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Error al purgar historial.' });
  }
});

// Periodic Watchlist Monitoring Worker (Checks BCRA credit changes every 10 mins)
setInterval(async () => {
  try {
    const watchlist = getWatchlistFromDB();
    if (watchlist.length === 0) return;
    console.log(`[WATCHLIST MONITORING WORKER] Periodic inspection running for ${watchlist.length} monitored companies...`);

    for (const company of watchlist) {
      const bcra = await getBcraOSINTData(company.companyName, company.cuit !== 'N/D' ? company.cuit : null);
      if (bcra && bcra.isRealData) {
        if (bcra.situacionMax > 1 || (bcra.chequesRechazados && bcra.chequesRechazados.totalCount > 0)) {
          addWatchlistAlert(company.id, {
            type: 'CREDIT_SITUATION_ALERT',
            severity: 'warning',
            title: `Alerta de Crédito BCRA: ${bcra.situacionLabel}`,
            message: `Registra ${bcra.chequesRechazados?.totalCount || 0} cheques rechazados por ${bcra.chequesRechazados?.totalMontoARS || '$0 ARS'}.`
          });
        }
      }
    }
  } catch (e) {
    console.error('[WATCHLIST WORKER NOTICE]:', e.message);
  }
}, 10 * 60 * 1000);

// Real-Time SSE (Server-Sent Events) Scan Progress Endpoint
app.get('/api/osint/scan-stream', async (req, res) => {
  const { companyName, website, region = 'AR' } = req.query;

  if (!companyName || !companyName.trim()) {
    return res.status(400).send('companyName parameter required');
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
    const bcraData = await safeExecute('bcraService', () => getBcraOSINTData(companyName, null), null);
    const afipData = await safeExecute('afipService', () => getAfipPadronData(companyName, null), null);

    sendEvent('progress', { stage: 3, percent: 70, text: `Rastreando marcas INPI/WIPO y licitaciones públicas COMPR.AR...` });

    const [inpiWipoData, openCorporatesData, publicContracts, tradeData, pymeData, legalData, categorization, digitalTransformation] = await Promise.all([
      safeExecute('inpiWipoService', () => getInpiWipoOSINTData(companyName), null),
      safeExecute('openCorporatesService', () => getOpenCorporatesOSINTData(companyName), null),
      safeExecute('publicContractsService', () => analyzePublicContracts(companyName, searchData), {}),
      safeExecute('tradeService', () => getTradeOSINTData(companyName, null, searchData, scrapedData), {}),
      safeExecute('pymeRegistryService', () => getPymeRegistryOSINTData(companyName, null, searchData, scrapedData), {}),
      safeExecute('legalOsintService', () => analyzeLegalOSINT(companyName), {}),
      safeExecute('categorizationService', () => categorizeCompany(companyName, scrapedData, searchData), {}),
      safeExecute('digitalTransformationService', () => analyzeDigitalTransformation(companyName, scrapedData, searchData), {})
    ]);

    if (inpiWipoData) legalData.inpiWipoData = inpiWipoData;
    if (openCorporatesData) legalData.openCorporatesData = openCorporatesData;

    sendEvent('progress', { stage: 4, percent: 90, text: `Sintetizando informe comercial y evaluación de madurez digital...` });

    const [financialData, supportPlan, swotAnalysis, aiResult] = await Promise.all([
      safeExecute('financialService', () => analyzeFinancials(companyName, scrapedData, searchData, bcraData), {}),
      safeExecute('supportAdvisorService', () => generateSupportPlan(companyName, categorization, {}, scrapedData, searchData), {}),
      safeExecute('swotAnalysisService', () => generateSwotAnalysis(companyName, categorization, {}, scrapedData, legalData), {}),
      safeExecute('aiExtractionService', () => analyzeCompanyWithGemini(companyName, scrapedData, searchData, { bcraData, afipData, inpiWipoData, openCorporatesData, publicContractsData: publicContracts, tradeData, pymeData }), null)
    ]);

    financialData.tradeData = tradeData;
    financialData.pymeData = pymeData;

    if (afipData) {
      financialData.taxProfile = financialData.taxProfile || {};
      financialData.taxProfile.cuit = afipData.cuit;
      financialData.taxProfile.economicActivity = afipData.economicActivity;
      financialData.taxProfile.vatCondition = afipData.vatCondition;
      financialData.afipData = afipData;
    }

    if (aiResult) {
      if (aiResult.sector) categorization.sector = aiResult.sector;
      if (aiResult.businessModel) categorization.businessModel = aiResult.businessModel;
      if (aiResult.companyType) categorization.companyType = aiResult.companyType;
      scrapedData.businessAnswers = {
        whatDoesCompanyDo: aiResult.whatItSells,
        whatItSells: aiResult.whatItSells,
        whoBuys: aiResult.whoBuys,
        targetAudience: aiResult.whoBuys,
        howItGeneratesRevenue: aiResult.howItGeneratesRevenue,
        mostImportantAsset: aiResult.mostImportantAsset
      };
      if (aiResult.executiveSummary) categorization.summary = aiResult.executiveSummary;
      if (Array.isArray(aiResult.strengths)) swotAnalysis.strengths = aiResult.strengths;
      if (Array.isArray(aiResult.weaknesses)) swotAnalysis.weaknesses = aiResult.weaknesses;
      if (Array.isArray(aiResult.opportunities)) swotAnalysis.opportunities = aiResult.opportunities;
      if (Array.isArray(aiResult.threats)) swotAnalysis.threats = aiResult.threats;
    }

    const finalReport = {
      query: { companyName, website, region },
      categorization,
      scrapedData,
      financialData,
      legalData,
      publicContracts,
      swotAnalysis,
      digitalTransformation,
      supportPlan,
      searchData,
      aiIntelligence: aiResult || null,
      timestamp: new Date().toISOString()
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

// Main OSINT Scan Endpoint with Cache Lookup
app.post('/api/osint/scan', async (req, res) => {
  const scanStartTime = Date.now();
  const { companyName, website, region = 'AR' } = req.body;

  console.log(`\n=================== [OSINT DEBUGGER SCAN START] ===================`);
  console.log(`[TARGET] Empresa: "${companyName}" | Sitio: "${website || 'No provisto'}" | Inicio: ${new Date().toISOString()}`);

  try {
    if (!companyName || !companyName.trim()) {
      console.warn(`[OSINT DEBUGGER - WARN] Solicitud rechazada: Falta el nombre de la empresa.`);
      return res.status(400).json({ error: 'El nombre de la empresa es obligatorio' });
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

    // 2. Parallel Secondary OSINT & Base Modules (Run all APIs & initial classification concurrently)
    let [
      bcraData,
      afipData,
      inpiWipoData,
      openCorporatesData,
      publicContracts,
      tradeData,
      pymeData,
      legalData,
      categorization,
      digitalTransformation
    ] = await Promise.all([
      safeExecute('bcraService', () => getBcraOSINTData(companyName, null), null),
      safeExecute('afipService', () => getAfipPadronData(companyName, null), null),
      safeExecute('inpiWipoService', () => getInpiWipoOSINTData(companyName), null),
      safeExecute('openCorporatesService', () => getOpenCorporatesOSINTData(companyName), null),
      safeExecute('publicContractsService', () => analyzePublicContracts(companyName, searchData), {}),
      safeExecute('tradeService', () => getTradeOSINTData(companyName, null, searchData, scrapedData), {}),
      safeExecute('pymeRegistryService', () => getPymeRegistryOSINTData(companyName, null, searchData, scrapedData), {}),
      safeExecute('legalOsintService', () => analyzeLegalOSINT(companyName), {}),
      safeExecute('categorizationService', () => categorizeCompany(companyName, scrapedData, searchData), {}),
      safeExecute('digitalTransformationService', () => analyzeDigitalTransformation(companyName, scrapedData, searchData), {})
    ]);

    if (inpiWipoData) legalData.inpiWipoData = inpiWipoData;
    if (openCorporatesData) legalData.openCorporatesData = openCorporatesData;

    // 3. Parallel Synthesis Phase (Financials, Strategic Support, SWOT, AI Extraction)
    const [financialData, supportPlan, swotAnalysis, aiResult] = await Promise.all([
      safeExecute('financialService', () => analyzeFinancials(companyName, scrapedData, searchData, bcraData), {}),
      safeExecute('supportAdvisorService', () => generateSupportPlan(companyName, categorization, {}, scrapedData, searchData), {}),
      safeExecute('swotAnalysisService', () => generateSwotAnalysis(companyName, categorization, {}, scrapedData, legalData), {}),
      safeExecute('aiExtractionService', () => analyzeCompanyWithGemini(companyName, scrapedData, searchData, { bcraData, afipData, inpiWipoData, openCorporatesData, publicContractsData: publicContracts, tradeData, pymeData }), null)
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
        bcraData
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
app.post('/api/osint/compare', async (req, res) => {
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
app.post('/api/osint/chat', async (req, res) => {
  try {
    const { report, userQuery, chatHistory } = req.body;

    if (!userQuery || !userQuery.trim()) {
      return res.status(400).json({ error: 'Ingresa una pregunta.' });
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

app.listen(PORT, () => {
  console.log(`🚀 OSINT Tecno3F Server running on http://localhost:${PORT}`);
});
