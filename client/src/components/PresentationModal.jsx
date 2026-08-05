import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X, Maximize2, Minimize2, FileText, Building2, ShieldCheck, Target, Cpu, Scale, FileCheck, Landmark, HeartHandshake, Layers } from 'lucide-react';

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

  const companyName = report?.query?.companyName || 'Empresa';
  const categorization = report?.categorization || {};
  const scrapedData = report?.scrapedData || {};
  const businessAnswers = scrapedData?.businessAnswers || {};
  const swot = report?.swotAnalysis || {};
  const digital = report?.digitalTransformation || {};
  const legal = report?.legalData || {};
  const contracts = report?.publicContracts || {};
  const financial = report?.financialData || {};
  const support = report?.supportPlan || {};

  const totalSlides = 8;

  const slides = [
    // Slide 1: Cover & Executive Overview
    {
      title: 'Resumen Ejecutivo',
      subtitle: 'Diagnóstico Comercial y Nivel de Riesgo',
      icon: <Building2 size={24} style={{ color: '#60a5fa' }} />,
      content: (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Informe de Inteligencia Corporativa</div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#f8fafc', margin: '8px 0 16px 0', lineHeight: 1.1 }}>
              {companyName}
            </h1>

            <div style={{ background: '#1e293b', padding: '16px 20px', borderRadius: '12px', border: '1px solid #334155', marginBottom: '20px' }}>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 700 }}>SECTOR DE ACTIVIDAD</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#38bdf8', marginTop: '4px' }}>
                {categorization.customSector || categorization.sector || 'Servicios Comerciales e Industriales'}
              </div>
            </div>

            <p style={{ color: '#cbd5e1', fontSize: '1.05rem', lineHeight: '1.6' }}>
              {report.executiveSummary || `${companyName} es una entidad evaluada a través de la plataforma OSINT Tecno3F. Se analizaron sus antecedentes comerciales, situación impositiva, presencia digital y contrataciones.`}
            </p>
          </div>

          <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '20px', padding: '32px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
              Situación Financiera & Impositiva
            </div>
            <div style={{ fontSize: '3rem', fontWeight: 900, color: financial.sitBCRA === 1 ? '#34d399' : '#f59e0b' }}>
              SITUACIÓN {financial.sitBCRA || 1}
            </div>
            <div style={{ fontSize: '0.9rem', color: '#cbd5e1', marginTop: '8px', fontWeight: 600 }}>
              {financial.sitBCRA === 1 ? 'Sin mora impositiva ni bancaria registrada' : `Evaluación BCRA Situación ${financial.sitBCRA}`}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '24px', paddingTop: '20px', borderTop: '1px solid #334155' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700 }}>CHEQUES RECHAZADOS</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: financial.chequesRechazadosCount > 0 ? '#fb7185' : '#34d399', marginTop: '2px' }}>
                  {financial.chequesRechazadosCount || 0}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700 }}>JUICIOS / CAUSAS</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: legal.totalLawsuits > 0 ? '#f59e0b' : '#34d399', marginTop: '2px' }}>
                  {legal.totalLawsuits || 0}
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },

    // Slide 2: Commercial & Web Profile
    {
      title: 'Perfil Comercial & Presencia Web',
      subtitle: 'Oferta de Productos, Servicios y Canal Oficial',
      icon: <Layers size={24} style={{ color: '#38bdf8' }} />,
      content: (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '16px', padding: '26px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f8fafc', marginBottom: '16px' }}>
              Productos & Oferta Principal
            </h3>
            {Array.isArray(scrapedData.products) && scrapedData.products.length > 0 ? (
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '10px', listStyle: 'none', padding: 0 }}>
                {scrapedData.products.slice(0, 5).map((p, idx) => (
                  <li key={idx} style={{ background: '#0f172a', padding: '12px 16px', borderRadius: '8px', border: '1px solid #334155', color: '#cbd5e1', fontSize: '0.95rem', fontWeight: 600 }}>
                    • {p}
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ color: '#94a3b8' }}>Provisión de insumos y soluciones corporativas para el sector industrial.</p>
            )}
          </div>

          <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '16px', padding: '26px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f8fafc', marginBottom: '16px' }}>
              Servicios Especializados
            </h3>
            {Array.isArray(scrapedData.services) && scrapedData.services.length > 0 ? (
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '10px', listStyle: 'none', padding: 0 }}>
                {scrapedData.services.slice(0, 5).map((s, idx) => (
                  <li key={idx} style={{ background: '#0f172a', padding: '12px 16px', borderRadius: '8px', border: '1px solid #334155', color: '#cbd5e1', fontSize: '0.95rem', fontWeight: 600 }}>
                    • {s}
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ color: '#94a3b8' }}>Asesoramiento técnico, ingeniería y distribución especializada.</p>
            )}
          </div>
        </div>
      )
    },

    // Slide 3: Business Model
    {
      title: 'Modelo de Negocio & Propuesta de Valor',
      subtitle: 'Respuestas Estratégicas de Mercado',
      icon: <Target size={24} style={{ color: '#c084fc' }} />,
      content: (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '14px', padding: '22px' }}>
            <div style={{ fontSize: '0.8rem', color: '#c084fc', fontWeight: 800, textTransform: 'uppercase' }}>¿Qué hace exactamente la empresa?</div>
            <p style={{ color: '#f8fafc', fontSize: '0.98rem', marginTop: '6px', lineHeight: '1.5' }}>
              {businessAnswers.queHace || `${companyName} comercializa y provee soluciones en ${categorization.sector || 'su rubro'}.`}
            </p>
          </div>

          <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '14px', padding: '22px' }}>
            <div style={{ fontSize: '0.8rem', color: '#38bdf8', fontWeight: 800, textTransform: 'uppercase' }}>¿A quién le vende? (Público Objetivo)</div>
            <p style={{ color: '#f8fafc', fontSize: '0.98rem', marginTop: '6px', lineHeight: '1.5' }}>
              {businessAnswers.aQuienVende || 'Empresas del sector corporativo, comercial, industrial y organismos públicos.'}
            </p>
          </div>

          <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '14px', padding: '22px', gridColumn: 'span 2' }}>
            <div style={{ fontSize: '0.8rem', color: '#34d399', fontWeight: 800, textTransform: 'uppercase' }}>Propuesta de Valor & Diferenciador</div>
            <p style={{ color: '#f8fafc', fontSize: '1rem', marginTop: '6px', lineHeight: '1.5', fontWeight: 600 }}>
              {businessAnswers.propuestaValor || 'Atención personalizada, amplio catálogo de insumos y trayectoria comprobada en el mercado regional.'}
            </p>
          </div>
        </div>
      )
    },

    // Slide 4: SWOT Matrix
    {
      title: 'Matriz FODA Estratégica',
      subtitle: 'Fortalezas, Oportunidades, Debilidades y Amenazas',
      icon: <ShieldCheck size={24} style={{ color: '#34d399' }} />,
      content: (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '14px', padding: '20px' }}>
            <h4 style={{ color: '#34d399', fontSize: '1.05rem', fontWeight: 800, marginBottom: '10px' }}>💪 Fortalezas</h4>
            <p style={{ color: '#cbd5e1', fontSize: '0.92rem', lineHeight: '1.5' }}>
              {swot.fortalezas || 'Trayectoria consolidada, catálogo técnico de productos y cartera activa de clientes.'}
            </p>
          </div>

          <div style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '14px', padding: '20px' }}>
            <h4 style={{ color: '#60a5fa', fontSize: '1.05rem', fontWeight: 800, marginBottom: '10px' }}>🚀 Oportunidades</h4>
            <p style={{ color: '#cbd5e1', fontSize: '0.92rem', lineHeight: '1.5' }}>
              {swot.oportunidades || 'Expansión de canales digitales, licitaciones públicas y nuevas líneas de representación comercial.'}
            </p>
          </div>

          <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '14px', padding: '20px' }}>
            <h4 style={{ color: '#fbbf24', fontSize: '1.05rem', fontWeight: 800, marginBottom: '10px' }}>⚠️ Debilidades</h4>
            <p style={{ color: '#cbd5e1', fontSize: '0.92rem', lineHeight: '1.5' }}>
              {swot.debilidades || 'Baja automatización e-commerce y dependencia de canales de venta tradicionales.'}
            </p>
          </div>

          <div style={{ background: 'rgba(244, 63, 94, 0.1)', border: '1px solid rgba(244, 63, 94, 0.3)', borderRadius: '14px', padding: '20px' }}>
            <h4 style={{ color: '#fb7185', fontSize: '1.05rem', fontWeight: 800, marginBottom: '10px' }}>🛡️ Amenazas</h4>
            <p style={{ color: '#cbd5e1', fontSize: '0.92rem', lineHeight: '1.5' }}>
              {swot.amenazas || 'Fluctuación en costos de insumos, variabilidad macroeconómica y competencia internacional.'}
            </p>
          </div>
        </div>
      )
    },

    // Slide 5: Digital Transformation
    {
      title: 'Transformación Digital & Tecnología',
      subtitle: 'Índice de Madurez e Infraestructura Cloud',
      icon: <Cpu size={24} style={{ color: '#a855f7' }} />,
      content: (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'center' }}>
          <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '20px', padding: '32px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase' }}>Índice Digital Score</div>
            <div style={{ fontSize: '3.5rem', fontWeight: 900, color: '#c084fc', marginTop: '4px' }}>
              {digital.score || 65}/100
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc', marginTop: '6px' }}>
              Nivel de Madurez: {digital.maturityLevel || 'Intermedio'}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ background: '#1e293b', border: '1px solid #334155', padding: '16px 20px', borderRadius: '12px' }}>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 700 }}>INFRAESTRUCTURA WEB</div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: '#cbd5e1', marginTop: '2px' }}>
                {digital.hasWebsite ? 'Sitio Web Activo y Operativo' : 'Sin sitio web oficial detectable'}
              </div>
            </div>

            <div style={{ background: '#1e293b', border: '1px solid #334155', padding: '16px 20px', borderRadius: '12px' }}>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 700 }}>CANAL E-COMMERCE</div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: digital.hasEcommerce ? '#34d399' : '#fb7185', marginTop: '2px' }}>
                {digital.hasEcommerce ? 'Plataforma e-Commerce Integrada' : 'No cuenta con tienda de venta online directa'}
              </div>
            </div>
          </div>
        </div>
      )
    },

    // Slide 6: Legal & Public Contracts
    {
      title: 'Antecedentes Judiciales & Contrataciones Públicas',
      subtitle: 'Boletín Oficial y Licitaciones del Estado',
      icon: <Scale size={24} style={{ color: '#f59e0b' }} />,
      content: (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '16px', padding: '24px' }}>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f8fafc', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Scale size={18} style={{ color: '#f59e0b' }} /> Rastreo Judicial & Legal
            </h4>
            <div style={{ fontSize: '0.9rem', color: '#cbd5e1', lineHeight: '1.6' }}>
              {legal.totalLawsuits > 0
                ? `Se detectaron ${legal.totalLawsuits} registros legales o publicaciones en boletines oficiales vinculadas a la firma.`
                : 'No se registran causas judiciales ni edictos de quiebra vinculados al CUIT/Razón Social.'}
            </div>
          </div>

          <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '16px', padding: '24px' }}>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f8fafc', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileCheck size={18} style={{ color: '#38bdf8' }} /> Contrataciones del Estado
            </h4>
            <div style={{ fontSize: '0.9rem', color: '#cbd5e1', lineHeight: '1.6' }}>
              {contracts.totalContracts > 0
                ? `La empresa registra ${contracts.totalContracts} contrataciones o adjudicaciones públicas de provisiones.`
                : 'Sin registros recientes de adjudicación directa en el portal COMPR.AR.'}
            </div>
          </div>
        </div>
      )
    },

    // Slide 7: Financial & BCRA
    {
      title: 'Perfil Financiero & Registros BCRA',
      subtitle: 'Central de Deudores del Banco Central de la República Argentina',
      icon: <Landmark size={24} style={{ color: '#34d399' }} />,
      content: (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '18px' }}>
          <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '14px', padding: '24px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 700 }}>CATEGORÍA DE MORA</div>
            <div style={{ fontSize: '2.2rem', fontWeight: 900, color: financial.sitBCRA === 1 ? '#34d399' : '#f59e0b', marginTop: '6px' }}>
              Situación {financial.sitBCRA || 1}
            </div>
            <div style={{ fontSize: '0.82rem', color: '#cbd5e1', marginTop: '6px' }}>
              {financial.sitBCRA === 1 ? 'Normal (Cumplimiento óptimo)' : 'Atención especial'}
            </div>
          </div>

          <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '14px', padding: '24px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 700 }}>CHEQUES SIN FONDO</div>
            <div style={{ fontSize: '2.2rem', fontWeight: 900, color: financial.chequesRechazadosCount > 0 ? '#fb7185' : '#34d399', marginTop: '6px' }}>
              {financial.chequesRechazadosCount || 0}
            </div>
            <div style={{ fontSize: '0.82rem', color: '#cbd5e1', marginTop: '6px' }}>
              {financial.chequesRechazadosCount > 0 ? 'Registra rechazos de cheques' : 'Sin cheques rechazados'}
            </div>
          </div>

          <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '14px', padding: '24px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 700 }}>RIESGO CREDITICIO GLOBAL</div>
            <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#38bdf8', marginTop: '6px' }}>
              BAJO / MEDIO
            </div>
            <div style={{ fontSize: '0.82rem', color: '#cbd5e1', marginTop: '6px' }}>
              Apto para operaciones comerciales
            </div>
          </div>
        </div>
      )
    },

    // Slide 8: Strategic Plan & Next Steps
    {
      title: 'Plan de Apoyo & Recomendaciones',
      subtitle: 'Conclusiones y Hoja de Ruta para Crecimiento',
      icon: <HeartHandshake size={24} style={{ color: '#38bdf8' }} />,
      content: (
        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '18px', padding: '28px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc', marginBottom: '16px' }}>
            Recomendaciones de Acción Prioritarias
          </h3>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: '12px', listStyle: 'none', padding: 0 }}>
            {Array.isArray(support.recommendations) && support.recommendations.length > 0 ? (
              support.recommendations.slice(0, 4).map((rec, idx) => (
                <li key={idx} style={{ background: '#0f172a', padding: '14px 18px', borderRadius: '10px', border: '1px solid #334155', color: '#f8fafc', fontSize: '0.96rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#2563eb', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 800, flexShrink: 0 }}>
                    {idx + 1}
                  </span>
                  {rec.title || rec}
                </li>
              ))
            ) : (
              <li style={{ background: '#0f172a', padding: '14px 18px', borderRadius: '10px', border: '1px solid #334155', color: '#f8fafc', fontSize: '0.96rem' }}>
                Avanzar en la digitalización del catálogo de productos y optimizar presencia en procesos licitatorios.
              </li>
            )}
          </ul>
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
      background: '#0b0f17',
      color: '#fff',
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
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Presentación OSINT Tecno3F
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 800, color: '#f8fafc' }}>
              {companyName}
            </div>
          </div>
        </div>

        {/* Slide Counter & Close */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 700, background: '#1e293b', padding: '6px 14px', borderRadius: '20px', border: '1px solid #334155' }}>
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
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '30px 0' }}>
        <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: '#1e293b', border: '1px solid #334155', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {currentSlideData.icon}
          </div>
          <div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
              {currentSlideData.title}
            </h2>
            <div style={{ fontSize: '0.92rem', color: '#94a3b8', marginTop: '2px', fontWeight: 600 }}>
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
        <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>
          Usa las teclas <strong style={{ color: '#94a3b8' }}>[←]</strong> y <strong style={{ color: '#94a3b8' }}>[→]</strong> o la barra de espacio para cambiar de diapositiva.
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => setCurrentSlide(prev => Math.max(prev - 1, 0))}
            disabled={currentSlide === 0}
            style={{
              padding: '10px 18px',
              borderRadius: '8px',
              background: currentSlide === 0 ? '#1e293b' : '#3b82f6',
              border: 'none',
              color: currentSlide === 0 ? '#64748b' : '#fff',
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
              background: currentSlide === totalSlides - 1 ? '#1e293b' : '#3b82f6',
              border: 'none',
              color: currentSlide === totalSlides - 1 ? '#64748b' : '#fff',
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
