import React from 'react';
import { Newspaper, ExternalLink, Share2, Linkedin, Instagram, Twitter, Facebook, Youtube, Calendar, Globe } from 'lucide-react';

export default function NewsTab({ searchData = {}, companyName = '' }) {
  const rawNews = (searchData && searchData.newsItems) ? searchData.newsItems : [];
  // Strict filter: only display news with real external HTTP/HTTPS links
  const newsItems = rawNews.filter(n => n.link && /^https?:\/\//i.test(n.link));
  const socialProfiles = (searchData && searchData.socialProfiles) ? searchData.socialProfiles : [];

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
