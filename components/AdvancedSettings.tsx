import React, { useState } from 'react';
import { Purpose, Readability } from '../types';
import { Settings2, ChevronDown, ChevronUp } from 'lucide-react';

interface AdvancedSettingsProps {
  purpose: Purpose;
  readability: Readability;
  setPurpose: (p: Purpose) => void;
  setReadability: (r: Readability) => void;
}

const AdvancedSettings: React.FC<AdvancedSettingsProps> = ({ 
  purpose, 
  readability, 
  setPurpose, 
  setReadability 
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-slate-800/30 rounded-xl border border-slate-700/50 overflow-hidden">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 text-slate-300 hover:text-white hover:bg-slate-800/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Settings2 size={16} className="text-primary" />
          <span className="text-sm font-semibold">Preferences</span>
        </div>
        {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {isOpen && (
        <div className="p-4 pt-0 space-y-4 animate-in slide-in-from-top-2 duration-200">
          {/* Purpose Selection */}
          <div className="space-y-2">
            <label className="text-xs text-slate-500 uppercase font-semibold tracking-wider">Content Type</label>
            <div className="grid grid-cols-2 gap-2">
              {Object.values(Purpose).map((p) => (
                <button
                  key={p}
                  onClick={() => setPurpose(p)}
                  className={`
                    px-3 py-2 rounded-lg text-xs font-medium text-left transition-all border
                    ${purpose === p 
                      ? 'bg-primary/20 border-primary/50 text-white' 
                      : 'bg-surface border-transparent text-slate-400 hover:bg-surface-light hover:border-slate-600'
                    }
                  `}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Readability Selection */}
          <div className="space-y-2 pt-2 border-t border-slate-700/50">
            <label className="text-xs text-slate-500 uppercase font-semibold tracking-wider">Readability Level</label>
            <select 
              value={readability}
              onChange={(e) => setReadability(e.target.value as Readability)}
              className="w-full bg-surface border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-primary transition-colors cursor-pointer"
            >
              {Object.values(Readability).map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedSettings;