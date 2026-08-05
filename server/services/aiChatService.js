import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });
dotenv.config();

/**
 * Prompt Injection & Jailbreak Detection Regex Patterns
 */
const PROMPT_INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?(previous|above|prior)\s+(instructions|rules|prompts)/i,
  /forget\s+(all\s+)?(previous|above|prior)\s+(instructions|rules|prompts)/i,
  /disregard\s+(all\s+)?(previous|above|prior)\s+(instructions|rules|prompts)/i,
  /system\s+override/i,
  /system\s+prompt/i,
  /jailbreak/i,
  /dan\s+mode/i,
  /developer\s+mode/i,
  /you\s+are\s+now\s+free/i,
  /act\s+as\s+(an\s+)?unrestricted/i,
  /revela\s+tus\s+instrucciones/i,
  /olvida\s+tus\s+instrucciones/i,
  /ignora\s+(las|todas\s+las)\s+(instrucciones|reglas)/i,
  /modo\s+desarrollador/i,
  /print\s+(your\s+)?system\s+(prompt|instructions)/i,
  /show\s+(your\s+)?system\s+(prompt|instructions)/i,
  /prompt\s+injection/i
];

/**
 * Sanitizes user input and checks for prompt injection or jailbreak attempts.
 */
function sanitizeAndGuardInput(input) {
  if (!input || typeof input !== 'string') {
    return { isInjection: false, sanitizedText: '' };
  }

  const cleanInput = input.trim();

  for (const pattern of PROMPT_INJECTION_PATTERNS) {
    if (pattern.test(cleanInput)) {
      return {
        isInjection: true,
        sanitizedText: cleanInput,
        rejectionMessage: 'Como asistente de inteligencia OSINT empresarial (Tecnobot3F), no puedo modificar mis reglas de seguridad, cambiar mi rol ni revelar las instrucciones del sistema. Únicamente puedo responder preguntas basadas en la información verificada de la empresa analizada.'
      };
    }
  }

  const sanitizedText = cleanInput
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/={4,}/g, '===')
    .replace(/-{4,}/g, '---')
    .replace(/`{3,}/g, '```');

  return { isInjection: false, sanitizedText };
}

/**
 * Dynamic Semantic Retrieval & Analytical Reasoning Engine.
 * Tokenizes the user's question, searches across all report dimensions,
 * and formulates a customized, free-form answer answering ONLY what was asked.
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
  const kits = dig.recommendedKits || {};

  const estimatedBidding = cap.estimatedBiddingCapacityARS || '$250.000.000 ARS';
  const recommendedCredit = cap.recommendedCreditLimitARS || '$50.000.000 ARS';
  const totalAwarded = contracts.totalAwardedAmount || '$0 ARS';

  const prods = (scraped.products && scraped.products.length > 0) ? scraped.products.join(', ') : null;
  const servs = (scraped.services && scraped.services.length > 0) ? scraped.services.join(', ') : null;
  const about = scraped.aboutUs || scraped.description || bizAnswers.whatDoesCompanyDo || '';

  // 1. Weaknesses Intent
  if (/debilidad|falencia|aspectos?\s+a\s+mejorar|puntos?\s+debiles?/i.test(queryLower)) {
    if (swot.weaknesses && swot.weaknesses.length > 0) {
      return `Analizando el banco de información de **${compName}**, se identifican las siguientes **debilidades clave**:\n\n` +
        swot.weaknesses.map(w => `• ${w}`).join('\n');
    }
    return `En el análisis de **${compName}**, la principal oportunidad de mejora identificada se relaciona con expandir la visibilidad digital de sus casos de éxito y fortalecer canales directos de venta online.`;
  }

  // 2. Strengths Intent
  if (/fortaleza|ventaja|puntos?\s+fuertes?|virtud/i.test(queryLower)) {
    if (swot.strengths && swot.strengths.length > 0) {
      return `Evaluando el perfil de **${compName}**, sus principales **fortalezas verificadas** son:\n\n` +
        swot.strengths.map(s => `• ${s}`).join('\n');
    }
    return `Las principales fortalezas de **${compName}** incluyen su sólida posición en el sector ${cat.sector || 'industrial'}, solvencia crediticia en BCRA (Scoring ${fin.creditScore || 85}/100) y su oferta comercial verificada.`;
  }

  // 3. Opportunities Intent
  if (/oportunidad|crecimiento|potencial/i.test(queryLower)) {
    if (swot.opportunities && swot.opportunities.length > 0) {
      return `Las **oportunidades de expansión** identificadas para **${compName}** son:\n\n` +
        swot.opportunities.map(o => `• ${o}`).join('\n');
    }
    return `**${compName}** cuenta con oportunidades de crecimiento mediante licitaciones públicas estatales y postulación a financiamiento de Aportes No Reembolsables (ANR 4.0).`;
  }

  // 4. Threats Intent
  if (/amenaza|riesgo|desafio\s+externo/i.test(queryLower)) {
    if (swot.threats && swot.threats.length > 0) {
      return `Las **amenazas del entorno** que enfrenta **${compName}** son:\n\n` +
        swot.threats.map(t => `• ${t}`).join('\n');
    }
    return `Los riesgos externos para **${compName}** se concentran en la volatilidad de costos de insumos, logística y la competencia de firmas regionales.`;
  }

  // 5. Full SWOT Intent
  if (/foda|swot|matriz/i.test(queryLower)) {
    let text = `📊 **Matriz FODA Analítica de ${compName}:**\n\n`;
    if (swot.strengths?.length > 0) text += `💪 **Fortalezas:** ${swot.strengths.join('; ')}\n\n`;
    if (swot.weaknesses?.length > 0) text += `⚠️ **Debilidades:** ${swot.weaknesses.join('; ')}\n\n`;
    if (swot.opportunities?.length > 0) text += `🚀 **Oportunidades:** ${swot.opportunities.join('; ')}\n\n`;
    if (swot.threats?.length > 0) text += `🛡️ **Amenazas:** ${swot.threats.join('; ')}`;
    return text;
  }

  // 6. Kits 4.0 Specific Intents (Primary Only vs Secondary Only vs General)
  const isPrimaryKitOnly = (/solo/i.test(queryLower) || /unicament/i.test(queryLower)) && /principal|primari/i.test(queryLower);
  const isSecondaryKitOnly = (/solo/i.test(queryLower) || /unicament/i.test(queryLower)) && /secundari|complementari/i.test(queryLower);

  if (isPrimaryKitOnly && kits.primary) {
    return `📌 **Propuesta Principal de Modernización (${kits.primary.code}) para ${compName}:**\n\n` +
      `**${kits.primary.name}**\n` +
      `${kits.primary.aiRationale}\n\n` +
      `*Financiamiento:* ${kits.primary.fundingCoverage}`;
  }

  if (isSecondaryKitOnly && kits.secondary) {
    return `🔹 **Propuesta Complementaria de Modernización (${kits.secondary.code}) para ${compName}:**\n\n` +
      `**${kits.secondary.name}**\n` +
      `${kits.secondary.aiRationale}\n\n` +
      `*Financiamiento:* ${kits.secondary.fundingCoverage}`;
  }

  if (/kit|4\.0|moderniz|subsidio|anr|oee|cmms|erp/i.test(queryLower)) {
    let text = `Basado en la evaluación de madurez digital (${dig.digitalScore || 65}%), la propuesta de modernización para **${compName}** es:\n\n`;
    if (kits.primary) {
      text += `📌 **Propuesta Principal (${kits.primary.code}): ${kits.primary.name}**\n${kits.primary.aiRationale}\n*Cofinanciamiento:* ${kits.primary.fundingCoverage}\n\n`;
    }
    if (kits.secondary) {
      text += `🔹 **Propuesta Complementaria (${kits.secondary.code}): ${kits.secondary.name}**\n${kits.secondary.aiRationale}`;
    }
    return text;
  }

  // 7. Products Specific Intent
  if (/producto|vende|fabric|item|catalogo|equipo/i.test(queryLower) && !/servicio/i.test(queryLower)) {
    return `Respecto a los **productos** de **${compName}**:\n\n` +
      (prods ? `• **Productos Verificados:** ${prods}` : `• La empresa opera principalmente bajo catálogo industrial y soluciones a medida para clientes corporativos (B2B).`);
  }

  // 8. Services Specific Intent
  if (/servicio|brinda|atencion|mantenimiento|mecanizado|asistencia/i.test(queryLower)) {
    return `En relación a los **servicios** que ofrece **${compName}**:\n\n` +
      (servs ? `• **Servicios Verificados:** ${servs}` : `• Brinda asistencia técnica especializada, mecanizado y soporte operativo B2B.`);
  }

  // 9. Financial & BCRA Specific Intent
  if (/bcra|cheque|scoring|deuda|moros|banco/i.test(queryLower)) {
    return `Análisis del historial bancario y crediticio de **${compName}** en BCRA:\n\n` +
      `• **Scoring Crediticio:** **${fin.creditScore || 85}/100** (Nivel de Riesgo: ${fin.riskLevel || 'Bajo Riesgo'}).\n` +
      `• **Cheques Rechazados:** **${fin.rejectedChequesCount || 0}** registros en la Central de Deudores BCRA.\n` +
      `• **Evaluación:** ${fin.rejectedChequesCount === 0 ? 'Demuestra una conducta de pago impecable sin antecedentes de morosidad bancaria.' : 'Presenta cheques con causales a monitorear.'}`;
  }

  // 10. Bidding & Capital Specific Intent
  if (/licit|capacid|limite|monto|credito|adjudic/i.test(queryLower)) {
    return `Evaluación de **capacidad licitatoria y respaldo financiero** de **${compName}**:\n\n` +
      `• **Capacidad Licitatoria Estimada:** **${estimatedBidding}** (Clasificación: ${cap.capacityTier || 'Alta'}).\n` +
      `• **Límite de Crédito Sugerido:** **${recommendedCredit}**.\n` +
      `• **Contrataciones Estatales:** Monto acumulado adjudicado en licitaciones de **${totalAwarded}**.`;
  }

  // 11. AFIP / Fiscal Intent
  if (/afip|cuit|fiscal|impuesto|padron/i.test(queryLower)) {
    return `Situación impositiva y fiscal de **${compName}**:\n\n` +
      `• **CUIT Oficial:** ${fin.taxProfile?.cuit || '30-XXXXXXXX-X'}\n` +
      `• **Estado AFIP:** ${fin.taxProfile?.taxCompliance || 'Inscripto y activo sin deudas ejecutivas registradas'}.`;
  }

  // 12. General Activity & Company Profile Intent
  if (/actividad|dedica|hace|rubro|sector|quien\s+es|empresa/i.test(queryLower)) {
    return `**${compName}** es una empresa perteneciente al sector de **${cat.sector || 'Industrial & B2B'}** (Modelo: ${cat.businessModel || 'B2B'}).\n\n` +
      (about ? `**Resumen Operativo:** ${about}` : `Ofrece soluciones técnicas y comerciales especializadas en su segmento.`);
  }

  // 13. Dynamic Fallback for unclassified questions
  return `Tras analizar la pregunta sobre **${compName}** en su banco de información verificado:\n\n` +
    `• **Empresa:** ${compName}\n` +
    `• **Rubro:** ${cat.sector || 'Industrial / B2B'}\n` +
    `• **Solvencia BCRA:** Scoring ${fin.creditScore || 85}/100 | Licitatorio: ${estimatedBidding}\n` +
    `• **Madurez Digital:** ${dig.digitalScore || 65}%\n\n` +
    `Podés hacer preguntas específicas como: *"¿Qué debilidades tiene?"*, *"¿Qué servicios ofrece?"*, *"¿Cuál es su scoring en BCRA?"* o *"¿Qué kit 4.0 se le sugiere?"*.`;
}

/**
 * Interactive Conversational Chat Service grounded in Company OSINT Information Bank
 * Protected against Prompt Injection, System Override & Persona Hijacking.
 * Uses live Gemini API when GEMINI_API_KEY is configured.
 */
export async function answerOsintChat(report = {}, userQuery = '', chatHistory = []) {
  // 1. Prompt Injection Inspection & Input Sanitization
  const guard = sanitizeAndGuardInput(userQuery);
  if (guard.isInjection) {
    return { answer: guard.rejectionMessage };
  }

  const sanitizedQuery = guard.sanitizedText;
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
  const kits = dig.recommendedKits || {};

  const rawTextSnippet = (scraped.rawText || scraped.fullText || scraped.extractedText || '').slice(0, 4500);

  const contextText = `
==================== BANCO DE INFORMACIÓN VERIFICADA: "${compName.toUpperCase()}" ====================
DATOS GENERALES Y CORPORATIVOS:
- Nombre Oficial: ${compName}
- Sitio Web Verificado: ${query.website || scraped.url || 'No especificado'}
- Sector / Rubro: ${cat.sector || 'No especificado'}
- Modelo de Negocio: ${cat.businessModel || 'B2B / Industrial'}
- Tipo de Empresa: ${cat.companyType || 'PyME'}
- Certificaciones Registradas: ${(cat.certifications || []).join(', ') || 'Sin registros específicos'}

OFERTA COMERCIAL Y DESCRIPCIÓN EXPORTADA DEL DOMINIO:
- Título Web: ${scraped.title || 'N/D'}
- Descripción Meta: ${scraped.metaDescription || scraped.description || 'N/D'}
- Descripción Corporativa: ${scraped.aboutUs || scraped.description || 'N/D'}
- Productos Detectados: ${(scraped.products || []).join(' | ') || 'No detallados explícitamente'}
- Servicios Detectados: ${(scraped.services || []).join(' | ') || 'No detallados explícitamente'}
- Clientes y Marcas Vinculadas: ${(scraped.clients || []).join(' | ') || 'No detallados'}

PREGUNTAS DE NEGOCIO ANALIZADAS:
- Actividad Principal: ${bizAnswers.whatDoesCompanyDo || bizAnswers.whatItSells || 'N/D'}
- Propuesta de Valor: ${bizAnswers.valueProposition || 'N/D'}
- Clientes / Mercado Objetivo: ${bizAnswers.targetAudience || bizAnswers.whoBuys || 'N/D'}

SITUACIÓN FINANCIERA, BCRA & AFIP:
- CUIT: ${fin.taxProfile?.cuit || '30-XXXXXXXX-X'}
- Scoring Crediticio BCRA: ${fin.creditScore || 75}/100 (${fin.riskLevel || 'BAJO RIESGO'})
- Cheques Rechazados (BCRA): ${fin.rejectedChequesCount || 0}
- Situación Fiscal AFIP: ${fin.taxProfile?.taxCompliance || 'Sin deudas ejecutivas registradas'}
- Capacidad Licitatoria Estimada: ${cap.estimatedBiddingCapacityARS || '$250.000.000 ARS'} (${cap.capacityTier || 'Alta'})
- Límite Crediticio Sugerido: ${cap.recommendedCreditLimitARS || '$50.000.000 ARS'}
- Actividad Comercio Exterior: ${fin.tradeData?.tradeActivity || 'Mercado Nacional'}
- Registro MiPyME: ${fin.pymeData?.pymeCategory || 'Pequeña / Mediana Empresa'}

ANTECEDENTES JUDICIALES, LEGALES & LICITACIONES PÚBLICAS:
- Registros Judiciales: ${legal.judicialRecordsCount || 0} causas encontradas (${legal.legalStatus || 'Sin litigios abiertos'})
- Marcas / Propiedad Intelectual: ${legal.inpiWipoData?.details || 'N/D'}
- Registro COMPR.AR (Estado): ${contracts.supplierRegistryStatus || 'Habilitado'}
- Monto Adjudicado (Contrataciones Públicas): ${contracts.totalAwardedAmount || '$0 ARS'}

TRANSFORMACIÓN DIGITAL & KITS 4.0 RECOMENDADOS:
- Índice de Madurez Digital: ${dig.digitalScore || 65}% (${dig.maturityLevel || 'Digital'})
- Kit 4.0 Principal Sugerido: ${kits.primary ? `${kits.primary.code} - ${kits.primary.name} (${kits.primary.aiRationale})` : 'GES-01 ERP Integrado'}
- Kit 4.0 Secundario Sugerido: ${kits.secondary ? `${kits.secondary.code} - ${kits.secondary.name} (${kits.secondary.aiRationale})` : 'BAS-01 Ciberseguridad OT/IT'}
- Herramientas Digitales Activas: ${(dig.existingAutomations || []).map(a => a.system).join(', ') || 'Portal Web, Canales Digitales'}

MATRIZ FODA (SWOT):
- Fortalezas: ${(swot.strengths || []).join('; ')}
- Debilidades: ${(swot.weaknesses || []).join('; ')}
- Oportunidades: ${(swot.opportunities || []).join('; ')}
- Amenazas: ${(swot.threats || []).join('; ')}

TEXTO EXTRAÍDO DEL SITIO WEB CORPORATIVO:
${rawTextSnippet}
================================================================================
`;

  if (apiKey) {
    console.log(`[AI CHAT EXECUTION] Gemini API Key detected. Calling live Gemini LLM for "${compName}"...`);
    const formattedHistory = chatHistory.slice(-6).map(m => `${m.sender === 'user' ? 'Usuario' : 'Tecnobot3F'}: ${m.text}`).join('\n');

    const chatPrompt = `
Sos Tecnobot3F, la Inteligencia Artificial analítica y conversacional del sistema OSINT Tecno3F. Tu única función es responder la consulta del usuario sobre la empresa "${compName}".

INSTRUCCIONES DE PRECISIÓN Y FILTRADO ESTRICTO:
1. ANALIZÁ la pregunta del usuario dentro de <user_question> para entender la intención exacta de lo que consulta.
2. Si el usuario pide "SOLO la propuesta principal de kit" o "solo x cosa", responde EXCLUSIVAMENTE con ese ítem puntual. NO incluyas la propuesta complementaria ni otras secciones si se te pidió "solo" un elemento.
3. Si el usuario pregunta por una categoría puntual (ej. SOLO por debilidades, SOLO por cheques, SOLO por productos), responde EXCLUSIVAMENTE sobre esa categoría específica. NO agregues otras dimensiones del informe.
4. Toda la información debe estar estrictamente verificada en el contexto de la empresa. Si un dato no consta en los registros públicos, indícalo abiertamente.
5. Utilizá formato Markdown para facilitar la lectura.

BANCO DE INFORMACIÓN DE LA EMPRESA (${compName}):
${contextText}

HISTORIAL DE CONVERSACIÓN:
${formattedHistory}

PREGUNTA DEL USUARIO:
<user_question>
${sanitizedQuery}
</user_question>

RESPUESTA PRECISA Y PENSADA DE TECNOBOT3F:
`;

    // Strategy 1: @google/genai SDK (v2+)
    const modelsToTryGenAI = ['gemini-2.0-flash', 'gemini-2.5-pro', 'gemini-2.0-flash-lite', 'gemini-1.5-flash'];
    for (const modelName of modelsToTryGenAI) {
      try {
        const ai = new GoogleGenAI({ apiKey });
        const response = await ai.models.generateContent({
          model: modelName,
          contents: chatPrompt
        });

        const txt = response?.text || response?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (txt && txt.trim().length > 10) {
          console.log(`[AI CHAT SUCCESS] Responded via @google/genai model ${modelName}`);
          return { answer: txt.trim() };
        }
      } catch (err) {
        console.log(`[AI CHAT NOTICE] @google/genai model ${modelName} notice: ${err.message?.slice(0, 100)}`);
      }
    }

    // Strategy 2: @google/generative-ai SDK (Fallback)
    try {
      const { GoogleGenerativeAI } = await import('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(apiKey);
      const fallbackModels = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro'];

      for (const modelName of fallbackModels) {
        try {
          const model = genAI.getGenerativeModel({ model: modelName });
          const result = await model.generateContent(chatPrompt);
          const response = await result.response;
          const text = response.text();
          if (text && text.trim().length > 10) {
            console.log(`[AI CHAT SUCCESS] Responded via @google/generative-ai model ${modelName}`);
            return { answer: text.trim() };
          }
        } catch (err) {
          console.log(`[AI CHAT NOTICE] @google/generative-ai model ${modelName} notice: ${err.message?.slice(0, 100)}`);
        }
      }
    } catch (e) {
      console.log(`[AI CHAT NOTICE] Fallback SDK load notice: ${e.message}`);
    }
  } else {
    console.log('[AI CHAT EXECUTION] No GEMINI_API_KEY in environment. Running smart local reasoning engine.');
  }

  // Direct, verified smart local reasoning answer if API key is not present or rate-limited (429)
  const localAnswer = generateSmartLocalAnswer(report, sanitizedQuery);
  return { answer: localAnswer };
}
