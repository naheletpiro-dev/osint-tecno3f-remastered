import axios from 'axios';
import https from 'https';

const httpsAgent = new https.Agent({ rejectUnauthorized: false });

const testEndpoints = [
  { name: 'Deudores (Smartmation CUIT)', url: 'https://api.bcra.gob.ar/centraldedeudores/v1.0/Deudas/30711674483' },
  { name: 'Cheques Rechazados (Smartmation CUIT)', url: 'https://api.bcra.gob.ar/centraldedeudores/v1.0/Deudas/ChequesRechazados/30711674483' },
  { name: 'Estadísticas Cambiarias - Divisas Maestros', url: 'https://api.bcra.gob.ar/estadisticascambiarias/v1.0/Maestros/Divisas' },
  { name: 'Estadísticas Cambiarias - Cotizaciones', url: 'https://api.bcra.gob.ar/estadisticascambiarias/v1.0/Cotizaciones' },
  { name: 'Estadísticas Cambiarias - Cotización USD (cod 2)', url: 'https://api.bcra.gob.ar/estadisticascambiarias/v1.0/Cotizaciones/2' },
  { name: 'Cheques - Entidades', url: 'https://api.bcra.gob.ar/cheques/v1.0/entidades' },
  { name: 'Cheques - Denunciados (Entidad 007 / Cheque 123456)', url: 'https://api.bcra.gob.ar/cheques/v1.0/denunciados/007/123456' },
  { name: 'Estadísticas - Metodología', url: 'https://api.bcra.gob.ar/estadisticas/v4.0/Metodologia' },
  { name: 'Estadísticas - Metodología Variable 1', url: 'https://api.bcra.gob.ar/estadisticas/v4.0/Metodologia/1' },
  { name: 'Estadísticas - Monetarias', url: 'https://api.bcra.gob.ar/estadisticas/v4.0/Monetarias' },
  { name: 'Estadísticas - Monetarias Variable 1', url: 'https://api.bcra.gob.ar/estadisticas/v4.0/Monetarias/1' },
  { name: 'Transparencia - Cajas de Ahorros', url: 'https://api.bcra.gob.ar/transparencia/v1.0/CajasAhorros' },
  { name: 'Transparencia - Paquetes de Productos', url: 'https://api.bcra.gob.ar/transparencia/v1.0/PaquetesProductos' },
  { name: 'Transparencia - Plazos Fijos', url: 'https://api.bcra.gob.ar/transparencia/v1.0/PlazosFijos' },
  { name: 'Transparencia - Préstamos Prendarios', url: 'https://api.bcra.gob.ar/transparencia/v1.0/Prestamos/Prendarios' },
  { name: 'Transparencia - Préstamos Hipotecarios', url: 'https://api.bcra.gob.ar/transparencia/v1.0/Prestamos/Hipotecarios' },
  { name: 'Transparencia - Préstamos Personales', url: 'https://api.bcra.gob.ar/transparencia/v1.0/Prestamos/Personales' },
  { name: 'Transparencia - Tarjetas de Crédito', url: 'https://api.bcra.gob.ar/transparencia/v1.0/TarjetasCredito' }
];

async function runBcraApiAudit() {
  console.log(`=================== [AUDITORÍA EN VIVO APIS BCRA] ===================\n`);
  const results = [];

  for (const ep of testEndpoints) {
    const startTime = Date.now();
    try {
      const response = await axios.get(ep.url, {
        httpsAgent,
        timeout: 5000,
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) OSINT-Tecno3F/4.0' }
      });

      const durationMs = Date.now() - startTime;
      const status = response.data?.status || response.status;
      const hasResults = !!(response.data?.results || response.data);

      console.log(`✅ [OK 200] ${ep.name}`);
      console.log(`   URL: ${ep.url}`);
      console.log(`   Duración: ${durationMs}ms | Status Code: ${status}`);
      if (Array.isArray(response.data?.results)) {
        console.log(`   Resultados recibidos: ${response.data.results.length} ítems`);
      }
      console.log('--------------------------------------------------');

      results.push({ name: ep.name, status: 'OK (200)', durationMs, items: Array.isArray(response.data?.results) ? response.data.results.length : 1 });
    } catch (err) {
      const durationMs = Date.now() - startTime;
      const statusCode = err.response ? err.response.status : 'TIMED_OUT/NET_ERROR';
      console.log(`⚠️ [NOTICE ${statusCode}] ${ep.name}`);
      console.log(`   URL: ${ep.url}`);
      console.log(`   Duración: ${durationMs}ms | Detalle: ${err.message}`);
      console.log('--------------------------------------------------');

      results.push({ name: ep.name, status: `HTTP ${statusCode}`, durationMs, detail: err.message });
    }
  }

  console.log(`\n=================== [RESUMEN FINAL DE COMPROBACIÓN] ===================`);
  console.table(results);
}

runBcraApiAudit();
