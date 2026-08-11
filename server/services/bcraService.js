import axios from 'axios';
import https from 'https';

const httpsAgent = new https.Agent({ rejectUnauthorized: false });

/**
 * BCRA Situation Codes Mapping & Descriptions
 */
export const BCRA_SITUATIONS = {
  1: { label: 'Situación 1 (Normal)', description: 'Pago puntual, atraso no superior a 31 días. Sin riesgo crediticio registrado.', color: '#10b981', priority: 'NORMAL' },
  2: { label: 'Situación 2 (Seguimiento Especial)', description: 'Atraso de 31 a 90 días en el pago de obligaciones.', color: '#f59e0b', priority: 'MEDIO' },
  3: { label: 'Situación 3 (Con Problemas)', description: 'Atraso de 91 a 180 días en el pago de obligaciones.', color: '#f97316', priority: 'ALTO' },
  4: { label: 'Situación 4 (Alto Riesgo)', description: 'Atraso de 181 a 365 días en el pago de obligaciones.', color: '#ef4444', priority: 'CRÍTICO' },
  5: { label: 'Situación 5 (Irrecuperable)', description: 'Atrasos superiores a 365 días en el pago de deudas bancarias.', color: '#dc2626', priority: 'IRRECUPERABLE' },
  6: { label: 'Situación 6 (Disposición Técnica)', description: 'Deuda en situación técnica o entidad financiera liquidadas.', color: '#6b7280', priority: 'TÉCNICO' }
};

/**
 * Format raw CUIT to standard XX-XXXXXXXX-X
 */
export function formatCuit(cuitStr) {
  if (!cuitStr) return '';
  const clean = String(cuitStr).replace(/\D/g, '');
  if (clean.length !== 11) return cuitStr;
  return `${clean.slice(0, 2)}-${clean.slice(2, 10)}-${clean.slice(10)}`;
}

/**
 * Fetch BCRA Deudores data for a given CUIT/CUIL
 * HTTP 404 indicates a 100% clean credit record with 0 debts.
 */
export async function fetchBcraDeudores(cuit, companyName = '') {
  const cleanCuit = String(cuit).replace(/\D/g, '');
  if (!cleanCuit || cleanCuit.length < 10) return null;

  try {
    const url = `https://api.bcra.gob.ar/centraldedeudores/v1.0/Deudas/${cleanCuit}`;
    const response = await axios.get(url, {
      httpsAgent,
      timeout: 4500,
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) OSINT-Tecno3F/4.0' }
    });

    if (response.data && response.data.status === 200 && response.data.results) {
      return { ...response.data.results, isRealData: true, hasDebts: true };
    }
  } catch (error) {
    if (error.response && error.response.status === 404) {
      console.log(`[BCRA API INFO] CUIT ${cleanCuit}: Sin deudas bancarias registradas en BCRA (OK).`);
      return {
        isRealData: true,
        hasDebts: false,
        denominacion: companyName,
        periodos: []
      };
    } else {
      console.warn(`[BCRA API Notice] Could not fetch deudores for ${cleanCuit}:`, error.message);
    }
  }
  return null;
}

/**
 * Fetch BCRA Cheques Rechazados data for a given CUIT/CUIL
 * HTTP 404 indicates 0 rejected cheques.
 */
export async function fetchBcraChequesRechazados(cuit) {
  const cleanCuit = String(cuit).replace(/\D/g, '');
  if (!cleanCuit || cleanCuit.length < 10) return null;

  try {
    const url = `https://api.bcra.gob.ar/centraldedeudores/v1.0/Deudas/ChequesRechazados/${cleanCuit}`;
    const response = await axios.get(url, {
      httpsAgent,
      timeout: 4500,
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) OSINT-Tecno3F/4.0' }
    });

    if (response.data && response.data.status === 200 && response.data.results) {
      return { ...response.data.results, isRealData: true, hasCheques: true };
    }
  } catch (error) {
    if (error.response && error.response.status === 404) {
      console.log(`[BCRA API INFO] CUIT ${cleanCuit}: Sin cheques rechazados en BCRA (OK).`);
      return {
        isRealData: true,
        hasCheques: false,
        causas: []
      };
    } else {
      console.warn(`[BCRA API Notice] Could not fetch cheques for ${cleanCuit}:`, error.message);
    }
  }
  return null;
}

/**
 * Main OSINT BCRA Data Fetcher & Synthesizer
 */
export async function getBcraOSINTData(companyName, cuitInput = null) {
  let targetCuit = cuitInput ? String(cuitInput).replace(/\D/g, '') : null;

  if (!targetCuit || targetCuit.length !== 11) {
    return {
      cuit: 'N/D',
      cuitRaw: null,
      denominacionBCRA: companyName,
      isRealData: false,
      hasDebts: false,
      hasCheques: false,
      situacionMax: 1,
      situacionLabel: 'Dato no disponible en API BCRA (Requiere CUIT verificado)',
      situacionDescription: 'Se requiere una CUIT oficial de ARCA/AFIP para consultar la Central de Deudores BCRA.',
      situacionColor: '#64748b',
      periodoMasReciente: 'Dato no disponible en registros públicos',
      entidadesCreditoras: [],
      totalDeudaBancariaARS: '$0 ARS',
      chequesRechazados: {
        totalCount: 0,
        totalMontoARS: '$0 ARS',
        totalMontoRaw: 0,
        chequesList: []
      },
      bcraOfficialQueryUrl: `https://www.bcra.gob.ar/situacion-crediticia/`,
      apiSource: 'Dato no disponible en API BCRA (Requiere CUIT)'
    };
  }

  const [deudoresResult, chequesResult] = await Promise.allSettled([
    fetchBcraDeudores(targetCuit, companyName),
    fetchBcraChequesRechazados(targetCuit)
  ]);

  const deudoresData = deudoresResult.status === 'fulfilled' ? deudoresResult.value : null;
  const chequesData = chequesResult.status === 'fulfilled' ? chequesResult.value : null;

  const isRealData = !!(deudoresData?.isRealData || chequesData?.isRealData);
  const hasDebts = deudoresData?.hasDebts || false;
  const hasCheques = chequesData?.hasCheques || false;

  let denominacion = companyName;
  let periodoMasReciente = null;
  let entidadesCreditoras = [];
  let situacionMax = 1;

  let history24Months = [];
  let worstHistoricalSituation = 1;

  if (deudoresData && hasDebts && Array.isArray(deudoresData.periodos)) {
    denominacion = deudoresData.denominacion || companyName;

    // Take up to 24 monthly periods
    const periodsToProcess = deudoresData.periodos.slice(0, 24);

    if (periodsToProcess.length > 0) {
      const latestPeriod = periodsToProcess[0];
      periodoMasReciente = latestPeriod.periodo;

      if (Array.isArray(latestPeriod.entidades)) {
        entidadesCreditoras = latestPeriod.entidades.map(ent => {
          const sit = Number(ent.situacion) || 1;
          if (sit > situacionMax) situacionMax = sit;

          const montoNum = (Number(ent.monto) || 0) * 1000;
          return {
            entidad: ent.entidad,
            situacion: sit,
            situacionInfo: BCRA_SITUATIONS[sit] || BCRA_SITUATIONS[1],
            montoARS: `$${montoNum.toLocaleString('es-AR')} ARS`,
            montoRaw: montoNum,
            diasAtraso: Number(ent.diasAtrasoPago) || 0
          };
        });
      }

      // Process full 24-month historical trend
      history24Months = periodsToProcess.map(p => {
        let maxSitInPeriod = 1;
        let totalPeriodDebt = 0;
        let entitiesList = [];

        if (Array.isArray(p.entidades)) {
          entitiesList = p.entidades.map(ent => {
            const sit = Number(ent.situacion) || 1;
            if (sit > maxSitInPeriod) maxSitInPeriod = sit;
            if (sit > worstHistoricalSituation) worstHistoricalSituation = sit;
            const monto = (Number(ent.monto) || 0) * 1000;
            totalPeriodDebt += monto;
            return {
              entidad: ent.entidad,
              situacion: sit,
              montoRaw: monto,
              diasAtraso: Number(ent.diasAtrasoPago) || 0
            };
          });
        }

        const rawPeriod = String(p.periodo || '');
        const formattedPeriod = rawPeriod.length === 6 ? `${rawPeriod.slice(0, 4)}-${rawPeriod.slice(4)}` : rawPeriod;

        return {
          periodoRaw: p.periodo,
          periodo: formattedPeriod,
          situacionMax: maxSitInPeriod,
          situacionInfo: BCRA_SITUATIONS[maxSitInPeriod] || BCRA_SITUATIONS[1],
          totalDeudaARS: `$${totalPeriodDebt.toLocaleString('es-AR')} ARS`,
          totalDeudaRaw: totalPeriodDebt,
          entidadesCount: entitiesList.length,
          entidades: entitiesList
        };
      });
    }
  }

  // Calculate 24-Month Trend Analysis
  const currentSit = situacionMax;
  let trendType = 'ESTABLE_SIN_RIESGO';
  let trendLabel = '➔ Historial Impecable (100% Situación 1 en 24 meses)';
  let trendBadgeColor = '#10b981';
  let trendSummary = 'La empresa ha mantenido un comportamiento crediticio regular e intachable (Situación 1) durante los últimos 24 meses auditados en la Central de Deudores BCRA.';

  if (history24Months.length > 1) {
    const oldestSit = history24Months[history24Months.length - 1].situacionMax;

    if (worstHistoricalSituation > 1) {
      if (currentSit < worstHistoricalSituation && currentSit <= 2) {
        trendType = 'MEJORANDO';
        trendLabel = `↗ Tendencia Positiva: Recuperación Crediticia (Pasó de Situación ${worstHistoricalSituation} a Situación ${currentSit})`;
        trendBadgeColor = '#3b82f6';
        trendSummary = `Evolución positiva destacable: La empresa registró atrasos pasados (Situación ${worstHistoricalSituation} histórica), pero ha regularizado su cartera crediticia a Situación ${currentSit} en el período reciente.`;
      } else if (currentSit > oldestSit || currentSit > 1) {
        trendType = 'DETERIORANDO';
        trendLabel = `↘ Tendencia Negativa: Deterioro en la Calificación (Pasó a Situación ${currentSit})`;
        trendBadgeColor = '#ef4444';
        trendSummary = `Alerta de deterioro financiero: La empresa presenta incremento en sus niveles de morosidad bancaria, alcanzando Situación ${currentSit} (${BCRA_SITUATIONS[currentSit]?.label || ''}).`;
      } else {
        trendType = 'ESTABLE_EN_RIESGO';
        trendLabel = `➔ Morosidad Recurrente Persistente (Situación ${currentSit} sostenida)`;
        trendBadgeColor = '#f59e0b';
        trendSummary = `Comportamiento en observación: La empresa mantiene calificaciones con atrasos persistentes en entidades bancarias durante el período auditado.`;
      }
    }
  }

  // Parse Cheques Rechazados
  let chequesList = [];
  let chequesTotalCount = 0;
  let chequesTotalMonto = 0;

  if (chequesData && hasCheques && Array.isArray(chequesData.causas)) {
    chequesData.causas.forEach(causa => {
      if (Array.isArray(causa.cheques)) {
        causa.cheques.forEach(ch => {
          chequesTotalCount++;
          const montoCh = Number(ch.monto) || 0;
          chequesTotalMonto += montoCh;
          chequesList.push({
            nroCheque: ch.nroCheque || 'N/D',
            fechaRechazo: ch.fechaRechazo || 'N/D',
            montoARS: `$${montoCh.toLocaleString('es-AR')} ARS`,
            montoRaw: montoCh,
            causa: causa.causa || 'Sin especificación',
            estado: ch.fechaPago ? 'Pagado' : 'Impago'
          });
        });
      }
    });
  }

  const situacionInfo = BCRA_SITUATIONS[situacionMax] || BCRA_SITUATIONS[1];

  const situacionLabel = isRealData
    ? (!hasDebts && !hasCheques
        ? 'Sin deudas bancarias ni morosidad registradas (Situación 1 - Normal)'
        : situacionInfo.label)
    : 'Dato no disponible en API BCRA en vivo';

  const situacionDescription = isRealData
    ? (!hasDebts && !hasCheques
        ? 'La CUIT fue consultada en vivo en la Central de Deudores BCRA y no registra deudas ni cheques rechazados en entidades financieras.'
        : situacionInfo.description)
    : 'La consulta en vivo a la Central de Deudores BCRA no devolvió información para esta CUIT.';

  return {
    cuit: formatCuit(targetCuit),
    cuitRaw: targetCuit,
    denominacionBCRA: denominacion,
    isRealData,
    hasDebts,
    hasCheques,
    situacionMax,
    worstHistoricalSituation,
    trendAnalysis: {
      type: trendType,
      label: trendLabel,
      color: trendBadgeColor,
      summary: trendSummary,
      totalMonthsAudited: history24Months.length
    },
    history24Months,
    situacionLabel,
    situacionDescription,
    situacionColor: isRealData ? (situacionMax === 1 ? '#10b981' : situacionInfo.color) : '#64748b',
    periodoMasReciente: periodoMasReciente ? `${periodoMasReciente.slice(0, 4)}-${periodoMasReciente.slice(4)}` : 'Vigente (Sin Deudas Registradas)',
    entidadesCreditoras,
    totalDeudaBancariaARS: `$${entidadesCreditoras.reduce((acc, e) => acc + e.montoRaw, 0).toLocaleString('es-AR')} ARS`,
    chequesRechazados: {
      totalCount: chequesTotalCount,
      totalMontoARS: `$${chequesTotalMonto.toLocaleString('es-AR')} ARS`,
      totalMontoRaw: chequesTotalMonto,
      chequesList
    },
    bcraOfficialQueryUrl: `https://www.bcra.gob.ar/situacion-crediticia/`,
    apiSource: isRealData ? 'API Oficial Central de Deudores BCRA (api.bcra.gob.ar)' : 'Dato no disponible en API BCRA en vivo'
  };
}

/**
 * Catálogo Oficial Completo de APIs del Banco Central de la República Argentina (BCRA)
 */
export const BCRA_OFFICIAL_APIS = {
  COTICIZACIONES_MONEDAS: 'https://api.bcra.gob.ar/estadisticascambiarias/v1.0/Cotizaciones',
  CHEQUES_ENTIDADES: 'https://api.bcra.gob.ar/cheques/v1.0/entidades',
  CHEQUES_DENUNCIADOS: 'https://api.bcra.gob.ar/cheques/v1.0/denunciados/{codigoEntidad}/{numeroCheque}',
  ESTADISTICAS_METODOLOGIA: 'https://api.bcra.gob.ar/estadisticas/v4.0/Metodologia',
  VARIABLES_MONETARIAS: 'https://api.bcra.gob.ar/estadisticas/v4.0/Monetarias',
  TRANSPARENCIA_AHORRO: 'https://api.bcra.gob.ar/transparencia/v1.0/CajasAhorros',
  TRANSPARENCIA_PAQUETES: 'https://api.bcra.gob.ar/transparencia/v1.0/PaquetesProductos',
  TRANSPARENCIA_PLAZOS_FIJOS: 'https://api.bcra.gob.ar/transparencia/v1.0/PlazosFijos',
  TRANSPARENCIA_PRESTAMOS_PRENDARIOS: 'https://api.bcra.gob.ar/transparencia/v1.0/Prestamos/Prendarios',
  TRANSPARENCIA_PRESTAMOS_HIPOTECARIOS: 'https://api.bcra.gob.ar/transparencia/v1.0/Prestamos/Hipotecarios',
  TRANSPARENCIA_PRESTAMOS_PERSONALES: 'https://api.bcra.gob.ar/transparencia/v1.0/Prestamos/Personales',
  TRANSPARENCIA_TARJETAS_CREDITO: 'https://api.bcra.gob.ar/transparencia/v1.0/TarjetasCredito'
};

export async function fetchBcraCotizaciones() {
  try {
    const res = await axios.get(BCRA_OFFICIAL_APIS.COTICIZACIONES_MONEDAS, { httpsAgent, timeout: 4500 });
    return res.data?.results || [];
  } catch (e) {
    return [];
  }
}

export async function fetchBcraMonetarias() {
  try {
    const res = await axios.get(BCRA_OFFICIAL_APIS.VARIABLES_MONETARIAS, { httpsAgent, timeout: 4500 });
    return res.data?.results || [];
  } catch (e) {
    return [];
  }
}
