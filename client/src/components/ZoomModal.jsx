import React, { useState } from 'react';
import { X, ZoomIn, ZoomOut, Check } from 'lucide-react';

export default function ZoomModal({ imageUrl, onClose }) {
  const [zoom, setZoom] = useState(1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="px-6 py-3 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <div>
            <h4 className="font-bold text-slate-800 text-sm">Line Art & Margin Quality Inspector</h4>
            <p className="text-xs text-slate-500">Inspect black line crispness and confirm absence of grayscale artifacts</p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setZoom(Math.max(0.5, zoom - 0.25))}
              className="p-1.5 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-slate-700 w-12 text-center">{Math.round(zoom * 100)}%</span>
            <button
              onClick={() => setZoom(Math.min(3, zoom + 0.25))}
              className="p-1.5 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 ml-4">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Viewport */}
        <div className="flex-1 overflow-auto bg-slate-100 flex items-center justify-center p-6">
          <div
            className="transition-transform duration-200 origin-center bg-white p-4 shadow-xl border border-slate-300"
            style={{ transform: `scale(${zoom})` }}
          >
            <img
              src={imageUrl}
              alt="Quality Zoom"
              className="max-h-[65vh] object-contain select-none pointer-events-none"
            />
          </div>
        </div>

        {/* Footer Audit Checklist */}
        <div className="px-6 py-3 bg-white border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1 text-emerald-700">
              <Check className="w-4 h-4" /> <span>Solid Black Lines</span>
            </span>
            <span className="flex items-center space-x-1 text-emerald-700">
              <Check className="w-4 h-4" /> <span>Pure White Canvas</span>
            </span>
            <span className="flex items-center space-x-1 text-emerald-700">
              <Check className="w-4 h-4" /> <span>No Halftone Gradients</span>
            </span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 text-white rounded-lg font-medium hover:bg-slate-900"
          >
            Done Inspecting
          </button>
        </div>
      </div>
    </div>
  );
}