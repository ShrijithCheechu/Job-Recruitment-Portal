import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import { Shield, Users, Briefcase, FileText, Calendar, Activity, CheckCircle, AlertTriangle } from 'lucide-react';

const AdminWorkspace = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'users' | 'logs'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, logsRes] = await Promise.all([
        adminAPI.getStats().catch(() => ({ data: null })),
        adminAPI.getUsers().catch(() => ({ data: [] })),
        adminAPI.getAuditLogs().catch(() => ({ data: [] }))
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data || []);
      setAuditLogs(logsRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleUser = async (userId) => {
    try {
      await adminAPI.toggleUserActive(userId);
      loadAdminData();
    } catch (err) {
      alert("Failed to toggle user status.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-left">
      
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-soft mb-8">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-brand-50 border border-brand-200 text-brand-700 flex items-center justify-center font-bold">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Platform Administration Console</h1>
            <p className="text-xs text-slate-500 mt-0.5">Manage users, monitor blind screening audit trails, and ensure platform health.</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 mb-8">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 px-4 text-sm font-semibold transition-all border-b-2 flex items-center space-x-2 ${
            activeTab === 'overview' ? 'border-brand-600 text-brand-700' : 'border-transparent text-slate-500'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>System Metrics</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 px-4 text-sm font-semibold transition-all border-b-2 flex items-center space-x-2 ${
            activeTab === 'users' ? 'border-brand-600 text-brand-700' : 'border-transparent text-slate-500'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>User Directory ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`pb-3 px-4 text-sm font-semibold transition-all border-b-2 flex items-center space-x-2 ${
            activeTab === 'logs' ? 'border-brand-600 text-brand-700' : 'border-transparent text-slate-500'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Audit & Security Logs ({auditLogs.length})</span>
        </button>
      </div>

      {/* TAB 1: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-soft">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Total Users</span>
              <div className="text-2xl font-bold text-slate-900 mt-1">{stats?.total_users || 0}</div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-soft">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Candidates</span>
              <div className="text-2xl font-bold text-brand-600 mt-1">{stats?.candidates_count || 0}</div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-soft">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Recruiters</span>
              <div className="text-2xl font-bold text-slate-900 mt-1">{stats?.recruiters_count || 0}</div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-soft">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Active Jobs</span>
              <div className="text-2xl font-bold text-slate-900 mt-1">{stats?.active_jobs || 0}</div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-soft">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Applications</span>
              <div className="text-2xl font-bold text-brand-600 mt-1">{stats?.applications_count || 0}</div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-soft">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Interviews</span>
              <div className="text-2xl font-bold text-slate-900 mt-1">{stats?.interviews_count || 0}</div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Users Management */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-soft overflow-hidden">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-4">Email</th>
                <th className="p-4">Role</th>
                <th className="p-4">Status</th>
                <th className="p-4">Joined</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/50">
                  <td className="p-4 font-semibold text-slate-900">{u.email}</td>
                  <td className="p-4 capitalize">{u.role}</td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                      u.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {u.is_active ? 'Active' : 'Suspended'}
                    </span>
                  </td>
                  <td className="p-4 text-slate-400">{new Date(u.date_joined).toLocaleDateString()}</td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleToggleUser(u.id)}
                      className="px-3 py-1 rounded-lg text-[11px] font-semibold border border-slate-200 hover:bg-slate-100"
                    >
                      {u.is_active ? 'Suspend' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 3: Audit Logs */}
      {activeTab === 'logs' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-soft overflow-hidden">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-4">Timestamp</th>
                <th className="p-4">Actor</th>
                <th className="p-4">Action</th>
                <th className="p-4">Target</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-mono text-[11px]">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/50">
                  <td className="p-4 text-slate-400">{new Date(log.timestamp).toLocaleString()}</td>
                  <td className="p-4 font-sans font-semibold text-slate-800">{log.actor_email || 'System'}</td>
                  <td className="p-4 font-sans font-bold text-brand-700">{log.action}</td>
                  <td className="p-4 text-slate-500">{log.target_model} #{log.target_id}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
};

export default AdminWorkspace;
