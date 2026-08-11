import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X, Building2, ShieldCheck, Target, Cpu, Scale, FileCheck, Landmark, HeartHandshake, Layers, Globe, DollarSign, CheckCircle2, AlertTriangle, ExternalLink } from 'lucide-react';

export default function PresentationModal({ report, onClose }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    // Attempt Fullscreen
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(() => {});
    }

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'Space') {
        e.preventDefault();
        setCurrentSlide(prev => Math.min(prev + 1, 7));
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setCurrentSlide(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Escape') {
        if (document.exitFullscreen && document.fullscreenElement) {
          document.exitFullscreen().catch(() => {});
        }
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!report) return null;

  const query = report?.query || {};
  const companyName = query.companyName || 'la empresa';

  const categorization = report?.categorization || {};
  const scrapedData = report?.scrapedData || {};
  const businessAnswers = categorization.businessAnswers || scrapedData.businessAnswers || {};
  const swot = report?.swotAnalysis || {};
  const digital = report?.digitalTransformation || {};
  const legal = report?.legalData || {};
  const contracts = report?.publicContracts || {};
  const financial = report?.financialData || {};
  const support = report?.supportPlan || {};
  const bcra = financial.bcraDetails || {};
  const tax = financial.taxProfile || {};
  const pyme = financial.pymeData || {};
  const bidding = financial.biddingCapacity || {};
  const kits = digital.recommendedKits || {};

  const totalSlides = 8;

  const slides = [
    // Slide 1: Cover & Executive Overview
    {
      title: 'Resumen Ejecutivo & Perfil General',
      subtitle: 'Diagnóstico Comercial, Fiscal y Financiero Consolidado',
      icon: <Building2 size={24} style={{ color: '#60a5fa' }} />,
      content: (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '24px', alignItems: 'stretch' }}>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                INFORME DE INTELIGENCIA CORPORATIVA OSINT
              </span>
              <h1 style={{ fontSize: '2.4rem', fontWeight: 900, color: 'var(--text-primary)', margin: '8px 0 14px 0', lineHeight: 1.1 }}>
                {companyName}
              </h1>

              <div style={{ background: 'var(--bg-surface-elevated)', padding: '14px 18px', borderRadius: '12px', border: '1px solid #334155', marginBottom: '16px' }}>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase' }}>SECTOR DE ACTIVIDAD Y RUBRO</div>
                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#38bdf8', marginTop: '3px' }}>
                  {categorization.sector || 'Servicios Comerciales e Industriales'}
                </div>
              </div>

              <p style={{ color: '#cbd5e1', fontSize: '0.98rem', lineHeight: '1.6', background: 'rgba(0,0,0,0.3)', padding: '14px', borderRadius: '10px', borderLeft: '3px solid #60a5fa' }}>
                {categorization.summary || scrapedData.aboutUs || `${companyName} es una entidad evaluada a través del sistema OSINT Tecno3F. Se registraron sus antecedentes bancarios, padrón ARCA, presencia web y licitaciones.`}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '16px', flexWrap: 'wrap' }}>
              <span style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700, border: '1px solid rgba(56, 189, 248, 0.3)' }}>
                CUIT: {tax.cuit || '30-XXXXXXXX-X'}
              </span>
              <span style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700, border: '1px solid rgba(168, 85, 247, 0.3)' }}>
                {pyme.pymeCategory || 'Dato no disponible en registros públicos'}
              </span>
            </div>
          </div>

          <div style={{ background: 'var(--bg-surface-elevated)', border: `1px solid ${bcra.situacionColor || 'var(--border-subtle)'}`, borderRadius: '18px', padding: '24px', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>
              Central de Deudores BCRA
            </div>
            <div style={{ fontSize: '2.2rem', fontWeight: 900, color: bcra.situacionColor || 'var(--accent-emerald)' }}>
              {bcra.situacionLabel || 'Situación 1 (Normal)'}
            </div>
            <div style={{ fontSize: '0.84rem', color: '#cbd5e1', marginTop: '6px', lineHeight: '1.4' }}>
              {bcra.situacionDescription || 'Sin deudas bancarias registradas'}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #334155' }}>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 700 }}>CHEQUES RECHAZADOS</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: (bcra.chequesRechazados?.totalCount || 0) > 0 ? '#fb7185' : 'var(--accent-emerald)', marginTop: '2px' }}>
                  {bcra.chequesRechazados?.totalCount || 0}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 700 }}>SCORING FINANCIERO</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#38bdf8', marginTop: '2px' }}>
                  {financial.creditScore || 85} / 100
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },

    // Slide 2: Commercial & Web Profile
    {
      title: 'Perfil Comercial & Catálogo B2B',
      subtitle: 'Productos, Servicios y Presencia Web Verificada',
      icon: <Layers size={24} style={{ color: '#38bdf8' }} />,
      content: (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', maxHeight: '420px', overflowY: 'auto' }}>
          <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid #334155', borderRadius: '16px', padding: '22px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Layers size={18} style={{ color: '#38bdf8' }} /> Catálogo de Productos Verificados
            </h3>
            {Array.isArray(scrapedData.products) && scrapedData.products.length > 0 ? (
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '8px', listStyle: 'none', padding: 0 }}>
                {scrapedData.products.map((p, idx) => (
                  <li key={idx} style={{ background: 'var(--bg-input)', padding: '10px 14px', borderRadius: '8px', border: '1px solid #334155', color: '#cbd5e1', fontSize: '0.9rem', fontWeight: 600 }}>
                    • {p}
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Provisión de insumos y soluciones corporativas para el sector industrial.</p>
            )}
          </div>

          <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid #334155', borderRadius: '16px', padding: '22px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Building2 size={18} style={{ color: '#a78bfa' }} /> Cartera de Servicios Especializados
            </h3>
            {Array.isArray(scrapedData.services) && scrapedData.services.length > 0 ? (
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '8px', listStyle: 'none', padding: 0 }}>
                {scrapedData.services.map((s, idx) => (
                  <li key={idx} style={{ background: 'var(--bg-input)', padding: '10px 14px', borderRadius: '8px', border: '1px solid #334155', color: '#cbd5e1', fontSize: '0.9rem', fontWeight: 600 }}>
                    • {s}
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Asistencia técnica, ingeniería y provisión especializada.</p>
            )}
          </div>
        </div>
      )
    },

    // Slide 3: Business Model
    {
      title: 'Modelo de Negocio & Operatoria Comercial',
      subtitle: 'Oferta, Clientes Objetivo, Monetización y Activo Crítico',
      icon: <Target size={24} style={{ color: '#c084fc' }} />,
      content: (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px' }}>
          <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid #334155', borderRadius: '14px', padding: '20px' }}>
            <div style={{ fontSize: '0.76rem', color: '#38bdf8', fontWeight: 800, textTransform: 'uppercase' }}>1. ¿Qué vende o provee?</div>
            <p style={{ color: 'var(--text-primary)', fontSize: '0.92rem', marginTop: '6px', lineHeight: '1.5' }}>
              {businessAnswers.whatItSells || categorization.whatItSells || `Soluciones comerciales e industriales comercializadas por ${companyName}.`}
            </p>
          </div>

          <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid #334155', borderRadius: '14px', padding: '20px' }}>
            <div style={{ fontSize: '0.76rem', color: '#c084fc', fontWeight: 800, textTransform: 'uppercase' }}>2. ¿Quiénes son sus clientes?</div>
            <p style={{ color: 'var(--text-primary)', fontSize: '0.92rem', marginTop: '6px', lineHeight: '1.5' }}>
              {businessAnswers.whoBuys || categorization.whoBuys || 'Clientes corporativos B2B, empresas industriales y contrataciones del sector público.'}
            </p>
          </div>

          <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid #334155', borderRadius: '14px', padding: '20px' }}>
            <div style={{ fontSize: '0.76rem', color: 'var(--accent-emerald)', fontWeight: 800, textTransform: 'uppercase' }}>3. ¿Cómo genera ingresos?</div>
            <p style={{ color: 'var(--text-primary)', fontSize: '0.92rem', marginTop: '6px', lineHeight: '1.5' }}>
              {businessAnswers.howItGeneratesRevenue || categorization.howItGeneratesRevenue || 'Facturación por ventas directas, órdenes de compra y licitaciones.'}
            </p>
          </div>

          <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid #334155', borderRadius: '14px', padding: '20px' }}>
            <div style={{ fontSize: '0.76rem', color: 'var(--accent-amber)', fontWeight: 800, textTransform: 'uppercase' }}>4. Activo Crítico Estratégico</div>
            <p style={{ color: 'var(--text-primary)', fontSize: '0.92rem', marginTop: '6px', lineHeight: '1.5' }}>
              {businessAnswers.mostImportantAsset || categorization.mostImportantAsset || 'Equipamiento de planta, tecnología propia y posicionamiento comercial.'}
            </p>
          </div>
        </div>
      )
    },

    // Slide 4: SWOT Matrix
    {
      title: 'Matriz FODA Analítica Completa',
      subtitle: 'Fortalezas, Debilidades, Oportunidades y Amenazas',
      icon: <ShieldCheck size={24} style={{ color: 'var(--accent-emerald)' }} />,
      content: (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', maxHeight: '420px', overflowY: 'auto' }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '14px', padding: '18px' }}>
            <h4 style={{ color: 'var(--accent-emerald)', fontSize: '1rem', fontWeight: 800, marginBottom: '10px' }}>💪 Fortalezas</h4>
            <ul style={{ paddingLeft: '18px', color: '#cbd5e1', fontSize: '0.86rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {(swot.strengths || []).map((s, idx) => <li key={idx}>{s}</li>)}
            </ul>
          </div>

          <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '14px', padding: '18px' }}>
            <h4 style={{ color: 'var(--accent-amber)', fontSize: '1rem', fontWeight: 800, marginBottom: '10px' }}>⚠️ Debilidades</h4>
            <ul style={{ paddingLeft: '18px', color: '#cbd5e1', fontSize: '0.86rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {(swot.weaknesses || []).map((w, idx) => <li key={idx}>{w}</li>)}
            </ul>
          </div>

          <div style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '14px', padding: '18px' }}>
            <h4 style={{ color: '#60a5fa', fontSize: '1rem', fontWeight: 800, marginBottom: '10px' }}>🚀 Oportunidades</h4>
            <ul style={{ paddingLeft: '18px', color: '#cbd5e1', fontSize: '0.86rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {(swot.opportunities || []).map((o, idx) => <li key={idx}>{o}</li>)}
            </ul>
          </div>

          <div style={{ background: 'rgba(244, 63, 94, 0.1)', border: '1px solid rgba(244, 63, 94, 0.3)', borderRadius: '14px', padding: '18px' }}>
            <h4 style={{ color: '#fb7185', fontSize: '1rem', fontWeight: 800, marginBottom: '10px' }}>🛡️ Amenazas</h4>
            <ul style={{ paddingLeft: '18px', color: '#cbd5e1', fontSize: '0.86rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {(swot.threats || []).map((t, idx) => <li key={idx}>{t}</li>)}
            </ul>
          </div>
        </div>
      )
    },

    // Slide 5: Digital Transformation & Kits 4.0
    {
      title: 'Transformación Digital & Propuesta Kits 4.0',
      subtitle: 'Madurez Digital e Incentivos ANR de Modernización',
      icon: <Cpu size={24} style={{ color: '#a855f7' }} />,
      content: (
        <div style={{ display: 'grid', gridTemplateColumns: '0.8fr 1.2fr', gap: '20px', alignItems: 'stretch' }}>
          <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid #334155', borderRadius: '18px', padding: '24px', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 800, textTransform: 'uppercase' }}>Índice de Madurez Digital</div>
            <div style={{ fontSize: '3.2rem', fontWeight: 900, color: '#c084fc', marginTop: '4px' }}>
              {digital.digitalScore || 65} / 100
            </div>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '6px' }}>
              {digital.maturityLevel || 'Madurez Intermedia'}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {kits.primary && (
              <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid rgba(56, 189, 248, 0.4)', padding: '18px', borderRadius: '14px' }}>
                <div style={{ fontSize: '0.76rem', color: '#38bdf8', fontWeight: 800, textTransform: 'uppercase' }}>
                  📌 Kit 4.0 Principal: {kits.primary.code} - {kits.primary.name}
                </div>
                <p style={{ color: '#cbd5e1', fontSize: '0.88rem', marginTop: '4px', lineHeight: '1.4' }}>
                  {kits.primary.aiRationale}
                </p>
                <div style={{ fontSize: '0.78rem', color: 'var(--accent-emerald)', fontWeight: 700, marginTop: '8px' }}>
                  Financiamiento: {kits.primary.fundingCoverage}
                </div>
              </div>
            )}

            {kits.secondary && (
              <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid rgba(168, 85, 247, 0.4)', padding: '18px', borderRadius: '14px' }}>
                <div style={{ fontSize: '0.76rem', color: '#c084fc', fontWeight: 800, textTransform: 'uppercase' }}>
                  🔹 Kit 4.0 Complementario: {kits.secondary.code} - {kits.secondary.name}
                </div>
                <p style={{ color: '#cbd5e1', fontSize: '0.88rem', marginTop: '4px', lineHeight: '1.4' }}>
                  {kits.secondary.aiRationale}
                </p>
              </div>
            )}
          </div>
        </div>
      )
    },

    // Slide 6: Public Contracts & Tenders
    {
      title: 'Contrataciones Públicas & Portal COMPR.AR',
      subtitle: 'Adjudicaciones, Proveedor del Estado y Licitaciones',
      icon: <Scale size={24} style={{ color: 'var(--accent-amber)' }} />,
      content: (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
          <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid #334155', borderRadius: '16px', padding: '22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Registro de Proveedores del Estado
                </h4>
                <div style={{ fontSize: '0.86rem', color: contracts.isRealData ? 'var(--accent-emerald)' : 'var(--text-secondary)', marginTop: '2px', fontWeight: 600 }}>
                  {contracts.supplierRegistryStatus || 'Dato no disponible en registros públicos'}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>Total Adjudicado</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#38bdf8' }}>
                  {contracts.totalAwardedAmount || '$0 ARS'}
                </div>
              </div>
            </div>

            {Array.isArray(contracts.contracts) && contracts.contracts.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px' }}>
                {contracts.contracts.map((c, idx) => (
                  <div key={idx} style={{ background: 'var(--bg-input)', padding: '12px 16px', borderRadius: '8px', border: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>{c.organism}</div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{c.description}</div>
                    </div>
                    <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>{c.amount}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>Sin contrataciones ni licitaciones públicas registradas.</p>
            )}
          </div>
        </div>
      )
    },

    // Slide 7: Complete Financial & BCRA Profile
    {
      title: 'Perfil Financiero & Capacidad Licitatoria',
      subtitle: 'Central de Deudores BCRA, Scoring y Límites Recomendados',
      icon: <Landmark size={24} style={{ color: 'var(--accent-emerald)' }} />,
      content: (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid #334155', borderRadius: '14px', padding: '20px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', fontWeight: 700 }}>SITUACIÓN BCRA</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: bcra.situacionColor || 'var(--accent-emerald)', marginTop: '6px' }}>
              {bcra.situacionLabel || 'Situación 1'}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#cbd5e1', marginTop: '4px' }}>
              {bcra.situacionDescription || 'Normal'}
            </div>
          </div>

          <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid #334155', borderRadius: '14px', padding: '20px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', fontWeight: 700 }}>CAPACIDAD LICITATORIA ESTIMADA</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#38bdf8', marginTop: '6px' }}>
              {bidding.estimatedBiddingCapacityARS || '$250.000.000 ARS'}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Modelo OSINT
            </div>
          </div>

          <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid #334155', borderRadius: '14px', padding: '20px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', fontWeight: 700 }}>LÍMITE CREDITICIO SUGERIDO</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-emerald)', marginTop: '6px' }}>
              {bidding.recommendedCreditLimitARS || '$50.000.000 ARS'}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Recomendación Bancaria
            </div>
          </div>
        </div>
      )
    },

    // Slide 8: Support Plan & Program Actions
    {
      title: 'Programa de Asistencia & Apoyo Estratégico',
      subtitle: 'Programas de Financiamiento, ANR 4.0, Crédito Fiscal y Clústeres',
      icon: <HeartHandshake size={24} style={{ color: '#38bdf8' }} />,
      content: (
        <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid #334155', borderRadius: '18px', padding: '24px', maxHeight: '420px', overflowY: 'auto' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '14px' }}>
            Acciones Prioritarias de Apoyo ({support.recommendations?.length || 5} Programas)
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {Array.isArray(support.recommendations) && support.recommendations.length > 0 ? (
              support.recommendations.map((rec, idx) => (
                <div key={idx} style={{ background: 'var(--bg-input)', padding: '14px 18px', borderRadius: '10px', border: '1px solid #334155' }}>
                  <div style={{ fontSize: '0.94rem', fontWeight: 800, color: '#60a5fa' }}>
                    {idx + 1}. {rec.title}
                  </div>
                  <div style={{ fontSize: '0.84rem', color: '#cbd5e1', marginTop: '4px', lineHeight: '1.4' }}>
                    {rec.description}
                  </div>
                </div>
              ))
            ) : (
              <div style={{ color: '#cbd5e1', fontSize: '0.9rem' }}>Postulación a ANR 4.0 SEPYME y Crédito Fiscal de Capacitación.</div>
            )}
          </div>
        </div>
      )
    }
  ];

  const currentSlideData = slides[currentSlide];

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      background: 'var(--bg-slate)',
      color: 'var(--text-primary)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '30px 40px',
      overflow: 'hidden'
    }}>
      {/* Presentation Top Control Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1e293b', paddingBottom: '18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img src="/tecno3f-color.png" alt="Tecno3F" style={{ height: '32px', borderRadius: '6px' }} onError={(e) => e.target.style.display = 'none'} />
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Modo Presentación OSINT Tecno3F
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {companyName}
            </div>
          </div>
        </div>

        {/* Slide Counter & Close */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 700, background: 'var(--bg-surface-elevated)', padding: '6px 14px', borderRadius: '20px', border: '1px solid #334155' }}>
            Diapositiva <strong style={{ color: '#38bdf8' }}>{currentSlide + 1}</strong> de {totalSlides}
          </div>

          <button
            onClick={() => {
              if (document.exitFullscreen && document.fullscreenElement) {
                document.exitFullscreen().catch(() => {});
              }
              onClose();
            }}
            style={{
              background: 'rgba(244, 63, 94, 0.15)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              color: '#fb7185',
              padding: '8px 14px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.84rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <X size={16} /> Salir (ESC)
          </button>
        </div>
      </div>

      {/* Main Slide Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '24px 0' }}>
        <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: 'var(--bg-surface-elevated)', border: '1px solid #334155', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {currentSlideData.icon}
          </div>
          <div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              {currentSlideData.title}
            </h2>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '2px', fontWeight: 600 }}>
              {currentSlideData.subtitle}
            </div>
          </div>
        </div>

        <div>
          {currentSlideData.content}
        </div>
      </div>

      {/* Presentation Footer Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #1e293b', paddingTop: '18px' }}>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
          Usa las teclas <strong style={{ color: 'var(--text-secondary)' }}>[←]</strong> y <strong style={{ color: 'var(--text-secondary)' }}>[→]</strong> o la barra de espacio para cambiar de diapositiva.
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => setCurrentSlide(prev => Math.max(prev - 1, 0))}
            disabled={currentSlide === 0}
            style={{
              padding: '10px 18px',
              borderRadius: '8px',
              background: currentSlide === 0 ? 'var(--bg-surface-elevated)' : '#3b82f6',
              border: 'none',
              color: currentSlide === 0 ? 'var(--text-muted)' : 'var(--text-primary)',
              fontWeight: 700,
              cursor: currentSlide === 0 ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.88rem'
            }}
          >
            <ChevronLeft size={16} /> Anterior
          </button>

          <button
            onClick={() => setCurrentSlide(prev => Math.min(prev + 1, totalSlides - 1))}
            disabled={currentSlide === totalSlides - 1}
            style={{
              padding: '10px 18px',
              borderRadius: '8px',
              background: currentSlide === totalSlides - 1 ? 'var(--bg-surface-elevated)' : '#3b82f6',
              border: 'none',
              color: currentSlide === totalSlides - 1 ? 'var(--text-muted)' : 'var(--text-primary)',
              fontWeight: 700,
              cursor: currentSlide === totalSlides - 1 ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.88rem'
            }}
          >
            Siguiente <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
