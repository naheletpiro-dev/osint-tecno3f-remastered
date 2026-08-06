/**
 * OSINT Support & Action Plan Advisor Service for Companies
 * Generates tailored recommendations to support and empower the business with official funding programs.
 */
export function generateSupportPlan(companyName, categorization = {}, financialData = {}, scrapedData = {}, searchResults = {}) {
  const cleanComp = companyName ? companyName.trim() : 'la empresa';
  const sector = categorization.sector || 'su rubro industrial y comercial';
  const creditScore = financialData.creditScore || 75;
  const hasCheques = financialData.rejectedChequesCount > 0;

  const recommendations = [];

  // 1. Programa ANR 4.0 & Financiamiento a Tasa Subsidiada (FONTAR / SEPYME)
  recommendations.push({
    category: 'Financiamiento & Subsidios 4.0',
    priority: 'RECOMENDADA',
    icon: 'trending-up',
    title: 'Aportes No Reembolsables (ANR 4.0) & FONTAR para Modernización',
    description: `Asistencia financiera de hasta el 70% de co-financiamiento no reembolsable a través de SEPYME/FONTAR para incorporar telegestión, software ERP/MES, sensórica IoT y automatización de procesos en ${cleanComp}.`,
    actionSteps: [
      'Presentación del proyecto de modernización tecnológica ante la Agencia I+D+i.',
      'Solicitud de bonificación de tasa en líneas de financiamiento de inversión productiva BNA / Banco BICE.',
      'Formulación de carpetas técnicas para la adquisición de bienes de capital e infraestructura de planta.'
    ]
  });

  // 2. Crédito Fiscal PyME & Capacitación de Personal
  recommendations.push({
    category: 'Capacitación & Crédito Fiscal',
    priority: 'RECOMENDADA',
    icon: 'award',
    title: 'Programa de Crédito Fiscal para Capacitación & Certificaciones ISO',
    description: `Reembolso de hasta $15.000.000 ARS en bono de crédito fiscal (endosable para pago de impuestos nacionales) para financiar la formación técnica del equipo de ${cleanComp} e implementar certificaciones de calidad (ISO 9001, ISO 14001, ISO 45001).`,
    actionSteps: [
      'Inscripción en el Régimen de Crédito Fiscal para Capacitación de la Secretaría de Industria y Desarrollo Productivo.',
      'Ejecución del plan anual de capacitación para mandos medios y técnicos de planta.',
      'Cómputo del bono electrónico fiscal contra el pago de IVA y Ganancias.'
    ]
  });

  // 3. Financiamiento y Saneamiento Crediticio (si aplica) o Expansión Licitatoria
  if (creditScore < 72 || hasCheques) {
    recommendations.push({
      category: 'Saneamiento Financiero & Pasivos',
      priority: 'ALTA',
      icon: 'alert-triangle',
      title: 'Plan de Reestructuración de Deudas & Asistencia Crediticia SGR',
      description: `Regularización de la posición crediticia en la Central de Deudores BCRA mediante la intervención de Sociedades de Garantía Recíproca (FOGAR / Acindar PyME / Garantizar) para respaldar cheques de pago diferido y acceder a tasas preferenciales.`,
      actionSteps: [
        'Gestionar moratoria fiscal y planes de facilidades de pago de AFIP / ARCA.',
        'Rescate e informe de cheques cancelados ante la Central de Deudores BCRA.',
        'Solicitar avales SGR para mejorar la calificación del scoring crediticio corporativo.'
      ]
    });
  } else {
    recommendations.push({
      category: 'Desarrollo Licitatorio & COMPR.AR',
      priority: 'RECOMENDADA',
      icon: 'briefcase',
      title: 'Consolidación en el Registro de Proveedores del Estado (COMPR.AR)',
      description: `Aprovechar la sólida salud financiera de ${cleanComp} (${creditScore}/100 pts) para postular a licitaciones públicas de gran escala en ministerios, municipios y empresas estatales.`,
      actionSteps: [
        'Actualizar el Certificado MiPyME y la capacidad licitatoria aprobada.',
        'Activar alertas automatizadas de pliegos licitatorios del sector de ${sector}.',
        'Presentar antecedentes técnicos comprobables en licitaciones de provisión pública.'
      ]
    });
  }

  // 4. Programa de Internacionalización y Oferta Exportadora (ProArgentina / Cancillería)
  recommendations.push({
    category: 'Internacionalización & Comercio Exterior',
    priority: 'MEDIA',
    icon: 'globe',
    title: 'Asistencia Técnica para Posicionamiento Exportador en América Latina',
    description: `Incorporación de ${cleanComp} en misiones comerciales internacionales y rondas de negocios organizadas por la Agencia Argentina de Inversiones y Comercio Internacional para exportar productos y servicios en la región.`,
    actionSteps: [
      'Elaboración del perfil exportador en la plataforma Argentina Trade Net.',
      'Participación en ferias internacionales con subsidio de stand institucional.',
      'Adecuación de embalajes, normas de origen y certificaciones para exportación.'
    ]
  });

  // 5. Integración a Clústeres Industriales & Cámaras (ADIMRA, CACIEL, Polo Tecnológico)
  recommendations.push({
    category: 'Vinculación Institucional & Clústeres',
    priority: 'MEDIA',
    icon: 'users',
    title: 'Vinculación a Cámaras Sectoriales y Rondas de Negocios B2B',
    description: `Membresía e integración activa de ${cleanComp} en cámaras empresariales (Cámara Metalúrgica, CACIEL, Polo Tecnológico) para acceder a compras comunitarias de insumos, economías de escala y convenios colectivos favorables.`,
    actionSteps: [
      'Participación en rondas de negocios sectoriales B2B locales e interprovinciales.',
      'Acceso a convenios institucionales para adquisición de materia prima a precio de clúster.',
      'Red de alianzas estratégicas con integradores y distribuidores regionales.'
    ]
  });

  const supportTier = creditScore >= 75
    ? 'Empresa Candidata a Escalamiento, Créditos Productivos e Inversión 4.0'
    : creditScore >= 55
    ? 'Empresa Apta para Consolidación Licitatoria y Vinculación Comercial'
    : 'Empresa Prioritaria para Saneamiento Financiero y Apoyo Técnico SGR';

  return {
    supportTier,
    totalRecommendations: recommendations.length,
    highPriorityCount: recommendations.filter(r => r.priority === 'ALTA').length,
    recommendations
  };
}
