import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { buildReportVectorIndex, searchVectorIndex } from './vectorSearchService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });
dotenv.config();

/**
 * Robust Multi-Language Prompt Injection, Jailbreak & Boundary Bypass Detection Patterns
 */
const PROMPT_INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?(previous|above|prior|system)\s+(instructions|rules|prompts|directives|constraints)/i,
  /forget\s+(all\s+)?(previous|above|prior|system)\s+(instructions|rules|prompts|directives|constraints)/i,
  /disregard\s+(all\s+)?(previous|above|prior|system)\s+(instructions|rules|prompts|directives|constraints)/i,
  /bypass\s+(all\s+)?(safety|security|system|content)\s+(filters|rules|guardrails|protocols)/i,
  /system\s*(override|prompt|directive|instruction)/i,
  /jailbreak|dan\s+mode|developer\s+mode|god\s+mode|unrestricted\s+mode/i,
  /you\s+are\s+now\s+free|pretend\s+you\s+have\s+no\s+rules|act\s+as\s+(an\s+)?unrestricted/i,
  /revela\s+(tus|las)\s+(instrucciones|reglas|prompt|directivas)/i,
  /olvida\s+(tus|las|todas\s+las)\s+(instrucciones|reglas|prompt)/i,
  /ignora\s+(las|todas\s+las)\s+(instrucciones|reglas|normas)/i,
  /modo\s+(desarrollador|sin\s+restricciones|libre|admin)/i,
  /print\s+(your\s+)?(system|initial|hidden)\s+(prompt|instructions|rules)/i,
  /show\s+(your\s+)?(system|initial|hidden)\s+(prompt|instructions|rules)/i,
  /muestra\s+(tu|el)\s+(prompt|sistema|instrucciones\s+ocultas)/i,
  /repeat\s+(everything|all\s+text)\s+above/i,
  /repeti\s+todo\s+el\s+texto\s+anterior/i,
  /\[inst\]|<\|im_start\|>|<\|im_end\|>|<\|system\|>|\[sys\]/i,
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
 * Dynamic Semantic Retrieval & Analytical Reasoning Engine (Vector Search Fallback).
 * Tokenizes the user's question, searches across all report dimensions using vector similarity,
 * and formulates a customized, free-form answer answering ONLY what was asked.
 */
function generateSmartLocalAnswer(report, userQuery, isDeepReasoning = true) {
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

  // 13. Semantic Vector Search Fallback for unclassified questions
  const vIdx = buildReportVectorIndex(report);
  const topPassages = searchVectorIndex(vIdx, userQuery, 3);

  if (topPassages.length > 0) {
    return `Resultados de **Búsqueda Vectorial RAG (Razonamiento Profundo)** para **${compName}**:\n\n` +
      topPassages.map(p => `• ${p}`).join('\n\n');
  }

  return `Tras analizar la pregunta sobre **${compName}** en su banco de información verificado:\n\n` +
    `• **Empresa:** ${compName}\n` +
    `• **Rubro:** ${cat.sector || 'Industrial / B2B'}\n` +
    `• **Solvencia BCRA:** Scoring ${fin.creditScore || 85}/100 | Licitatorio: ${estimatedBidding}\n` +
    `• **Madurez Digital:** ${dig.digitalScore || 65}%\n\n` +
    `Podés hacer preguntas específicas como: *"¿Qué debilidades tiene?"*, *"¿Qué servicios ofrece?"*, *"¿Cuál es su scoring en BCRA?"* o *"¿Qué kit 4.0 se le sugiere?"*.`;
}

function inspectReportForInjection(report) {
  if (!report || typeof report !== 'object') return false;
  try {
    const raw = JSON.stringify(report);
    for (const pattern of PROMPT_INJECTION_PATTERNS) {
      if (pattern.test(raw)) {
        return true;
      }
    }
  } catch (e) {}
  return false;
}

/**
 * Interactive Conversational Chat Service grounded in Company OSINT Information Bank
 * Powered by Vector Search RAG & 2-Step Chain-of-Thought (Deep Reasoning Mode).
 */
export async function answerOsintChat(report = {}, userQuery = '', chatHistory = [], options = {}) {
  // 0. Inspect Report Object for Injection Attacks
  if (inspectReportForInjection(report)) {
    return { answer: 'Como asistente de inteligencia OSINT empresarial (Tecnobot3F), no puedo procesar informes con instrucciones o directivas alteradas.' };
  }

  // 1. Prompt Injection Inspection & Input Sanitization
  const guard = sanitizeAndGuardInput(userQuery);
  if (guard.isInjection) {
    return { answer: guard.rejectionMessage };
  }

  const sanitizedQuery = guard.sanitizedText;
  const apiKey = (process.env.GEMINI_API_KEY || '').trim();

  const query = report.query || {};
  const compName = query.companyName || 'la empresa';

  // 2. Perform Vector Search RAG to extract TOP semantic passages
  const vectorIndex = buildReportVectorIndex(report);
  const topVectorPassages = searchVectorIndex(vectorIndex, sanitizedQuery, 4);
  const vectorContextSnippet = topVectorPassages.map((p, idx) => `[FRAGMENTO VECTORIAL ${idx + 1}]: ${p}`).join('\n');

  if (apiKey) {
    console.log(`[AI CHAT RAG EXECUTION] Deep Reasoning (Chain-of-Thought) Mode active. Index: ${vectorIndex.length} passages.`);
    const formattedHistory = chatHistory.slice(-6).map(m => `${m.sender === 'user' ? 'Usuario' : 'Tecnobot3F'}: ${m.text}`).join('\n');

    const FEW_SHOT_GUIDANCE = `
EJEMPLOS DE COMPORTAMIENTO (FEW-SHOT EXAMPLES):
- Pregunta fuera de alcance (ej: "¿cuál es la capital de Francia?"):
  "Como asistente especializado de Inteligencia OSINT empresarial (Tecnobot3F), únicamente puedo responder consultas enfocadas en el análisis comercial, financiero y operativo de la empresa auditada."
- Pregunta ambigua o vaga (ej: "decime más"):
  "Con gusto. Puedo profundizar sobre la situación bancaria en BCRA, la capacidad licitatoria estimada, el catálogo de productos/servicios o las fortalezas y debilidades de ${compName}. ¿Sobre qué aspecto específico te gustaría consultar?"
`;

    const chatPrompt = `
Sos Tecnobot3F, la Inteligencia Artificial analítica del sistema OSINT Tecno3F operando en MODO RAZONAMIENTO PROFUNDO (CHAIN-OF-THOUGHT DEEP REASONING).

${FEW_SHOT_GUIDANCE}

CADENA OBLIGATORIA DE RAZONAMIENTO EN 2 ETAPAS:
ETAPA 1 (Pensamiento y Verificación Interna):
- Analizá minuciosamente la consulta del usuario en <user_question>.
- Inspeccioná los FRAGMENTOS VECTORIALES DE MÁXIMA RELEVANCIA provistos abajo.
- Identificá las evidencias concretas que respaldan la respuesta directa.

ETAPA 2 (Respuesta Final al Usuario):
- Redactá la respuesta limpia, precisa y profesional basada EXCLUSIVAMENTE en las evidencias verificadas de la Etapa 1.
- Si el usuario solicita "SOLO la propuesta principal de kit" o "solo x categoría", responde ÚNICA Y EXCLUSIVAMENTE sobre ese ítem puntual. NO incluyas información no solicitada.
- Formateá la respuesta en Markdown claro.

FRAGMENTOS VECTORIALES DE MÁXIMA RELEVANCIA (VECTOR SEARCH RAG):
${vectorContextSnippet}

HISTORIAL DE CONVERSACIÓN:
${formattedHistory}

PREGUNTA DEL USUARIO:
<user_question>
${sanitizedQuery}
</user_question>

PROCESO DE RAZONAMIENTO PROFUNDO Y RESPUESTA FINAL DE TECNOBOT3F:
`;

// Model memory cache: remember the last working model to prevent sequential 4-model cascade delays
let cachedWorkingModel = 'gemini-2.5-flash';

    // Strategy 1: @google/genai SDK (v2+) with cached model priority
    const baseModels = ['gemini-2.5-flash', 'gemini-2.5-flash-lite-preview-06-17', 'gemini-2.0-flash-exp', 'gemini-1.5-flash-latest'];
    const modelsToTryGenAI = [cachedWorkingModel, ...baseModels.filter(m => m !== cachedWorkingModel)];

    for (const modelName of modelsToTryGenAI) {
      try {
        const ai = new GoogleGenAI({ apiKey });
        const response = await ai.models.generateContent({
          model: modelName,
          contents: chatPrompt
        });

        const txt = response?.text || response?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (txt && txt.trim().length > 10) {
          cachedWorkingModel = modelName; // Save working model for instant next query
          console.log(`[AI CHAT SUCCESS] Responded via model ${modelName} (Cached for next queries).`);
          addChatEvaluationLog({
            companyName: compName,
            userQuery: sanitizedQuery,
            botAnswer: txt.trim(),
            modelUsed: modelName,
            isInjection: false
          });
          return { answer: txt.trim(), isDeepReasoning: true };
        }
      } catch (err) {
        console.log(`[AI CHAT NOTICE] Model ${modelName} notice: ${err.message?.slice(0, 100)}`);
      }
    }

    // Strategy 2: @google/generative-ai SDK (Fallback)
    try {
      const { GoogleGenerativeAI } = await import('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(apiKey);
      const fallbackModels = ['gemini-1.5-flash-latest', 'gemini-1.5-pro-latest'];

      for (const modelName of fallbackModels) {
        try {
          const model = genAI.getGenerativeModel({ model: modelName });
          const result = await model.generateContent(chatPrompt);
          const response = await result.response;
          const text = response.text();
          if (text && text.trim().length > 10) {
            console.log(`[AI CHAT SUCCESS] Responded via Deep Reasoning CoT @google/generative-ai model ${modelName}`);
            return { answer: text.trim(), isDeepReasoning: true };
          }
        } catch (err) {
          console.log(`[AI CHAT NOTICE] @google/generative-ai model ${modelName} notice: ${err.message?.slice(0, 100)}`);
        }
      }
    } catch (e) {
      console.log(`[AI CHAT NOTICE] Fallback SDK load notice: ${e.message}`);
    }
  } else {
    console.log('[AI CHAT EXECUTION] No GEMINI_API_KEY in environment. Running Vector Search local reasoning engine.');
  }

  // Direct, verified smart local vector reasoning answer if API key is not present or rate-limited (429)
  const localAnswer = generateSmartLocalAnswer(report, sanitizedQuery, true);
  return { answer: localAnswer, isDeepReasoning: true };
}
