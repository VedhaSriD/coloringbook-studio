import React from 'react';
import { PlusCircle, Book, Calendar, Layers, ArrowRight, Trash2 } from 'lucide-react';

export default function Dashboard({ projects, loading, onSelectProject, onCreateNew, onDeleteProject }) {
  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-900 to-indigo-700 rounded-2xl p-8 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight">Create & Sell Coloring Books on Etsy</h2>
          <p className="mt-2 text-indigo-100 max-w-xl text-sm leading-relaxed">
            Generate high-resolution printable 8.5" x 11" black-and-white coloring pages, design colorful covers, inspect quality, and generate print-ready digital downloads.
          </p>
        </div>
        <button
          onClick={onCreateNew}
          className="bg-white text-indigo-800 font-bold px-5 py-3 rounded-xl shadow-lg hover:bg-indigo-50 transition flex items-center space-x-2 shrink-0"
        >
          <PlusCircle className="w-5 h-5 text-indigo-600" />
          <span>New Coloring Book</span>
        </button>
      </div>

      {/* Projects List Section */}
      <div>
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-lg font-bold text-slate-900">My Coloring Book Projects</h3>
          <span className="text-sm text-slate-500">{projects.length} Books created</span>
        </div>

        {loading ? (
          <div className="text-center py-20 text-slate-400">Loading your books...</div>
        ) : projects.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-slate-300 rounded-2xl p-12 text-center">
            <Book className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h4 className="text-base font-semibold text-slate-700">No Coloring Books Yet</h4>
            <p className="text-sm text-slate-500 mt-1 mb-6">Create your first 30-page animal coloring book with 1 click.</p>
            <button
              onClick={onCreateNew}
              className="bg-indigo-600 text-white font-medium px-4 py-2 rounded-lg text-sm hover:bg-indigo-700 transition"
            >
              Start Default 30-Page Project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((proj) => {
              const completedCount = proj.pages.filter(p => !!p.imageUrl).length;
              const progressPct = Math.round((completedCount / proj.pageCount) * 100);

              return (
                <div
                  key={proj.id}
                  className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between"
                >
                  <div className="p-5">
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="font-bold text-slate-900 text-lg leading-snug line-clamp-1">{proj.title}</h4>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteProject(proj.id);
                        }}
                        className="text-slate-400 hover:text-red-500 p-1"
                        title="Delete project"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <p className="text-xs text-indigo-600 font-semibold mt-1">{proj.theme}</p>

                    <div className="mt-4 space-y-2 text-xs text-slate-500">
                      <div className="flex items-center space-x-2">
                        <Layers className="w-4 h-4 text-slate-400" />
                        <span>{proj.pageCount} Pages • {proj.targetAge}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span>Created {new Date(proj.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-5">
                      <div className="flex justify-between text-xs font-medium text-slate-600 mb-1">
                        <span>Illustrations Ready</span>
                        <span>{completedCount} / {proj.pageCount} ({progressPct}%)</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div
                          className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      {proj.paperSize.split('(')[0]}
                    </span>
                    <button
                      onClick={() => onSelectProject(proj.id)}
                      className="text-indigo-600 hover:text-indigo-800 text-sm font-semibold flex items-center space-x-1"
                    >
                      <span>Open Studio</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}