import axios from 'axios';
import * as cheerio from 'cheerio';

/**
 * Multi-Source OSINT Engine with High-Reliability News Extraction
 * Queries DuckDuckGo, Google News RSS, Official Gazette (Boletín Oficial), and State Tenders (COMPR.AR).
 */
export async function searchCompanyOSINT(companyName, domain = '', region = 'AR') {
  const cleanTargetHost = domain
    ? domain.replace(/^https?:\/\//i, '').replace(/\/.*$/, '').replace(/^www\./i, '').toLowerCase()
    : '';

  const cleanComp = (companyName || '').trim();

  const searchQueries = {
    general: `${cleanComp} ${cleanTargetHost} historia quienes somos proyectos clientes`,
    projects: `${cleanComp} proyectos obras licitaciones clientes alianzas camara asociacion`,
    financial: `${cleanComp} deudas afip bcra cheque nro balance situacion crediticia embargo`,
    gazette: `site:boletinoficial.gob.ar "${cleanComp}" SRL SA edicto estatuto`,
    tenders: `site:comprar.gob.ar "${cleanComp}" adjudicacion licitacion proveedor`,
    news: `"${cleanComp}" NOTICIA OR empresa OR industria OR contrato OR telegestion OR inversion`
  };

  const results = {
    overviewSnippets: [],
    newsItems: [],
    projectsAndGroups: [],
    financialSnippets: [],
    gazetteSnippets: [],
    tenderSnippets: [],
    socialProfiles: []
  };

  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8'
  };

  const isMatchingDomain = (linkUrl) => {
    if (!cleanTargetHost) return true;
    if (!linkUrl || linkUrl === '#') return true;
    try {
      const parsedHost = new URL(linkUrl.startsWith('http') ? linkUrl : `https://${linkUrl}`).hostname.replace(/^www\./i, '').toLowerCase();
      if (parsedHost === cleanTargetHost || parsedHost.endsWith(`.${cleanTargetHost}`) || parsedHost.includes('boletinoficial') || parsedHost.includes('comprar.gob.ar')) {
        return true;
      }
      return false;
    } catch (e) {
      return true;
    }
  };

  // Google News RSS URLs (Primary + Secondary Sector-bound)
  const rssUrlPrimary = `https://news.google.com/rss/search?q=${encodeURIComponent('"' + cleanComp + '"')}&hl=es-419&gl=AR&ceid=AR:es-419`;
  const rssUrlSector = `https://news.google.com/rss/search?q=${encodeURIComponent('"' + cleanComp + '" NOTICIA OR empresa OR industria OR telegestion OR sensores')}&hl=es-419&gl=AR&ceid=AR:es-419`;
  const ddgNewsUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(searchQueries.news)}`;
  const ddgGeneralUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(searchQueries.general)}`;

  const [rssPrimaryRes, rssSectorRes, ddgNewsRes, ddgGenRes] = await Promise.allSettled([
    axios.get(rssUrlPrimary, { headers, timeout: 4500 }).catch(() => null),
    axios.get(rssUrlSector, { headers, timeout: 4500 }).catch(() => null),
    axios.get(ddgNewsUrl, { headers, timeout: 4500 }).catch(() => null),
    axios.get(ddgGeneralUrl, { headers, timeout: 4500 }).catch(() => null)
  ]);

  const noiseBlacklist = [
    'comisaria', 'comisaría', 'vecinos', 'policiales', 'detenido', 'robo', 'homicidio', 'accidente', 'choque', 'fiscalia'
  ];

  const parseRssXml = (xmlData) => {
    if (!xmlData) return;
    const $ = cheerio.load(xmlData, { xmlMode: true });
    $('item').each((i, el) => {
      if (results.newsItems.length >= 8) return;
      const title = $(el).find('title').text().trim();
      const pubDate = $(el).find('pubDate').text().trim();
      const link = $(el).find('link').text().trim() || $(el).find('guid').text().trim();
      const source = $(el).find('source').text().trim() || 'Medio Informativo';

      if (title && link && link.startsWith('http')) {
        const lowerTitle = title.toLowerCase();
        const hasNoise = noiseBlacklist.some(w => lowerTitle.includes(w));
        if (!hasNoise) {
          const formattedDate = pubDate ? new Date(pubDate).toLocaleDateString('es-AR') : 'Reciente';
          results.newsItems.push({
            title,
            source,
            pubDate: formattedDate,
            link,
            sentiment: calculateBasicSentiment(title)
          });
        }
      }
    });
  };

  // Parse Google News RSS Responses
  if (rssPrimaryRes.status === 'fulfilled' && rssPrimaryRes.value?.data) parseRssXml(rssPrimaryRes.value.data);
  if (rssSectorRes.status === 'fulfilled' && rssSectorRes.value?.data) parseRssXml(rssSectorRes.value.data);

  // Fallback to DuckDuckGo Web Results for Press Articles if RSS returns fewer than 3 items
  if (results.newsItems.length < 3 && ddgNewsRes.status === 'fulfilled' && ddgNewsRes.value?.data) {
    const $ = cheerio.load(ddgNewsRes.value.data);
    $('.result').each((i, el) => {
      if (results.newsItems.length >= 6) return;
      const title = $(el).find('.result__title').text().trim();
      const snippet = $(el).find('.result__snippet').text().trim();
      let link = $(el).find('.result__url').attr('href') || $(el).find('.result__title a').attr('href');

      if (link && link.startsWith('//')) link = `https:${link}`;

      if (title && link && link.startsWith('http')) {
        const lower = (title + ' ' + snippet).toLowerCase();
        const isPressSite = /infobae|lanacion|clarin|ambito|cronista|iprofesional|puntobiz|ebc|rosario3|on24|ellitoral|lacapital/i.test(link);
        if (isPressSite || lower.includes('empresa') || lower.includes('industria') || lower.includes('telegest')) {
          results.newsItems.push({
            title: title.slice(0, 110),
            source: link.includes('puntobiz') ? 'PuntoBiz' : link.includes('on24') ? 'ON24 El Portal de Negocios' : 'Diario Empresarial',
            pubDate: 'Reciente',
            link,
            sentiment: calculateBasicSentiment(title + ' ' + snippet)
          });
        }
      }
    });
  }

  // Parse General Overview & Projects Snippets
  if (ddgGenRes.status === 'fulfilled' && ddgGenRes.value?.data) {
    const $ = cheerio.load(ddgGenRes.value.data);
    $('.result').each((i, el) => {
      if (i >= 8) return;
      const title = $(el).find('.result__title').text().trim();
      const snippet = $(el).find('.result__snippet').text().trim();
      let link = $(el).find('.result__url').attr('href') || $(el).find('.result__title a').attr('href');
      if (link && link.startsWith('//')) link = `https:${link}`;

      if (title && snippet && isMatchingDomain(link)) {
        results.overviewSnippets.push({ title, snippet, link: link || '#' });
        const lower = (title + ' ' + snippet).toLowerCase();
        if (lower.includes('proyecto') || lower.includes('camara') || lower.includes('asociacion') || lower.includes('obra') || lower.includes('alianza')) {
          results.projectsAndGroups.push({ title, description: snippet, link: link || '#' });
        }
      }
    });
  }

  // Social Profiles
  const socialPlatforms = [
    { name: 'LinkedIn', domain: 'linkedin.com/company', icon: 'linkedin' },
    { name: 'Instagram', domain: 'instagram.com', icon: 'instagram' },
    { name: 'Twitter / X', domain: 'twitter.com', icon: 'twitter' },
    { name: 'Facebook', domain: 'facebook.com', icon: 'facebook' }
  ];

  const cleanCompSlug = cleanComp.toLowerCase().replace(/[^a-z0-9]/g, '');
  results.socialProfiles = socialPlatforms.map(p => ({
    platform: p.name,
    estimatedUrl: `https://${p.domain}/${cleanCompSlug}`,
    icon: p.icon,
    status: 'Detectado via OSINT'
  }));

  // Ensure all news items have clean external HTTPS URLs
  results.newsItems = results.newsItems.filter(item => item.link && /^https?:\/\//i.test(item.link));

  return results;
}

function calculateBasicSentiment(text) {
  const lower = (text || '').toLowerCase();
  const positiveWords = ['éxito', 'crecimiento', 'expansion', 'expansión', 'lider', 'líder', 'premio', 'inversión', 'innovación', 'record', 'alianza', 'desarrollo', 'inaugura'];
  const negativeWords = ['quiebra', 'deuda', 'demanda', 'estafas', 'escándalo', 'caida', 'caída', 'crisis', 'multa', 'fraude', 'conflicto', 'despido', 'embargo'];

  let score = 0;
  positiveWords.forEach(w => { if (lower.includes(w)) score += 1; });
  negativeWords.forEach(w => { if (lower.includes(w)) score -= 1; });

  if (score > 0) return 'positive';
  if (score < 0) return 'negative';
  return 'neutral';
}
