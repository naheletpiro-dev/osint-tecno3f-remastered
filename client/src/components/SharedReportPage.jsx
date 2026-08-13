import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { LayoutDashboard, Briefcase, HelpCircle, Target, Scale, Landmark, Newspaper, HeartHandshake, FileCheck, Cpu, Layers, AlertCircle, ExternalLink, Lock, Download } from 'lucide-react';

import OverviewTab from './OverviewTab';
import ProjectsTab from './ProjectsTab';
import BusinessAnswersTab from './BusinessAnswersTab';
import SwotTab from './SwotTab';
import DigitalTransformationTab from './DigitalTransformationTab';
import LegalTab from './LegalTab';
import PublicContractsTab from './PublicContractsTab';
import FinancialTab from './FinancialTab';
import NewsTab from './NewsTab';
import SupportTab from './SupportTab';

const TABS = [
  { key: 'overview',  label: 'Resumen General',    icon: LayoutDashboard },
  { key: 'projects',  label: 'Perfil Comercial',   icon: Briefcase },
  { key: 'answers',   label: 'Modelo Negocio',     icon: HelpCircle },
  { key: 'swot',      label: 'Matriz FODA',        icon: Target },
  { key: 'digital',   label: 'Tr. Digital',        icon: Cpu },
  { key: 'legal',     label: 'Legal & Judicial',   icon: Scale },
  { key: 'contracts', label: 'Contratos Públicos', icon: FileCheck },
  { key: 'financial', label: 'Deudas Fiscales',    icon: Landmark },
  { key: 'news',      label: 'Prensa',             icon: Newspaper },
  { key: 'support',   label: 'Apoyo',              icon: HeartHandshake },
];

export default function SharedReportPage() {
  const { token } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetch(`/api/share/${token}`)
      .then(r => r.json())
      .then(data => {
        if (data.success && data.report) setReport(data.report);
        else setError(data.error || 'Link no válido o expirado.');
      })
      .catch(() => setError('No se pudo cargar el análisis.'))
      .finally(() => setLoading(false));
  }, [token]);

  const companyName = report?.query?.companyName || '';
  const totalRecs = report?.supportPlan?.totalRecommendations || 0;

  const renderTab = () => {
    if (!report) return null;
    switch (activeTab) {
      case 'overview':   return <OverviewTab report={report} onTabChange={setActiveTab} />;
      case 'projects':   return <ProjectsTab scrapedData={report.scrapedData || {}} categorization={report.categorization || {}} companyName={companyName} />;
      case 'answers':    return <BusinessAnswersTab businessAnswers={report.scrapedData?.businessAnswers || {}} companyName={companyName} />;
      case 'swot':       return <SwotTab swotAnalysis={report.swotAnalysis || {}} companyName={companyName} />;
      case 'digital':    return <DigitalTransformationTab digitalData={report.digitalTransformation || {}} companyName={companyName} />;
      case 'legal':      return <LegalTab legalData={report.legalData || {}} companyName={companyName} />;
      case 'contracts':  return <PublicContractsTab publicContracts={report.publicContracts || {}} companyName={companyName} />;
      case 'financial':  return <FinancialTab financialData={report.financialData || {}} />;
      case 'news':       return <NewsTab searchData={report.searchData || {}} legalData={report.legalData || {}} companyName={companyName} />;
      case 'support':    return <SupportTab supportPlan={report.supportPlan || {}} companyName={companyName} />;
      default:           return <OverviewTab report={report} onTabChange={setActiveTab} />;
    }
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px', background: 'var(--bg-primary, #0a0f1e)' }}>
      <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(56,189,248,0.12)', color: '#38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Layers size={28} className="spinner" />
      </div>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Cargando análisis compartido...</p>
    </div>
  );

  if (error) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px', background: 'var(--bg-primary, #0a0f1e)', padding: '24px' }}>
      <div style={{ background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.3)', borderRadius: '20px', padding: '48px 36px', textAlign: 'center', maxWidth: '440px' }}>
        <AlertCircle size={48} style={{ color: '#f43f5e', marginBottom: '16px' }} />
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f43f5e', marginBottom: '10px' }}>Link inválido o expirado</h2>
        <p style={{ color: '#fecdd3', fontSize: '0.92rem', lineHeight: '1.6', marginBottom: '24px' }}>{error}</p>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>Los links públicos tienen una vigencia de 45 días.</p>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary, #0a0f1e)' }}>
      {/* Read-only header */}
      <div style={{ background: 'linear-gradient(135deg, rgba(15,23,42,0.98), rgba(30,41,59,0.98))', borderBottom: '1px solid rgba(56,189,248,0.2)', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', position: 'sticky', top: 0, zIndex: 100, backdropFilter: 'blur(12px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ background: 'rgba(56,189,248,0.12)', color: '#38bdf8', padding: '10px', borderRadius: '10px' }}>
            <Layers size={22} />
          </div>
          <div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary, #f1f5f9)' }}>Análisis OSINT — {companyName}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Lock size={11} /> Vista de solo lectura compartida · OSINT Tecno3F
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={() => {
              import('../utils/pdfReportGenerator').then(({ downloadFullPdfReport }) => {
                downloadFullPdfReport(report);
              });
            }}
            style={{ fontSize: '0.82rem', color: '#10b981', background: 'rgba(16,185,129,0.1)', padding: '6px 14px', borderRadius: '20px', border: '1px solid rgba(16,185,129,0.3)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Download size={13} /> Descargar PDF
          </button>
          <a href="/" style={{ fontSize: '0.82rem', color: '#60a5fa', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(37,99,235,0.1)', padding: '6px 14px', borderRadius: '20px', border: '1px solid rgba(37,99,235,0.3)' }}>
            <ExternalLink size={13} /> Acceder a la plataforma
          </a>
        </div>
      </div>

      <div style={{ padding: '0 20px 40px 20px', maxWidth: '1400px', margin: '0 auto' }}>
        <nav className="tab-navbar" style={{ marginTop: '20px' }}>
          {TABS.map(({ key, label, icon: Icon }) => (
            <button key={key} className={`nav-tab-item ${activeTab === key ? 'active' : ''}`} onClick={() => setActiveTab(key)}>
              <Icon size={16} /> {label}{key === 'support' ? ` (${totalRecs})` : ''}
            </button>
          ))}
        </nav>
        <div style={{ marginTop: '20px' }}>{renderTab()}</div>
      </div>

      <div style={{ textAlign: 'center', padding: '24px', borderTop: '1px solid rgba(255,255,255,0.06)', color: 'var(--text-muted, #64748b)', fontSize: '0.78rem' }}>
        Análisis generado por OSINT Tecno3F · Plataforma de Inteligencia Empresarial
      </div>
    </div>
  );
}
