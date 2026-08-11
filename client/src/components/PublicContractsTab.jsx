import React from 'react';
import { Landmark, FileCheck, ExternalLink, CheckCircle2 } from 'lucide-react';
import RealVsEstimatedBadge from './RealVsEstimatedBadge';

export default function PublicContractsTab({ publicContracts = {}, companyName = '' }) {
  const data = publicContracts || {};
  const contracts = data.contracts || [];
  const totalAwardedAmount = data.totalAwardedAmount || '$0 ARS';
  const supplierRegistryStatus = data.supplierRegistryStatus || 'Registro Público COMPR.AR';
  const totalContracts = data.totalContracts || contracts.length;
  const isRealData = data.isRealData || false;
  const comprarUrl = data.comprarPortalUrl || 'https://comprar.gob.ar/';

  return (
    <div className="dashboard-grid">
      {/* Header Summary Card */}
      <div className="saas-card col-12" style={{ padding: '26px', background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.08), rgba(37, 99, 235, 0.05))', border: '1px solid rgba(37, 99, 235, 0.3)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(6, 182, 212, 0.15)', color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Landmark size={26} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: '1.45rem', fontWeight: 800 }}>Contratos Públicos, Licitaciones y Compras del Estado</h2>
                <RealVsEstimatedBadge isRealData={isRealData} sourceLabel={data.apiSource} />
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
                Registro de contrataciones públicas, licitaciones y adjudicaciones estatles en el Portal COMPR.AR / RUP / BAC.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Total Adjudicado</span>
              <div style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--accent-cyan)', marginTop: '2px' }}>
                {totalAwardedAmount}
              </div>
            </div>
            <a
              href={comprarUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary"
              style={{ fontSize: '0.8rem', padding: '6px 12px', gap: '6px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}
            >
              <ExternalLink size={14} /> Portal COMPR.AR
            </a>
          </div>
        </div>

        <div style={{ background: isRealData ? 'rgba(16, 185, 129, 0.08)' : 'rgba(255, 255, 255, 0.03)', border: `1px solid ${isRealData ? 'rgba(16, 185, 129, 0.25)' : 'var(--border-subtle)'}`, padding: '12px 16px', borderRadius: '8px', marginTop: '18px', fontSize: '0.88rem', color: isRealData ? 'var(--accent-emerald)' : 'var(--text-secondary)', fontWeight: 600 }}>
          {supplierRegistryStatus}
        </div>
      </div>

      {/* Contracts Table */}
      <div className="saas-card col-12" style={{ padding: '26px' }}>
        <h3 style={{ fontSize: '1.15rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', color: '#60a5fa' }}>
          <FileCheck size={20} /> Licitaciones y Adjudicaciones Registradas ({totalContracts})
        </h3>

        {contracts.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.92rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', textAlign: 'left' }}>
                  <th style={{ padding: '14px' }}>Organismo Comprador</th>
                  <th style={{ padding: '14px' }}>Monto Adjudicado</th>
                  <th style={{ padding: '14px' }}>Fecha</th>
                  <th style={{ padding: '14px' }}>Estado</th>
                  <th style={{ padding: '14px' }}>Objeto del Contrato</th>
                </tr>
              </thead>
              <tbody>
                {contracts.map((c, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                    <td style={{ padding: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>{c.organism}</td>
                    <td style={{ padding: '14px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent-cyan)' }}>{c.amount}</td>
                    <td style={{ padding: '14px', color: 'var(--text-secondary)' }}>{c.date}</td>
                    <td style={{ padding: '14px' }}>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        background: (c.status || '').includes('Adjudicado') ? 'rgba(16, 185, 129, 0.15)' : 'rgba(37, 99, 235, 0.15)',
                        color: (c.status || '').includes('Adjudicado') ? 'var(--accent-emerald)' : '#60a5fa',
                        border: `1px solid ${(c.status || '').includes('Adjudicado') ? 'rgba(16, 185, 129, 0.3)' : 'rgba(37, 99, 235, 0.3)'}`
                      }}>
                        {c.status}
                      </span>
                    </td>
                    <td style={{ padding: '14px', color: 'var(--text-secondary)', fontSize: '0.88rem' }}>{c.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ color: 'var(--text-muted)', padding: '36px 24px', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px dashed var(--border-subtle)' }}>
            <Landmark size={36} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
            <div style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Dato no disponible / Sin licitaciones estatales registradas para {companyName}</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '6px', maxWidth: '440px', margin: '6px auto 0' }}>
              No se detectaron contrataciones ni adjudicaciones públicas verificadas en la consulta en vivo al Portal COMPR.AR.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
