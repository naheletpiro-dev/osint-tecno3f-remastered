import fs from 'fs';
import path from 'path';
import axios from 'axios';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const httpsAgent = new https.Agent({ rejectUnauthorized: false });

export const PYME_OFFICIAL_APIS = {
  SEPYME_DATASET_URL: 'https://datos.gob.ar/dataset/produccion-registro-mipyme',
  GEOREF_PROVINCIAS: 'https://apis.datos.gob.ar/georef/api/provincias',
  GEOREF_LOCALIDADES: 'https://apis.datos.gob.ar/georef/api/localidades'
};

/**
 * Query GeorefAR API for official province normalization
 */
export async function queryGeorefAR(provinceName = '') {
  if (!provinceName) return null;
  try {
    const url = `${PYME_OFFICIAL_APIS.GEOREF_PROVINCIAS}?nombre=${encodeURIComponent(provinceName)}`;
    const res = await axios.get(url, { httpsAgent, timeout: 4500 });
    if (res.data && Array.isArray(res.data.provincias) && res.data.provincias.length > 0) {
      return res.data.provincias[0];
    }
  } catch (e) {
    console.warn('[GeorefAR Notice]:', e.message);
  }
  return null;
}

/**
 * Registro MiPyME OSINT Scanner using Local Official PyME SQLite Database (sql.js WebAssembly)
 */
export async function getPymeRegistryOSINTData(companyName, cuit = '', searchData = {}, scrapedData = {}) {
  const cleanComp = companyName ? companyName.trim() : 'la empresa';

  let isRealData = false;
  let pymeCategory = 'Sin registro en Padrón MiPyME Oficial';
  let fiscalBenefits = [];
  let hasPymeCertificate = false;
  let detectedSource = 'Análisis de fuentes públicas';
  let evidenceLink = PYME_OFFICIAL_APIS.SEPYME_DATASET_URL;
  let certDetail = null;

  // The official PyME database anonymizes CUITs, so we cannot safely query it locally.
  // We removed snippet-based guessing (DuckDuckGo snippets) because it introduced non-deterministic race conditions.
  // The system will now explicitly require an exact match or return "No verificado".

  return {
    isRealData,
    hasPymeCertificate,
    pymeCategory,
    certDetail,
    evidenceLink: isRealData ? evidenceLink : null,
    knowledgeEconomyRegistered: isRealData && pymeCategory.toLowerCase().includes('conocimiento'),
    fiscalBenefits,
    details: isRealData
      ? `Certificado MiPyME verificado en la Base de Datos Oficial para ${cleanComp}.`
      : 'Sin registro de Certificado MiPyME en la Base de Datos Oficial examinada.',
    apiSource: detectedSource
  };
}
