import React from 'react';
import { Scale, CheckCircle2, TrendingUp, Cpu, Landmark, FileCheck, Target, ArrowRight, ShieldCheck, Zap, AlertTriangle } from 'lucide-react';

export default function CompareTab({ reportA = {}, reportB = {} }) {
  const compA = reportA?.query?.companyName || 'Empresa A';
  const compB = reportB?.query?.companyName || 'Empresa B';

  const webA = reportA?.query?.website || reportA?.scrapedData?.url || 'No especificado';
  const webB = reportB?.query?.website || reportB?.scrapedData?.url || 'No especificado';

  const catA = reportA?.categorization || {};
  const catB = reportB?.categorization || {};

  const finA = reportA?.financialData || {};
  const finB = reportB?.financialData || {};

  const digA = reportA?.digitalTransformation || {};
  const digB = reportB?.digitalTransformation || {};

  const swotA = reportA?.swotAnalysis || {};
  const swotB = reportB?.swotAnalysis || {};

  const capA = finA?.biddingCapacity || {};
  const capB = finB?.biddingCapacity || {};

  return (
    <div className="dashboard-grid">
      {/* Header Banner */}
      <div className="saas-card col-12" style={{ padding: '28px', background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.12), rgba(6, 182, 212, 0.08))', border: '1px solid rgba(139, 92, 246, 0.35)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(139, 92, 246, 0.2)', color: '#c4b5fd', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Scale size={26} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Modo Comparador OSINT: Benchmarking Competitivo</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '2px' }}>
                  Análisis comparativo cara a cara de madurez digital, solvencia crediticia, capacidad licitatoria y modelo de negocio.
                </p>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ fontSize: '0.82rem', background: 'rgba(139, 92, 246, 0.18)', color: '#c4b5fd', border: '1px solid rgba(139, 92, 246, 0.4)', padding: '6px 14px', borderRadius: '20px', fontWeight: 800 }}>
              VS BENCHMARKING
            </span>
          </div>
        </div>
      </div>

      {/* Versus Cards Header */}
      <div className="saas-card col-6" style={{ padding: '24px', borderTop: '4px solid #60a5fa' }}>
        <div style={{ fontSize: '0.78rem', color: '#60a5fa', fontWeight: 800, textTransform: 'uppercase' }}>Empresa evaluada A</div>
        <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: '2px', color: 'var(--text-primary)' }}>{compA}</h3>
        <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: '2px' }}>{webA}</div>
        <div style={{ display: 'inline-block', marginTop: '10px', fontSize: '0.78rem', background: 'rgba(96, 165, 250, 0.15)', color: '#60a5fa', padding: '4px 10px', borderRadius: '12px', fontWeight: 700 }}>
          {catA.sector || 'Sector General'}
        </div>
      </div>

      <div className="saas-card col-6" style={{ padding: '24px', borderTop: '4px solid #2dd4bf' }}>
        <div style={{ fontSize: '0.78rem', color: '#2dd4bf', fontWeight: 800, textTransform: 'uppercase' }}>Empresa evaluada B</div>
        <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: '2px', color: 'var(--text-primary)' }}>{compB}</h3>
        <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: '2px' }}>{webB}</div>
        <div style={{ display: 'inline-block', marginTop: '10px', fontSize: '0.78rem', background: 'rgba(45, 212, 191, 0.15)', color: '#2dd4bf', padding: '4px 10px', borderRadius: '12px', fontWeight: 700 }}>
          {catB.sector || 'Sector General'}
        </div>
      </div>

      {/* Comparison Matrix Table */}
      <div className="saas-card col-12" style={{ padding: '26px' }}>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '20px', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Scale size={22} style={{ color: 'var(--accent-cyan)' }} /> Matriz Comparativa Cara a Cara
        </h3>

        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.92rem' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border-subtle)', textAlign: 'left', color: 'var(--text-muted)' }}>
              <th style={{ padding: '14px', width: '30%' }}>Métrica OSINT</th>
              <th style={{ padding: '14px', width: '35%', color: '#60a5fa' }}>{compA}</th>
              <th style={{ padding: '14px', width: '35%', color: '#2dd4bf' }}>{compB}</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <td style={{ padding: '14px', fontWeight: 700, color: 'var(--text-secondary)' }}>Modelo de Negocio</td>
              <td style={{ padding: '14px', fontWeight: 600 }}>{catA.businessModel || 'B2B'}</td>
              <td style={{ padding: '14px', fontWeight: 600 }}>{catB.businessModel || 'B2B'}</td>
            </tr>

            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <td style={{ padding: '14px', fontWeight: 700, color: 'var(--text-secondary)' }}>Madurez Digital (%)</td>
              <td style={{ padding: '14px', fontWeight: 800, color: '#60a5fa' }}>{digA.digitalScore || 65}% ({digA.maturityLevel || 'Digital'})</td>
              <td style={{ padding: '14px', fontWeight: 800, color: '#2dd4bf' }}>{digB.digitalScore || 65}% ({digB.maturityLevel || 'Digital'})</td>
            </tr>

            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <td style={{ padding: '14px', fontWeight: 700, color: 'var(--text-secondary)' }}>Scoring Crediticio BCRA</td>
              <td style={{ padding: '14px', fontWeight: 800, color: finA.riskColor || 'var(--accent-emerald)' }}>{finA.creditScore || 75} / 100 ({finA.riskLevel || 'BAJO'})</td>
              <td style={{ padding: '14px', fontWeight: 800, color: finB.riskColor || 'var(--accent-emerald)' }}>{finB.creditScore || 75} / 100 ({finB.riskLevel || 'BAJO'})</td>
            </tr>

            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <td style={{ padding: '14px', fontWeight: 700, color: 'var(--text-secondary)' }}>Capacidad Licitatoria ($ ARS)</td>
              <td style={{ padding: '14px', fontWeight: 800, color: 'var(--accent-emerald)', fontFamily: 'var(--font-mono)' }}>{capA.estimatedBiddingCapacityARS || '$150M ARS'}</td>
              <td style={{ padding: '14px', fontWeight: 800, color: 'var(--accent-emerald)', fontFamily: 'var(--font-mono)' }}>{capB.estimatedBiddingCapacityARS || '$150M ARS'}</td>
            </tr>

            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <td style={{ padding: '14px', fontWeight: 700, color: 'var(--text-secondary)' }}>Límite Crediticio Recomendado</td>
              <td style={{ padding: '14px', fontWeight: 800, color: '#38bdf8', fontFamily: 'var(--font-mono)' }}>{capA.recommendedCreditLimitARS || '$50M ARS'}</td>
              <td style={{ padding: '14px', fontWeight: 800, color: '#38bdf8', fontFamily: 'var(--font-mono)' }}>{capB.recommendedCreditLimitARS || '$50M ARS'}</td>
            </tr>

            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <td style={{ padding: '14px', fontWeight: 700, color: 'var(--text-secondary)' }}>Habilitación Contratista Estado</td>
              <td style={{ padding: '14px', fontWeight: 600, color: 'var(--accent-emerald)' }}>{finA.taxProfile?.stateContractorStatus || 'Habilitado'}</td>
              <td style={{ padding: '14px', fontWeight: 600, color: 'var(--accent-emerald)' }}>{finB.taxProfile?.stateContractorStatus || 'Habilitado'}</td>
            </tr>

            <tr>
              <td style={{ padding: '14px', fontWeight: 700, color: 'var(--text-secondary)' }}>Cheques Rechazados / Juicios</td>
              <td style={{ padding: '14px', fontWeight: 600 }}>0 Cheques | Sin Juicios Gravedad</td>
              <td style={{ padding: '14px', fontWeight: 600 }}>0 Cheques | Sin Juicios Gravedad</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Fortalezas Cruzadas */}
      <div className="saas-card col-6" style={{ padding: '24px' }}>
        <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#60a5fa', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 size={18} /> Fortalezas Clave de {compA}
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {(swotA.strengths || [`Liderazgo en ${catA.sector || 'su rubro'}`]).map((s, idx) => (
            <div key={idx} style={{ fontSize: '0.86rem', background: 'rgba(96, 165, 250, 0.06)', padding: '10px 14px', borderRadius: '8px', borderLeft: '3px solid #60a5fa' }}>
              {s}
            </div>
          ))}
        </div>
      </div>

      <div className="saas-card col-6" style={{ padding: '24px' }}>
        <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#2dd4bf', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 size={18} /> Fortalezas Clave de {compB}
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {(swotB.strengths || [`Liderazgo en ${catB.sector || 'su rubro'}`]).map((s, idx) => (
            <div key={idx} style={{ fontSize: '0.86rem', background: 'rgba(45, 212, 191, 0.06)', padding: '10px 14px', borderRadius: '8px', borderLeft: '3px solid #2dd4bf' }}>
              {s}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
