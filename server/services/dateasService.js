import { safeAxiosGet } from '../utils/ssrfGuard.js';
import { isValidCuit } from '../utils/cuitValidator.js';
import * as cheerio from 'cheerio';

/**
 * Dateas.com OSINT Scanner & CUIT/Boletín Oficial Cross-Reference Engine
 * Queries Dateas CUIT lookup and Dateas Public Docs / Boletines Oficiales to cross-check CUIT & edicts.
 */
export async function getDateasOSINTData(companyName, cuitInput = null) {
  const cleanComp = companyName ? companyName.trim() : 'Empresa';
  let cleanCuit = cuitInput ? String(cuitInput).replace(/\D/g, '') : null;

  if (!isValidCuit(cleanCuit)) {
    cleanCuit = null;
  }

  let discoveredCuit = cleanCuit;
  let cuitLookupUrl = `https://www.dateas.com/es/consulta_cuit_cuil?cuit=${cleanCuit || ''}&name=${encodeURIComponent(cleanComp)}`;
  let docsSearchUrl = `https://www.dateas.com/es/docs/search?text=${encodeURIComponent(cleanComp)}&pcountry=AR`;

  let hasCuitLookupRecord = false;
  let dateasEdicts = [];
  let discoveredCuitsInDocs = [];

  // 1. Parallel Fetch: Query Dateas CUIT Lookup & Dateas Public Docs Search
  try {
    const [cuitRes, docsRes] = await Promise.all([
      safeAxiosGet(cuitLookupUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept-Language': 'es-AR,es;q=0.9,en;q=0.8'
        },
        timeout: 5000
      }).catch(() => null),
      safeAxiosGet(docsSearchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept-Language': 'es-AR,es;q=0.9,en;q=0.8'
        },
        timeout: 5000
      }).catch(() => null)
    ]);

    // Parse CUIT Lookup Result
    if (cuitRes && cuitRes.data && typeof cuitRes.data === 'string') {
      hasCuitLookupRecord = cuitRes.data.toLowerCase().includes('información de') || cuitRes.data.toLowerCase().includes('cuit');
      const matches = cuitRes.data.match(/\b(20|23|24|27|30|33|34)[-–]?\d{8}[-–]?\d\b/g);
      if (!discoveredCuit && matches && matches.length > 0) {
        for (const m of matches) {
          const candidate = m.replace(/\D/g, '');
          if (isValidCuit(candidate)) {
            discoveredCuit = candidate;
            break;
          }
        }
      }
    }

    // Fallback: If no CUIT discovered on exact input name, try main word token
    if (!discoveredCuit && cleanComp.includes(' ')) {
      const firstToken = cleanComp.split(' ')[0];
      if (firstToken.length >= 4) {
        try {
          const fallbackUrl = `https://www.dateas.com/es/consulta_cuit_cuil?cuit=&name=${encodeURIComponent(firstToken)}`;
          const fbRes = await safeAxiosGet(fallbackUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
              'Accept-Language': 'es-AR,es;q=0.9,en;q=0.8'
            },
            timeout: 4000
          }).catch(() => null);

          if (fbRes && fbRes.data && typeof fbRes.data === 'string') {
            const matches = fbRes.data.match(/\b(20|23|24|27|30|33|34)[-–]?\d{8}[-–]?\d\b/g);
            if (matches && matches.length > 0) {
              for (const m of matches) {
                const candidate = m.replace(/\D/g, '');
                if (isValidCuit(candidate)) {
                  discoveredCuit = candidate;
                  console.log(`[DATEAS FALLBACK] Auto-discovered CUIT ${candidate} via main token "${firstToken}"`);
                  break;
                }
              }
            }
          }
        } catch (e) {}
      }
    }

    // Parse Public Docs / Boletín Oficial Search Results
    if (docsRes && docsRes.data && typeof docsRes.data === 'string') {
      const $ = cheerio.load(docsRes.data);
      const docsMatches = docsRes.data.match(/\b(20|23|24|27|30|33|34)[-–]?\d{8}[-–]?\d\b/g) || [];
      discoveredCuitsInDocs = Array.from(new Set(docsMatches.map(c => c.replace(/\D/g, '')).filter(isValidCuit)));

      if (!discoveredCuit && discoveredCuitsInDocs.length > 0) {
        discoveredCuit = discoveredCuitsInDocs[0];
      }

      $('a[href*="/docs/boletin-"], a[href*="/docs/"]').each((i, el) => {
        const text = $(el).text().trim();
        const href = $(el).attr('href');

        if (text && href && !text.includes('Boletines Oficiales') && !text.includes('¿Dónde hemos buscado?') && text !== 'Leer más' && text.length > 10) {
          const fullLink = href.startsWith('http') ? href : `https://www.dateas.com${href}`;
          if (!dateasEdicts.some(e => e.link === fullLink)) {
            dateasEdicts.push({
              title: text,
              link: fullLink,
              source: 'Dateas Documentos Públicos / Boletín Oficial'
            });
          }
        }
      });
    }

  } catch (e) {
    console.log(`[DATEAS OSINT NOTICE] Dateas scanner notice for ${cleanComp}: ${e.message}`);
  }

  const isRealData = !!discoveredCuit;
  const isCuitVerifiedInBoletin = discoveredCuit && discoveredCuitsInDocs.includes(discoveredCuit);

  const formattedCuit = discoveredCuit
    ? `${discoveredCuit.slice(0, 2)}-${discoveredCuit.slice(2, 10)}-${discoveredCuit.slice(10)}`
    : 'No verificado en Dateas';

  let crossCheckStatus = 'CONSULTA PUBLICADA EN DATEAS';
  if (isCuitVerifiedInBoletin) {
    crossCheckStatus = `✓ CUIT ${formattedCuit} COINCIDE 100% EN PÁDRON DATEAS Y EDICTOS DE BOLETÍN OFICIAL`;
  } else if (isRealData) {
    crossCheckStatus = `✓ CUIT ${formattedCuit} VERIFICADO EN CUIT/CUIL DATEAS`;
  } else if (dateasEdicts.length > 0) {
    crossCheckStatus = `DOCUMENTOS Y EDICTOS PUBLICADOS EN DATEAS (${dateasEdicts.length})`;
  } else {
    crossCheckStatus = 'SIN COINCIDENCIAS DIRECTAS EN DATEAS';
  }

  return {
    cuit: formattedCuit,
    cuitRaw: discoveredCuit,
    isRealData,
    isCuitVerifiedInBoletin,
    crossCheckStatus,
    edictsCount: dateasEdicts.length,
    dateasEdicts: dateasEdicts.slice(0, 10),
    discoveredCuitsInDocs,
    dateasCuitUrl: cuitLookupUrl,
    dateasDocsUrl: docsSearchUrl,
    sourceName: 'Dateas.com (CUIT & Boletines Oficiales)'
  };
}
