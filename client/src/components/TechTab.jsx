import React from 'react';
import { Cpu, Globe, Server, Shield, CheckCircle, XCircle } from 'lucide-react';

export default function TechTab({ domainData }) {
  if (!domainData.hasWebsite) {
    return (
      <div className="cyber-card col-12" style={{ padding: '40px', textAlign: 'center' }}>
        <Globe size={48} style={{ color: 'var(--text-dim)', marginBottom: '16px' }} />
        <h3>Sin Dominio Web Registrado</h3>
        <p style={{ color: 'var(--text-muted)', marginTop: '8px', maxWidth: '500px', margin: '8px auto 0 auto' }}>
          No se especificó un sitio web para esta consulta. Ingresa la URL oficial de la empresa en una nueva búsqueda para extraer la infraestructura DNS, IP, SSL y Tech Stack.
        </p>
      </div>
    );
  }

  return (
    <div className="dashboard-grid">
      {/* 1. Tech Stack Detected */}
      <div className="cyber-card col-6" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-cyan)' }}>
          <Cpu size={18} /> Tecnologías y Frameworks Detectados
        </h3>
        {domainData.techStack && domainData.techStack.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px' }}>
            {domainData.techStack.map((tech, idx) => (
              <div key={idx} style={{ background: 'rgba(6, 182, 212, 0.08)', border: '1px solid rgba(6, 182, 212, 0.3)', padding: '10px 14px', borderRadius: '8px', fontSize: '0.88rem', fontWeight: 600, color: '#e0f2fe' }}>
                {tech}
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: 'var(--text-dim)' }}>No se identificaron firmas públicas en las cabeceras HTTP.</p>
        )}
      </div>

      {/* 2. Security Headers */}
      <div className="cyber-card col-6" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-emerald)' }}>
          <Shield size={18} /> Seguridad de Dominio & HTTP Headers
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <HeaderCheck label="Strict-Transport-Security (HSTS)" status={domainData.securityHeaders?.hsts} />
          <HeaderCheck label="Content-Security-Policy (CSP)" status={domainData.securityHeaders?.csp} />
          <HeaderCheck label="X-Frame-Options (Clickjacking Protection)" status={domainData.securityHeaders?.xFrameOptions} />
          <HeaderCheck label="X-Content-Type-Options (MIME Sniffing)" status={domainData.securityHeaders?.xContentTypeOptions} />
        </div>
      </div>

      {/* 3. DNS Records */}
      <div className="cyber-card col-6" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Server size={18} style={{ color: 'var(--accent-purple)' }} /> Registros DNS & Direcciones IP
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.88rem' }}>
          <div>
            <span style={{ color: 'var(--text-dim)', fontWeight: 700 }}>IP Server (A Records):</span>
            <div className="mono" style={{ background: 'rgba(0,0,0,0.3)', padding: '8px', borderRadius: '6px', marginTop: '4px' }}>
              {domainData.ipAddresses.length > 0 ? domainData.ipAddresses.join(', ') : 'No resuelto / CDN enmascarada'}
            </div>
          </div>
          <div>
            <span style={{ color: 'var(--text-dim)', fontWeight: 700 }}>Servidores de Correo (MX Records):</span>
            <div className="mono" style={{ background: 'rgba(0,0,0,0.3)', padding: '8px', borderRadius: '6px', marginTop: '4px' }}>
              {domainData.mxRecords.length > 0 ? domainData.mxRecords.join('\n') : 'Sin registros MX públicos'}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Raw HTTP Headers */}
      <div className="cyber-card col-6" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '16px', color: 'var(--text-muted)' }}>
          Cabeceras HTTP Raw
        </h3>
        <pre className="mono" style={{ background: 'rgba(0,0,0,0.4)', padding: '14px', borderRadius: '8px', fontSize: '0.78rem', color: '#9ca3af', overflowX: 'auto', maxHeight: '200px' }}>
          {JSON.stringify(domainData.httpHeaders, null, 2)}
        </pre>
      </div>
    </div>
  );
}

function HeaderCheck({ label, status }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: '6px' }}>
      <span style={{ fontSize: '0.88rem' }}>{label}</span>
      {status ? (
        <span style={{ color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', fontWeight: 700 }}>
          <CheckCircle size={15} /> Activo
        </span>
      ) : (
        <span style={{ color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem' }}>
          <XCircle size={15} /> Ausente
        </span>
      )}
    </div>
  );
}
