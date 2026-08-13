import React, { Component, useEffect, useState } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';

import Header from './components/Header';
import SearchForm from './components/SearchForm';
import OverviewTab from './components/OverviewTab';
import ProjectsTab from './components/ProjectsTab';
import BusinessAnswersTab from './components/BusinessAnswersTab';
import SwotTab from './components/SwotTab';
import DigitalTransformationTab from './components/DigitalTransformationTab';
import LegalTab from './components/LegalTab';
import PublicContractsTab from './components/PublicContractsTab';
import FinancialTab from './components/FinancialTab';
import NewsTab from './components/NewsTab';
import SupportTab from './components/SupportTab';
import HistoryTab from './components/HistoryTab';
import CompareTab from './components/CompareTab';
import AdminTab from './components/AdminTab';
import PresentationModal from './components/PresentationModal';
import WatchlistModal from './components/WatchlistModal';
import AuthModal from './components/AuthModal';
import OsintChatbot from './components/OsintChatbot';
import Footer from './components/Footer';
import SharedReportPage from './components/SharedReportPage';

import { LayoutDashboard, Briefcase, HelpCircle, Target, Scale, Landmark, Newspaper, HeartHandshake, History, AlertCircle, Layers, FileCheck, RefreshCw, Cpu, ShieldCheck } from 'lucide-react';

import { useOsintStore } from './store/useOsintStore';
import { useOsintScanner } from './hooks/useOsintScanner';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('React Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="saas-card" style={{ padding: '40px', textAlign: 'center', margin: '20px 0' }}>
          <AlertCircle size={48} style={{ color: 'var(--accent-rose)', marginBottom: '16px' }} />
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Inconveniente en la Renderización</h2>
          <p style={{ color: 'var(--text-secondary)', margin: '10px 0 20px 0' }}>
            {this.state.error?.message || 'Error inesperado al cargar la sección.'}
          </p>
          <button className="btn-primary" onClick={() => window.location.reload()}>
            <RefreshCw size={16} /> Recargar Aplicación
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const { handleScan } = useOsintScanner();
  
  const { 
    report, 
    comparisonReport, 
    loading, 
    error, 
    user, 
    history, 
    theme, 
    scanProgress, 
    scanStageText,
    login,
    logout,
    toggleTheme,
    resetState,
    setReport,
    setLoading
  } = useOsintStore();

  const [showPresentation, setShowPresentation] = useState(false);
  const [showWatchlistModal, setShowWatchlistModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [shareModal, setShareModal] = useState(null);

  const handleShare = async () => {
    if (!report) return;
    setShareModal({ loading: true });
    try {
      const token = user?.token || localStorage.getItem('osint_auth_token');
      const res = await fetch('/api/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': token ? `Bearer ${token}` : '' },
        body: JSON.stringify({ report })
      });
      const data = await res.json();
      if (data.success) {
        setShareModal({ url: `${window.location.origin}/share/${data.token}` });
      } else {
        setShareModal({ error: data.error || 'Error al generar el link.' });
      }
    } catch (e) {
      setShareModal({ error: 'Error de conexión.' });
    }
  };

  // Initial Theme Effect is now managed mostly in store, but we can ensure it's applied on mount
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Load History Summary ONLY if user is logged in
  useEffect(() => {
    if (user) {
      const token = user.token || localStorage.getItem('osint_auth_token');
      fetch('/api/history', {
        headers: {
          'Authorization': token ? `Bearer ${token}` : ''
        }
      })
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.history)) {
          useOsintStore.getState().setHistory(data.history);
        }
      })
      .catch(() => useOsintStore.getState().setHistory([]));
    } else {
      useOsintStore.getState().setHistory([]);
    }
  }, [user]);

  const handleClearHistory = async () => {
    if (!user) return;
    try {
      const token = user.token || localStorage.getItem('osint_auth_token');
      await fetch('/api/history', {
        method: 'DELETE',
        headers: { 'Authorization': token ? `Bearer ${token}` : '' }
      });
      useOsintStore.getState().setHistory([]);
    } catch (e) {}
  };

  const handleLoadReportFromHistory = async (summaryItem) => {
    if (!summaryItem) return;
    if (summaryItem.fullReport) {
      setReport(summaryItem.fullReport);
      navigate('/report/overview');
      return;
    }
    if (summaryItem.categorization) {
      setReport(summaryItem);
      navigate('/report/overview');
      return;
    }

    setLoading(true);
    try {
      const token = user?.token || localStorage.getItem('osint_auth_token');
      const res = await fetch(`/api/history/${summaryItem.id}`, {
        headers: { 'Authorization': token ? `Bearer ${token}` : '', 'X-User-Id': user?.id || '' }
      });
      const data = await res.json();
      if (data.success && data.report) {
        setReport(data.report);
        navigate('/report/overview');
      }
    } catch(e) {
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Perform Dual Company Compare
  const handleCompare = async ({ companyA, websiteA, companyB, websiteB }) => {
    setLoading(true);
    resetState();
    navigate('/compare');

    try {
      const response = await fetch('/api/osint/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyA, websiteA, companyB, websiteB })
      });

      const data = await response.json();

      if (!response.ok || !data.reportA || !data.reportB) {
        throw new Error(data.error || 'No se pudo completar la comparación.');
      }

      useOsintStore.getState().setComparisonReport(data);

    } catch (err) {
      console.error('Compare Error:', err);
      useOsintStore.getState().setError(err.message || 'Error al comparar.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    resetState();
    navigate('/');
  };

  const companyName = report?.query?.companyName || '';
  const totalRecs = report?.supportPlan?.totalRecommendations || 0;

  const isAdminRoute = location.pathname.startsWith('/admin');
  const isUnauthorizedUserOnAdmin = isAdminRoute && user && user.role !== 'admin';

  return (
    <ErrorBoundary>
      {/* PUBLIC SHARE ROUTE - no auth, no blur */}
      <Routes>
        <Route path="/share/:token" element={<SharedReportPage />} />
      </Routes>

      {/* Share Modal */}
      {shareModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={() => setShareModal(null)}>
          <div style={{ background: '#0f172a', border: '1px solid rgba(56,189,248,0.3)', borderRadius: '20px', padding: '36px', maxWidth: '480px', width: '100%', textAlign: 'center' }} onClick={e => e.stopPropagation()}>
            {shareModal.loading && <p style={{ color: '#38bdf8' }}>Generando link público...</p>}
            {shareModal.error && <p style={{ color: '#f87171' }}>{shareModal.error}</p>}
            {shareModal.url && (
              <>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '8px' }}>🔗 Link Público Creado</div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '16px' }}>Cualquier persona con este link puede ver el análisis en modo lectura (válido 7 días).</p>
                <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(56,189,248,0.2)', borderRadius: '10px', padding: '12px 16px', marginBottom: '16px', wordBreak: 'break-all', fontSize: '0.82rem', color: '#38bdf8', textAlign: 'left' }}>
                  {shareModal.url}
                </div>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                  <button className="btn-primary" onClick={() => navigator.clipboard.writeText(shareModal.url)}>📋 Copiar Link</button>
                  <button className="btn-secondary" onClick={() => setShareModal(null)}>Cerrar</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
      <AuthModal
        user={user}
        onLogin={(userData, keepSession) => {
          login(userData, keepSession);
          setShowAuthModal(false);
        }}
        onLogout={handleLogout}
        onOpenHistory={() => navigate('/history')}
        historyCount={history.length}
        isForcedLock={!user}
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onOpenAdmin={() => navigate('/admin')}
      />
      <div className="app-container" style={{ filter: !user ? 'blur(4px)' : 'none', opacity: !user ? 0.9 : 1, pointerEvents: !user ? 'none' : 'auto', transition: 'all 0.3s ease' }}>
        <Header
          currentReport={report}
          onReset={handleReset}
          user={user}
          onLogin={() => setShowAuthModal(true)}
          onLogout={handleLogout}
          onOpenHistory={() => navigate('/history')}
          historyCount={history.length}
          theme={theme}
          onToggleTheme={toggleTheme}
          onOpenAdmin={() => navigate('/admin')}
          onNavigateHome={() => navigate('/')}
          currentPath={location.pathname}
          onOpenPresentation={() => setShowPresentation(true)}
          onOpenWatchlist={() => setShowWatchlistModal(true)}
          onShare={handleShare}
        />

        {/* 403 Forbidden Access Protection against IDOR & Parameter Tampering */}
        {isUnauthorizedUserOnAdmin && (
          <div className="saas-card" style={{ padding: '48px 30px', textAlign: 'center', background: 'rgba(244, 63, 94, 0.08)', border: '1px solid rgba(244, 63, 94, 0.4)', borderRadius: '20px', margin: '20px 0' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '18px', background: 'rgba(244, 63, 94, 0.15)', border: '1px solid rgba(244, 63, 94, 0.3)', color: 'var(--accent-rose)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto' }}>
              <AlertCircle size={36} />
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-rose)' }}>
              🚫 Acceso Denegado (403 Forbidden)
            </h2>
            <p style={{ color: '#fecdd3', maxWidth: '620px', margin: '14px auto 26px auto', fontSize: '0.96rem', lineHeight: '1.6' }}>
              Tu cuenta no posee privilegios administrativos para ingresar a <code>/admin</code>.
            </p>
            <button className="btn-primary" onClick={() => navigate('/')} style={{ margin: '0 auto' }}>
              Volver a la Aplicación Principal
            </button>
          </div>
        )}

        {!isUnauthorizedUserOnAdmin && (
          <>
            {!isAdminRoute && !location.pathname.startsWith('/report') && !location.pathname.startsWith('/compare') && (
              <SearchForm
                onScan={handleScan}
                onCompare={handleCompare}
                loading={loading}
                user={user}
                onOpenHistory={() => navigate('/history')}
                historyCount={history.length}
              />
            )}

            {error && (
              <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(244, 63, 94, 0.12)', border: '1px solid rgba(244, 63, 94, 0.3)', color: '#fecdd3', marginBottom: '28px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <AlertCircle size={20} style={{ color: 'var(--accent-rose)', flexShrink: 0 }} />
                <span style={{ fontSize: '0.92rem', fontWeight: 500 }}>{error}</span>
              </div>
            )}

            {loading && (
              <div className="saas-card col-12" style={{
                padding: '30px',
                background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.98))',
                border: '1px solid rgba(56, 189, 248, 0.35)',
                borderRadius: '16px',
                boxShadow: '0 12px 35px rgba(0,0,0,0.4)',
                margin: '20px 0'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <RefreshCw size={24} className="spinner" />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                        Procesando Análisis OSINT Tecno3F...
                      </h3>
                      <div style={{ color: '#38bdf8', fontSize: '0.88rem', fontWeight: 700, marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Layers size={14} /> {scanStageText}
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#38bdf8', lineHeight: 1 }}>
                      {scanProgress}%
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, marginTop: '4px' }}>
                      {scanProgress < 100 ? `Estimado: ~${Math.max(1, Math.ceil((100 - scanProgress) / 45))}s` : '¡Análisis Completado!'}
                    </div>
                  </div>
                </div>

                <div style={{ width: '100%', height: '12px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', padding: '2px' }}>
                  <div style={{
                    width: `${scanProgress}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, #2563eb 0%, #06b6d4 50%, #10b981 100%)',
                    borderRadius: '10px',
                    transition: 'width 0.12s linear',
                    boxShadow: '0 0 15px rgba(6, 182, 212, 0.6)'
                  }} />
                </div>
              </div>
            )}

            <Routes>
              {/* Home Landing Route */}
              <Route path="/" element={
                !loading && !report && !comparisonReport ? (
                  <div className="saas-card" style={{ padding: '54px 28px', textAlign: 'center' }}>
                    <div style={{ width: '64px', height: '64px', borderRadius: '18px', background: 'rgba(139, 92, 246, 0.15)', border: '1px solid rgba(139, 92, 246, 0.3)', color: '#c4b5fd', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto' }}>
                      <Layers size={32} style={{ margin: 'auto' }} />
                    </div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Plataforma OSINT Tecno3F de Inteligencia Empresarial</h2>
                    <p style={{ color: 'var(--text-secondary)', maxWidth: '680px', margin: '12px auto 28px auto', fontSize: '0.96rem', lineHeight: '1.6' }}>
                      Ingresa el nombre de cualquier empresa y su sitio web para realizar un diagnóstico completo: matriz FODA, índice de transformación digital, modelo de negocio, juicios, compras del Estado y situación impositiva.
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
                      {user && (
                        <button className="btn-secondary" onClick={() => navigate('/history')} style={{ borderColor: 'rgba(37, 99, 235, 0.4)', color: '#60a5fa' }}>
                          <History size={16} /> Ver mi historial ({history.length})
                        </button>
                      )}
                      {user?.role === 'admin' && (
                        <button className="btn-secondary" onClick={() => navigate('/admin')} style={{ borderColor: 'rgba(168, 85, 247, 0.4)', color: '#c084fc' }}>
                          <ShieldCheck size={16} /> Panel Administrador
                        </button>
                      )}
                    </div>
                  </div>
                ) : <></>
              } />

              {/* History Route */}
              <Route path="/history" element={
                !loading && user ? (
                  <div>
                    <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Historial de Búsquedas de {user.username || user.name}</h3>
                      <button className="btn-secondary" onClick={() => navigate('/')}>
                        Volver al Inicio
                      </button>
                    </div>
                    <HistoryTab
                      history={history}
                      onLoadReport={handleLoadReportFromHistory}
                      onClearHistory={handleClearHistory}
                    />
                  </div>
                ) : <Navigate to="/" />
              } />

              {/* Compare Route */}
              <Route path="/compare" element={
                !loading && comparisonReport ? (
                  <CompareTab reportA={comparisonReport.reportA} reportB={comparisonReport.reportB} />
                ) : <Navigate to="/" />
              } />

              {/* Admin Route */}
              <Route path="/admin" element={
                user?.role === 'admin' ? <AdminTab /> : <Navigate to="/" />
              } />

              {/* Report Tabs Routes */}
              <Route path="/report/*" element={
                !loading && report ? (
                  <div>
                    <nav className="tab-navbar">
                      <button className={`nav-tab-item ${location.pathname.includes('/overview') ? 'active' : ''}`} onClick={() => navigate('/report/overview')}>
                        <LayoutDashboard size={16} /> Resumen General
                      </button>
                      <button className={`nav-tab-item ${location.pathname.includes('/projects') ? 'active' : ''}`} onClick={() => navigate('/report/projects')}>
                        <Briefcase size={16} /> Perfil Comercial
                      </button>
                      <button className={`nav-tab-item ${location.pathname.includes('/answers') ? 'active' : ''}`} onClick={() => navigate('/report/answers')}>
                        <HelpCircle size={16} /> Modelo Negocio
                      </button>
                      <button className={`nav-tab-item ${location.pathname.includes('/swot') ? 'active' : ''}`} onClick={() => navigate('/report/swot')}>
                        <Target size={16} /> Matriz FODA
                      </button>
                      <button className={`nav-tab-item ${location.pathname.includes('/digital') ? 'active' : ''}`} onClick={() => navigate('/report/digital')}>
                        <Cpu size={16} /> Tr. Digital
                      </button>
                      <button className={`nav-tab-item ${location.pathname.includes('/legal') ? 'active' : ''}`} onClick={() => navigate('/report/legal')}>
                        <Scale size={16} /> Legal & Judicial
                      </button>
                      <button className={`nav-tab-item ${location.pathname.includes('/contracts') ? 'active' : ''}`} onClick={() => navigate('/report/contracts')}>
                        <FileCheck size={16} /> Contratos Públicos
                      </button>
                      <button className={`nav-tab-item ${location.pathname.includes('/financial') ? 'active' : ''}`} onClick={() => navigate('/report/financial')}>
                        <Landmark size={16} /> Deudas Fiscales
                      </button>
                      <button className={`nav-tab-item ${location.pathname.includes('/news') ? 'active' : ''}`} onClick={() => navigate('/report/news')}>
                        <Newspaper size={16} /> Prensa
                      </button>
                      <button className={`nav-tab-item ${location.pathname.includes('/support') ? 'active' : ''}`} onClick={() => navigate('/report/support')}>
                        <HeartHandshake size={16} /> Apoyo ({totalRecs})
                      </button>
                    </nav>

                    <Routes>
                      <Route path="overview" element={<OverviewTab report={report} onTabChange={(tab) => navigate(`/report/${tab}`)} />} />
                      <Route path="projects" element={<ProjectsTab scrapedData={report.scrapedData || {}} categorization={report.categorization || {}} companyName={companyName} />} />
                      <Route path="answers" element={<BusinessAnswersTab businessAnswers={report.scrapedData?.businessAnswers || {}} companyName={companyName} />} />
                      <Route path="swot" element={<SwotTab swotAnalysis={report.swotAnalysis || {}} companyName={companyName} />} />
                      <Route path="digital" element={<DigitalTransformationTab digitalData={report.digitalTransformation || {}} companyName={companyName} />} />
                      <Route path="legal" element={<LegalTab legalData={report.legalData || {}} companyName={companyName} />} />
                      <Route path="contracts" element={<PublicContractsTab publicContracts={report.publicContracts || {}} companyName={companyName} />} />
                      <Route path="financial" element={<FinancialTab financialData={report.financialData || {}} />} />
                      <Route path="news" element={<NewsTab searchData={report.searchData || {}} legalData={report.legalData || {}} companyName={companyName} />} />
                      <Route path="support" element={<SupportTab supportPlan={report.supportPlan || {}} companyName={companyName} />} />
                      <Route path="*" element={<Navigate to="overview" />} />
                    </Routes>
                  </div>
                ) : <Navigate to="/" />
              } />
            </Routes>
          </>
        )}

        <OsintChatbot currentReport={report} user={user} />
        {report && showPresentation && <PresentationModal report={report} onClose={() => setShowPresentation(false)} />}
        {user && showWatchlistModal && <WatchlistModal user={user} onClose={() => setShowWatchlistModal(false)} onSelectReport={handleLoadReportFromHistory} />}
        <Footer />
      </div>
    </ErrorBoundary>
  );
}
