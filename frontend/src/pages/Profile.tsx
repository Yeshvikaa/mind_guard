import React, { useEffect, useState } from 'react';
import { useAuth, api } from '../context/AuthContext';
import { 
  User, Mail, Phone, ShieldAlert, Upload, 
  CheckCircle2, AlertCircle, RefreshCw
} from 'lucide-react';

export const Profile: React.FC = () => {
  const { user, refreshUser } = useAuth();
  
  // States
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  
  // Emergency info
  const [emergencyName, setEmergencyName] = useState(user?.emergencyContact?.name || '');
  const [emergencyPhone, setEmergencyPhone] = useState(user?.emergencyContact?.phone || '');
  const [emergencyEmail, setEmergencyEmail] = useState(user?.emergencyContact?.email || '');

  // Photo
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName);
      setPhone(user.phone || '');
      setEmergencyName(user.emergencyContact?.name || '');
      setEmergencyPhone(user.emergencyContact?.phone || '');
      setEmergencyEmail(user.emergencyContact?.email || '');
    }
  }, [user]);

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
    formData.append('phone', phone);
    formData.append('emergencyContactName', emergencyName);
    formData.append('emergencyContactPhone', emergencyPhone);
    formData.append('emergencyContactEmail', emergencyEmail);
    if (photo) {
      formData.append('profilePhoto', photo);
    }

    try {
      const res = await api.put('/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        setSuccess(true);
        refreshUser();
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Profile update failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">Profile Settings</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your corporate credentials and safety contacts.</p>
      </div>

      {success && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" />
          <span className="text-sm font-semibold">Profile updated successfully.</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/30 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          <span className="text-sm font-semibold">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="p-6 bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-3xl shadow-sm space-y-6">
          {/* Avatar Upload */}
          <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-slate-100 dark:border-dark-850">
            <div className="relative w-24 h-24 rounded-full border border-slate-200 dark:border-dark-750 overflow-hidden bg-slate-50">
              <img 
                src={photoPreview || (user?.profilePhoto ? `https://mind-guard-bcc4.onrender.com${user.profilePhoto}` : '/uploads/default-avatar.png')} 
                alt="Avatar" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://mind-guard-bcc4.onrender.com/uploads/default-avatar.png';
                }}
              />
            </div>
            <div className="space-y-2 text-center sm:text-left">
              <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold transition shadow shadow-brand-500/10">
                <Upload className="w-4 h-4" /> Change Profile Photo
                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
              </label>
              <p className="text-[10px] text-slate-400">Supports JPG, PNG, or WEBP up to 5MB.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Full Name */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 dark:border-dark-805 bg-slate-50/50 dark:bg-dark-950/50 text-slate-800 dark:text-white text-sm outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            {/* Email (Read Only) */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Work Email</label>
              <div className="relative opacity-60">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 dark:border-dark-805 bg-slate-100 dark:bg-dark-950 text-slate-800 dark:text-white text-sm outline-none cursor-not-allowed"
                />
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Personal Phone</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 dark:border-dark-805 bg-slate-50/50 dark:bg-dark-950/50 text-slate-800 dark:text-white text-sm outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            {/* Department (Read Only) */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Department / Role</label>
              <div className="relative opacity-60">
                <ShieldAlert className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                <input
                  type="text"
                  disabled
                  value={`${user?.department || 'Staff'} • ${user?.role || 'Employee'}`}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 dark:border-dark-805 bg-slate-100 dark:bg-dark-950 text-slate-800 dark:text-white text-sm outline-none cursor-not-allowed"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Emergency Contacts Card */}
        <div className="p-6 bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-3xl shadow-sm space-y-6">
          <h3 className="font-bold text-red-500 flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-dark-850">
            <ShieldAlert className="w-5 h-5" /> Safety & Emergency Contacts
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Contact Person Name</label>
              <input
                type="text"
                required
                value={emergencyName}
                onChange={e => setEmergencyName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-dark-805 bg-slate-50/50 dark:bg-dark-950/50 text-slate-800 dark:text-white text-sm outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="Jane Doe"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Contact Phone</label>
              <input
                type="text"
                required
                value={emergencyPhone}
                onChange={e => setEmergencyPhone(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-dark-805 bg-slate-50/50 dark:bg-dark-950/50 text-slate-800 dark:text-white text-sm outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="+1 (555) 019-9999"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Contact Email</label>
              <input
                type="email"
                required
                value={emergencyEmail}
                onChange={e => setEmergencyEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-dark-805 bg-slate-50/50 dark:bg-dark-950/50 text-slate-800 dark:text-white text-sm outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="jane@emergency.com"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 rounded-2xl bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-bold transition shadow-xl shadow-brand-500/25 flex items-center justify-center gap-2"
        >
          {loading && <RefreshCw className="w-4 h-4 animate-spin" />}
          {loading ? 'Saving Changes...' : 'Save Profile Changes'}
        </button>
      </form>
    </div>
  );
};
export default Profile;
