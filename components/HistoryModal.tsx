import React from 'react';
import { HistoryItem } from '../types';
import { X, Clock, Trash2, ArrowRight } from 'lucide-react';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
  onClear: () => void;
}

const HistoryModal: React.FC<HistoryModalProps> = ({ isOpen, onClose, history, onSelect, onClear }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      <div className="relative bg-[#0f172a] border border-slate-700 w-full max-w-2xl max-h-[80vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-700/50 flex items-center justify-between bg-slate-800/30">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400">
              <Clock size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">Generation History</h2>
              <p className="text-xs text-slate-500">Your last {history.length} rewrites are stored locally.</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {history.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Clock size={48} className="mx-auto mb-4 opacity-20" />
              <p>No history yet. Start humanizing text!</p>
            </div>
          ) : (
            history.map((item) => (
              <div 
                key={item.id}
                onClick={() => { onSelect(item); onClose(); }}
                className="group border border-slate-800 bg-slate-800/20 hover:bg-slate-800/50 hover:border-indigo-500/30 rounded-xl p-4 cursor-pointer transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-700 text-slate-300">
                      {item.tone}
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-700 text-slate-300">
                      {item.strength}
                    </span>
                  </div>
                  <span className="text-xs text-slate-500 font-mono">
                    {new Date(item.timestamp).toLocaleTimeString()} • {new Date(item.timestamp).toLocaleDateString()}
                  </span>
                </div>
                
                <div className="flex gap-4 items-center">
                  <p className="flex-1 text-sm text-slate-400 line-clamp-2 font-serif opacity-70">
                    {item.original}
                  </p>
                  <ArrowRight size={16} className="text-slate-600 group-hover:text-indigo-400 transition-colors" />
                  <p className="flex-1 text-sm text-slate-200 line-clamp-2 font-serif">
                    {item.humanized}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {history.length > 0 && (
          <div className="p-4 border-t border-slate-700/50 bg-slate-800/30 flex justify-end">
            <button 
              onClick={onClear}
              className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
            >
              <Trash2 size={14} /> Clear History
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryModal;