import React from 'react';
import { ShieldCheck } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer style={{
      marginTop: '40px',
      borderTop: '1px solid #1e293b',
      background: 'rgba(15, 23, 42, 0.7)',
      padding: '24px 30px',
      borderRadius: '16px 16px 0 0',
      display: 'flex',
      justify: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '16px',
      color: 'var(--text-secondary)',
      fontSize: '0.86rem'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'rgba(139, 92, 246, 0.15)', border: '1px solid rgba(139, 92, 246, 0.3)', color: '#c4b5fd', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ShieldCheck size={16} />
        </div>
        <div>
          <span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>
            OSINT <span style={{ color: '#a78bfa' }}>Tecno</span><span style={{ color: '#2dd4bf' }}>3F</span>
          </span>
          <span style={{ marginLeft: '8px', color: 'var(--text-muted)' }}>| Plataforma de Inteligencia Comercial</span>
        </div>
      </div>

      <div style={{ textAlign: 'right', fontWeight: 600 }}>
        © {currentYear} OSINT Tecno3F. <strong style={{ color: 'var(--text-primary)' }}>Desarrollado por Tecno3F</strong>. Todos los derechos reservados.
      </div>
    </footer>
  );
}
