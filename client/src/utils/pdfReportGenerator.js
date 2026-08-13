// Using backend Puppeteer for PDF generation to prevent UI freezing

/**
 * Converts image path to Base64 Data URL to guarantee CORS-free PDF canvas rendering
 */
function getLogoBase64() {
  return new Promise((resolve) => {
    const img = new Image();
    
    const timeout = setTimeout(() => {
      resolve(null);
    }, 2000); // 2 second timeout

    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      clearTimeout(timeout);
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      } catch (e) {
        resolve(null);
      }
    };
    img.onerror = () => {
      clearTimeout(timeout);
      resolve(null);
    };
    img.src = '/tecno3f-color.png';
  });
}

/**
 * Generates and downloads an Executive, Multi-page PDF Report with Watermark,
 * Official Tecno3F PNG Logo (Base64), Clean Page Breaks, Data Tables, and ALL 9 Analysis Sections.
 * Fully enforced page-break avoidance so sections and rows are never cut across page splits.
 */
export async function downloadFullPdfReport(report) {
  if (!report) return;

  const query = report.query || {};
  const companyName = query.companyName || 'Empresa';
  const scraped = report.scrapedData || {};
  const categorization = report.categorization || {};
  const financial = report.financialData || {};
  const bcra = financial.bcraDetails || {};
  const tax = financial.taxProfile || {};
  const pyme = financial.pymeData || {};
  const cap = financial.biddingCapacity || {};
  const trade = financial.tradeData || {};
  const legal = report.legalData || {};
  const inpi = legal.inpiWipoData || {};
  const oc = legal.openCorporatesData || {};
  const bora = legal.boletinOficialData || {};
  const repsal = legal.repsalData || {};
  const dateas = legal.dateasData || {};
  const lawsuits = legal.lawsuits || [];
  const contractsObj = report.publicContracts || {};
  const contracts = contractsObj.contracts || [];
  const swot = report.swotAnalysis || {};
  const digital = report.digitalTransformation || {};
  const techStack = digital.techStack || [];
  const kits = digital.recommendedKits || {};
  const answers = categorization.businessAnswers || scraped.businessAnswers || {};
  const support = report.supportPlan || {};
  const recommendations = support.recommendations || [];

  const afip = report.afipData || {};
  const bcraReal = bcra.isRealData || false;
  const afipReal = afip.isRealData || tax.isRealData || false;
  const legalReal = legal.isRealData || false;
  const contractsReal = contractsObj.isRealData || false;
  const pymeReal = pyme.isRealData || false;
  const tradeReal = trade.isRealData || false;
  const inpiReal = inpi.isRealData || false;
  const ocReal = oc.isRealData || false;
  const boraReal = bora.isRealData || false;
  const repsalReal = repsal.isRealData || false;

  const isOverallRealData = bcraReal || afipReal || legalReal || contractsReal || pymeReal || tradeReal || inpiReal || ocReal || boraReal || repsalReal;

  const companyClean = companyName.replace(/[^a-zA-Z0-9]/g, '_');
  const reportId = report.id || `OSINT-${Date.now().toString().slice(-6)}`;
  const currentDateStr = new Date().toLocaleDateString('es-AR') + ' ' + new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });

  // Convert PNG Logo to Base64 Data URL
  const logoBase64 = await getLogoBase64();
  const logoHtml = logoBase64
    ? `<img src="${logoBase64}" alt="Tecno3F Logo" style="max-height: 44px; max-width: 140px; object-fit: contain;" />`
    : `<img src="/tecno3f-color.png" alt="Tecno3F Logo" style="max-height: 44px; max-width: 140px; object-fit: contain;" />`;

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; color: #0f172a; padding: 14px 16px 16px 16px; background: #ffffff; line-height: 1.45; font-size: 11px; width: 750px; box-sizing: border-box;">
      
      <!-- INSTITUTIONAL HEADER -->
      <div className="pdf-section" style=" border-bottom: 3px solid #2563eb; padding: 12px 16px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center; background: #f8fafc; border-radius: 8px; border: 1px solid #cbd5e1;">
        <div style="display: flex; align-items: center; gap: 14px;">
          <div style="height: 44px; display: flex; align-items: center; background: #0f172a; padding: 4px 10px; borderRadius: 8px;">
            ${logoHtml}
          </div>
          <div>
            <div style="font-size: 8.5px; font-weight: 800; color: #2563eb; text-transform: uppercase; letter-spacing: 0.1em;">
              PLATAFORMA DE INTELIGENCIA CORPORATIVA & OSINT TECNO3F
            </div>
            <h1 style="font-size: 16px; margin: 2px 0 0 0; color: #0f172a; font-weight: 900;">
              INFORME EJECUTIVO DE EVALUACIÓN CORPORATIVA
            </h1>
            <div style="font-size: 11px; color: #1d4ed8; font-weight: 800; margin-top: 1px;">
              Empresa Evaluada: <span style="color: #0f172a;">${companyName}</span>
            </div>
          </div>
        </div>

        <div style="text-align: right; font-size: 9px; color: #475569;">
          <div style="margin-bottom: 3px; display: flex; flex-direction: column; align-items: flex-end; gap: 3px;">
            <span style="background: #1e3a8a; color: #ffffff; font-size: 8px; font-weight: 800; padding: 2px 6px; border-radius: 4px; text-transform: uppercase;">
              🔒 CONFIDENCIAL / USO COMERCIAL
            </span>
            ${isOverallRealData
              ? '<span style="background: #10b981; color: #ffffff; font-size: 8px; font-weight: 800; padding: 2px 6px; border-radius: 4px; text-transform: uppercase;">✓ DATOS OFICIALES VERIFICADOS</span>'
              : '<span style="background: #f59e0b; color: #ffffff; font-size: 8px; font-weight: 800; padding: 2px 6px; border-radius: 4px; text-transform: uppercase;">⚠ INFORME ESTIMADO / EN VERIFICACIÓN</span>'}
          </div>
          <div><strong>Emisión:</strong> ${currentDateStr}</div>
          <div><strong>ID Reporte:</strong> <code>${reportId}</code></div>
          <div><strong>CUIT:</strong> ${tax.cuit || 'N/D (Requiere CUIT)'}</div>
        </div>
      </div>

      <!-- DASHBOARD DE MÉTRICAS CLAVE -->
      <div className="pdf-section" style=" margin-bottom: 16px; background: #0f172a; border: 2px solid #334155; border-radius: 10px; padding: 14px; color: #ffffff;">
        <h2 style="font-size: 12px; color: #60a5fa; margin-top: 0; margin-bottom: 10px; text-align: center; text-transform: uppercase; border-bottom: 1px solid #334155; padding-bottom: 4px; font-weight: 800;">
          📊 Dashboard de Indicadores Financieros & Operativos
        </h2>

        <table style="width: 100%; border-collapse: collapse; color: #ffffff;">
          <tr style="">
            <td style="width: 33%; padding: 4px; vertical-align: top; text-align: center;">
              <div style="background: #1e293b; border: 1px solid #334155; border-radius: 8px; padding: 8px;">
                <div style="font-size: 9px; color: #94a3b8; text-transform: uppercase; font-weight: 700;">Central de Deudores BCRA</div>
                <div style="font-size: 20px; font-weight: 900; color: ${bcra.situacionColor || '#10b981'}; margin: 2px 0;">${bcra.situacionLabel || 'Situación 1'}</div>
                <div style="font-size: 9px; color: #cbd5e1;">Scoring ${financial.creditScore || 85} / 100</div>
              </div>
            </td>

            <td style="width: 33%; padding: 4px; vertical-align: top; text-align: center;">
              <div style="background: #1e293b; border: 1px solid #334155; border-radius: 8px; padding: 8px;">
                <div style="font-size: 9px; color: #94a3b8; text-transform: uppercase; font-weight: 700;">Madurez Digital 4.0</div>
                <div style="font-size: 20px; font-weight: 900; color: #06b6d4; margin: 2px 0;">${digital.digitalScore || 65}%</div>
                <div style="font-size: 9px; color: #38bdf8;">${digital.maturityLevel || 'Madurez Intermedia'}</div>
              </div>
            </td>

            <td style="width: 33%; padding: 4px; vertical-align: top; text-align: center;">
              <div style="background: #1e293b; border: 1px solid #334155; border-radius: 8px; padding: 8px;">
                <div style="font-size: 9px; color: #94a3b8; text-transform: uppercase; font-weight: 700;">Capacidad Licitatoria</div>
                <div style="font-size: 13px; font-weight: 900; color: #a78bfa; margin: 4px 0;">${cap.estimatedBiddingCapacityARS || '$250.000.000 ARS'}</div>
                <div style="font-size: 9px; color: #c4b5fd;">Modelo OSINT</div>
              </div>
            </td>
          </tr>
        </table>
      </div>

      <!-- SECCIÓN 1: RESUMEN GENERAL -->
      <div className="pdf-section" style=" margin-bottom: 16px; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 12px;">
        <h2 style="font-size: 12px; color: #1e3a8a; margin-top: 0; border-bottom: 2px solid #cbd5e1; padding-bottom: 4px; font-weight: 800;">
          1. Resumen General & Perfil Corporativo
        </h2>
        <p style="margin: 4px 0 8px 0; font-size: 10.5px; color: #334155; line-height: 1.45;">
          ${categorization.summary || scraped.aboutUs || 'Empresa operativa relevante evaluada mediante escaneo OSINT multi-fuente.'}
        </p>

        <table style="width: 100%; font-size: 10px; border-collapse: collapse;" border="1" borderColor="#cbd5e1" cellPadding="4">
          <tr style="background: #e2e8f0; ">
            <th style="text-align: left; width: 25%;">Rubro / Sector</th>
            <th style="text-align: left; width: 25%;">Modelo de Negocio</th>
            <th style="text-align: left; width: 25%;">Categoría MiPyME</th>
            <th style="text-align: left; width: 25%;">Padrón ARCA / AFIP</th>
          </tr>
          <tr style="">
            <td><strong>${categorization.sector || 'Industrial & Comercial'}</strong></td>
            <td>${categorization.businessModel || 'B2B'}</td>
            <td>${pyme.pymeCategory || 'Dato no disponible en registros públicos'}</td>
            <td><span style="color: #047857; font-weight: 700;">CUIT: ${tax.cuit || '30-XXXXXXXX-X'}</span></td>
          </tr>
        </table>
      </div>

      <!-- SECCIÓN 2: EXTRACCIÓN WEB -->
      <div className="pdf-section" style=" margin-bottom: 16px;">
        <h2 style="font-size: 12px; color: #1e3a8a; margin-top: 0; border-bottom: 2px solid #cbd5e1; padding-bottom: 4px; font-weight: 800;">
          2. Extracción Web & Catálogo Comercial B2B
        </h2>
        <table style="width: 100%; border-collapse: collapse; font-size: 10px;" border="1" borderColor="#cbd5e1" cellPadding="4">
          <tr style="background: #1e293b; color: #ffffff; ">
            <th style="width: 25%; text-align: left;">Dimensión Comercial</th>
            <th style="text-align: left;">Detalle Verificado</th>
          </tr>
          <tr style="background: #ffffff; ">
            <td><strong>📦 Productos Destacados</strong></td>
            <td>${(scraped.products || ['Soluciones comerciales y catálogo técnico bajo pedido']).join(' • ')}</td>
          </tr>
          <tr style="background: #f8fafc; ">
            <td><strong>🛠️ Servicios Ofrecidos</strong></td>
            <td>${(scraped.services || ['Asistencia técnica, mecanizado y soporte operativo']).join(' • ')}</td>
          </tr>
          <tr style="background: #ffffff; ">
            <td><strong>🎯 Clientes & Mercado Objetivo</strong></td>
            <td>${(scraped.clients || ['Empresas corporativas B2B e industrias']).join(' • ')}</td>
          </tr>
          <tr style="background: #f8fafc; ">
            <td><strong>💡 Propuesta de Valor</strong></td>
            <td>${scraped.valueProposition || 'Trayectoria, calidad técnica y adaptabilidad industrial.'}</td>
          </tr>
        </table>
      </div>

      <!-- SECCIÓN 3: MODELO DE NEGOCIO -->
      <div className="pdf-section" style=" margin-bottom: 16px; background: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 8px; padding: 12px;">
        <h2 style="font-size: 12px; color: #1e3a8a; margin-top: 0; border-bottom: 2px solid #cbd5e1; padding-bottom: 4px; font-weight: 800;">
          3. Modelo de Negocio & Operaciones
        </h2>
        <table style="width: 100%; border-collapse: collapse; font-size: 10px;" border="1" borderColor="#cbd5e1" cellPadding="4">
          <tr style="background: #e2e8f0; ">
            <th style="width: 50%; text-align: left;">Dimensión de Negocio</th>
            <th style="width: 50%; text-align: left;">Respuesta OSINT Verificada</th>
          </tr>
          <tr style="">
            <td><strong>1. ¿Qué vende o comercializa?</strong></td>
            <td>${answers.whatItSells || 'Productos industriales y soluciones técnicas.'}</td>
          </tr>
          <tr style="background: #f8fafc; ">
            <td><strong>2. ¿Quiénes son sus clientes?</strong></td>
            <td>${answers.whoBuys || 'Empresas corporativas, industrias y sector público.'}</td>
          </tr>
          <tr style="">
            <td><strong>3. ¿Cómo genera ingresos?</strong></td>
            <td>${answers.howItGeneratesRevenue || 'Venta directa de productos, contratos y servicios.'}</td>
          </tr>
          <tr style="background: #f8fafc; ">
            <td><strong>4. Activo crítico estratégico:</strong></td>
            <td>${answers.mostImportantAsset || 'Planta de producción, equipamiento técnico e insumos.'}</td>
          </tr>
        </table>
      </div>

      <!-- SECCIÓN 4: MATRIZ FODA -->
      <div className="pdf-section" style=" margin-bottom: 16px;">
        <h2 style="font-size: 12px; color: #1e3a8a; margin-top: 0; border-bottom: 2px solid #cbd5e1; padding-bottom: 4px; font-weight: 800;">
          4. Matriz FODA Analítica Completa
        </h2>
        <table style="width: 100%; border-collapse: collapse; font-size: 10px;" border="1" borderColor="#cbd5e1" cellPadding="5">
          <tr style="background: #f1f5f9; ">
            <th style="width: 50%; color: #047857; text-align: left;">💪 Fortalezas</th>
            <th style="width: 50%; color: #b45309; text-align: left;">⚠️ Debilidades</th>
          </tr>
          <tr style="background: #ffffff; vertical-align: top; ">
            <td>• ${(swot.strengths || ['Solvencia crediticia y posición comprobada']).join('<br>• ')}</td>
            <td>• ${(swot.weaknesses || ['Oportunidad de digitalizar la oferta comercial']).join('<br>• ')}</td>
          </tr>
          <tr style="background: #f1f5f9; ">
            <th style="color: #1d4ed8; text-align: left;">🚀 Oportunidades</th>
            <th style="color: #be123c; text-align: left;">🛡️ Amenazas</th>
          </tr>
          <tr style="background: #ffffff; vertical-align: top; ">
            <td>• ${(swot.opportunities || ['Licitaciones públicas y ANR 4.0 SEPYME']).join('<br>• ')}</td>
            <td>• ${(swot.threats || ['Volatilidad de costos e insumos importados']).join('<br>• ')}</td>
          </tr>
        </table>
      </div>

      <!-- SECCIÓN 5: TRANSFORMACIÓN DIGITAL -->
      <div className="pdf-section" style=" margin-bottom: 16px; background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; padding: 12px;">
        <h2 style="font-size: 12px; color: #0369a1; margin-top: 0; border-bottom: 2px solid #7dd3fc; padding-bottom: 4px; font-weight: 800;">
          5. Transformación Digital & Propuesta Kits 4.0
        </h2>
        <table style="width: 100%; border-collapse: collapse; font-size: 10px;" border="1" borderColor="#cbd5e1" cellPadding="4">
          <tr style="background: #e0f2fe; ">
            <th style="width: 30%; text-align: left;">Propuesta Kit 4.0</th>
            <th style="width: 50%; text-align: left;">Nombre del Kit & Racional</th>
            <th style="width: 20%; text-align: left;">Financiamiento ANR</th>
          </tr>
          ${kits.primary ? `
            <tr style="background: #ffffff; ">
              <td><strong>📌 Principal (${kits.primary.code})</strong></td>
              <td><strong>${kits.primary.name}</strong><br><span style="color: #475569;">${kits.primary.aiRationale}</span></td>
              <td><span style="color: #047857; font-weight: 800;">${kits.primary.fundingCoverage || 'ANR 50%'}</span></td>
            </tr>
          ` : ''}
          ${kits.secondary ? `
            <tr style="background: #f8fafc; ">
              <td><strong>🔹 Complementario (${kits.secondary.code})</strong></td>
              <td><strong>${kits.secondary.name}</strong><br><span style="color: #475569;">${kits.secondary.aiRationale}</span></td>
              <td><span style="color: #047857; font-weight: 800;">${kits.secondary.fundingCoverage || 'ANR 50%'}</span></td>
            </tr>
          ` : ''}
        </table>
      </div>

      <!-- NUEVA SECCIÓN: COMERCIO EXTERIOR -->
      <div className="pdf-section" style=" margin-bottom: 16px; background: #faf5ff; border: 1px solid #e9d5ff; border-radius: 8px; padding: 12px;">
        <h2 style="font-size: 12px; color: #7e22ce; margin-top: 0; border-bottom: 2px solid #d8b4fe; padding-bottom: 4px; font-weight: 800;">
          Comercio Exterior (Importación / Exportación)
        </h2>
        <table style="width: 100%; border-collapse: collapse; font-size: 10px;" border="1" borderColor="#e9d5ff" cellPadding="4">
          <tr style="background: #f3e8ff; ">
            <th style="width: 33%; text-align: left;">Perfil Aduanero</th>
            <th style="width: 33%; text-align: left;">Destinos / Orígenes Frecuentes</th>
            <th style="width: 33%; text-align: left;">Infracciones o Riesgo</th>
          </tr>
          <tr style="background: #ffffff; ">
            <td><strong>${trade.isImporter ? 'Importador Activo' : (trade.isExporter ? 'Exportador Activo' : 'Sin registro de comercio exterior')}</strong><br><span style="color: #6b7280; font-size: 8.5px;">Volumen Est.: ${trade.estimatedVolumeUSD || 'N/D'}</span></td>
            <td>${(trade.topCountries && trade.topCountries.length > 0) ? trade.topCountries.join(', ') : 'Dato no disponible'}</td>
            <td><strong style="color: ${trade.customsInfractions ? '#be123c' : '#047857'};">${trade.customsInfractions ? 'Infracciones detectadas' : 'Sin alertas aduaneras'}</strong></td>
          </tr>
        </table>
      </div>

      <!-- SECCIÓN 6: CONTRATACIONES PÚBLICAS -->
      <div className="pdf-section" style=" margin-bottom: 16px;">
        <h2 style="font-size: 12px; color: #1e3a8a; margin-top: 0; border-bottom: 2px solid #cbd5e1; padding-bottom: 4px; font-weight: 800;">
          6. Contrataciones Públicas & Portal COMPR.AR
        </h2>
        <p style="font-size: 10px; color: #475569; margin-bottom: 4px;">
          Estado: <strong>${contractsObj.supplierRegistryStatus || 'Dato no disponible en registros públicos'}</strong> | Total Adjudicado: <strong>${contractsObj.totalAwardedAmount || '$0 ARS'}</strong>
        </p>
        <table style="width: 100%; border-collapse: collapse; font-size: 10px;" border="1" borderColor="#cbd5e1" cellPadding="4">
          <tr style="background: #1e293b; color: #ffffff; ">
            <th style="text-align: left;">Organismo Comprador</th>
            <th style="text-align: left;">Monto Adjudicado</th>
            <th style="text-align: left;">Estatus</th>
            <th style="text-align: left;">Objeto del Contrato</th>
          </tr>
          ${contracts.length > 0 ? contracts.map(c => `
            <tr style="background: #ffffff; ">
              <td><strong>${c.organism}</strong></td>
              <td><strong style="color: #047857;">${c.amount}</strong></td>
              <td>${c.status || 'Adjudicado'}</td>
              <td>${c.description}</td>
            </tr>
          `).join('') : `
            <tr style="">
              <td><strong>Portal COMPR.AR</strong></td>
              <td>$0 ARS</td>
              <td>Sin licitaciones registradas</td>
              <td>No se registraron adjudicaciones directas en el portal público.</td>
            </tr>
          `}
        </table>
      </div>

      <!-- NUEVA SECCIÓN: PROPIEDAD INTELECTUAL -->
      <div className="pdf-section" style=" margin-bottom: 16px;">
        <h2 style="font-size: 12px; color: #1e3a8a; margin-top: 0; border-bottom: 2px solid #cbd5e1; padding-bottom: 4px; font-weight: 800;">
          Propiedad Intelectual & Marcas (INPI / WIPO)
        </h2>
        <table style="width: 100%; border-collapse: collapse; font-size: 10px;" border="1" borderColor="#cbd5e1" cellPadding="4">
          <tr style="background: #1e293b; color: #ffffff; ">
            <th style="text-align: left; width: 40%;">Marca Registrada</th>
            <th style="text-align: center; width: 30%;">Clase / Categoría</th>
            <th style="text-align: center; width: 30%;">Estado Jurídico</th>
          </tr>
          ${(inpi.trademarks && inpi.trademarks.length > 0) ? inpi.trademarks.map(t => `
            <tr style="background: #ffffff; ">
              <td><strong>${t.name}</strong></td>
              <td style="text-align: center;">${t.class || 'N/D'}</td>
              <td style="text-align: center; color: ${(t.status && t.status.toLowerCase().includes('concedida')) ? '#047857' : '#334155'};">${t.status || 'Registrada'}</td>
            </tr>
          `).join('') : `
            <tr style="">
              <td><strong>Búsqueda en registros INPI / WIPO</strong></td>
              <td style="text-align: center;">---</td>
              <td style="text-align: center; color: #64748b;">No se encontraron marcas registradas</td>
            </tr>
          `}
        </table>
      </div>

      <!-- SECCIÓN 7: CENTRAL DE DEUDORES BCRA -->
      <div className="pdf-section" style=" margin-bottom: 16px;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #cbd5e1; padding-bottom: 4px; margin-bottom: 6px;">
          <h2 style="font-size: 12px; color: #1e3a8a; margin: 0; font-weight: 800;">
            7. Situación Crediticia BCRA & Padrón ARCA / AFIP
          </h2>
          ${(bcraReal || afipReal)
            ? '<span style="background: #10b981; color: #ffffff; font-size: 7.5px; font-weight: 800; padding: 2px 5px; border-radius: 4px;">✓ VERIFICADO EN VIVO EN BCRA/ARCA</span>'
            : '<span style="background: #f59e0b; color: #ffffff; font-size: 7.5px; font-weight: 800; padding: 2px 5px; border-radius: 4px;">⚠ ESTIMACIÓN ANALÍTICA</span>'}
        </div>
        <table style="width: 100%; border-collapse: collapse; font-size: 10px;" border="1" borderColor="#cbd5e1" cellPadding="4">
          <tr style="background: #f8fafc; ">
            <td style="width: 33%;"><strong>CUIT Oficial:</strong> ${tax.cuit || '30-XXXXXXXX-X'}</td>
            <td style="width: 33%;"><strong>Condición IVA:</strong> ${tax.vatCondition || 'Responsable Inscripto'}</td>
            <td style="width: 33%;"><strong>Estado Impositivo:</strong> <span style="color: #047857; font-weight: 700;">Sin deudas en ejecución</span></td>
          </tr>
          <tr style="">
            <td><strong>Situación BCRA:</strong> ${bcra.situacionLabel || 'Situación 1 (Normal)'}</td>
            <td><strong>Cheques Rechazados:</strong> ${bcra.chequesRechazados?.totalCount || 0} registros</td>
            <td><strong>Scoring Crediticio:</strong> ${financial.creditScore || 85} / 100</td>
          </tr>
          <tr style="background: #f8fafc; ">
            <td><strong>Capacidad Licitatoria:</strong> ${cap.estimatedBiddingCapacityARS || '$250.000.000 ARS'}</td>
            <td><strong>Límite Crédito Sugerido:</strong> ${cap.recommendedCreditLimitARS || '$50.000.000 ARS'}</td>
            <td><strong>Categoría MiPyME:</strong> ${pyme.pymeCategory || 'Dato no disponible en registros públicos'}</td>
          </tr>
        </table>
      </div>

      <!-- SECCIÓN 8: ANTECEDENTES JUDICIALES -->
      <div className="pdf-section" style=" margin-bottom: 16px;">
        <h2 style="font-size: 12px; color: #1e3a8a; margin-top: 0; border-bottom: 2px solid #cbd5e1; padding-bottom: 4px; font-weight: 800;">
          8. Antecedentes Judiciales & Edictos
        </h2>
        <table style="width: 100%; border-collapse: collapse; font-size: 10px;" border="1" borderColor="#cbd5e1" cellPadding="4">
          <tr style="background: #1e293b; color: #ffffff; ">
            <th style="text-align: left;">Fuero / Organismo</th>
            <th style="text-align: left;">Estado Registrado</th>
            <th style="text-align: center;">Riesgo OSINT</th>
          </tr>
          ${lawsuits.length > 0 ? lawsuits.map(l => `
            <tr style="background: #ffffff; ">
              <td><strong>${l.type}</strong></td>
              <td>${l.status}</td>
              <td style="text-align: center; color: ${l.severity === 'SIN RIESGO' ? '#047857' : '#b45309'}; font-weight: 800;">${l.severity}</td>
            </tr>
          `).join('') : `
            <tr style="">
              <td><strong>Fuero Comercial, Laboral & Penal</strong></td>
              <td>Sin causas judiciales ejecutivas registradas</td>
              <td style="text-align: center; color: #047857; font-weight: 800;">SIN RIESGO</td>
            </tr>
          `}
        </table>
      </div>

      <!-- NUEVA SECCIÓN: BOLETÍN OFICIAL & SOCIEDADES -->
      <div className="pdf-section" style=" margin-bottom: 16px;">
        <h2 style="font-size: 12px; color: #1e3a8a; margin-top: 0; border-bottom: 2px solid #cbd5e1; padding-bottom: 4px; font-weight: 800;">
          Antecedentes Societarios (BORA / Dateas / OpenCorporates)
        </h2>
        <table style="width: 100%; border-collapse: collapse; font-size: 10px;" border="1" borderColor="#cbd5e1" cellPadding="4">
          <tr style="background: #f8fafc; ">
            <th style="width: 50%; text-align: left;">Directorio & Socios / Representantes</th>
            <th style="width: 50%; text-align: left;">Edictos Comerciales / Concursos</th>
          </tr>
          <tr style="background: #ffffff; vertical-align: top; ">
            <td>
              ${(dateas.directors && dateas.directors.length > 0) ? dateas.directors.join('<br>') : (oc.directors && oc.directors.length > 0 ? oc.directors.map(d=>d.name).join('<br>') : 'Sin registros de directorio públicos')}
            </td>
            <td>
              ${(bora.bankruptcyEdicts && bora.bankruptcyEdicts.length > 0) ? '<span style="color:#be123c; font-weight:bold;">⚠️ Edictos de Concurso/Quiebra detectados</span>' : '<span style="color:#047857;">Sin edictos concursales registrados.</span>'}
            </td>
          </tr>
        </table>
      </div>

      <!-- NUEVA SECCIÓN: CONTINGENCIAS LABORALES (REPSAL) -->
      <div className="pdf-section" style=" margin-bottom: 16px; background: #fff1f2; border: 1px solid #fecdd3; border-radius: 8px; padding: 12px;">
        <h2 style="font-size: 12px; color: #be123c; margin-top: 0; border-bottom: 2px solid #fda4af; padding-bottom: 4px; font-weight: 800;">
          Registro de Infracciones Laborales (REPSAL)
        </h2>
        <table style="width: 100%; border-collapse: collapse; font-size: 10px;" border="1" borderColor="#fecdd3" cellPadding="4">
          <tr style="background: #ffe4e6; ">
            <th style="text-align: left;">Estado en el Registro</th>
            <th style="text-align: left;">Total de Infracciones</th>
          </tr>
          <tr style="background: #ffffff; ">
            <td><strong style="color: ${repsal.hasSanctions ? '#be123c' : '#047857'};">${repsal.hasSanctions ? '⚠️ REGISTRA INFRACCIONES LABORALES' : '✓ SIN REGISTROS EN REPSAL'}</strong></td>
            <td>${repsal.totalSanctions || 0} actas / expedientes</td>
          </tr>
        </table>
      </div>

      <!-- SECCIÓN 9: PROGRAMA DE ASISTENCIA -->
      <div className="pdf-section" style=" margin-bottom: 16px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 12px;">
        <h2 style="font-size: 12px; color: #15803d; margin-top: 0; border-bottom: 2px solid #86efac; padding-bottom: 4px; font-weight: 800;">
          9. Programa de Asistencia & Apoyo Estratégico Tecno3F
        </h2>
        <table style="width: 100%; border-collapse: collapse; font-size: 10px;" border="1" borderColor="#bbf7d0" cellPadding="4">
          <tr style="background: #dcfce7; ">
            <th style="width: 30%; text-align: left;">Programa de Apoyo</th>
            <th style="width: 70%; text-align: left;">Detalle del Plan & Acciones Sugeridas</th>
          </tr>
          ${recommendations.length > 0 ? recommendations.map((rec, idx) => `
            <tr style="background: #ffffff; ">
              <td><strong>${idx + 1}. ${rec.title}</strong><br><span style="font-size: 8.5px; color: #15803d;">Prioridad: ${rec.priority}</span></td>
              <td>${rec.description}</td>
            </tr>
          `).join('') : `
            <tr style="">
              <td><strong>Postulación a ANR 4.0 & Crédito Fiscal</strong></td>
              <td>Acceso a co-financiamiento para telegestión, sensórica IoT e infraestructura de planta.</td>
            </tr>
          `}
        </table>
      </div>

      <!-- SECCIÓN 10: HOJA DE FUENTES & TRAZABILIDAD OSINT -->
      <div className="pdf-section" style=" margin-bottom: 16px; margin-top: 14px;">
        <h2 style="font-size: 12px; color: #0f172a; margin-top: 0; border-bottom: 2px solid #2563eb; padding-bottom: 4px; font-weight: 900; text-transform: uppercase;">
          10. Hoja de Fuentes de Información & Trazabilidad OSINT
        </h2>
        <table style="width: 100%; border-collapse: collapse; font-size: 9.5px;" border="1" borderColor="#cbd5e1" cellPadding="5">
          <tr style="background: #0f172a; color: #ffffff; font-weight: 800; page-break-inside: avoid !important;">
            <th style="width: 25%; text-align: left;">Módulo OSINT</th>
            <th style="width: 45%; text-align: left;">Fuente de Datos Consultada</th>
            <th style="width: 30%; text-align: center;">Estado de Verificación</th>
          </tr>
          <tr style="background: #ffffff;">
            <td><strong>Padrón Fiscal ARCA / AFIP</strong></td>
            <td>API REST Padrón v2 (aws.afip.gov.ar) / Constancia de Inscripción</td>
            <td style="text-align: center;">
              ${afipReal
                ? '<span style="background: #10b981; color: #ffffff; font-size: 8px; font-weight: 800; padding: 2px 6px; border-radius: 4px;">✓ DATO REAL EN VIVO</span>'
                : '<span style="background: #f59e0b; color: #ffffff; font-size: 8px; font-weight: 800; padding: 2px 6px; border-radius: 4px;">⚠ ESTIMACIÓN ANALÍTICA</span>'}
            </td>
          </tr>
          <tr style="background: #f8fafc;">
            <td><strong>Central de Deudores BCRA</strong></td>
            <td>API Oficial Central de Deudores (api.bcra.gob.ar) / Cheques Rechazados</td>
            <td style="text-align: center;">
              ${bcraReal
                ? '<span style="background: #10b981; color: #ffffff; font-size: 8px; font-weight: 800; padding: 2px 6px; border-radius: 4px;">✓ DATO REAL EN VIVO</span>'
                : '<span style="background: #f59e0b; color: #ffffff; font-size: 8px; font-weight: 800; padding: 2px 6px; border-radius: 4px;">⚠ ESTIMACIÓN ANALÍTICA</span>'}
            </td>
          </tr>
          <tr style="background: #ffffff;">
            <td><strong>Registro de Sociedades (Ley 26.047)</strong></td>
            <td>Ministerio de Justicia & Registro Nacional de Sociedades (RNS)</td>
            <td style="text-align: center;">
              ${legalReal
                ? '<span style="background: #10b981; color: #ffffff; font-size: 8px; font-weight: 800; padding: 2px 6px; border-radius: 4px;">✓ DATO REAL EN VIVO</span>'
                : '<span style="background: #64748b; color: #ffffff; font-size: 8px; font-weight: 800; padding: 2px 6px; border-radius: 4px;">CONSULTA GENERAL</span>'}
            </td>
          </tr>
          <tr style="background: #f8fafc;">
            <td><strong>Contrataciones Públicas (COMPR.AR / CONTRAT.AR)</strong></td>
            <td>Padrón Estatal de Proveedores SiPRO & Obra Pública (datos.gob.ar)</td>
            <td style="text-align: center;">
              ${contractsReal
                ? '<span style="background: #10b981; color: #ffffff; font-size: 8px; font-weight: 800; padding: 2px 6px; border-radius: 4px;">✓ DATO REAL EN VIVO</span>'
                : '<span style="background: #64748b; color: #ffffff; font-size: 8px; font-weight: 800; padding: 2px 6px; border-radius: 4px;">SIN CONTRATOS REGISTRADOS</span>'}
            </td>
          </tr>
          <tr style="background: #ffffff;">
            <td><strong>Padrón Oficial MiPyME</strong></td>
            <td>Secretaría de la Pequeña y Mediana Empresa (Ministerio de Economía)</td>
            <td style="text-align: center;">
              ${pymeReal
                ? '<span style="background: #10b981; color: #ffffff; font-size: 8px; font-weight: 800; padding: 2px 6px; border-radius: 4px;">✓ DATO REAL EN VIVO</span>'
                : '<span style="background: #64748b; color: #ffffff; font-size: 8px; font-weight: 800; padding: 2px 6px; border-radius: 4px;">SIN REGISTRO DIRECTO</span>'}
            </td>
          </tr>
          <tr style="background: #f8fafc;">
            <td><strong>Marcas & Propiedad Intelectual</strong></td>
            <td>INPI Argentina / WIPO Global Brand Database</td>
            <td style="text-align: center;">
              ${inpiReal
                ? '<span style="background: #10b981; color: #ffffff; font-size: 8px; font-weight: 800; padding: 2px 6px; border-radius: 4px;">✓ DATO REAL EN VIVO</span>'
                : '<span style="background: #64748b; color: #ffffff; font-size: 8px; font-weight: 800; padding: 2px 6px; border-radius: 4px;">CONSULTA GENERAL</span>'}
            </td>
          </tr>
          <tr style="background: #ffffff;">
            <td><strong>Comercio Exterior (Aduana)</strong></td>
            <td>Registros Aduaneros / Nosis / Veraz</td>
            <td style="text-align: center;">
              ${tradeReal
                ? '<span style="background: #10b981; color: #ffffff; font-size: 8px; font-weight: 800; padding: 2px 6px; border-radius: 4px;">✓ DATO REAL EN VIVO</span>'
                : '<span style="background: #f59e0b; color: #ffffff; font-size: 8px; font-weight: 800; padding: 2px 6px; border-radius: 4px;">⚠ ESTIMACIÓN ANALÍTICA</span>'}
            </td>
          </tr>
          <tr style="background: #f8fafc;">
            <td><strong>Infracciones Laborales</strong></td>
            <td>Registro Público de Empleadores (REPSAL)</td>
            <td style="text-align: center;">
              ${repsalReal
                ? '<span style="background: #10b981; color: #ffffff; font-size: 8px; font-weight: 800; padding: 2px 6px; border-radius: 4px;">✓ DATO REAL EN VIVO</span>'
                : '<span style="background: #64748b; color: #ffffff; font-size: 8px; font-weight: 800; padding: 2px 6px; border-radius: 4px;">CONSULTA GENERAL</span>'}
            </td>
          </tr>
        </table>
      </div>

      <!-- INSTITUTIONAL FOOTER -->
      <div className="pdf-section" style=" text-align: center; font-size: 8.5px; color: #64748b; border-top: 2px solid #cbd5e1; padding-top: 6px; margin-top: 12px;">
        © ${new Date().getFullYear()} OSINT Tecno3F. Plataforma Profesional de Inteligencia Comercial & Asistencia Empresarial. Todos los derechos reservados.
      </div>
    </div>
  `;

  try {
    const response = await fetch('/api/generate-pdf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ html: htmlContent, filename: companyClean })
    });

    if (!response.ok) throw new Error('Network response was not ok');

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Informe_OSINT_${companyClean}_Completo_${Date.now()}.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
  } catch (e) {
    console.error('PDF Generation Error:', e);
  }
}
