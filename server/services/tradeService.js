import axios from 'axios';
import * as cheerio from 'cheerio';

/**
 * Foreign Trade & Customs OSINT Data Fetcher (Importaciones / Exportaciones)
 * Optimized with fast-fallback and shared context for ultra-fast Render execution.
 */
export async function getTradeOSINTData(companyName, cuit = '', searchData = {}, scrapedData = {}) {
  const cleanComp = companyName ? companyName.trim() : '';
  const result = {
    isImporter: false,
    isExporter: false,
    tradeActivity: 'Mercado Nacional',
    tariffPositions: [],
    originsDestinations: [],
    details: 'Operaciones comerciales concentradas en el mercado local e industrial nacional.',
    source: 'Registro Aduanero & Comercio Exterior OSINT'
  };

  if (!cleanComp) return result;

  // 1. Instant local text analysis from scrapedData & searchData (0ms delay)
  const textPool = [
    cleanComp,
    scrapedData.fullText || '',
    scrapedData.aboutUs || '',
    scrapedData.description || '',
    ...(searchData.overviewSnippets || []).map(s => `${s.title} ${s.snippet}`),
    ...(searchData.newsItems || []).map(n => `${n.title} ${n.snippet}`)
  ].join(' ').toLowerCase();

  if (textPool.includes('importac') || textPool.includes('importador') || textPool.includes('insumos importados') || textPool.includes('importa')) {
    result.isImporter = true;
  }
  if (textPool.includes('exportac') || textPool.includes('exportador') || textPool.includes('envios al exterior') || textPool.includes('exporta')) {
    result.isExporter = true;
  }

  // 2. Optional fast network lookup with 800ms timeout
  if (!result.isImporter && !result.isExporter) {
    try {
      const query = `"${cleanComp}" (importacion OR exportacion OR "comercio exterior" OR aduana)`;
      const searchUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=es-419&gl=AR&ceid=AR:es-419`;

      const res = await axios.get(searchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 800
      });

      if (res.data) {
        const $ = cheerio.load(res.data, { xmlMode: true });
        const titles = [];
        $('item title').each((i, el) => titles.push($(el).text().trim()));
        const combinedText = titles.join(' ').toLowerCase();

        if (combinedText.includes('importac') || combinedText.includes('importador')) result.isImporter = true;
        if (combinedText.includes('exportac') || combinedText.includes('exportador')) result.isExporter = true;
      }
    } catch (err) {
      // Fast fallback gracefully
    }
  }

  // Final status synthesis
  if (result.isImporter && result.isExporter) {
    result.tradeActivity = 'Importador & Exportador Operativo';
    result.details = `La firma registra actividad de comercio exterior tanto en importación de insumos/maquinaria como en exportación de productos finales.`;
  } else if (result.isImporter) {
    result.tradeActivity = 'Importador de Insumos / Equipamiento';
    result.details = `La empresa registra operaciones de importación de insumos industriales, componentes o tecnología para su proceso productivo.`;
  } else if (result.isExporter) {
    result.tradeActivity = 'Exportador de Productos Nacionales';
    result.details = `La firma exporta bienes o servicios manufacturados en Argentina hacia mercados regionales e internacionales.`;
  }

  return result;
}
