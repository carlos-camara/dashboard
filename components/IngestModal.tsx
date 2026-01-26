
import React, { useState, useRef } from 'react';
import { Upload, X, CheckCircle, FileCode, Search, FolderPlus, FileText, AlertCircle, Loader2, Sparkles } from 'lucide-react';
import { api } from '../services/api';

interface IngestModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const IngestModal: React.FC<IngestModalProps> = ({ onClose, onSuccess }) => {
  const [step, setStep] = useState<'idle' | 'uploading' | 'discovering' | 'complete' | 'duplicate'>('idle');
  const [files, setFiles] = useState<File[]>([]);
  const [results, setResults] = useState<{ projectName: string, endpointsFound: number, scenariosFound: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files).filter((f: File) => f.name.endsWith('.xml'));
      setFiles(prev => [...prev, ...selectedFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const startIngestion = async () => {
    if (files.length === 0) return;

    setStep('uploading');
    await new Promise(r => setTimeout(r, 600));
    setStep('discovering');
    
    try {
      const res = await api.processFiles(files);
      if (res.isDuplicate) {
        setStep('duplicate');
      } else {
        setResults({ 
          projectName: res.projectName, 
          endpointsFound: res.endpointsFound, 
          scenariosFound: res.scenariosFound 
        });
        setStep('complete');
      }
    } catch (error) {
      console.error(error);
      setStep('idle');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 backdrop-blur-sm bg-slate-950/60 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors">
          <X size={20} />
        </button>

        <div className="p-8">
          {step === 'idle' && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-600/10 text-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Upload size={32} />
                </div>
                <h3 className="text-xl font-bold text-white">Ingest XML Reports</h3>
                <p className="text-slate-500 text-sm mt-1">Project name and tags will be auto-detected from XML</p>
              </div>

              <div className="space-y-4">
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-800 rounded-2xl p-10 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all cursor-pointer text-center group"
                >
                  <FileCode size={48} className="mx-auto text-slate-700 group-hover:text-blue-500/50 mb-4 transition-colors" />
                  <p className="text-sm font-medium text-slate-400">Drop JUnit XML files or click to browse</p>
                  <input type="file" multiple accept=".xml" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
                </div>

                {files.length > 0 && (
                  <div className="max-h-40 overflow-y-auto space-y-2 pr-2">
                    {files.map((file, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-slate-800/50 p-3 rounded-xl border border-slate-700">
                        <div className="flex items-center space-x-3">
                          <FileText size={14} className="text-slate-500" />
                          <span className="text-xs text-slate-300 truncate max-w-[300px]">{file.name}</span>
                        </div>
                        <X size={14} className="text-slate-500 hover:text-rose-500 cursor-pointer transition-colors" onClick={(e) => { e.stopPropagation(); removeFile(idx); }} />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button 
                disabled={files.length === 0}
                onClick={startIngestion}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white py-4 rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center space-x-2"
              >
                <span>Process & Discover</span>
              </button>
            </div>
          )}

          {(step === 'uploading' || step === 'discovering') && (
            <div className="py-20 text-center space-y-6">
              <div className="relative w-20 h-20 mx-auto">
                <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-t-blue-500 rounded-full animate-spin"></div>
                <Sparkles className="absolute inset-0 m-auto text-blue-500 animate-pulse" size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white tracking-tight">Auto-detecting Project...</h3>
                <p className="text-slate-500 text-sm mt-2">Analyzing classnames and internal timestamps</p>
              </div>
            </div>
          )}

          {step === 'duplicate' && (
            <div className="text-center space-y-6 py-8 animate-in zoom-in-95">
              <div className="w-16 h-16 bg-amber-500/10 text-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-amber-500/20">
                <AlertCircle size={32} />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white tracking-tight">Duplicate Found</h3>
                <p className="text-slate-500 text-sm mt-3 px-10 leading-relaxed">This execution (Project + Timestamp) is already in the system. Submitting it again would pollute your trends.</p>
              </div>
              <button onClick={onClose} className="w-full bg-slate-800 hover:bg-slate-700 text-white py-4 rounded-xl font-bold transition-all">Back to Dashboard</button>
            </div>
          )}

          {step === 'complete' && results && (
            <div className="text-center space-y-8 animate-in zoom-in-95">
              <div className="w-16 h-16 bg-green-500/10 text-green-500 rounded-2xl flex items-center justify-center mx-auto border border-green-500/20">
                <CheckCircle size={32} />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white tracking-tight">Discovery Complete</h3>
                <div className="mt-2 text-blue-400 font-mono text-xs uppercase font-bold tracking-widest">Project: {results.projectName}</div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-800/50 p-5 rounded-2xl border border-slate-700/50">
                  <div className="text-3xl font-black text-blue-400">{results.endpointsFound}</div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase mt-1 tracking-widest">API Endpoints</div>
                </div>
                <div className="bg-slate-800/50 p-5 rounded-2xl border border-slate-700/50">
                  <div className="text-3xl font-black text-white">{results.scenariosFound}</div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase mt-1 tracking-widest">Total Scenarios</div>
                </div>
              </div>
              <button onClick={onSuccess} className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20">View New Reports</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IngestModal;
