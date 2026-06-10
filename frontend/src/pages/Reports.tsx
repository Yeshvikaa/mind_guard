import React, { useState } from 'react';
import { api } from '../context/AuthContext';
import { Download, FileText, FileSpreadsheet, BarChart2, Loader } from 'lucide-react';

export const Reports: React.FC = () => {
  const [downloading, setDownloading] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleDownload = async (format: 'pdf' | 'csv') => {
    setDownloading(format);
    try {
      const response = await api.get(`/admin/reports/download`, {
        params: { format },
        responseType: 'blob'
      });

      const mimeMap: Record<string, string> = {
        pdf: 'application/pdf',
        csv: 'text/csv'
      };
      const extMap: Record<string, string> = {
        pdf: 'pdf',
        csv: 'csv'
      };

      const blob = new Blob([response.data], { type: mimeMap[format] });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `mindguard_wellness_report.${extMap[format]}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setSuccess(`${format.toUpperCase()} report downloaded successfully.`);
      setTimeout(() => setSuccess(null), 4000);
    } catch (err) {
      console.warn('Report download failed', err);
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">Wellness Audit Reports</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Generate downloadable PDF and CSV reports from live database data.</p>
      </div>

      {success && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30 flex items-center gap-2">
          <FileText className="w-5 h-5" />
          <span className="text-sm font-semibold">{success}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* PDF Report */}
        <div className="p-8 bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-3xl shadow-sm space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="w-14 h-14 bg-red-50 dark:bg-red-950/20 text-red-500 rounded-2xl flex items-center justify-center">
              <FileText className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">PDF Wellness Report</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                Generates a comprehensive PDF document including employee directory, stress score sampling tables, department breakdowns, and emergency log summaries. Ready for HR presentations.
              </p>
            </div>
            <ul className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
              {['Employee directory table', 'Stress score history samples', 'Emergency alert logs', 'Company wellness summary'].map(item => (
                <li key={item} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-500 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <button
            onClick={() => handleDownload('pdf')}
            disabled={!!downloading}
            className="w-full py-3.5 rounded-2xl bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white font-bold transition shadow-lg shadow-red-500/20 flex items-center justify-center gap-2"
          >
            {downloading === 'pdf' ? <Loader className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            {downloading === 'pdf' ? 'Generating PDF...' : 'Download PDF Report'}
          </button>
        </div>

        {/* CSV Report */}
        <div className="p-8 bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-3xl shadow-sm space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500 rounded-2xl flex items-center justify-center">
              <FileSpreadsheet className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">CSV Spreadsheet Export</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                Exports the full employee directory as a structured CSV file — compatible with Excel, Google Sheets, and HR data warehouses. Includes all registered fields.
              </p>
            </div>
            <ul className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
              {['Full Name, Email, Employee ID', 'Department, Company details', 'Daily streak counts', 'Registration timestamp'].map(item => (
                <li key={item} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <button
            onClick={() => handleDownload('csv')}
            disabled={!!downloading}
            className="w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
          >
            {downloading === 'csv' ? <Loader className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            {downloading === 'csv' ? 'Generating CSV...' : 'Download CSV Export'}
          </button>
        </div>
      </div>

      {/* Info card */}
      <div className="p-6 bg-brand-50/40 dark:bg-brand-950/10 border border-brand-100/30 rounded-3xl flex items-start gap-4">
        <BarChart2 className="w-6 h-6 text-brand-500 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-slate-800 dark:text-white">Reports are generated from live database data</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            All figures, employee counts, and stress analytics are fetched in real-time from MongoDB at the moment of download. No static or cached data is used. New employees and sessions are reflected immediately.
          </p>
        </div>
      </div>
    </div>
  );
};
export default Reports;
