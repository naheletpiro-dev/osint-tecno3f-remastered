import { useRef, useCallback } from 'react';
import { useOsintStore } from '../store/useOsintStore';
import { useNavigate } from 'react-router-dom';

export function useOsintScanner() {
  const eventSourceRef = useRef(null);
  const timeoutRef = useRef(null);
  const navigate = useNavigate();
  
  const { 
    setLoading, 
    setError, 
    setReport, 
    setComparisonReport, 
    setShowHistoryOnly, 
    setScanProgress, 
    setScanStageText,
    user 
  } = useOsintStore();

  const cleanup = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const handleScan = useCallback(async ({ companyName, website, region, cuit }) => {
    cleanup();
    
    setLoading(true);
    setError(null);
    setReport(null);
    setComparisonReport(null);
    setShowHistoryOnly(false);
    navigate('/report/overview');

    const params = new URLSearchParams();
    if (companyName) params.append('companyName', companyName);
    if (website) params.append('website', website);
    if (region) params.append('region', region);
    if (cuit) params.append('cuit', cuit);

    const eventSource = new EventSource(`/api/osint/scan-stream?${params.toString()}`);
    eventSourceRef.current = eventSource;

    // Resiliency: If no messages received in 20 seconds, assume connection dropped
    const resetTimeout = () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        setError('Tiempo de espera agotado. El servidor tardó demasiado en responder.');
        setLoading(false);
        cleanup();
      }, 90000); // 90 seconds timeout for heavy AI generation
    };

    resetTimeout();

    eventSource.addEventListener('progress', (e) => {
      resetTimeout();
      try {
        const data = JSON.parse(e.data);
        setScanProgress(data.percent || 0);
        if (data.text) setScanStageText(data.text);
      } catch (err) {}
    });

    eventSource.addEventListener('complete', (e) => {
      resetTimeout();
      try {
        const data = JSON.parse(e.data);
        setReport(data.report);
        navigate('/report/overview');
        // Always save locally in Zustand store for the current session
        const currentHistory = useOsintStore.getState().history || [];
        const historyItem = {
          id: data.report.id || `rep-${Date.now()}`,
          companyName: data.report.query?.companyName || 'Empresa',
          sector: data.report.categorization?.sector || 'Industrial',
          riskLevel: data.report.financialData?.riskLevel || 'BAJO RIESGO',
          creditScore: data.report.financialData?.creditScore || 75,
          timestamp: new Date().toISOString(),
          // Include the full report for local session so clicking it actually works instantly
          fullReport: data.report
        };
        useOsintStore.getState().setHistory([historyItem, ...currentHistory]);

        // Save to backend if user is logged in
        if (user) {
          const token = user.token || localStorage.getItem('osint_auth_token');
          fetch('/api/history/save', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': token ? `Bearer ${token}` : ''
            },
            body: JSON.stringify({ report: data.report })
          }).then(() => {
             // Refresh history silently
             fetch('/api/history', {
                headers: { 'Authorization': token ? `Bearer ${token}` : '' }
             })
             .then(res => res.json())
             .then(historyData => {
               if (historyData.success && Array.isArray(historyData.history)) {
                 useOsintStore.getState().setHistory(historyData.history);
               }
             }).catch(() => {});
          }).catch(() => {});
        }
      } catch (err) {
        console.error('Error parsing complete event:', err);
        setError('Error al procesar el reporte final.');
      }
      setLoading(false);
      cleanup();
    });

    eventSource.addEventListener('error', (e) => {
      let errMsg = 'Conexión con el servidor interrumpida o tiempo de espera agotado.';
      try {
        const data = JSON.parse(e.data);
        if (data.error) errMsg = data.error;
      } catch (err) {}
      
      // Prevent false errors if the connection was intentionally closed by us
      if (eventSourceRef.current) {
        setError(errMsg);
        setLoading(false);
      }
      cleanup();
    });
  }, [cleanup, navigate, setError, setLoading, setReport, setComparisonReport, setShowHistoryOnly, setScanProgress, setScanStageText, user]);

  return { handleScan, cancelScan: cleanup };
}
