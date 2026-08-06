import React, { useState, useEffect, useRef } from 'react';
import { Download, FileText, RefreshCw, Sun, Moon, ShieldCheck, Tv, Eye, ChevronDown, FolderDown, Wrench, UserCheck, History, LogOut, Shield } from 'lucide-react';
import { downloadFullPdfReport } from '../utils/pdfReportGenerator';

export default function Header({ currentReport, onReset, user, onLogin, onLogout, onOpenHistory, historyCount, theme, onToggleTheme, onOpenAdmin, onNavigateHome, currentPath, onOpenPresentation, onOpenWatchlist }) {
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null); // 'export' | 'tools' | 'user' | null

  const headerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (headerRef.current && !headerRef.current.contains(e.target)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleDropdown = (menuName) => {
    setOpenDropdown(prev => prev === menuName ? null : menuName);
  };

  const handleExportJSON = () => {
    if (!currentReport) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(currentReport, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `OSINT_Tecno3F_${currentReport.query.companyName.replace(/\s+/g, '_')}_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setOpenDropdown(null);
  };

  const handleDownloadPDF = async () => {
    if (!currentReport) return;
    setDownloadingPdf(true);
    setOpenDropdown(null);
    try {
      await downloadFullPdfReport(currentReport);
    } catch (err) {
      console.error('PDF Generation Error:', err);
    } finally {
      setDownloadingPdf(false);
    }
  };

  return (
    <header className="header-nav" ref={headerRef} style={{ position: 'relative', zIndex: 1000 }}>
      {/* Brand Identity Section */}
      <div className="brand-wrapper" onClick={onNavigateHome} style={{ cursor: 'pointer' }} title="Volver al Inicio">
        <div className="brand-icon-box">
          <img
            src="/tecno3f-color.png"
            alt="Tecno3F Logo"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              borderRadius: '8px',
              filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.5))'
            }}
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        </div>
        <div>
          <h1 className="brand-name">
            {'OSINT '}<span style={{ whiteSpace: 'nowrap' }}><span style={{ color: '#a78bfa' }}>{'Tecno'}</span><span style={{ color: '#2dd4bf' }}>{'3F'}</span></span>
          </h1>
          <p className="brand-subtitle">
            Plataforma Profesional de Inteligencia Comercial y Asistencia Empresarial
          </p>
        </div>
      </div>

      {/* Grouped Sectional Dropdown Menus */}
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
        
        {/* GROUP 1: HERRAMIENTAS & ESCANEO */}
        <div style={{ position: 'relative' }}>
          <button
            className="btn-secondary"
            onClick={() => toggleDropdown('tools')}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}
          >
            <Wrench size={16} style={{ color: '#60a5fa' }} />
            <span>Acciones & Herramientas</span>
            <ChevronDown size={14} style={{ transition: 'transform 0.2s', transform: openDropdown === 'tools' ? 'rotate(180deg)' : 'none' }} />
          </button>

          {openDropdown === 'tools' && (
            <div style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              right: 0,
              minWidth: '220px',
              background: 'var(--card-bg, #0f172a)',
              border: '1px solid var(--border-subtle, rgba(255,255,255,0.15))',
              borderRadius: '12px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
              padding: '6px',
              zIndex: 1001,
              backdropFilter: 'blur(12px)'
            }}>
              <button
                style={{ width: '100%', padding: '10px 14px', background: 'none', border: 'none', color: '#f8fafc', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', borderRadius: '8px', textAlign: 'left' }}
                onClick={() => { onReset(); setOpenDropdown(null); }}
              >
                <RefreshCw size={15} style={{ color: '#60a5fa' }} />
                <span>Nueva Búsqueda</span>
              </button>

              {user && onOpenWatchlist && (
                <button
                  style={{ width: '100%', padding: '10px 14px', background: 'none', border: 'none', color: '#f8fafc', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', borderRadius: '8px', textAlign: 'left' }}
                  onClick={() => { onOpenWatchlist(); setOpenDropdown(null); }}
                >
                  <Eye size={15} style={{ color: '#38bdf8' }} />
                  <span>Monitoreo & Watchlist</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* GROUP 2: EXPORTAR & PRESENTAR (Visible when report loaded) */}
        {currentReport && (
          <div style={{ position: 'relative' }}>
            <button
              className="btn-secondary"
              onClick={() => toggleDropdown('export')}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, borderColor: 'rgba(56, 189, 248, 0.4)', color: '#38bdf8' }}
            >
              <FolderDown size={16} />
              <span>Exportar & Presentar</span>
              <ChevronDown size={14} style={{ transition: 'transform 0.2s', transform: openDropdown === 'export' ? 'rotate(180deg)' : 'none' }} />
            </button>

            {openDropdown === 'export' && (
              <div style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                minWidth: '230px',
                background: 'var(--card-bg, #0f172a)',
                border: '1px solid var(--border-subtle, rgba(255,255,255,0.15))',
                borderRadius: '12px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                padding: '6px',
                zIndex: 1001,
                backdropFilter: 'blur(12px)'
              }}>
                <button
                  style={{ width: '100%', padding: '10px 14px', background: 'none', border: 'none', color: '#f8fafc', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', borderRadius: '8px', textAlign: 'left' }}
                  onClick={() => { onOpenPresentation(); setOpenDropdown(null); }}
                >
                  <Tv size={15} style={{ color: '#38bdf8' }} />
                  <span>Modo Presentación (Diapositivas)</span>
                </button>

                <button
                  style={{ width: '100%', padding: '10px 14px', background: 'none', border: 'none', color: '#34d399', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', borderRadius: '8px', textAlign: 'left' }}
                  onClick={handleDownloadPDF}
                  disabled={downloadingPdf}
                >
                  <FileText size={15} />
                  <span>{downloadingPdf ? 'Generando PDF...' : 'Descargar PDF Completo'}</span>
                </button>

                <button
                  style={{ width: '100%', padding: '10px 14px', background: 'none', border: 'none', color: '#f8fafc', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', borderRadius: '8px', textAlign: 'left' }}
                  onClick={handleExportJSON}
                >
                  <Download size={15} style={{ color: '#a78bfa' }} />
                  <span>Exportar JSON</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* GROUP 3: MI CUENTA & HISTORIAL */}
        <div style={{ position: 'relative' }}>
          <button
            className="btn-secondary"
            onClick={() => toggleDropdown('user')}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 14px' }}
          >
            <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: 'rgba(167, 139, 250, 0.2)', color: '#a78bfa', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.82rem' }}>
              {user ? user.username.charAt(0).toUpperCase() : 'G'}
            </div>
            <div style={{ textAlign: 'left' }}>
              <span style={{ fontSize: '0.84rem', fontWeight: 700, display: 'block', lineHeight: '1.1' }}>
                {user ? user.username : 'Invitado'}
              </span>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800 }}>
                {user?.role === 'admin' ? 'ADMINISTRADOR' : (user ? 'USUARIO' : 'ACCESO')}
              </span>
            </div>
            <ChevronDown size={14} style={{ transition: 'transform 0.2s', transform: openDropdown === 'user' ? 'rotate(180deg)' : 'none', marginLeft: '4px' }} />
          </button>

          {openDropdown === 'user' && (
            <div style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              right: 0,
              minWidth: '240px',
              background: 'var(--card-bg, #0f172a)',
              border: '1px solid var(--border-subtle, rgba(255,255,255,0.15))',
              borderRadius: '12px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
              padding: '6px',
              zIndex: 1001,
              backdropFilter: 'blur(12px)'
            }}>
              {user && (
                <button
                  style={{ width: '100%', padding: '10px 14px', background: 'none', border: 'none', color: '#f8fafc', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', borderRadius: '8px', textAlign: 'left' }}
                  onClick={() => { onOpenHistory(); setOpenDropdown(null); }}
                >
                  <History size={15} style={{ color: '#a78bfa' }} />
                  <span>Ver mi Historial ({historyCount})</span>
                </button>
              )}

              {user?.role === 'admin' && onOpenAdmin && (
                <button
                  style={{ width: '100%', padding: '10px 14px', background: 'none', border: 'none', color: '#f8fafc', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', borderRadius: '8px', textAlign: 'left' }}
                  onClick={() => { onOpenAdmin(); setOpenDropdown(null); }}
                >
                  <Shield size={15} style={{ color: '#38bdf8' }} />
                  <span>Panel de Administración</span>
                </button>
              )}

              <button
                style={{ width: '100%', padding: '10px 14px', background: 'none', border: 'none', color: '#f8fafc', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', borderRadius: '8px', textAlign: 'left' }}
                onClick={() => { onToggleTheme(); setOpenDropdown(null); }}
              >
                {theme === 'dark' ? <Sun size={15} style={{ color: '#fbbf24' }} /> : <Moon size={15} style={{ color: '#a78bfa' }} />}
                <span>{theme === 'dark' ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'}</span>
              </button>

              <div style={{ height: '1px', background: 'var(--border-subtle, rgba(255,255,255,0.1))', margin: '4px 0' }} />

              {user ? (
                <button
                  style={{ width: '100%', padding: '10px 14px', background: 'none', border: 'none', color: '#f87171', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', borderRadius: '8px', textAlign: 'left', fontWeight: 600 }}
                  onClick={() => { onLogout(); setOpenDropdown(null); }}
                >
                  <LogOut size={15} />
                  <span>Cerrar Sesión</span>
                </button>
              ) : (
                <button
                  style={{ width: '100%', padding: '10px 14px', background: 'none', border: 'none', color: '#34d399', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', borderRadius: '8px', textAlign: 'left', fontWeight: 600 }}
                  onClick={() => { onLogin(); setOpenDropdown(null); }}
                >
                  <UserCheck size={15} />
                  <span>Iniciar Sesión / Registrarse</span>
                </button>
              )}
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
