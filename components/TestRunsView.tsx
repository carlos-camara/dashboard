
import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { ExecutionRun } from '../types';
import { Folder, Trash2, Calendar, ChevronRight, Package, ChevronDown, Activity, History, Tag, Search } from 'lucide-react';
import RunDetailView from './RunDetailView';

interface ProjectGroup {
  projectName: string;
  runs: ExecutionRun[];
  lastActivity: string;
  totalScenarios: number;
  avgPassRate: number;
  allTags: Set<string>;
}

interface TestRunsViewProps {
  refreshKey?: number;
}

const TestRunsView: React.FC<TestRunsViewProps> = ({ refreshKey }) => {
  const [runs, setRuns] = useState<ExecutionRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());
  const [selectedRun, setSelectedRun] = useState<ExecutionRun | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchRuns = async () => {
    setLoading(true);
    const data = await api.getRecentRuns();
    setRuns(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchRuns();
  }, [refreshKey]);

  const toggleProject = (projectName: string) => {
    const next = new Set(expandedProjects);
    if (next.has(projectName)) next.delete(projectName);
    else next.add(projectName);
    setExpandedProjects(next);
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar este registro de ejecución?')) {
      await api.deleteRun(id);
      fetchRuns();
    }
  };

  const handleDeleteProject = async (name: string) => {
    if (confirm(`¿Estás seguro de que deseas eliminar el proyecto "${name}" y todas sus ejecuciones?`)) {
      await api.deleteProject(name);
      fetchRuns();
    }
  };

  if (selectedRun) {
    return <RunDetailView run={selectedRun} onBack={() => setSelectedRun(null)} />;
  }

  const projectGroups: ProjectGroup[] = Object.values(
    runs.reduce<Record<string, ProjectGroup>>((acc, run) => {
      const query = searchQuery.toLowerCase();

      // GRANULAR FILTERING: Apply filters per individual run
      const matchesSearch = !searchQuery ||
        run.name.toLowerCase().includes(query) ||
        run.project.toLowerCase().includes(query);

      if (matchesSearch) {
        if (!acc[run.project]) {
          acc[run.project] = {
            projectName: run.project,
            runs: [],
            lastActivity: run.timestamp,
            totalScenarios: 0,
            avgPassRate: 0,
            allTags: new Set<string>(),
          };
        }
        acc[run.project].runs.push(run);
        acc[run.project].totalScenarios += run.totalCount;
        if (run.tags) {
          run.tags.forEach(tag => acc[run.project].allTags.add(tag));
        }
        if (new Date(run.timestamp) > new Date(acc[run.project].lastActivity)) {
          acc[run.project].lastActivity = run.timestamp;
        }
      }
      return acc;
    }, {})
  ).map((group: ProjectGroup) => {
    const totalPassed = group.runs.reduce((sum, r) => sum + r.passedCount, 0);
    const totalAll = group.runs.reduce((sum, r) => sum + r.totalCount, 0);
    group.avgPassRate = totalAll > 0 ? (totalPassed / totalAll) * 100 : 0;
    group.runs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return group;
  });

  if (loading && runs.length === 0) return <div className="animate-pulse space-y-4 pt-10"><div className="h-40 bg-slate-900 rounded-2xl w-full"></div></div>;

  return (
    <div className="space-y-8 animate-in slide-in-from-left-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Proyectos y Ejecuciones</h2>
          <p className="text-slate-400 mt-1">Historial organizado por nombre de proyecto y sus versiones</p>
        </div>
        <div className="flex space-x-3">
          <div className="text-xs font-medium text-slate-500 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-full flex items-center">
            <Package size={14} className="mr-2 text-blue-500" />
            Proyectos Activos: <span className="text-white ml-1 font-bold">{projectGroups.length}</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col md:flex-row items-center gap-4 bg-slate-900/50 p-3 rounded-2xl border border-slate-800">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input
              type="text"
              placeholder="Search by project or run name..."
              className="w-full bg-slate-800/40 border-none rounded-xl pl-12 pr-4 py-3 text-sm focus:ring-2 focus:ring-blue-600 outline-none transition-all placeholder-slate-600"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {projectGroups.length === 0 ? (
        <div className="bg-slate-900/30 border-2 border-dashed border-slate-800 rounded-3xl p-20 text-center space-y-4">
          <Folder size={48} className="mx-auto text-slate-700" />
          <p className="text-slate-500 font-medium">No hay proyectos registrados.</p>
          <p className="text-xs text-slate-600">Utiliza "New Run" para subir tus archivos XML y crear un proyecto.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {projectGroups.map((group) => (
            <div key={group.projectName} className="bg-slate-900/40 border border-slate-800 rounded-3xl overflow-hidden transition-all border-l-4 border-l-blue-600">
              <div
                onClick={() => toggleProject(group.projectName)}
                className="p-6 cursor-pointer hover:bg-slate-800/30 transition-colors flex items-center justify-between"
              >
                <div className="flex items-center space-x-6">
                  <div className="w-12 h-12 bg-blue-600/10 rounded-2xl flex items-center justify-center text-blue-500">
                    <Package size={28} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">{group.projectName}</h3>
                    <div className="flex items-center space-x-4 text-xs text-slate-500">
                      <span className="flex items-center"><History size={12} className="mr-1" /> {group.runs.length} ejecuciones</span>
                      <span className="flex items-center"><Activity size={12} className="mr-1" /> Salud: {group.avgPassRate.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex flex-col items-end">
                    <div className="flex h-1.5 w-32 bg-slate-800 rounded-full overflow-hidden mb-2">
                      <div className="bg-green-500" style={{ width: `${group.avgPassRate}%` }}></div>
                      <div className="bg-rose-500" style={{ width: `${100 - group.avgPassRate}%` }}></div>
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Global Stats</span>
                  </div>
                  <div className={`transition-transform duration-300 ${expandedProjects.has(group.projectName) ? 'rotate-180' : ''}`}>
                    <ChevronDown size={20} className="text-slate-500" />
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDeleteProject(group.projectName); }}
                    className="p-2 text-slate-600 hover:text-rose-500 transition-colors bg-slate-800/50 rounded-lg ml-2"
                    title="Eliminar Proyecto"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              {expandedProjects.has(group.projectName) && (
                <div className="border-t border-slate-800 bg-slate-950/30 p-4 space-y-3 animate-in slide-in-from-top-2">
                  <div className="px-4 py-2 text-[10px] font-bold text-slate-600 uppercase tracking-widest border-b border-slate-800/50 mb-2">
                    Historial de Ejecuciones (Cronológico)
                  </div>
                  {group.runs.map((run) => (
                    <div
                      key={run.id}
                      onClick={() => setSelectedRun(run)}
                      className="flex items-center justify-between p-4 bg-slate-900/50 border border-slate-800/50 rounded-xl hover:bg-slate-800/50 transition-all group cursor-pointer"
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`w-2 h-2 rounded-full ${run.failedCount > 0 ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]' : 'bg-green-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'}`}></div>
                        <div>
                          <p className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">{run.name}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-[10px] text-slate-500 font-mono">{new Date(run.timestamp).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-6">
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[10px]">
                          <span className="text-slate-500">Escenarios:</span>
                          <span className="text-white font-bold text-right">{run.totalCount}</span>
                          <span className="text-slate-500">Fallas:</span>
                          <span className={`${run.failedCount > 0 ? 'text-rose-400' : 'text-slate-400'} font-bold text-right`}>{run.failedCount}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button className="p-2 text-slate-600 hover:text-blue-400 transition-colors">
                            <ChevronRight size={16} />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDelete(run.id); }}
                            className="p-2 text-slate-600 hover:text-rose-500 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TestRunsView;
