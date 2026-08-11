import React from 'react';
import { DollarSign, ShieldAlert, CheckCircle2, AlertCircle, TrendingDown, FileText, Landmark, FileCheck, ExternalLink, AlertTriangle } from 'lucide-react';
import RealVsEstimatedBadge from './RealVsEstimatedBadge';

export default function FinancialTab({ financialData = {} }) {
  const data = financialData || {};
  const tax = data.taxProfile || {};
  const fin = data.financialStatements || {};
  const flags = data.financialFlags || [];
  const debtHistory = data.debtHistory || [];
  const bcra = data.bcraDetails || null;

  const trade = data.tradeData || {};
  const pyme = data.pymeData || {};

  return (
    <div className="dashboard-grid">
      {/* CUIT & Tax Profile Banner */}
      <div className="saas-card col-12" style={{ padding: '26px', background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.08), rgba(16, 185, 129, 0.05))', border: '1px solid rgba(37, 99, 235, 0.3)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.78rem', color: '#60a5fa', fontWeight: 800, textTransform: 'uppercase' }}>Padrón Fiscal AFIP / ARCA</span>
              <RealVsEstimatedBadge isRealData={tax.isRealData} sourceLabel={tax.apiSource} />
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '4px' }}>CUIT: {tax.cuit || '30-XXXXXXXX-X'}</h2>
            <div style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              {tax.economicActivity || 'Actividad Comercial e Industrial Inscripta'}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ background: 'rgba(16, 185, 129, 0.12)', color: 'var(--accent-emerald)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '6px 14px', borderRadius: '20px', fontSize: '0.82rem', fontWeight: 700 }}>
              {tax.vatCondition || 'IVA Inscripto'}
            </span>
            <span style={{ background: 'rgba(168, 85, 247, 0.12)', color: '#c084fc', border: '1px solid rgba(168, 85, 247, 0.3)', padding: '6px 14px', borderRadius: '20px', fontSize: '0.82rem', fontWeight: 700 }}>
              {pyme.pymeCategory || 'Dato no disponible en registros públicos'}
            </span>
            <span style={{ background: 'rgba(56, 189, 248, 0.12)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.3)', padding: '6px 14px', borderRadius: '20px', fontSize: '0.82rem', fontWeight: 700 }}>
              🚢 {trade.tradeActivity || 'Comercio Exterior: Operativo'}
            </span>
            {bcra?.bcraOfficialQueryUrl && (
              <a
                href={bcra.bcraOfficialQueryUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary"
                style={{ fontSize: '0.8rem', padding: '6px 12px', gap: '6px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}
              >
                <ExternalLink size={14} /> Consulta BCRA Oficial
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Official PyME Registry Card (Base de Datos SEPyME) */}
      {pyme && (
        <div className="saas-card col-12" style={{ padding: '24px', background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.08), rgba(37, 99, 235, 0.05))', border: pyme.isRealData ? '1px solid rgba(168, 85, 247, 0.35)' : '1px dashed rgba(245, 158, 11, 0.4)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ background: 'rgba(168, 85, 247, 0.18)', padding: '14px', borderRadius: '12px', color: '#c084fc' }}>
                <FileCheck size={28} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.78rem', color: '#c084fc', textTransform: 'uppercase', fontWeight: 800 }}>Registro Oficial MiPyME (datos.gob.ar)</span>
                  <RealVsEstimatedBadge isRealData={pyme.isRealData} sourceLabel={pyme.apiSource} />
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '4px', color: 'var(--text-primary)' }}>
                  {pyme.pymeCategory}
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem', marginTop: '2px' }}>
                  {pyme.details}
                </p>
              </div>
            </div>

            {pyme.evidenceLink && (
              <a
                href={pyme.evidenceLink}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary"
                style={{ fontSize: '0.8rem', padding: '6px 12px', gap: '6px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', borderColor: 'rgba(168, 85, 247, 0.4)', color: '#c084fc' }}
              >
                <ExternalLink size={14} /> Padrón PyME Oficial (datos.gob.ar)
              </a>
            )}
          </div>

          {/* Certificate Detail Grid */}
          {pyme.certDetail && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', background: 'rgba(0,0,0,0.25)', padding: '16px', borderRadius: '12px', fontSize: '0.84rem', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.74rem', textTransform: 'uppercase', fontWeight: 700 }}>Categoría</span>
                <strong style={{ color: 'var(--text-primary)' }}>{pyme.certDetail.categoria}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.74rem', textTransform: 'uppercase', fontWeight: 700 }}>Sector Productivo</span>
                <strong style={{ color: 'var(--text-primary)' }}>{pyme.certDetail.sector}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.74rem', textTransform: 'uppercase', fontWeight: 700 }}>Régimen Tributario</span>
                <strong style={{ color: 'var(--text-primary)' }}>{pyme.certDetail.regimenTributario}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.74rem', textTransform: 'uppercase', fontWeight: 700 }}>Jurisdicción</span>
                <strong style={{ color: 'var(--text-primary)' }}>{pyme.certDetail.provincia}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.74rem', textTransform: 'uppercase', fontWeight: 700 }}>Emisión / Vencimiento</span>
                <strong style={{ color: 'var(--text-primary)' }}>{pyme.certDetail.emisionCertificado} al {pyme.certDetail.vencimientoCertificado}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.74rem', textTransform: 'uppercase', fontWeight: 700 }}>Estado Certificado</span>
                <strong style={{ color: pyme.certDetail.isVigente ? 'var(--accent-emerald)' : 'var(--accent-amber)' }}>
                  {pyme.certDetail.isVigente ? '✔ VIGENTE' : 'HISTÓRICO'}
                </strong>
              </div>
            </div>
          )}

          {/* Fiscal Benefits */}
          {pyme.fiscalBenefits?.length > 0 && (
            <div style={{ marginTop: '14px', display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700 }}>Beneficios Fiscales Habilitados:</span>
              {pyme.fiscalBenefits.map((benefit, idx) => (
                <span key={idx} style={{ background: 'rgba(16, 185, 129, 0.12)', color: 'var(--accent-emerald)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '4px 10px', borderRadius: '14px', fontSize: '0.78rem', fontWeight: 600 }}>
                  ✔ {benefit}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* BCRA Credit Situation & Live Debt Summary Banner */}
      {bcra && (
        <div className="saas-card col-12" style={{ padding: '24px', background: 'rgba(15, 23, 42, 0.6)', border: `1px solid ${bcra.situacionColor || 'rgba(37, 99, 235, 0.3)'}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ background: `${bcra.situacionColor || '#3b82f6'}22`, padding: '14px', borderRadius: '12px', color: bcra.situacionColor || '#60a5fa' }}>
                <Landmark size={28} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Central de Deudores BCRA</span>
                  <RealVsEstimatedBadge isRealData={bcra.isRealData} sourceLabel={bcra.apiSource} />
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '4px', color: bcra.situacionColor || 'var(--text-primary)' }}>
                  {bcra.situacionLabel}
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem', marginTop: '2px' }}>
                  {bcra.situacionDescription}
                </p>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700 }}>Total Deuda Bancaria Reportada</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: bcra.totalDeudaBancariaARS !== '$0 ARS' ? '#38bdf8' : 'var(--accent-emerald)', fontFamily: 'var(--font-mono)' }}>
                {bcra.totalDeudaBancariaARS}
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Periodo: {bcra.periodoMasReciente}
              </div>
            </div>
          </div>

          {/* Creditor Entities Table */}
          {bcra.entidadesCreditoras?.length > 0 ? (
            <div style={{ marginTop: '16px' }}>
              <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '10px', fontWeight: 700 }}>
                Entidades Financieras Acreedoras Registradas en el BCRA:
              </h4>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.86rem' }}>
                  <thead>
                    <tr style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--text-muted)', textAlign: 'left' }}>
                      <th style={{ padding: '10px 12px' }}>Entidad Financiera</th>
                      <th style={{ padding: '10px 12px' }}>Situación BCRA</th>
                      <th style={{ padding: '10px 12px' }}>Monto Deuda ($ ARS)</th>
                      <th style={{ padding: '10px 12px' }}>Días de Atraso</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bcra.entidadesCreditoras.map((ent, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <td style={{ padding: '10px 12px', fontWeight: 600 }}>{ent.entidad}</td>
                        <td style={{ padding: '10px 12px' }}>
                          <span style={{ color: ent.situacionInfo?.color || 'var(--accent-emerald)', fontWeight: 700 }}>
                            {ent.situacionInfo?.label || `Situación ${ent.situacion}`}
                          </span>
                        </td>
                        <td style={{ padding: '10px 12px', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{ent.montoARS}</td>
                        <td style={{ padding: '10px 12px', color: ent.diasAtraso > 0 ? 'var(--accent-rose)' : 'var(--accent-emerald)' }}>
                          {ent.diasAtraso > 0 ? `${ent.diasAtraso} días` : 'Al día'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div style={{ background: 'rgba(16, 185, 129, 0.08)', padding: '12px 16px', borderRadius: '10px', border: '1px solid rgba(16, 185, 129, 0.2)', fontSize: '0.86rem', color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={16} /> Sin deudas bancarias registradas ni observaciones en la Central de Deudores del BCRA.
            </div>
          )}

          {/* 24-Month Historical Credit Trend */}
          {bcra.trendAnalysis && bcra.history24Months?.length > 0 && (
            <div style={{ marginTop: '20px', background: 'rgba(0,0,0,0.3)', padding: '18px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '12px' }}>
                <h4 style={{ fontSize: '0.98rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  📈 Evolución Crediticia Histórica (Últimos {bcra.trendAnalysis.totalMonthsAudited} Meses BCRA)
                </h4>
                <span style={{
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  padding: '4px 12px',
                  borderRadius: '12px',
                  background: `${bcra.trendAnalysis.color}22`,
                  color: bcra.trendAnalysis.color,
                  border: `1px solid ${bcra.trendAnalysis.color}55`
                }}>
                  {bcra.trendAnalysis.label}
                </span>
              </div>

              <p style={{ fontSize: '0.86rem', color: '#cbd5e1', marginBottom: '14px', lineHeight: 1.4 }}>
                {bcra.trendAnalysis.summary}
              </p>

              {/* 24-Month Mini Timeline Table */}
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'center' }}>
                  <thead>
                    <tr style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)' }}>
                      <th style={{ padding: '6px 8px', textAlign: 'left' }}>Período</th>
                      <th style={{ padding: '6px 8px' }}>Situación Máxima</th>
                      <th style={{ padding: '6px 8px' }}>Bancos Informantes</th>
                      <th style={{ padding: '6px 8px', textAlign: 'right' }}>Total Deuda ($ ARS)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bcra.history24Months.slice(0, 12).map((h, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                        <td style={{ padding: '6px 8px', textAlign: 'left', fontWeight: 700, color: 'var(--text-primary)' }}>{h.periodo}</td>
                        <td style={{ padding: '6px 8px' }}>
                          <span style={{
                            fontSize: '0.74rem',
                            fontWeight: 800,
                            padding: '2px 8px',
                            borderRadius: '6px',
                            background: `${h.situacionInfo?.color || 'var(--accent-emerald)'}20`,
                            color: h.situacionInfo?.color || 'var(--accent-emerald)'
                          }}>
                            {h.situacionInfo?.label || `Situación ${h.situacionMax}`}
                          </span>
                        </td>
                        <td style={{ padding: '6px 8px', color: 'var(--text-muted)' }}>{h.entidadesCount} banco(s)</td>
                        <td style={{ padding: '6px 8px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{h.totalDeudaARS}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tax & Public Contracting Capabilities */}
      <div className="saas-card col-6" style={{ padding: '26px' }}>
        <h3 style={{ fontSize: '1.15rem', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px', color: '#60a5fa' }}>
          <FileCheck size={20} /> Situación Tributaria y Certificados
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.92rem' }}>
          <div>
            <span style={{ color: 'var(--text-muted)', fontWeight: 700 }}>Certificados Públicos:</span>
            <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>{tax.publicCertificates || 'Certificado MiPyME Vigente'}</div>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)', fontWeight: 700 }}>Contratación con el Estado:</span>
            <div style={{ fontWeight: 600, color: 'var(--accent-emerald)', marginTop: '2px' }}>{tax.stateContractorStatus || 'Habilitado'}</div>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)', fontWeight: 700 }}>Cumplimiento Fiscal:</span>
            <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>{tax.taxCompliance || 'Sin deudas ejecutivas'}</div>
          </div>
        </div>
      </div>

      {/* Balances & Financial Statements */}
      <div className="saas-card col-6" style={{ padding: '26px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
          <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-emerald)', margin: 0 }}>
            <FileText size={20} /> Balances y Estados Financieros
          </h3>
          <RealVsEstimatedBadge isRealData={Boolean(fin.isRealData)} sourceLabel={fin.apiSource || 'Declaraciones Contables / IGJ'} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.92rem' }}>
          <div>
            <span style={{ color: 'var(--text-muted)', fontWeight: 700 }}>Último Balance Presentado:</span>
            <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>
              {fin.lastBalanceYear || 'Dato no público / Presentación reservada en IGJ'}
            </div>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)', fontWeight: 700 }}>Memoria Anual & Registros:</span>
            <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>
              {fin.annualReportStatus || 'Sujeto a presentación periódica en Registro Público de Comercio'}
            </div>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)', fontWeight: 700 }}>Bancos y Acreedores Principales:</span>
            <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>
              {bcra?.entidadesCreditoras?.length > 0
                ? bcra.entidadesCreditoras.map(e => e.entidad).join(', ')
                : 'Sin deudas con entidades bancarias registradas en el BCRA'}
            </div>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)', fontWeight: 700 }}>Quiebras, Concursos & Embargos:</span>
            <div style={{ fontWeight: 600, color: (fin.insolvencyStatus || '').includes('alerta') || (fin.insolvencyStatus || '').includes('quiebra') ? 'var(--accent-rose)' : 'var(--accent-emerald)', marginTop: '2px' }}>
              {fin.insolvencyStatus || 'Sin registros de quiebras ni edictos concursales en Boletín Oficial'}
            </div>
          </div>
        </div>
      </div>

      {/* BCRA Quick Cards: Credit Situation & Rejected Cheques */}
      <div className="saas-card col-4" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ background: 'rgba(37, 99, 235, 0.15)', padding: '14px', borderRadius: '12px', color: '#60a5fa' }}>
            <Landmark size={26} />
          </div>
          <div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Situación BCRA</span>
            <div style={{ fontSize: '1.05rem', fontWeight: 800, marginTop: '3px' }}>{data.bcraSituation || 'Situación 1'}</div>
          </div>
        </div>
      </div>

      <div className="saas-card col-4" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ background: (data.rejectedChequesCount || 0) > 0 ? 'rgba(244, 63, 94, 0.15)' : 'rgba(16, 185, 129, 0.15)', padding: '14px', borderRadius: '12px', color: (data.rejectedChequesCount || 0) > 0 ? 'var(--accent-rose)' : 'var(--accent-emerald)' }}>
            <FileText size={26} />
          </div>
          <div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Cheques Rechazados</span>
            <div style={{ fontSize: '1.05rem', fontWeight: 800, marginTop: '3px', color: (data.rejectedChequesCount || 0) > 0 ? 'var(--accent-rose)' : 'var(--accent-emerald)' }}>
              {data.rejectedChequesCount || 0} Cheques Registrados
            </div>
          </div>
        </div>
      </div>

      <div className="saas-card col-4" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ background: 'rgba(245, 158, 11, 0.15)', padding: '14px', borderRadius: '12px', color: 'var(--accent-amber)' }}>
            <DollarSign size={26} />
          </div>
          <div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Score Crediticio</span>
            <div style={{ fontSize: '1.05rem', fontWeight: 800, marginTop: '3px' }}>{data.creditScore || 75} / 100</div>
          </div>
        </div>
      </div>

      {/* Bidding Capacity & Credit Limit Estimator Card */}
      {data.biddingCapacity && (
        <div className="saas-card col-12" style={{ padding: '28px', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(6, 182, 212, 0.06))', border: '1px solid rgba(16, 185, 129, 0.35)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px', marginBottom: '20px' }}>
            <div>
              <span style={{ fontSize: '0.78rem', color: 'var(--accent-emerald)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Algoritmo de Capacidad Licitatoria OSINT
              </span>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 800, marginTop: '2px', color: 'var(--text-primary)' }}>
                Capacidad Máxima de Contratación Pública & Crédito
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginTop: '4px' }}>
                {data.biddingCapacity.capacityTier}
              </p>
            </div>
            <span style={{ background: 'rgba(245, 158, 11, 0.15)', color: 'var(--accent-amber)', border: '1px dashed rgba(245, 158, 11, 0.4)', padding: '6px 14px', borderRadius: '20px', fontSize: '0.82rem', fontWeight: 800 }}>
              ⚠️ MODELO HEURÍSTICO ESTIMADO
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginBottom: '20px' }}>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '18px', borderRadius: '14px', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Capacidad Licitatoria Estimada</div>
              <div style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--accent-emerald)', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
                {data.biddingCapacity.estimatedBiddingCapacityARS}
              </div>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Monto máximo sugerido para contratos estatales</div>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '18px', borderRadius: '14px', border: '1px solid rgba(6, 182, 212, 0.25)' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Límite de Crédito Recomendado</div>
              <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#38bdf8', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
                {data.biddingCapacity.recommendedCreditLimitARS}
              </div>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Límite máximo recomendado para líneas B2B</div>
            </div>
          </div>

          {data.biddingCapacity.scoringBreakdown && (
            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '16px 20px', borderRadius: '12px', display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '14px', fontSize: '0.84rem' }}>
              <div><span style={{ color: 'var(--text-muted)' }}>Solvencia Fiscal:</span> <strong style={{ color: 'var(--accent-emerald)' }}>{data.biddingCapacity.scoringBreakdown.fiscalSolvency}%</strong></div>
              <div><span style={{ color: 'var(--text-muted)' }}>Scoring BCRA:</span> <strong style={{ color: '#60a5fa' }}>{data.biddingCapacity.scoringBreakdown.bcraScore}/100</strong></div>
              <div><span style={{ color: 'var(--text-muted)' }}>Ejecución Licitatoria:</span> <strong style={{ color: '#c4b5fd' }}>{data.biddingCapacity.scoringBreakdown.contractExecutionScore}%</strong></div>
              <div><span style={{ color: 'var(--text-muted)' }}>Capacidad Técnica:</span> <strong style={{ color: 'var(--accent-emerald)' }}>{data.biddingCapacity.scoringBreakdown.technicalCapacityScore}%</strong></div>
            </div>
          )}
        </div>
      )}

      {/* Debt History Table */}
      <div className="saas-card col-12" style={{ padding: '26px' }}>
        <h3 style={{ fontSize: '1.15rem', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <TrendingDown size={19} style={{ color: 'var(--accent-rose)' }} /> Historial de Obligaciones y Deudas Registradas
        </h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.92rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', textAlign: 'left' }}>
              <th style={{ padding: '14px' }}>Periodo Evaluado</th>
              <th style={{ padding: '14px' }}>Estado Registrado</th>
              <th style={{ padding: '14px' }}>Monto Estimado</th>
            </tr>
          </thead>
          <tbody>
            {debtHistory.map((item, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                <td style={{ padding: '14px', fontWeight: 600 }}>{item.period}</td>
                <td style={{ padding: '14px', color: (item.status || '').includes('rechazados') || (item.status || '').includes('atrasos') ? 'var(--accent-rose)' : 'var(--text-primary)' }}>{item.status}</td>
                <td style={{ padding: '14px', fontFamily: 'var(--font-mono)' }}>{item.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
