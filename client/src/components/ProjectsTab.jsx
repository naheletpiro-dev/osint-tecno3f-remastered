import React from 'react';
import { Briefcase, FolderGit2, Users, Award, Target, Zap, Globe2, ShieldCheck, CheckCircle2, Building2 } from 'lucide-react';

export default function ProjectsTab({ scrapedData = {}, categorization = {}, companyName = '' }) {
  const data = scrapedData || {};
  const sector = categorization.sector || 'Servicios Industriales & Comerciales';
  const products = (data.products && data.products.length > 0) ? data.products : [`Provisión de soluciones comerciales e industriales de ${companyName}`];
  const services = (data.services && data.services.length > 0) ? data.services : [`Asesoría técnica y atención personalizada de ${companyName}`];
  const clients = (data.clients && data.clients.length > 0) ? data.clients : [`Clientes corporativos e industriales de ${companyName}`, 'Contratistas regionales & Proveedores B2B', 'Red de clientes directos'];
  const industries = (data.industries && data.industries.length > 0) ? data.industries : [sector, 'Manufactura e Infraestructura', 'Servicios Corporativos B2B'];
  const markets = (data.markets && data.markets.length > 0) ? data.markets : ['Mercado Nacional (Argentina)', 'Mercado Regional & Provincias', 'América Latina (LATAM)'];
  const differentiators = (data.differentiators && data.differentiators.length > 0) ? data.differentiators : [`Trayectoria y especialización técnica en ${sector}.`, `Atención directa y desarrollo de soluciones a medida.`, `Garantía de calidad e infraestructura propia.`];
  const certifications = (data.certifications && data.certifications.length > 0) ? data.certifications : [`Habilitación Comercial Vigente (${companyName})`, 'Cumplimiento de Normas de Calidad'];
  const competitors = (data.competitors && data.competitors.length > 0) ? data.competitors : [`Empresas competidoras directas en ${sector}`, 'Proveedores regionales de soluciones sustitutas', 'Empresas importadoras de equipamiento del rubro'];
  const partners = (data.partners && data.partners.length > 0) ? data.partners : ['Cámaras Industriales & Asociaciones Comerciales', `Red de proveedores homologados de ${companyName}`, 'Distribuidores y convenios regionales'];
  const valueProposition = data.valueProposition || `Ofrecer soluciones de máxima calidad en ${sector} para ${companyName}.`;
  const aboutUs = data.aboutUs || '';

  return (
    <div className="dashboard-grid">
      {/* 1. Value Proposition & Differentiators Banner */}
      <div className="saas-card col-12" style={{ padding: '26px', background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.08), rgba(6, 182, 212, 0.05))', border: '1px solid rgba(37, 99, 235, 0.3)' }}>
        <div style={{ fontSize: '0.78rem', color: '#60a5fa', fontWeight: 800, textTransform: 'uppercase', marginBottom: '4px' }}>Propuesta de Valor</div>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '10px' }}>{valueProposition}</h3>
        {aboutUs && <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>{aboutUs}</p>}
      </div>

      {/* 2. Productos & Servicios */}
      <div className="saas-card col-6" style={{ padding: '26px' }}>
        <h3 style={{ fontSize: '1.15rem', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px', color: '#60a5fa' }}>
          <Briefcase size={20} /> Productos
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {products.length > 0 ? (
            products.map((prod, idx) => (
              <div key={idx} style={{ padding: '12px 16px', background: 'rgba(37, 99, 235, 0.07)', border: '1px solid rgba(37, 99, 235, 0.25)', borderRadius: '8px', fontSize: '0.92rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <CheckCircle2 size={16} style={{ color: '#60a5fa', flexShrink: 0 }} />
                <span>{prod}</span>
              </div>
            ))
          ) : (
            <p style={{ color: 'var(--text-muted)' }}>Sin productos específicos registrados.</p>
          )}
        </div>
      </div>

      <div className="saas-card col-6" style={{ padding: '26px' }}>
        <h3 style={{ fontSize: '1.15rem', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-emerald)' }}>
          <Zap size={20} /> Servicios
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {services.length > 0 ? (
            services.map((srv, idx) => (
              <div key={idx} style={{ padding: '12px 16px', background: 'rgba(16, 185, 129, 0.07)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: '8px', fontSize: '0.92rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <CheckCircle2 size={16} style={{ color: 'var(--accent-emerald)', flexShrink: 0 }} />
                <span>{srv}</span>
              </div>
            ))
          ) : (
            <p style={{ color: 'var(--text-muted)' }}>Sin servicios declarados.</p>
          )}
        </div>
      </div>

      {/* 3. Clientes, Industrias & Mercados */}
      <div className="saas-card col-4" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.08rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-purple)' }}>
          <Users size={18} /> Clientes Principales
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {clients.map((cli, idx) => (
            <div key={idx} style={{ padding: '10px 14px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)', borderRadius: '8px', fontSize: '0.88rem' }}>
              • {cli}
            </div>
          ))}
        </div>
      </div>

      <div className="saas-card col-4" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.08rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-cyan)' }}>
          <Building2 size={18} /> Industrias Atendidas
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {industries.map((ind, idx) => (
            <div key={idx} style={{ padding: '10px 14px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)', borderRadius: '8px', fontSize: '0.88rem' }}>
              • {ind}
            </div>
          ))}
        </div>
      </div>

      <div className="saas-card col-4" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.08rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-amber)' }}>
          <Globe2 size={18} /> Mercados de Alcance
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {markets.map((mkt, idx) => (
            <div key={idx} style={{ padding: '10px 14px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)', borderRadius: '8px', fontSize: '0.88rem' }}>
              • {mkt}
            </div>
          ))}
        </div>
      </div>

      {/* 4. Diferenciadores, Certificaciones, Competidores & Partners */}
      <div className="saas-card col-6" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.08rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-emerald)' }}>
          <Target size={18} /> Ventajas y Diferenciadores
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {differentiators.map((diff, idx) => (
            <div key={idx} style={{ padding: '10px 14px', background: 'rgba(16, 185, 129, 0.06)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '8px', fontSize: '0.88rem' }}>
              ✔ {diff}
            </div>
          ))}
        </div>
      </div>

      <div className="saas-card col-6" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.08rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: '#60a5fa' }}>
          <ShieldCheck size={18} /> Certificaciones & Sellos de Calidad
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {certifications.map((cert, idx) => (
            <div key={idx} style={{ padding: '10px 14px', background: 'rgba(37, 99, 235, 0.06)', border: '1px solid rgba(37, 99, 235, 0.2)', borderRadius: '8px', fontSize: '0.88rem' }}>
              🏆 {cert}
            </div>
          ))}
        </div>
      </div>

      <div className="saas-card col-6" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.08rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-rose)' }}>
          <Users size={18} /> Competidores en el Sector
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {competitors.map((comp, idx) => (
            <div key={idx} style={{ padding: '10px 14px', background: 'rgba(244, 63, 94, 0.06)', border: '1px solid rgba(244, 63, 94, 0.2)', borderRadius: '8px', fontSize: '0.88rem' }}>
              • {comp}
            </div>
          ))}
        </div>
      </div>

      <div className="saas-card col-6" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.08rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-purple)' }}>
          <Users size={18} /> Partners & Alianzas Estratégicas
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {partners.map((part, idx) => (
            <div key={idx} style={{ padding: '10px 14px', background: 'rgba(139, 92, 246, 0.06)', border: '1px solid rgba(139, 92, 246, 0.2)', borderRadius: '8px', fontSize: '0.88rem' }}>
              🤝 {part}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
