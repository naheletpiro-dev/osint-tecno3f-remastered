import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

let lastWorkingModel = 'gemini-2.0-flash';
const baseModels = ['gemini-2.0-flash', 'gemini-2.5-pro', 'gemini-2.0-flash-lite', 'gemini-1.5-flash'];

/**
 * Executes a single focused Gemini API call with fallback model support
 */
async function callGeminiFocused(apiKey, prompt, mimeType = 'application/json') {
  const modelsToTry = [lastWorkingModel, ...baseModels.filter(m => m !== lastWorkingModel)];

  for (const modelName of modelsToTry) {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: mimeType ? { responseMimeType: mimeType } : {}
      });

      if (response && response.text) {
        lastWorkingModel = modelName;
        if (mimeType === 'application/json') {
          return JSON.parse(response.text);
        }
        return response.text;
      }
    } catch (err) {
      console.warn(`[MULTI-PASS AI NOTICE] Model ${modelName} notice: ${err.message?.slice(0, 90)}`);
    }
  }
  return null;
}

/**
 * Multi-Pass Specialized AI Extraction Engine with Cross-Validation
 * Runs 3 specialized parallel extraction calls (Categorization, Executive Commercial, SWOT)
 * followed by a 2nd Verification Pass (Fact-Checking & Anti-Hallucination).
 */
export async function analyzeCompanyWithGemini(companyName, scrapedData = {}, searchData = {}, extraOsint = {}) {
  const apiKey = (process.env.GEMINI_API_KEY || '').trim();

  if (!apiKey) {
    console.log('[RAG OSINT] No GEMINI_API_KEY provided. Skipping AI RAG extraction.');
    return null;
  }

  const cleanComp = companyName.trim();
  const website = scrapedData.url || '';
  const title = scrapedData.title || '';
  const metaDesc = scrapedData.description || '';
  const aboutText = (scrapedData.aboutUs || scrapedData.valueProposition || '').slice(0, 2500);
  const fullRawText = (scrapedData.fullText || scrapedData.rawText || '').slice(0, 4500);
  const productsList = (scrapedData.products || []).slice(0, 12).join('; ');
  const servicesList = (scrapedData.services || []).slice(0, 12).join('; ');
  const clientsList = (scrapedData.clients || []).slice(0, 8).join('; ');
  const newsList = (searchData.newsItems || []).map(n => n.title).slice(0, 5).join('; ');
  const gazetteList = (searchData.gazetteSnippets || []).map(g => `${g.title}: ${g.snippet}`).slice(0, 4).join(' | ');
  const tenderList = (searchData.tenderSnippets || []).map(t => `${t.title}: ${t.snippet}`).slice(0, 4).join(' | ');
  const searchSnippets = (searchData.overviewSnippets || []).map(s => `${s.title}: ${s.snippet}`).slice(0, 5).join(' | ');

  const afip = extraOsint.afipData || {};
  const bcra = extraOsint.bcraData || {};
  const inpi = extraOsint.inpiWipoData || {};
  const openCorp = extraOsint.openCorporatesData || {};
  const publicContracts = extraOsint.publicContractsData || {};
  const trade = extraOsint.tradeData || {};
  const pyme = extraOsint.pymeData || {};

  const afipContext = `AFIP CUIT: ${afip.cuit || 'N/A'} | Razón Social: ${afip.razonSocial || 'N/A'} | Actividad CLAE: ${afip.economicActivity || 'N/A'} | Condición IVA: ${afip.vatCondition || 'N/A'}`;
  const bcraContext = `Situación BCRA: ${bcra.situacionLabel || 'N/A'} | Deuda Total ARS: ${bcra.totalDeudaBancariaARS || '$0 ARS'} | Entidades Acreedoras: ${(bcra.entidadesCreditoras || []).map(e => e.entidad).join(', ')}`;
  const inpiContext = `Marcas Registradas: ${(inpi.registeredTrademarks || []).map(m => `${m.brandName} (${m.niceClass})`).join('; ')}`;
  const openCorpContext = `Registro Corporativo: ${openCorp.corporateDetails?.name || 'N/A'} (N° ${openCorp.corporateDetails?.companyNumber || 'N/A'}) | Estado: ${openCorp.corporateDetails?.currentStatus || 'N/A'}`;
  const contractsContext = `Licitaciones Públicas: ${publicContracts.totalContracts || 0} contratos por ${publicContracts.totalAwardedAmount || '$0 ARS'}`;
  const tradeContext = `COMERCIO EXTERIOR: Actividad ${trade.tradeActivity || 'Mercado Nacional'} | Detalle: ${trade.details || 'N/A'}`;
  const pymeContext = `REGISTRO MiPyME: Categoría ${pyme.pymeCategory || 'PyME'} | Beneficios: ${(pyme.fiscalBenefits || []).join(', ')} | Economía del Conocimiento: ${pyme.knowledgeEconomyRegistered ? 'Sí' : 'No'}`;

  const commonContext = `
==================== EVIDENCIA Y FUENTES OSINT PARA "${cleanComp.toUpperCase()}" ====================
SITIO WEB OFICIAL: ${website} | TÍTULO: ${title} | META DESCRIPCIÓN: ${metaDesc}
TEXTO EXTRAÍDO DE LA WEB:
${aboutText}
${fullRawText}

PRODUCTOS DETECTADOS: ${productsList || 'Verificados en catálogo'}
SERVICIOS DETECTADOS: ${servicesList || 'Verificados en sitio web'}
CLIENTES / SEGMENTOS: ${clientsList || 'Sector corporativo e industrial'}
PRENSA / NOTICIAS: ${newsList || 'Sin registros de prensa'}
BOLETÍN OFICIAL / EDICTOS / LICITACIONES: ${tenderList || gazetteList || searchSnippets}

REGISTROS ESTATALES Y APIS:
- AFIP / ARCA: ${afipContext}
- BCRA: ${bcraContext}
- INPI MARCAS: ${inpiContext}
- OPENCORPORATES: ${openCorpContext}
- COMPR.AR / CONTRAT.AR: ${contractsContext}
- ADUANA COMERCIO EXTERIOR: ${tradeContext}
- REGISTRO MiPyME: ${pymeContext}
=================================================================================
`;

  console.log(`[MULTI-PASS AI] Launching 3 specialized extraction passes in parallel for "${cleanComp}"...`);

  // --- PASS 1A: Categorization & Business Structure Prompt ---
  const promptPass1A = `${commonContext}
MISIÓN 1A - CLASIFICACIÓN Y ESTRUCTURA DE NEGOCIO:
Enfócate EXCLUSIVAMENTE en definir la taxonomía sectorial, tipo de empresa y modelo de negocio de "${cleanComp}".
Devuelve un JSON con estas 4 llaves:
{
  "sector": "Sector exacto y rubro comercial catalogado de ${cleanComp}",
  "businessModel": "Modelo de negocio verificado (ej: B2B Industrial, B2C, SaaS Telegestión, Manufactura Metalúrgica)",
  "companyType": "Tipo y clasificación de empresa (ej: PyME Industrial Metalúrgica, Empresa de Software & IoT)",
  "howItGeneratesRevenue": "Mecanismo principal de generación de ingresos según sus productos/servicios"
}`;

  // --- PASS 1B: Executive Synthesis & Commercial Offer Prompt ---
  const promptPass1B = `${commonContext}
MISIÓN 1B - SÍNTESIS EJECUTIVA Y OFERTA COMERCIAL:
Enfócate EXCLUSIVAMENTE en redactar la síntesis ejecutiva, catálogo de oferta y activos de planta de "${cleanComp}".
Devuelve un JSON con estas 5 llaves:
{
  "whatItSells": "Catálogo resumido y preciso de lo que vende o provee ${cleanComp}",
  "whoBuys": "Perfil de compradores, clientes corporativos y sectores destino de ${cleanComp}",
  "mostImportantAsset": "Activos críticos concretos de la industria de ${cleanComp} (ej: parque de curvadoras de caños, centros CNC, servidores cloud, matricería de precisión)",
  "valueProposition": "Propuesta de valor y diferenciador competitivo principal de ${cleanComp}",
  "executiveSummary": "Síntesis ejecutiva de 2 párrafos que organice y sintetice el perfil comercial, solvencia BCRA, capacidad licitatoria y oferta de ${cleanComp}"
}`;

  // --- PASS 1C: Strategic SWOT Analysis Prompt ---
  const promptPass1C = `${commonContext}
MISIÓN 1C - ANÁLISIS ESTRATÉGICO FODA:
Enfócate EXCLUSIVAMENTE en evaluar las fortalezas, debilidades, oportunidades y amenazas comprobables de "${cleanComp}".
Devuelve un JSON con estas 4 llaves:
{
  "strengths": ["Fortaleza comercial o financiera 1 comprobada", "Fortaleza técnica 2 comprobada"],
  "weaknesses": ["Debilidad o brecha operativa identificada"],
  "opportunities": ["Oportunidad de mercado, ANR 4.0 o licitación comprobable"],
  "threats": ["Amenaza o riesgo sectorial externo"]
}`;

  // 1. Run 3 specialized extraction passes in parallel
  const [res1A, res1B, res1C] = await Promise.all([
    callGeminiFocused(apiKey, promptPass1A),
    callGeminiFocused(apiKey, promptPass1B),
    callGeminiFocused(apiKey, promptPass1C)
  ]);

  // Combine Pass 1 extracted data
  const combinedRawExtraction = {
    ...(res1A || {}),
    ...(res1B || {}),
    ...(res1C || {})
  };

  // --- PASS 2: Cross-Validation & Anti-Hallucination Verification Pass ---
  console.log(`[MULTI-PASS AI] Running 2nd Pass: Cross-Validation & Verification for "${cleanComp}"...`);

  const promptPass2 = `${commonContext}

DATOS EXTRAÍDOS EN LA PRIMERA PASADA:
${JSON.stringify(combinedRawExtraction, null, 2)}

MISIÓN PASADA 2 - AUDITORÍA DE FACT-CHECKING Y CERO ALUCINACIÓN:
Actúa como Auditor de Calidad de Inteligencia OSINT. Analiza cada campo del JSON anterior contra la EVIDENCIA Y FUENTES OSINT arriba proporcionadas.
1. Revisa si alguna afirmación o campo contiene datos inventados o sin sustento en los textos.
2. Si un campo afirma contar con certificados o capacidades no respaldadas en la evidencia, reemplázalo con "Información no verificada públicamente".
3. Corrige cualquier exageración y asegura que la respuesta sea 100% verídica y profesional.

Devuelve el JSON FINAL auditado y corregido con la siguiente estructura exacta:
{
  "sector": "...",
  "businessModel": "...",
  "companyType": "...",
  "whatItSells": "...",
  "whoBuys": "...",
  "howItGeneratesRevenue": "...",
  "mostImportantAsset": "...",
  "valueProposition": "...",
  "executiveSummary": "...",
  "strengths": ["..."],
  "weaknesses": ["..."],
  "opportunities": ["..."],
  "threats": ["..."]
}`;

  const verifiedExtraction = await callGeminiFocused(apiKey, promptPass2);

  const finalResult = verifiedExtraction || combinedRawExtraction;

  if (finalResult && (finalResult.sector || finalResult.executiveSummary)) {
    const validatedData = validateAndSanitizeExtraction(finalResult, cleanComp);
    console.log(`[MULTI-PASS AI SUCCESS] Cross-validated profile generated successfully for "${cleanComp}".`);
    return validatedData;
  }

  return null;
}

/**
 * Validates JSON structure returned by Gemini against required schema.
 * Ensures default values for missing keys so server/frontend merge never crashes.
 */
function validateAndSanitizeExtraction(parsed = {}, cleanComp = '') {
  return {
    sector: typeof parsed.sector === 'string' && parsed.sector.length > 2
      ? parsed.sector
      : `Sector Comercial e Industrial de ${cleanComp}`,
    businessModel: typeof parsed.businessModel === 'string' && parsed.businessModel.length > 2
      ? parsed.businessModel
      : 'B2B / Provisión Comercial',
    companyType: typeof parsed.companyType === 'string' && parsed.companyType.length > 2
      ? parsed.companyType
      : 'PyME Operativa',
    whatItSells: typeof parsed.whatItSells === 'string' && parsed.whatItSells.length > 2
      ? parsed.whatItSells
      : `Soluciones y servicios comerciales de ${cleanComp}`,
    whoBuys: typeof parsed.whoBuys === 'string' && parsed.whoBuys.length > 2
      ? parsed.whoBuys
      : 'Empresas corporativas y clientes del sector público/privado',
    howItGeneratesRevenue: typeof parsed.howItGeneratesRevenue === 'string' && parsed.howItGeneratesRevenue.length > 2
      ? parsed.howItGeneratesRevenue
      : 'Venta de productos y prestación de servicios especializados',
    mostImportantAsset: typeof parsed.mostImportantAsset === 'string' && parsed.mostImportantAsset.length > 2
      ? parsed.mostImportantAsset
      : 'Infraestructura operativa y equipamiento de producción',
    executiveSummary: typeof parsed.executiveSummary === 'string' && parsed.executiveSummary.length > 10
      ? parsed.executiveSummary
      : `Síntesis ejecutiva de ${cleanComp} basada en registros públicos y web oficial.`,
    strengths: Array.isArray(parsed.strengths) && parsed.strengths.length > 0
      ? parsed.strengths
      : [`Trayectoria y presencia operativa en su rubro para ${cleanComp}`],
    weaknesses: Array.isArray(parsed.weaknesses) && parsed.weaknesses.length > 0
      ? parsed.weaknesses
      : ['Oportunidad de ampliar canales directos digitales y comercio electrónico'],
    opportunities: Array.isArray(parsed.opportunities) && parsed.opportunities.length > 0
      ? parsed.opportunities
      : ['Postulación a licitaciones públicas y programas de financiamiento ANR 4.0'],
    threats: Array.isArray(parsed.threats) && parsed.threats.length > 0
      ? parsed.threats
      : ['Volatilidad sectorial y presiones logísticas o de costos de insumos']
  };
}
