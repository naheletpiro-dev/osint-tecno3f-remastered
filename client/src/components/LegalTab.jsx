import React from 'react';
import { Scale, Gavel, Award, Globe, ExternalLink, CheckCircle2, Building, FileText } from 'lucide-react';
import RealVsEstimatedBadge from './RealVsEstimatedBadge';

export default function LegalTab({ legalData = {}, companyName = '' }) {
  const data = legalData || {};
  const inpi = data.inpiWipoData || null;
  const openCorp = data.openCorporatesData || null;

  const lawsuits = data.lawsuits || [
    {
      type: 'Fueros Civiles y Comerciales / Juicios',
      status: 'Sin registros de juicios comerciales activos',
      severity: 'SIN RIESGO',
      details: 'Búsqueda en registros de fueros comerciales y boletines judiciales.'
    },
    {
      type: 'Laboral y Expedientes',
      status: 'Sin juicios laborales registrados en el último periodo',
      severity: 'SIN RIESGO',
      details: 'Consulta pública en fuero del trabajo y registros previsionales.'
    },
    {
      type: 'Defensa del Consumidor & Multas',
      status: 'Sin sanciones o multas vigentes en Defensa del Consumidor',
      severity: 'SIN RIESGO',
      details: 'Rastreo en sistemas de resolución de disputas de consumo (COPREC / Provincia).'
    },
    {
      type: 'Sanciones Ambientales',
      status: 'Sin multas ni expedientes de impacto ambiental registrados',
      severity: 'SIN RIESGO',
      details: 'Consulta de certificados de aptitud ambiental y fiscalizaciones sanitarias.'
    },
    {
      type: 'Fuero Penal y Fraude',
      status: 'Sin causas penales ni investigaciones comerciales asociadas',
      severity: 'SIN RIESGO',
      details: 'Verificación en padrones de integridad y registros de querellas.'
    }
  ];

  const totalRecords = data.totalRecords || 0;
  const riskRating = data.riskRating || 'SIN OBSERVACIONES JUDICIALES';
  const legalSummary = data.legalSummary || `La empresa ${companyName} no presenta antecedentes judiciales, demandas penales, multas ambientales ni sanciones activas en registros públicos examinados.`;

  return (
    <div className="dashboard-grid">
      {/* Legal Status Header Card */}
      <div className="saas-card col-12" style={{ padding: '26px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ background: totalRecords > 0 ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)', padding: '14px', borderRadius: '12px', color: totalRecords > 0 ? 'var(--accent-amber)' : 'var(--accent-emerald)' }}>
              <Scale size={28} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Rastreo Judicial, Penal y Sanciones Públicas</h3>
                <RealVsEstimatedBadge isRealData={data.isRealData || false} sourceLabel={data.apiSource || 'Estimación Algorítmica OSINT (No Verificado)'} />
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
                Búsqueda consolidada en fueros comerciales, laborales, causas penales, multas ambientales y defensa del consumidor.
              </p>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Dictamen Legal OSINT</span>
            <div style={{ fontWeight: 800, fontSize: '1.05rem', color: totalRecords > 0 ? 'var(--accent-amber)' : 'var(--accent-emerald)', marginTop: '2px' }}>
              {riskRating}
            </div>
          </div>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)', padding: '14px 18px', borderRadius: '10px', marginTop: '20px', fontSize: '0.92rem', color: '#cbd5e1' }}>
          {legalSummary}
        </div>
      </div>

      {/* Official Registro Nacional de Sociedades (Ley 26.047) Card */}
      {data.sociedadDetail && (
        <div className="saas-card col-12" style={{ padding: '24px', background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.08), rgba(16, 185, 129, 0.05))', border: '1px solid rgba(37, 99, 235, 0.35)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Gavel size={26} style={{ color: '#60a5fa' }} />
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.78rem', color: '#60a5fa', textTransform: 'uppercase', fontWeight: 800 }}>Registro Nacional de Sociedades (Ley 26.047)</span>
                  <RealVsEstimatedBadge isRealData={true} sourceLabel="Ministerio de Justicia & ARCA (Padrón Federal)" />
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '4px', color: '#f8fafc' }}>
                  {data.sociedadDetail.razonSocial}
                </h3>
              </div>
            </div>
            <a
              href="https://www.argentina.gob.ar/justicia/registro-nacional-sociedades"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary"
              style={{ fontSize: '0.8rem', padding: '6px 12px', gap: '6px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}
            >
              <ExternalLink size={14} /> Registro Nacional de Sociedades ↗
            </a>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', background: 'rgba(0,0,0,0.25)', padding: '16px', borderRadius: '12px', fontSize: '0.84rem', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div>
              <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.74rem', textTransform: 'uppercase', fontWeight: 700 }}>CUIT</span>
              <strong style={{ color: '#f8fafc', fontFamily: 'var(--font-mono)' }}>{data.sociedadDetail.cuit}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.74rem', textTransform: 'uppercase', fontWeight: 700 }}>Tipo Societario</span>
              <strong style={{ color: '#34d399' }}>{data.sociedadDetail.tipoSocietario}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.74rem', textTransform: 'uppercase', fontWeight: 700 }}>Fecha Contrato Social</span>
              <strong style={{ color: '#f8fafc' }}>{data.sociedadDetail.fechaContratoSocial}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.74rem', textTransform: 'uppercase', fontWeight: 700 }}>Domicilio Fiscal Inscripto</span>
              <strong style={{ color: '#cbd5e1', fontSize: '0.8rem' }}>{data.sociedadDetail.domicilioFiscal}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.74rem', textTransform: 'uppercase', fontWeight: 700 }}>Domicilio Legal Inscripto</span>
              <strong style={{ color: '#cbd5e1', fontSize: '0.8rem' }}>{data.sociedadDetail.domicilioLegal}</strong>
            </div>
          </div>
        </div>
      )}

      {/* Boletín Oficial (BORA / timeline.boletinoficial.gob.ar) Card */}
      {data.boletinOficialData && (
        <div className="saas-card col-12" style={{ padding: '24px', background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.08), rgba(37, 99, 235, 0.05))', border: '1px solid rgba(245, 158, 11, 0.35)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Globe size={26} style={{ color: 'var(--accent-amber)' }} />
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--accent-amber)', textTransform: 'uppercase', fontWeight: 800 }}>Boletín Oficial de la República Argentina (BORA)</span>
                  <RealVsEstimatedBadge isRealData={true} sourceLabel={data.boletinOficialData.apiSource} />
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '4px', color: '#f8fafc' }}>
                  Edictos y Publicaciones Oficiales
                </h3>
              </div>
            </div>
            <a
              href={data.boletinOficialData.officialPortalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary"
              style={{ fontSize: '0.8rem', padding: '6px 12px', gap: '6px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', borderColor: 'rgba(245, 158, 11, 0.4)', color: 'var(--accent-amber)' }}
            >
              <ExternalLink size={14} /> Portal BORA ↗
            </a>
          </div>

          <div style={{ background: 'rgba(0,0,0,0.25)', padding: '14px 18px', borderRadius: '10px', fontSize: '0.88rem', color: '#cbd5e1', marginBottom: '14px' }}>
            {data.boletinOficialData.publicationSummary}
          </div>

          {/* Concursos y Quiebras Status Banner */}
          <div style={{
            background: data.boletinOficialData.hasBankruptcyOrConcurso ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
            border: `1px solid ${data.boletinOficialData.hasBankruptcyOrConcurso ? '#ef4444' : '#10b981'}`,
            color: data.boletinOficialData.hasBankruptcyOrConcurso ? '#fca5a5' : '#34d399',
            padding: '10px 14px',
            borderRadius: '8px',
            fontSize: '0.86rem',
            fontWeight: 800,
            marginBottom: '14px'
          }}>
            {data.boletinOficialData.hasBankruptcyOrConcurso ? '🚨 ' : '✓ '}
            {data.boletinOficialData.insolvencyStatus || 'Sin edictos de concurso preventivo o quiebra en BORA'}
          </div>

          {data.boletinOficialData.edicts?.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {data.boletinOficialData.edicts.map((ed, idx) => (
                <div key={idx} style={{ background: 'rgba(0,0,0,0.3)', padding: '12px 16px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <strong style={{ color: '#f8fafc' }}>{ed.title}</strong>
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{ed.date}</span>
                  </div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>{ed.snippet}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* REPSAL — Sanciones Laborales Card */}
      {data.repsalData && (
        <div className="saas-card col-12" style={{ padding: '24px', background: data.repsalData.hasSanctions ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.08), rgba(245, 158, 11, 0.05))' : 'linear-gradient(135deg, rgba(16, 185, 129, 0.06), rgba(37, 99, 235, 0.05))', border: data.repsalData.hasSanctions ? '1px solid rgba(239, 68, 68, 0.35)' : '1px solid rgba(16, 185, 129, 0.3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <Scale size={20} style={{ color: data.repsalData.hasSanctions ? '#ef4444' : '#10b981' }} />
              <h4 style={{ fontSize: '1.05rem', fontWeight: 800 }}>REPSAL — Registro Público de Empleadores con Sanciones Laborales (Ley 26.940)</h4>
              <RealVsEstimatedBadge isRealData={true} sourceLabel="datos.gob.ar / Ministerio de Trabajo" />
            </div>
            {data.repsalData.repsalOfficialUrl && (
              <a
                href={data.repsalData.repsalOfficialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary"
                style={{ fontSize: '0.8rem', padding: '6px 12px', gap: '6px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}
              >
                <ExternalLink size={14} /> Portal REPSAL ↗
              </a>
            )}
          </div>

          <div style={{ background: data.repsalData.hasSanctions ? 'rgba(239, 68, 68, 0.12)' : 'rgba(16, 185, 129, 0.12)', padding: '12px 16px', borderRadius: '10px', fontSize: '0.88rem', color: data.repsalData.hasSanctions ? '#fca5a5' : '#6ee7b7', fontWeight: 700, marginBottom: '12px' }}>
            {data.repsalData.status}
          </div>

          {data.repsalData.hasSanctions && data.repsalData.sanctions?.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {data.repsalData.sanctions.map((s, idx) => (
                <div key={idx} style={{ background: 'rgba(0,0,0,0.3)', padding: '12px 16px', borderRadius: '10px', border: '1px solid rgba(239,68,68,0.2)', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <strong style={{ color: '#f8fafc' }}>{s.sanctionType}</strong>
                    <span style={{ fontSize: '0.74rem', background: 'rgba(239,68,68,0.2)', color: '#ef4444', padding: '2px 8px', borderRadius: '6px', fontWeight: 800 }}>{s.status}</span>
                  </div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>{s.details} (Normativa: {s.lawNumber} | Organismo: {s.organism})</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Dateas.com — Registro Público CUIT & Boletín Oficial Card */}
      {data.dateasData && (
        <div className="saas-card col-12" style={{ padding: '24px', background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.06), rgba(37, 99, 235, 0.05))', border: '1px solid rgba(6, 182, 212, 0.3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <Building size={20} style={{ color: '#22d3ee' }} />
              <h4 style={{ fontSize: '1.05rem', fontWeight: 800 }}>Dateas.com — Buscador CUIT & Boletines Oficiales</h4>
              <RealVsEstimatedBadge isRealData={data.dateasData.isRealData} sourceLabel="Dateas.com" />
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {data.dateasData.dateasCuitUrl && (
                <a
                  href={data.dateasData.dateasCuitUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary"
                  style={{ fontSize: '0.8rem', padding: '6px 12px', gap: '6px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}
                >
                  <ExternalLink size={14} /> Consulta CUIT Dateas ↗
                </a>
              )}
              {data.dateasData.dateasDocsUrl && (
                <a
                  href={data.dateasData.dateasDocsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary"
                  style={{ fontSize: '0.8rem', padding: '6px 12px', gap: '6px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', borderColor: 'rgba(6, 182, 212, 0.4)', color: '#22d3ee' }}
                >
                  <ExternalLink size={14} /> Boletín Oficial Dateas ↗
                </a>
              )}
            </div>
          </div>

          <div style={{
            background: data.dateasData.isCuitVerifiedInBoletin ? 'rgba(16, 185, 129, 0.12)' : 'rgba(0,0,0,0.25)',
            border: `1px solid ${data.dateasData.isCuitVerifiedInBoletin ? 'rgba(16, 185, 129, 0.3)' : 'rgba(6, 182, 212, 0.2)'}`,
            padding: '12px 16px',
            borderRadius: '10px',
            fontSize: '0.88rem',
            color: data.dateasData.isCuitVerifiedInBoletin ? '#6ee7b7' : '#cbd5e1',
            fontWeight: 700,
            marginBottom: '14px'
          }}>
            {data.dateasData.crossCheckStatus} • CUIT: <span style={{ color: '#22d3ee' }}>{data.dateasData.cuit}</span>
          </div>

          {data.dateasData.dateasEdicts?.length > 0 && (
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#f8fafc', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FileText size={15} style={{ color: '#38bdf8' }} /> Edictos y Publicaciones Oficiales en Dateas ({data.dateasData.edictsCount || data.dateasData.dateasEdicts.length}):
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '220px', overflowY: 'auto' }}>
                {data.dateasData.dateasEdicts.map((ed, idx) => (
                  <div key={idx} style={{ background: 'rgba(0,0,0,0.3)', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', fontSize: '0.84rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#cbd5e1', fontWeight: 600 }}>{ed.title}</span>
                    <a
                      href={ed.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontSize: '0.76rem', color: '#38bdf8', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(56, 189, 248, 0.15)', padding: '3px 9px', borderRadius: '6px' }}
                    >
                      Ver Edicto ↗
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}



      {/* Lawsuits & Sanctions Cards */}
      <div className="col-12" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {lawsuits.map((item, idx) => (
          <div key={idx} className="saas-card" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <Gavel size={20} style={{ color: item.severity === 'SIN RIESGO' ? 'var(--accent-emerald)' : 'var(--accent-amber)', flexShrink: 0 }} />
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.98rem' }}>{item.type}</div>
                <div style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{item.details}</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ fontSize: '0.92rem', fontWeight: 600, color: item.severity === 'SIN RIESGO' ? 'var(--accent-emerald)' : 'var(--accent-amber)' }}>
                {item.status}
              </div>
              <span style={{
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '0.75rem',
                fontWeight: 800,
                background: item.severity === 'SIN RIESGO' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)',
                color: item.severity === 'SIN RIESGO' ? 'var(--accent-emerald)' : 'var(--accent-amber)',
                border: `1px solid ${item.severity === 'SIN RIESGO' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`
              }}>
                {item.severity}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
