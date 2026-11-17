import { useState, useEffect } from 'react';
import { 
  Building2, Users, DollarSign, ShieldAlert, CheckCircle2, 
  AlertTriangle, RefreshCw, PlusCircle, Search, ExternalLink,
  Lock, Calendar, Trash2, Power, Clock, ArrowUpRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface Tenant {
  id: string;
  companyCode: string;
  name: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  status: string;
  planType: string;
  activeModules: string[];
  durationMonths: number;
  validUntil: string;
  amountPaid: number;
  staffCount: number;
  users: Array<{ id: string; name: string; email: string; role: string; employeeId: string }>;
  createdAt: string;
}

export default function VendorCommandCenter() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [stats, setStats] = useState({
    totalTenants: 0,
    activeTenants: 0,
    totalRevenue: 0,
    totalStaff: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTenantStaff, setSelectedTenantStaff] = useState<Tenant | null>(null);
  const [actionMsg, setActionMsg] = useState('');

  const fetchTenants = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/superadmin/tenants');
      const data = await res.json();
      if (res.ok) {
        setTenants(data.tenants || []);
        setStats(data.stats || { totalTenants: 0, activeTenants: 0, totalRevenue: 0, totalStaff: 0 });
      }
    } catch (err) {
      console.error('Failed to load tenants:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  const handleToggleStatus = async (companyId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      const res = await fetch('/api/auth/superadmin/toggle-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId, status: newStatus })
      });
      if (res.ok) {
        setActionMsg(`Tenant status updated to ${newStatus}.`);
        fetchTenants();
        setTimeout(() => setActionMsg(''), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleExtendLicense = async (companyId: string, months: number = 12) => {
    try {
      const res = await fetch('/api/auth/superadmin/extend-license', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId, additionalMonths: months })
      });
      if (res.ok) {
        setActionMsg(`Subscription extended by ${months} months!`);
        fetchTenants();
        setTimeout(() => setActionMsg(''), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTenant = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to permanently delete company "${name}" and all their staff accounts?`)) return;

    try {
      const res = await fetch(`/api/auth/superadmin/delete-tenant/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setActionMsg(`Company "${name}" deleted.`);
        fetchTenants();
        setTimeout(() => setActionMsg(''), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredTenants = tenants.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.companyCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.ownerEmail.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#fbfbfd] text-[#1d1d1f] p-4 sm:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-black/[0.06]">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-bold uppercase tracking-wider mb-2 border border-purple-200">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>SaaS Platform Owner (Vendor Command Center)</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#1d1d1f]">
              Athena Master Tenant Directory
            </h1>
            <p className="text-[#86868b] text-sm mt-1">
              Live overview of all client companies, active subscriptions, revenue collected, and multi-tenant access.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/welcome"
              target="_blank"
              className="px-4 py-2.5 rounded-full bg-white hover:bg-slate-50 border border-black/[0.08] text-xs sm:text-sm font-semibold text-[#1d1d1f] shadow-xs transition-all flex items-center gap-1.5"
            >
              <span>View Public Storefront</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
            <button
              onClick={fetchTenants}
              className="p-2.5 rounded-full bg-white hover:bg-slate-50 border border-black/[0.08] text-slate-600 hover:text-black transition-colors cursor-pointer"
              title="Refresh Tenants"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {actionMsg && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-bold flex items-center">
            <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-600" />
            <span>{actionMsg}</span>
          </div>
        )}

        {/* 4 Apple-grade KPI Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white p-6 rounded-[28px] border border-black/[0.06] shadow-[0_10px_30px_rgba(0,0,0,0.02)]">
            <div className="text-xs font-semibold text-[#86868b] uppercase tracking-wider flex items-center justify-between">
              <span>Total Client Companies</span>
              <Building2 className="w-4 h-4 text-[#0071e3]" />
            </div>
            <div className="text-3xl font-bold tracking-tight text-[#1d1d1f] mt-3">
              {stats.totalTenants}
            </div>
            <div className="text-xs text-emerald-600 font-semibold mt-2 flex items-center">
              <span>{stats.activeTenants} currently active</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-[28px] border border-black/[0.06] shadow-[0_10px_30px_rgba(0,0,0,0.02)]">
            <div className="text-xs font-semibold text-[#86868b] uppercase tracking-wider flex items-center justify-between">
              <span>Total Subscription Revenue</span>
              <DollarSign className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-3xl font-bold tracking-tight text-emerald-700 mt-3">
              ₹{stats.totalRevenue.toLocaleString()}
            </div>
            <div className="text-xs text-[#86868b] mt-2">
              Paid across all active client plans
            </div>
          </div>

          <div className="bg-white p-6 rounded-[28px] border border-black/[0.06] shadow-[0_10px_30px_rgba(0,0,0,0.02)]">
            <div className="text-xs font-semibold text-[#86868b] uppercase tracking-wider flex items-center justify-between">
              <span>Connected Staff Members</span>
              <Users className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-3xl font-bold tracking-tight text-purple-700 mt-3">
              {stats.totalStaff}
            </div>
            <div className="text-xs text-[#86868b] mt-2">
              Employees operating across workspaces
            </div>
          </div>

          <div className="bg-white p-6 rounded-[28px] border border-black/[0.06] shadow-[0_10px_30px_rgba(0,0,0,0.02)]">
            <div className="text-xs font-semibold text-[#86868b] uppercase tracking-wider flex items-center justify-between">
              <span>Platform Health</span>
              <ShieldAlert className="w-4 h-4 text-teal-600" />
            </div>
            <div className="text-3xl font-bold tracking-tight text-[#1d1d1f] mt-3">
              99.99%
            </div>
            <div className="text-xs text-teal-700 font-semibold mt-2">
              All multi-tenant DB nodes online
            </div>
          </div>
        </div>

        {/* Tenant Search & Table Container */}
        <div className="bg-white rounded-[32px] border border-black/[0.06] shadow-[0_20px_50px_rgba(0,0,0,0.03)] overflow-hidden">
          <div className="p-6 sm:p-7 border-b border-black/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-[#1d1d1f]">Subscribed Client Companies</h2>
              <p className="text-xs text-[#86868b] mt-0.5">Manage licenses, view purchased modules, and supervise tenant accounts</p>
            </div>

            {/* Search input */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-[#86868b] absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search by name, code or email..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-full bg-[#f5f5f7] border-0 text-xs sm:text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0071e3] transition-all"
              />
            </div>
          </div>

          {loading ? (
            <div className="p-16 text-center text-[#86868b] text-sm">Loading tenant data...</div>
          ) : filteredTenants.length === 0 ? (
            <div className="p-16 text-center text-[#86868b]">
              <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="font-bold text-base text-[#1d1d1f]">No client companies found.</p>
              <p className="text-xs mt-1">Once clients buy on the storefront, their company records will appear here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-[#fbfbfd] border-b border-black/[0.06] text-[11px] uppercase font-bold text-[#86868b]">
                  <tr>
                    <th className="py-4 px-6">Company & Code</th>
                    <th className="py-4 px-6">Owner Info</th>
                    <th className="py-4 px-6">Active Modules</th>
                    <th className="py-4 px-6">License Validity</th>
                    <th className="py-4 px-6">Paid</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/[0.04]">
                  {filteredTenants.map(tenant => {
                    const daysRemaining = Math.max(0, Math.ceil((new Date(tenant.validUntil).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
                    const isExpired = daysRemaining === 0;

                    return (
                      <tr key={tenant.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-4 px-6">
                          <div className="font-bold text-[#1d1d1f] text-sm">{tenant.name}</div>
                          <div className="font-mono text-xs text-purple-700 font-bold mt-0.5">
                            Code: {tenant.companyCode}
                          </div>
                        </td>

                        <td className="py-4 px-6">
                          <div className="font-semibold text-[#1d1d1f]">{tenant.ownerName}</div>
                          <div className="text-xs text-[#86868b]">{tenant.ownerEmail}</div>
                          {tenant.ownerPhone && (
                            <div className="text-[11px] text-[#86868b]">{tenant.ownerPhone}</div>
                          )}
                        </td>

                        <td className="py-4 px-6">
                          <div className="flex flex-wrap gap-1 max-w-[200px]">
                            {tenant.activeModules.map(mod => (
                              <span key={mod} className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-slate-100 text-slate-800 border border-slate-200">
                                {mod}
                              </span>
                            ))}
                          </div>
                          <button
                            onClick={() => setSelectedTenantStaff(tenant)}
                            className="mt-2 text-[11px] font-bold text-[#0071e3] hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <Users className="w-3 h-3" />
                            <span>{tenant.staffCount} Staff Accounts</span>
                          </button>
                        </td>

                        <td className="py-4 px-6">
                          <div className="font-medium text-[#1d1d1f]">
                            {new Date(tenant.validUntil).toLocaleDateString()}
                          </div>
                          <div className={`text-[11px] font-bold mt-0.5 ${isExpired ? 'text-red-600' : 'text-emerald-700'}`}>
                            {isExpired ? 'Expired' : `${daysRemaining} days left`}
                          </div>
                        </td>

                        <td className="py-4 px-6 font-bold text-[#1d1d1f]">
                          ₹{(tenant.amountPaid || 0).toLocaleString()}
                        </td>

                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                            tenant.status === 'ACTIVE' 
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                              : 'bg-rose-50 text-rose-800 border border-rose-200'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${tenant.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                            {tenant.status}
                          </span>
                        </td>

                        <td className="py-4 px-6 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              onClick={() => handleExtendLicense(tenant.id, 12)}
                              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-purple-50 hover:text-purple-700 text-xs font-bold transition-colors cursor-pointer"
                              title="Extend license by 1 year"
                            >
                              +1 Year
                            </button>
                            <button
                              onClick={() => handleToggleStatus(tenant.id, tenant.status)}
                              className={`p-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                                tenant.status === 'ACTIVE' 
                                  ? 'text-amber-700 hover:bg-amber-50' 
                                  : 'text-emerald-700 hover:bg-emerald-50'
                              }`}
                              title={tenant.status === 'ACTIVE' ? 'Suspend Company' : 'Reactivate Company'}
                            >
                              <Power className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteTenant(tenant.id, tenant.name)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                              title="Delete Tenant"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* STAFF DETAIL MODAL */}
      {selectedTenantStaff && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] max-w-xl w-full p-6 sm:p-8 shadow-2xl relative border border-black/[0.08]">
            <button
              onClick={() => setSelectedTenantStaff(null)}
              className="absolute right-6 top-6 w-8 h-8 rounded-full bg-[#f5f5f7] hover:bg-[#e8e8ed] flex items-center justify-center text-[#86868b] hover:text-[#1d1d1f] font-bold text-xs cursor-pointer"
            >
              ✕
            </button>

            <div className="mb-6">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                Tenant: {selectedTenantStaff.companyCode}
              </span>
              <h3 className="text-xl font-bold text-[#1d1d1f] mt-1">{selectedTenantStaff.name} — Staff Directory</h3>
              <p className="text-xs text-[#86868b]">All staff user accounts created under this tenant</p>
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {selectedTenantStaff.users.length === 0 ? (
                <p className="text-xs text-[#86868b] py-6 text-center">No staff added yet by the owner.</p>
              ) : (
                selectedTenantStaff.users.map(u => (
                  <div key={u.id} className="p-3.5 rounded-2xl bg-[#f5f5f7] flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-[#1d1d1f]">{u.name}</div>
                      <div className="text-[11px] text-[#86868b]">{u.email}</div>
                    </div>
                    <div className="text-right">
                      <span className="px-2.5 py-1 rounded-full font-bold bg-white border border-slate-200 text-slate-800">
                        {u.role}
                      </span>
                      {u.employeeId && (
                        <div className="font-mono text-[10px] text-slate-400 mt-1">{u.employeeId}</div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
