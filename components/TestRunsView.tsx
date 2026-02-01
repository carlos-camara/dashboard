
import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { ExecutionRun } from '../types';
import { Folder, Trash2, Calendar, ChevronRight, Package, ChevronDown, Activity, History, Tag, Search, ChevronLeft, TrendingUp } from 'lucide-react';
import RunDetailView from './RunDetailView';
import Pagination from './Pagination';

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
  initialProject?: string | null;
  onNavigate?: (tab: string, state?: any) => void;
}

const TestRunsView: React.FC<TestRunsViewProps> = ({ refreshKey, initialProject, onNavigate }) => {
  const [runs, setRuns] = useState<ExecutionRun[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState(initialProject || '');

  useEffect(() => {
    if (initialProject) {
      setSearchQuery(initialProject);
    }
  }, [initialProject]);
  const RUNS_PER_PAGE = 5;

  const fetchRuns = async () => {
    setLoading(true);
    const data = await api.getRecentRuns();
    setRuns(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchRuns();
  }, [refreshKey]);

  // 1. Define projectsList FIRST so it's available for rendering
  const projectsList: ProjectGroup[] = Object.values(
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



  if (loading && runs.length === 0) return <div className="animate-pulse space-y-4 pt-10"><div className="h-40 bg-slate-900 rounded-2xl w-full"></div></div>;

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <div className="h-1 w-8 bg-blue-500 rounded-full"></div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400">Project Registry</span>
          </div>
          <h2 className="text-4xl font-black text-white tracking-tighter">Execution Archives</h2>
          <p className="text-slate-400 mt-2 text-sm max-w-lg leading-relaxed">
            Centralized repository of all test flights, grouped by project identifier.
            Monitor health trends and access granular execution logs.
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="px-5 py-3 bg-slate-900/80 border border-slate-800 rounded-2xl flex items-center shadow-xl">
            <div className="mr-4">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Active Projects</p>
              <p className="text-2xl font-black text-white leading-none mt-1">{projectsList.length}</p>
            </div>
            <div className="h-10 w-10 bg-blue-600/10 rounded-xl flex items-center justify-center border border-blue-600/20">
              <Package size={20} className="text-blue-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 via-indigo-500/20 to-violet-500/20 rounded-2xl opacity-70 group-hover:opacity-100 transition duration-500 blur-sm"></div>
        <div className="relative flex items-center bg-slate-950/90 backdrop-blur-xl rounded-2xl border border-slate-800/80 px-4 py-4 shadow-2xl">
          <Search className="text-slate-500 ml-2" size={20} />
          <input
            type="text"
            placeholder="Search by project identifier, run ID, or tags..."
            className="w-full bg-transparent border-none text-slate-200 placeholder-slate-600 focus:ring-0 text-sm font-medium px-4 h-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="text-[10px] uppercase font-bold text-slate-600 tracking-widest border border-slate-800 rounded px-2 py-1">
            CMD + K
          </div>
        </div>
      </div>

      {projectsList.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 rounded-[3rem] border-2 border-dashed border-slate-800/50 bg-slate-900/20">
          <div className="w-24 h-24 bg-slate-800/30 rounded-full flex items-center justify-center mb-6">
            <Folder size={40} className="text-slate-600 opacity-50" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Repository Empty</h3>
          <p className="text-slate-500 max-w-xs text-center text-sm">No execution data found. Use <span className="text-blue-400 font-mono">Run Tests</span> to generate reports.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {projectsList.map((group) => (
            <div
              key={group.projectName}
              onClick={() => onNavigate && onNavigate('project-report', { project: group.projectName, runs: group.runs })}
              className="relative overflow-hidden rounded-3xl border border-slate-800/60 bg-slate-900/40 hover:bg-slate-900/60 hover:border-blue-500/30 hover:shadow-[0_0_50px_-12px_rgba(59,130,246,0.1)] transition-all duration-300 cursor-pointer group"
            >
              <div
                className="p-6 sm:p-8 relative z-10"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                  {/* Project Info */}
                  <div className="flex items-start space-x-6">
                    <div className={`
                        w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg transition-transform duration-500 group-hover:scale-110
                        ${group.avgPassRate >= 90 ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-500' :
                        group.avgPassRate >= 70 ? 'bg-amber-500/10 border border-amber-500/20 text-amber-500' :
                          'bg-rose-500/10 border border-rose-500/20 text-rose-500'}
                     `}>
                      <Activity size={32} />
                    </div>
                    <div>
                      <div className="flex items-center space-x-3 mb-1">
                        <h3 className="text-2xl font-black text-white tracking-tight">{group.projectName}</h3>
                        {group.avgPassRate >= 90 && (
                          <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 tracking-wider">
                            Stable
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                        <span className="flex items-center hover:text-slate-300 transition-colors">
                          <History size={14} className="mr-1.5 text-slate-600" />
                          <span className="font-bold text-slate-400 mr-1">{group.runs.length}</span> Flights
                        </span>
                        <span className="flex items-center hover:text-slate-300 transition-colors">
                          <Calendar size={14} className="mr-1.5 text-slate-600" />
                          Last: <span className="font-mono text-slate-400 ml-1">{new Date(group.lastActivity).toLocaleDateString()}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Stats & Actions */}
                  <div className="flex items-center space-x-8">
                    <div className="flex flex-col items-end min-w-[120px]">
                      <div className="flex items-baseline space-x-1 mb-2">
                        <span className={`text-3xl font-black tracking-tighter ${group.avgPassRate >= 90 ? 'text-white' :
                          group.avgPassRate >= 70 ? 'text-amber-500' : 'text-rose-500'
                          }`}>
                          {group.avgPassRate.toFixed(0)}%
                        </span>
                        <span className="text-[10px] font-bold text-slate-600 uppercase">Pass Rate</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${group.avgPassRate >= 90 ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' :
                            group.avgPassRate >= 70 ? 'bg-amber-500' : 'bg-rose-500'
                            }`}
                          style={{ width: `${group.avgPassRate}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="h-10 w-[1px] bg-slate-800 hidden sm:block"></div>

                    <div className="flex items-center space-x-2">

                      <div className={`p-3 rounded-full border border-slate-700/50 bg-slate-800/30 text-slate-400 transition-all duration-300 group-hover:bg-blue-600 group-hover:border-blue-500 group-hover:text-white`}>
                        <ChevronRight size={20} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>


            </div>
          ))}
        </div>
      )}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(15, 23, 42, 0.5); }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(51, 65, 85, 0.5); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(71, 85, 105, 0.8); }
      `}</style>
    </div>
  );
};

export default TestRunsView;
