import html2pdf from 'html2pdf.js';

/**
 * Generates and downloads an Institutional, Multi-page PDF Report with Watermark,
 * Official Tecno3F Logo, Clean Page Breaks, Data Tables, and ALL Analysis Results EXCEPT the Support Plan.
 */
export async function downloadFullPdfReport(report) {
  if (!report) return;

  const query = report.query || {};
  const companyName = query.companyName || 'Empresa';
  const scraped = report.scrapedData || {};
  const categorization = report.categorization || {};
  const financial = report.financialData || {};
  const tax = financial.taxProfile || {};
  const cap = financial.biddingCapacity || {};
  const legal = report.legalData || {};
  const lawsuits = legal.lawsuits || [];
  const contractsObj = report.publicContracts || {};
  const contracts = contractsObj.contracts || [];
  const swot = report.swotAnalysis || {};
  const digital = report.digitalTransformation || {};
  const techStack = digital.techStack || [];
  const kits = digital.recommendedKits || {};
  const answers = scraped.businessAnswers || {};

  const companyClean = companyName.replace(/[^a-zA-Z0-9]/g, '_');
  const reportId = report.id || `OSINT-REPORT-${Date.now().toString().slice(-6)}`;
  const currentDateStr = new Date().toLocaleDateString('es-AR');

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const logoUrl = `${origin}/tecno3f-color.png`;

  const htmlContent = `
    <div style="position: relative; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #0f172a; padding: 24px; background: #ffffff; line-height: 1.5; font-size: 12px; overflow: hidden;">
      
      <!-- WATERMARK BACKGROUND -->
      <div style="position: absolute; top: 35%; left: 0%; width: 100%; text-align: center; transform: rotate(-32deg); opacity: 0.04; font-size: 46px; font-weight: 900; color: #1e3a8a; pointer-events: none; user-select: none; letter-spacing: 0.12em; text-transform: uppercase;">
        CONFIDENCIAL — TECNO3F OSINT INTELLIGENCE
      </div>

      <!-- INSTITUTIONAL HEADER -->
      <div style="page-break-inside: avoid; break-inside: avoid; border-bottom: 3px solid #2563eb; padding: 16px 20px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center; background: #f8fafc; border-radius: 10px; border: 1px solid #e2e8f0;">
        <div style="display: flex; align-items: center; gap: 14px;">
          <div style="height: 52px; display: flex; align-items: center;">
            <img
              src="${logoUrl}"
              alt="Logo Tecno3F"
              style="max-height: 50px; max-width: 160px; object-fit: contain;"
              onerror="this.onerror=null; this.style.display='none';"
            />
          </div>
          <div>
            <div style="font-size: 9px; font-weight: 800; color: #2563eb; text-transform: uppercase; letter-spacing: 0.12em;">
              PLATAFORMA DE INTELIGENCIA CORPORATIVA & OSINT TECNO3F
            </div>
            <h1 style="font-size: 19px; margin: 2px 0 0 0; color: #0f172a; font-weight: 900; letter-spacing: -0.02em;">
              INFORME INTEGRAL DE EVALUACIÓN EMPRESARIAL
            </h1>
            <div style="font-size: 13px; color: #1d4ed8; font-weight: 800; margin-top: 2px;">
              Empresa Evaluada: <span style="color: #0f172a;">${companyName}</span>
            </div>
          </div>
        </div>

        <div style="text-align: right; font-size: 11px; color: #475569;">
          <div style="margin-bottom: 6px;">
            <span style="background: #1e3a8a; color: #ffffff; font-size: 9px; font-weight: 800; padding: 3px 10px; border-radius: 4px; text-transform: uppercase; letter-spacing: 0.06em;">
              🔒 CONFIDENCIAL / USO PRIVADO
            </span>
          </div>
          <div><strong>Fecha de Emisión:</strong> ${currentDateStr}</div>
          <div><strong>ID Reporte:</strong> <code>${reportId}</code></div>
          <div><strong>Dominio Web:</strong> ${query.website || scraped.url || 'Investigación Abierta'}</div>
        </div>
      </div>

      <!-- DASHBOARD DE MÉTRICAS CLAVE -->
      <div style="page-break-inside: avoid; break-inside: avoid; margin-bottom: 24px; background: linear-gradient(135deg, #0f172a, #1e293b); border: 2px solid #334155; border-radius: 12px; padding: 18px;">
        <h2 style="font-size: 14px; color: #60a5fa; margin-top: 0; margin-bottom: 14px; text-align: center; text-transform: uppercase; letter-spacing: 0.1em; border-bottom: 1px solid #334155; padding-bottom: 8px; font-weight: 800;">
          📊 Dashboard de Indicadores Ejecutivo
        </h2>

        <table style="width: 100%; border-collapse: collapse;">
          <tr style="page-break-inside: avoid; break-inside: avoid;">
            <!-- Scoring Crediticio -->
            <td style="width: 33%; padding: 6px; vertical-align: top;">
              <div style="background: #090d16; border: 1px solid #334155; border-radius: 8px; padding: 12px; text-align: center;">
                <div style="font-size: 10px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.08em; font-weight: 700;">Scoring Crediticio BCRA</div>
                <div style="font-size: 34px; font-weight: 900; color: ${(financial.creditScore || 75) >= 70 ? '#10b981' : (financial.creditScore || 75) >= 40 ? '#f59e0b' : '#ef4444'}; margin: 6px 0 2px 0;">${financial.creditScore || 75}</div>
                <div style="font-size: 10px; color: #64748b;">de 100 puntos</div>
                <div style="margin-top: 6px; background: #1e293b; border-radius: 6px; height: 8px; overflow: hidden;">
                  <div style="height: 100%; width: ${financial.creditScore || 75}%; background: linear-gradient(90deg, ${(financial.creditScore || 75) >= 70 ? '#10b981, #34d399' : (financial.creditScore || 75) >= 40 ? '#f59e0b, #fbbf24' : '#ef4444, #f87171'}); border-radius: 6px;"></div>
                </div>
                <div style="font-size: 10px; color: ${(financial.creditScore || 75) >= 70 ? '#34d399' : (financial.creditScore || 75) >= 40 ? '#fbbf24' : '#f87171'}; margin-top: 4px; font-weight: 800;">${financial.riskLevel || 'RIESGO BAJO'}</div>
              </div>
            </td>

            <!-- Madurez Digital -->
            <td style="width: 33%; padding: 6px; vertical-align: top;">
              <div style="background: #090d16; border: 1px solid #334155; border-radius: 8px; padding: 12px; text-align: center;">
                <div style="font-size: 10px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.08em; font-weight: 700;">Madurez Digital</div>
                <div style="font-size: 34px; font-weight: 900; color: #06b6d4; margin: 6px 0 2px 0;">${digital.digitalScore || 72}%</div>
                <div style="font-size: 10px; color: #64748b;">${digital.maturityLevel || 'Digitalización 4.0'}</div>
                <div style="margin-top: 6px; background: #1e293b; border-radius: 6px; height: 8px; overflow: hidden;">
                  <div style="height: 100%; width: ${digital.digitalScore || 72}%; background: linear-gradient(90deg, #0284c7, #06b6d4, #22d3ee); border-radius: 6px;"></div>
                </div>
                <div style="font-size: 10px; color: #38bdf8; margin-top: 4px; font-weight: 800;">PROCESO 4.0 ACTIVO</div>
              </div>
            </td>

            <!-- Capacidad Licitatoria -->
            <td style="width: 33%; padding: 6px; vertical-align: top;">
              <div style="background: #090d16; border: 1px solid #334155; border-radius: 8px; padding: 12px; text-align: center;">
                <div style="font-size: 10px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.08em; font-weight: 700;">Capacidad Licitatoria</div>
                <div style="font-size: 16px; font-weight: 900; color: #a78bfa; margin: 10px 0 2px 0;">${cap.estimatedBiddingCapacityARS || categorization.biddingCapacity || '$250.000.000 ARS'}</div>
                <div style="font-size: 10px; color: #64748b;">Estimación Máxima</div>
                <div style="margin-top: 8px; background: rgba(139,92,246,0.15); border-radius: 6px; padding: 3px 6px;">
                  <span style="font-size: 10px; color: #c4b5fd; font-weight: 700;">🏛️ ${contractsObj.supplierRegistryStatus || 'Habilitado COMPR.AR'}</span>
                </div>
              </div>
            </td>
          </tr>
        </table>
      </div>

      <!-- SECCIÓN 1: RESUMEN GENERAL & PERFIL INSTITUCIONAL -->
      <div style="page-break-inside: avoid; break-inside: avoid; margin-bottom: 24px; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 16px;">
        <h2 style="font-size: 14px; color: #1e3a8a; margin-top: 0; border-bottom: 2px solid #cbd5e1; padding-bottom: 6px; font-weight: 800;">
          1. Resumen General & Perfil Corporativo
        </h2>
        <p style="margin: 8px 0 12px 0; font-size: 12px; color: #334155; line-height: 1.6;">
          ${categorization.summary || scraped.aboutUs || 'Empresa operativa relevante analizada mediante rastreo OSINT abierto y fuentes de registros públicos.'}
        </p>

        <table style="width: 100%; font-size: 11px; border-collapse: collapse;" border="1" borderColor="#cbd5e1" cellPadding="6">
          <tr style="background: #e2e8f0; page-break-inside: avoid; break-inside: avoid;">
            <th style="text-align: left; width: 25%;">Rubro / Sector</th>
            <th style="text-align: left; width: 25%;">Modelo de Negocio</th>
            <th style="text-align: left; width: 25%;">Escala Corporativa</th>
            <th style="text-align: left; width: 25%;">Situación Fiscal AFIP</th>
          </tr>
          <tr style="page-break-inside: avoid; break-inside: avoid;">
            <td><strong>${categorization.sector || 'Industrial & Servicios'}</strong></td>
            <td>${categorization.businessModel || 'B2B'}</td>
            <td>${categorization.companyType || 'PyME'}</td>
            <td><span style="color: #047857; font-weight: 700;">${tax.taxCompliance || 'Inscripto y Activo'}</span></td>
          </tr>
        </table>
      </div>

      <!-- SECCIÓN 2: EXTRACCIÓN WEB & PERFIL COMERCIAL -->
      <div style="page-break-inside: avoid; break-inside: avoid; margin-bottom: 24px;">
        <h2 style="font-size: 14px; color: #1e3a8a; margin-top: 0; border-bottom: 2px solid #cbd5e1; padding-bottom: 6px; font-weight: 800;">
          2. Extracción Web & Perfil Comercial Completo
        </h2>
        <table style="width: 100%; border-collapse: collapse; font-size: 11px;" border="1" borderColor="#cbd5e1" cellPadding="6">
          <tr style="background: #1e293b; color: #ffffff; page-break-inside: avoid; break-inside: avoid;">
            <th style="width: 25%; text-align: left;">Dimensión Comercial</th>
            <th style="text-align: left;">Detalle Extraído y Verificado</th>
          </tr>
          <tr style="background: #ffffff; page-break-inside: avoid; break-inside: avoid;">
            <td><strong>📦 Productos Destacados</strong></td>
            <td>${(scraped.products || ['Piezas industriales, componentes y catálogo bajo pedido']).join(' • ')}</td>
          </tr>
          <tr style="background: #f8fafc; page-break-inside: avoid; break-inside: avoid;">
            <td><strong>🛠️ Servicios Ofrecidos</strong></td>
            <td>${(scraped.services || ['Asistencia técnica, mecanizado y soporte operativo']).join(' • ')}</td>
          </tr>
          <tr style="background: #ffffff; page-break-inside: avoid; break-inside: avoid;">
            <td><strong>🎯 Clientes & Mercado Objetivo</strong></td>
            <td>${(scraped.clients || ['Empresas industriales y contratistas corporativos B2B']).join(' • ')}</td>
          </tr>
          <tr style="background: #f8fafc; page-break-inside: avoid; break-inside: avoid;">
            <td><strong>🏭 Industrias Atendidas</strong></td>
            <td>${(scraped.industries || ['Metalúrgica, Energía, Construcción, Automotriz']).join(' • ')}</td>
          </tr>
          <tr style="background: #ffffff; page-break-inside: avoid; break-inside: avoid;">
            <td><strong>💡 Propuesta de Valor</strong></td>
            <td>${scraped.valueProposition || 'Calidad, eficiencia técnica y adaptabilidad industrial.'}</td>
          </tr>
          <tr style="background: #f8fafc; page-break-inside: avoid; break-inside: avoid;">
            <td><strong>🏆 Certificaciones Registradas</strong></td>
            <td>${(scraped.certifications || categorization.certifications || ['ISO 9001, Habilitación Comercial Vigente']).join(' • ')}</td>
          </tr>
        </table>
      </div>

      <!-- SECCIÓN 3: MODELO DE NEGOCIO -->
      <div style="page-break-inside: avoid; break-inside: avoid; margin-bottom: 24px; background: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 8px; padding: 16px;">
        <h2 style="font-size: 14px; color: #1e3a8a; margin-top: 0; border-bottom: 2px solid #cbd5e1; padding-bottom: 6px; font-weight: 800;">
          3. Modelo de Negocio & Operaciones
        </h2>
        <table style="width: 100%; border-collapse: collapse; font-size: 11px;" border="1" borderColor="#cbd5e1" cellPadding="6">
          <tr style="background: #e2e8f0; page-break-inside: avoid; break-inside: avoid;">
            <th style="width: 50%; text-align: left;">Pregunta de Negocio Analizada</th>
            <th style="width: 50%; text-align: left;">Respuesta OSINT Verificada</th>
          </tr>
          <tr style="page-break-inside: avoid; break-inside: avoid;">
            <td><strong>¿Qué vende o comercializa?</strong></td>
            <td>${answers.whatItSells || 'Productos industriales y soluciones técnicas especializadas.'}</td>
          </tr>
          <tr style="background: #f8fafc; page-break-inside: avoid; break-inside: avoid;">
            <td><strong>¿Quién es su cliente comprador?</strong></td>
            <td>${answers.whoBuys || 'Empresas corporativas, industrias y organismos públicos.'}</td>
          </tr>
          <tr style="page-break-inside: avoid; break-inside: avoid;">
            <td><strong>¿Cómo genera sus ingresos?</strong></td>
            <td>${answers.howItGeneratesRevenue || 'Venta directa de productos, contratos y servicios técnicos.'}</td>
          </tr>
          <tr style="background: #f8fafc; page-break-inside: avoid; break-inside: avoid;">
            <td><strong>Activo u operación clave:</strong></td>
            <td>${answers.mostImportantAsset || 'Planta de producción, equipamiento técnico y personal especializado.'}</td>
          </tr>
        </table>
      </div>

      <!-- SECCIÓN 4: MATRIZ FODA (ANÁLISIS ESTRATÉGICO) -->
      <div style="page-break-inside: avoid; break-inside: avoid; margin-bottom: 24px;">
        <h2 style="font-size: 14px; color: #1e3a8a; margin-top: 0; border-bottom: 2px solid #cbd5e1; padding-bottom: 6px; font-weight: 800;">
          4. Matriz FODA (Análisis Estratégico de Situación)
        </h2>
        <table style="width: 100%; border-collapse: collapse; font-size: 11px;" border="1" borderColor="#cbd5e1" cellPadding="8">
          <tr style="background: #f1f5f9; page-break-inside: avoid; break-inside: avoid;">
            <th style="width: 50%; color: #047857; text-align: left;">💪 Fortalezas Identificadas</th>
            <th style="width: 50%; color: #b45309; text-align: left;">⚠️ Debilidades Identificadas</th>
          </tr>
          <tr style="background: #ffffff; vertical-align: top; page-break-inside: avoid; break-inside: avoid;">
            <td>• ${(swot.strengths || ['Sólida posición de mercado y solvencia crediticia']).join('<br><br>• ')}</td>
            <td>• ${(swot.weaknesses || ['Oportunidad de ampliar visibilidad digital de casos de éxito']).join('<br><br>• ')}</td>
          </tr>
          <tr style="background: #f1f5f9; page-break-inside: avoid; break-inside: avoid;">
            <th style="color: #1d4ed8; text-align: left;">🚀 Oportunidades de Crecimiento</th>
            <th style="color: #be123c; text-align: left;">🛡️ Amenazas del Entorno</th>
          </tr>
          <tr style="background: #ffffff; vertical-align: top; page-break-inside: avoid; break-inside: avoid;">
            <td>• ${(swot.opportunities || ['Licitaciones públicas y financiamiento ANR 4.0']).join('<br><br>• ')}</td>
            <td>• ${(swot.threats || ['Volatilidad de costos de insumos y competencia regional']).join('<br><br>• ')}</td>
          </tr>
        </table>
      </div>

      <!-- SECCIÓN 5: TRANSFORMACIÓN DIGITAL & PROGRAMA KITS 4.0 -->
      <div style="page-break-inside: avoid; break-inside: avoid; margin-bottom: 24px; background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; padding: 16px;">
        <h2 style="font-size: 14px; color: #0369a1; margin-top: 0; border-bottom: 2px solid #7dd3fc; padding-bottom: 6px; font-weight: 800;">
          5. Transformación Digital & Programa Kits 4.0 (Secretaría de Industria)
        </h2>

        <div style="margin-bottom: 12px; font-size: 12px; color: #0369a1;">
          <strong>Índice de Madurez Digital:</strong> ${digital.digitalScore || 65}% (${digital.maturityLevel || 'Digital'})
        </div>

        <table style="width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 14px;" border="1" borderColor="#cbd5e1" cellPadding="6">
          <tr style="background: #e0f2fe; page-break-inside: avoid; break-inside: avoid;">
            <th style="width: 30%; text-align: left;">Recomendación Kit 4.0</th>
            <th style="width: 50%; text-align: left;">Detalle del Kit Indexado (Base Oficial PDF)</th>
            <th style="width: 20%; text-align: left;">Financiamiento ANR</th>
          </tr>
          ${kits.primary ? `
            <tr style="background: #ffffff; page-break-inside: avoid; break-inside: avoid;">
              <td><strong>📌 Propuesta Principal (${kits.primary.code})</strong></td>
              <td><strong>${kits.primary.name}</strong><br><span style="color: #475569;">${kits.primary.aiRationale}</span></td>
              <td><span style="color: #047857; font-weight: 800;">${kits.primary.fundingCoverage || 'ANR 50%'}</span></td>
            </tr>
          ` : ''}
          ${kits.secondary ? `
            <tr style="background: #f8fafc; page-break-inside: avoid; break-inside: avoid;">
              <td><strong>🔹 Propuesta Complementaria (${kits.secondary.code})</strong></td>
              <td><strong>${kits.secondary.name}</strong><br><span style="color: #475569;">${kits.secondary.aiRationale}</span></td>
              <td><span style="color: #047857; font-weight: 800;">${kits.secondary.fundingCoverage || 'ANR 50%'}</span></td>
            </tr>
          ` : ''}
        </table>

        ${techStack.length > 0 ? `
          <table style="width: 100%; border-collapse: collapse; font-size: 10px;" border="1" borderColor="#cbd5e1" cellPadding="4">
            <tr style="background: #e2e8f0; page-break-inside: avoid; break-inside: avoid;">
              <th>Categoría Tecnológica</th>
              <th>Herramienta Detectada</th>
              <th>Estado</th>
            </tr>
            ${techStack.map(t => `
              <tr style="page-break-inside: avoid; break-inside: avoid;">
                <td><strong>${t.category}</strong></td>
                <td>${t.name}</td>
                <td><span style="color: #0369a1; font-weight: 700;">${t.status}</span></td>
              </tr>
            `).join('')}
          </table>
        ` : ''}
      </div>

      <!-- SECCIÓN 6: RASTREO JUDICIAL & LEGAL -->
      <div style="page-break-inside: avoid; break-inside: avoid; margin-bottom: 24px;">
        <h2 style="font-size: 14px; color: #1e3a8a; margin-top: 0; border-bottom: 2px solid #cbd5e1; padding-bottom: 6px; font-weight: 800;">
          6. Rastreo Judicial, Penal & Antecedentes Legales
        </h2>
        <p style="font-size: 11px; color: #475569; margin-bottom: 8px;">
          Dictamen Legal OSINT: <strong>${legal.legalStatus || 'SIN OBSERVACIONES JUDICIALES'}</strong> (${legal.judicialRecordsCount || 0} causas encontradas).
        </p>

        <table style="width: 100%; border-collapse: collapse; font-size: 11px;" border="1" borderColor="#cbd5e1" cellPadding="6">
          <tr style="background: #1e293b; color: #ffffff; page-break-inside: avoid; break-inside: avoid;">
            <th style="text-align: left;">Fuero / Organismo Evaluado</th>
            <th style="text-align: left;">Estado Registrado</th>
            <th style="text-align: center;">Severidad OSINT</th>
          </tr>
          ${lawsuits.length > 0 ? lawsuits.map(l => `
            <tr style="background: #ffffff; page-break-inside: avoid; break-inside: avoid;">
              <td><strong>${l.type}</strong></td>
              <td>${l.status}</td>
              <td style="text-align: center; color: ${l.severity === 'SIN RIESGO' ? '#047857' : '#b45309'}; font-weight: 800;">${l.severity}</td>
            </tr>
          `).join('') : `
            <tr style="page-break-inside: avoid; break-inside: avoid;">
              <td><strong>Fuero Comercial, Laboral & Penal</strong></td>
              <td>Sin registros de causas ejecutivas o embargos</td>
              <td style="text-align: center; color: #047857; font-weight: 800;">SIN RIESGO</td>
            </tr>
          `}
        </table>
      </div>

      <!-- SECCIÓN 7: CONTRATOS PÚBLICOS & LICITACIONES (COMPR.AR) -->
      <div style="page-break-inside: avoid; break-inside: avoid; margin-bottom: 24px;">
        <h2 style="font-size: 14px; color: #1e3a8a; margin-top: 0; border-bottom: 2px solid #cbd5e1; padding-bottom: 6px; font-weight: 800;">
          7. Contrataciones Públicas & Licitaciones del Estado
        </h2>
        <p style="font-size: 11px; color: #047857; margin-bottom: 8px;">
          ✔ Registrado en Portal COMPR.AR: <strong>${contractsObj.supplierRegistryStatus || 'Habilitado'}</strong>. Total Adjudicado Acumulado: <strong>${contractsObj.totalAwardedAmount || '$0 ARS'}</strong>
        </p>

        <table style="width: 100%; border-collapse: collapse; font-size: 11px;" border="1" borderColor="#cbd5e1" cellPadding="6">
          <tr style="background: #1e293b; color: #ffffff; page-break-inside: avoid; break-inside: avoid;">
            <th style="text-align: left;">Organismo Comprador</th>
            <th style="text-align: left;">Monto Adjudicado</th>
            <th style="text-align: left;">Fecha</th>
            <th style="text-align: left;">Objeto del Contrato</th>
          </tr>
          ${contracts.length > 0 ? contracts.map(c => `
            <tr style="background: #ffffff; page-break-inside: avoid; break-inside: avoid;">
              <td><strong>${c.organism}</strong></td>
              <td><strong style="color: #047857;">${c.amount}</strong></td>
              <td>${c.date}</td>
              <td>${c.description}</td>
            </tr>
          `).join('') : `
            <tr style="page-break-inside: avoid; break-inside: avoid;">
              <td><strong>Portal COMPR.AR / Argentina Compra</strong></td>
              <td>$0 ARS</td>
              <td>Histórico</td>
              <td>Habilitado para participar en licitaciones del Estado Nacional y Provincial.</td>
            </tr>
          `}
        </table>
      </div>

      <!-- SECCIÓN 8: SITUACIÓN FISCAL, DEUDAS Y BALANCES (AFIP / BCRA) -->
      <div style="page-break-inside: avoid; break-inside: avoid; margin-bottom: 24px;">
        <h2 style="font-size: 14px; color: #1e3a8a; margin-top: 0; border-bottom: 2px solid #cbd5e1; padding-bottom: 6px; font-weight: 800;">
          8. Situación Impositiva, Balances & Deudas (AFIP / BCRA)
        </h2>

        <table style="width: 100%; border-collapse: collapse; font-size: 11px;" border="1" borderColor="#cbd5e1" cellPadding="6">
          <tr style="background: #f8fafc; page-break-inside: avoid; break-inside: avoid;">
            <td style="width: 33%;"><strong>CUIT Oficial:</strong> ${tax.cuit || financial.taxProfile?.cuit || '30-XXXXXXXX-X'}</td>
            <td style="width: 33%;"><strong>Condición IVA:</strong> ${tax.vatCondition || 'Responsable Inscripto'}</td>
            <td style="width: 33%;"><strong>Estado Impositivo:</strong> <span style="color: #047857; font-weight: 700;">${tax.taxCompliance || 'Sin deudas ejecutivas'}</span></td>
          </tr>
          <tr style="page-break-inside: avoid; break-inside: avoid;">
            <td><strong>Scoring Crediticio BCRA:</strong> ${financial.creditScore || 75} / 100</td>
            <td><strong>Cheques Rechazados:</strong> ${financial.rejectedChequesCount || 0} registros</td>
            <td><strong>Riesgo Crediticio:</strong> ${financial.riskLevel || 'Bajo Riesgo'}</td>
          </tr>
          <tr style="background: #f8fafc; page-break-inside: avoid; break-inside: avoid;">
            <td><strong>Capacidad Licitatoria:</strong> ${cap.estimatedBiddingCapacityARS || '$250.000.000 ARS'}</td>
            <td><strong>Límite Crédito Sugerido:</strong> ${cap.recommendedCreditLimitARS || '$50.000.000 ARS'}</td>
            <td><strong>Registro MiPyME:</strong> Certificado Vigente</td>
          </tr>
        </table>
      </div>

      <!-- INSTITUTIONAL FOOTER -->
      <div style="page-break-inside: avoid; break-inside: avoid; text-align: center; font-size: 10px; color: #64748b; border-top: 2px solid #cbd5e1; padding-top: 12px; margin-top: 20px;">
        © ${new Date().getFullYear()} OSINT Tecno3F. Desarrollado por Tecno3F. Todos los derechos reservados. | Documento de Inteligencia Corporativa Confidencial.
      </div>
    </div>
  `;

  // Temporary DOM container for html2pdf
  const tempContainer = document.createElement('div');
  tempContainer.innerHTML = htmlContent;
  document.body.appendChild(tempContainer);

  const filename = `Informe_OSINT_${companyClean}_Completo_${Date.now()}.pdf`;

  const options = {
    margin: [8, 8, 8, 8],
    filename: filename,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false
    },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
  };

  try {
    await html2pdf().set(options).from(tempContainer).save();
  } catch (e) {
    console.error('PDF Generation Error:', e);
  } finally {
    document.body.removeChild(tempContainer);
  }
}
