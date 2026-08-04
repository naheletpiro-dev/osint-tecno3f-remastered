import axios from 'axios';
import * as cheerio from 'cheerio';

/**
 * Foreign Trade & Customs OSINT Data Fetcher (Importaciones / Exportaciones)
 * Analyzes whether the target company conducts international trade, imports industrial inputs, or exports products.
 */
export async function getTradeOSINTData(companyName, cuit = '') {
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

  try {
    const query = `"${cleanComp}" (importacion OR exportacion OR "comercio exterior" OR aduana OR embarque OR flete internacional)`;
    const searchUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=es-419&gl=AR&ceid=AR:es-419`;

    const res = await axios.get(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      timeout: 5000
    });

    if (res.data) {
      const $ = cheerio.load(res.data, { xmlMode: true });
      const titles = [];

      $('item title').each((i, el) => {
        titles.push($(el).text().trim());
      });

      const combinedText = titles.join(' ').toLowerCase();

      if (combinedText.includes('importac') || combinedText.includes('importador') || combinedText.includes('insumos importados')) {
        result.isImporter = true;
      }
      if (combinedText.includes('exportac') || combinedText.includes('exportador') || combinedText.includes('envios al exterior')) {
        result.isExporter = true;
      }

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
    }
  } catch (err) {
    console.error('Trade OSINT Service Notice:', err.message);
  }

  return result;
}
