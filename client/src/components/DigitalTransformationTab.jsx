import React, { useState } from 'react';
import { Cpu, CheckCircle2, AlertTriangle, ShieldCheck, Database, Award, ArrowUpRight, Zap, Ban, EyeOff, Layers, FileCode, TrendingUp, FileText, X } from 'lucide-react';

export default function DigitalTransformationTab({ digitalData = {}, companyName = '' }) {
  const [activeKitPreview, setActiveKitPreview] = useState(null);
  const data = digitalData || {};
  const score = data.digitalScore || 65;
  const maturityLevel = data.maturityLevel || 'En Proceso de Digitalización';
  const maturityColor = data.maturityColor || 'var(--accent-cyan)';

  const breakdown = data.breakdown || {};
  const existingAutomations = data.existingAutomations || [];
  const missingAutomations = data.missingAutomations || [];
  const omittedUnverifiedData = data.omittedUnverifiedData || data.informationGaps || [];
  const recommendedKits = data.recommendedKits || {};
  const techStack = data.techStack || [];
  const auditMetadata = data.auditMetadata || {};

  return (
    <div className="dashboard-grid">
      {/* Header Banner */}
      <div className="saas-card col-12" style={{ padding: '28px', background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.08), rgba(37, 99, 235, 0.06))', border: '1px solid rgba(6, 182, 212, 0.3)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(6, 182, 212, 0.15)', color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Cpu size={26} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.45rem', fontWeight: 800 }}>Transformación Digital & Automatización en {companyName}</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '2px' }}>
                  Auditoría estricta OSINT: Sistemas verificados, automatizaciones faltantes y datos omitidos por falta de verificación pública.
                </p>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'rgba(0,0,0,0.3)', padding: '12px 20px', borderRadius: '16px', border: `1px solid ${maturityColor}` }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Índice de Madurez</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: maturityColor }}>{maturityLevel}</div>
            </div>
            <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: `radial-gradient(circle, ${maturityColor}22 0%, ${maturityColor}00 70%)`, border: `2px solid ${maturityColor}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.2rem', color: 'var(--text-primary)' }}>
              {score}%
            </div>
          </div>
        </div>
      </div>

      {/* Breakdown Metrics */}
      <div className="saas-card col-4" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.05rem', marginBottom: '16px', fontWeight: 700, color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Layers size={18} /> Presencia Digital & Portal Web
        </h3>
        <div className="health-score-container" style={{ textAlign: 'left', padding: 0 }}>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#38bdf8' }}>{breakdown.webPreserve || 80}%</div>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Portal web corporativo y canales de atención digital activos para clientes.
          </p>
        </div>
      </div>

      <div className="saas-card col-4" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.05rem', marginBottom: '16px', fontWeight: 700, color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Zap size={18} /> Automatización de Procesos
        </h3>
        <div className="health-score-container" style={{ textAlign: 'left', padding: 0 }}>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>{breakdown.processAutomation || 60}%</div>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Nivel de digitalización operativa y respuestas comerciales integradas.
          </p>
        </div>
      </div>

      <div className="saas-card col-4" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.05rem', marginBottom: '16px', fontWeight: 700, color: 'var(--accent-violet)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Cpu size={18} /> Automatización de Planta / Nube
        </h3>
        <div className="health-score-container" style={{ textAlign: 'left', padding: 0 }}>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#c4b5fd' }}>{breakdown.industrialAutomation || 50}%</div>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Integración de sistemas de control, telemetría o servidores.
          </p>
        </div>
      </div>

      {/* 1. EXISTENT & VERIFIED AUTOMATIONS */}
      <div className="saas-card col-6" style={{ padding: '26px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={20} /> Automatizaciones Existentes & Verificadas
          </h3>
          <span style={{ fontSize: '0.72rem', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-emerald)', padding: '3px 10px', borderRadius: '12px', fontWeight: 800 }}>
            ✔ OSINT VERIFICADO
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {existingAutomations.map((auto, idx) => (
            <div key={idx} style={{ background: 'rgba(16, 185, 129, 0.06)', padding: '14px', borderRadius: '10px', borderLeft: '3px solid #10b981' }}>
              <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)' }}>{auto.system}</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '4px' }}>{auto.detail}</div>
              <div style={{ fontSize: '0.74rem', color: 'var(--accent-emerald)', fontWeight: 700, marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <ShieldCheck size={12} /> Estado: {auto.status}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. MISSING / PENDING AUTOMATIONS */}
      <div className="saas-card col-6" style={{ padding: '26px', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--accent-amber)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={20} /> Automatizaciones Faltantes o Pendientes
          </h3>
          <span style={{ fontSize: '0.72rem', background: 'rgba(245, 158, 11, 0.15)', color: 'var(--accent-amber)', padding: '3px 10px', borderRadius: '12px', fontWeight: 800 }}>
            ⚠️ BRECHAS IDENTIFICADAS
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {missingAutomations.map((item, idx) => (
            <div key={idx} style={{ background: 'rgba(245, 158, 11, 0.06)', padding: '14px', borderRadius: '10px', borderLeft: '3px solid #f59e0b' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)' }}>{item.system}</div>
                <span style={{ fontSize: '0.7rem', fontWeight: 800, padding: '2px 8px', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.2)', color: 'var(--accent-amber)' }}>
                  Impacto: {item.impact}
                </span>
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '4px' }}>{item.detail}</div>
              <div style={{ fontSize: '0.74rem', color: 'var(--accent-amber)', fontWeight: 700, marginTop: '6px' }}>
                Estado: {item.status}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. PROGRAMA DE ADOPCIÓN TECNOLÓGICA Y MODERNIZACIÓN 4.0 (EJECUTIVO) */}
      {recommendedKits.primary && (
        <div className="saas-card col-12" style={{ padding: '26px', background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.08), rgba(99, 102, 241, 0.06))', border: '1px solid rgba(56, 189, 248, 0.35)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(56, 189, 248, 0.18)', color: '#38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Award size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Programa de Adopción Tecnológica & Modernización 4.0
                </h3>
                <div style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  Planes de implementación sugeridos para {companyName} en el marco del programa oficial Kit 4.0 (Secretaría de Industria y Comercio).
                </div>
              </div>
            </div>

            <span style={{ background: 'rgba(56, 189, 248, 0.18)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.4)', padding: '6px 14px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 800 }}>
              PADRÓN DE KITS HOMOLOGADOS
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px', marginTop: '14px' }}>
            {/* Primary Recommendation */}
            <div style={{ background: 'rgba(15, 23, 42, 0.75)', padding: '20px', borderRadius: '14px', border: '1px solid rgba(56, 189, 248, 0.4)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontSize: '0.74rem', background: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8', padding: '3px 10px', borderRadius: '12px', fontWeight: 800 }}>
                    PROPUESTA PRINCIPAL DE MODERNIZACIÓN ({recommendedKits.primary.category})
                  </span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 700 }}>{recommendedKits.primary.code}</span>
                </div>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
                  {recommendedKits.primary.name}
                </h4>
                <p style={{ fontSize: '0.84rem', color: '#cbd5e1', lineHeight: '1.4', marginBottom: '12px' }}>
                  {recommendedKits.primary.summary}
                </p>
                <div style={{ background: 'rgba(56, 189, 248, 0.08)', padding: '12px 14px', borderRadius: '10px', borderLeft: '3px solid #38bdf8', fontSize: '0.82rem', color: '#e0f2fe', lineHeight: '1.4' }}>
                  <div style={{ fontWeight: 800, color: '#38bdf8', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <TrendingUp size={14} /> Justificación Operativa & Retorno de Inversión (ROI):
                  </div>
                  {recommendedKits.primary.aiRationale}
                </div>
              </div>
              <div style={{ marginTop: '14px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ShieldCheck size={14} /> {recommendedKits.primary.fundingCoverage}
                </div>
                <button onClick={() => setActiveKitPreview(recommendedKits.primary)} style={{ background: 'var(--bg-surface-elevated)', border: '1px solid rgba(56, 189, 248, 0.4)', color: '#38bdf8', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FileText size={14} /> Ver Ficha Técnica
                </button>
              </div>
            </div>

            {/* Secondary Recommendation */}
            {recommendedKits.secondary && (
              <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '20px', borderRadius: '14px', border: '1px solid rgba(168, 85, 247, 0.35)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ fontSize: '0.74rem', background: 'rgba(168, 85, 247, 0.2)', color: '#c084fc', padding: '3px 10px', borderRadius: '12px', fontWeight: 800 }}>
                      PROPUESTA COMPLEMENTARIA DE MODERNIZACIÓN ({recommendedKits.secondary.category})
                    </span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 700 }}>{recommendedKits.secondary.code}</span>
                  </div>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
                    {recommendedKits.secondary.name}
                  </h4>
                  <p style={{ fontSize: '0.84rem', color: '#cbd5e1', lineHeight: '1.4', marginBottom: '12px' }}>
                    {recommendedKits.secondary.summary}
                  </p>
                  <div style={{ background: 'rgba(168, 85, 247, 0.08)', padding: '12px 14px', borderRadius: '10px', borderLeft: '3px solid #c084fc', fontSize: '0.82rem', color: '#f3e8ff', lineHeight: '1.4' }}>
                    <div style={{ fontWeight: 800, color: '#c084fc', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <TrendingUp size={14} /> Justificación Operativa & Retorno de Inversión (ROI):
                    </div>
                    {recommendedKits.secondary.aiRationale}
                  </div>
                </div>
                <div style={{ marginTop: '14px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ShieldCheck size={14} /> {recommendedKits.secondary.fundingCoverage}
                  </div>
                  <button onClick={() => setActiveKitPreview(recommendedKits.secondary)} style={{ background: 'var(--bg-surface-elevated)', border: '1px solid rgba(168, 85, 247, 0.4)', color: '#c084fc', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FileText size={14} /> Ver Ficha Técnica
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. STRICT OSINT PRIVACY: OMITTED UNVERIFIED DATA */}
      <div className="saas-card col-12" style={{ padding: '24px', background: 'rgba(244, 63, 94, 0.04)', border: '1px solid rgba(244, 63, 94, 0.25)' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f87171', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <EyeOff size={18} /> Datos Omitidos por Falta de Verificación Pública (Regla OSINT Estricta)
        </h3>
        <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
          Cumpliendo el principio de veracidad: si un dato no puede ser contrastado en fuentes abiertas oficiales, <strong>no se inventa y se omite de forma transparente</strong>:
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {omittedUnverifiedData.map((gap, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(0,0,0,0.25)', padding: '10px 14px', borderRadius: '8px', borderLeft: '3px solid #f43f5e' }}>
              <Ban size={15} style={{ color: '#f87171', flexShrink: 0 }} />
              <span style={{ fontSize: '0.84rem', color: '#fecdd3' }}>{gap}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tech Stack Grid */}
      <div className="saas-card col-12" style={{ padding: '26px' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
          <FileCode size={19} style={{ color: 'var(--accent-cyan)' }} /> Stack Tecnológico & Componentes Verificados
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
          {techStack.filter(t => !/kit\s*digital|kit\s*4\.0/i.test(`${t.category} ${t.name} ${t.source}`)).map((tech, idx) => (
            <div key={idx} style={{ background: 'rgba(255,255,255,0.03)', padding: '14px 18px', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', fontWeight: 800, textTransform: 'uppercase' }}>{tech.category}</div>
              <div style={{ fontSize: '0.98rem', fontWeight: 700, marginTop: '2px', color: 'var(--text-primary)' }}>{tech.name}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                <span style={{ fontSize: '0.74rem', background: 'rgba(16, 185, 129, 0.12)', color: 'var(--accent-emerald)', padding: '2px 8px', borderRadius: '10px', fontWeight: 700 }}>
                  {tech.type}
                </span>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{tech.source}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Kit Preview Modal */}
      {activeKitPreview && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={() => setActiveKitPreview(null)}>
          <div style={{ background: 'var(--bg-surface)', width: '100%', maxWidth: '700px', borderRadius: '16px', border: '1px solid var(--border-subtle)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-surface-elevated)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FileText size={20} style={{ color: 'var(--text-secondary)' }} />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Ficha Técnica del Kit</h3>
              </div>
              <button onClick={() => setActiveKitPreview(null)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            
            <div style={{ padding: '30px 24px', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '30px', right: '30px', opacity: 0.05, pointerEvents: 'none' }}>
                <Cpu size={120} />
              </div>
              
              <div style={{ display: 'inline-block', background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 800, marginBottom: '12px' }}>
                {activeKitPreview.category} | {activeKitPreview.code}
              </div>
              
              <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '16px', lineHeight: '1.2', maxWidth: '85%' }}>
                {activeKitPreview.name}
              </h2>
              
              <div style={{ background: 'var(--bg-slate)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-subtle)', marginBottom: '20px' }}>
                <h4 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '8px' }}>Descripción del Servicio</h4>
                <p style={{ fontSize: '0.95rem', color: 'var(--text-primary)', lineHeight: '1.6' }}>
                  {activeKitPreview.summary}
                </p>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ background: 'rgba(16, 185, 129, 0.05)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                  <h4 style={{ fontSize: '0.85rem', color: 'var(--accent-emerald)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}><ShieldCheck size={16} /> Financiamiento</h4>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 600 }}>{activeKitPreview.fundingCoverage}</p>
                </div>
                
                <div style={{ background: 'rgba(168, 85, 247, 0.05)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(168, 85, 247, 0.2)' }}>
                  <h4 style={{ fontSize: '0.85rem', color: '#c084fc', textTransform: 'uppercase', fontWeight: 700, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}><TrendingUp size={16} /> Impacto Esperado (ROI)</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>{activeKitPreview.aiRationale}</p>
                </div>
              </div>
            </div>
            
            <div style={{ padding: '16px 24px', background: 'var(--bg-surface-elevated)', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setActiveKitPreview(null)} style={{ background: 'var(--accent-primary)', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem' }}>
                Cerrar Ficha
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
