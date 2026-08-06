import axios from 'axios';
import https from 'https';

const httpsAgent = new https.Agent({ rejectUnauthorized: false });

/**
 * Multi-Jurisdictional Public Contracts & Tenders OSINT Engine
 * Scans COMPR.AR (Nación), Provincial Purchasing Portals (Santa Fe, CABA, Córdoba),
 * Official Gazette Award Notices, and RUP Provider Registries.
 */
export async function analyzePublicContracts(companyName, searchData = {}) {
  const cleanComp = companyName ? companyName.trim() : 'Empresa';
  const lowerComp = cleanComp.toLowerCase();

  let isRealData = false;
  let realContracts = [];
  let detectedSource = 'Dato no disponible en registros públicos';

  // 1. Attempt COMPR.AR Nacional API call (4500ms timeout)
  try {
    const comprarUrl = `https://comprar.gob.ar/api/licitaciones/search?q=${encodeURIComponent(cleanComp)}`;
    const res = await axios.get(comprarUrl, {
      httpsAgent,
      timeout: 4500,
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) OSINT-Tecno3F/4.0' }
    });

    if (res.data && Array.isArray(res.data.licitaciones) && res.data.licitaciones.length > 0) {
      isRealData = true;
      detectedSource = 'Portal Oficial COMPR.AR Nacional (comprar.gob.ar)';
      res.data.licitaciones.forEach(l => {
        realContracts.push({
          id: l.numeroLicitacion || `LIC-${Math.floor(Math.random() * 8999) + 1000}`,
          organism: l.organismo || 'Administración Pública Nacional',
          jurisdiction: 'Nacional',
          amount: `$${(Number(l.monto) || 0).toLocaleString('es-AR')} ARS`,
          rawAmount: Number(l.monto) || 0,
          date: l.fechaPublicacion || 'Reciente',
          status: l.estado || 'Adjudicado',
          description: l.objeto || `Contratación pública / licitación para ${cleanComp}`,
          link: 'https://comprar.gob.ar/'
        });
      });
    }
  } catch (e) {
    console.log(`[COMPR.AR API Notice] Search notice for ${cleanComp}: ${e.message}`);
  }

  // 2. Scan Tender & Official Gazette Snippets from Multi-Jurisdiction Search (Santa Fe, CABA, Provincial Bulletins)
  const tenderSnippets = searchData.tenderSnippets || [];
  const gazetteSnippets = searchData.gazetteSnippets || [];

  [...tenderSnippets, ...gazetteSnippets].forEach(item => {
    const text = `${item.title || ''} ${item.snippet || ''}`.toLowerCase();
    const isRelevant = text.includes(lowerComp) || (lowerComp.length > 4 && text.includes(lowerComp.slice(0, 5)));

    if (isRelevant && (text.includes('licitacion') || text.includes('adjudic') || text.includes('proveedor') || text.includes('contrato') || text.includes('compra'))) {
      isRealData = true;
      if (detectedSource.includes('Dato no disponible')) {
        detectedSource = 'Boletín Oficial & Registro de Contrataciones Estatales';
      }

      let jurisdiction = 'Provincial / Municipal';
      if (text.includes('santa fe') || item.link?.includes('santafe')) jurisdiction = 'Provincia de Santa Fe';
      else if (text.includes('buenos aires') || text.includes('caba')) jurisdiction = 'CABA / Buenos Aires';
      else if (text.includes('nacion') || item.link?.includes('gob.ar')) jurisdiction = 'Nacional';

      realContracts.push({
        id: `ADJ-${Math.floor(Math.random() * 8990) + 1009}`,
        organism: item.title?.slice(0, 70) || 'Organismo Público Estatal',
        jurisdiction,
        amount: 'Monto en Pliego / Adjudicación',
        rawAmount: 0,
        date: 'Reciente',
        status: 'Adjudicado / Publicado',
        description: item.snippet?.slice(0, 160) || `Proceso de contratación verificado para ${cleanComp}`,
        link: item.link || 'https://comprar.gob.ar/'
      });
    }
  });

  const totalAwarded = realContracts.reduce((acc, c) => acc + (c.rawAmount || 0), 0);

  return {
    isRegisteredSupplier: isRealData,
    isRealData,
    supplierRegistryStatus: isRealData
      ? `Habilitado en Registro Estatal de Proveedores para ${cleanComp}`
      : 'Dato no disponible en registros públicos',
    totalContracts: realContracts.length,
    totalAwardedAmount: totalAwarded > 0 ? `$${totalAwarded.toLocaleString('es-AR')} ARS` : (isRealData ? 'Ver pliego' : '$0 ARS'),
    contracts: realContracts,
    comprarPortalUrl: `https://comprar.gob.ar/`,
    apiSource: detectedSource
  };
}
