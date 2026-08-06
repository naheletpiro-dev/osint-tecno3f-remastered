import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { LogIn, X, ShieldCheck, Lock, User, CheckCircle2, History, LogOut, AlertCircle, Eye, EyeOff } from 'lucide-react';

export default function AuthModal({ user, onLogin, onLogout, onOpenHistory, historyCount, isForcedLock = false, onOpenAdmin }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Form Fields (Username & Password)
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [keepSession, setKeepSession] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setUsername('');
    setPassword('');
    setShowPassword(false);
    setKeepSession(true);
    setErrorMsg(null);
  };

  // LOGIN USER WITH USERNAME & PASSWORD
  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanUsername = username.trim();
    if (!cleanUsername || !password.trim()) {
      setErrorMsg('Ingresa tu nombre de usuario y contraseña.');
      return;
    }

    setLoading(true);

    try {
      let data = null;
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: cleanUsername, password })
      }).catch(() => null);

      if (res) {
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Error al iniciar sesión.');
        data = json;
      }

      // Fallback local check
      if (!data) {
        if (cleanUsername.toLowerCase() === 'tecno3f' && password === 'T3cn03F') {
          data = { success: true, user: { id: 'usr-admin-001', username: 'Tecno3F', role: 'admin', status: 'active' } };
        } else {
          throw new Error('Credenciales inválidas o servidor desconectado.');
        }
      }

      onLogin({ ...data.user, token: data.token }, keepSession);
      setShowModal(false);
      resetForm();

    } catch (err) {
      setErrorMsg(err.message || 'Error al iniciar sesión.');
    } finally {
      setLoading(false);
    }
  };

  const isModalOpen = showModal || isForcedLock;

  const modalJSX = isModalOpen ? (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(11, 15, 23, 0.75)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2147483647,
        padding: '20px',
        boxSizing: 'border-box',
        pointerEvents: 'auto'
      }}
    >
      <div
        style={{
          maxWidth: '440px',
          width: '100%',
          padding: '34px 30px',
          position: 'relative',
          background: '#0f172a',
          borderRadius: '24px',
          border: '1px solid rgba(37, 99, 235, 0.45)',
          boxShadow: '0 30px 80px rgba(0,0,0,0.95), 0 0 40px rgba(37, 99, 235, 0.2)',
          maxHeight: '90vh',
          overflowY: 'auto',
          color: '#f8fafc',
          zIndex: 2147483647,
          pointerEvents: 'auto'
        }}
      >
        {!isForcedLock && (
          <button
            onClick={() => setShowModal(false)}
            style={{
              position: 'absolute',
              top: '18px',
              right: '18px',
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '6px'
            }}
          >
            <X size={22} />
          </button>
        )}

        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(37, 99, 235, 0.15)', border: '1px solid rgba(37, 99, 235, 0.4)', color: '#60a5fa', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px auto' }}>
            <Lock size={28} />
          </div>
          <h3 style={{ fontSize: '1.35rem', fontWeight: 800 }}>
            Bienvenido a OSINT <span style={{ whiteSpace: 'nowrap' }}><span style={{ color: '#a78bfa' }}>Tecno</span><span style={{ color: '#2dd4bf' }}>3F</span></span>
          </h3>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: '1.4' }}>
            Inicia sesión con tu cuenta de usuario para desbloquear la herramienta de investigacion.
          </p>
        </div>

        {errorMsg && (
          <div style={{ background: 'rgba(244, 63, 94, 0.12)', border: '1px solid rgba(244, 63, 94, 0.3)', color: '#fecdd3', padding: '12px 16px', borderRadius: '10px', fontSize: '0.85rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} /> {errorMsg}
          </div>
        )}

        {/* LOGIN FORM */}
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '18px' }}>
            <label className="field-label" style={{ marginBottom: '6px' }}>
              <User size={15} /> Nombre de Usuario *
            </label>
            <input
              type="text"
              className="input-control"
              placeholder="Nombre de usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
              required
            />
          </div>

          <div style={{ marginBottom: '18px' }}>
            <label className="field-label" style={{ marginBottom: '6px' }}>
              <Lock size={15} /> Contraseña *
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? "text" : "password"}
                className="input-control"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingRight: '44px' }}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(prev => !prev)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '4px'
                }}
                title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div style={{ marginBottom: '22px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
              <input
                type="checkbox"
                checked={keepSession}
                onChange={(e) => setKeepSession(e.target.checked)}
                style={{ accentColor: '#2563eb', width: '17px', height: '17px', cursor: 'pointer' }}
              />
              <span>Mantener sesión activa en este equipo</span>
            </label>
          </div>

          <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: '0.98rem' }}>
            {loading ? 'Verificando...' : <><LogIn size={18} /> Iniciar Sesión</>}
          </button>
        </form>
      </div>
    </div>
  ) : null;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', position: 'relative' }}>
      {user && (
        <button
          onClick={onOpenHistory}
          className="btn-secondary"
          style={{ borderColor: 'rgba(37, 99, 235, 0.35)', color: '#60a5fa' }}
        >
          <History size={16} /> Ver mi Historial ({historyCount})
        </button>
      )}

      {user ? (
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              background: 'rgba(37, 99, 235, 0.15)',
              border: '1px solid rgba(37, 99, 235, 0.4)',
              padding: '6px 16px',
              borderRadius: '30px',
              color: '#fff',
              cursor: 'pointer'
            }}
          >
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: user.role === 'admin' ? 'linear-gradient(135deg, #a855f7, #2563eb)' : 'linear-gradient(135deg, #2563eb, #06b6d4)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.85rem' }}>
              {(user.username || 'U').charAt(0).toUpperCase()}
            </div>
            <span style={{ fontSize: '0.88rem', fontWeight: 700 }}>{user.username}</span>
            {user.role === 'admin' && (
              <span style={{ fontSize: '0.7rem', background: 'rgba(168, 85, 247, 0.25)', color: '#c084fc', padding: '2px 6px', borderRadius: '10px', fontWeight: 800 }}>ADMIN</span>
            )}
            <CheckCircle2 size={14} style={{ color: 'var(--accent-emerald)' }} />
          </button>

          {showDropdown && (
            <div className="saas-card" style={{
              position: 'absolute',
              right: 0,
              top: '46px',
              width: '260px',
              padding: '18px',
              zIndex: 100,
              boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
            }}>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#f8fafc' }}>Usuario: {user.username}</div>
              <div style={{ fontSize: '0.74rem', color: user.role === 'admin' ? '#c084fc' : 'var(--accent-emerald)', background: 'rgba(255,255,255,0.05)', padding: '6px 10px', borderRadius: '6px', margin: '10px 0 14px 0', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldCheck size={14} /> Rol: {user.role === 'admin' ? 'Administrador' : 'Usuario Estándar'}
              </div>
              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {user.role === 'admin' && (
                  <button
                    onClick={() => { setShowDropdown(false); onOpenAdmin(); }}
                    style={{
                      width: '100%',
                      background: 'rgba(168, 85, 247, 0.14)',
                      border: '1px solid rgba(168, 85, 247, 0.35)',
                      color: '#c084fc',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '0.84rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <ShieldCheck size={15} /> Panel Administrador
                  </button>
                )}
                <button
                  onClick={() => { setShowDropdown(false); onLogout(); }}
                  style={{
                    width: '100%',
                    background: 'none',
                    border: 'none',
                    color: 'var(--accent-rose)',
                    cursor: 'pointer',
                    fontSize: '0.84rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '6px 4px'
                  }}
                >
                  <LogOut size={15} /> Cerrar Sesión
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <button
          className="btn-primary"
          onClick={() => { resetForm(); setShowModal(true); }}
          style={{ fontSize: '0.85rem' }}
        >
          <LogIn size={15} /> Iniciar Sesión
        </button>
      )}

      {modalJSX && ReactDOM.createPortal(modalJSX, document.body)}
    </div>
  );
}
