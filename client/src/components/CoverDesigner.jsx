import React, { useState } from 'react';
import { Palette, Upload, Check } from 'lucide-react';

export default function CoverDesigner({ project, onSave }) {
  const [title, setTitle] = useState(project.cover?.title || project.title);
  const [subtitle, setSubtitle] = useState(project.cover?.subtitle || 'A Cute Animals Coloring Book for Kids Ages 4-8');
  const [author, setAuthor] = useState(project.cover?.author || 'ColoringBook Studio');
  const [coverImage, setCoverImage] = useState(project.cover?.coverImage || null);
  const [bgColor, setBgColor] = useState(project.cover?.bgColor || '#fef08a');
  const [savedMessage, setSavedMessage] = useState(false);

  const handleUploadCover = async (file) => {
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);
    formData.append('projectId', project.id);
    formData.append('subfolder', 'cover');

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.url) setCoverImage(data.url);
    } catch (err) {
      alert('Cover upload failed: ' + err.message);
    }
  };

  const handleSave = () => {
    onSave({
      title,
      subtitle,
      author,
      coverImage,
      bgColor
    });
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 2500);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
      {/* Controls */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-900 text-base flex items-center space-x-2">
          <Palette className="w-5 h-5 text-indigo-600" />
          <span>Cover Page Customizer</span>
        </h3>
        <p className="text-xs text-slate-500">
          The cover is full-color to make your printable package pop on Etsy, while all inside pages remain black & white.
        </p>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Book Title on Cover</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Subtitle</label>
          <input
            type="text"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Author / Brand Name</label>
          <input
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Cover Artwork Image</label>
          <div className="flex gap-2">
            <label className="flex-1 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 text-xs font-semibold py-2 px-3 rounded-lg flex items-center justify-center space-x-2 cursor-pointer transition">
              <Upload className="w-4 h-4" />
              <span>{coverImage ? 'Replace Cover Image' : 'Upload Cover Image'}</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleUploadCover(e.target.files[0])}
              />
            </label>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-lg text-sm shadow transition flex items-center justify-center space-x-2"
        >
          {savedMessage ? <Check className="w-4 h-4 text-emerald-300" /> : null}
          <span>{savedMessage ? 'Cover Saved!' : 'Save Cover Changes'}</span>
        </button>
      </div>

      {/* Live Cover Preview */}
      <div className="flex flex-col items-center">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Live 8.5" × 11" Cover Preview</span>
        <div 
          className="w-full max-w-sm aspect-[8.5/11] rounded-2xl shadow-2xl border-4 border-white p-6 flex flex-col justify-between overflow-hidden transition-all duration-300"
          style={{ backgroundColor: '#fffbeb' }}
        >
          <div className="text-center space-y-2 mt-4">
            <h1 className="text-2xl font-black text-slate-900 leading-tight tracking-tight drop-shadow-sm font-sans">
              {title || 'My Coloring Book'}
            </h1>
            <p className="text-xs font-semibold text-amber-900/80 uppercase tracking-wider">
              {subtitle}
            </p>
          </div>

          <div className="flex-1 flex items-center justify-center p-4">
            {coverImage ? (
              <img
                src={coverImage}
                alt="Cover Preview"
                className="max-h-64 max-w-full object-contain rounded-xl shadow-lg border border-amber-200/50"
              />
            ) : (
              <div className="w-full h-52 border-2 border-dashed border-amber-300 rounded-xl flex flex-col items-center justify-center text-amber-800/60 p-4 text-center">
                <Palette className="w-8 h-8 mb-2 opacity-50" />
                <span className="text-xs font-medium">Upload colorful cover character artwork</span>
              </div>
            )}
          </div>

          <div className="text-center border-t border-amber-200/60 pt-3">
            <p className="text-xs font-bold text-slate-700 tracking-wide uppercase">
              {author || 'ColoringBook Studio'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}