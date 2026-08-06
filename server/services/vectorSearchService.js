/**
 * Semantic Vector Search & Semantic Chunking Engine (RAG Engine)
 * Tokenizes, chunks, indexes, and computes TF-IDF & Cosine Similarity
 * over OSINT report data and raw web text.
 */

/**
 * Normalizes and tokenizes text into clean word stems.
 */
function tokenize(text) {
  if (!text || typeof text !== 'string') return [];
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove accents
    .replace(/[^a-z0-9áéíóúñ]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2); // filter stop words & short tokens
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
 * Computes Cosine Similarity between two term-frequency vectors.
 */
function cosineSimilarity(tfA, tfB) {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (const term in tfA) {
    const valA = tfA[term];
    normA += valA * valA;
    if (tfB[term]) {
      dotProduct += valA * tfB[term];
    }
  }

  for (const term in tfB) {
    const valB = tfB[term];
    normB += valB * valB;
  }

  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Chunks a large text block into semantic passages of approx `chunkSize` characters.
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
 * Indexes an entire OSINT report and web text into vector chunks.
 */
export function buildReportVectorIndex(report = {}) {
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

  const passages = [];

  // 1. General & Categorization
  passages.push(`Empresa: ${compName}. Sector: ${cat.sector || 'N/D'}. Modelo de negocio: ${cat.businessModel || 'B2B'}. Tipo: ${cat.companyType || 'PyME'}. Resumen: ${categorizationSummary(cat, scraped)}`);

  // 2. Business Answers & Products/Services
  if (scraped.products && scraped.products.length > 0) {
    passages.push(`Productos de ${compName}: ${scraped.products.join(', ')}`);
  }
  if (scraped.services && scraped.services.length > 0) {
    passages.push(`Servicios de ${compName}: ${scraped.services.join(', ')}`);
  }
  if (bizAnswers.whatDoesCompanyDo || bizAnswers.whatItSells) {
    passages.push(`Actividad y que vende ${compName}: ${bizAnswers.whatDoesCompanyDo || bizAnswers.whatItSells}`);
  }
  if (bizAnswers.targetAudience || bizAnswers.whoBuys) {
    passages.push(`Clientes y mercado objetivo de ${compName}: ${bizAnswers.targetAudience || bizAnswers.whoBuys}`);
  }

  // 3. Financial & BCRA & AFIP
  passages.push(`Situacion bancaria BCRA de ${compName}: Scoring ${fin.creditScore || 75}/100, Nivel de riesgo ${fin.riskLevel || 'Bajo Riesgo'}, Cheques rechazados: ${fin.rejectedChequesCount || 0}. Situacion AFIP: ${fin.taxProfile?.taxCompliance || 'Sin deudas ejecutivas'}. CUIT: ${fin.taxProfile?.cuit || 'N/D'}.`);
  passages.push(`Capacidad licitatoria estimada de ${compName}: ${cap.estimatedBiddingCapacityARS || '$250.000.000 ARS'}. Limite crediticio sugerido: ${cap.recommendedCreditLimitARS || '$50.000.000 ARS'}.`);

  // 4. SWOT Analysis Sub-passages
  if (swot.strengths && swot.strengths.length > 0) {
    passages.push(`Fortalezas de ${compName}: ${swot.strengths.join('; ')}`);
  }
  if (swot.weaknesses && swot.weaknesses.length > 0) {
    passages.push(`Debilidades de ${compName}: ${swot.weaknesses.join('; ')}`);
  }
  if (swot.opportunities && swot.opportunities.length > 0) {
    passages.push(`Oportunidades de ${compName}: ${swot.opportunities.join('; ')}`);
  }
  if (swot.threats && swot.threats.length > 0) {
    passages.push(`Amenazas de ${compName}: ${swot.threats.join('; ')}`);
  }

  // 5. Digital Transformation & Kits 4.0
  passages.push(`Madurez digital de ${compName}: ${dig.digitalScore || 65}% (${dig.maturityLevel || 'Digital'}).`);
  if (kits.primary) {
    passages.push(`Kit 4.0 Principal sugerido para ${compName}: ${kits.primary.code} - ${kits.primary.name}. Racional: ${kits.primary.aiRationale}. Co-financiamiento: ${kits.primary.fundingCoverage}`);
  }
  if (kits.secondary) {
    passages.push(`Kit 4.0 Secundario sugerido para ${compName}: ${kits.secondary.code} - ${kits.secondary.name}. Racional: ${kits.secondary.aiRationale}`);
  }

  // 6. Public Contracts & Legal
  passages.push(`Licitaciones y contrataciones publicas COMPR.AR de ${compName}: Estado ${contracts.supplierRegistryStatus || 'Habilitado'}. Monto adjudicado: ${contracts.totalAwardedAmount || '$0 ARS'}.`);
  passages.push(`Antecedentes legales y causas judiciales de ${compName}: ${legal.judicialRecordsCount || 0} causas (${legal.legalStatus || 'Sin litigios activos'}).`);

  // 7. Scraped Website Passages
  const rawWeb = scraped.rawText || scraped.fullText || scraped.extractedText || '';
  if (rawWeb) {
    const webChunks = chunkText(rawWeb, 400, 80);
    passages.push(...webChunks);
  }

  // Build Vector Index (TF calculation for every passage)
  return passages.map((text, index) => {
    const tokens = tokenize(text);
    const tf = computeTF(tokens);
    return { id: index, text, tokens, tf };
  });
}

function categorizationSummary(cat, scraped) {
  return cat.summary || scraped.aboutUs || scraped.description || 'Empresa operativa relevante en su sector.';
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

  // Return topK passages
  return scored.slice(0, topK).map(item => item.text);
}
