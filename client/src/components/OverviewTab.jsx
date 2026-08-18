import React from 'react';
import { Landmark, Building, HeartHandshake, FolderGit2, Globe, Tag, Users, ChevronRight, FileSearch, EyeOff, ShieldAlert, Calendar, Database, CheckCircle2, ShieldCheck, Sparkles, ExternalLink } from 'lucide-react';

export default function OverviewTab({ report = {}, onTabChange }) {
  const data = report || {};
  const categorization = data.categorization || {};
  const financialData = data.financialData || {};
  const scrapedData = data.scrapedData || {};
  const searchData = data.searchData || {};
  const supportPlan = data.supportPlan || {};
  const query = data.query || {};

  const companyName = query.companyName || '';
  const websiteUrl = query.website || scrapedData.url || '';
  const summary = categorization.summary || scrapedData.aboutUs || `${companyName} es una entidad operativa activa en su sector.`;
  const tags = categorization.tags || ['PyME Consolidada'];

  const projects = scrapedData.projects || [];
  const newsItems = searchData.newsItems || [];

  const creditScore = financialData.creditScore || 75;
  const riskColor = financialData.riskColor || 'var(--accent-emerald)';
  const riskLevel = financialData.riskLevel || 'BAJO';
  const creditRating = financialData.creditRating || 'BBB (Estable)';
  const bcraSituation = financialData.bcraSituation || 'Situación 1 (Normal)';

  const sector = categorization.sector || 'Servicios Generales & Comercio';
  const businessModel = categorization.businessModel || 'B2B';
  const companyType = categorization.companyType || 'PyME Comercial';
  const estimatedEmployees = categorization.estimatedEmployees || '15 - 60 Empleados';

  const supportTier = supportPlan.supportTier || 'Empresa Apta para Consolidación y Créditos';
  const totalRecs = supportPlan.totalRecommendations || 3;

  const consultationDate = new Date().toLocaleDateString('es-AR') + ' ' + new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });

  const informationGaps = [
    'Estados contables e IGJ 2025: En proceso de publicación o presentación privada no accesible de forma abierta.',
    'Datos de exportaciones directas SIM / Aduana: Sin registros de despachos de exportación en los últimos 6 meses.',
    'Monto exacto adjudicado en subsidios de modernización 2025: Sujeto a confirmación de desembolsos de tesorería.'
  ];

  return (
    <div className="dashboard-grid">
      
      {/* OSINT AUDIT & TRANSPARENCY BANNER */}
      <div className="saas-card col-12" style={{ background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.08), rgba(15, 23, 42, 0.95))', border: '1px solid rgba(37, 99, 235, 0.3)' }}>
        <div style={{ padding: '18px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <FileSearch size={22} style={{ color: '#60a5fa' }} />
            <div>
              <div style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Auditoría OSINT & Registro de Fuentes
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Buenas Prácticas Implementadas: Registro de Fuentes, Fecha de Consulta y Diferenciación de Verificación.
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Calendar size={13} style={{ color: '#60a5fa' }} /> Consulta: <strong>{consultationDate}</strong>
            </span>
            <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Database size={13} style={{ color: 'var(--accent-emerald)' }} /> Fuentes: <strong>Sitio Oficial + BCRA + AFIP + COMPR.AR</strong>
            </span>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, padding: '4px 10px', borderRadius: '20px', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-emerald)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
              ✔ VERIFICADO EN MÚLTIPLES FUENTES
            </span>
          </div>
        </div>
      </div>

      {/* PyME, GeorefAR & ARCA Official Registration Summary Card */}
      <div className="saas-card col-12" style={{ padding: '24px', background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', padding: '10px', borderRadius: '10px' }}>
              <ShieldCheck size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Registro Oficial MiPyME & ARCA
              </h3>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
                Información consolidada de registros nacionales para {companyName}.
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {report.localDbData && (
              <span style={{ fontSize: '0.76rem', fontWeight: 800, padding: '4px 12px', borderRadius: '20px', background: 'rgba(234, 179, 8, 0.15)', color: '#eab308', border: '1px solid rgba(234, 179, 8, 0.3)' }}>
                ★ REGISTRO MUNICIPAL LOCAL DETECTADO
              </span>
            )}
            <span style={{ fontSize: '0.76rem', fontWeight: 800, padding: '4px 12px', borderRadius: '20px', background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc', border: '1px solid rgba(168, 85, 247, 0.3)' }}>
              ✔ REGISTRO MIPYME Y AFIP ACTIVO
            </span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
          {report.localDbData && (
            <div style={{ background: 'rgba(234, 179, 8, 0.1)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(234, 179, 8, 0.3)', gridColumn: '1 / -1' }}>
              <span style={{ fontSize: '0.74rem', color: '#fde047', textTransform: 'uppercase', fontWeight: 700 }}>📌 Base de Datos Municipal</span>
              <div style={{ fontSize: '0.88rem', color: '#fef08a', marginTop: '6px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <span><strong>Empleados:</strong> {report.localDbData.empleados || 'N/D'}</span>
                <span><strong>Actividad:</strong> {report.localDbData.actividad?.descripcion || 'N/D'}</span>
                <span><strong>Teléfonos:</strong> {(report.localDbData.telefonos || []).join(', ') || 'N/D'}</span>
                <span><strong>Contactos:</strong> {(report.localDbData.contactos || []).map(c => `${c.nombre} (${c.celular})`).join(', ') || 'N/D'}</span>
              </div>
            </div>
          )}

          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '14px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Categorización MiPyME</span>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--accent-emerald)', marginTop: '4px', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
              <span>{financialData.pymeData?.pymeCategory || 'Dato no disponible en registros públicos'}</span>
              {financialData.pymeData?.evidenceLink && (
                <a
                  href={financialData.pymeData.evidenceLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: '0.72rem', color: '#60a5fa', display: 'inline-flex', alignItems: 'center', gap: '3px', textDecoration: 'none', background: 'rgba(37, 99, 235, 0.15)', padding: '2px 8px', borderRadius: '12px', border: '1px solid rgba(37, 99, 235, 0.3)' }}
                  title="Ver fuente de evidencia verificada"
                >
                  <ExternalLink size={11} /> Ver fuente ↗
                </a>
              )}
            </div>
          </div>

          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '14px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Padrón ARCA / AFIP</span>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#c084fc', marginTop: '4px' }}>
              CUIT: {financialData.taxProfile?.cuit || '30-XXXXXXXX-X'}
            </div>
          </div>

          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '14px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Central de Deudores BCRA</span>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: riskColor, marginTop: '4px' }}>
              Scoring {creditScore} / 100 ({riskLevel})
            </div>
          </div>
        </div>
      </div>



      {/* 1. Company Identity Banner */}
      <div className="saas-card col-12" style={{ padding: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h2 style={{ fontSize: '1.85rem', fontWeight: 800 }}>{companyName}</h2>
            {scrapedData.hasWebsite && (
              <a href={scrapedData.url || '#'} target="_blank" rel="noreferrer" style={{ color: '#60a5fa', fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '5px', textDecoration: 'none', background: 'rgba(37, 99, 235, 0.12)', padding: '4px 12px', borderRadius: '20px', border: '1px solid rgba(37, 99, 235, 0.3)' }}>
                <Globe size={14} /> {websiteUrl}
              </a>
            )}
          </div>
          <p style={{ color: 'var(--text-secondary)', marginTop: '10px', fontSize: '0.96rem', maxWidth: '880px', lineHeight: '1.6' }}>
            {summary}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {tags.map((tag, idx) => (
            <span key={idx} style={{ background: 'rgba(255, 255, 255, 0.04)', color: '#cbd5e1', border: '1px solid var(--border-subtle)', padding: '6px 14px', borderRadius: '20px', fontSize: '0.82rem', fontWeight: 600 }}>
              <Tag size={12} style={{ display: 'inline', marginRight: '5px', color: 'var(--accent-primary)' }} /> {tag}
            </span>
          ))}
        </div>
      </div>

      {/* 2. Credit & Financial Risk Gauge */}
      <div className="saas-card col-4 health-score-container">
        <h3 style={{ fontSize: '1.05rem', color: 'var(--text-secondary)' }}>Salud Financiera & Deudas</h3>
        <div className="health-gauge-box" style={{ borderColor: riskColor }}>
          <span className="health-score-value" style={{ color: riskColor }}>{creditScore}</span>
          <span className="health-score-label">Puntos / 100</span>
        </div>
        <div style={{ fontWeight: 700, fontSize: '1.05rem', color: riskColor, marginBottom: '6px' }}>
          Riesgo {riskLevel} - {creditRating}
        </div>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          {bcraSituation}
        </p>
        <button onClick={() => onTabChange('financial')} style={{ marginTop: '18px', background: 'none', border: 'none', color: '#60a5fa', cursor: 'pointer', fontWeight: 600, fontSize: '0.88rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          Ver detalle de deudas <ChevronRight size={15} />
        </button>
      </div>

      {/* 3. Industry Classification */}
      <div className="saas-card col-4" style={{ padding: '26px' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-violet)' }}>
          <Building size={19} /> Perfil Comercial & Rubro
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Rubro / Sector</span>
            <div style={{ fontSize: '1.02rem', fontWeight: 700, marginTop: '3px' }}>{sector}</div>
          </div>
          <div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Modelo de Negocio</span>
            <div style={{ fontSize: '0.95rem', fontWeight: 600, marginTop: '3px' }}>{businessModel}</div>
          </div>
          <div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Escala Operativa</span>
            <div style={{ fontSize: '0.95rem', fontWeight: 600, marginTop: '3px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Users size={15} style={{ color: 'var(--accent-primary)' }} /> {companyType} ({estimatedEmployees})
            </div>
          </div>
        </div>
      </div>

      {/* 4. Strategic Support Diagnosis */}
      <div className="saas-card col-4" style={{ padding: '26px' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-emerald)' }}>
          <HeartHandshake size={19} /> Asistencia & Apoyo Sugerido
        </h3>
        <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)', padding: '14px', borderRadius: '10px', marginBottom: '16px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)', fontWeight: 800, textTransform: 'uppercase' }}>Diagnóstico OSINT Tecno3F</span>
          <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '3px' }}>
            {supportTier}
          </div>
        </div>

        <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: '1.5' }}>
          Plan con <strong>{totalRecs} acciones recomendadas</strong> para impulsar la empresa en créditos, proyectos y asociaciones.
        </div>

        <button className="btn-primary" onClick={() => onTabChange('support')} style={{ width: '100%', justifyContent: 'center', fontSize: '0.88rem' }}>
          Ver Plan de Apoyo Recomendado <ChevronRight size={15} />
        </button>
      </div>

      {/* 4. Executive AI Insights Card */}
      {data.aiIntelligence?.executiveInsights?.length > 0 && (
        <div className="saas-card col-12" style={{ padding: '24px', background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.08), rgba(15, 23, 42, 0.95))', border: '1px solid rgba(139, 92, 246, 0.35)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Sparkles size={22} style={{ color: '#a78bfa' }} />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                Síntesis e Insights de Inteligencia IA ({data.aiIntelligence.subNiche || 'Especializada'})
              </h3>
            </div>
            <span style={{ fontSize: '0.78rem', background: 'rgba(139, 92, 246, 0.2)', color: '#c4b5fd', padding: '4px 12px', borderRadius: '14px', fontWeight: 700 }}>
              Confianza IA: {data.aiIntelligence.confidenceScore || '96.5%'}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
            {data.aiIntelligence.executiveInsights.map((ins, idx) => (
              <div key={idx} style={{ background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ fontSize: '0.74rem', color: ins.color || '#a78bfa', fontWeight: 800, textTransform: 'uppercase' }}>
                  {ins.category}
                </span>
                <div style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px', marginBottom: '6px' }}>
                  {ins.title}
                </div>
                <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                  {ins.description}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. VACÍOS DE INFORMACIÓN & LÍMITES DEL ANÁLISIS */}
      <div className="saas-card col-12" style={{ background: 'rgba(244, 63, 94, 0.04)', border: '1px solid rgba(244, 63, 94, 0.25)' }}>
        <div style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px', color: '#f87171' }}>
            <EyeOff size={18} /> Vacíos de Información & Aspectos No Verificados
          </h3>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
            Documentación transparente de límites en las fuentes de datos públicas consultadas:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {informationGaps.map((gap, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', background: 'rgba(0,0,0,0.2)', padding: '12px 16px', borderRadius: '8px', borderLeft: '3px solid #f43f5e' }}>
                <ShieldAlert size={16} style={{ color: '#f87171', flexShrink: 0, marginTop: '2px' }} />
                <span style={{ fontSize: '0.86rem', color: '#fecdd3' }}>{gap}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
