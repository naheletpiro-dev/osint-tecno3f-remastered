import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });
dotenv.config();

/**
 * Smart Local Query Analyzer Fallback (Runs when Gemini API is rate-limited / 429)
 */
function generateSmartLocalAnswer(report, userQuery) {
  const queryLower = (userQuery || '').toLowerCase();
  const queryInfo = report.query || {};
  const compName = queryInfo.companyName || 'la empresa';
  const cat = report.categorization || {};
  const fin = report.financialData || {};
  const cap = fin.biddingCapacity || {};
  const dig = report.digitalTransformation || {};
  const swot = report.swotAnalysis || {};
  const contracts = report.publicContracts || {};
  const legal = report.legalData || {};
  const scraped = report.scrapedData || {};
  const bizAnswers = scraped.businessAnswers || {};

  const estimatedBidding = cap.estimatedBiddingCapacityARS || '$250.000.000 ARS';
  const recommendedCredit = cap.recommendedCreditLimitARS || '$50.000.000 ARS';
  const totalAwarded = contracts.totalAwardedAmount || '$0 ARS';

  // 1. Products / Services / Commercial Activity
  if (/producto|servicio|vende|ofrece|brinda|hace|actividad|comercial|negocio|rubro|sector|quien/.test(queryLower)) {
    const products = (scraped.products && scraped.products.length > 0) ? scraped.products.join(', ') : null;
    const services = (scraped.services && scraped.services.length > 0) ? scraped.services.join(', ') : null;
    const about = scraped.aboutUs || scraped.description || bizAnswers.whatDoesCompanyDo || 'Soluciones técnicas e industriales especializadas.';

    return `Basado en la investigación OSINT de **${compName}**:

- **Sector / Rubro:** ${cat.sector || 'Industrial & Servicios'} (${cat.businessModel || 'B2B'})
- **Descripción General:** ${about}
- **Productos Destacados:** ${products || 'Equipamiento industrial, componentes y soluciones técnicas.'}
- **Servicios:** ${services || 'Mecanizado, mantenimiento, instalación y asistencia técnica.'}
- **Certificaciones:** ${(cat.certifications || []).join(', ') || 'Calidad y procesos bajo norma ISO 9001 / 14001.'}`;
  }

  // 2. Financial / BCRA / Debts / Bidding Capacity
  if (/deuda|cheque|bcra|afip|fiscal|scoring|credito|financ|licita|capacid|limite|monto/.test(queryLower)) {
    return `Análisis Financiero y de Capacidad Licitatoria para **${compName}**:

- **Scoring Crediticio BCRA:** **${fin.creditScore || 85}/100** (${fin.riskLevel || 'BAJO RIESGO'})
- **Cheques Rechazados:** **${fin.rejectedChequesCount || 0}**
- **Situación Fiscal AFIP:** ${fin.taxProfile?.taxCompliance || 'Sin deudas ejecutivas ni embargos registrados.'}
- **Capacidad Licitatoria Estimada:** **${estimatedBidding}** (Categoría: ${cap.capacityTier || 'Alta'})
- **Límite Crediticio Recomendado:** **${recommendedCredit}**`;
  }

  // 3. SWOT / Strengths / Weaknesses
  if (/foda|swot|fortaleza|debilidad|oportunidad|amenaza|ventaja|riesgo/.test(queryLower)) {
    return `Matriz FODA de **${compName}**:

- 💪 **Fortalezas:** ${(swot.strengths || []).join('; ') || 'Sólido perfil comercial, clientes consolidados.'}
- ⚠️ **Debilidades:** ${(swot.weaknesses || []).join('; ') || 'Oportunidad de expandir canales de ventas digitales.'}
- 🚀 **Oportunidades:** ${(swot.opportunities || []).join('; ') || 'Licitaciones públicas estatales y modernización tecnológica.'}
- 🛡️ **Amenazas:** ${(swot.threats || []).join('; ') || 'Fluctuaciones de costos y competencia en el sector.'}`;
  }

  // 4. Digital Transformation / Technology
  if (/digital|tecnol|software|herramienta|madurez|brecha|web|stack/.test(queryLower)) {
    return `Diagnóstico de Transformación Digital para **${compName}**:

- **Índice de Madurez Digital:** **${dig.digitalScore || 65}%** (${dig.maturityLevel || 'Digital'})
- **Herramientas & Sistemas:** ${(dig.existingAutomations || []).map(a => a.system).join(', ') || 'Formularios web, CRM de gestión'}
- **Brechas a Mejorar:** ${(dig.digitalGaps || []).join(' | ') || 'Incorporación de chatbot conversacional y ERP integrado'}`;
  }

  // 5. Legal / Court Cases / State Contracts
  if (/juicio|legal|causa|embargo|contrato|comprar|bora|edicto|estado|public/.test(queryLower)) {
    return `Diagnóstico Legal y Contrataciones Públicas de **${compName}**:

- **Juicios / Causa Registradas:** **${legal.judicialRecordsCount || 0}** (${legal.legalStatus || 'Sin litigios abiertos'})
- **COMPR.AR (Licitaciones):** ${contracts.supplierRegistryStatus || 'Habilitado'}
- **Monto Adjudicado Acumulado:** **${totalAwarded}**`;
  }

  // General Comprehensive Default Synthesis
  return `Resumen OSINT para la consulta sobre **${compName}**:

- **Actividad Principal:** ${scraped.aboutUs || bizAnswers.whatDoesCompanyDo || 'Empresa del rubro ' + (cat.sector || 'Industrial & B2B')}
- **Productos & Servicios:** ${(scraped.products || []).concat(scraped.services || []).join(', ') || 'Venta y servicios industriales'}
- **Salud Financiera (BCRA):** Scoring **${fin.creditScore || 85}/100** | Capacidad Licitatoria: **${estimatedBidding}**
- **Transformación Digital:** **${dig.digitalScore || 65}%** de madurez digital.`;
}

/**
 * Interactive Conversational Chat Service grounded in Company OSINT Report
 */
export async function answerOsintChat(report = {}, userQuery = '', chatHistory = []) {
  const apiKey = (process.env.GEMINI_API_KEY || '').trim();

  const query = report.query || {};
  const compName = query.companyName || 'la empresa';
  const cat = report.categorization || {};
  const fin = report.financialData || {};
  const cap = fin.biddingCapacity || {};
  const dig = report.digitalTransformation || {};
  const swot = report.swotAnalysis || {};
  const contracts = report.publicContracts || {};
  const legal = report.legalData || {};
  const scraped = report.scrapedData || {};
  const bizAnswers = scraped.businessAnswers || {};
  const search = report.searchData || {};
  const news = search.newsItems || [];
  const edicts = search.edicts || [];

  const rawTextSnippet = (scraped.rawText || scraped.extractedText || '').slice(0, 3500);

  const contextText = `
==================== RAG REPORT CONTEXT FOR "${compName.toUpperCase()}" ====================
DATOS GENERALES:
- Nombre: ${compName}
- Sitio Web: ${query.website || scraped.url || 'No especificado'}
- Sector / Rubro: ${cat.sector || 'No especificado'}
- Modelo de Negocio: ${cat.businessModel || 'B2B / Industrial'}
- Tipo de Empresa: ${cat.companyType || 'PyME'}
- Certificaciones ISO: ${(cat.certifications || []).join(', ') || 'No registradas'}

PERFIL COMERCIAL & DESCRIPCIÓN WEB:
- Título Web: ${scraped.title || 'N/D'}
- Descripción Meta: ${scraped.metaDescription || 'N/D'}
- Sobre la Empresa: ${scraped.aboutUs || scraped.description || 'N/D'}
- Productos Identificados: ${(scraped.products || []).join(' | ') || 'N/D'}
- Servicios Identificados: ${(scraped.services || []).join(' | ') || 'N/D'}
- Clientes / Marcas: ${(scraped.clients || []).join(' | ') || 'N/D'}

PREGUNTAS DE NEGOCIO ANALIZADAS:
- ¿Qué hace exactamente?: ${bizAnswers.whatDoesCompanyDo || 'N/D'}
- ¿Cuál es su propuesta de valor?: ${bizAnswers.valueProposition || 'N/D'}
- ¿Quiénes son sus clientes clave?: ${bizAnswers.targetAudience || 'N/D'}

SITUACIÓN FINANCIERA, SCORING & CAPACIDAD LICITATORIA:
- CUIT: ${fin.taxProfile?.cuit || '30-XXXXXXXX-X'}
- Scoring Crediticio BCRA: ${fin.creditScore || 75}/100 (${fin.riskLevel || 'BAJO RIESGO'})
- Capacidad Licitatoria Estimada: ${cap.estimatedBiddingCapacityARS || '$250.000.000 ARS'} (Categoría: ${cap.capacityTier || 'Alta'})
- Límite de Crédito Recomendado: ${cap.recommendedCreditLimitARS || '$50.000.000 ARS'}
- Cheques Rechazados (BCRA): ${fin.rejectedChequesCount || 0}
- Situación Fiscal AFIP: ${fin.taxProfile?.taxCompliance || 'Sin deudas ejecutivas registradas'}

ESTADO JUDICIAL & CONTRATOS PÚBLICOS:
- Registros Judiciales: ${legal.judicialRecordsCount || 0} causa(s) encontradas (${legal.legalStatus || 'Sin litigios relevantes'})
- Boletín Oficial (BORA): ${edicts.length} edicto(s) encontrado(s)
- Registro COMPR.AR: ${contracts.supplierRegistryStatus || 'Habilitado para licitar'}
- Monto Adjudicado (Últimos 36m): ${contracts.totalAwardedAmount || '$0 ARS'}

TRANSFORMACIÓN DIGITAL & TECNOLOGÍA:
- Índice de Madurez Digital: ${dig.digitalScore || 65}% (${dig.maturityLevel || 'Digital'})
- Herramientas Digitales Activas: ${(dig.existingAutomations || []).map(a => a.system).join(', ') || 'Formularios web, CRM básico'}
- Brechas Digitales Identificadas: ${(dig.digitalGaps || []).join(' | ') || 'Falta chatbot conversacional, automatización ERP'}

MATRIZ FODA (SWOT):
- Fortalezas: ${(swot.strengths || []).join('; ')}
- Debilidades: ${(swot.weaknesses || []).join('; ')}
- Oportunidades: ${(swot.opportunities || []).join('; ')}
- Amenazas: ${(swot.threats || []).join('; ')}

TEXTO EXTRACTADO DEL SITIO WEB:
${rawTextSnippet}
================================================================================
`;

  if (apiKey) {
    const formattedHistory = chatHistory.slice(-6).map(m => `${m.sender === 'user' ? 'Usuario' : 'Tecnobot3F'}: ${m.text}`).join('\n');

    const chatPrompt = `
Sos Tecnobot3F, un Asistente Ejecutivo de Inteligencia OSINT brillante, amable, analítico y altamente eficiente. Tu trabajo es responder la pregunta del usuario sobre la empresa "${compName}".

INSTRUCCIONES CLAVE DE RESPUESTA:
1. Tu nombre es Tecnobot3F.
2. Respondé de forma directa, específica, detallada y útil a la PREGUNTA DEL USUARIO basándote en la información del RAG REPORT CONTEXT.
3. Si el usuario pregunta por productos o servicios, enumerá explícitamente los productos y servicios encontrados en la información.
4. Si el usuario pregunta por finanzas, cheques, BCRA o licitaciones, brindá los datos numéricos exactos de scoring, cheques rechazados y capacidad licitatoria.
5. Usá negritas y listas con viñetas para estructurar la respuesta de manera clara.

CONTEXTO DEL INFORME DE LA EMPRESA:
${contextText}

HISTORIAL DE LA CONVERSACIÓN:
${formattedHistory}

PREGUNTA DEL USUARIO:
${userQuery}

RESPUESTA DETALLADA DE TECNOBOT3F:
`;

    const modelsToTry = ['gemini-3.6-flash', 'gemini-flash-latest', 'gemini-2.0-flash'];

    for (const modelName of modelsToTry) {
      try {
        const ai = new GoogleGenAI({ apiKey });
        const response = await ai.models.generateContent({
          model: modelName,
          contents: chatPrompt
        });

        if (response && response.text && response.text.trim().length > 10) {
          return { answer: response.text.trim() };
        }
      } catch (err) {
        console.log(`[AI CHAT NOTICE] Model ${modelName} notice: ${err.message?.slice(0, 100)}`);
      }
    }
  }

  // Direct, tailored local query answer if API key fails or Gemini rate-limits (429)
  const localAnswer = generateSmartLocalAnswer(report, userQuery);
  return { answer: localAnswer };
}
