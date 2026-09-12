import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Users, UserPlus, Activity, BarChart3, Loader2, 
  Mail, Phone, Globe, ShieldCheck, Calendar, Clock,
  ArrowLeft, RefreshCw
} from 'lucide-react';

export default function AdminDashboard({ onBack }) {
  const { getAuthHeader, isAdmin } = useAuth();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  const fetchData = async () => {
    setIsLoading(true);
    setError('');
    try {
      const headers = await getAuthHeader();

      const [statsRes, usersRes] = await Promise.all([
        fetch(`${apiUrl}/api/admin/stats`, { headers }),
        fetch(`${apiUrl}/api/admin/users`, { headers })
      ]);

      if (!statsRes.ok || !usersRes.ok) {
        throw new Error('Failed to fetch admin data');
      }

      const statsData = await statsRes.json();
      const usersData = await usersRes.json();

      setStats(statsData);
      setUsers(usersData.users || []);
    } catch (err) {
      setError(err.message || 'Failed to load admin data.');
      console.error('Admin fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchData();
    }
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-gray-200 shadow-sm">
        <ShieldCheck className="w-12 h-12 mx-auto text-red-400 mb-3" />
        <h3 className="text-lg font-bold text-gray-800">Access Denied</h3>
        <p className="text-gray-500 text-sm mt-1">You do not have admin privileges.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mx-auto mb-3" />
          <p className="text-sm text-gray-500 font-medium">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 rounded-2xl p-8 text-center border border-red-200">
        <p className="text-red-700 font-bold">{error}</p>
        <button
          onClick={fetchData}
          className="mt-3 bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-700 transition"
        >
          Retry
        </button>
      </div>
    );
  }

  const getProviderIcon = (provider) => {
    if (provider?.includes('google')) return <Globe className="w-3.5 h-3.5 text-blue-500" />;
    if (provider?.includes('phone')) return <Phone className="w-3.5 h-3.5 text-amber-500" />;
    return <Mail className="w-3.5 h-3.5 text-gray-500" />;
  };

  const getProviderLabel = (provider) => {
    if (provider?.includes('google')) return 'Google';
    if (provider?.includes('phone')) return 'Phone';
    if (provider?.includes('password')) return 'Email';
    return provider || 'Unknown';
  };

  const maxBar = Math.max(...(stats?.dailySignups?.map(d => d.count) || [1]), 1);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
              title="Back to app"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
          )}
          <div>
            <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-indigo-600" />
              Admin Dashboard
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">Monitor user registrations and platform activity</p>
          </div>
        </div>
        <button
          onClick={fetchData}
          className="flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg text-xs font-bold text-gray-700 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <div className="bg-indigo-100 p-2.5 rounded-xl">
              <Users className="w-5 h-5 text-indigo-600" />
            </div>
          </div>
          <p className="text-3xl font-black text-gray-900">{stats?.totalUsers || 0}</p>
          <p className="text-xs text-gray-500 font-medium mt-1">Total Registered Users</p>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <div className="bg-emerald-100 p-2.5 rounded-xl">
              <Activity className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
          <p className="text-3xl font-black text-gray-900">{stats?.activeToday || 0}</p>
          <p className="text-xs text-gray-500 font-medium mt-1">Active Today</p>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <div className="bg-amber-100 p-2.5 rounded-xl">
              <UserPlus className="w-5 h-5 text-amber-600" />
            </div>
          </div>
          <p className="text-3xl font-black text-gray-900">{stats?.signupsThisWeek || 0}</p>
          <p className="text-xs text-gray-500 font-medium mt-1">New This Week</p>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <div className="bg-purple-100 p-2.5 rounded-xl">
              <BarChart3 className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {stats?.providers && Object.entries(stats.providers).map(([provider, count]) => (
              <span key={provider} className="flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded-full text-xs font-medium text-gray-700">
                {getProviderIcon(provider)} {count}
              </span>
            ))}
          </div>
          <p className="text-xs text-gray-500 font-medium mt-2">By Login Method</p>
        </div>
      </div>

      {/* Signups Chart (Last 7 days) */}
      {stats?.dailySignups && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-600" />
            New Signups — Last 7 Days
          </h3>
          <div className="flex items-end gap-2 h-32">
            {stats.dailySignups.map((day) => (
              <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[10px] font-bold text-gray-700">{day.count}</span>
                <div
                  className="w-full bg-indigo-500 rounded-t-lg transition-all min-h-[4px]"
                  style={{ height: `${Math.max((day.count / maxBar) * 100, 4)}%` }}
                />
                <span className="text-[9px] text-gray-400 font-medium">
                  {new Date(day.date).toLocaleDateString('en-IN', { weekday: 'short' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-600" />
            All Registered Users ({users.length})
          </h3>
        </div>

        {users.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <Users className="w-10 h-10 mx-auto mb-2" />
            <p className="text-sm">No users registered yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase">#</th>
                  <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase">Name</th>
                  <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase">Email / Phone</th>
                  <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase">Method</th>
                  <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase">Joined</th>
                  <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase">Last Active</th>
                  <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase">Logins</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((u, idx) => (
                  <tr key={u.uid} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 text-xs text-gray-400 font-mono">{idx + 1}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {u.photoURL ? (
                          <img src={u.photoURL} alt="" className="w-7 h-7 rounded-full" referrerPolicy="no-referrer" />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">
                            {(u.displayName || u.email || '?').charAt(0).toUpperCase()}
                          </div>
                        )}
                        <span className="font-medium text-gray-900 text-xs">{u.displayName || '—'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600 truncate max-w-[200px]">
                      {u.email || u.phoneNumber || '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded-full text-[10px] font-semibold text-gray-600">
                        {getProviderIcon(u.provider)} {getProviderLabel(u.provider)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' }) : '—'}
                    </td>
                    <td className="px-4 py-3 text-xs font-bold text-gray-700">{u.loginCount || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
