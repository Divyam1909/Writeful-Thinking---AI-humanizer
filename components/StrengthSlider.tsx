import React from 'react';
import { Strength } from '../types';
import { Gauge } from 'lucide-react';

interface StrengthSliderProps {
  strength: Strength;
  onChange: (strength: Strength) => void;
}

const StrengthSlider: React.FC<StrengthSliderProps> = ({ strength, onChange }) => {
  const levels = [Strength.LOW, Strength.MEDIUM, Strength.HIGH, Strength.MAXIMUM];
  const currentIndex = levels.indexOf(strength);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const index = parseInt(e.target.value);
    onChange(levels[index]);
  };

  const getMetadata = (s: Strength) => {
    switch (s) {
      case Strength.LOW: return { label: "Low", desc: "Minor Tweaks", color: "text-green-400" };
      case Strength.MEDIUM: return { label: "Medium", desc: "Balanced Rewrite", color: "text-yellow-400" };
      case Strength.HIGH: return { label: "High", desc: "Structural Changes", color: "text-orange-400" };
      case Strength.MAXIMUM: return { label: "Max", desc: "Aggressive (Anti-AI)", color: "text-red-400" };
      default: return { label: "", desc: "", color: "" };
    }
  };

  const meta = getMetadata(strength);

  return (
    <div className="space-y-4 font-sans">
      <style>{`
        /* Custom Range Slider Styling */
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #6366f1;
          cursor: pointer;
          margin-top: -6px;
          box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.2);
          transition: all 0.2s;
        }
        input[type=range]::-webkit-slider-thumb:hover {
          transform: scale(1.1);
          box-shadow: 0 0 0 6px rgba(99, 102, 241, 0.3);
        }
        input[type=range]::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #6366f1;
          cursor: pointer;
          border: none;
          box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.2);
          transition: all 0.2s;
        }
        input[type=range]::-moz-range-thumb:hover {
          transform: scale(1.1);
          box-shadow: 0 0 0 6px rgba(99, 102, 241, 0.3);
        }
        input[type=range]::-webkit-slider-runnable-track {
          width: 100%;
          height: 8px;
          cursor: pointer;
          background: #020617;
          border-radius: 8px;
        }
        input[type=range]::-moz-range-track {
          width: 100%;
          height: 8px;
          cursor: pointer;
          background: #020617;
          border-radius: 8px;
        }
      `}</style>

      <div className="flex items-center justify-between mb-2">
        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
          <Gauge size={14} /> Humanization Intensity
        </label>
        <div className="text-right">
          <span className={`text-sm font-bold block ${meta.color}`}>{meta.label}</span>
        </div>
      </div>
      
      <div className="relative h-10 flex items-center">
        {/* Track Markers (Background) */}
        <div className="absolute inset-0 flex justify-between items-center px-1 pointer-events-none z-0">
           {levels.map((lvl, idx) => (
             <div 
               key={lvl} 
               className={`w-2 h-2 rounded-full transition-colors duration-300 z-0 ${idx <= currentIndex ? 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]' : 'bg-slate-700'}`} 
             />
           ))}
        </div>

        <input
          type="range"
          min="0"
          max="3"
          step="1"
          value={currentIndex}
          onChange={handleChange}
          className="w-full h-2 bg-transparent appearance-none cursor-pointer relative z-10 focus:outline-none"
        />
      </div>
      
      <p className="text-xs text-slate-500 text-center font-medium italic transition-all duration-300 h-4">
        "{meta.desc}"
      </p>
    </div>
  );
};

export default StrengthSlider;