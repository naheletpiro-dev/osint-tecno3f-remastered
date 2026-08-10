import React, { useState, useEffect } from 'react';
import { Search, Building2, Globe, MapPin, Sparkles, History, Scale, ShieldCheck } from 'lucide-react';
import { isValidCuit, formatCuitInput } from '../utils/cuitValidator';

export default function SearchForm({ onScan, onCompare, loading, user, onOpenHistory, historyCount }) {
  const [isCompareMode, setIsCompareMode] = useState(false);

  // Individual Scan
  const [companyName, setCompanyName] = useState('');
  const [cuit, setCuit] = useState('');
  const [website, setWebsite] = useState('');
  const [region, setRegion] = useState('AR');

  const handleCuitChange = (e) => {
    const val = e.target.value;
    setCuit(formatCuitInput(val));
  };

  const isCuitFilled = cuit.replace(/\D/g, '').length > 0;
  const isCuitValid = isValidCuit(cuit);

  // Compare Mode
  const [companyA, setCompanyA] = useState('');
  const [websiteA, setWebsiteA] = useState('');
  const [companyB, setCompanyB] = useState('');
  const [websiteB, setWebsiteB] = useState('');

  const [samples, setSamples] = useState([
    { name: 'Smartmation', website: 'smartmation.com' },
    { name: 'Baigorria Industrial', website: 'baigorriaindustrial.com' },
    { name: 'BombasNIR', website: 'bombasnir.com.ar' }
  ]);

  useEffect(() => {
    fetch('/api/osint/samples')
      .then(res => {
        if (!res.ok) throw new Error('Http error');
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data) && data.length > 0) setSamples(data);
      })
      .catch(() => {});
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isCompareMode) {
      if (!companyA.trim() || !companyB.trim()) return;
      onCompare({ companyA, websiteA, companyB, websiteB });
    } else {
      if (!companyName.trim() && !isCuitValid) return;
      onScan({ companyName, website, region, cuit: isCuitValid ? cuit : null });
    }
  };

  const handleSelectSample = (sample) => {
    if (isCompareMode) {
      if (!companyA) {
        setCompanyA(sample.name);
        setWebsiteA(sample.website || '');
      } else {
        setCompanyB(sample.name);
        setWebsiteB(sample.website || '');
      }
    } else {
      setCompanyName(sample.name);
      setWebsite(sample.website || '');
    }
  };

  return (
    <div className="search-panel">
      {/* Mode Selector Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '14px' }}>
        <button
          type="button"
          onClick={() => setIsCompareMode(false)}
          style={{
            background: !isCompareMode ? 'rgba(37, 99, 235, 0.2)' : 'transparent',
            border: !isCompareMode ? '1px solid #3b82f6' : '1px solid transparent',
            color: !isCompareMode ? '#fff' : 'var(--text-secondary)',
            padding: '8px 18px',
            borderRadius: '12px',
            fontWeight: 700,
            fontSize: '0.88rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Search size={16} /> Investigación Individual
        </button>

        <button
          type="button"
          onClick={() => setIsCompareMode(true)}
          style={{
            background: isCompareMode ? 'rgba(139, 92, 246, 0.2)' : 'transparent',
            border: isCompareMode ? '1px solid #8b5cf6' : '1px solid transparent',
            color: isCompareMode ? '#fff' : 'var(--text-secondary)',
            padding: '8px 18px',
            borderRadius: '12px',
            fontWeight: 700,
            fontSize: '0.88rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Scale size={16} /> Modo Comparador (2 Empresas)
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        {!isCompareMode ? (
          <div className="search-grid">
            <div>
              <label className="field-label">
                <Building2 size={15} style={{ color: 'var(--accent-primary)' }} />
                Nombre de la Empresa {isCuitValid ? '(Opcional con CUIT)' : '*'}
              </label>
              <input
                type="text"
                className="input-control"
                placeholder="Ej: Baigorria Industrial, Mercado Libre, PyME Local..."
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required={!isCuitValid}
              />
            </div>

            <div>
              <label className="field-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>
                  <ShieldCheck size={15} style={{ color: 'var(--accent-primary)' }} /> CUIT Oficial ARCA (Directo)
                </span>
                {isCuitFilled && (
                  <span style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '8px',
                    background: isCuitValid ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                    color: isCuitValid ? '#10b981' : '#ef4444',
                    border: `1px solid ${isCuitValid ? '#10b981' : '#ef4444'}`
                  }}>
                    {isCuitValid ? '✓ Módulo 11 OK' : '✕ CUIT Inválido'}
                  </span>
                )}
              </label>
              <input
                type="text"
                className="input-control"
                placeholder="Ej: 30-67352771-4 o 30673527714"
                value={cuit}
                onChange={handleCuitChange}
                maxLength={13}
              />
            </div>

            <div>
              <label className="field-label">
                <Globe size={15} style={{ color: 'var(--accent-primary)' }} />
                Sitio Web Oficial (Opcional)
              </label>
              <input
                type="text"
                className="input-control"
                placeholder="Ej: baigorriaindustrial.com o https://empresa.com"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
              />
            </div>

            <div>
              <label className="field-label">
                <MapPin size={15} style={{ color: 'var(--accent-primary)' }} />
                Región OSINT
              </label>
              <select
                className="input-control"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                style={{ cursor: 'pointer' }}
              >
                <option value="AR">🇦🇷 Argentina / BCRA / AFIP</option>
                <option value="LATAM">🌎 América Latina</option>
                <option value="GLOBAL">🌐 Global / Internacional</option>
              </select>
            </div>

            <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'center', width: '100%', marginTop: '12px' }}>
              <button
                type="submit"
                className="btn-primary"
                disabled={loading || (!companyName.trim() && !isCuitValid)}
                style={{ minWidth: '280px', display: 'inline-flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
              >
                {loading ? (
                  <>Analizando OSINT...</>
                ) : (
                  <>
                    <Search size={18} /> Investigar Empresa
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '20px' }}>
              {/* Empresa A */}
              <div style={{ background: 'rgba(96, 165, 250, 0.05)', padding: '16px', borderRadius: '14px', border: '1px solid rgba(96, 165, 250, 0.25)' }}>
                <div style={{ fontSize: '0.8rem', color: '#60a5fa', fontWeight: 800, textTransform: 'uppercase', marginBottom: '10px' }}>
                  Empresa A (Principal)
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <input
                    type="text"
                    className="input-control"
                    placeholder="Nombre Empresa A *"
                    value={companyA}
                    onChange={(e) => setCompanyA(e.target.value)}
                    required
                  />
                  <input
                    type="text"
                    className="input-control"
                    placeholder="Sitio Web A (Opcional)"
                    value={websiteA}
                    onChange={(e) => setWebsiteA(e.target.value)}
                  />
                </div>
              </div>

              {/* Empresa B */}
              <div style={{ background: 'rgba(45, 212, 191, 0.05)', padding: '16px', borderRadius: '14px', border: '1px solid rgba(45, 212, 191, 0.25)' }}>
                <div style={{ fontSize: '0.8rem', color: '#2dd4bf', fontWeight: 800, textTransform: 'uppercase', marginBottom: '10px' }}>
                  Empresa B (Competidor / Comparación)
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <input
                    type="text"
                    className="input-control"
                    placeholder="Nombre Empresa B *"
                    value={companyB}
                    onChange={(e) => setCompanyB(e.target.value)}
                    required
                  />
                  <input
                    type="text"
                    className="input-control"
                    placeholder="Sitio Web B (Opcional)"
                    value={websiteB}
                    onChange={(e) => setWebsiteB(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', width: '100%', marginTop: '12px' }}>
              <button
                type="submit"
                className="btn-primary"
                disabled={loading || !companyA.trim() || !companyB.trim()}
                style={{ minWidth: '280px', display: 'inline-flex', justifyContent: 'center', alignItems: 'center', gap: '8px', background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)' }}
              >
                {loading ? (
                  <>Procesando Benchmarking Comparativo...</>
                ) : (
                  <>
                    <Scale size={18} /> Comparar Ambas Empresas Cara a Cara
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </form>

      <div className="sample-bar" style={{ justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Sparkles size={13} style={{ color: 'var(--accent-amber)' }} /> Consultas frecuentes:
          </span>
          {samples.map((s, idx) => (
            <button key={idx} type="button" className="sample-pill" onClick={() => handleSelectSample(s)}>
              {s.name}
            </button>
          ))}
        </div>

        {/* Hero History Button ONLY for logged-in users */}
        {user && (
          <button
            type="button"
            onClick={onOpenHistory}
            style={{
              background: 'rgba(37, 99, 235, 0.12)',
              border: '1px solid rgba(37, 99, 235, 0.35)',
              color: '#60a5fa',
              padding: '6px 16px',
              borderRadius: '20px',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <History size={14} /> Ver mi historial ({historyCount})
          </button>
        )}
      </div>
    </div>
  );
}
