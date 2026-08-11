import dns from 'dns';
import net from 'net';
import axios from 'axios';
import https from 'https';

const httpsAgent = new https.Agent({ rejectUnauthorized: false });

/**
 * Checks if an IPv4 or IPv6 string belongs to private, loopback, link-local or restricted ranges.
 */
export function isPrivateIP(ip) {
  if (!ip || typeof ip !== 'string') return true;

  // Handle IPv4-mapped IPv6 addresses like "::ffff:127.0.0.1"
  if (ip.startsWith('::ffff:')) {
    ip = ip.substring(7);
  }

  const ipType = net.isIP(ip);
  if (ipType === 4) {
    const parts = ip.split('.').map(Number);
    if (parts.length !== 4 || parts.some(p => isNaN(p) || p < 0 || p > 255)) return true;

    const [a, b] = parts;
    // 0.0.0.0/8 - Current network
    if (a === 0) return true;
    // 127.0.0.0/8 - Loopback
    if (a === 127) return true;
    // 10.0.0.0/8 - Private
    if (a === 10) return true;
    // 172.16.0.0/12 - Private (172.16.0.0 - 172.31.255.255)
    if (a === 172 && b >= 16 && b <= 31) return true;
    // 192.168.0.0/16 - Private
    if (a === 192 && b === 168) return true;
    // 169.254.0.0/16 - Link-local / Cloud Metadata (169.254.169.254)
    if (a === 169 && b === 254) return true;
    // 100.64.0.0/10 - Carrier Grade NAT
    if (a === 100 && b >= 64 && b <= 127) return true;

    return false;
  }

  if (ipType === 6) {
    const lower = ip.toLowerCase();
    // ::1 Loopback
    if (lower === '::1' || lower === '0:0:0:0:0:0:0:1') return true;
    // Unspecified ::
    if (lower === '::' || lower === '0:0:0:0:0:0:0:0') return true;
    // Unique local fc00::/7 (fc00:: and fd00::)
    if (lower.startsWith('fc') || lower.startsWith('fd')) return true;
    // Link-local fe80::/10 (fe8, fe9, fea, feb)
    if (/^fe[89ab]/i.test(lower)) return true;

    return false;
  }

  return true; // Reject unknown IP formats
}

/**
 * Validates a target URL against SSRF threats, DNS rebinding, internal subnets, and cloud metadata.
 */
export async function validateTargetUrl(urlString) {
  if (!urlString || typeof urlString !== 'string') {
    throw new Error('[SSRF Guard] URL no provista.');
  }

  let parsedUrl;
  try {
    parsedUrl = new URL(urlString);
  } catch (e) {
    throw new Error('[SSRF Guard] Formato de URL inválido.');
  }

  // 1. Allow ONLY http and https protocols
  if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
    throw new Error(`[SSRF Guard] Protocolo no permitido: ${parsedUrl.protocol}`);
  }

  const hostname = parsedUrl.hostname.toLowerCase();

  // 2. Reject explicit restricted hostnames
  if (
    hostname === 'localhost' ||
    hostname.endsWith('.local') ||
    hostname.endsWith('.internal') ||
    hostname === 'metadata.google.internal'
  ) {
    throw new Error(`[SSRF Guard] Hostname restringido: ${hostname}`);
  }

  // 3. Check IP directly if host is an IP address
  if (net.isIP(hostname)) {
    if (isPrivateIP(hostname)) {
      throw new Error(`[SSRF Guard] Dirección IP privada o restringida: ${hostname}`);
    }
    return parsedUrl.href;
  }

  // 4. Resolve DNS and verify ALL resolved IP addresses against private subnets
  try {
    const addresses = await dns.promises.lookup(hostname, { all: true });
    if (!addresses || addresses.length === 0) {
      throw new Error(`[SSRF Guard] No se pudo resolver DNS para ${hostname}`);
    }

    for (const addr of addresses) {
      if (isPrivateIP(addr.address)) {
        throw new Error(`[SSRF Guard] El hostname ${hostname} resuelve a una IP restringida (${addr.address}).`);
      }
    }
  } catch (err) {
    if (err.message.includes('[SSRF Guard]')) throw err;
    throw new Error(`[SSRF Guard] Fallo en resolución DNS para ${hostname}: ${err.message}`);
  }

  return parsedUrl.href;
}

/**
 * Safe Axios GET wrapper protected against SSRF, internal redirects, and huge payloads.
 */
export async function safeAxiosGet(targetUrl, options = {}) {
  // Validate initial URL
  const safeUrl = await validateTargetUrl(targetUrl);

  const timeout = options.timeout || 2500;
  const userAgent = options.headers?.['User-Agent'] || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) OSINT-Crawler/4.0';

  // Perform request with maxRedirects: 0 to prevent redirect SSRF bypasses
  try {
    const res = await axios.get(safeUrl, {
      ...options,
      httpsAgent,
      timeout,
      maxRedirects: 0,
      maxContentLength: 5 * 1024 * 1024, // 5MB Limit
      headers: {
        'User-Agent': userAgent,
        'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
        ...(options.headers || {})
      }
    });
    return res;
  } catch (err) {
    // Handle manual 301/302 redirects with SSRF validation on the redirect target
    if (err.response && [301, 302, 303, 307, 308].includes(err.response.status)) {
      const redirectLocation = err.response.headers['location'];
      if (redirectLocation) {
        const absoluteRedirectUrl = new URL(redirectLocation, safeUrl).href;
        // Validate redirected URL against SSRF rules before following!
        const validatedRedirect = await validateTargetUrl(absoluteRedirectUrl);
        return axios.get(validatedRedirect, {
          ...options,
          httpsAgent,
          timeout,
          maxRedirects: 0,
          maxContentLength: 5 * 1024 * 1024,
          headers: {
            'User-Agent': userAgent,
            'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
            ...(options.headers || {})
          }
        });
      }
    }
    throw err;
  }
}
