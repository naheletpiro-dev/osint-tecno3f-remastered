import axios from 'axios';
import * as cheerio from 'cheerio';

async function testDateas(companyName) {
  try {
    let cuitLookupUrl = `https://www.dateas.com/es/consulta_cuit_cuil?name=${encodeURIComponent(companyName)}`;
    console.log("Fetching: " + cuitLookupUrl);
    const cuitRes = await axios.get(cuitLookupUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Accept-Language': 'es-AR,es;q=0.9,en;q=0.8'
      },
      timeout: 10000
    });
    console.log("Status: " + cuitRes.status);
    const matches = cuitRes.data.match(/\b(20|23|24|27|30|33|34)[-–]?\d{8}[-–]?\d\b/g);
    console.log("Matches: ", matches);
  } catch (e) {
    console.error("Error: ", e.message);
  }
}

testDateas("Mercado Libre");
