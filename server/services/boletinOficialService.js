import axios from 'axios';
import https from 'https';

const httpsAgent = new https.Agent({ rejectUnauthorized: false });

/**
 * Boletín Oficial de la República Argentina (BORA) OSINT Engine
 * Connects to timeline.boletinoficial.gob.ar and official search endpoints
 * Scans Edictos Societarios, Constituciones de Sociedades, Autoridades y Licitaciones Públicas.
 */
export async function getBoletinOficialOSINTData(companyName, cuit = '') {
  const cleanComp = companyName ? companyName.trim() : 'la empresa';
  const cleanCuit = cuit ? String(cuit).replace(/\D/g, '') : '';

  let isRealData = false;
  let apiSource = 'Boletín Oficial de la República Argentina (BORA - timeline.boletinoficial.gob.ar)';
  let totalPublications = 0;
  let edicts = [];
  let publicationSummary = '';

  try {
    // 1. Query Timeline API / Search Endpoint
    const queryTerm = cleanCuit && cleanCuit.length >= 10 ? cleanCuit : cleanComp;
    const url = `https://timeline.boletinoficial.gob.ar/api/search?q=${encodeURIComponent(queryTerm)}`;

    const res = await axios.get(url, { httpsAgent, timeout: 4000 }).catch(() => null);

    if (res && res.data && Array.isArray(res.data.results) && res.data.results.length > 0) {
      isRealData = true;
      totalPublications = res.data.results.length;
      edicts = res.data.results.map(item => ({
        title: item.title || item.seccion || 'Publicación Oficial en BORA',
        date: item.fecha || item.date || new Date().toISOString().split('T')[0],
        section: item.seccion || 'Segunda Sección (Sociedades e Avisos Comerciales)',
        snippet: item.snippet || item.texto || `Publicación verificada en el Boletín Oficial para ${cleanComp}.`,
        link: item.url || `https://www.boletinoficial.gob.ar/`
      }));
      publicationSummary = `Se verificaron ${totalPublications} publicaciones oficiales en el Boletín Oficial (BORA) para ${cleanComp}.`;
    }
  } catch (e) {
    console.warn('[Boletin Oficial Timeline Notice]:', e.message);
  }

  if (!isRealData) {
    // Fallback BORA web search query link
    publicationSummary = `Búsqueda realizada en la plataforma oficial del Boletín Oficial de la República Argentina para ${cleanComp}.`;
  }

  return {
    isRealData,
    apiSource,
    totalPublications,
    edicts,
    publicationSummary,
    officialPortalUrl: `https://www.boletinoficial.gob.ar/`
  };
}
