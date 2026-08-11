import React, { Component } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

class GlobalErrorTracker extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('GLOBAL ERROR CAPTURED:', error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: '#090d16',
          color: 'var(--text-primary)',
          padding: '40px 20px',
          fontFamily: 'sans-serif',
          zIndex: 99999999,
          overflowY: 'auto',
          boxSizing: 'border-box'
        }}>
          <div style={{ maxWidth: '800px', margin: '0 auto', background: '#1e1b4b', border: '2px solid #6366f1', padding: '30px', borderRadius: '16px' }}>
            <h2 style={{ color: 'var(--accent-rose)', fontSize: '1.4rem', marginBottom: '12px' }}>🚨 Diagnosticador de Errores OSINT Tecno3F</h2>
            <p style={{ color: '#cbd5e1', marginBottom: '20px', fontSize: '0.95rem' }}>
              Se ha capturado un error en la aplicación cliente. Detalle técnico a continuación:
            </p>
            <pre style={{ background: 'var(--bg-input)', color: 'var(--accent-rose)', padding: '16px', borderRadius: '8px', overflowX: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-all', fontFamily: 'monospace', fontSize: '0.9rem' }}>
              {this.state.error?.toString()}
              {'\n\n'}
              {this.state.errorInfo?.componentStack}
            </pre>
            <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
              <button
                onClick={() => {
                  localStorage.clear();
                  sessionStorage.clear();
                  window.location.reload();
                }}
                style={{ background: 'var(--accent-primary)', color: 'var(--text-primary)', border: 'none', padding: '12px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                Limpiar Datos de Sesión y Reiniciar
              </button>
              <button
                onClick={() => window.location.reload()}
                style={{ background: 'var(--border-subtle)', color: 'var(--text-primary)', border: 'none', padding: '12px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                Reintentar Carga
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

import { BrowserRouter } from 'react-router-dom';

// Global unhandled promise rejection listener
window.addEventListener('unhandledrejection', event => {
  console.error('UNHANDLED PROMISE REJECTION:', event.reason);
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GlobalErrorTracker>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </GlobalErrorTracker>
  </React.StrictMode>
);
