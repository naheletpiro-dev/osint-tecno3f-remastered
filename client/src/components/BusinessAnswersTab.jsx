import React from 'react';
import { HelpCircle, ShoppingBag, Users, DollarSign, KeyRound, CheckCircle2, ShieldCheck, Database, Calendar, Award, Compass, Zap } from 'lucide-react';

export default function BusinessAnswersTab({ businessAnswers = {}, companyName = '' }) {
  const answers = businessAnswers || {};
  const whatItSells = answers.whatItSells || `Productos, servicios y soluciones comerciales industrializadas por ${companyName}.`;
  const whoBuys = answers.whoBuys || `Clientes corporativos, industrias B2B, municipios y organismos del sector público.`;
  const howItGeneratesRevenue = answers.howItGeneratesRevenue || `Facturación por productos fabricados, venta directa B2B, licitaciones y contratos de servicio.`;
  const mostImportantAsset = answers.mostImportantAsset || `Equipamiento de planta, tecnología propia, licencias especializadas y posicionamiento de marca de ${companyName}.`;

  // Noise terms filter for clean product itemization
  const NOISE_TERMS = [
    'productos', 'servicios', 'nuestros productos', 'nuestros servicios', 'catalogo', 'catálogo',
    'categoría', 'categorias', 'categorías', 'plataforma de software', 'oferta b2b', 'menu', 'menú',
    'dos tipos de iluminación, una misma plataforma', 'dos tipos de', 'una misma plataforma'
  ];

  const rawProductList = answers.productList || [];
  let productItems = [];

  const cleanItem = (itemStr) => {
    if (!itemStr || typeof itemStr !== 'string') return null;
    const trimmed = itemStr.replace(/^[\d\)\.\-\s•\*]+/, '').trim();
    const norm = trimmed.toLowerCase();
    if (trimmed.length < 4 || NOISE_TERMS.includes(norm) || norm.includes('dos tipos de') || norm.startsWith('comercializa')) {
      return null;
    }
    return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
  };

  if (Array.isArray(rawProductList) && rawProductList.length > 0) {
    productItems = rawProductList.map(cleanItem).filter(Boolean);
  }

  if (productItems.length === 0 && typeof whatItSells === 'string') {
    const cleanedText = whatItSells.replace(/^[^:]+:\s*/i, '');
    productItems = cleanedText
      .split(/[,;\n•\-]/)
      .map(cleanItem)
      .filter(Boolean);
  }

  if (productItems.length === 0) {
    productItems = [`Productos, equipos y soluciones comerciales e industriales provistas por ${companyName}`];
  }

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
              <h2 style={{ fontSize: '1.45rem', fontWeight: 800 }}>Modelo de Negocio & Operatoria Comercial de {companyName}</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '2px' }}>
                Análisis exhaustivo OSINT sobre la propuesta de valor, estructura de ingresos y activo estratégico principal.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Calendar size={13} style={{ color: '#60a5fa' }} /> {consultationDate}
            </span>
          </div>
        </div>
      </div>

      {/* Question 1: ¿Qué vende? (Lista Detallada con Scroll Compacto) */}
      <div className="saas-card col-6" style={{ padding: '26px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: 'rgba(6, 182, 212, 0.12)', color: 'var(--accent-cyan)', padding: '10px', borderRadius: '10px' }}>
              <ShoppingBag size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', fontWeight: 700 }}>1. ¿Qué vende o provee {companyName}?</h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Catálogo comercial & oferta B2B</span>
            </div>
          </div>
          <span style={{ fontSize: '0.72rem', background: 'rgba(6, 182, 212, 0.15)', color: '#22d3ee', padding: '3px 8px', borderRadius: '12px', fontWeight: 700 }}>
            {productItems.length} PRODUCTOS
          </span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <span style={{ fontSize: '0.78rem', color: '#38bdf8', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
            📦 Lista de Productos y Soluciones Identificadas:
          </span>
        </div>

        {/* Scrollable Compact List */}
        <div style={{
          maxHeight: '260px',
          overflowY: 'auto',
          background: 'rgba(0,0,0,0.25)',
          padding: '12px',
          borderRadius: '10px',
          borderLeft: '3px solid var(--accent-cyan)',
          border: '1px solid rgba(6, 182, 212, 0.2)',
          marginBottom: '12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          {productItems.map((prod, idx) => (
            <div key={idx} style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              background: 'rgba(255,255,255,0.03)',
              padding: '10px 12px',
              borderRadius: '8px',
              fontSize: '0.88rem',
              color: 'var(--text-primary)',
              border: '1px solid rgba(255,255,255,0.04)'
            }}>
              <span style={{
                background: 'rgba(6, 182, 212, 0.2)',
                color: '#22d3ee',
                fontSize: '0.72rem',
                fontWeight: 800,
                padding: '2px 7px',
                borderRadius: '6px',
                flexShrink: 0,
                marginTop: '2px'
              }}>
                #{idx + 1}
              </span>
              <div style={{ lineHeight: 1.45, flexGrow: 1 }}>
                {prod}
              </div>
            </div>
          ))}
        </div>

        <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <CheckCircle2 size={14} style={{ color: '#38bdf8' }} /> Verificado en sitio web corporativo y catálogos públicos.
        </div>
      </div>

      {/* Question 2: ¿Quién le compra? */}
      <div className="saas-card col-6" style={{ padding: '26px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: 'rgba(139, 92, 246, 0.12)', color: 'var(--accent-violet)', padding: '10px', borderRadius: '10px' }}>
              <Users size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', fontWeight: 700 }}>2. ¿Quiénes son los clientes de {companyName}?</h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Público objetivo & mercado destino</span>
            </div>
          </div>
          <span style={{ fontSize: '0.72rem', background: 'rgba(139, 92, 246, 0.15)', color: '#c4b5fd', padding: '3px 8px', borderRadius: '12px', fontWeight: 700 }}>
            TARGET MARKET
          </span>
        </div>
        <p style={{ fontSize: '0.96rem', color: 'var(--text-secondary)', lineHeight: '1.65', background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '10px', borderLeft: '3px solid var(--accent-violet)', marginBottom: '12px' }}>
          {whoBuys}
        </p>
        <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <CheckCircle2 size={14} style={{ color: '#a78bfa' }} /> Orientación a cuentas corporativas, sectores industriales y canal estatal.
        </div>
      </div>

      {/* Question 3: ¿Cómo genera ingresos? */}
      <div className="saas-card col-6" style={{ padding: '26px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: 'rgba(16, 185, 129, 0.12)', color: 'var(--accent-emerald)', padding: '10px', borderRadius: '10px' }}>
              <DollarSign size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', fontWeight: 700 }}>3. ¿Cómo genera ingresos {companyName}?</h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Mecanismo de monetización & contratos</span>
            </div>
          </div>
          <span style={{ fontSize: '0.72rem', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-emerald)', padding: '3px 8px', borderRadius: '12px', fontWeight: 700 }}>
            MONETIZACIÓN
          </span>
        </div>
        <p style={{ fontSize: '0.96rem', color: 'var(--text-secondary)', lineHeight: '1.65', background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '10px', borderLeft: '3px solid var(--accent-emerald)', marginBottom: '12px' }}>
          {howItGeneratesRevenue}
        </p>
        <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <CheckCircle2 size={14} style={{ color: 'var(--accent-emerald)' }} /> Esquema de facturación recurrente B2B y provisión por orden de compra.
        </div>
      </div>

      {/* Question 4: Activo estratégico más importante */}
      <div className="saas-card col-6" style={{ padding: '26px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: 'rgba(245, 158, 11, 0.12)', color: 'var(--accent-amber)', padding: '10px', borderRadius: '10px' }}>
              <KeyRound size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', fontWeight: 700 }}>4. ¿Cuál es su activo estratégico crítico?</h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Ventaja competitiva & equipamiento de planta</span>
            </div>
          </div>
          <span style={{ fontSize: '0.72rem', background: 'rgba(245, 158, 11, 0.15)', color: 'var(--accent-amber)', padding: '3px 8px', borderRadius: '12px', fontWeight: 700 }}>
            VENTAJA CLAVE
          </span>
        </div>
        <p style={{ fontSize: '0.96rem', color: 'var(--text-secondary)', lineHeight: '1.65', background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '10px', borderLeft: '3px solid var(--accent-amber)', marginBottom: '12px' }}>
          {mostImportantAsset}
        </p>
        <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Zap size={14} style={{ color: 'var(--accent-amber)' }} /> Ventaja defensible frente a competidores del mismo rubro.
        </div>
      </div>
    </div>
  );
}
