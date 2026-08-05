import { cleanSectorName } from './websiteScraperService.js';

/**
 * OSINT Categorization Service for Companies
 * Classifies industry, business model, size, and operational profile cleanly.
 */
export function categorizeCompany(companyName, scrapedData = {}, searchResults = {}) {
  const projects = scrapedData.projects || [];
  const newsItems = searchResults.newsItems || [];

  const combinedText = (
    companyName + ' ' +
    (scrapedData.title || '') + ' ' +
    (scrapedData.description || '') + ' ' +
    (scrapedData.aboutUs || '') + ' ' +
    (scrapedData.services || []).join(' ') + ' ' +
    projects.join(' ')
  ).toLowerCase();

  // Clean Industry Sector Classifier
  let sector = cleanSectorName(scrapedData.customSector, companyName);
  let sectorIcon = 'briefcase';

  if (!scrapedData.customSector || sector === 'Servicios Comerciales & Provisión Industrial') {
    if (matchAny(combinedText, ['zeziola', 'dobladora', 'curvado', 'caño', 'tubo', 'perfil', 'matriceria'])) {
      sector = 'Fabricación de Dobladoras de Caños & Curvado Industrial';
      sectorIcon = 'box';
    } else if (matchAny(combinedText, ['valvula', 'neumatic', 'instrumento'])) {
      sector = 'Válvulas, Instrumentación Neumática & Control de Procesos';
      sectorIcon = 'sliders';
    } else if (matchAny(combinedText, ['smartmation', 'telegestión', 'iot', 'alumbrado'])) {
      sector = 'Telegestión Cloud e IoT para Alumbrado Público y Smart Cities';
      sectorIcon = 'cpu';
    } else if (matchAny(combinedText, ['metal', 'taller', 'torneria', 'industrial', 'maquinaria', 'construccion', 'obra', 'fabrica', 'manufactura', 'herreria'])) {
      sector = 'Industria Metalúrgica, Tornería CNC & Mecanizado';
      sectorIcon = 'box';
    } else if (matchAny(combinedText, ['tech', 'software', 'app', 'digital', 'cloud', 'ia', 'ai', 'sistemas', 'data', 'ciberseguridad'])) {
      sector = 'Tecnología & Software';
      sectorIcon = 'cpu';
    } else if (matchAny(combinedText, ['finanz', 'banco', 'pay', 'cobro', 'credito', 'seguro', 'fintech', 'presta'])) {
      sector = 'Finanzas & Servicios Comerciales';
      sectorIcon = 'dollar-sign';
    } else if (matchAny(combinedText, ['salud', 'medica', 'farmac', 'clinic', 'hospital', 'sanatorio'])) {
      sector = 'Salud & Biotecnología';
      sectorIcon = 'activity';
    } else if (matchAny(combinedText, ['tienda', 'shop', 'ecommerce', 'retail', 'venta', 'comercio'])) {
      sector = 'Retail & Comercio';
      sectorIcon = 'shopping-bag';
    } else if (matchAny(combinedText, ['alimento', 'bebida', 'gastronomia', 'agro', 'campo'])) {
      sector = 'Agro, Alimentos & Gastronomía';
      sectorIcon = 'coffee';
    } else if (matchAny(combinedText, ['logistica', 'transporte', 'envio', 'distribucion', 'flete'])) {
      sector = 'Logística & Transporte';
      sectorIcon = 'truck';
    }
  }

  // Business Model Classifier
  let businessModel = 'B2B (Servicios y Provisión a Empresas)';
  if (matchAny(combinedText, ['consumidor', 'minorista', 'b2c', 'venta al publico', 'local'])) {
    businessModel = 'B2C (Atención a Consumidores Finales)';
  } else if (matchAny(combinedText, ['mayorista', 'distribuidor', 'proveedor industrial'])) {
    businessModel = 'B2B & Proveedor Industrial';
  } else if (matchAny(combinedText, ['licitacion', 'obras publicas', 'contratista'])) {
    businessModel = 'B2G / B2B (Contratista de Obras y Servicios)';
  }

  // Scale & Workforce Estimation
  let estimatedEmployees = '10 - 50 Empleados';
  let companyType = 'PyME Industrial / Comercial';

  if (projects.length > 3 || newsItems.length > 2) {
    estimatedEmployees = '30 - 150 Empleados';
    companyType = 'Empresa Consolidada en el Sector';
  }

  // Executive Description Synthesis for "Resumen General" (What company is & what it sells)
  const productsList = scrapedData.products && scrapedData.products.length > 0 ? scrapedData.products : [];
  const summary = (scrapedData.aboutUs && scrapedData.aboutUs.length > 30 && !scrapedData.aboutUs.includes('javascript'))
    ? scrapedData.aboutUs
    : `${companyName} es una empresa especializada en ${sector}. Se dedica a la provisión y comercialización de ${productsList.slice(0, 3).join(', ') || 'soluciones especializadas'}, ofreciendo servicios integrales en su rubro.`;

  return {
    sector,
    sectorIcon,
    businessModel,
    companyType,
    estimatedEmployees,
    summary,
    services: scrapedData.services && scrapedData.services.length > 0 ? scrapedData.services : [
      'Provisión de productos y servicios especializados en su rubro.',
      'Atención personalizada a clientes y empresas asociadas.',
      'Ejecución de proyectos a medida.'
    ],
    tags: [sector, businessModel, companyType, scrapedData.hasWebsite ? 'Sitio Web Verificado' : 'Investigado via Fuentes Abiertas']
  };
}

function matchAny(text, keywords) {
  return keywords.some(kw => text.includes(kw));
}
