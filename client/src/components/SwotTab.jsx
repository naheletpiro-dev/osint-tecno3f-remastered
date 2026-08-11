import React from 'react';
import { Target, CheckCircle2, AlertTriangle, TrendingUp, ShieldAlert } from 'lucide-react';

export default function SwotTab({ swotAnalysis = {}, companyName = '' }) {
  const swot = swotAnalysis || {};
  const strengths = swot.strengths || [];
  const weaknesses = swot.weaknesses || [];
  const opportunities = swot.opportunities || [];
  const threats = swot.threats || [];

  return (
    <div className="dashboard-grid">
      {/* Header Banner */}
      <div className="saas-card col-12" style={{ padding: '28px', background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.08), rgba(16, 185, 129, 0.05))', border: '1px solid rgba(37, 99, 235, 0.3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(37, 99, 235, 0.15)', color: '#60a5fa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Target size={26} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.45rem', fontWeight: 800 }}>Matriz FODA & Diagnóstico Estratégico de {companyName}</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '2px' }}>
              Evaluación consolidada de Fortalezas, Debilidades, Oportunidades y Amenazas derivadas del análisis OSINT Tecno3F.
            </p>
          </div>
        </div>
      </div>

      {/* Fortalezas (Strengths) */}
      <div className="saas-card col-6" style={{ padding: '26px', borderTop: '4px solid var(--accent-emerald)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-emerald)', padding: '10px', borderRadius: '10px' }}>
            <CheckCircle2 size={22} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.15rem', color: 'var(--text-primary)' }}>Fortalezas</h3>
            <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>Factores internos positivos</span>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {strengths.map((st, idx) => (
            <div key={idx} style={{ padding: '12px 16px', background: 'rgba(16, 185, 129, 0.07)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: '8px', fontSize: '0.92rem', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <CheckCircle2 size={16} style={{ color: 'var(--accent-emerald)', marginTop: '2px', flexShrink: 0 }} />
              <span>{st}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Debilidades (Weaknesses) */}
      <div className="saas-card col-6" style={{ padding: '26px', borderTop: '4px solid var(--accent-amber)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
          <div style={{ background: 'rgba(245, 158, 11, 0.15)', color: 'var(--accent-amber)', padding: '10px', borderRadius: '10px' }}>
            <AlertTriangle size={22} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.15rem', color: 'var(--text-primary)' }}>Debilidades</h3>
            <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>Aspectos internos a mejorar</span>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {weaknesses.map((wk, idx) => (
            <div key={idx} style={{ padding: '12px 16px', background: 'rgba(245, 158, 11, 0.07)', border: '1px solid rgba(245, 158, 11, 0.25)', borderRadius: '8px', fontSize: '0.92rem', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <AlertTriangle size={16} style={{ color: 'var(--accent-amber)', marginTop: '2px', flexShrink: 0 }} />
              <span>{wk}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Oportunidades (Opportunities) */}
      <div className="saas-card col-6" style={{ padding: '26px', borderTop: '4px solid #60a5fa' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
          <div style={{ background: 'rgba(37, 99, 235, 0.15)', color: '#60a5fa', padding: '10px', borderRadius: '10px' }}>
            <TrendingUp size={22} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.15rem', color: 'var(--text-primary)' }}>Oportunidades</h3>
            <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>Factores externos favorables</span>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {opportunities.map((op, idx) => (
            <div key={idx} style={{ padding: '12px 16px', background: 'rgba(37, 99, 235, 0.07)', border: '1px solid rgba(37, 99, 235, 0.25)', borderRadius: '8px', fontSize: '0.92rem', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <TrendingUp size={16} style={{ color: '#60a5fa', marginTop: '2px', flexShrink: 0 }} />
              <span>{op}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Amenazas (Threats) */}
      <div className="saas-card col-6" style={{ padding: '26px', borderTop: '4px solid var(--accent-rose)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
          <div style={{ background: 'rgba(244, 63, 94, 0.15)', color: 'var(--accent-rose)', padding: '10px', borderRadius: '10px' }}>
            <ShieldAlert size={22} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.15rem', color: 'var(--text-primary)' }}>Amenazas</h3>
            <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>Riesgos externos del entorno</span>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {threats.map((th, idx) => (
            <div key={idx} style={{ padding: '12px 16px', background: 'rgba(244, 63, 94, 0.07)', border: '1px solid rgba(244, 63, 94, 0.25)', borderRadius: '8px', fontSize: '0.92rem', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <ShieldAlert size={16} style={{ color: 'var(--accent-rose)', marginTop: '2px', flexShrink: 0 }} />
              <span>{th}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
