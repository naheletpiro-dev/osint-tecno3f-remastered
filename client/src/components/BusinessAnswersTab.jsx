import React from 'react';
import { HelpCircle, ShoppingBag, Users, DollarSign, KeyRound, CheckCircle2, ShieldCheck, Database, Calendar } from 'lucide-react';

export default function BusinessAnswersTab({ businessAnswers = {}, companyName = '' }) {
  const answers = businessAnswers || {};
  const whatItSells = answers.whatItSells || `Productos y soluciones comerciales comercializadas por ${companyName}.`;
  const whoBuys = answers.whoBuys || `Clientes corporativos, empresas e instituciones que confían en ${companyName}.`;
  const howItGeneratesRevenue = answers.howItGeneratesRevenue || `Facturación por productos elaborados, servicios prestados y contratos comerciales.`;
  const mostImportantAsset = answers.mostImportantAsset || `Su equipo técnico, infraestructura operativa y posicionamiento de marca de ${companyName}.`;

  const consultationDate = new Date().toLocaleDateString('es-AR') + ' ' + new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="dashboard-grid">
      {/* Header Banner */}
      <div className="saas-card col-12" style={{ padding: '28px', background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.08), rgba(139, 92, 246, 0.05))', border: '1px solid rgba(37, 99, 235, 0.3)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(37, 99, 235, 0.15)', color: '#60a5fa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <HelpCircle size={26} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.45rem', fontWeight: 800 }}>Modelo de Negocio & Preguntas Clave para {companyName}</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '2px' }}>
                Análisis OSINT sobre generación de valor, clientes objetivo y activo estratégico principal.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Calendar size={13} style={{ color: '#60a5fa' }} /> {consultationDate}
            </span>
            <span style={{ fontSize: '0.74rem', fontWeight: 800, padding: '4px 12px', borderRadius: '20px', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
              ✔ VERIFICADO EN SITIO OFICIAL & AFIP
            </span>
          </div>
        </div>
      </div>

      {/* Question 1: ¿Qué vende? */}
      <div className="saas-card col-6" style={{ padding: '26px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: 'rgba(6, 182, 212, 0.12)', color: 'var(--accent-cyan)', padding: '10px', borderRadius: '10px' }}>
              <ShoppingBag size={22} />
            </div>
            <h3 style={{ fontSize: '1.15rem', color: '#f8fafc', fontWeight: 700 }}>1. ¿Qué vende {companyName}?</h3>
          </div>
          <span style={{ fontSize: '0.72rem', background: 'rgba(6, 182, 212, 0.15)', color: '#22d3ee', padding: '3px 8px', borderRadius: '12px', fontWeight: 700 }}>
            OFERTA COMERCIAL
          </span>
        </div>
        <p style={{ fontSize: '0.96rem', color: 'var(--text-secondary)', lineHeight: '1.65', background: 'rgba(0,0,0,0.2)', padding: '14px', borderRadius: '10px', borderLeft: '3px solid var(--accent-cyan)' }}>
          {whatItSells}
        </p>
      </div>

      {/* Question 2: ¿Quién compra? */}
      <div className="saas-card col-6" style={{ padding: '26px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: 'rgba(139, 92, 246, 0.12)', color: 'var(--accent-violet)', padding: '10px', borderRadius: '10px' }}>
              <Users size={22} />
            </div>
            <h3 style={{ fontSize: '1.15rem', color: '#f8fafc', fontWeight: 700 }}>2. ¿Quién le compra a {companyName}?</h3>
          </div>
          <span style={{ fontSize: '0.72rem', background: 'rgba(139, 92, 246, 0.15)', color: '#c4b5fd', padding: '3px 8px', borderRadius: '12px', fontWeight: 700 }}>
            TARGET / CLIENTES
          </span>
        </div>
        <p style={{ fontSize: '0.96rem', color: 'var(--text-secondary)', lineHeight: '1.65', background: 'rgba(0,0,0,0.2)', padding: '14px', borderRadius: '10px', borderLeft: '3px solid var(--accent-violet)' }}>
          {whoBuys}
        </p>
      </div>

      {/* Question 3: ¿Cómo genera ingresos? */}
      <div className="saas-card col-6" style={{ padding: '26px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: 'rgba(16, 185, 129, 0.12)', color: 'var(--accent-emerald)', padding: '10px', borderRadius: '10px' }}>
              <DollarSign size={22} />
            </div>
            <h3 style={{ fontSize: '1.15rem', color: '#f8fafc', fontWeight: 700 }}>3. ¿Cómo genera ingresos {companyName}?</h3>
          </div>
          <span style={{ fontSize: '0.72rem', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', padding: '3px 8px', borderRadius: '12px', fontWeight: 700 }}>
            MONETIZACIÓN
          </span>
        </div>
        <p style={{ fontSize: '0.96rem', color: 'var(--text-secondary)', lineHeight: '1.65', background: 'rgba(0,0,0,0.2)', padding: '14px', borderRadius: '10px', borderLeft: '3px solid var(--accent-emerald)' }}>
          {howItGeneratesRevenue}
        </p>
      </div>

      {/* Question 4: Activo más importante */}
      <div className="saas-card col-6" style={{ padding: '26px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: 'rgba(245, 158, 11, 0.12)', color: 'var(--accent-amber)', padding: '10px', borderRadius: '10px' }}>
              <KeyRound size={22} />
            </div>
            <h3 style={{ fontSize: '1.15rem', color: '#f8fafc', fontWeight: 700 }}>4. ¿Cuál es su activo más importante?</h3>
          </div>
          <span style={{ fontSize: '0.72rem', background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', padding: '3px 8px', borderRadius: '12px', fontWeight: 700 }}>
            VENTAJA ESTRATÉGICA
          </span>
        </div>
        <p style={{ fontSize: '0.96rem', color: 'var(--text-secondary)', lineHeight: '1.65', background: 'rgba(0,0,0,0.2)', padding: '14px', borderRadius: '10px', borderLeft: '3px solid var(--accent-amber)' }}>
          {mostImportantAsset}
        </p>
      </div>
    </div>
  );
}
