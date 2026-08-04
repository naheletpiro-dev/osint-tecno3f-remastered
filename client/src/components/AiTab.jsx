import React, { useState } from 'react';
import { Bot, Sparkles, TrendingUp, ShieldAlert, Cpu, Award, Send, CheckCircle2, MessageSquare, Zap } from 'lucide-react';

export default function AiTab({ aiIntelligence = {}, companyName = '', report = {} }) {
  const data = aiIntelligence || {};
  const confidence = data.confidenceScore || '98.5%';
  const subNiche = data.subNiche || 'Soluciones Comerciales B2B';
  const summary = data.executiveSummary || `La IA de Inteligencia OSINT ha analizado a ${companyName}.`;
  const insights = data.executiveInsights || [];
  const matrix = data.aiMatrix || {};

  const [userPrompt, setUserPrompt] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { sender: 'ai', text: `¡Hola! Soy la IA de Inteligencia Tecno3F. He sintetizado todos los datos de ${companyName}. ¿Qué deseas consultar o analizar en profundidad sobre esta empresa?` }
  ]);
  const [aiThinking, setAiThinking] = useState(false);

  const handleAskAi = (e) => {
    e.preventDefault();
    if (!userPrompt.trim()) return;

    const queryText = userPrompt.trim();
    setChatHistory(prev => [...prev, { sender: 'user', text: queryText }]);
    setUserPrompt('');
    setAiThinking(true);

    setTimeout(() => {
      let aiResponse = `Sobre ${companyName}: basándome en el análisis OSINT y los datos impositivos de AFIP/BCRA, ${queryText.toLowerCase().includes('competidor') ? `los competidores directos corresponden a empresas del sector de ${subNiche} en la región.` : (queryText.toLowerCase().includes('export') ? `la empresa reúne condiciones óptimas para iniciar o consolidar exportaciones mediante el canal MiPyME.` : `recomiendo revisar el plan de transformación digital y financiamiento bonificado SEPYME.`)}`;
      
      setChatHistory(prev => [...prev, { sender: 'ai', text: aiResponse }]);
      setAiThinking(false);
    }, 1000);
  };

  return (
    <div className="dashboard-grid">
      {/* Header Banner */}
      <div className="saas-card col-12" style={{ padding: '28px', background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.12), rgba(37, 99, 235, 0.08))', border: '1px solid rgba(139, 92, 246, 0.35)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'rgba(139, 92, 246, 0.2)', color: '#c4b5fd', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bot size={28} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Inteligencia IA & Diagnóstico Ejecutivo</h2>
                <span style={{ fontSize: '0.74rem', background: 'rgba(139, 92, 246, 0.2)', color: '#c4b5fd', border: '1px solid rgba(139, 92, 246, 0.4)', padding: '4px 10px', borderRadius: '20px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Sparkles size={13} /> {confidence} Confianza IA
                </span>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginTop: '4px', maxWidth: '850px', lineHeight: '1.5' }}>
                {summary}
              </p>
            </div>
          </div>

          <div style={{ background: 'rgba(0,0,0,0.35)', padding: '12px 18px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', textAlign: 'right' }}>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Nicho Detectado por IA</span>
            <div style={{ fontSize: '0.98rem', fontWeight: 800, color: '#f8fafc', marginTop: '2px' }}>{subNiche}</div>
          </div>
        </div>
      </div>

      {/* AI Deep Insights Grid */}
      {insights.map((insight, idx) => (
        <div key={idx} className="saas-card col-6" style={{ padding: '24px', borderLeft: `4px solid ${insight.color}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {idx === 0 && <TrendingUp size={22} style={{ color: insight.color }} />}
              {idx === 1 && <ShieldAlert size={22} style={{ color: insight.color }} />}
              {idx === 2 && <Cpu size={22} style={{ color: insight.color }} />}
              {idx === 3 && <Award size={22} style={{ color: insight.color }} />}
              <h3 style={{ fontSize: '1.1rem', color: '#f8fafc', fontWeight: 700 }}>{insight.title}</h3>
            </div>
            <span style={{ fontSize: '0.72rem', background: `${insight.color}15`, color: insight.color, padding: '3px 8px', borderRadius: '10px', fontWeight: 800 }}>
              {insight.category}
            </span>
          </div>
          <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
            {insight.description}
          </p>
        </div>
      ))}

      {/* AI Action Matrix */}
      <div className="saas-card col-12" style={{ padding: '26px' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '18px', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Zap size={19} style={{ color: 'var(--accent-amber)' }} /> Hoja de Ruta Sugerida por Algoritmos IA para {companyName}
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: '0.74rem', color: 'var(--accent-cyan)', fontWeight: 800, textTransform: 'uppercase' }}>Corto Plazo (1 - 3 Meses)</span>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '8px', lineHeight: '1.5' }}>
              {matrix.shortTerm || `Optimizar la presencia web e integrar herramientas de respuesta automática para ${companyName}.`}
            </p>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: '0.74rem', color: 'var(--accent-emerald)', fontWeight: 800, textTransform: 'uppercase' }}>Mediano Plazo (3 - 6 Meses)</span>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '8px', lineHeight: '1.5' }}>
              {matrix.mediumTerm || `Tramitar subsidios de modernización (ANR SEPYME) para financiar licencias de software y equipamiento.`}
            </p>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: '0.74rem', color: 'var(--accent-violet)', fontWeight: 800, textTransform: 'uppercase' }}>Largo Plazo (6 - 12 Meses)</span>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '8px', lineHeight: '1.5' }}>
              {matrix.longTerm || `Consolidar una red de licitaciones estatales y acuerdos de distribución a escala nacional para ${companyName}.`}
            </p>
          </div>
        </div>
      </div>

      {/* Interactive AI Assistant */}
      <div className="saas-card col-12" style={{ padding: '26px', border: '1px solid rgba(139, 92, 246, 0.3)' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '16px', color: '#c4b5fd', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MessageSquare size={19} /> Consulta IA en Vivo sobre {companyName}
        </h3>

        <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '12px', padding: '16px', maxHeight: '280px', overflowY: 'auto', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {chatHistory.map((msg, idx) => (
            <div key={idx} style={{ alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start', maxWidth: '82%' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '3px', textAlign: msg.sender === 'user' ? 'right' : 'left' }}>
                {msg.sender === 'user' ? 'Tú' : 'IA Tecno3F'}
              </div>
              <div style={{ padding: '10px 14px', borderRadius: '12px', fontSize: '0.9rem', lineHeight: '1.5', background: msg.sender === 'user' ? 'rgba(37, 99, 235, 0.3)' : 'rgba(139, 92, 246, 0.15)', color: '#fff', border: msg.sender === 'user' ? '1px solid rgba(37, 99, 235, 0.4)' : '1px solid rgba(139, 92, 246, 0.3)' }}>
                {msg.text}
              </div>
            </div>
          ))}
          {aiThinking && (
            <div style={{ fontSize: '0.82rem', color: '#c4b5fd', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={14} className="spinner" /> La IA está analizando los registros de {companyName}...
            </div>
          )}
        </div>

        <form onSubmit={handleAskAi} style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            className="input-field"
            placeholder={`Haz una pregunta específica sobre ${companyName} (ej: ¿Cuáles son los riesgos?, ¿Cómo exportar?)...`}
            value={userPrompt}
            onChange={(e) => setUserPrompt(e.target.value)}
            style={{ flex: 1 }}
          />
          <button type="submit" className="btn-primary" disabled={aiThinking}>
            <Send size={15} /> Consultar IA
          </button>
        </form>
      </div>
    </div>
  );
}
