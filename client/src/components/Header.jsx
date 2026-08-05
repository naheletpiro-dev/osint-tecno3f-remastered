import React, { useState } from 'react';
import { Download, FileText, RefreshCw, Sun, Moon, ShieldCheck, Tv } from 'lucide-react';
import { downloadFullPdfReport } from '../utils/pdfReportGenerator';
import AuthModal from './AuthModal';

export default function Header({ currentReport, onReset, user, onLogin, onLogout, onOpenHistory, historyCount, theme, onToggleTheme, onOpenAdmin, onNavigateHome, currentPath, onOpenPresentation }) {
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  const handleExportJSON = () => {
    if (!currentReport) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(currentReport, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `OSINT_Tecno3F_${currentReport.query.companyName.replace(/\s+/g, '_')}_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Direct PDF Download containing ALL 8 SECTIONS of the report
  const handleDownloadPDF = async () => {
    if (!currentReport) return;
    setDownloadingPdf(true);

    try {
      await downloadFullPdfReport(currentReport);
    } catch (err) {
      console.error('PDF Generation Error:', err);
    } finally {
      setDownloadingPdf(false);
    }
  };

  return (
    <header className="header-nav">
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

      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
        {currentReport && (
          <>
            <button
              className="btn-secondary"
              onClick={onOpenPresentation}
              style={{ borderColor: 'rgba(56, 189, 248, 0.4)', color: '#38bdf8' }}
              title="Modo Diapositivas para Reuniones y Directorio"
            >
              <Tv size={15} /> Modo Presentación
            </button>
            <button className="btn-secondary" onClick={handleExportJSON}>
              <Download size={15} /> Exportar JSON
            </button>
            <button
              className="btn-secondary"
              onClick={handleDownloadPDF}
              disabled={downloadingPdf}
              style={{ borderColor: 'rgba(16, 185, 129, 0.4)', color: '#34d399' }}
            >
              <FileText size={15} /> {downloadingPdf ? 'Generando PDF...' : 'Descargar PDF Completo'}
            </button>
            <button className="btn-secondary" onClick={onReset}>
              <RefreshCw size={15} /> Nueva Búsqueda
            </button>
          </>
        )}

        <button
          className="btn-secondary"
          onClick={onToggleTheme}
          title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          style={{ padding: '10px 12px', minWidth: 'auto' }}
        >
          {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
        </button>

        <AuthModal
          user={user}
          onLogin={onLogin}
          onLogout={onLogout}
          onOpenHistory={onOpenHistory}
          historyCount={historyCount}
          isForcedLock={!user}
          onOpenAdmin={onOpenAdmin}
        />
      </div>
    </header>
  );
}
