
import React, { useState } from 'react';
import { LayoutDashboard, FolderKanban, TrendingUp, Plus, Search, ChevronRight, Cpu, Menu, X, ShieldAlert } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onNewRun: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab, onNewRun }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'runs', icon: FolderKanban, label: 'Test Runs' },
    { id: 'incidents', icon: ShieldAlert, label: 'Incident Taxonomy' },
    { id: 'endpoints', icon: TrendingUp, label: 'Endpoints' },
  ];

  const handleTabClick = (id: string) => {
    setActiveTab(id);
    setIsSidebarOpen(false); // Close sidebar on mobile when item clicked
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950 text-slate-200 relative selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Global Dynamic Background */}
      <div className="fixed inset-0 bg-slate-950 pointer-events-none z-0"></div>
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.15),transparent_50%)] pointer-events-none z-0"></div>
      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.02] pointer-events-none mix-blend-overlay z-0"></div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 border-r border-slate-800 bg-slate-900/95 backdrop-blur-xl flex flex-col no-print
        transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:bg-slate-900/50
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20">
              Q
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white">QA Hub</h1>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Execution Engine</p>
            </div>
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden text-slate-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
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
        <header className="h-16 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md flex items-center justify-between px-4 md:px-8 sticky top-0 z-20 no-print">
          <div className="flex items-center">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="mr-4 lg:hidden text-slate-400 hover:text-white transition-colors p-1"
            >
              <Menu size={24} />
            </button>
          </div>
          <div className="flex items-center space-x-4 md:space-x-6">
            <div className="flex items-center space-x-2 bg-slate-800/50 px-3 py-1.5 rounded-full border border-slate-700">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hidden sm:inline">System Active</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest sm:hidden">Active</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center overflow-hidden">
              <Cpu size={20} className="text-blue-500" />
            </div>
          </div>
        </header>

        <div className="p-4 md:p-8 pb-12 max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
