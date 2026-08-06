import axios from 'axios';
import https from 'https';
import * as cheerio from 'cheerio';

const httpsAgent = new https.Agent({ rejectUnauthorized: false });

const testCuits = [
  { name: 'Smartmation', cuit: '30711674483' },
  { name: 'Baigorria Industrial', cuit: '30712345678' },
  { name: 'Mercado Libre', cuit: '30703088534' }
];

async function testArcaPadronApis() {
  console.log(`=================== [AUDITORÍA EN VIVO APIS ARCA / AFIP] ===================\n`);

  for (const item of testCuits) {
    console.log(`🔍 [PROBANDO CUIT] ${item.name} (${item.cuit})`);

    // 1. Test aws.afip.gov.ar
    try {
      const url1 = `https://aws.afip.gov.ar/sr-padron/v2/persona/${item.cuit}`;
      const res1 = await axios.get(url1, { httpsAgent, timeout: 4500, headers: { 'User-Agent': 'Mozilla/5.0 OSINT-Tecno3F/4.0' } });
      console.log(`  ✅ aws.afip.gov.ar v2: Status ${res1.status} | Razón Social: ${res1.data?.persona?.razonSocial || 'N/D'}`);
    } catch (e) {
      console.log(`  ⚠️ aws.afip.gov.ar v2 Notice: ${e.message}`);
    }

    // 2. Test cuit.online fallback
    try {
      const url2 = `https://www.cuitonline.com/search.php?q=${item.cuit}`;
      const res2 = await axios.get(url2, { httpsAgent, timeout: 4500, headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' } });
      if (res2.data) {
        const $ = cheerio.load(res2.data);
        const name = $('h1').text().trim() || $('.denominacion').text().trim();
        console.log(`  ✅ cuitonline.com Scraping Fallback: Status 200 | Nombre: ${name || 'Encontrado'}`);
      }
    } catch (e) {
      console.log(`  ⚠️ cuitonline Notice: ${e.message}`);
    }

    console.log('--------------------------------------------------');
  }
}

testArcaPadronApis();
