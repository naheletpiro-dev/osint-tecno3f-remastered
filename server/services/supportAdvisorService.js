/**
 * OSINT Support & Action Plan Advisor Service for Companies
 * Generates tailored recommendations to support and empower the business with official funding programs.
 */
export function generateSupportPlan(companyName, categorization = {}, financialData = {}, scrapedData = {}, searchResults = {}) {
  const cleanComp = companyName ? companyName.trim() : 'la empresa';
  const sector = categorization.sector || 'su rubro industrial y comercial';
  const creditScore = financialData.creditScore || 75;
  const hasCheques = financialData.rejectedChequesCount > 0;
  
  const text = (companyName + ' ' + (scrapedData.aboutUs || '') + ' ' + (scrapedData.description || '')).toLowerCase();
  const isIndustrial = text.includes('taller') || text.includes('metal') || text.includes('mecaniz') || text.includes('fabric');
  const isTech = text.includes('soft') || text.includes('tech') || text.includes('cloud') || text.includes('iot');
  const isExporter = text.includes('export');

  const recommendations = [];

  // 1. Programa ANR 4.0 & Financiamiento a Tasa Subsidiada (FONTAR / SEPYME)
  if (isIndustrial || isTech) {
    recommendations.push({
      category: 'Financiamiento & Subsidios 4.0',
      priority: 'RECOMENDADA',
      icon: 'trending-up',
      title: 'Aportes No Reembolsables (ANR 4.0) & FONTAR para Modernización',
      description: `Asistencia financiera de co-financiamiento a través de SEPYME para incorporar tecnología en la matriz productiva de ${cleanComp}.`,
      actionSteps: [
        'Presentación del proyecto de modernización tecnológica ante la Agencia I+D+i.',
        'Solicitud de bonificación de tasa en líneas de financiamiento de inversión productiva BNA / Banco BICE.',
        'Formulación de carpetas técnicas para la adquisición de bienes de capital.'
      ]
    });
  }

  // 2. Crédito Fiscal PyME & Capacitación de Personal
  if (isIndustrial || categorization.businessModel?.includes('B2B')) {
    recommendations.push({
      category: 'Capacitación & Crédito Fiscal',
      priority: 'RECOMENDADA',
      icon: 'award',
      title: 'Programa de Crédito Fiscal para Capacitación & Certificaciones ISO',
      description: `Reembolso en bono de crédito fiscal para financiar la formación técnica del equipo de ${cleanComp} e implementar certificaciones de calidad (ISO).`,
      actionSteps: [
        'Inscripción en el Régimen de Crédito Fiscal de la Secretaría de Industria.',
        'Ejecución del plan anual de capacitación para mandos medios y técnicos.',
        'Cómputo del bono electrónico fiscal contra el pago de IVA y Ganancias.'
      ]
    });
  }

  // 3. Saneamiento vs Licitación
  if (creditScore < 72 || hasCheques) {
    recommendations.push({
      category: 'Saneamiento Financiero & Pasivos',
      priority: 'ALTA',
      icon: 'alert-triangle',
      title: 'Plan de Reestructuración de Deudas & Asistencia Crediticia SGR',
      description: `Regularización de la posición crediticia en la Central de Deudores BCRA mediante avales SGR para respaldar operaciones y acceder a tasas preferenciales.`,
      actionSteps: [
        'Gestionar moratoria fiscal y planes de facilidades de pago de AFIP / ARCA.',
        'Rescate e informe de cheques cancelados ante la Central de Deudores BCRA.',
        'Solicitar avales SGR para mejorar la calificación crediticia.'
      ]
    });
  } else if (creditScore > 85) {
    recommendations.push({
      category: 'Desarrollo Licitatorio & COMPR.AR',
      priority: 'RECOMENDADA',
      icon: 'briefcase',
      title: 'Consolidación en el Registro de Proveedores del Estado (COMPR.AR)',
      description: `Aprovechar la sólida salud financiera de ${cleanComp} (${creditScore}/100 pts) para postular a licitaciones públicas de gran escala.`,
      actionSteps: [
        'Actualizar el Certificado MiPyME y la capacidad licitatoria aprobada.',
        'Activar alertas automatizadas de pliegos licitatorios.',
        'Presentar antecedentes técnicos comprobables en licitaciones.'
      ]
    });
  }

  // 4. Internacionalización
  if (isExporter) {
    recommendations.push({
      category: 'Internacionalización & Comercio Exterior',
      priority: 'MEDIA',
      icon: 'globe',
      title: 'Asistencia Técnica para Posicionamiento Exportador',
      description: `Incorporación de ${cleanComp} en misiones comerciales internacionales y rondas de negocios para potenciar su matriz exportadora.`,
      actionSteps: [
        'Elaboración del perfil exportador en la plataforma Argentina Trade Net.',
        'Participación en ferias internacionales con subsidio de stand institucional.',
        'Adecuación de certificaciones para exportación.'
      ]
    });
  }

  if (recommendations.length === 0) {
     recommendations.push({
      category: 'Optimización Operativa Base',
      priority: 'MEDIA',
      icon: 'activity',
      title: 'Auditoría Inicial de Procesos Comerciales',
      description: `Evaluación primaria de flujos operativos para detectar oportunidades de eficiencia en ${cleanComp}.`,
      actionSteps: [
        'Mapeo de canales de adquisición B2B.',
        'Revisión de estructura de costos logísticos.'
      ]
    });
  }

  const supportTier = creditScore >= 75
    ? 'Empresa Candidata a Escalamiento, Créditos Productivos e Inversión 4.0'
    : creditScore >= 55
    ? 'Empresa Apta para Consolidación Comercial'
    : 'Empresa Prioritaria para Saneamiento Financiero y Apoyo Técnico SGR';

  return {
    supportTier,
    totalRecommendations: recommendations.length,
    highPriorityCount: recommendations.filter(r => r.priority === 'ALTA').length,
    recommendations
  };
}
