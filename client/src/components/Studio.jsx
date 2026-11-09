import React, { useState } from 'react';
import { 
  Sparkles, Upload, Eye, Trash2, CheckCircle2, 
  FileText, Palette, ShieldCheck, ShoppingCart, 
  RefreshCw, ArrowUp, ArrowDown 
} from 'lucide-react';
import CoverDesigner from './CoverDesigner';
import QualityAudit from './QualityAudit';
import EtsyListingPrep from './EtsyListingPrep';
import ZoomModal from './ZoomModal';

export default function Studio({ project, onProjectUpdate }) {
  const [activeTab, setActiveTab] = useState('pages'); // pages | cover | audit | etsy
  const [inspectImage, setInspectImage] = useState(null);
  const [loadingPageId, setLoadingPageId] = useState(null);

  // Save current project state
  const syncProject = async (updated) => {
    onProjectUpdate(updated);
    await fetch(`/api/projects/${updated.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated)
    });
  };

  // 1. Direct Image File Upload Handler
  const handleFileUpload = async (pageId, file) => {
    if (!file) return;
    setLoadingPageId(pageId);
    const formData = new FormData();
    formData.append('image', file);
    formData.append('projectId', project.id);
    formData.append('subfolder', 'illustrations');

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      const updatedPages = project.pages.map(p => {
        if (p.id === pageId) {
          return { ...p, imageUrl: data.url, status: 'uploaded' };
        }
        return p;
      });

      await syncProject({ ...project, pages: updatedPages });
    } catch (err) {
      alert('Upload failed: ' + err.message);
    } finally {
      setLoadingPageId(null);
    }
  };

  // 2. AI Image Generation Trigger
  const handleGenerateAI = async (page) => {
    setLoadingPageId(page.id);
    try {
      const res = await fetch('/api/generate-ai-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: project.id,
          conceptPrompt: page.concept,
          styleNote: project.style
        })
      });

      const data = await res.json();
      if (data.error) {
        alert(`AI Generation note: ${data.error}\n\nYou can always click "Upload Image" to directly add your own black-and-white page!`);
        return;
      }

      const updatedPages = project.pages.map(p => {
        if (p.id === page.id) {
          return { ...p, imageUrl: data.url, status: 'generated' };
        }
        return p;
      });

      await syncProject({ ...project, pages: updatedPages });
    } catch (err) {
      alert('Generation error: ' + err.message);
    } finally {
      setLoadingPageId(null);
    }
  };

  // 3. Move Page Position
  const movePage = (index, direction) => {
    const target = index + direction;
    if (target < 0 || target >= project.pages.length) return;
    const newPages = [...project.pages];
    const temp = newPages[index];
    newPages[index] = newPages[target];
    newPages[target] = temp;
    // Renumber
    newPages.forEach((p, idx) => p.pageNumber = idx + 1);
    syncProject({ ...project, pages: newPages });
  };

  return (
    <div className="space-y-6">
      {/* Studio Navigation Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">{project.title}</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {project.pageCount} Pages • {project.paperSize} • Age {project.targetAge}
          </p>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('pages')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'pages' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Pages ({project.pages.filter(p => !!p.imageUrl).length}/{project.pages.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('cover')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'cover' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Palette className="w-4 h-4" />
            <span>Cover Designer</span>
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'audit' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Quality Audit & Export</span>
          </button>
          <button
            onClick={() => setActiveTab('etsy')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'etsy' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Etsy Listing Prep</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Pages Grid */}
      {activeTab === 'pages' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide">
              Illustrations & Line Art
            </h3>
            <span className="text-xs text-slate-500">
              Format: Pure black lines, pure white background, thick smooth outlines
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {project.pages.map((page, index) => {
              const isLoading = loadingPageId === page.id;

              return (
                <div 
                  key={page.id} 
                  className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm flex flex-col justify-between"
                >
                  <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                    <span className="font-bold text-xs text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full">
                      Page {index + 1}
                    </span>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => movePage(index, -1)}
                        disabled={index === 0}
                        className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-20"
                        title="Move Up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => movePage(index, 1)}
                        disabled={index === project.pages.length - 1}
                        className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-20"
                        title="Move Down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Canvas Viewport */}
                  <div className="p-4 flex flex-col items-center justify-center min-h-[260px] bg-white">
                    {page.imageUrl ? (
                      <div className="relative group w-full flex items-center justify-center">
                        <img
                          src={page.imageUrl}
                          alt={page.concept}
                          className="max-h-56 max-w-full object-contain rounded border border-slate-200 shadow-inner"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center space-x-3 rounded">
                          <button
                            onClick={() => setInspectImage(page.imageUrl)}
                            className="bg-white text-slate-800 p-2 rounded-full shadow hover:bg-slate-100"
                            title="Inspect Line Quality"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              const updated = project.pages.map(p => p.id === page.id ? { ...p, imageUrl: null } : p);
                              syncProject({ ...project, pages: updated });
                            }}
                            className="bg-red-600 text-white p-2 rounded-full shadow hover:bg-red-700"
                            title="Remove illustration"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center p-6 border-2 border-dashed border-slate-200 rounded-xl w-full">
                        <p className="text-xs text-slate-400">No illustration yet</p>
                        <p className="text-xs font-semibold text-slate-700 mt-2 px-2 italic">"{page.concept}"</p>
                      </div>
                    )}
                  </div>

                  {/* Actions Bar */}
                  <div className="p-3 bg-slate-50 border-t border-slate-100 flex flex-col gap-2">
                    <p className="text-xs font-medium text-slate-700 line-clamp-1">
                      {page.concept}
                    </p>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleGenerateAI(page)}
                        disabled={isLoading}
                        className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white text-xs font-semibold py-1.5 px-2 rounded-lg flex items-center justify-center space-x-1 shadow-sm transition"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{isLoading ? 'Processing...' : page.imageUrl ? 'Regenerate' : 'AI Generate'}</span>
                      </button>

                      <label className="flex-1 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-xs font-semibold py-1.5 px-2 rounded-lg flex items-center justify-center space-x-1 cursor-pointer transition">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload File</span>
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/webp"
                          className="hidden"
                          onChange={(e) => handleFileUpload(page.id, e.target.files[0])}
                        />
                      </label>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Cover Designer */}
      {activeTab === 'cover' && (
        <CoverDesigner
          project={project}
          onSave={(coverData) => syncProject({ ...project, cover: coverData })}
        />
      )}

      {/* Tab 3: Quality Check & PDF Export */}
      {activeTab === 'audit' && (
        <QualityAudit project={project} />
      )}

      {/* Tab 4: Etsy Listing Preparation */}
      {activeTab === 'etsy' && (
        <EtsyListingPrep project={project} />
      )}

      {/* Zoom Line Inspector Modal */}
      {inspectImage && (
        <ZoomModal imageUrl={inspectImage} onClose={() => setInspectImage(null)} />
      )}
    </div>
  );
}