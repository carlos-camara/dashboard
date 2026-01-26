
import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Defect } from '../types';
import { AlertTriangle, Clock, MapPin, ChevronRight, MessageSquare } from 'lucide-react';

// Added refreshKey prop to handle state updates from ingestion
interface DefectsViewProps {
  refreshKey?: number;
}

const DefectsView: React.FC<DefectsViewProps> = ({ refreshKey }) => {
  const [defects, setDefects] = useState<Defect[]>([]);

  useEffect(() => {
    api.getDefects().then(setDefects);
  }, [refreshKey]);

  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
      <div>
        <h2 className="text-3xl font-bold text-white tracking-tight">Active Defects</h2>
        <p className="text-slate-400 mt-1">Aggregated failures and recurring execution issues</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {defects.map((defect) => (
          <div key={defect.id} className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden hover:border-rose-500/30 transition-all group">
            <div className="flex p-6">
              <div className={`mt-1 mr-4 p-2 rounded-lg ${
                defect.status === 'Open' ? 'bg-rose-500/10 text-rose-500' :
                defect.status === 'Investigating' ? 'bg-orange-500/10 text-orange-500' :
                'bg-green-500/10 text-green-500'
              }`}>
                <AlertTriangle size={20} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <span className="text-xs font-mono font-bold text-slate-500">{defect.id}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border ${
                      defect.status === 'Open' ? 'border-rose-500/20 text-rose-400' :
                      defect.status === 'Investigating' ? 'border-orange-500/20 text-orange-400' :
                      'border-green-500/20 text-green-400'
                    }`}>
                      {defect.status}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 flex items-center">
                    <Clock size={12} className="mr-1" />
                    Last seen {new Date(defect.lastSeen).toLocaleString()}
                  </div>
                </div>
                <h3 className="text-lg font-bold text-white group-hover:text-rose-400 transition-colors mb-4">{defect.errorMessage}</h3>
                
                <div className="grid grid-cols-3 gap-6 pt-4 border-t border-slate-800">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Affected Endpoint</span>
                    <div className="flex items-center text-sm font-mono text-slate-300">
                      <MapPin size={12} className="mr-2 text-blue-500" />
                      {defect.affectedEndpoint}
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Frequency</span>
                    <div className="text-sm font-bold text-white">{defect.occurrences} runs impacted</div>
                  </div>
                  <div className="flex justify-end items-center">
                    <button className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all">
                      <MessageSquare size={14} />
                      <span>Assign Triage</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DefectsView;
