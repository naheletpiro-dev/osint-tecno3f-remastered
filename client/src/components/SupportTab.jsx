import React from 'react';
import { HeartHandshake, CheckSquare, Shield, TrendingUp, Globe, Award, MessageSquare, Code, AlertTriangle, ArrowRight, Briefcase, Users } from 'lucide-react';

export default function SupportTab({ supportPlan = {}, companyName = '' }) {
  const data = supportPlan || {};
  const recs = data.recommendations || [];

  const getIcon = (iconName) => {
    switch (iconName) {
      case 'globe': return <Globe size={20} style={{ color: 'var(--accent-primary)' }} />;
      case 'shield': return <Shield size={20} style={{ color: 'var(--accent-emerald)' }} />;
      case 'alert-triangle': return <AlertTriangle size={20} style={{ color: 'var(--accent-rose)' }} />;
      case 'trending-up': return <TrendingUp size={20} style={{ color: 'var(--accent-emerald)' }} />;
      case 'briefcase': return <Briefcase size={20} style={{ color: '#60a5fa' }} />;
      case 'users': return <Users size={20} style={{ color: 'var(--accent-violet)' }} />;
      default: return <Code size={20} style={{ color: 'var(--accent-primary)' }} />;
    }
  };

  return (
    <div className="dashboard-grid">
      {/* Strategic Support Overview Banner */}
      <div className="saas-card col-12" style={{ padding: '30px', background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.08), rgba(16, 185, 129, 0.05))', border: '1px solid rgba(37, 99, 235, 0.3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <HeartHandshake size={28} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.55rem', fontWeight: 800 }}>Programa de Asistencia & Apoyo Estratégico Tecno3F para {companyName}</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginTop: '3px' }}>
              Diagnóstico comercial, financiero e institucional diseñado para impulsar y fortalecer a la empresa.
            </p>
          </div>
        </div>
      </div>

      {/* Action Plan Cards */}
      <div className="col-12" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        {recs.map((rec, idx) => {
          const priorityClass = rec.priority === 'ALTA' ? 'priority-high' : rec.priority === 'MEDIA' ? 'priority-medium' : 'priority-recommended';
          const priorityColor = rec.priority === 'ALTA' ? 'var(--accent-rose)' : rec.priority === 'MEDIA' ? 'var(--accent-amber)' : 'var(--accent-emerald)';
          const actionSteps = rec.actionSteps || [];

          return (
            <div key={idx} className={`support-plan-card ${priorityClass}`}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {getIcon(rec.icon)}
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {rec.category}
                  </span>
                </div>
                <span style={{ background: `${priorityColor}18`, color: priorityColor, border: `1px solid ${priorityColor}40`, padding: '4px 12px', borderRadius: '20px', fontSize: '0.76rem', fontWeight: 800 }}>
                  Prioridad: {rec.priority}
                </span>
              </div>

              <h3 style={{ fontSize: '1.12rem', fontWeight: 700, marginBottom: '8px' }}>{rec.title}</h3>
              <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: '1.5' }}>{rec.description}</p>

              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '0.8rem', color: '#60a5fa', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                  <CheckSquare size={15} /> Acciones Recomendadas:
                </span>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {actionSteps.map((step, sIdx) => (
                    <li key={sIdx} style={{ fontSize: '0.88rem', color: '#f1f5f9', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <ArrowRight size={14} style={{ color: 'var(--accent-emerald)', flexShrink: 0 }} /> {step}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
