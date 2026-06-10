import React, { useEffect, useState } from 'react';
import { api } from '../context/AuthContext';
import { 
  Search, Plus, Edit2, Trash2, X, ChevronLeft, 
  ChevronRight, Users, ShieldAlert, Sparkles
} from 'lucide-react';

interface Employee {
  _id: string;
  fullName: string;
  email: string;
  department: string;
  company: string;
  employeeId: string;
  role: string;
  streak: number;
}

export const EmployeeManagement: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState<Employee | null>(null);

  // Form states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [deptField, setDeptField] = useState('');
  const [compField, setCompField] = useState('');
  const [empIdField, setEmpIdField] = useState('');
  const [roleField, setRoleField] = useState('Employee');

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/employees', {
        params: { search, department, page, limit: 8 }
      });
      if (res.data.success) {
        setEmployees(res.data.employees);
        setTotalPages(res.data.totalPages);
      }
    } catch (err) {
      console.warn('Failed to load employees', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [search, department, page]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/admin/employees', {
        fullName,
        email,
        password,
        department: deptField,
        company: compField,
        employeeId: empIdField,
        role: roleField
      });
      if (res.data.success) {
        setIsAddOpen(false);
        resetForm();
        fetchEmployees();
      }
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to add employee');
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmp) return;
    try {
      const res = await api.put(`/admin/employees/${selectedEmp._id}`, {
        fullName,
        email,
        department: deptField,
        company: compField,
        employeeId: empIdField,
        role: roleField
      });
      if (res.data.success) {
        setIsEditOpen(false);
        resetForm();
        fetchEmployees();
      }
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to update employee');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this employee?')) return;
    try {
      const res = await api.delete(`/admin/employees/${id}`);
      if (res.data.success) {
        fetchEmployees();
      }
    } catch (err) {
      console.warn(err);
    }
  };

  const openEditModal = (emp: Employee) => {
    setSelectedEmp(emp);
    setFullName(emp.fullName);
    setEmail(emp.email);
    setDeptField(emp.department || '');
    setCompField(emp.company || '');
    setEmpIdField(emp.employeeId || '');
    setRoleField(emp.role);
    setIsEditOpen(true);
  };

  const resetForm = () => {
    setFullName('');
    setEmail('');
    setPassword('');
    setDeptField('');
    setCompField('');
    setEmpIdField('');
    setRoleField('Employee');
    setSelectedEmp(null);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">Employee Directory</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Configure user accounts and assign department credentials.</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setIsAddOpen(true);
          }}
          className="px-5 py-3 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold transition shadow-lg shadow-brand-500/15 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add New Employee
        </button>
      </div>

      {/* Filters bar */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-dark-805 bg-white dark:bg-dark-900 text-slate-800 dark:text-white text-sm outline-none focus:ring-2 focus:ring-brand-500"
            placeholder="Search by name, email, or employee ID..."
          />
        </div>

        <select
          value={department}
          onChange={e => setDepartment(e.target.value)}
          className="px-4 py-3 rounded-2xl border border-slate-200 dark:border-dark-805 bg-white dark:bg-dark-900 text-slate-700 dark:text-slate-300 text-sm outline-none focus:ring-2 focus:ring-brand-500"
        >
          <option value="">All Departments</option>
          <option value="Engineering">Engineering</option>
          <option value="Human Resources">Human Resources</option>
          <option value="Executive">Executive</option>
          <option value="Marketing">Marketing</option>
        </select>
      </div>

      {/* Directory Table */}
      <div className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-dark-950 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-dark-800">
                <th className="p-5">Name / ID</th>
                <th className="p-5">Email</th>
                <th className="p-5">Department</th>
                <th className="p-5">Streak</th>
                <th className="p-5">Role</th>
                <th className="p-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-dark-800 text-slate-700 dark:text-slate-350">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">Loading directory...</td>
                </tr>
              ) : employees.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">No employees registered match filters.</td>
                </tr>
              ) : (
                employees.map(emp => (
                  <tr key={emp._id} className="hover:bg-slate-50/50 dark:hover:bg-dark-800/20 transition-all">
                    <td className="p-5">
                      <p className="font-bold text-slate-900 dark:text-white">{emp.fullName}</p>
                      <span className="text-[10px] text-slate-400 uppercase tracking-widest">{emp.employeeId || 'N/A'}</span>
                    </td>
                    <td className="p-5 font-medium">{emp.email}</td>
                    <td className="p-5 font-semibold text-slate-500">{emp.department || 'N/A'}</td>
                    <td className="p-5 font-bold text-orange-500">{emp.streak} days</td>
                    <td className="p-5">
                      <span className={`px-2 py-0.5 rounded-lg text-[9px] font-extrabold ${
                        emp.role.includes('Admin') ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30' : 'bg-slate-100 text-slate-600 dark:bg-dark-800'
                      }`}>
                        {emp.role}
                      </span>
                    </td>
                    <td className="p-5 text-right flex justify-end gap-2.5">
                      <button 
                        onClick={() => openEditModal(emp)}
                        className="p-2 text-slate-450 hover:text-brand-500 bg-slate-50 dark:bg-dark-800 rounded-xl hover:shadow"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(emp._id)}
                        className="p-2 text-slate-450 hover:text-red-500 bg-slate-50 dark:bg-dark-800 rounded-xl hover:shadow"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination footer */}
        <div className="p-4 border-t border-slate-100 dark:border-dark-800 flex justify-between items-center text-xs font-semibold text-slate-500">
          <span>Page {page} of {totalPages}</span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-xl border border-slate-200 dark:border-dark-800 hover:bg-slate-50 dark:hover:bg-dark-800 disabled:opacity-50 transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 rounded-xl border border-slate-200 dark:border-dark-800 hover:bg-slate-50 dark:hover:bg-dark-800 disabled:opacity-50 transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Add Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/45 backdrop-blur-sm">
          <div className="bg-white dark:bg-dark-900 rounded-3xl max-w-md w-full border border-slate-200/50 p-6 shadow-2xl space-y-6">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-dark-850">
              <h3 className="font-bold text-slate-800 dark:text-white">Add New Employee</h3>
              <button onClick={() => setIsAddOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleAdd} className="space-y-4 text-xs font-semibold text-slate-400">
              <div className="space-y-1">
                <label className="uppercase">Full Name</label>
                <input type="text" required value={fullName} onChange={e => setFullName(e.target.value)} className="w-full px-4 py-2.5 border border-slate-200 dark:border-dark-805 bg-slate-50/30 dark:bg-dark-955 rounded-xl text-slate-800 dark:text-white outline-none" />
              </div>
              <div className="space-y-1">
                <label className="uppercase">Email Address</label>
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-2.5 border border-slate-200 dark:border-dark-805 bg-slate-50/30 dark:bg-dark-955 rounded-xl text-slate-800 dark:text-white outline-none" />
              </div>
              <div className="space-y-1">
                <label className="uppercase">Password</label>
                <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-2.5 border border-slate-200 dark:border-dark-805 bg-slate-50/30 dark:bg-dark-955 rounded-xl text-slate-800 dark:text-white outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="uppercase">Department</label>
                  <input type="text" required value={deptField} onChange={e => setDeptField(e.target.value)} className="w-full px-4 py-2.5 border border-slate-200 dark:border-dark-805 bg-slate-50/30 dark:bg-dark-955 rounded-xl text-slate-800 dark:text-white outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="uppercase">Employee ID</label>
                  <input type="text" required value={empIdField} onChange={e => setEmpIdField(e.target.value)} className="w-full px-4 py-2.5 border border-slate-200 dark:border-dark-805 bg-slate-50/30 dark:bg-dark-955 rounded-xl text-slate-800 dark:text-white outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="uppercase">Company</label>
                  <input type="text" required value={compField} onChange={e => setCompField(e.target.value)} className="w-full px-4 py-2.5 border border-slate-200 dark:border-dark-805 bg-slate-50/30 dark:bg-dark-955 rounded-xl text-slate-800 dark:text-white outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="uppercase">System Role</label>
                  <select value={roleField} onChange={e => setRoleField(e.target.value)} className="w-full px-4 py-2.5 border border-slate-200 dark:border-dark-805 bg-slate-50/30 dark:bg-dark-955 rounded-xl text-slate-800 dark:text-white outline-none">
                    <option value="Employee">Employee</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
              </div>
              <button type="submit" className="w-full py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-2xl transition shadow">Save Account</button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/45 backdrop-blur-sm">
          <div className="bg-white dark:bg-dark-900 rounded-3xl max-w-md w-full border border-slate-200/50 p-6 shadow-2xl space-y-6">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-dark-850">
              <h3 className="font-bold text-slate-800 dark:text-white">Edit Employee Details</h3>
              <button onClick={() => setIsEditOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleEdit} className="space-y-4 text-xs font-semibold text-slate-400">
              <div className="space-y-1">
                <label className="uppercase">Full Name</label>
                <input type="text" required value={fullName} onChange={e => setFullName(e.target.value)} className="w-full px-4 py-2.5 border border-slate-200 dark:border-dark-805 bg-slate-50/30 dark:bg-dark-955 rounded-xl text-slate-800 dark:text-white outline-none" />
              </div>
              <div className="space-y-1">
                <label className="uppercase">Email Address</label>
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-2.5 border border-slate-200 dark:border-dark-805 bg-slate-50/30 dark:bg-dark-955 rounded-xl text-slate-800 dark:text-white outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="uppercase">Department</label>
                  <input type="text" required value={deptField} onChange={e => setDeptField(e.target.value)} className="w-full px-4 py-2.5 border border-slate-200 dark:border-dark-805 bg-slate-50/30 dark:bg-dark-955 rounded-xl text-slate-800 dark:text-white outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="uppercase">Employee ID</label>
                  <input type="text" required value={empIdField} onChange={e => setEmpIdField(e.target.value)} className="w-full px-4 py-2.5 border border-slate-200 dark:border-dark-805 bg-slate-50/30 dark:bg-dark-955 rounded-xl text-slate-800 dark:text-white outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="uppercase">Company</label>
                  <input type="text" required value={compField} onChange={e => setCompField(e.target.value)} className="w-full px-4 py-2.5 border border-slate-200 dark:border-dark-805 bg-slate-50/30 dark:bg-dark-955 rounded-xl text-slate-800 dark:text-white outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="uppercase">System Role</label>
                  <select value={roleField} onChange={e => setRoleField(e.target.value)} className="w-full px-4 py-2.5 border border-slate-200 dark:border-dark-805 bg-slate-50/30 dark:bg-dark-955 rounded-xl text-slate-800 dark:text-white outline-none">
                    <option value="Employee">Employee</option>
                    <option value="Admin">Admin</option>
                    <option value="Super Admin">Super Admin</option>
                  </select>
                </div>
              </div>
              <button type="submit" className="w-full py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-2xl transition shadow">Save Changes</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default EmployeeManagement;
