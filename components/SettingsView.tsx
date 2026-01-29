
import React from 'react';
import { Save, Shield, Terminal, Bell, Database } from 'lucide-react';

const SettingsView: React.FC = () => {
  return (
    <div className="max-w-4xl space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-bold text-white tracking-tight">System Settings</h2>
        <p className="text-slate-400 mt-1">Configure discovery rules, notifications, and integration logic</p>
      </div>

      <div className="space-y-6">
        {/* Endpoint Discovery Section */}
        <section className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg">
              <Terminal size={20} />
            </div>
            <h3 className="text-lg font-bold text-white">Endpoint Discovery</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Normalization Regex</label>
              <input
                type="text"
                defaultValue="/[0-9a-fA-F-]{36}/"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-sm font-mono focus:border-blue-500 outline-none"
              />
              <p className="text-[10px] text-slate-500 mt-1">Paths matching this pattern will be grouped under a single endpoint entry.</p>
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-semibold text-white">Aggressive Discovery</p>
                <p className="text-xs text-slate-500">Extract endpoints from raw scenario log context if metadata is missing.</p>
              </div>
              <div className="w-12 h-6 bg-blue-600 rounded-full relative cursor-pointer">
                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Notifications Section */}
        <section className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-purple-500/10 text-purple-500 rounded-lg">
              <Bell size={20} />
            </div>
            <h3 className="text-lg font-bold text-white">Alerting & Notifications</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 border border-slate-800 rounded-xl bg-slate-800/20">
              <p className="text-sm font-bold text-white mb-1">Slack Integration</p>
              <p className="text-xs text-slate-500 mb-4">Notify on critical failure trends</p>
              <button className="text-xs font-bold text-blue-500 hover:underline">Configure Webhook</button>
            </div>
            <div className="p-4 border border-slate-800 rounded-xl bg-slate-800/20">
              <p className="text-sm font-bold text-white mb-1">Email Reports</p>
              <p className="text-xs text-slate-500 mb-4">Daily summary of new endpoints</p>
              <button className="text-xs font-bold text-blue-500 hover:underline">Manage Subscribers</button>
            </div>
          </div>
        </section>

        <div className="flex justify-end pt-4">
          <button className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20">
            <Save size={18} />
            <span>Save Configuration</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
