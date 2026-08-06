import React, { useState, useEffect } from 'react';
import { Eye, Bell, Plus, Trash2, ShieldAlert, CheckCircle2, RefreshCw, X, Landmark, ExternalLink } from 'lucide-react';

export default function WatchlistModal({ isOpen, onClose, currentCompany = null }) {
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newCompName, setNewCompName] = useState('');
  const [newCuit, setNewCuit] = useState('');
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const fetchWatchlist = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/watchlist');
      const data = await res.json();
      if (data.success && Array.isArray(data.watchlist)) {
        setWatchlist(data.watchlist);
      }
    } catch (e) {
      setError('No se pudo conectar con el servicio de monitoreo.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchWatchlist();
      if (currentCompany) {
        setNewCompName(currentCompany.companyName || currentCompany);
      }
    }
  }, [isOpen, currentCompany]);

  const handleAddCompany = async (e) => {
    e.preventDefault();
    if (!newCompName.trim()) return;

    setError(null);
    setSuccessMsg(null);

    try {
      const res = await fetch('/api/watchlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyName: newCompName.trim(), cuit: newCuit.trim() })
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg(`"${newCompName.trim()}" añadida a la lista de monitoreo activo.`);
        setNewCompName('');
        setNewCuit('');
        fetchWatchlist();
      } else {
        setError(data.error || 'Error al añadir empresa.');
      }
    } catch (e) {
      setError('Error de conexión.');
    }
  };

  const handleDeleteWatch = async (id, companyName) => {
    if (!window.confirm(`¿Quitar "${companyName}" del monitoreo activo?`)) return;

    try {
      const res = await fetch(`/api/watchlist/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setWatchlist(prev => prev.filter(w => w.id !== id));
      }
    } catch (e) {}
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(5, 10, 20, 0.82)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '20px'
    }}>
      <div className="saas-card" style={{ width: '100%', maxWidth: '780px', maxHeight: '90vh', overflowY: 'auto', padding: '32px', border: '1px solid rgba(56, 189, 248, 0.3)', boxShadow: '0 20px 60px rgba(0,0,0,0.6)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '14px' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px', color: '#38bdf8' }}>
            <Eye size={24} /> Watchlist & Monitoreo Activo OSINT
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={22} />
          </button>
        </div>

        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
          Supervisión periódica de la Central de Deudores BCRA, cheques rechazados y boletines judiciales. El sistema re-escanea automáticamente cada 10 minutos y emite alertas en vivo si detecta cambios de riesgo.
        </p>

        {/* Add Company Form */}
        <form onSubmit={handleAddCompany} style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-subtle)', padding: '18px', borderRadius: '12px', marginBottom: '24px', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: '1 1 200px' }}>
            <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Nombre de Empresa</label>
            <input
              type="text"
              placeholder="ej: Baigorria Industrial"
              value={newCompName}
              onChange={(e) => setNewCompName(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-subtle)', borderRadius: '8px', color: '#fff', fontSize: '0.9rem', marginTop: '4px' }}
            />
          </div>

          <div style={{ flex: '1 1 160px' }}>
            <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>CUIT (Opcional)</label>
            <input
              type="text"
              placeholder="30-71234567-8"
              value={newCuit}
              onChange={(e) => setNewCuit(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-subtle)', borderRadius: '8px', color: '#fff', fontSize: '0.9rem', marginTop: '4px' }}
            />
          </div>

          <button type="submit" className="btn-primary" style={{ height: '42px', padding: '0 20px', gap: '8px' }}>
            <Plus size={16} /> Añadir a Monitoreo
          </button>
        </form>

        {error && <div style={{ background: 'rgba(244,63,94,0.12)', border: '1px solid rgba(244,63,94,0.3)', color: '#f87171', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.85rem' }}>{error}</div>}
        {successMsg && <div style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)', color: '#34d399', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.85rem' }}>{successMsg}</div>}

        {/* Monitored List */}
        <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '14px', color: 'var(--text-secondary)' }}>
          Empresas en Supervisión Activa ({watchlist.length})
        </h3>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
            <RefreshCw size={24} className="spin" style={{ marginBottom: '10px' }} />
            <div>Cargando lista de monitoreo...</div>
          </div>
        ) : watchlist.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {watchlist.map(item => (
              <div key={item.id} style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-subtle)', padding: '16px', borderRadius: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '10px' }}>
                  <div>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f8fafc' }}>{item.companyName}</h4>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>CUIT: {item.cuit || 'N/D'} • Agregada: {new Date(item.addedAt).toLocaleDateString('es-AR')}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ background: 'rgba(16, 185, 129, 0.12)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '4px 10px', borderRadius: '12px', fontSize: '0.74rem', fontWeight: 700 }}>
                      ✔ {item.status}
                    </span>
                    <button onClick={() => handleDeleteWatch(item.id, item.companyName)} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', padding: '4px' }}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Recent Alerts */}
                {item.alerts && item.alerts.length > 0 && (
                  <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {item.alerts.slice(0, 3).map((alt, idx) => (
                      <div key={idx} style={{ background: alt.severity === 'warning' ? 'rgba(245, 158, 11, 0.08)' : 'rgba(255,255,255,0.02)', borderLeft: `3px solid ${alt.severity === 'warning' ? '#f59e0b' : '#38bdf8'}`, padding: '8px 12px', borderRadius: '6px', fontSize: '0.82rem' }}>
                        <div style={{ fontWeight: 700, color: alt.severity === 'warning' ? '#fbbf24' : '#60a5fa' }}>{alt.title}</div>
                        <div style={{ color: 'var(--text-secondary)', marginTop: '2px' }}>{alt.message}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div style={{ color: 'var(--text-muted)', padding: '30px', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '10px' }}>
            No hay empresas añadidas al monitoreo activo. Ingresa un nombre arriba para iniciar la supervisión periódica.
          </div>
        )}
      </div>
    </div>
  );
}
