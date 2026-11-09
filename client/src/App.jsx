import React, { useState, useEffect } from 'react';
import { BookOpen, PlusCircle } from 'lucide-react';
import Dashboard from './components/Dashboard.jsx';
import NewBookModal from './components/NewBookModal.jsx';
import Studio from './components/Studio.jsx';

export default function App() {
  const [projects, setProjects] = useState([]);
  const [currentProjectId, setCurrentProjectId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/projects');
      if (res.ok) {
        const data = await res.json();
        setProjects(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.log('Backend not connected yet or loading projects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const activeProject = projects.find(p => p.id === currentProjectId);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      {/* Top Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div 
            onClick={() => setCurrentProjectId(null)} 
            className="flex items-center space-x-3 cursor-pointer select-none"
          >
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold shadow-md shadow-indigo-100">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 leading-none">ColoringBook Studio</h1>
              <span className="text-xs text-indigo-600 font-medium tracking-wide uppercase">Kids Printable Creator</span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {activeProject ? (
              <button
                onClick={() => setCurrentProjectId(null)}
                className="px-3.5 py-1.5 rounded-lg border border-slate-300 text-sm font-medium hover:bg-slate-50 text-slate-700 transition"
              >
                Back to Dashboard
              </button>
            ) : (
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-sm transition"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Create New Book</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Studio View */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activeProject ? (
          <Studio
            project={activeProject}
            onProjectUpdate={(updated) => {
              setProjects(projects.map(p => p.id === updated.id ? updated : p));
            }}
          />
        ) : (
          <Dashboard
            projects={projects}
            loading={loading}
            onSelectProject={(id) => setCurrentProjectId(id)}
            onCreateNew={() => setIsModalOpen(true)}
            onDeleteProject={async (id) => {
              if (confirm('Are you sure you want to delete this coloring book project?')) {
                await fetch(`/api/projects/${id}`, { method: 'DELETE' });
                setProjects(projects.filter(p => p.id !== id));
              }
            }}
          />
        )}
      </main>

      {/* New Project Modal */}
      {isModalOpen && (
        <NewBookModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onCreated={(newProj) => {
            setProjects([newProj, ...projects]);
            setCurrentProjectId(newProj.id);
            setIsModalOpen(false);
          }}
        />
      )}
    </div>
  );
}