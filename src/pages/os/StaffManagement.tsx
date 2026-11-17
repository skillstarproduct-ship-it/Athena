import { useState, useEffect } from 'react';
import { 
  Users, UserPlus, Shield, Trash2, Key, Building2, CheckCircle2, 
  AlertCircle, Sparkles, RefreshCw, Copy, Check
} from 'lucide-react';
import OSNavigation from '../../components/OSNavigation';

interface StaffUser {
  id: string;
  employeeId: string;
  name: string;
  username: string;
  email: string;
  role: string;
  department: string;
  status: string;
  createdAt: string;
}

export default function StaffManagement() {
  const userStr = localStorage.getItem('user');
  const companyStr = localStorage.getItem('company');
  
  let currentUser: any = null;
  let currentCompany: any = null;
  try {
    currentUser = userStr ? JSON.parse(userStr) : null;
  } catch (e) {
    currentUser = null;
  }
  try {
    currentCompany = companyStr ? JSON.parse(companyStr) : null;
  } catch (e) {
    currentCompany = null;
  }

  const [companyDetails, setCompanyDetails] = useState<any>(currentCompany);
  const [staffList, setStaffList] = useState<StaffUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [copied, setCopied] = useState(false);

  // Safe helper to parse active modules array whether raw is JSON string or array
  const getModulesList = (): string[] => {
    const raw = companyDetails?.activeModules || currentCompany?.activeModules;
    if (!raw) return ['crm', 'pos'];
    if (Array.isArray(raw)) return raw;
    if (typeof raw === 'string') {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        return raw.split(',').map(s => s.trim()).filter(Boolean);
      }
    }
    return ['crm', 'pos'];
  };

  const [formData, setFormData] = useState({
    name: '',
    employeeId: '',
    username: '',
    email: '',
    password: '',
    role: 'Sales',
    department: 'Sales & Marketing'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch staff list
  const fetchStaff = async () => {
    setLoading(true);
    try {
      const companyId = companyDetails?.id || currentCompany?.id || currentUser?.companyId;
      const companyCode = companyDetails?.companyCode || currentCompany?.companyCode || currentUser?.companyCode;
      const userEmail = currentUser?.email;
      const userId = currentUser?.id;

      const res = await fetch(`/api/auth/company-staff?companyId=${companyId || ''}&companyCode=${companyCode || ''}&userEmail=${encodeURIComponent(userEmail || '')}&userId=${userId || ''}`);
      const data = await res.json();
      if (res.ok) {
        setStaffList(data.staff || []);
        if (data.company) {
          setCompanyDetails(data.company);
          localStorage.setItem('company', JSON.stringify({
            ...(currentCompany || {}),
            ...data.company
          }));
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const effectiveCompanyCode = companyDetails?.companyCode || currentCompany?.companyCode || currentUser?.companyCode || 'TENANT';
  const effectiveCompanyName = companyDetails?.name || currentCompany?.name || 'My Company';

  const copyCompanyCode = () => {
    navigator.clipboard.writeText(effectiveCompanyCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleAddStaffSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsSubmitting(true);

    try {
      const companyId = companyDetails?.id || currentCompany?.id || currentUser?.companyId;
      const companyCode = effectiveCompanyCode;

      const res = await fetch('/api/auth/add-staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId,
          companyCode,
          name: formData.name,
          employeeId: formData.employeeId,
          username: formData.username || formData.email.split('@')[0],
          email: formData.email,
          password: formData.password,
          role: formData.role,
          department: formData.department
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Failed to create staff member.');
        setIsSubmitting(false);
        return;
      }

      setSuccessMsg(`Staff member "${formData.name}" added successfully!`);
      setShowAddModal(false);
      setFormData({
        name: '',
        employeeId: '',
        username: '',
        email: '',
        password: '',
        role: 'Sales',
        department: 'Sales & Marketing'
      });
      fetchStaff();
    } catch (err: any) {
      setErrorMsg(err.message || 'Network error.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteStaff = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove staff member "${name}"?`)) return;

    try {
      const res = await fetch(`/api/auth/delete-staff/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchStaff();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const roleColors: Record<string, string> = {
    Cashier: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    Sales: 'bg-blue-100 text-blue-800 border-blue-200',
    HR: 'bg-purple-100 text-purple-800 border-purple-200',
    Employee: 'bg-slate-100 text-slate-800 border-slate-200',
    Manager: 'bg-amber-100 text-amber-800 border-amber-200',
    CompanyAdmin: 'bg-rose-100 text-rose-800 border-rose-200'
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6">
      <OSNavigation />

      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-indigo-950 text-white p-5 sm:p-7 rounded-3xl shadow-xl relative overflow-hidden border border-purple-500/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 text-purple-300 text-xs font-bold uppercase tracking-wider mb-2">
              <span className="flex items-center gap-1.5 min-w-0">
                <Building2 className="w-4 h-4 text-purple-400 shrink-0" />
                <span className="truncate">Company Workspace: {effectiveCompanyName}</span>
              </span>
              <span>•</span>
              <span className="font-mono bg-purple-500/30 px-2.5 py-0.5 rounded text-purple-200 font-bold shrink-0">
                Code: {effectiveCompanyCode}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-white flex items-center">
              Staff & Employee Access Control
            </h1>
            <p className="text-purple-200/80 text-xs sm:text-sm mt-1 max-w-2xl">
              Create employee user accounts for your team. Assign them dedicated roles (Cashier, Sales, HR, ESS) so they can login and operate in your workspace.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-5 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm shadow-lg shadow-purple-600/30 transition-all flex items-center shrink-0 cursor-pointer"
            >
              <UserPlus className="w-4 h-4 mr-2 shrink-0" />
              <span className="whitespace-nowrap">Add Staff Member</span>
            </button>
          </div>
        </div>
      </div>

      {/* Prominent Company Code Quick-Share Card */}
      <div className="bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50 border-2 border-purple-200/80 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3 sm:space-x-4 min-w-0">
          <div className="w-12 h-12 rounded-2xl bg-white border border-purple-200 flex items-center justify-center text-purple-700 font-bold shadow-xs shrink-0">
            <Building2 className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-900">Your Company Code:</span>
              <span className="text-xl sm:text-2xl font-black font-mono tracking-wider text-purple-700 bg-white px-3 py-1 rounded-xl border border-purple-300 shadow-xs">
                {effectiveCompanyCode}
              </span>
            </div>
            <p className="text-xs text-gray-600 mt-1.5 max-w-xl">
              Give this <strong>Company Code</strong> to your Cashier and Staff. They must enter this code on the <strong>Staff Sign In</strong> page along with their Username/EmpID to login.
            </p>
          </div>
        </div>

        <button
          onClick={copyCompanyCode}
          className="px-4 py-2.5 bg-white hover:bg-purple-100/60 text-purple-700 font-bold text-xs rounded-xl border border-purple-300 transition-all shadow-xs flex items-center space-x-2 shrink-0 cursor-pointer"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-600 shrink-0" /> : <Copy className="w-4 h-4 shrink-0" />}
          <span className="whitespace-nowrap">{copied ? 'Copied to Clipboard!' : 'Copy Company Code'}</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold flex items-center">
          <CheckCircle2 className="w-5 h-5 mr-2 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Staff Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-xs font-bold text-slate-500 uppercase">Active Staff Accounts</div>
          <div className="text-3xl font-black text-slate-900 mt-1">{(Array.isArray(staffList) ? staffList : []).length}</div>
          <div className="text-xs text-slate-400 mt-1">
            Out of {companyDetails?.maxUsersAllowed || currentCompany?.maxUsersAllowed || 15} allowed
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-xs font-bold text-slate-500 uppercase">Workspace Modules</div>
          <div className="text-sm font-bold text-purple-700 mt-2 flex flex-wrap gap-1">
            {getModulesList().map((m: string) => (
              <span key={m} className="px-2 py-0.5 rounded bg-purple-50 border border-purple-200 uppercase text-[11px] font-bold">
                {m}
              </span>
            ))}
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-xs font-bold text-slate-500 uppercase">Employee Login Instruction</div>
          <p className="text-xs text-slate-600 mt-2">
            Ask staff to enter Company Code <b className="text-purple-700 font-mono bg-purple-50 px-2 py-0.5 rounded border border-purple-200">{effectiveCompanyCode}</b> and their Username/Password.
          </p>
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-extrabold text-slate-800 text-base flex items-center">
            <Users className="w-5 h-5 mr-2 text-purple-600" />
            <span>Staff Roster ({(Array.isArray(staffList) ? staffList : []).length})</span>
          </h3>
          <button onClick={fetchStaff} className="text-slate-400 hover:text-slate-600 text-xs font-bold flex items-center cursor-pointer">
            <RefreshCw className="w-3.5 h-3.5 mr-1" /> Refresh
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm">Loading staff members...</div>
        ) : (!Array.isArray(staffList) || staffList.length === 0) ? (
          <div className="p-12 text-center text-slate-500">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="font-bold text-base text-slate-700">No staff members created yet.</p>
            <p className="text-xs text-slate-400 mt-1">Click "Add Staff Member" above to create employee logins for your store or team.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-black text-slate-500">
                <tr>
                  <th className="py-3 px-5">Staff Member</th>
                  <th className="py-3 px-5">Emp ID / Username</th>
                  <th className="py-3 px-5">Role & Access</th>
                  <th className="py-3 px-5">Department</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(Array.isArray(staffList) ? staffList : []).map(member => (
                  <tr key={member.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-5">
                      <div className="font-bold text-slate-900">{member.name}</div>
                      <div className="text-xs text-slate-500">{member.email}</div>
                    </td>
                    <td className="py-4 px-5 font-mono text-xs text-slate-600">
                      <div>{member.employeeId || '-'}</div>
                      <div className="text-slate-400">@{member.username}</div>
                    </td>
                    <td className="py-4 px-5">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-extrabold border ${roleColors[member.role] || 'bg-slate-100 text-slate-700'}`}>
                        {member.role}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-xs text-slate-600">
                      {member.department || 'General'}
                    </td>
                    <td className="py-4 px-5 text-right">
                      {member.role !== 'CompanyAdmin' && (
                        <button
                          onClick={() => handleDeleteStaff(member.id, member.name)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Remove Staff"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ADD STAFF MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute right-5 top-5 text-slate-400 hover:text-slate-600 text-lg font-bold"
            >
              ✕
            </button>

            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center">
                <UserPlus className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Add Staff Account</h3>
                <p className="text-xs text-slate-500">
                  Workspace: <span className="font-semibold text-slate-800">{effectiveCompanyName}</span> • Code: <span className="font-mono font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded">{effectiveCompanyCode}</span>
                </p>
              </div>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-semibold">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleAddStaffSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Kumar"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Employee ID</label>
                  <input
                    type="text"
                    placeholder="e.g. EMP-01"
                    value={formData.employeeId}
                    onChange={e => setFormData({ ...formData, employeeId: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Work Email / Login *</label>
                  <input
                    type="email"
                    required
                    placeholder="ramesh@mycompany.com"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Temporary Password *</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Assigned Role *</label>
                  <select
                    value={formData.role}
                    onChange={e => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                  >
                    <option value="Cashier">POS Cashier (Billing Only)</option>
                    <option value="Sales">Sales Executive (CRM & Leads)</option>
                    <option value="HR">HR Manager (Attendance & Payroll)</option>
                    <option value="Employee">Employee (Self Clock-in & Leaves)</option>
                    <option value="Manager">Team Manager (Approvals)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Department</label>
                  <input
                    type="text"
                    placeholder="e.g. Sales, Counter, HR"
                    value={formData.department}
                    onChange={e => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-sm shadow-lg shadow-purple-600/25 transition-all flex items-center justify-center disabled:opacity-50 mt-4"
              >
                {isSubmitting ? 'Creating Staff Account...' : 'Save & Issue Staff Credentials'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
