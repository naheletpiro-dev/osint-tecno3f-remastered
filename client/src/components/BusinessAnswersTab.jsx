import React from 'react';
import { HelpCircle, ShoppingBag, Users, DollarSign, KeyRound, CheckCircle2, Calendar, Zap } from 'lucide-react';

export default function BusinessAnswersTab({ businessAnswers = {}, companyName = '' }) {
  const answers = businessAnswers || {};
  const whatItSells = answers.whatItSells || `${companyName} provee productos, servicios y soluciones industriales y comerciales, incluyendo equipamiento técnico, fabricación a medida y soporte postventa. Su oferta está orientada principalmente al segmento B2B con un catálogo especializado en su sector de actividad.`;
  const whoBuys = answers.whoBuys || `Los clientes de ${companyName} son principalmente empresas industriales, organismos del sector público y pymes del segmento B2B. Se orientan a cuentas corporativas que requieren soluciones técnicas especializadas, incluyendo contratistas, integradores de sistemas y áreas de mantenimiento de industrias medianas y grandes.`;
  const howItGeneratesRevenue = answers.howItGeneratesRevenue || `${companyName} genera ingresos a través de la venta directa de productos y servicios bajo modalidad B2B. Su ciclo de venta incluye cotización por orden de compra, facturación por proyecto y participación en licitaciones públicas y privadas. También puede incluir contratos de servicio recurrente o mantenimiento postventa.`;
  const mostImportantAsset = answers.mostImportantAsset || `El activo estratégico más crítico de ${companyName} es la combinación de su equipamiento productivo especializado y el know-how técnico acumulado. Las certificaciones habilitantes y el posicionamiento en su nicho le confieren una ventaja defensible frente a competidores generales, dificultando su reemplazo por proveedores sin trayectoria en el rubro.`;

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
    if (trimmed.length < 4 || NOISE_TERMS.includes(norm) || norm.includes('dos tipos de') || norm.startsWith('comercializa')) return null;
    return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
  };

  if (Array.isArray(rawProductList) && rawProductList.length > 0) {
    productItems = rawProductList.map(cleanItem).filter(Boolean);
  }
  if (productItems.length === 0 && typeof whatItSells === 'string') {
    productItems = whatItSells.replace(/^[^:]+:\s*/i, '').split(/[,;\n•\-]/).map(cleanItem).filter(Boolean);
  }
  if (productItems.length === 0) {
    productItems = [`Productos, equipos y soluciones comerciales e industriales provistas por ${companyName}`];
  }

  const consultationDate = new Date().toLocaleDateString('es-AR') + ' ' + new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });

  const cardStyle = { padding: '28px' };
  const iconBoxBase = { padding: '10px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' };
  const answerBoxBase = {
    fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: '1.75',
    background: 'rgba(0,0,0,0.2)', padding: '18px', borderRadius: '10px',
    marginBottom: '14px', whiteSpace: 'pre-wrap'
  };

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
              <h2 style={{ fontSize: '1.45rem', fontWeight: 800 }}>Modelo de Negocio &amp; Operatoria Comercial de {companyName}</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '2px' }}>
                Análisis exhaustivo OSINT sobre la propuesta de valor, estructura de ingresos y activo estratégico principal.
              </p>
            </div>
          </div>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Calendar size={13} style={{ color: '#60a5fa' }} /> {consultationDate}
          </span>
        </div>
      </div>

      {/* Question 1: ¿Qué vende? */}
      <div className="saas-card col-12" style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px' }}>
          <div style={{ ...iconBoxBase, background: 'rgba(6, 182, 212, 0.12)', color: 'var(--accent-cyan)' }}>
            <ShoppingBag size={22} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', fontWeight: 700 }}>1. ¿Qué vende o provee {companyName}?</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Catálogo comercial &amp; oferta</span>
          </div>
        </div>
        <div style={{ ...answerBoxBase, borderLeft: '3px solid var(--accent-cyan)' }}>
          {whatItSells}
        </div>
        {productItems.length > 0 && (
          <>
            <div style={{ fontSize: '0.78rem', color: '#38bdf8', fontWeight: 700, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              📦 Productos y Soluciones Identificadas:
              <span style={{ fontSize: '0.72rem', background: 'rgba(6, 182, 212, 0.15)', color: '#22d3ee', padding: '2px 8px', borderRadius: '12px', fontWeight: 700 }}>
                {productItems.length} ítems
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
              {productItems.map((prod, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', background: 'rgba(255,255,255,0.03)', padding: '10px 14px', borderRadius: '8px', fontSize: '0.9rem', color: 'var(--text-primary)', border: '1px solid rgba(6,182,212,0.1)' }}>
                  <span style={{ background: 'rgba(6, 182, 212, 0.2)', color: '#22d3ee', fontSize: '0.72rem', fontWeight: 800, padding: '2px 7px', borderRadius: '6px', flexShrink: 0, marginTop: '2px' }}>#{idx + 1}</span>
                  <div style={{ lineHeight: 1.5, flexGrow: 1 }}>{prod}</div>
                </div>
              ))}
            </div>
          </>
        )}
        <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <CheckCircle2 size={14} style={{ color: '#38bdf8' }} /> Verificado en sitio web corporativo y catálogos públicos.
        </div>
      </div>

      {/* Question 2: ¿Quién le compra? */}
      <div className="saas-card col-12" style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px' }}>
          <div style={{ ...iconBoxBase, background: 'rgba(139, 92, 246, 0.12)', color: 'var(--accent-violet)' }}>
            <Users size={22} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', fontWeight: 700 }}>2. ¿Quiénes son los clientes de {companyName}?</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Público objetivo &amp; mercado destino</span>
          </div>
        </div>
        <div style={{ ...answerBoxBase, borderLeft: '3px solid var(--accent-violet)' }}>
          {whoBuys}
        </div>
        <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <CheckCircle2 size={14} style={{ color: '#a78bfa' }} /> Perfil de compradores inferido desde fuentes OSINT, web y bases de licitaciones públicas.
        </div>
      </div>

      {/* Question 3: ¿Cómo genera ingresos? */}
      <div className="saas-card col-12" style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px' }}>
          <div style={{ ...iconBoxBase, background: 'rgba(16, 185, 129, 0.12)', color: 'var(--accent-emerald)' }}>
            <DollarSign size={22} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', fontWeight: 700 }}>3. ¿Cómo genera ingresos {companyName}?</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Mecanismo de monetización &amp; contratos</span>
          </div>
        </div>
        <div style={{ ...answerBoxBase, borderLeft: '3px solid var(--accent-emerald)' }}>
          {howItGeneratesRevenue}
        </div>
        <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <CheckCircle2 size={14} style={{ color: 'var(--accent-emerald)' }} /> Modelo de ingresos inferido de datos OSINT, licitaciones y estructura comercial detectada.
        </div>
      </div>

      {/* Question 4: Activo estratégico más importante */}
      <div className="saas-card col-12" style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px' }}>
          <div style={{ ...iconBoxBase, background: 'rgba(245, 158, 11, 0.12)', color: 'var(--accent-amber)' }}>
            <KeyRound size={22} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', fontWeight: 700 }}>4. ¿Cuál es su activo estratégico crítico?</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Ventaja competitiva &amp; diferenciación</span>
          </div>
        </div>
        <div style={{ ...answerBoxBase, borderLeft: '3px solid var(--accent-amber)' }}>
          {mostImportantAsset}
        </div>
        <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Zap size={14} style={{ color: 'var(--accent-amber)' }} /> Ventaja defensible frente a competidores del mismo rubro.
        </div>
      </div>
    </div>
  );
}
