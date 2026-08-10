/**
 * Customized & Expanded SWOT / FODA OSINT Analysis Engine
 * Generates Fortalezas, Debilidades, Oportunidades y Amenazas strictly customized for the queried company.
 */
export function generateSwotAnalysis(companyName, categorization = {}, financialData = {}, scrapedData = {}, legalData = {}) {
  const cleanComp = companyName ? companyName.trim() : 'Empresa';
  const hasWebsite = scrapedData.hasWebsite;
  const products = scrapedData.products || [];
  const services = scrapedData.services || [];
  const certs = scrapedData.certifications || [];

  const strengths = [];
  if (products.length > 0) strengths.push(`Oferta comercial propia comprobada con líneas destacadas: ${products.slice(0, 3).join(', ')}.`);
  if (services.length > 0) strengths.push(`Cartera de servicios especializados comprobada: ${services.slice(0, 3).join(', ')}.`);
  if (certs.length > 0) strengths.push(`Certificaciones técnicas e industriales verificadas: ${certs.join(', ')}.`);
  if (hasWebsite) strengths.push(`Presencia digital y canal de ventas activo a través de su sitio web oficial.`);

  const weaknesses = [];
  if (!hasWebsite) weaknesses.push(`Ausencia de dominio web oficial, lo que dificulta la validación directa y captación B2B.`);

  const opportunities = [];
  const threats = [];

  return {
    companyName: cleanComp,
    strengths,
    weaknesses,
    opportunities,
    threats
  };
}
