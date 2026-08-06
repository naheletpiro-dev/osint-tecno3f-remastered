import axios from 'axios';
import https from 'https';

const httpsAgent = new https.Agent({ rejectUnauthorized: false });

const cuitsToTest = [
  '30703088534', // Mercado Libre
  '30711674483'  // Smartmation
];

async function testOpenPadronSources() {
  console.log(`=================== [PROBANDO FUENTES ABIERTAS ARCA / AFIP] ===================\n`);

  for (const cuit of cuitsToTest) {
    console.log(`🔍 CUIT: ${cuit}`);

    // Source A: AFIP Constancia Abierta
    try {
      const url = `https://serviciosweb.afip.gob.ar/genericos/cuit/`;
      const res = await axios.post(url, `cuit=${cuit}`, {
        httpsAgent,
        timeout: 4500,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      console.log(`  ✅ AFIP Constancia Status: ${res.status} | Respondió HTML de constancia`);
    } catch (e) {
      console.log(`  ⚠️ AFIP Constancia: ${e.message}`);
    }

    // Source B: Open CUIT Registry
    try {
      const url = `https://cuit.online/constancia/inscripcion/${cuit}`;
      const res = await axios.get(url, {
        httpsAgent,
        timeout: 4500,
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) OSINT-Tecno3F/4.0' }
      });
      console.log(`  ✅ cuit.online Status: ${res.status}`);
    } catch (e) {
      console.log(`  ⚠️ cuit.online: ${e.message}`);
    }

    console.log('--------------------------------------------------');
  }
}

testOpenPadronSources();
