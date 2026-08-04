/**
 * OSINT Support & Action Plan Advisor Service for Companies
 * Generates tailored recommendations to support and empower the business.
 */
export function generateSupportPlan(companyName, categorization, financialData, scrapedData, searchResults) {
  const recommendations = [];

  // 1. Business Projects & Market Expansion
  recommendations.push({
    category: 'Desarrollo de Mercado & Proyectos',
    priority: 'RECOMENDADA',
    icon: 'briefcase',
    title: 'Vinculación a Oportunidades y Proyectos del Sector',
    description: `Acompañar a ${companyName} en la presentación a licitaciones públicas o contrataciones privadas en el sector de ${categorization.sector}.`,
    actionSteps: [
      'Identificar licitaciones vigentes y compras estatales en su región.',
      'Conectar con redes de proveedores y clusters productivos.',
      'Desarrollar catálogo digital de proyectos y casos de éxito.'
    ]
  });

  // 2. Financial & Debt Support
  if (financialData.creditScore < 72 || financialData.rejectedChequesCount > 0) {
    recommendations.push({
      category: 'Saneamiento Financiero & Pasivos',
      priority: 'ALTA',
      icon: 'alert-triangle',
      title: 'Plan de Reestructuración de Deudas & Asistencia Crediticia',
      description: `La empresa presenta observaciones crediticias o registros bancarios en seguimiento. Requiere apoyo técnico para regularizar la situación en BCRA y acceder a capital de trabajo.`,
      actionSteps: [
        'Gestionar moratoria fiscal y planes de facilidades de pago (AFIP / Rentas).',
        'Tramitar rescate de cheques rechazados para limpiar scoring comercial.',
        'Solicitar refinanciación de deudas bancarias con garantías de Fondos de Garantía (FOGAR / SGR).'
      ]
    });
  } else {
    recommendations.push({
      category: 'Financiamiento & Subsidios',
      priority: 'RECOMENDADA',
      icon: 'trending-up',
      title: 'Acceso a Líneas de Crédito Bonificadas y Subsidios PyME',
      description: `Gracias a su buena calificación crediticia (${financialData.creditScore}/100), la empresa califica para líneas de financiamiento productivo a tasa subsidiada y Aportes No Reembolsables (ANR).`,
      actionSteps: [
        'Postulación a créditos de inversión productiva para equipamiento e insumos.',
        'Solicitud de Aportes No Reembolsables (ANR) para desarrollo de proyectos e innovación.'
      ]
    });
  }

  // 3. Chamber & Association Linkage
  recommendations.push({
    category: 'Integración Institucional & Grupos',
    priority: 'MEDIA',
    icon: 'users',
    title: 'Vinculación con Cámaras Empresariales y Grupos de Apoyo',
    description: `Impulsar la integración de ${companyName} en cámaras sectoriales o asociaciones industriales para fortalecer la representatividad y acuerdos comerciales.`,
    actionSteps: [
      'Gestionar membresía en Cámaras de Industria, Comercio o Metalúrgicas locales.',
      'Participar en rondas de negocios y ferias sectoriales.',
      'Integrar grupos de compras comunitarias para reducir costos de insumos.'
    ]
  });

  // 4. Digital & Commercial Visibility
  if (!scrapedData.hasWebsite) {
    recommendations.push({
      category: 'Visibilidad Comercial',
      priority: 'ALTA',
      icon: 'globe',
      title: 'Desarrollo de Presencia Digital Oficial',
      description: `Crear un sitio web y catálogo digital para ${companyName} permitirá validar sus proyectos y productos ante nuevos clientes y entidades financieras.`,
      actionSteps: [
        'Diseñar sitio web institucional optimizado para dispositivos móviles.',
        'Incorporar ficha de servicios, clientes y canal directo de WhatsApp/Mail.'
      ]
    });
  }

  const supportTier = financialData.creditScore >= 75
    ? 'Empresa Candidata a Escalamiento, Créditos e Inversión'
    : financialData.creditScore >= 55
    ? 'Empresa Apta para Consolidación y Vinculación Comercial'
    : 'Empresa Prioritaria para Saneamiento Financiero y Apoyo Técnico';

  return {
    supportTier,
    totalRecommendations: recommendations.length,
    highPriorityCount: recommendations.filter(r => r.priority === 'ALTA').length,
    recommendations
  };
}
