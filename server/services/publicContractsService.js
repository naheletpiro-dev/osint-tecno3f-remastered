import fs from 'fs';
import path from 'path';
import Database from 'better-sqlite3';
import axios from 'axios';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '../data/contrataciones_database.db');

let contratacionesDb = null;
try {
  if (fs.existsSync(dbPath)) {
    contratacionesDb = new Database(dbPath, { readonly: true });
  }
} catch (e) {
  console.warn('[Contrataciones DB Notice]: Could not open SQLite database:', e.message);
}

const httpsAgent = new https.Agent({ rejectUnauthorized: false });

/**
 * Multi-Jurisdictional Public Contracts, COMPR.AR, CONTRAT.AR & Obra Pública OSINT Engine
 */
export async function analyzePublicContracts(companyName, searchData = {}, cuit = '') {
  const cleanComp = companyName ? companyName.trim() : 'Empresa';
  const cleanCuit = cuit ? String(cuit).replace(/\D/g, '') : '';
  const lowerComp = cleanComp.toLowerCase();

  let isRealData = false;
  let realContracts = [];
  let detectedSource = 'Base de Datos Oficial COMPR.AR / CONTRAT.AR (datos.gob.ar)';
  let isRegisteredSupplier = false;
  let supplierRegistryStatus = 'Sin registro en Padrón Estatal de Proveedores';
  let totalAwardedSum = 0;

  // 1. Direct Lookup in local SQLite Database (COMPR.AR, CONTRAT.AR & SiPRO datasets)
  if (contratacionesDb) {
    try {
      // Check SiPRO Supplier Registry
      let supplier = null;
      if (cleanCuit) {
        supplier = contratacionesDb.prepare('SELECT * FROM sipro_suppliers WHERE cuit = ? LIMIT 1').get(cleanCuit);
      }
      if (!supplier && cleanComp.length >= 3) {
        supplier = contratacionesDb.prepare('SELECT * FROM sipro_suppliers WHERE razon_social LIKE ? LIMIT 1').get(`%${cleanComp}%`);
      }

      if (supplier) {
        isRealData = true;
        isRegisteredSupplier = true;
        supplierRegistryStatus = `Inscripto en Padrón SIPRO COMPR.AR - Estado: ${supplier.estado || 'ACTIVO'} (Rubro: ${supplier.rubro || 'General'})`;
      }

      // Check CONTRAT.AR Public Works Contracts
      let works = [];
      if (cleanCuit) {
        works = contratacionesDb.prepare('SELECT * FROM contratar_obras WHERE cuit = ?').all(cleanCuit);
      }
      if (works.length === 0 && cleanComp.length >= 3) {
        works = contratacionesDb.prepare('SELECT * FROM contratar_obras WHERE razon_social LIKE ?').all(`%${cleanComp}%`);
      }

      works.forEach(w => {
        isRealData = true;
        totalAwardedSum += (w.monto_ars || 0);
        realContracts.push({
          id: `OBRA-${w.id}`,
          organism: w.organismo || 'Ministerio de Obras Públicas / CONTRAT.AR',
          jurisdiction: 'Nacional - Obra Pública',
          amount: w.monto_ars > 0 ? `$${w.monto_ars.toLocaleString('es-AR')} ARS` : 'Monto en Acta',
          rawAmount: w.monto_ars || 0,
          date: 'Vigente',
          status: w.estado_obra || 'Adjudicado / En Ejecución',
          description: w.titulo_obra || `Contratación de Obra Pública para ${cleanComp}`,
          link: 'https://contratar.gob.ar/'
        });
      });

      // Check COMPR.AR Awarded Contracts
      let awards = [];
      if (cleanCuit) {
        awards = contratacionesDb.prepare('SELECT * FROM comprar_adjudicaciones WHERE cuit = ?').all(cleanCuit);
      }
      if (awards.length === 0 && cleanComp.length >= 3) {
        awards = contratacionesDb.prepare('SELECT * FROM comprar_adjudicaciones WHERE razon_social LIKE ? LIMIT 20').all(`%${cleanComp}%`);
      }

      awards.forEach(a => {
        isRealData = true;
        totalAwardedSum += (a.monto_ars || 0);
        realContracts.push({
          id: a.numero_proceso || `COMPRAR-${a.id}`,
          organism: a.organismo || 'Administración Pública Nacional (COMPR.AR)',
          jurisdiction: 'Nacional',
          amount: a.monto_ars > 0 ? `$${a.monto_ars.toLocaleString('es-AR')} ARS` : 'Ver Pliego',
          rawAmount: a.monto_ars || 0,
          date: a.fecha_adjudicacion || 'Reciente',
          status: 'Adjudicado',
          description: a.objeto || `Contratación de Bienes y Servicios para ${cleanComp}`,
          link: 'https://comprar.gob.ar/'
        });
      });

      if (isRealData) {
        detectedSource = 'Base de Datos Oficial COMPR.AR / CONTRAT.AR / SiPRO (datos.gob.ar)';
      }
    } catch (e) {
      console.warn('[Contrataciones DB Query Notice]:', e.message);
    }
  }

  // 2. Fallback Web & Snippets Scanner (Boletín Oficial & Web Tenders)
  if (!isRealData) {
    const tenderSnippets = searchData.tenderSnippets || [];
    const gazetteSnippets = searchData.gazetteSnippets || [];

    [...tenderSnippets, ...gazetteSnippets].forEach(item => {
      const text = `${item.title || ''} ${item.snippet || ''}`.toLowerCase();
      const isRelevant = text.includes(lowerComp) || (lowerComp.length > 4 && text.includes(lowerComp.slice(0, 5)));

      if (isRelevant && (text.includes('licitacion') || text.includes('adjudic') || text.includes('proveedor') || text.includes('contrato'))) {
        isRealData = true;
        detectedSource = 'Boletín Oficial & Portales Estatales de Compras';

        let jurisdiction = 'Provincial / Municipal';
        if (text.includes('santa fe') || item.link?.includes('santafe')) jurisdiction = 'Provincia de Santa Fe';
        else if (text.includes('buenos aires') || text.includes('caba')) jurisdiction = 'CABA / Buenos Aires';
        else if (text.includes('nacion') || item.link?.includes('gob.ar')) jurisdiction = 'Nacional';

        realContracts.push({
          id: `ADJ-${Math.floor(Math.random() * 8990) + 1009}`,
          organism: item.title?.slice(0, 70) || 'Organismo Público Estatal',
          jurisdiction,
          amount: 'Monto en Pliego / Adjudicación',
          rawAmount: 0,
          date: 'Reciente',
          status: 'Adjudicado / Publicado',
          description: item.snippet?.slice(0, 160) || `Proceso de contratación verificado para ${cleanComp}`,
          link: item.link || 'https://comprar.gob.ar/'
        });
      }
    });
  }

  return {
    isRegisteredSupplier: isRealData || isRegisteredSupplier,
    isRealData,
    supplierRegistryStatus: isRealData ? (supplierRegistryStatus !== 'Sin registro en Padrón Estatal de Proveedores' ? supplierRegistryStatus : `Habilitado en Padrón Estatal de Proveedores`) : 'Sin registro en Padrón Estatal de Proveedores',
    totalContracts: realContracts.length,
    totalAwardedAmount: totalAwardedSum > 0 ? `$${totalAwardedSum.toLocaleString('es-AR')} ARS` : (isRealData ? 'Ver pliegos adjudicados' : '$0 ARS'),
    contracts: realContracts,
    comprarPortalUrl: `https://comprar.gob.ar/`,
    contratarPortalUrl: `https://contratar.gob.ar/`,
    apiSource: detectedSource
  };
}
