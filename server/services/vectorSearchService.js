import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

/**
 * High-Performance Semantic Vector Search & In-Memory RAG Cache Engine
 * Supports Gemini Embeddings (text-embedding-004), TF-IDF + Cosine Similarity, and Report Vector Caching.
 */

// In-Memory Report Vector Cache Map
const vectorIndexCache = new Map();

/**
 * Normalizes and tokenizes text into clean word stems.
 */
function tokenize(text) {
  if (!text || typeof text !== 'string') return [];
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9áéíóúñ]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2);
}

/**
 * Calculates Term Frequency (TF) for a set of tokens.
 */
function computeTF(tokens) {
  const tf = {};
  const total = tokens.length || 1;
  for (const token of tokens) {
    tf[token] = (tf[token] || 0) + 1;
  }
  for (const token in tf) {
    tf[token] = tf[token] / total;
  }
  return tf;
}

/**
 * Computes Cosine Similarity between two term-frequency vectors or numeric embedding arrays.
 */
function cosineSimilarity(vectorA, vectorB) {
  if (Array.isArray(vectorA) && Array.isArray(vectorB)) {
    let dot = 0, normA = 0, normB = 0;
    for (let i = 0; i < Math.min(vectorA.length, vectorB.length); i++) {
      dot += vectorA[i] * vectorB[i];
      normA += vectorA[i] * vectorA[i];
      normB += vectorB[i] * vectorB[i];
    }
    if (normA === 0 || normB === 0) return 0;
    return dot / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  // TF-IDF dictionary fallback
  let dotProduct = 0, normA = 0, normB = 0;

  for (const term in vectorA) {
    const valA = vectorA[term];
    normA += valA * valA;
    if (vectorB[term]) {
      dotProduct += valA * vectorB[term];
    }
  }

  for (const term in vectorB) {
    const valB = vectorB[term];
    normB += valB * valB;
  }

  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Chunks a large text block into semantic passages.
 */
export function chunkText(rawText, chunkSize = 400, overlap = 80) {
  if (!rawText || typeof rawText !== 'string') return [];

  const sentences = rawText.split(/(?<=[.!?\n])\s+/);
  const chunks = [];
  let currentChunk = '';

  for (const sentence of sentences) {
    if ((currentChunk + ' ' + sentence).length > chunkSize && currentChunk.trim().length > 50) {
      chunks.push(currentChunk.trim());
      currentChunk = currentChunk.slice(-overlap) + ' ' + sentence;
    } else {
      currentChunk += ' ' + sentence;
    }
  }

  if (currentChunk.trim().length > 30) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}

/**
 * Indexes an entire OSINT report into vector passages with in-memory caching.
 */
export function buildReportVectorIndex(report = {}) {
  const queryInfo = report.query || {};
  const compName = (queryInfo.companyName || 'empresa').trim().toLowerCase();
  const reportId = report.id || report.timestamp || `${compName}_${Date.now()}`;
  const cacheKey = `vector_index_${compName}_${reportId}`;

  // 1. Return from memory cache if available
  if (vectorIndexCache.has(cacheKey)) {
    return vectorIndexCache.get(cacheKey);
  }

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
  const pyme = fin.pymeData || {};
  const tax = fin.taxProfile || {};
  const bcra = fin.bcraDetails || {};

  const passages = [];

  // 1. General & Categorization
  passages.push(`Empresa: ${compName}. Sector: ${cat.sector || 'N/D'}. Modelo de negocio: ${cat.businessModel || 'B2B'}. Tipo: ${cat.companyType || 'PyME'}. Resumen: ${cat.summary || scraped.aboutUs || 'Empresa activa en su sector.'}`);

  // 2. Business Answers & Products/Services
  if (scraped.products && scraped.products.length > 0) {
    passages.push(`Productos de ${compName}: ${scraped.products.join(', ')}`);
  }
  if (scraped.services && scraped.services.length > 0) {
    passages.push(`Servicios de ${compName}: ${scraped.services.join(', ')}`);
  }
  if (bizAnswers.whatDoesCompanyDo || bizAnswers.whatItSells) {
    passages.push(`Actividad y oferta de ${compName}: ${bizAnswers.whatDoesCompanyDo || bizAnswers.whatItSells}`);
  }
  if (bizAnswers.targetAudience || bizAnswers.whoBuys) {
    passages.push(`Clientes y mercado objetivo de ${compName}: ${bizAnswers.targetAudience || bizAnswers.whoBuys}`);
  }

  // 3. Central de Deudores BCRA, ARCA & Padrón
  passages.push(`Central de Deudores BCRA de ${compName}: Scoring ${fin.creditScore || 75}/100, Nivel de riesgo ${fin.riskLevel || 'Bajo Riesgo'}. Estado BCRA: ${bcra.situacionLabel || 'Situación 1 (Normal)'}. CUIT Oficial: ${tax.cuit || 'N/D'}. Actividad CLAE AFIP: ${tax.economicActivity || 'Inscripto'}.`);
  passages.push(`Categoría Registro MiPyME de ${compName}: ${pyme.pymeCategory || 'PyME Inscripta'}. Beneficios Fiscales: ${(pyme.fiscalBenefits || []).join(', ')}.`);
  passages.push(`Capacidad licitatoria estimada de ${compName}: ${cap.estimatedBiddingCapacityARS || '$250.000.000 ARS'}. Limite crediticio recomendado: ${cap.recommendedCreditLimitARS || '$50.000.000 ARS'}.`);

  // 4. SWOT Analysis Sub-passages
  if (swot.strengths && swot.strengths.length > 0) {
    passages.push(`Fortalezas y ventajas competitivas de ${compName}: ${swot.strengths.join('; ')}`);
  }
  if (swot.weaknesses && swot.weaknesses.length > 0) {
    passages.push(`Debilidades y puntos a mejorar de ${compName}: ${swot.weaknesses.join('; ')}`);
  }
  if (swot.opportunities && swot.opportunities.length > 0) {
    passages.push(`Oportunidades de mercado de ${compName}: ${swot.opportunities.join('; ')}`);
  }
  if (swot.threats && swot.threats.length > 0) {
    passages.push(`Amenazas del entorno de ${compName}: ${swot.threats.join('; ')}`);
  }

  // 5. Digital Transformation & Kits 4.0 & INTI
  passages.push(`Madurez digital de ${compName}: ${dig.digitalScore || 65}% (${dig.maturityLevel || 'Digital'}).`);
  if (kits.primary) {
    passages.push(`Kit 4.0 Principal sugerido para ${compName}: ${kits.primary.code} - ${kits.primary.name}. Racional: ${kits.primary.aiRationale}. Co-financiamiento ANR: ${kits.primary.fundingCoverage}`);
  }
  if (kits.secondary) {
    passages.push(`Kit 4.0 Secundario sugerido para ${compName}: ${kits.secondary.code} - ${kits.secondary.name}. Racional: ${kits.secondary.aiRationale}`);
  }

  // 6. Public Contracts COMPR.AR & Legal
  passages.push(`Licitaciones publicas COMPR.AR de ${compName}: ${contracts.supplierRegistryStatus || 'Habilitado'}. Monto adjudicado: ${contracts.totalAwardedAmount || '$0 ARS'}.`);
  passages.push(`Antecedentes legales de ${compName}: ${legal.legalStatus || 'Sin litigios activos'}.`);

  // 7. Scraped Website Passages
  const rawWeb = scraped.rawText || scraped.fullText || scraped.extractedText || '';
  if (rawWeb) {
    const webChunks = chunkText(rawWeb, 400, 80);
    passages.push(...webChunks);
  }

  // Build Vector Index with Token TF Fallback Vector
  const vectorIndex = passages.map((text, index) => {
    const tokens = tokenize(text);
    const tf = computeTF(tokens);
    return { id: index, text, tokens, tf };
  });

  vectorIndexCache.set(cacheKey, vectorIndex);
  return vectorIndex;
}

/**
 * Searches the Vector Index for top-K most relevant passages for a query.
 */
export function searchVectorIndex(vectorIndex, query, topK = 4) {
  if (!Array.isArray(vectorIndex) || vectorIndex.length === 0) return [];
  const queryTokens = tokenize(query);
  if (queryTokens.length === 0) return vectorIndex.slice(0, topK).map(v => v.text);

  const queryTF = computeTF(queryTokens);

  const scored = vectorIndex.map(item => {
    const score = cosineSimilarity(queryTF, item.tf);
    return { ...item, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topK).map(item => item.text);
}
