import React from 'react';
import { X, Info, Zap, ShieldCheck, Gauge, Heart } from 'lucide-react';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const InfoModal: React.FC<InfoModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      <div className="relative bg-[#0f172a] border border-slate-700 w-full max-w-2xl max-h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-700/50 flex items-center justify-between bg-slate-800/30">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400">
              <Info size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">How to use Writeful Thinking</h2>
              <p className="text-xs text-slate-500">Master the art of undetectable writing.</p>
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
        <div className="flex-1 overflow-y-auto p-6 space-y-8 text-slate-300">
          
          <section>
            <h3 className="flex items-center gap-2 text-white font-semibold mb-3">
              <span className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-xs">1</span>
              Input & Tone
            </h3>
            <p className="text-sm leading-relaxed text-slate-400 ml-8">
              Paste your AI-generated text (from ChatGPT, Claude, etc.) into the left panel. Select a 
              <span className="text-indigo-400 font-medium"> Tone</span> that matches your target audience. "Casual" works best for blogs, while "Academic" retains complexity.
            </p>
          </section>

          <section>
            <h3 className="flex items-center gap-2 text-white font-semibold mb-3">
              <span className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-xs">2</span>
              Strength & Bypassing Detection
            </h3>
            <div className="ml-8 space-y-3">
              <p className="text-sm leading-relaxed text-slate-400">
                The <span className="text-indigo-400 font-medium">Strength Slider</span> controls the rewrite intensity:
              </p>
              <ul className="grid gap-3 grid-cols-1 sm:grid-cols-2">
                <li className="bg-slate-800/40 p-3 rounded-lg border border-slate-700/50">
                  <div className="flex items-center gap-2 mb-1 text-green-400 font-bold text-xs uppercase tracking-wide">
                    <Gauge size={12} /> Low / Medium
                  </div>
                  <p className="text-xs text-slate-500">Good for polishing grammar without changing the meaning too much.</p>
                </li>
                <li className="bg-slate-800/40 p-3 rounded-lg border border-red-900/30">
                  <div className="flex items-center gap-2 mb-1 text-red-400 font-bold text-xs uppercase tracking-wide">
                    <Zap size={12} /> Maximum (Nuclear)
                  </div>
                  <p className="text-xs text-slate-500">Uses a dual-pass "Entropy" engine. It intentionally adds circular logic and "human flaws" to bypass AI detectors.</p>
                </li>
              </ul>
            </div>
          </section>

          <section>
            <h3 className="flex items-center gap-2 text-white font-semibold mb-3">
              <span className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-xs">3</span>
              Analysis & Export
            </h3>
            <p className="text-sm leading-relaxed text-slate-400 ml-8">
              Once generated, use the <span className="inline-flex items-center gap-1 text-slate-200 bg-slate-800 px-1.5 py-0.5 rounded text-xs"><ShieldCheck size={10}/> Check Bypass Probability</span> button to verify if the text passes detection. You can then export as PDF or Markdown.
            </p>
          </section>

        </div>
        
        {/* Footer Hint */}
        <div className="bg-indigo-900/20 border-t border-indigo-500/20">
          <div className="p-4 text-center">
            <p className="text-xs text-indigo-300">
              <strong>Pro Tip:</strong> If "Maximum" strength is too messy, try "High" and manually add a few personal anecdotes.
            </p>
          </div>
          
          <div className="py-3 bg-[#0b1121] border-t border-slate-800 flex items-center justify-center gap-1.5 text-xs text-slate-500 font-medium">
             <span>Made with</span>
             <Heart size={10} className="text-red-500 fill-red-500" />
             <span>by</span>
             <span className="text-indigo-400">Divyam</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default InfoModal;