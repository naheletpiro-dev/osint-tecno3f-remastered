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
import {
  authenticateUserInDB,
  getAllUsersFromDB,
  createUserByAdmin,
  toggleUserStatusInDB,
  deleteUserFromDB,
  addAuditLog,
  getAuditLogsFromDB,
  clearAuditLogsInDB
} from './database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

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

app.use(cors());
app.use(express.json({ limit: '2mb' }));

// Serve static frontend build if dist exists
const clientDistPath = path.join(__dirname, '../client/dist');
app.use(express.static(clientDistPath));

// Authorization Middleware for Admin Endpoints
const requireAdminAuth = (req, res, next) => {
  const userRole = req.headers['x-user-role'];
  const authHeader = req.headers['authorization'];
  
  // Verify request has admin role header or token
  if (userRole === 'admin' || (authHeader && authHeader.includes('admin'))) {
    return next();
  }
  
  // Allow internal/localhost access or fallback
  const clientIp = req.ip || req.connection.remoteAddress || '';
  if (clientIp.includes('127.0.0.1') || clientIp.includes('::1') || req.hostname === 'localhost') {
    return next();
  }

  return res.status(403).json({ error: 'Acceso denegado. Se requieren permisos de administrador.' });
};

// Auth Endpoints
app.post('/api/auth/login', async (req, res) => {
  const clientIp = req.ip || req.connection.remoteAddress || '127.0.0.1';
  const { username, password } = req.body;

  try {
    if (!username || !password) {
      addAuditLog({ type: 'LOGIN_FAILED', username: username || 'Anonimo', details: 'Intento de inicio de sesion incompleto.', severity: 'warning', ip: clientIp });
      return res.status(400).json({ error: 'Ingresa usuario y contraseña.' });
    }

    const cleanUsername = String(username).trim().slice(0, 60);
    const cleanPassword = String(password).slice(0, 100);

    const user = authenticateUserInDB(cleanUsername, cleanPassword);
    addAuditLog({ type: 'LOGIN_SUCCESS', username: user.username, details: `Inicio de sesion exitoso con rol ${user.role}.`, severity: 'info', ip: clientIp });
    return res.json({ success: true, user });
  } catch (err) {
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

// Main OSINT Scan Endpoint with Diagnostic Debugger
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

    // 1. Concurrent Multi-API OSINT Fetching wrapped with safeExecute
    const [scrapedData, searchData, bcraData, afipData, inpiWipoData, openCorporatesData, publicContracts, tradeData, pymeData] = await Promise.all([
      safeExecute('websiteScraperService', () => scrapeCompanyWebsite(website, companyName), {}),
      safeExecute('searchService', () => searchCompanyOSINT(companyName, website, region), {}),
      safeExecute('bcraService', () => getBcraOSINTData(companyName, null), null),
      safeExecute('afipService', () => getAfipPadronData(companyName, null), null),
      safeExecute('inpiWipoService', () => getInpiWipoOSINTData(companyName), null),
      safeExecute('openCorporatesService', () => getOpenCorporatesOSINTData(companyName), null),
      safeExecute('publicContractsService', () => analyzePublicContracts(companyName), {}),
      safeExecute('tradeService', () => getTradeOSINTData(companyName), {}),
      safeExecute('pymeRegistryService', () => getPymeRegistryOSINTData(companyName), {})
    ]);

    // 2. Financial & Tax Assessment
    const financialData = await safeExecute('financialService', () => analyzeFinancials(companyName, scrapedData, searchData, bcraData), {});
    financialData.tradeData = tradeData;
    financialData.pymeData = pymeData;

    if (afipData) {
      financialData.taxProfile = financialData.taxProfile || {};
      financialData.taxProfile.cuit = afipData.cuit;
      financialData.taxProfile.economicActivity = afipData.economicActivity;
      financialData.taxProfile.vatCondition = afipData.vatCondition;
      financialData.afipData = afipData;
    }

    // 3. Legal & Judicial OSINT
    const legalData = await safeExecute('legalOsintService', () => analyzeLegalOSINT(companyName), {});
    if (inpiWipoData) legalData.inpiWipoData = inpiWipoData;
    if (openCorporatesData) legalData.openCorporatesData = openCorporatesData;

    // 4. Categorization
    const categorization = await safeExecute('categorizationService', () => categorizeCompany(companyName, scrapedData, searchData), {});

    // 5. Strategic Support Plan
    const supportPlan = await safeExecute('supportAdvisorService', () => generateSupportPlan(companyName, categorization, financialData, scrapedData, searchData), {});

    // 6. Matriz FODA / SWOT Analysis
    const swotAnalysis = await safeExecute('swotAnalysisService', () => generateSwotAnalysis(companyName, categorization, financialData, scrapedData, legalData), {});

    // 7. Digital Transformation Analysis
    const digitalTransformation = await safeExecute('digitalTransformationService', () => analyzeDigitalTransformation(companyName, scrapedData, searchData), {});

    // 8. Gemini AI RAG Synthesis (Consolidated Multi-API Knowledge Base Context)
    const extraOsint = { bcraData, afipData, inpiWipoData, openCorporatesData, publicContractsData: publicContracts, tradeData, pymeData };
    const aiResult = await safeExecute('aiExtractionService', () => analyzeCompanyWithGemini(companyName, scrapedData, searchData, extraOsint), null);

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

    const totalDurationMs = Date.now() - scanStartTime;
    console.log(`[OSINT SCAN COMPLETE] Report ID: ${report.id} generado exitosamente en ${totalDurationMs}ms para "${companyName}"`);
    console.log(`=================== [OSINT DEBUGGER SCAN END] ===================\n`);

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
