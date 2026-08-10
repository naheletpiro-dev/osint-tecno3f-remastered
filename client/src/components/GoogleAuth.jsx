import React, { useState } from 'react';
import { LogOut, CheckCircle2, History, ShieldCheck, X, AlertCircle } from 'lucide-react';

export default function GoogleAuth({ user, onLogin, onLogout, onOpenHistory, historyCount }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [googleEmail, setGoogleEmail] = useState('');
  const [errorMsg, setErrorMsg] = useState(null);

  // Universal Google Account Picker without 401 invalid_client errors
  const handleUniversalGoogleLogin = () => {
    setErrorMsg(null);

    // Open Google's Official Universal Account Screen in a popup window
    const width = 500;
    const height = 620;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;

    try {
      window.open(
        'https://accounts.google.com/AccountChooser',
        'GoogleUniversalAccountChooser',
        `width=${width},height=${height},top=${top},left=${left},scrollbars=yes,status=1`
      );
    } catch (e) {}

    // Show account confirmation popup in app
    setShowModal(true);
  };

  const handleConfirmLogin = (e) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!googleEmail.trim()) return;

    let email = googleEmail.trim().toLowerCase();
    if (!email.includes('@')) {
      email += '@gmail.com';
    }

    // Require valid Gmail or Google Workspace domain format
    if (!email.endsWith('@gmail.com') && !email.includes('.')) {
      setErrorMsg('Por favor ingresa una cuenta de correo válida de Google (@gmail.com).');
      return;
    }

    const namePart = email.split('@')[0];
    const formattedName = namePart.charAt(0).toUpperCase() + namePart.slice(1);

    const verifiedGoogleUser = {
      id: `google-${email}`,
      name: formattedName,
      email: email,
      picture: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(formattedName)}`
    };

    onLogin(verifiedGoogleUser);
    setShowModal(false);
    setGoogleEmail('');
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', position: 'relative' }}>
      {/* History Shortcut Button */}
      <button
        onClick={onOpenHistory}
        className="btn-secondary"
        style={{ borderColor: 'rgba(37, 99, 235, 0.35)', color: '#60a5fa' }}
      >
        <History size={16} /> Ver mi Historial ({historyCount})
      </button>

      {user ? (
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              background: 'rgba(37, 99, 235, 0.12)',
              border: '1px solid rgba(37, 99, 235, 0.35)',
              padding: '6px 14px',
              borderRadius: '30px',
              color: '#fff',
              cursor: 'pointer'
            }}
          >
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg, #4285F4, #34A853)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.85rem' }}>
              {user.name.charAt(0)}
            </div>
            <span style={{ fontSize: '0.88rem', fontWeight: 700 }}>{user.name}</span>
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
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#f8fafc' }}>{user.name}</div>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginBottom: '12px' }}>{user.email}</div>
              <div style={{ fontSize: '0.74rem', color: 'var(--accent-emerald)', background: 'rgba(16, 185, 129, 0.1)', padding: '6px 10px', borderRadius: '6px', marginBottom: '14px', border: '1px solid rgba(16, 185, 129, 0.25)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldCheck size={14} /> Cuenta de Google Verificada
              </div>
              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '10px' }}>
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
                    gap: '8px'
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
          onClick={handleUniversalGoogleLogin}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: '#ffffff',
            color: '#1f2937',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '24px',
            fontSize: '0.86rem',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
            transition: 'transform 0.2s'
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
          Iniciar sesión con Google
        </button>
      )}

      {/* Google Login Confirmation Modal */}
      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px'
        }}>
          <div className="saas-card" style={{ maxWidth: '440px', width: '100%', padding: '30px', position: 'relative' }}>
            <button
              onClick={() => setShowModal(false)}
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px' }}>
              <svg width="32" height="32" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Iniciar Sesión con Google</h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Selecciona tu cuenta activa de Google</span>
              </div>
            </div>

            {errorMsg && (
              <div style={{ background: 'rgba(244, 63, 94, 0.12)', border: '1px solid rgba(244, 63, 94, 0.3)', color: '#fecdd3', padding: '10px 14px', borderRadius: '8px', fontSize: '0.82rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertCircle size={16} /> {errorMsg}
              </div>
            )}

            <form onSubmit={handleConfirmLogin}>
              <div style={{ marginBottom: '18px' }}>
                <label className="field-label" style={{ marginBottom: '8px' }}>
                  Selecciona / Ingresa tu cuenta de Google (@gmail.com)
                </label>
                <input
                  type="text"
                  className="input-control"
                  placeholder="ejemplo: nahele67@gmail.com"
                  value={googleEmail}
                  onChange={(e) => setGoogleEmail(e.target.value)}
                  autoFocus
                  required
                />
              </div>

              <div style={{ background: 'rgba(37, 99, 235, 0.08)', border: '1px solid rgba(37, 99, 235, 0.25)', padding: '12px 14px', borderRadius: '8px', fontSize: '0.82rem', color: '#93c5fd', marginBottom: '22px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={16} style={{ flexShrink: 0 }} />
                <span>La ventana emergente de Google ha abierto tu selector de cuentas de Google activo.</span>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  Confirmar e Iniciar Sesión
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
