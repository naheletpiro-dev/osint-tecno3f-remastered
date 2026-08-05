import React, { useState, useEffect } from 'react';
import { ShieldCheck, UserPlus, Users, UserX, UserCheck, Trash2, CheckCircle2, AlertCircle, RefreshCw, Lock, ShieldAlert, Search, FileText, Activity, Clock, Shield, Download } from 'lucide-react';

export default function AdminTab() {
  const [activeAdminSubTab, setActiveAdminSubTab] = useState('users'); // 'users' | 'audit'

  // Users State
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [filterQuery, setFilterQuery] = useState('');

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditFilterSeverity, setAuditFilterSeverity] = useState('ALL');
  const [auditSearchQuery, setAuditSearchQuery] = useState('');

  // New User Form State
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newDisplayName, setNewDisplayName] = useState('');
  const [newRole, setNewRole] = useState('user');

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/users', {
        headers: { 'X-User-Role': 'admin' }
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.users)) {
        setUsers(data.users);
      } else {
        setError(data.error || 'Error al recuperar usuarios.');
      }
    } catch (err) {
      setError('No se pudo establecer conexión con la API de administración.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAuditLogs = async () => {
    setAuditLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/audit-logs', {
        headers: { 'X-User-Role': 'admin' }
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.logs)) {
        setAuditLogs(data.logs);
      } else {
        setError(data.error || 'Error al recuperar logs de auditoría.');
      }
    } catch (err) {
      setError('No se pudo conectar con el servidor para obtener los logs.');
    } finally {
      setAuditLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchAuditLogs();
  }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!newUsername.trim() || !newPassword.trim()) {
      setError('Por favor complete el nombre de usuario y la contraseña.');
      return;
    }

    setActionLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await fetch('/api/admin/users/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Role': 'admin'
        },
        body: JSON.stringify({
          username: newUsername.trim(),
          password: newPassword.trim(),
          displayName: newDisplayName.trim() || newUsername.trim(),
          role: newRole
        })
      });
      const data = await res.json();

      if (data.success) {
        setSuccessMsg(`Cuenta de usuario "${newUsername.trim()}" registrada correctamente.`);
        setNewUsername('');
        setNewPassword('');
        setNewDisplayName('');
        setNewRole('user');
        fetchUsers();
        fetchAuditLogs();
      } else {
        setError(data.error || 'Error al crear la cuenta.');
      }
    } catch (err) {
      setError('Error al procesar la solicitud de alta.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleStatus = async (userId, currentUsername) => {
    if (currentUsername.toLowerCase() === 'tecno3f') return;
    setActionLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await fetch('/api/admin/users/toggle-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Role': 'admin'
        },
        body: JSON.stringify({ userId })
      });
      const data = await res.json();

      if (data.success) {
        setSuccessMsg(`Estado de la cuenta "${currentUsername}" actualizado.`);
        fetchUsers();
        fetchAuditLogs();
      } else {
        setError(data.error || 'Error al cambiar estado.');
      }
    } catch (err) {
      setError('Error de comunicación con el servidor.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async (userId, currentUsername) => {
    if (currentUsername.toLowerCase() === 'tecno3f') return;
    if (!window.confirm(`¿Confirmas la eliminación definitiva de la cuenta "${currentUsername}"?`)) return;

    setActionLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { 'X-User-Role': 'admin' }
      });
      const data = await res.json();

      if (data.success) {
        setSuccessMsg(`Cuenta "${currentUsername}" eliminada del sistema.`);
        fetchUsers();
        fetchAuditLogs();
      } else {
        setError(data.error || 'Error al eliminar cuenta.');
      }
    } catch (err) {
      setError('Error al procesar la baja.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleClearAuditLogs = async () => {
    if (!window.confirm('¿Deseas purgar el historial de auditoría de seguridad? Esta acción no se puede deshacer.')) return;

    setAuditLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await fetch('/api/admin/audit-logs/clear', {
        method: 'DELETE',
        headers: { 'X-User-Role': 'admin' }
      });
      const data = await res.json();

      if (data.success) {
        setSuccessMsg('Historial de logs de auditoría purgado correctamente.');
        fetchAuditLogs();
      } else {
        setError(data.error || 'Error al purgar los logs.');
      }
    } catch (err) {
      setError('No se pudo conectar con el servidor.');
    } finally {
      setAuditLoading(false);
    }
  };

  const activeUsers = users.filter(u => u.status === 'active');
  const adminUsers = users.filter(u => u.role === 'admin');

  const filteredUsers = users.filter(u =>
    (u.username || '').toLowerCase().includes(filterQuery.toLowerCase()) ||
    (u.displayName || '').toLowerCase().includes(filterQuery.toLowerCase())
  );

  const filteredAuditLogs = auditLogs.filter(log => {
    const matchesSeverity = auditFilterSeverity === 'ALL' || log.severity === auditFilterSeverity;
    const q = auditSearchQuery.toLowerCase();
    const matchesSearch =
      (log.username || '').toLowerCase().includes(q) ||
      (log.details || '').toLowerCase().includes(q) ||
      (log.type || '').toLowerCase().includes(q) ||
      (log.ip || '').toLowerCase().includes(q);
    return matchesSeverity && matchesSearch;
  });

  const failedLoginsCount = auditLogs.filter(l => l.type === 'LOGIN_FAILED').length;
  const successfulLoginsCount = auditLogs.filter(l => l.type === 'LOGIN_SUCCESS').length;

  // Enhanced metrics: events last 24h
  const now24h = Date.now() - 24 * 60 * 60 * 1000;
  const eventsLast24h = auditLogs.filter(l => new Date(l.timestamp).getTime() > now24h).length;

  // Top active IPs
  const ipCounts = {};
  auditLogs.forEach(l => { if (l.ip) ipCounts[l.ip] = (ipCounts[l.ip] || 0) + 1; });
  const topIPs = Object.entries(ipCounts).sort((a, b) => b[1] - a[1]).slice(0, 3);

  // CSV Export
  const exportAuditCSV = () => {
    const headers = ['Fecha,Tipo,Severidad,Usuario,Detalles,IP'];
    const rows = filteredAuditLogs.map(l => {
      const date = new Date(l.timestamp).toLocaleString('es-AR');
      const safe = (str) => `"${(str || '').replace(/"/g, '""')}"`;
      return `${safe(date)},${safe(l.type)},${safe(l.severity)},${safe(l.username)},${safe(l.details)},${safe(l.ip)}`;
    });
    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AuditLogs_Tecno3F_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Header Banner */}
      <div style={{
        background: '#111827',
        border: '1px solid #1e293b',
        borderRadius: '16px',
        padding: '24px 28px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <span>Gestión de Sistema</span> • <span style={{ color: '#c084fc' }}>Directorio /admin</span>
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f8fafc', marginTop: '4px' }}>
            Panel Administrador & Centro de Auditoría
          </h2>
        </div>

        {/* Sub-Navigation Tabs */}
        <div style={{ display: 'flex', gap: '8px', background: '#0f172a', padding: '6px', borderRadius: '12px', border: '1px solid #1e293b' }}>
          <button
            onClick={() => setActiveAdminSubTab('users')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '0.84rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: activeAdminSubTab === 'users' ? '#2563eb' : 'transparent',
              color: activeAdminSubTab === 'users' ? '#fff' : '#94a3b8',
              transition: 'all 0.2s ease'
            }}
          >
            <Users size={15} /> Gestión de Usuarios ({users.length})
          </button>
          <button
            onClick={() => setActiveAdminSubTab('audit')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '0.84rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: activeAdminSubTab === 'audit' ? '#a855f7' : 'transparent',
              color: activeAdminSubTab === 'audit' ? '#fff' : '#94a3b8',
              transition: 'all 0.2s ease'
            }}
          >
            <ShieldAlert size={15} /> Logs de Auditoría ({auditLogs.length})
          </button>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div style={{ background: 'rgba(244, 63, 94, 0.1)', border: '1px solid rgba(244, 63, 94, 0.3)', color: '#fecdd3', padding: '12px 18px', borderRadius: '12px', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <AlertCircle size={18} style={{ color: '#f43f5e', flexShrink: 0 }} /> {error}
        </div>
      )}

      {successMsg && (
        <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#a7f3d0', padding: '12px 18px', borderRadius: '12px', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <CheckCircle2 size={18} style={{ color: '#10b981', flexShrink: 0 }} /> {successMsg}
        </div>
      )}

      {/* SUB-TAB 1: USER MANAGEMENT */}
      {activeAdminSubTab === 'users' && (
        <>
          {/* Metrics Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '18px' }}>
            <div style={{ background: '#111827', border: '1px solid #1e293b', borderRadius: '14px', padding: '20px 22px' }}>
              <div style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Cuentas en Sistema</div>
              <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#f8fafc', marginTop: '6px' }}>{users.length} Registradas</div>
            </div>

            <div style={{ background: '#111827', border: '1px solid #1e293b', borderRadius: '14px', padding: '20px 22px' }}>
              <div style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Cuentas Activas</div>
              <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#34d399', marginTop: '6px' }}>{activeUsers.length} Activas</div>
            </div>

            <div style={{ background: '#111827', border: '1px solid #1e293b', borderRadius: '14px', padding: '20px 22px' }}>
              <div style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Administradores</div>
              <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#c084fc', marginTop: '6px' }}>{adminUsers.length} Admins</div>
            </div>
          </div>

          {/* New User Creation Form */}
          <div style={{ background: '#111827', border: '1px solid #1e293b', borderRadius: '16px', padding: '26px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <UserPlus size={18} style={{ color: '#60a5fa' }} /> Registrar Nueva Cuenta
            </h3>

            <form onSubmit={handleCreateUser} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '16px', alignItems: 'end' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', marginBottom: '6px' }}>
                  Nombre de Usuario *
                </label>
                <input
                  type="text"
                  placeholder="ej. carlos.mendoza"
                  className="input-control"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', marginBottom: '6px' }}>
                  Contraseña de Acceso *
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="input-control"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', marginBottom: '6px' }}>
                  Nombre Visible
                </label>
                <input
                  type="text"
                  placeholder="ej. Carlos Mendoza"
                  className="input-control"
                  value={newDisplayName}
                  onChange={(e) => setNewDisplayName(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', marginBottom: '6px' }}>
                  Rol Asignado *
                </label>
                <select
                  className="input-control"
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  style={{ cursor: 'pointer' }}
                >
                  <option value="user" style={{ background: '#0f172a', color: '#fff' }}>Usuario Estándar</option>
                  <option value="admin" style={{ background: '#0f172a', color: '#fff' }}>Administrador</option>
                </select>
              </div>

              <div>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={actionLoading}
                  style={{ width: '100%', justifyContent: 'center', height: '45px' }}
                >
                  <UserPlus size={16} /> Crear Cuenta
                </button>
              </div>
            </form>
          </div>

          {/* Directory Users Table */}
          <div style={{ background: '#111827', border: '1px solid #1e293b', borderRadius: '16px', padding: '26px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={18} style={{ color: '#10b981' }} /> Cuentas Registradas ({filteredUsers.length})
              </h3>

              <div style={{ position: 'relative', minWidth: '220px' }}>
                <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                <input
                  type="text"
                  placeholder="Buscar usuario..."
                  value={filterQuery}
                  onChange={(e) => setFilterQuery(e.target.value)}
                  className="input-control"
                  style={{ paddingLeft: '34px', fontSize: '0.84rem', padding: '8px 12px 8px 34px' }}
                />
              </div>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Cargando listado de cuentas...</div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #1e293b', color: '#64748b', textAlign: 'left' }}>
                      <th style={{ padding: '12px 14px' }}>Usuario</th>
                      <th style={{ padding: '12px 14px' }}>Nombre Visible</th>
                      <th style={{ padding: '12px 14px' }}>Rol</th>
                      <th style={{ padding: '12px 14px' }}>Estado</th>
                      <th style={{ padding: '12px 14px' }}>Fecha Alta</th>
                      <th style={{ padding: '12px 14px', textAlign: 'right' }}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u) => {
                      const isMasterAdmin = u.username.toLowerCase() === 'tecno3f';
                      const isActive = u.status === 'active';

                      return (
                        <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                          <td style={{ padding: '14px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: u.role === 'admin' ? 'rgba(168, 85, 247, 0.2)' : 'rgba(37, 99, 235, 0.2)', color: u.role === 'admin' ? '#c084fc' : '#60a5fa', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.8rem' }}>
                                {u.username.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <span style={{ fontWeight: 700, color: '#f8fafc' }}>{u.username}</span>
                                {isMasterAdmin && (
                                  <span style={{ fontSize: '0.68rem', background: 'rgba(168, 85, 247, 0.2)', color: '#c084fc', border: '1px solid rgba(168, 85, 247, 0.4)', padding: '1px 6px', borderRadius: '4px', marginLeft: '6px', fontWeight: 800 }}>
                                    MASTER
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '14px', color: '#94a3b8' }}>{u.displayName || u.username}</td>
                          <td style={{ padding: '14px' }}>
                            <span style={{
                              padding: '3px 9px',
                              borderRadius: '6px',
                              fontSize: '0.74rem',
                              fontWeight: 700,
                              background: u.role === 'admin' ? 'rgba(168, 85, 247, 0.12)' : 'rgba(37, 99, 235, 0.12)',
                              color: u.role === 'admin' ? '#c084fc' : '#60a5fa',
                              border: `1px solid ${u.role === 'admin' ? 'rgba(168, 85, 247, 0.25)' : 'rgba(37, 99, 235, 0.25)'}`
                            }}>
                              {u.role === 'admin' ? 'Administrador' : 'Usuario'}
                            </span>
                          </td>
                          <td style={{ padding: '14px' }}>
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '3px 9px',
                              borderRadius: '6px',
                              fontSize: '0.74rem',
                              fontWeight: 700,
                              background: isActive ? 'rgba(16, 185, 129, 0.12)' : 'rgba(244, 63, 94, 0.12)',
                              color: isActive ? '#34d399' : '#fb7185',
                              border: `1px solid ${isActive ? 'rgba(16, 185, 129, 0.25)' : 'rgba(244, 63, 94, 0.25)'}`
                            }}>
                              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: isActive ? '#10b981' : '#f43f5e' }}></span>
                              {isActive ? 'Activa' : 'Dada de Baja'}
                            </span>
                          </td>
                          <td style={{ padding: '14px', color: '#64748b', fontSize: '0.82rem' }}>
                            {new Date(u.createdAt).toLocaleDateString('es-AR')}
                          </td>
                          <td style={{ padding: '14px', textAlign: 'right' }}>
                            {!isMasterAdmin && (
                              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                <button
                                  className="btn-secondary"
                                  onClick={() => handleToggleStatus(u.id, u.username)}
                                  disabled={actionLoading}
                                  style={{ padding: '5px 10px', fontSize: '0.76rem', color: isActive ? '#f59e0b' : '#34d399', background: '#1e293b' }}
                                >
                                  {isActive ? <UserX size={13} /> : <UserCheck size={13} />}
                                  {isActive ? 'Baja' : 'Activar'}
                                </button>
                                <button
                                  className="btn-secondary"
                                  onClick={() => handleDeleteUser(u.id, u.username)}
                                  disabled={actionLoading}
                                  style={{ padding: '5px 8px', fontSize: '0.76rem', color: '#fb7185', background: '#1e293b' }}
                                  title="Eliminar usuario"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* SUB-TAB 2: SECURITY AUDIT LOGS */}
      {activeAdminSubTab === 'audit' && (
        <>
          {/* Audit Metrics Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '18px' }}>
            <div style={{ background: '#111827', border: '1px solid #1e293b', borderRadius: '14px', padding: '20px 22px' }}>
              <div style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Eventos Registrados</div>
              <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#f8fafc', marginTop: '6px' }}>{auditLogs.length} Registros</div>
            </div>

            <div style={{ background: '#111827', border: '1px solid #1e293b', borderRadius: '14px', padding: '20px 22px' }}>
              <div style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Eventos Últimas 24h</div>
              <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#38bdf8', marginTop: '6px' }}>{eventsLast24h} Eventos</div>
            </div>

            <div style={{ background: '#111827', border: '1px solid #1e293b', borderRadius: '14px', padding: '20px 22px' }}>
              <div style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Logins Exitosos</div>
              <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#34d399', marginTop: '6px' }}>{successfulLoginsCount} Logins</div>
            </div>

            <div style={{ background: '#111827', border: '1px solid #1e293b', borderRadius: '14px', padding: '20px 22px' }}>
              <div style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Intentos Fallidos</div>
              <div style={{ fontSize: '1.45rem', fontWeight: 800, color: failedLoginsCount > 0 ? '#fb7185' : '#64748b', marginTop: '6px' }}>{failedLoginsCount} Alertas</div>
            </div>

            <div style={{ background: '#111827', border: '1px solid #1e293b', borderRadius: '14px', padding: '20px 22px' }}>
              <div style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>IPs Más Activas</div>
              <div style={{ marginTop: '6px' }}>
                {topIPs.length > 0 ? topIPs.map(([ip, count], idx) => (
                  <div key={idx} style={{ fontSize: '0.82rem', color: '#f8fafc', fontFamily: 'monospace', display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                    <span>{ip}</span>
                    <span style={{ color: '#60a5fa', fontWeight: 800 }}>{count}x</span>
                  </div>
                )) : <span style={{ fontSize: '0.82rem', color: '#64748b' }}>Sin datos</span>}
              </div>
            </div>
          </div>

          {/* Audit Logs Table & Controls */}
          <div style={{ background: '#111827', border: '1px solid #1e293b', borderRadius: '16px', padding: '26px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldAlert size={18} style={{ color: '#c084fc' }} /> Audit Trail de Seguridad ({filteredAuditLogs.length})
                </h3>

                {/* Filter Severity */}
                <select
                  value={auditFilterSeverity}
                  onChange={(e) => setAuditFilterSeverity(e.target.value)}
                  className="input-control"
                  style={{ fontSize: '0.8rem', padding: '6px 12px', cursor: 'pointer', minWidth: '140px' }}
                >
                  <option value="ALL" style={{ background: '#0f172a' }}>Todos los Eventos</option>
                  <option value="info" style={{ background: '#0f172a' }}>Info / Acceso</option>
                  <option value="success" style={{ background: '#0f172a' }}>Éxito / Altas</option>
                  <option value="warning" style={{ background: '#0f172a' }}>Advertencias</option>
                  <option value="danger" style={{ background: '#0f172a' }}>Fórmulas / Bajas</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <div style={{ position: 'relative', minWidth: '200px' }}>
                  <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                  <input
                    type="text"
                    placeholder="Filtrar eventos..."
                    value={auditSearchQuery}
                    onChange={(e) => setAuditSearchQuery(e.target.value)}
                    className="input-control"
                    style={{ paddingLeft: '30px', fontSize: '0.82rem', padding: '6px 10px 6px 30px' }}
                  />
                </div>

                <button
                  className="btn-secondary"
                  onClick={fetchAuditLogs}
                  title="Actualizar Logs"
                  style={{ padding: '6px 10px', fontSize: '0.78rem', background: '#1e293b' }}
                >
                  <RefreshCw size={14} />
                </button>

                <button
                  className="btn-secondary"
                  onClick={exportAuditCSV}
                  disabled={filteredAuditLogs.length === 0}
                  style={{ padding: '6px 12px', fontSize: '0.78rem', color: '#34d399', background: '#1e293b' }}
                >
                  <Download size={14} /> Exportar CSV
                </button>

                <button
                  className="btn-secondary"
                  onClick={handleClearAuditLogs}
                  disabled={auditLoading || auditLogs.length === 0}
                  style={{ padding: '6px 12px', fontSize: '0.78rem', color: '#fb7185', background: '#1e293b' }}
                >
                  <Trash2 size={14} /> Purgar Logs
                </button>
              </div>
            </div>

            {auditLoading ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Cargando eventos de auditoría...</div>
            ) : filteredAuditLogs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#64748b', fontSize: '0.9rem' }}>
                No se registraron eventos de auditoría con los criterios seleccionados.
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.86rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #1e293b', color: '#64748b', textAlign: 'left' }}>
                      <th style={{ padding: '12px 14px' }}>Fecha & Hora</th>
                      <th style={{ padding: '12px 14px' }}>Tipo Evento</th>
                      <th style={{ padding: '12px 14px' }}>Usuario</th>
                      <th style={{ padding: '12px 14px' }}>Detalles de la Acción</th>
                      <th style={{ padding: '12px 14px', textAlign: 'right' }}>IP Origen</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAuditLogs.map((log) => {
                      let badgeBg = 'rgba(59, 130, 246, 0.12)';
                      let badgeColor = '#60a5fa';
                      let badgeBorder = 'rgba(59, 130, 246, 0.3)';

                      if (log.severity === 'success') {
                        badgeBg = 'rgba(16, 185, 129, 0.12)';
                        badgeColor = '#34d399';
                        badgeBorder = 'rgba(16, 185, 129, 0.3)';
                      } else if (log.severity === 'warning') {
                        badgeBg = 'rgba(245, 158, 11, 0.12)';
                        badgeColor = '#fbbf24';
                        badgeBorder = 'rgba(245, 158, 11, 0.3)';
                      } else if (log.severity === 'danger' || log.type === 'LOGIN_FAILED') {
                        badgeBg = 'rgba(244, 63, 94, 0.12)';
                        badgeColor = '#fb7185';
                        badgeBorder = 'rgba(244, 63, 94, 0.3)';
                      }

                      return (
                        <tr key={log.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                          <td style={{ padding: '12px 14px', color: '#94a3b8', whiteSpace: 'nowrap', fontFamily: 'monospace', fontSize: '0.8rem' }}>
                            <Clock size={12} style={{ display: 'inline', marginRight: '6px', color: '#64748b' }} />
                            {new Date(log.timestamp).toLocaleString('es-AR')}
                          </td>
                          <td style={{ padding: '12px 14px' }}>
                            <span style={{
                              padding: '2px 8px',
                              borderRadius: '6px',
                              fontSize: '0.72rem',
                              fontWeight: 800,
                              background: badgeBg,
                              color: badgeColor,
                              border: `1px solid ${badgeBorder}`,
                              fontFamily: 'monospace'
                            }}>
                              {log.type}
                            </span>
                          </td>
                          <td style={{ padding: '12px 14px', fontWeight: 700, color: '#f8fafc' }}>
                            {log.username}
                          </td>
                          <td style={{ padding: '12px 14px', color: '#cbd5e1' }}>
                            {log.details}
                          </td>
                          <td style={{ padding: '12px 14px', textAlign: 'right', color: '#64748b', fontFamily: 'monospace', fontSize: '0.78rem' }}>
                            {log.ip}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
