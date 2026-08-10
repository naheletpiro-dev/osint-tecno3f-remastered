import React from 'react';
import { Newspaper, ExternalLink, Share2, Linkedin, Instagram, Twitter, Facebook, Youtube, Calendar, Globe, FileText, Scale } from 'lucide-react';

export default function NewsTab({ searchData = {}, legalData = {}, companyName = '' }) {
  const rawNews = (searchData && searchData.newsItems) ? searchData.newsItems : [];
  // Strict filter: only display news with real external HTTP/HTTPS links
  const newsItems = rawNews.filter(n => n.link && /^https?:\/\//i.test(n.link));
  const socialProfiles = (searchData && searchData.socialProfiles) ? searchData.socialProfiles : [];

  // Extract Boletines Oficiales & Edictos from Dateas & BORA
  const dateasEdicts = legalData.dateasData?.dateasEdicts || [];
  const dateasDocsUrl = legalData.dateasData?.dateasDocsUrl || '';
  const boraEdicts = legalData.boletinOficialData?.edicts || [];
  const boraPortalUrl = legalData.boletinOficialData?.officialPortalUrl || 'https://www.boletinoficial.gob.ar';

  const hasBoletines = dateasEdicts.length > 0 || boraEdicts.length > 0;

  const getSocialIcon = (iconName) => {
    switch (iconName) {
      case 'linkedin': return <Linkedin size={18} style={{ color: '#0a66c2' }} />;
      case 'instagram': return <Instagram size={18} style={{ color: '#e1306c' }} />;
      case 'twitter': return <Twitter size={18} style={{ color: '#1da1f2' }} />;
      case 'facebook': return <Facebook size={18} style={{ color: '#1877f2' }} />;
      case 'youtube': return <Youtube size={18} style={{ color: '#ff0000' }} />;
      default: return <Share2 size={18} style={{ color: 'var(--accent-cyan)' }} />;
    }
  };

  return (
    <div className="dashboard-grid">
      {/* Apartado Especial: Boletines Oficiales (Solo si se detectaron edictos o publicaciones oficiales) */}
      {hasBoletines && (
        <div className="saas-card col-12" style={{ padding: '24px', background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.08), rgba(6, 182, 212, 0.05))', border: '1px solid rgba(245, 158, 11, 0.35)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ background: 'rgba(245, 158, 11, 0.18)', padding: '10px', borderRadius: '10px', color: 'var(--accent-amber)' }}>
                <FileText size={24} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
                    Boletines Oficiales & Edictos Legales
                  </h3>
                  <span style={{ fontSize: '0.74rem', background: 'rgba(245, 158, 11, 0.2)', color: 'var(--accent-amber)', padding: '2px 8px', borderRadius: '6px', fontWeight: 800 }}>
                    {dateasEdicts.length + boraEdicts.length} publicaciones encontradas
                  </span>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem', marginTop: '4px', margin: 0 }}>
                  Publicaciones oficiales de {companyName} registradas en el Boletín Oficial (BORA) y Dateas.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {dateasDocsUrl && (
                <a
                  href={dateasDocsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary"
                  style={{ fontSize: '0.8rem', padding: '6px 12px', gap: '6px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', borderColor: 'rgba(6, 182, 212, 0.4)', color: '#22d3ee' }}
                >
                  <ExternalLink size={14} /> Dateas Boletín Oficial ↗
                </a>
              )}
              {boraPortalUrl && (
                <a
                  href={boraPortalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary"
                  style={{ fontSize: '0.8rem', padding: '6px 12px', gap: '6px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', borderColor: 'rgba(245, 158, 11, 0.4)', color: 'var(--accent-amber)' }}
                >
                  <ExternalLink size={14} /> Portal BORA ↗
                </a>
              )}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '12px' }}>
            {dateasEdicts.map((ed, idx) => (
              <div key={`dateas-${idx}`} style={{ background: 'rgba(0,0,0,0.3)', padding: '14px 16px', borderRadius: '10px', border: '1px solid rgba(6, 182, 212, 0.2)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '10px' }}>
                <div>
                  <div style={{ fontSize: '0.74rem', color: '#22d3ee', textTransform: 'uppercase', fontWeight: 800, marginBottom: '4px' }}>
                    Edicto Oficial (Dateas)
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#f8fafc', lineHeight: 1.3 }}>
                    {ed.title}
                  </div>
                </div>
                {ed.link && (
                  <a
                    href={ed.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: '0.8rem', color: '#38bdf8', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '5px', fontWeight: 700 }}
                  >
                    Ver edicto completo en Dateas <ExternalLink size={13} />
                  </a>
                )}
              </div>
            ))}

            {boraEdicts.map((ed, idx) => (
              <div key={`bora-${idx}`} style={{ background: 'rgba(0,0,0,0.3)', padding: '14px 16px', borderRadius: '10px', border: '1px solid rgba(245, 158, 11, 0.2)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '10px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.74rem', color: 'var(--accent-amber)', textTransform: 'uppercase', fontWeight: 800 }}>
                      Boletín Oficial (BORA)
                    </span>
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{ed.date || 'Fecha Oficial'}</span>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#f8fafc', lineHeight: 1.3 }}>
                    {ed.title}
                  </div>
                  {ed.snippet && (
                    <div style={{ fontSize: '0.8rem', color: '#cbd5e1', marginTop: '6px', lineHeight: 1.4 }}>
                      {ed.snippet}
                    </div>
                  )}
                </div>
                <a
                  href={boraPortalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: '0.8rem', color: 'var(--accent-amber)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '5px', fontWeight: 700 }}
                >
                  Consultar en Portal BORA <ExternalLink size={13} />
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* News Articles List */}
      <div className="saas-card col-8" style={{ padding: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '14px' }}>
          <h3 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--accent-amber)' }}>
            <Newspaper size={22} /> Noticias, Publicaciones y Menciones en Medios
          </h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            {newsItems.length} publicaciones con enlace verificado
          </span>
        </div>

        {newsItems.length > 0 ? (
          <div className="news-card-grid">
            {newsItems.map((news, idx) => (
              <article key={idx} className="news-card-article">
                <div className="news-header-meta">
                  <div className="news-source-tag">
                    <Globe size={15} style={{ color: 'var(--accent-cyan)' }} />
                    <span>{news.source || 'Medio Informativo'}</span>
                    <span style={{ color: 'var(--text-muted)' }}>•</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)' }}>
                      <Calendar size={13} /> {news.pubDate || 'Reciente'}
                    </span>
                  </div>
                </div>

                <h4 className="news-title-heading">
                  <a
                    href={news.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#f8fafc', textDecoration: 'none', transition: 'color 0.2s ease' }}
                    onMouseEnter={(e) => e.target.style.color = '#38bdf8'}
                    onMouseLeave={(e) => e.target.style.color = '#f8fafc'}
                    title="Abrir nota original en nueva pestaña"
                  >
                    {news.title}
                  </a>
                </h4>

                <a href={news.link} target="_blank" rel="noopener noreferrer" className="news-link-btn">
                  Leer nota completa en el medio original <ExternalLink size={14} />
                </a>
              </article>
            ))}
          </div>
        ) : (
          <div style={{ color: 'var(--text-muted)', padding: '36px 24px', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px dashed var(--border-subtle)' }}>
            <Newspaper size={36} style={{ color: '#64748b', marginBottom: '12px' }} />
            <div style={{ fontSize: '0.98rem', fontWeight: 700, color: '#94a3b8' }}>Sin artículos periodísticos verificados para {companyName}</div>
            <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '6px', maxWidth: '420px', margin: '6px auto 0' }}>
              No se detectaron noticias con enlaces externos activos en los medios indexados para esta consulta.
            </div>
          </div>
        )}
      </div>

      {/* Social Media Profiles OSINT */}
      <div className="saas-card col-4" style={{ padding: '28px' }}>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--accent-violet)', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '14px' }}>
          <Share2 size={22} /> Presencia en Redes Sociales
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {socialProfiles.length > 0 ? (
            socialProfiles.map((social, idx) => (
              <a
                key={idx}
                href={social.estimatedUrl}
                target="_blank"
                rel="noreferrer"
                className="social-card-link"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {getSocialIcon(social.icon)}
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>{social.platform}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{social.status || 'Verificado via OSINT'}</div>
                  </div>
                </div>
                <ExternalLink size={15} style={{ color: 'var(--text-muted)' }} />
              </a>
            ))
          ) : (
            <p style={{ color: 'var(--text-muted)' }}>Sin perfiles sociales vinculados.</p>
          )}
        </div>
      </div>
    </div>
  );
}
