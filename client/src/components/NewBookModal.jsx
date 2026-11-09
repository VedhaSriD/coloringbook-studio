import React, { useState } from 'react';
import { X, Sparkles, BookOpen } from 'lucide-react';
import { createDefaultPages } from '../defaultConcepts';

export default function NewBookModal({ isOpen, onClose, onCreated }) {
  const [title, setTitle] = useState("My Little Animal World – A Cute Animals Coloring Book");
  const [theme, setTheme] = useState("Cute Animals and Nature");
  const [targetAge, setTargetAge] = useState("4–8 years");
  const [pageCount, setPageCount] = useState(30);
  const [paperSize, setPaperSize] = useState("US Letter, 8.5 × 11 inches");
  const [style, setStyle] = useState("Pure black outlines, pure white background, thick lines, no grayscale");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const projectId = title.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').slice(0, 30) + '-' + Date.now();
    const pages = createDefaultPages();

    const payload = {
      id: projectId,
      title,
      theme,
      targetAge,
      pageCount: parseInt(pageCount, 10),
      paperSize,
      style,
      pages,
      cover: {
        title,
        subtitle: `A Fun Printable Coloring Experience For Kids Ages ${targetAge}`,
        author: 'ColoringBook Studio',
        coverImage: null,
        bgColor: '#fef3c7',
        textColor: '#1f2937'
      }
    };

    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      onCreated(data);
    } catch (err) {
      alert('Error creating project: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-slate-900 text-lg">Create New Coloring Book</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Book Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Theme</label>
              <input
                type="text"
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Target Age Group</label>
              <input
                type="text"
                value={targetAge}
                onChange={(e) => setTargetAge(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Number of Pages</label>
              <input
                type="number"
                min="1"
                max="100"
                value={pageCount}
                onChange={(e) => setPageCount(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Paper Size</label>
              <select
                value={paperSize}
                onChange={(e) => setPaperSize(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="US Letter, 8.5 × 11 inches">US Letter (8.5 × 11 in)</option>
                <option value="A4 (8.27 × 11.69 inches)">A4 (8.27 × 11.69 in)</option>
              </select>
            </div>
          </div>

          <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3 text-xs text-indigo-800 space-y-1">
            <div className="flex items-center space-x-1 font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Includes 30 Curated Page Concepts</span>
            </div>
            <p className="text-indigo-600 leading-relaxed">
              Preconfigured with all 30 unique, high-demand cute animal concepts (elephant, lion, giraffe, bear, penguin, dolphin, etc.).
            </p>
          </div>

          <div className="pt-2 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-sm font-semibold rounded-lg text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-sm shadow transition"
            >
              {loading ? 'Generating Structure...' : 'Create Book Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}