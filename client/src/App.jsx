import React, { useState, useEffect, Component } from 'react';
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
import OsintChatbot from './components/OsintChatbot';
import Footer from './components/Footer';
import { processClientSideOSINT } from './services/clientOsintEngine';
import { LayoutDashboard, Briefcase, HelpCircle, Target, Scale, Landmark, Newspaper, HeartHandshake, History, AlertCircle, Layers, FileCheck, RefreshCw, Cpu, ShieldCheck } from 'lucide-react';

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
  const [report, setReport] = useState(null);
  const [comparisonReport, setComparisonReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [user, setUser] = useState(null);
  const [history, setHistory] = useState([]);
  const [showHistoryOnly, setShowHistoryOnly] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('osint-theme') || 'dark');
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [showPresentation, setShowPresentation] = useState(false);
  const [showWatchlistModal, setShowWatchlistModal] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStageText, setScanStageText] = useState('Iniciando rastreo OSINT...');

  useEffect(() => {
    let interval;
    if (loading) {
      setScanProgress(0);
      interval = setInterval(() => {
        setScanProgress(prev => {
          if (prev >= 95) return 95;
          const next = prev + (prev < 30 ? 4 : prev < 70 ? 3 : 2);

          if (next < 25) {
            setScanStageText('1/4: Scrapeando sitio corporativo, dominio y metadatos...');
          } else if (next < 50) {
            setScanStageText('2/4: Consultando Central de Deudores BCRA, cheques y AFIP/ARCA...');
          } else if (next < 75) {
            setScanStageText('3/4: Verificando marcas en INPI/WIPO y licitaciones públicas COMPR.AR...');
          } else {
            setScanStageText('4/4: Auditando madurez digital y emparejamiento con Kits 4.0...');
          }

          return next;
        });
      }, 40);
    } else {
      setScanProgress(0);
    }
    return () => clearInterval(interval);
  }, [loading]);

  useEffect(() => {
    const handlePopState = () => setCurrentPath(window.location.pathname);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (path) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('osint-theme', theme);
  }, [theme]);

  const handleToggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  // Load User from SessionStorage (temporary tab) or LocalStorage (persistent)
  useEffect(() => {
    try {
      const sessionUser = sessionStorage.getItem('osint_user');
      if (sessionUser) {
        setUser(JSON.parse(sessionUser));
        return;
      }

      const persistentUser = localStorage.getItem('osint_user');
      if (persistentUser) {
        setUser(JSON.parse(persistentUser));
      }
    } catch (e) {}
  }, []);

  // Load History Summary ONLY if user is logged in
  useEffect(() => {
    if (user) {
      const token = user.token || localStorage.getItem('osint_auth_token');
      fetch('/api/history', {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'X-User-Id': user.id || ''
        }
      })
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.history)) {
          setHistory(data.history);
        }
      })
      .catch(() => setHistory([]));
    } else {
      setHistory([]);
    }
  }, [user]);

  const saveReportToHistory = async (reportData) => {
    if (!user || !reportData) return;
    try {
      await fetch('/api/history/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, report: reportData })
      });
      const token = user.token || localStorage.getItem('osint_auth_token');
      const res = await fetch('/api/history', {
        headers: { 'Authorization': token ? `Bearer ${token}` : '', 'X-User-Id': user.id || '' }
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.history)) {
        setHistory(data.history);
      }
    } catch(e) {}
  };

  const handleLoadReportFromHistory = async (summaryItem) => {
    if (!summaryItem) return;
    if (summaryItem.categorization) {
      setReport(summaryItem);
      setActiveTab('overview');
      setShowHistoryOnly(false);
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
        setActiveTab('overview');
        setShowHistoryOnly(false);
      }
    } catch(e) {
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (userData, keepSession = false) => {
    setUser(userData);
    try {
      if (keepSession) {
        localStorage.setItem('osint_user', JSON.stringify(userData));
        sessionStorage.removeItem('osint_user');
      } else {
        sessionStorage.setItem('osint_user', JSON.stringify(userData));
        localStorage.removeItem('osint_user');
      }
    } catch (e) {}
  };

  const handleLogout = () => {
    setUser(null);
    setReport(null);
    setComparisonReport(null);
    setShowHistoryOnly(false);
    setActiveTab('overview');
    navigateTo('/');
    try {
      sessionStorage.removeItem('osint_user');
      localStorage.removeItem('osint_user');
    } catch (e) {}
  };

  // Perform OSINT Scan with COMPLETE STATE WIPE
  const handleScan = async ({ companyName, website, region }) => {
    setLoading(true);
    setError(null);
    setReport(null);
    setComparisonReport(null);
    setShowHistoryOnly(false);
    navigateTo('/');
    let data = null;

    try {
      // 1. Try API backend
      const response = await fetch('/api/osint/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyName, website, region })
      }).catch(() => null);

      if (response && response.ok) {
        const rawText = await response.text();
        if (rawText && !rawText.trim().startsWith('<')) {
          try {
            data = JSON.parse(rawText);
          } catch (e) {}
        }
      }

      // 2. Fallback to Client-Side OSINT Engine
      if (!data || !data.categorization) {
        console.log('Using Client-Side OSINT Engine fallback...');
        data = await processClientSideOSINT(companyName, website, region);
      }

      setReport(data);
      setActiveTab('overview');

      // Save history to server
      if (user) {
        saveReportToHistory(data);
      }

    } catch (err) {
      console.error('Scan Error:', err);
      const fallbackReport = await processClientSideOSINT(companyName, website, region);
      setReport(fallbackReport);
      setActiveTab('overview');
    } finally {
      setLoading(false);
    }
  };

  // Perform Dual Company Compare
  const handleCompare = async ({ companyA, websiteA, companyB, websiteB }) => {
    setLoading(true);
    setError(null);
    setReport(null);
    setComparisonReport(null);
    setShowHistoryOnly(false);
    navigateTo('/');

    try {
      const response = await fetch('/api/osint/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyA, websiteA, companyB, websiteB })
      }).catch(() => null);

      let data = null;
      if (response && response.ok) {
        data = await response.json().catch(() => null);
      }

      if (!data || !data.reportA) {
        const reportA = await processClientSideOSINT(companyA, websiteA);
        const reportB = await processClientSideOSINT(companyB, websiteB);
        data = { reportA, reportB };
      }

      setComparisonReport(data);
      setActiveTab('compare');

    } catch (err) {
      console.error('Compare Error:', err);
      const reportA = await processClientSideOSINT(companyA, websiteA);
      const reportB = await processClientSideOSINT(companyB, websiteB);
      setComparisonReport({ reportA, reportB });
      setActiveTab('compare');
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = () => {
    if (user) {
      const historyKey = `osint_tecno3f_history_${user.id}`;
      localStorage.removeItem(historyKey);
      setHistory([]);
    }
  };

  const handleReset = () => {
    setReport(null);
    setComparisonReport(null);
    setError(null);
    setActiveTab('overview');
    setShowHistoryOnly(false);
    navigateTo('/');
  };

  const handleOpenHistory = () => {
    if (!user) return;
    if (report) {
      setActiveTab('history');
      setShowHistoryOnly(false);
    } else {
      setShowHistoryOnly(true);
    }
    navigateTo('/');
  };

  const handleOpenAdmin = () => {
    navigateTo('/admin');
  };

  const handleNavigateHome = () => {
    navigateTo('/');
  };

  const companyName = report?.query?.companyName || '';
  const totalRecs = report?.supportPlan?.totalRecommendations || 0;

  const isAdminRoute = currentPath === '/admin';
  const isUnauthorizedUserOnAdmin = isAdminRoute && user && user.role !== 'admin';

  return (
    <ErrorBoundary>
      <div className="app-container" style={{ filter: !user ? 'blur(4px)' : 'none', opacity: !user ? 0.9 : 1, pointerEvents: !user ? 'none' : 'auto', transition: 'all 0.3s ease' }}>
        <Header
          currentReport={report}
          onReset={handleReset}
          user={user}
          onLogin={handleLogin}
          onLogout={handleLogout}
          onOpenHistory={handleOpenHistory}
          historyCount={history.length}
          theme={theme}
          onToggleTheme={handleToggleTheme}
          onOpenAdmin={handleOpenAdmin}
          onNavigateHome={handleNavigateHome}
          currentPath={currentPath}
          onOpenPresentation={() => setShowPresentation(true)}
          onOpenWatchlist={() => setShowWatchlistModal(true)}
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
              Tu cuenta de usuario (<strong>{user?.username}</strong>, Rol: <code>{user?.role}</code>) no posee privilegios administrativos para ingresar al directorio <code>/admin</code>.
              <br />
              El intento de acceso no autorizado ha sido bloqueado por el sistema de seguridad RBAC.
            </p>
            <button className="btn-primary" onClick={handleNavigateHome} style={{ margin: '0 auto' }}>
              Volver a la Aplicación Principal
            </button>
          </div>
        )}

        {/* Dedicated Admin Directory (/admin) */}
        {!isUnauthorizedUserOnAdmin && isAdminRoute && user?.role === 'admin' && (
          <div>
            <AdminTab />
          </div>
        )}

        {/* Main OSINT Application Layout (non-admin route) */}
        {!isAdminRoute && (
          <>
            <SearchForm
              onScan={handleScan}
              onCompare={handleCompare}
              loading={loading}
              user={user}
              onOpenHistory={handleOpenHistory}
              historyCount={history.length}
            />

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
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
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
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, marginTop: '4px' }}>
                      {scanProgress < 100 ? `Estimado: ~${Math.max(1, Math.ceil((100 - scanProgress) / 45))}s` : '¡Análisis Completado!'}
                    </div>
                  </div>
                </div>

                {/* Progress Track */}
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

                {/* Real-time checklist steps */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '12px', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ fontSize: '0.8rem', color: scanProgress >= 25 ? '#34d399' : '#64748b', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', transition: 'color 0.3s ease' }}>
                    <ShieldCheck size={15} style={{ color: scanProgress >= 25 ? '#34d399' : '#64748b' }} />
                    1. Rastreo Web & Dominio
                  </div>
                  <div style={{ fontSize: '0.8rem', color: scanProgress >= 50 ? '#34d399' : '#64748b', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', transition: 'color 0.3s ease' }}>
                    <ShieldCheck size={15} style={{ color: scanProgress >= 50 ? '#34d399' : '#64748b' }} />
                    2. BCRA & AFIP Impositivo
                  </div>
                  <div style={{ fontSize: '0.8rem', color: scanProgress >= 75 ? '#34d399' : '#64748b', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', transition: 'color 0.3s ease' }}>
                    <ShieldCheck size={15} style={{ color: scanProgress >= 75 ? '#34d399' : '#64748b' }} />
                    3. Marcas INPI & COMPR.AR
                  </div>
                  <div style={{ fontSize: '0.8rem', color: scanProgress >= 95 ? '#34d399' : '#64748b', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', transition: 'color 0.3s ease' }}>
                    <ShieldCheck size={15} style={{ color: scanProgress >= 95 ? '#34d399' : '#64748b' }} />
                    4. Madurez & Kits 4.0
                  </div>
                </div>
              </div>
            )}

            {/* Benchmarking Comparison View */}
            {!loading && comparisonReport && !showHistoryOnly && (
              <div>
                <CompareTab reportA={comparisonReport.reportA} reportB={comparisonReport.reportB} />
              </div>
            )}

            {/* OSINT Report View */}
            {!loading && report && !comparisonReport && !showHistoryOnly && (
              <div>
                {/* Navigation Tabs Navbar */}
                <nav className="tab-navbar">
                  <button className={`nav-tab-item ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
                    <LayoutDashboard size={16} /> Resumen General
                  </button>

                  <button className={`nav-tab-item ${activeTab === 'projects' ? 'active' : ''}`} onClick={() => setActiveTab('projects')}>
                    <Briefcase size={16} /> Perfil Comercial & Web
                  </button>
                  <button className={`nav-tab-item ${activeTab === 'answers' ? 'active' : ''}`} onClick={() => setActiveTab('answers')}>
                    <HelpCircle size={16} /> Modelo de Negocio
                  </button>
                  <button className={`nav-tab-item ${activeTab === 'swot' ? 'active' : ''}`} onClick={() => setActiveTab('swot')}>
                    <Target size={16} /> Matriz FODA
                  </button>
                  <button className={`nav-tab-item ${activeTab === 'digital' ? 'active' : ''}`} onClick={() => setActiveTab('digital')}>
                    <Cpu size={16} /> Transformación Digital
                  </button>
                  <button className={`nav-tab-item ${activeTab === 'legal' ? 'active' : ''}`} onClick={() => setActiveTab('legal')}>
                    <Scale size={16} /> Rastreo Judicial & Legal
                  </button>
                  <button className={`nav-tab-item ${activeTab === 'contracts' ? 'active' : ''}`} onClick={() => setActiveTab('contracts')}>
                    <FileCheck size={16} /> Contratos Públicos
                  </button>
                  <button className={`nav-tab-item ${activeTab === 'financial' ? 'active' : ''}`} onClick={() => setActiveTab('financial')}>
                    <Landmark size={16} /> Deudas, Balances & Fiscal
                  </button>
                  <button className={`nav-tab-item ${activeTab === 'news' ? 'active' : ''}`} onClick={() => setActiveTab('news')}>
                    <Newspaper size={16} /> Noticias & Prensa
                  </button>
                  <button className={`nav-tab-item ${activeTab === 'support' ? 'active' : ''}`} onClick={() => setActiveTab('support')}>
                    <HeartHandshake size={16} /> Plan de Apoyo ({totalRecs})
                  </button>
                  {user && (
                    <button className={`nav-tab-item ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>
                      <History size={16} /> Historial ({history.length})
                    </button>
                  )}
                </nav>

                {/* Active Tab Panel */}
                {activeTab === 'overview' && <OverviewTab report={report} onTabChange={setActiveTab} />}
                {activeTab === 'projects' && <ProjectsTab scrapedData={report.scrapedData || {}} categorization={report.categorization || {}} companyName={companyName} />}
                {activeTab === 'answers' && <BusinessAnswersTab businessAnswers={report.scrapedData?.businessAnswers || {}} companyName={companyName} />}
                {activeTab === 'swot' && <SwotTab swotAnalysis={report.swotAnalysis || {}} companyName={companyName} />}
                {activeTab === 'digital' && <DigitalTransformationTab digitalData={report.digitalTransformation || {}} companyName={companyName} />}
                {activeTab === 'legal' && <LegalTab legalData={report.legalData || {}} companyName={companyName} />}
                {activeTab === 'contracts' && <PublicContractsTab publicContracts={report.publicContracts || {}} companyName={companyName} />}
                {activeTab === 'financial' && <FinancialTab financialData={report.financialData || {}} />}
                {activeTab === 'news' && <NewsTab searchData={report.searchData || {}} companyName={companyName} />}
                {activeTab === 'support' && <SupportTab supportPlan={report.supportPlan || {}} companyName={companyName} />}
                {user && activeTab === 'history' && <HistoryTab history={history} onLoadReport={handleLoadReportFromHistory} onClearHistory={handleClearHistory} />}
              </div>
            )}

            {/* Landing / History View */}
            {!loading && (showHistoryOnly || (!report && !comparisonReport)) && (
              <div>
                {showHistoryOnly && user ? (
                  <div>
                    <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Historial de Búsquedas de {user.username || user.name}</h3>
                      <button className="btn-secondary" onClick={() => setShowHistoryOnly(false)}>
                        Volver al Inicio
                      </button>
                    </div>
                    <HistoryTab
                      history={history}
                      onLoadReport={handleLoadReportFromHistory}
                      onClearHistory={handleClearHistory}
                    />
                  </div>
                ) : (
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
                        <button className="btn-secondary" onClick={handleOpenHistory} style={{ borderColor: 'rgba(37, 99, 235, 0.4)', color: '#60a5fa' }}>
                          <History size={16} /> Ver mi historial ({history.length})
                        </button>
                      )}
                      {user?.role === 'admin' && (
                        <button className="btn-secondary" onClick={handleOpenAdmin} style={{ borderColor: 'rgba(168, 85, 247, 0.4)', color: '#c084fc' }}>
                          <ShieldCheck size={16} /> Panel Administrador
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* Floating Interactive RAG AI Chatbot */}
        <OsintChatbot currentReport={report} />

        {/* Executive Deck Fullscreen Presentation Mode */}
        {showPresentation && (
          <PresentationModal
            report={report}
            onClose={() => setShowPresentation(false)}
          />
        )}

        {/* Watchlist & Active Monitoring Modal */}
        <WatchlistModal
          isOpen={showWatchlistModal}
          onClose={() => setShowWatchlistModal(false)}
          currentCompany={report?.query}
        />
        {/* Application Footer */}
        <Footer />
      </div>
    </ErrorBoundary>
  );
}
