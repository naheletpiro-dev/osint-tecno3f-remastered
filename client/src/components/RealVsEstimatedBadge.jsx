import React from 'react';
import { CheckCircle2 } from 'lucide-react';

export default function RealVsEstimatedBadge({ isRealData, sourceLabel, customStyle = {} }) {
  if (!isRealData) {
    return null;
  }

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '5px',
      background: 'rgba(16, 185, 129, 0.15)',
      border: '1px solid rgba(16, 185, 129, 0.4)',
      color: 'var(--accent-emerald)',
      padding: '3px 10px',
      borderRadius: '8px',
      fontSize: '0.72rem',
      fontWeight: 800,
      letterSpacing: '0.02em',
      boxShadow: '0 2px 8px rgba(16, 185, 129, 0.12)',
      ...customStyle
    }} title={`Verificado en vivo: ${sourceLabel || 'Fuente Oficial Estatal'}`}>
      <CheckCircle2 size={12} style={{ color: 'var(--accent-emerald)' }} />
      DATO VERIFICADO EN VIVO {sourceLabel ? `(${sourceLabel})` : ''}
    </span>
  );
}
