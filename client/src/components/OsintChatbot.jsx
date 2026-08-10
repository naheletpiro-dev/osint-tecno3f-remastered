import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User, Sparkles, RefreshCw, ChevronDown, Brain } from 'lucide-react';

export default function OsintChatbot({ currentReport }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [deepReasoningMode, setDeepReasoningMode] = useState(true);
  const messagesEndRef = useRef(null);

  const companyName = currentReport?.query?.companyName || 'la empresa';

  useEffect(() => {
    if (currentReport) {
      setMessages([
        {
          id: 1,
          sender: 'bot',
          component: (
            <span>
              ¡Hola! Soy <strong><span style={{ color: '#a78bfa' }}>Tecno</span><span style={{ color: '#2dd4bf' }}>bot3F</span></strong>, tu asistente de inteligencia OSINT.<br /><br />
              He analizado el informe completo de <strong style={{ color: '#38bdf8' }}>{companyName}</strong>.<br />
              ¿Qué te gustaría consultar o profundizar?
            </span>
          )
        }
      ]);
    }
  }, [currentReport]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const suggestedQuestions = [
    `¿Cuál es la capacidad licitatoria de ${companyName}?`,
    `¿Qué productos y servicios ofrece de forma verificada?`,
    `¿Tiene deudas, cheques rechazados o juicios?`,
    `Haceme un resumen de sus fortalezas FODA.`
  ];

  const handleSendMessage = async (textToSend) => {
    const query = textToSend || input;
    if (!query.trim() || loading || !currentReport) return;

    const userMsg = { id: Date.now(), sender: 'user', text: query };
    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/osint/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          report: currentReport,
          userQuery: query,
          chatHistory: messages,
          deepReasoningMode
        })
      });

      if (response.ok) {
        const data = await response.json();
        const botMsg = {
          id: Date.now() + 1,
          sender: 'bot',
          text: data.answer || 'No se pudo obtener respuesta.',
          isDeepReasoning: true
        };
        setMessages(prev => [...prev, botMsg]);
      } else {
        setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'bot', text: 'Inconveniente de comunicación con el servicio de Inteligencia Artificial.' }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'bot', text: `Error de conexión: ${err.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  const [isHovered, setIsHovered] = useState(false);

  if (!currentReport) return null;

  return (
    <>
      {/* Floating Toggle Button with Hover Tooltip */}
      {!isOpen && (
        <div
          style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999, display: 'flex', alignItems: 'center', gap: '10px' }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {isHovered && (
            <div
              style={{
                background: 'rgba(15, 23, 42, 0.95)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(139, 92, 246, 0.5)',
                color: '#fff',
                padding: '8px 14px',
                borderRadius: '12px',
                fontSize: '0.86rem',
                fontWeight: 700,
                boxShadow: '0 8px 25px rgba(0,0,0,0.4)',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Brain size={14} style={{ color: '#c084fc' }} /> <span style={{ color: '#a78bfa' }}>Tecno</span><span style={{ color: '#2dd4bf' }}>bot3F</span>
            </div>
          )}

          <button
            onClick={() => setIsOpen(true)}
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
              border: '2px solid rgba(255, 255, 255, 0.2)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 30px rgba(139, 92, 246, 0.45)',
              cursor: 'pointer',
              transition: 'transform 0.2s ease',
              transform: isHovered ? 'scale(1.08)' : 'scale(1)'
            }}
            className="chatbot-trigger-btn"
            title="Tecnobot3F - Chatbot IA"
          >
            <Bot size={28} />
            <span style={{ position: 'absolute', top: '2px', right: '2px', width: '14px', height: '14px', borderRadius: '50%', background: '#10b981', border: '2px solid #0b0f17' }}></span>
          </button>
        </div>
      )}

      {/* Floating Chat Drawer */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: window.innerWidth <= 480 ? '0' : '24px',
            right: window.innerWidth <= 480 ? '0' : '24px',
            width: window.innerWidth <= 480 ? '100%' : '400px',
            maxHeight: window.innerWidth <= 480 ? '100vh' : '620px',
            height: window.innerWidth <= 480 ? '100vh' : '82vh',
            background: 'rgba(15, 23, 42, 0.96)',
            backdropFilter: 'blur(16px)',
            border: window.innerWidth <= 480 ? 'none' : '1px solid rgba(139, 92, 246, 0.4)',
            borderRadius: window.innerWidth <= 480 ? '0' : '22px',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6), 0 0 20px rgba(139, 92, 246, 0.25)',
            zIndex: 9999,
            overflow: 'hidden'
          }}
        >
          {/* Chat Header */}
          <div style={{ padding: '14px 18px', background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(6, 182, 212, 0.15))', borderBottom: '1px solid rgba(139, 92, 246, 0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                <Bot size={20} />
              </div>
              <div>
                <div style={{ fontSize: '0.94rem', fontWeight: 800, color: '#fff' }}>
                  <span style={{ color: '#a78bfa' }}>Tecno</span><span style={{ color: '#2dd4bf' }}>bot3F</span>
                </div>
                <div style={{ fontSize: '0.72rem', color: '#34d399', fontWeight: 700 }}>● {companyName}</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={() => setIsOpen(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px', borderRadius: '8px' }}
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Chat Messages Body */}
          <div style={{ flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {messages.map(msg => (
              <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start' }}>
                <div
                  style={{
                    maxWidth: '85%',
                    padding: '12px 16px',
                    borderRadius: msg.sender === 'user' ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                    background: msg.sender === 'user' ? 'linear-gradient(135deg, #2563eb, #1d4ed8)' : 'rgba(30, 41, 59, 0.9)',
                    border: msg.sender === 'user' ? 'none' : '1px solid rgba(255,255,255,0.08)',
                    color: '#fff',
                    fontSize: '0.88rem',
                    lineHeight: '1.55',
                    whiteSpace: 'pre-wrap'
                  }}
                >
                  {msg.sender === 'bot' && deepReasoningMode && msg.id !== 1 && (
                    <div style={{ fontSize: '0.68rem', color: '#c084fc', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      <Brain size={11} /> Respuesta Verificada
                    </div>
                  )}
                  {msg.component ? msg.component : (
                    msg.text ? msg.text.split(/(\*\*.*?\*\*)/g).map((part, idx) => {
                      if (part.startsWith('**') && part.endsWith('**')) {
                        return <strong key={idx} style={{ color: '#38bdf8', fontWeight: 800 }}>{part.slice(2, -2)}</strong>;
                      }
                      return part;
                    }) : ''
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#c4b5fd', fontSize: '0.82rem', padding: '8px 12px', background: 'rgba(168, 85, 247, 0.1)', borderRadius: '10px', border: '1px solid rgba(168, 85, 247, 0.25)' }}>
                <RefreshCw size={14} className="spinner" style={{ color: '#c084fc' }} />
                <span>🧠 <strong>Analizando datos:</strong> Verificando registros de la empresa...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Quick Questions */}
          {messages.length < 4 && !loading && (
            <div style={{ padding: '8px 14px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Sparkles size={12} style={{ color: 'var(--accent-amber)' }} /> Sugerencias rápidas:
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {suggestedQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(q)}
                    style={{
                      textAlign: 'left',
                      background: 'rgba(139, 92, 246, 0.08)',
                      border: '1px solid rgba(139, 92, 246, 0.25)',
                      color: '#c4b5fd',
                      padding: '6px 10px',
                      borderRadius: '8px',
                      fontSize: '0.78rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Chat Input Bar */}
          <form
            onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
            style={{ padding: '12px 14px', background: 'rgba(15, 23, 42, 0.98)', borderTop: '1px solid var(--border-subtle)', display: 'flex', gap: '8px' }}
          >
            <input
              type="text"
              className="input-control"
              placeholder={`Preguntá sobre ${companyName}...`}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              style={{ fontSize: '0.86rem', padding: '10px 14px' }}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              style={{
                background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
                border: 'none',
                color: '#fff',
                width: '42px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                opacity: (loading || !input.trim()) ? 0.5 : 1
              }}
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
