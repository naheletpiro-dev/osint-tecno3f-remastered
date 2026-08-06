import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

/**
 * Strict RAG (Retrieval-Augmented Generation) & Taxonomical AI Extraction Service
 * Uses FULL scraped website context, deep subdirectories & multi-API OSINT feeds.
 * Organizes, categorizes, and classifies all incoming corporate intelligence.
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

  const dynamicSections = (scrapedData.discoveredDynamicSections || []).join(', ');

  const ragContext = `
==================== CONTEXTO DE INTELIGENCIA CORPORATIVA OSINT PARA ${cleanComp.toUpperCase()} ====================
DOMINIO PRINCIPAL: ${website || 'No disponible'}
TÍTULO DEL SITIO: ${title}
DESCRIPCIÓN META CORPORATIVA: ${metaDesc}
SECCIONES DINÁMICAS DESCUBIERTAS AUTOMÁTICAMENTE EN LA WEB: ${dynamicSections || 'Navegación general'}
TEXTO EXTRAÍDO DE SECCIONES INSTITUCIONALES Y DINÁMICAS:
${aboutText}

CONTENIDO WEB MULTINIVEL COMPLETO:
${fullRawText}

PRODUCTOS DETECTADOS EN WEB Y SUBDIRECTORIOS: ${productsList || 'Catálogo a medida B2B'}
SERVICIOS DETECTADOS EN WEB Y SUBDIRECTORIOS: ${servicesList || 'Asistencia técnica y provisión industrial'}
CLIENTES Y SEGMENTOS OBJETIVO DETECTADOS: ${clientsList || 'Empresas corporativas e industriales'}
NOTICIAS Y PRENSA PUBLICADA: ${newsList || 'Sin registros de prensa recientes'}
BOLETINES OFICIALES / LICITACIONES ESTATALES: ${tenderList || gazetteList || searchSnippets}

--- FUENTES OFICIALES DE INTEGRACIONES API Y REGISTROS ESTATALES ---
PADRÓN AFIP / ARCA: ${afipContext}
CENTRAL DE DEUDORES BCRA: ${bcraContext}
INPI / WIPO PROPIEDAD INTELECTUAL: ${inpiContext}
OPENCORPORATES REGISTRO GLOBAL: ${openCorpContext}
COMPR.AR CONTRATACIONES PÚBLICAS: ${contractsContext}
COMERCIO EXTERIOR ADUANA: ${tradeContext}
REGISTRO MiPyME ESTATAL: ${pymeContext}
================================================================================

DIRECTIVAS DE ORGANIZACIÓN, ANÁLISIS Y CLASIFICACIÓN TAXONÓMICA:
1. Sos el Auditor Principal de Inteligencia Empresarial OSINT de Tecno3F. Tu tarea es ORGANIZAR, ANALIZAR Y CATALOGAR con máxima precisión toda la información recibida.
2. CLASIFICACIÓN ESTRICTA:
   - Organiza el sector exacto sin generalidades.
   - Discrimina claramente entre Productos (bienes físicos o software) y Servicios (mecanizado, asistencia, desarrollo, mantenimiento).
   - Identifica activos críticos de planta o infraestructura técnica (ej. centros CNC, curvadoras, servidores cloud, matricería de precisión, licencias CAD/CAM, tanques de acero), NUNCA términos superficiales.
3. CERO ALUCINACIÓN: Toda conclusión debe ser consecuencia directa de los datos escaneados de "${cleanComp}".
4. Responde EXCLUSIVAMENTE en formato JSON válido según la estructura dada.

ESTRUCTURA JSON REQUERIDA Y CATALOGADA:
{
  "sector": "Sector exacto y rubro comercial catalogado de ${cleanComp}",
  "businessModel": "Modelo de negocio verificado (ej: B2B Industrial, B2C, SaaS Telegestión, Manufactura Metalúrgica, Provisión B2B)",
  "companyType": "Tipo y clasificación de empresa (ej: PyME Industrial Metalúrgica, Empresa de Software & IoT, Distribuidora Industrial)",
  "whatItSells": "Catálogo resumido y preciso de lo que vende o provee ${cleanComp}",
  "whoBuys": "Perfil de compradores, clientes corporativos y sectores destino de ${cleanComp}",
  "howItGeneratesRevenue": "Mecanismo principal de generación de ingresos según sus productos/servicios",
  "mostImportantAsset": "Activos críticos concretos de la industria de ${cleanComp} (ej: parque de curvadoras de caños, centros de mecanizado CNC, servidores cloud de alta disponibilidad, matricería de precisión, licencias CAD/CAM)",
  "executiveSummary": "Síntesis ejecutiva de 2 párrafos que organice y sintetice el perfil comercial, solvencia BCRA, capacidad licitatoria y oferta de ${cleanComp}",
  "strengths": ["Fortaleza comercial o financiera 1 comprobada", "Fortaleza técnica 2 comprobada"],
  "weaknesses": ["Debilidad o brecha operativa identificada"],
  "opportunities": ["Oportunidad de mercado, ANR 4.0 o licitación comprobable"],
  "threats": ["Amenaza o riesgo sectorial externo"]
}
`;

  const modelsToTry = ['gemini-2.0-flash', 'gemini-2.5-pro', 'gemini-2.0-flash-lite', 'gemini-1.5-flash'];

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
        console.log(`[TAXONOMICAL RAG SUCCESS] Gemini Model "${modelName}" organized & cataloged profile for "${cleanComp}"`);
        return parsed;
      }
    } catch (err) {
      console.log(`[RAG AI NOTICE] Model ${modelName} notice for "${cleanComp}": ${err.message?.slice(0, 100)}`);
    }
  }

  return null;
}
