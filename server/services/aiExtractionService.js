import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

/**
 * Strict RAG (Retrieval-Augmented Generation) AI Extraction Service
 * Uses FULL scraped website context & search snippets.
 * Strictly forbidden from hallucinating or defaulting to templates.
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
  const aboutText = (scrapedData.aboutUs || scrapedData.valueProposition || '').slice(0, 2000);
  const fullRawText = (scrapedData.fullText || '').slice(0, 3500);
  const productsList = (scrapedData.products || []).slice(0, 10).join('; ');
  const servicesList = (scrapedData.services || []).slice(0, 10).join('; ');
  const clientsList = (scrapedData.clients || []).slice(0, 5).join('; ');
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

  const ragContext = `
==================== RAG GROUNDING CONTEXT FOR ${cleanComp.toUpperCase()} ====================
DOMINIO / SITIO WEB: ${website || 'No disponible'}
TÍTULO DEL SITIO: ${title}
DESCRIPCIÓN META: ${metaDesc}
SOBRE LA EMPRESA / HISTORIA: ${aboutText}
TEXTO COMPLETO DEL SITIO WEB: ${fullRawText}
PRODUCTOS DETECTADOS EN WEB: ${productsList || 'Ninguno detectado'}
SERVICIOS DETECTADOS EN WEB: ${servicesList || 'Ninguno detectado'}
CLIENTES / SECTORES DETECTADOS: ${clientsList || 'Ninguno detectado'}
NOTICIAS PERIODÍSTICAS RECIENTES: ${newsList || 'Sin noticias recientes'}

--- DATOS OFICIALES DE INTEGRACIONES API OSINT ---
PADRÓN AFIP / ARCA: ${afipContext}
CENTRAL DE DEUDORES BCRA: ${bcraContext}
INPI / WIPO PROPIEDAD INTELECTUAL: ${inpiContext}
OPENCORPORATES REGISTRO GLOBAL: ${openCorpContext}
COMPR.AR CONTRATACIONES PÚBLICAS: ${contractsContext}
COMERCIO EXTERIOR ADUANA: ${tradeContext}
REGISTRO MiPyME ESTATAL: ${pymeContext}
================================================================================

DIRECTIVAS STRICT-RAG (ZERO HALLUCINATION):
1. Sos un auditor OSINT estricto. Tu única fuente de verdad es el RAG GROUNDING CONTEXT provisto arriba.
2. NUNCA menciones empresas ajenas, ni uses descripciones de plantilla.
3. Si un dato no se encuentra en el texto proporcionado, responde exactamente "Información no verificada públicamente".
4. Toda afirmación debe estar 100% justificada por los datos escaneados de "${cleanComp}".
5. Responde EXCLUSIVAMENTE en formato JSON válido según la estructura dada.

ESTRUCTURA JSON REQUERIDA:
{
  "sector": "Sector exacto o rubro comercial verificado de ${cleanComp}",
  "businessModel": "Modelo de negocio (ej: B2B, B2C, SaaS, Manufactura Industrial, Servicios Profesionales)",
  "companyType": "Tipo de empresa (ej: PyME Industrial, Empresa de Software, Distribuidora Mayorista)",
  "whatItSells": "Qué vende o provee exactamente ${cleanComp} según la información extraída",
  "whoBuys": "Quiénes son los compradores o clientes de ${cleanComp} verificados en su texto web o padrón",
  "howItGeneratesRevenue": "Cómo genera ingresos ${cleanComp} según sus productos/servicios",
  "mostImportantAsset": "El principal activo, servicio o diferenciador verificado de ${cleanComp}",
  "executiveSummary": "Síntesis ejecutiva de 2 párrafos basada 100% en los hechos extraídos y datos oficiales de AFIP, BCRA, INPI y Compr.ar para ${cleanComp}",
  "strengths": ["Fortaleza real 1 verificada en el texto", "Fortaleza real 2 verificada"],
  "weaknesses": ["Debilidad o brecha identificada"],
  "opportunities": ["Oportunidad de mercado o licitación comprobable"],
  "threats": ["Amenaza o riesgo de su sector"]
}
`;

  const modelsToTry = ['gemini-3.6-flash', 'gemini-flash-latest', 'gemini-2.0-flash'];

  for (const modelName of modelsToTry) {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: modelName,
        contents: ragContext,
        config: {
          responseMimeType: 'application/json'
        }
      });

      if (response && response.text) {
        const parsed = JSON.parse(response.text);
        console.log(`[RAG AI SUCCESS] Gemini Model "${modelName}" generated grounded synthesis for "${cleanComp}"`);
        return parsed;
      }
    } catch (err) {
      console.log(`[RAG AI NOTICE] Model ${modelName} notice: ${err.message?.slice(0, 120)}`);
    }
  }

  return null;
}
