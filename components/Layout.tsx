
import React from 'react';
import { LayoutDashboard, FolderKanban, TrendingUp, Plus, Search, ChevronRight, Cpu } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onNewRun: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab, onNewRun }) => {
  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'runs', icon: FolderKanban, label: 'Test Runs' },
    { id: 'endpoints', icon: TrendingUp, label: 'Endpoints' },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950 text-slate-200">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-800 bg-slate-900 flex flex-col no-print">
        <div className="p-6 flex items-center space-x-3 border-b border-slate-800">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20">
            Q
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white">QA Hub</h1>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Execution Engine</p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${activeTab === item.id
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
            >
              <item.icon size={18} />
              <span className="font-medium text-sm">{item.label}</span>
              {activeTab === item.id && <ChevronRight size={14} className="ml-auto opacity-50" />}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button
            onClick={onNewRun}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2.5 rounded-lg flex items-center justify-center space-x-2 transition-all font-medium text-sm shadow-lg shadow-blue-600/20"
          >
            <Plus size={18} />
            <span>New Run</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full relative overflow-y-auto">
        <header className="h-16 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-20 no-print">
          <div></div>
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2 bg-slate-800/50 px-3 py-1.5 rounded-full border border-slate-700">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">System Active</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center overflow-hidden">
              <Cpu size={20} className="text-blue-500" />
            </div>
          </div>
        </header>

        <div className="p-8 pb-12 max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
