import dns from 'dns/promises';
import http from 'http';
import https from 'https';

/**
 * Performs Technical & Web OSINT analysis on a target domain
 */
export async function analyzeDomain(domainOrUrl) {
  if (!domainOrUrl) {
    return {
      hasWebsite: false,
      message: 'No website URL provided for domain analysis'
    };
  }

  // Clean domain name from URL
  let cleanDomain = domainOrUrl
    .replace(/^https?:\/\//i, '')
    .replace(/\/.*$/, '')
    .replace(/^www\./i, '')
    .trim();

  const results = {
    hasWebsite: true,
    domain: cleanDomain,
    url: `https://${cleanDomain}`,
    ipAddresses: [],
    mxRecords: [],
    nsRecords: [],
    txtRecords: [],
    httpHeaders: {},
    techStack: [],
    sslInfo: null,
    securityHeaders: {
      hsts: false,
      csp: false,
      xFrameOptions: false,
      xContentTypeOptions: false
    },
    error: null
  };

  // 1. DNS Lookups
  try {
    const aRecords = await dns.resolve4(cleanDomain).catch(() => []);
    results.ipAddresses = aRecords;
  } catch (err) {
    results.ipAddresses = [];
  }

  try {
    const mx = await dns.resolveMx(cleanDomain).catch(() => []);
    results.mxRecords = mx.map(m => `${m.exchange} (priority: ${m.priority})`);
  } catch (e) {}

  try {
    const ns = await dns.resolveNs(cleanDomain).catch(() => []);
    results.nsRecords = ns;
  } catch (e) {}

  try {
    const txt = await dns.resolveTxt(cleanDomain).catch(() => []);
    results.txtRecords = txt.flat();
  } catch (e) {}

  // 2. HTTP Request & Tech Stack Detection
  try {
    const response = await fetch(`https://${cleanDomain}`, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) OSINT-Company-Analyzer/1.0'
      },
      signal: AbortSignal.timeout(6000)
    }).catch(async () => {
      // Fallback to http if https fails
      results.url = `http://${cleanDomain}`;
      return await fetch(`http://${cleanDomain}`, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) OSINT-Company-Analyzer/1.0' },
        signal: AbortSignal.timeout(6000)
      });
    });

    if (response) {
      results.statusCode = response.status;
      const headers = {};
      response.headers.forEach((val, key) => {
        headers[key.toLowerCase()] = val;
      });
      results.httpHeaders = headers;

      // Security Headers Check
      results.securityHeaders.hsts = !!headers['strict-transport-security'];
      results.securityHeaders.csp = !!headers['content-security-policy'];
      results.securityHeaders.xFrameOptions = !!headers['x-frame-options'];
      results.securityHeaders.xContentTypeOptions = !!headers['x-content-type-options'];

      // Tech Stack Detection from Headers & HTML body
      const text = await response.text().catch(() => '');
      const detectedTech = new Set();

      // Check Server Header
      if (headers['server']) {
        detectedTech.add(`Server: ${headers['server']}`);
      }
      if (headers['x-powered-by']) {
        detectedTech.add(`Powered By: ${headers['x-powered-by']}`);
      }

      // Check Body Signatures
      const lowerBody = text.toLowerCase();
      if (lowerBody.includes('wp-content') || lowerBody.includes('wordpress')) detectedTech.add('WordPress CMS');
      if (lowerBody.includes('shopify')) detectedTech.add('Shopify E-Commerce');
      if (lowerBody.includes('woocommerce')) detectedTech.add('WooCommerce');
      if (lowerBody.includes('wix.com') || lowerBody.includes('wixsite')) detectedTech.add('Wix Platform');
      if (lowerBody.includes('vtex')) detectedTech.add('VTEX E-Commerce');
      if (lowerBody.includes('tiendanube') || lowerBody.includes('nuvemshop')) detectedTech.add('Tiendanube / Nuvemshop');
      if (lowerBody.includes('next.js') || lowerBody.includes('__next')) detectedTech.add('Next.js Framework');
      if (lowerBody.includes('react')) detectedTech.add('React UI Library');
      if (lowerBody.includes('vue') || lowerBody.includes('__vue__')) detectedTech.add('Vue.js Framework');
      if (lowerBody.includes('bootstrap')) detectedTech.add('Bootstrap CSS');
      if (lowerBody.includes('tailwind')) detectedTech.add('Tailwind CSS');
      if (lowerBody.includes('googletagmanager') || lowerBody.includes('google-analytics')) detectedTech.add('Google Analytics / GTM');
      if (lowerBody.includes('facebook-pixel') || lowerBody.includes('fbevents.js')) detectedTech.add('Meta Pixel');
      if (lowerBody.includes('cloudflare')) detectedTech.add('Cloudflare CDN / Security');
      if (lowerBody.includes('hubspot')) detectedTech.add('HubSpot CRM');
      if (lowerBody.includes('hotjar')) detectedTech.add('Hotjar Analytics');

      // Check MX for Email Provider
      const mxString = results.mxRecords.join(' ').toLowerCase();
      if (mxString.includes('google') || mxString.includes('aspmx')) detectedTech.add('Google Workspace Email');
      if (mxString.includes('outlook') || mxString.includes('protection.outlook')) detectedTech.add('Microsoft 365 Email');
      if (mxString.includes('zoho')) detectedTech.add('Zoho Mail');

      results.techStack = Array.from(detectedTech);
    }
  } catch (err) {
    results.error = `Could not fetch website HTTP response: ${err.message}`;
  }

  return results;
}
