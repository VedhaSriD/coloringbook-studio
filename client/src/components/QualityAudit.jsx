import React, { useState, useEffect } from 'react';
import { ShieldCheck, AlertTriangle, CheckCircle, Download, FileCheck, RefreshCw } from 'lucide-react';

export default function QualityAudit({ project }) {
  const [audit, setAudit] = useState(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState(null);

  const runAudit = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/projects/${project.id}/audit`, { method: 'POST' });
      const data = await res.json();
      setAudit(data);
    } catch (err) {
      alert('Quality check failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runAudit();
  }, [project]);

  const handleExport = async (isPreview = false) => {
    setExporting(true);
    try {
      const res = await fetch(`/api/projects/${project.id}/export-pdf`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPreview })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      // Trigger actual download
      const link = document.createElement('a');
      link.href = data.downloadUrl;
      link.download = data.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      alert('Export failed: ' + err.message);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Pre-Flight Checklist */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-slate-900 text-base">Pre-Flight Quality Audit</h3>
          </div>
          <button
            onClick={runAudit}
            disabled={loading}
            className="flex items-center space-x-1 text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Re-scan Book</span>
          </button>
        </div>

        {audit ? (
          <div className="space-y-4">
            <div className={`p-4 rounded-xl border flex items-start space-x-3 ${
              audit.passed ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'
            }`}>
              {audit.passed ? (
                <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              )}
              <div>
                <h4 className={`text-sm font-bold ${audit.passed ? 'text-emerald-900' : 'text-amber-900'}`}>
                  {audit.passed ? 'All Quality Checks Passed! Ready to Export.' : 'Quality Warnings Detected'}
                </h4>
                <p className={`text-xs mt-1 ${audit.passed ? 'text-emerald-700' : 'text-amber-700'}`}>
                  {audit.completedPages} of {audit.totalPages} coloring illustrations are filled and verified.
                </p>
              </div>
            </div>

            {audit.issues?.length > 0 && (
              <div className="space-y-2">
                <h5 className="text-xs font-bold text-slate-700 uppercase">Issues to address:</h5>
                <ul className="space-y-1.5">
                  {audit.issues.map((issue, idx) => (
                    <li key={idx} className="text-xs text-amber-800 flex items-center space-x-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                      <span>{issue}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <div className="text-xs text-slate-400">Scanning illustrations...</div>
        )}
      </div>

      {/* Export Options */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <h3 className="font-bold text-slate-900 text-base mb-2">Export Print-Ready Documents</h3>
        <p className="text-xs text-slate-500 mb-6">
          PDFs are rendered at standard US Letter format (8.5 × 11 in) with 0.5" printing margins and zero aspect distortion.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border border-slate-200 rounded-xl p-5 hover:border-indigo-300 transition flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <FileCheck className="w-5 h-5 text-indigo-600" />
                <h4 className="font-bold text-slate-900 text-sm">Full Print-Ready PDF</h4>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Highest resolution, lossless black-and-white vector-sharp line art. Ready to upload straight to Etsy as your digital product file.
              </p>
            </div>
            <button
              onClick={() => handleExport(false)}
              disabled={exporting}
              className="mt-5 w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-semibold py-2.5 rounded-lg text-xs shadow flex items-center justify-center space-x-2 transition"
            >
              <Download className="w-4 h-4" />
              <span>{exporting ? 'Generating Document...' : 'Download Print-Ready PDF'}</span>
            </button>
          </div>

          <div className="border border-slate-200 rounded-xl p-5 hover:border-slate-300 transition flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <FileCheck className="w-5 h-5 text-slate-600" />
                <h4 className="font-bold text-slate-900 text-sm">Low-Res Watermarked Preview PDF</h4>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Lightweight, watermarked PDF copy suitable for emailing, customer preview screenshots, or social media teasers.
              </p>
            </div>
            <button
              onClick={() => handleExport(true)}
              disabled={exporting}
              className="mt-5 w-full bg-slate-800 hover:bg-slate-900 disabled:bg-slate-400 text-white font-semibold py-2.5 rounded-lg text-xs shadow flex items-center justify-center space-x-2 transition"
            >
              <Download className="w-4 h-4" />
              <span>{exporting ? 'Generating Preview...' : 'Download Preview PDF'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}