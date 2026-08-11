/**
 * Cross-Module Intelligence Refinement Engine
 * Inter-service synthesis layer that cross-references outputs between sibling modules:
 * - Propagates Foreign Trade signals (Imports/Exports) to Financial Risk & Support Plans.
 * - Propagates PyME Official status to Tax Solvency & Subsidized Lines.
 * - Propagates COMPR.AR State Contracts to Bidding Capacity & SGR Guarantees.
 * - Propagates Registro Nacional de Sociedades (Ley 26.047) to Corporate Scoring.
 */
export function refineCrossModuleSynthesis({
  companyName = '',
  financialData = {},
  supportPlan = {},
  swotAnalysis = {},
  digitalTransformation = {},
  tradeData = {},
  pymeData = {},
  publicContracts = {},
  legalData = {},
  bcraData = {},
  inpiWipoData = {}
}) {
  const cleanComp = companyName ? companyName.trim() : 'Empresa';

  // Ensure default structures exist
  const fin = financialData || {};
  const supp = supportPlan || {};
  const swot = swotAnalysis || {};
  const dt = digitalTransformation || {};

  fin.taxProfile = fin.taxProfile || {};
  fin.biddingCapacity = fin.biddingCapacity || {};
  fin.biddingCapacity.scoringBreakdown = fin.biddingCapacity.scoringBreakdown || {};

  supp.recommendedPrograms = supp.recommendedPrograms || [];
  swot.strengths = swot.strengths || [];
  swot.weaknesses = swot.weaknesses || [];
  swot.opportunities = swot.opportunities || [];
  swot.threats = swot.threats || [];

  // =========================================================================
  // 1. CROSS-MODULE SIGNAL 1: Foreign Trade (tradeData -> Financials, Support, SWOT, DT)
  // =========================================================================
  const tradeActivity = (tradeData.tradeActivity || '').toLowerCase();
  const tradeDetails = (tradeData.details || '').toLowerCase();
  const isImporter = tradeActivity.includes('importad') || tradeDetails.includes('importad') || tradeDetails.includes('insumos importados');
  const isExporter = tradeActivity.includes('exportad') || tradeDetails.includes('exportad') || tradeDetails.includes('mercado internacional');

  if (isImporter || isExporter || tradeData.isRealData) {
    // A) Adjust Financial Scoring & Risk Exposure
    if (isImporter) {
      fin.fxExposureNotice = 'Exposición a Variación Cambiaria por Insumos y Repuestos Importados';
      fin.biddingCapacity.scoringBreakdown.fxRiskAssessment = 'Monitoreo de Tipo de Cambio & Insumos Importados';
      fin.biddingCapacity.recommendedFxHedgingLimitARS = '$15.000.000 ARS en Cobertura Cambiaria / Mercado a Término';
    }

    if (isExporter) {
      fin.creditScore = Math.min(99, (fin.creditScore || 75) + 5);
      fin.fxExposureNotice = 'Generadora de Divisas / Cobertura Natural por Exportación de Productos';
      fin.biddingCapacity.scoringBreakdown.exportSolvencyBonus = '+5 Puntos por Capacidad Exportadora Directa';
    }

    // B) Refine Support Plan & Credit Lines
    const hasComexProgram = supp.recommendedPrograms.some(p => (p.title || '').toLowerCase().includes('comex') || (p.title || '').toLowerCase().includes('exporta'));
    if (!hasComexProgram) {
      supp.recommendedPrograms.unshift({
        title: isExporter ? 'Programa Argentina Exporta & Cancillería (Promoción Comex)' : 'Línea BICE / Banco Nación para Importación de Bienes de Capital',
        organism: isExporter ? 'Secretaría de Comercio Exterior / BICE' : 'BICE - Banco de Inversión y Comercio Exterior',
        description: isExporter
          ? `Acceso a rondas de negocios internacionales y financiamiento de pre-financiación de exportaciones para ${cleanComp}.`
          : `Crédito a tasa preferencial para la adquisición de insumos críticos y maquinaria importada.`,
        maxAmount: '$50.000.000 ARS / U$S 100.000',
        compatibility: 'ALTA (Empresa con actividad comprobada en Comercio Exterior)'
      });
    }

    // C) Refine SWOT Analysis
    if (isExporter && !swot.strengths.some(s => s.toLowerCase().includes('comercio exterior') || s.toLowerCase().includes('exporta'))) {
      swot.strengths.push('Inserción y capacidad de facturación en mercados externos (Comercio Exterior).');
    }
    if (isImporter && !swot.threats.some(t => t.toLowerCase().includes('cambiario') || t.toLowerCase().includes('insumos'))) {
      swot.threats.push('Exposición a fluctuaciones cambiarias y regulaciones aduaneras de importación.');
    }

    // D) Refine Digital Transformation
    if (!dt.recommendedTools?.some(t => t.toLowerCase().includes('aduan') || t.toLowerCase().includes('comex'))) {
      dt.recommendedTools = dt.recommendedTools || [];
      dt.recommendedTools.push('Módulo ERP Comex para trazabilidad de importación/exportación y Despacho Aduanero');
    }
  }

  // =========================================================================
  // 2. CROSS-MODULE SIGNAL 2: Official PyME Status (pymeData -> Financials, Support)
  // =========================================================================
  if (pymeData.hasPymeCertificate || pymeData.isRealData) {
    // A) Sync Financial Tax Profile
    fin.taxProfile.publicCertificates = pymeData.pymeCategory || 'Certificado MiPyME Registrado';
    fin.biddingCapacity.scoringBreakdown.pymeTaxBonus = '+10% Beneficio Impositivo MiPyME en Capacidad Licitatoria';

    // B) Refine Support Plan
    const hasPymeProgram = supp.recommendedPrograms.some(p => (p.title || '').toLowerCase().includes('pyme') || (p.title || '').toLowerCase().includes('fondep'));
    if (!hasPymeProgram) {
      supp.recommendedPrograms.push({
        title: 'Línea FONDEP / CREAR PyME a Tasa Subvencionada',
        organism: 'Subsecretaría PyME - Ministerio de Economía',
        description: `Financiamiento respaldado con subsidio de tasa para proyectos de inversión productiva y capital de trabajo de ${cleanComp}.`,
        maxAmount: '$30.000.000 ARS',
        compatibility: 'ALTA (Certificado MiPyME Verificado)'
      });
    }
  }

  // =========================================================================
  // 3. CROSS-MODULE SIGNAL 3: State Contracts COMPR.AR/CONTRAT.AR (publicContracts -> Financials, Support)
  // =========================================================================
  if (publicContracts.totalContracts > 0 || publicContracts.isRegisteredSupplier || publicContracts.isRealData) {
    // A) Upgrade Bidding Capacity
    const rawM = fin.biddingCapacity.capacityRawM || 150;
    const upgradedM = Math.round(rawM * 1.18);
    fin.biddingCapacity.estimatedBiddingCapacityARS = `$${(upgradedM * 1000000).toLocaleString('es-AR')} ARS (${upgradedM} Millones ARS)`;
    fin.biddingCapacity.biddingEligibilityNotice = `Capacidad Licitatoria respaldada por antecedentes en COMPR.AR / CONTRAT.AR (${publicContracts.totalContracts || 'Proveedor Inscripto'} licitaciones verificadas).`;
    fin.biddingCapacity.scoringBreakdown.stateContractBonus = '+18% Bonificación por Historial de Licitaciones Públicas Adjudicadas';

    // B) Refine Support Plan (SGR Guarantees for Public Tenders)
    supp.recommendedPrograms.push({
      title: 'Garantías SGR para Pliegos y Licitaciones Públicas',
      organism: 'Red de Sociedades de Garantía Recíproca (SGR)',
      description: `Avales y garantías financieras para la presentación de pliegos y ejecución de obras con el Estado Nacional para ${cleanComp}.`,
      maxAmount: 'Hasta 100% del Monto del Pliego',
      compatibility: 'ALTA (Proveedor inscripto en Padrón Estatal)'
    });

    // C) Refine SWOT
    if (!swot.strengths.some(s => s.toLowerCase().includes('licitacio') || s.toLowerCase().includes('compr.ar'))) {
      swot.strengths.push('Antecedentes comprobados como proveedor habilitado del Estado Nacional (COMPR.AR).');
    }
  }

  // =========================================================================
  // 4. CROSS-MODULE SIGNAL 4: Registro Nacional de Sociedades Ley 26.047 (legalData -> Financials)
  // =========================================================================
  if (legalData.sociedadDetail && legalData.isRealData) {
    fin.creditScore = Math.min(100, (fin.creditScore || 75) + 3);
    fin.biddingCapacity.scoringBreakdown.rnsRegistryBonus = '+3 Puntos por Validación Inscripta en Registro Nacional de Sociedades (Ley 26.047)';
  }

  // =========================================================================
  // 5. SWOT SYNTHESIS: Deep OSINT Data Injection
  // =========================================================================
  
  // BCRA & Financials
  if (bcraData && bcraData.situacion >= 3) {
    swot.threats.push(`Riesgo crediticio severo: Calificación BCRA Situación ${bcraData.situacion} (Alto Riesgo/Irrecuperable).`);
  } else if (bcraData && bcraData.situacion === 1) {
    swot.strengths.push('Excelente calificación crediticia en Central de Deudores BCRA (Situación 1 - Normal).');
  }

  if (bcraData && bcraData.rejectedChequesCount > 0) {
    swot.weaknesses.push(`Antecedentes financieros negativos: ${bcraData.rejectedChequesCount} cheques rechazados registrados.`);
  }

  // AFIP
  if (financialData.afipData && financialData.afipData.vatCondition && financialData.afipData.vatCondition.toLowerCase().includes('exento')) {
    swot.opportunities.push('Ventaja fiscal competitiva por condición de IVA Exento.');
  }

  // Legal / BORA / REPSAL
  if (legalData && legalData.boletinOficialData && legalData.boletinOficialData.hasBankruptcyOrConcurso) {
    swot.threats.push('ALERTA MÁXIMA: Edictos de concurso preventivo o quiebra registrados en el Boletín Oficial (BORA).');
  }
  
  if (legalData && legalData.repsalData && legalData.repsalData.hasSanctions) {
    swot.weaknesses.push(`Contingencias laborales: Registra ${legalData.repsalData.totalSanctions} sanciones en el REPSAL por infracciones a leyes de trabajo.`);
  }

  // INPI (Trademarks)
  if (inpiWipoData && inpiWipoData.hasRegisteredTrademarks) {
    swot.strengths.push(`Activos intangibles consolidados: Posee marcas registradas formalmente ante el INPI.`);
  }

  // PyME
  if (pymeData && pymeData.hasPymeCertificate) {
    swot.strengths.push(`Reconocimiento estatal vigente como ${pymeData.pymeCategory} certificada, habilitando beneficios impositivos.`);
  }

  // Default empty states to avoid blank UI
  if (swot.strengths.length === 0) swot.strengths.push(`Operatividad y vigencia comercial en curso para ${cleanComp}.`);
  if (swot.weaknesses.length === 0) swot.weaknesses.push('No se detectaron pasivos financieros ni contingencias legales públicas graves.');
  if (swot.opportunities.length === 0) swot.opportunities.push('Posibilidad de escalar operaciones a través de nuevas licitaciones B2B.');
  if (swot.threats.length === 0) swot.threats.push('Competencia directa de otros actores consolidados en su mismo segmento de mercado.');

  return {
    financialData: fin,
    supportPlan: supp,
    swotAnalysis: swot,
    digitalTransformation: dt
  };
}
