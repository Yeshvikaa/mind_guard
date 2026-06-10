import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HeartPulse, Lock, Mail, User, ShieldAlert, Upload, Phone, AlertCircle } from 'lucide-react';

export const Register: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  // Basic info
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  
  // Organization info
  const [company, setCompany] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [department, setDepartment] = useState('');
  const [companyId, setCompanyId] = useState('');
  
  // Contacts
  const [phone, setPhone] = useState('');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [emergencyEmail, setEmergencyEmail] = useState('');

  // Avatar upload
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData();
    formData.append('fullName', fullName);
    formData.append('email', email);
    formData.append('password', password);
    formData.append('age', age);
    formData.append('gender', gender);
    formData.append('company', company);
    formData.append('employeeId', employeeId);
    formData.append('department', department);
    formData.append('companyId', companyId);
    formData.append('phone', phone);
    formData.append('emergencyContactName', emergencyName);
    formData.append('emergencyContactPhone', emergencyPhone);
    formData.append('emergencyContactEmail', emergencyEmail);
    if (photo) {
      formData.append('profilePhoto', photo);
    }

    try {
      await register(formData);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Check your data.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 dark:bg-dark-950">
      <div className="w-full max-w-2xl bg-white dark:bg-dark-900 rounded-3xl shadow-2xl p-8 border border-slate-100 dark:border-dark-800 glass-card">
        {/* Brand */}
        <div className="text-center space-y-2 mb-8">
          <div className="inline-flex bg-brand-500 text-white p-3 rounded-2xl shadow-lg">
            <HeartPulse className="w-6 h-6" />
          </div>
          <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">Create MindGuard Account</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Join our corporate wellness platform</p>
        </div>

        {error && (
          <div className="p-4 mb-6 rounded-2xl bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 text-sm flex items-center gap-3 border border-red-100 dark:border-red-900/30">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar Upload */}
          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="relative w-24 h-24 rounded-full border-2 border-dashed border-slate-300 dark:border-dark-700 flex items-center justify-center bg-slate-50 dark:bg-dark-950 overflow-hidden">
              {photoPreview ? (
                <img src={photoPreview} alt="Avatar Preview" className="w-full h-full object-cover" />
              ) : (
                <Upload className="w-8 h-8 text-slate-400" />
              )}
            </div>
            <label className="cursor-pointer bg-slate-100 dark:bg-dark-800 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-xl text-xs font-bold hover:bg-slate-200 dark:hover:bg-dark-750 transition-all duration-200">
              Upload Profile Photo
              <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Account Details */}
            <div className="space-y-4 md:col-span-2">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white border-b border-slate-100 dark:border-dark-800 pb-2">
                1. Account Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Full Name</label>
                  <input type="text" required value={fullName} onChange={e => setFullName(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-dark-800 bg-slate-50/50 dark:bg-dark-950/50 text-slate-800 dark:text-white text-sm outline-none focus:ring-2 focus:ring-brand-500" placeholder="John Doe" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Work Email</label>
                  <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-dark-800 bg-slate-50/50 dark:bg-dark-950/50 text-slate-800 dark:text-white text-sm outline-none focus:ring-2 focus:ring-brand-500" placeholder="johndoe@company.com" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Password</label>
                  <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-dark-800 bg-slate-50/50 dark:bg-dark-950/50 text-slate-800 dark:text-white text-sm outline-none focus:ring-2 focus:ring-brand-500" placeholder="••••••••" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Phone Number</label>
                  <input type="text" required value={phone} onChange={e => setPhone(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-dark-800 bg-slate-50/50 dark:bg-dark-950/50 text-slate-800 dark:text-white text-sm outline-none focus:ring-2 focus:ring-brand-500" placeholder="+1 (555) 012-3456" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Age</label>
                  <input type="number" value={age} onChange={e => setAge(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-dark-800 bg-slate-50/50 dark:bg-dark-950/50 text-slate-800 dark:text-white text-sm outline-none focus:ring-2 focus:ring-brand-500" placeholder="28" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Gender</label>
                  <select value={gender} onChange={e => setGender(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-dark-800 bg-slate-50/50 dark:bg-dark-950/50 text-slate-800 dark:text-white text-sm outline-none focus:ring-2 focus:ring-brand-500">
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Non-Binary">Non-Binary</option>
                    <option value="Prefer Not To Say">Prefer Not To Say</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Corporate Profile */}
            <div className="space-y-4 md:col-span-2">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white border-b border-slate-100 dark:border-dark-800 pb-2">
                2. Corporate Profile
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Company</label>
                  <input type="text" value={company} onChange={e => setCompany(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-dark-800 bg-slate-50/50 dark:bg-dark-950/50 text-slate-800 dark:text-white text-sm outline-none focus:ring-2 focus:ring-brand-500" placeholder="Acme Corp" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Employee ID</label>
                  <input type="text" value={employeeId} onChange={e => setEmployeeId(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-dark-800 bg-slate-50/50 dark:bg-dark-950/50 text-slate-800 dark:text-white text-sm outline-none focus:ring-2 focus:ring-brand-500" placeholder="EMP-2918" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Department</label>
                  <input type="text" value={department} onChange={e => setDepartment(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-dark-800 bg-slate-50/50 dark:bg-dark-950/50 text-slate-800 dark:text-white text-sm outline-none focus:ring-2 focus:ring-brand-500" placeholder="Engineering" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Company ID</label>
                  <input type="text" value={companyId} onChange={e => setCompanyId(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-dark-800 bg-slate-50/50 dark:bg-dark-950/50 text-slate-800 dark:text-white text-sm outline-none focus:ring-2 focus:ring-brand-500" placeholder="ACME-100" />
                </div>
              </div>
            </div>

            {/* Emergency Contacts */}
            <div className="space-y-4 md:col-span-2">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white border-b border-slate-100 dark:border-dark-800 pb-2 flex items-center gap-1.5 text-red-500">
                <ShieldAlert className="w-4 h-4" /> 3. Emergency Contacts
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1 md:col-span-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Contact Name</label>
                  <input type="text" required value={emergencyName} onChange={e => setEmergencyName(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-dark-800 bg-slate-50/50 dark:bg-dark-950/50 text-slate-800 dark:text-white text-sm outline-none focus:ring-2 focus:ring-brand-500" placeholder="Jane Doe" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Contact Phone</label>
                  <input type="text" required value={emergencyPhone} onChange={e => setEmergencyPhone(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-dark-800 bg-slate-50/50 dark:bg-dark-950/50 text-slate-800 dark:text-white text-sm outline-none focus:ring-2 focus:ring-brand-500" placeholder="+1 (555) 019-9999" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Contact Email</label>
                  <input type="email" required value={emergencyEmail} onChange={e => setEmergencyEmail(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-dark-800 bg-slate-50/50 dark:bg-dark-950/50 text-slate-800 dark:text-white text-sm outline-none focus:ring-2 focus:ring-brand-500" placeholder="jane@emergency.com" />
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-bold transition-all duration-200 shadow-xl shadow-brand-500/25 hover:shadow-brand-500/35 hover:-translate-y-0.5"
          >
            {loading ? 'Submitting Registration...' : 'Complete Registration'}
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-slate-500 dark:text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-brand-600 dark:text-brand-400 hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};
export default Register;
