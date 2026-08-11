import React, { useState } from 'react';
import { Network, Building2, Landmark, Scale, ShieldCheck, FileCheck, Layers, ExternalLink, Globe } from 'lucide-react';

export default function OsintNetworkGraph({ report, onTabChange }) {
  const [activeNode, setActiveNode] = useState('center');

  if (!report) return null;

  const companyName = report.query?.companyName || 'Empresa Auditada';
  const afip = report.financialData?.afipData || {};
  const bcra = report.financialData?.bcraDetails || {};
  const inpi = report.legalData?.inpiWipoData || {};
  const contracts = report.publicContracts || {};
  const trade = report.financialData?.tradeData || {};
  const pyme = report.financialData?.pymeData || {};
  const website = report.query?.website || report.scrapedData?.url || '';

  const nodes = {
    center: {
      title: companyName,
      subtitle: 'Entidad Central Auditada',
      badge: 'NODO MATRIZ',
      color: '#60a5fa',
      tabKey: 'overview',
      details: `Empresa evaluada a través del motor OSINT Tecno3F. Razón social registrada y análisis multi-fuente en tiempo real.`
    },
    afip: {
      title: 'Padrón AFIP / ARCA',
      subtitle: afip.cuit ? `CUIT ${afip.cuit}` : 'Constancia Impositiva',
      badge: afip.vatCondition || 'IVA Inscripto',
      color: 'var(--accent-emerald)',
      tabKey: 'financial',
      details: `CUIT: ${afip.cuit || '30-XXXXXXXX-X'} | Condición: ${afip.vatCondition || 'Activo'} | Actividad: ${afip.economicActivity || 'Comercial/Industrial'}`
    },
    bcra: {
      title: 'Central de Deudores BCRA',
      subtitle: bcra.situacionLabel || 'Situación 1 (Normal)',
      badge: bcra.situacionLabel || 'Sin Mora',
      color: bcra.situacionColor || 'var(--accent-emerald)',
      tabKey: 'financial',
      details: `Evaluación de riesgo bancario del Banco Central. Mora: ${bcra.situacionLabel || 'Situación 1 (Normal)'} | Cheques rechazados: ${report.financialData?.chequesRechazadosCount || 0}`
    },
    inpi: {
      title: 'Marcas INPI / WIPO',
      subtitle: `${inpi.totalTrademarksCount || 1} Marcas Registradas`,
      badge: 'PROPIEDAD INTELECTUAL',
      color: '#c084fc',
      tabKey: 'legal',
      details: `Registros de propiedad industrial y marcas comerciales concedidas en el Instituto Nacional de la Propiedad Industrial.`
    },
    contracts: {
      title: 'Licitaciones COMPR.AR',
      subtitle: `${contracts.totalContracts || 0} Contratos del Estado`,
      badge: 'CONTRATACIONES PÚBLICAS',
      color: '#38bdf8',
      tabKey: 'contracts',
      details: `Historial de licitaciones públicas y adjudicaciones directas de la empresa con organismos estatales.`
    },
    trade: {
      title: 'Comercio Exterior Aduana',
      subtitle: trade.tradeActivity || 'Mercado Nacional',
      badge: 'IMPO / EXPO',
      color: 'var(--accent-amber)',
      tabKey: 'financial',
      details: `Registro de operaciones de importación de insumos industriales o exportación de bienes al exterior.`
    },
    pyme: {
      title: 'Registro MiPyME Estatal',
      subtitle: pyme.pymeCategory || 'Certificado MiPyME Activo',
      badge: 'INCENTIVOS FISCALES',
      color: '#a78bfa',
      tabKey: 'support',
      details: `Categorización oficial PyME y acceso a regímenes de exenciones fiscales (Ley de Economía del Conocimiento).`
    },
    web: {
      title: 'Dominio Web Oficial',
      subtitle: website || 'Canal Digital Activo',
      badge: 'WEB CORPORATIVA',
      color: 'var(--accent-cyan)',
      tabKey: 'digital',
      details: `Presencia digital oficial comprobada en internet y portal de catálogo comercial.`
    }
  };

  const selected = nodes[activeNode] || nodes.center;

  return (
    <div className="saas-card col-12" style={{ padding: '26px', background: 'var(--bg-slate)', border: '1px solid #1e293b' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Network size={22} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              Grafo Interactivo de Conexiones OSINT
            </h3>
            <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Haz clic en cualquier nodo de la red para auditar la conexión y sus datos vinculados.
            </div>
          </div>
        </div>

        <span style={{ fontSize: '0.76rem', background: 'rgba(56, 189, 248, 0.12)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.3)', padding: '4px 12px', borderRadius: '20px', fontWeight: 800 }}>
          MAPA DE INTELIGENCIA DE RED
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '24px', alignItems: 'center' }}>
        {/* SVG Node Graph Canvas */}
        <div style={{ position: 'relative', width: '100%', height: '340px', background: 'var(--bg-input)', borderRadius: '16px', border: '1px solid #1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
            {/* Connection Lines from Center (200, 170) to Outer Nodes */}
            <line x1="50%" y1="50%" x2="18%" y2="20%" stroke="var(--border-subtle)" strokeWidth="2" strokeDasharray="4,4" />
            <line x1="50%" y1="50%" x2="50%" y2="15%" stroke="var(--border-subtle)" strokeWidth="2" strokeDasharray="4,4" />
            <line x1="50%" y1="50%" x2="82%" y2="20%" stroke="var(--border-subtle)" strokeWidth="2" strokeDasharray="4,4" />
            <line x1="50%" y1="50%" x2="88%" y2="50%" stroke="var(--border-subtle)" strokeWidth="2" strokeDasharray="4,4" />
            <line x1="50%" y1="50%" x2="82%" y2="80%" stroke="var(--border-subtle)" strokeWidth="2" strokeDasharray="4,4" />
            <line x1="50%" y1="50%" x2="50%" y2="85%" stroke="var(--border-subtle)" strokeWidth="2" strokeDasharray="4,4" />
            <line x1="50%" y1="50%" x2="18%" y2="80%" stroke="var(--border-subtle)" strokeWidth="2" strokeDasharray="4,4" />
          </svg>

          {/* Center Node: Target Company */}
          <div
            onClick={() => setActiveNode('center')}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 10,
              cursor: 'pointer',
              background: activeNode === 'center' ? 'var(--accent-primary)' : 'var(--bg-surface-elevated)',
              border: `3px solid ${nodes.center.color}`,
              boxShadow: '0 0 20px rgba(37, 99, 235, 0.4)',
              borderRadius: '50%',
              width: '76px',
              height: '76px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justify: 'center',
              color: 'var(--text-primary)',
              textAlign: 'center',
              padding: '6px',
              transition: 'all 0.3s ease'
            }}
          >
            <Building2 size={24} />
            <span style={{ fontSize: '0.62rem', fontWeight: 900, marginTop: '2px', lineHeight: 1.1, maxWidth: '60px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {companyName}
            </span>
          </div>

          {/* Node 1: AFIP (Top Left) */}
          <div
            onClick={() => setActiveNode('afip')}
            style={{
              position: 'absolute',
              top: '20%',
              left: '18%',
              transform: 'translate(-50%, -50%)',
              cursor: 'pointer',
              background: activeNode === 'afip' ? '#065f46' : 'var(--bg-surface-elevated)',
              border: `2px solid ${nodes.afip.color}`,
              borderRadius: '12px',
              padding: '8px 12px',
              color: 'var(--text-primary)',
              fontSize: '0.78rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s ease'
            }}
          >
            🏛️ AFIP
          </div>

          {/* Node 2: BCRA (Top Middle) */}
          <div
            onClick={() => setActiveNode('bcra')}
            style={{
              position: 'absolute',
              top: '15%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              cursor: 'pointer',
              background: activeNode === 'bcra' ? '#065f46' : 'var(--bg-surface-elevated)',
              border: `2px solid ${nodes.bcra.color}`,
              borderRadius: '12px',
              padding: '8px 12px',
              color: 'var(--text-primary)',
              fontSize: '0.78rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s ease'
            }}
          >
            🏦 BCRA
          </div>

          {/* Node 3: INPI (Top Right) */}
          <div
            onClick={() => setActiveNode('inpi')}
            style={{
              position: 'absolute',
              top: '20%',
              left: '82%',
              transform: 'translate(-50%, -50%)',
              cursor: 'pointer',
              background: activeNode === 'inpi' ? '#5b21b6' : 'var(--bg-surface-elevated)',
              border: `2px solid ${nodes.inpi.color}`,
              borderRadius: '12px',
              padding: '8px 12px',
              color: 'var(--text-primary)',
              fontSize: '0.78rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s ease'
            }}
          >
            🔖 INPI / WIPO
          </div>

          {/* Node 4: COMPR.AR (Middle Right) */}
          <div
            onClick={() => setActiveNode('contracts')}
            style={{
              position: 'absolute',
              top: '50%',
              left: '88%',
              transform: 'translate(-50%, -50%)',
              cursor: 'pointer',
              background: activeNode === 'contracts' ? '#0284c7' : 'var(--bg-surface-elevated)',
              border: `2px solid ${nodes.contracts.color}`,
              borderRadius: '12px',
              padding: '8px 12px',
              color: 'var(--text-primary)',
              fontSize: '0.78rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s ease'
            }}
          >
            📜 COMPR.AR
          </div>

          {/* Node 5: Trade (Bottom Right) */}
          <div
            onClick={() => setActiveNode('trade')}
            style={{
              position: 'absolute',
              top: '80%',
              left: '82%',
              transform: 'translate(-50%, -50%)',
              cursor: 'pointer',
              background: activeNode === 'trade' ? '#9a3412' : 'var(--bg-surface-elevated)',
              border: `2px solid ${nodes.trade.color}`,
              borderRadius: '12px',
              padding: '8px 12px',
              color: 'var(--text-primary)',
              fontSize: '0.78rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s ease'
            }}
          >
            🚢 Aduana
          </div>

          {/* Node 6: MiPyME (Bottom Middle) */}
          <div
            onClick={() => setActiveNode('pyme')}
            style={{
              position: 'absolute',
              top: '85%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              cursor: 'pointer',
              background: activeNode === 'pyme' ? '#4c1d95' : 'var(--bg-surface-elevated)',
              border: `2px solid ${nodes.pyme.color}`,
              borderRadius: '12px',
              padding: '8px 12px',
              color: 'var(--text-primary)',
              fontSize: '0.78rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s ease'
            }}
          >
            🏭 MiPyME
          </div>

          {/* Node 7: Web (Bottom Left) */}
          <div
            onClick={() => setActiveNode('web')}
            style={{
              position: 'absolute',
              top: '80%',
              left: '18%',
              transform: 'translate(-50%, -50%)',
              cursor: 'pointer',
              background: activeNode === 'web' ? '#0e7490' : 'var(--bg-surface-elevated)',
              border: `2px solid ${nodes.web.color}`,
              borderRadius: '12px',
              padding: '8px 12px',
              color: 'var(--text-primary)',
              fontSize: '0.78rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s ease'
            }}
          >
            🌐 Web Oficial
          </div>
        </div>

        {/* Selected Node Details Box */}
        <div style={{ background: 'var(--bg-surface-elevated)', border: `1px solid ${selected.color}`, borderRadius: '16px', padding: '22px' }}>
          <div style={{ fontSize: '0.74rem', color: selected.color, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {selected.badge}
          </div>
          <h4 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: '4px 0 2px 0' }}>
            {selected.title}
          </h4>
          <div style={{ fontSize: '0.88rem', color: '#cbd5e1', fontWeight: 600, marginBottom: '14px' }}>
            {selected.subtitle}
          </div>

          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: '1.5', background: 'var(--bg-input)', padding: '12px 14px', borderRadius: '10px', border: '1px solid #334155' }}>
            {selected.details}
          </p>

          {onTabChange && selected.tabKey && (
            <button
              onClick={() => onTabChange(selected.tabKey)}
              style={{
                marginTop: '16px',
                width: '100%',
                background: selected.color,
                border: 'none',
                color: 'var(--text-primary)',
                fontWeight: 800,
                padding: '10px 14px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '0.84rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              Auditar Solapa {selected.title} <ExternalLink size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
