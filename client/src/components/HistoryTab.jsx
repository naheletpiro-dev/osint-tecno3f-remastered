import React from 'react';
import { History, Trash2, ArrowUpRight } from 'lucide-react';

export default function HistoryTab({ history, onLoadReport, onClearHistory }) {
  if (!history || history.length === 0) {
    return (
      <div className="saas-card col-12" style={{ padding: '50px 20px', textAlign: 'center' }}>
        <History size={48} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
        <h3>Historial OSINT Tecno3F Vacío</h3>
        <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>
          Las investigaciones que realices se guardarán automáticamente aquí para consultas y comparaciones.
        </p>
      </div>
    );
  }

  return (
    <div className="dashboard-grid">
      <div className="saas-card col-12" style={{ padding: '26px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px' }}>
          <h3 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <History size={22} style={{ color: '#60a5fa' }} /> Historial de Investigaciones ({history.length})
          </h3>
          <button onClick={onClearHistory} style={{ background: 'rgba(244, 63, 94, 0.12)', border: '1px solid rgba(244, 63, 94, 0.3)', color: 'var(--accent-rose)', padding: '7px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.84rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Trash2 size={14} /> Limpiar Historial
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {history.map((report, idx) => (
            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 20px', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)', flexWrap: 'wrap', gap: '14px' }}>
              <div>
                <div style={{ fontSize: '1.12rem', fontWeight: 700 }}>{report.query.companyName}</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  {report.categorization.sector} • {new Date(report.timestamp).toLocaleString('es-AR')}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Salud Financiera</span>
                  <div style={{ fontWeight: 800, color: report.financialData.riskColor, fontSize: '1.05rem' }}>{report.financialData.creditScore} / 100</div>
                </div>

                <button className="btn-primary" onClick={() => onLoadReport(report)} style={{ padding: '9px 18px', fontSize: '0.85rem' }}>
                  Abrir Informe <ArrowUpRight size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
