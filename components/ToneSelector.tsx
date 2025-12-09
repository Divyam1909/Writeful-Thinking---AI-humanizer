import React, { useRef, useEffect } from 'react';
import { Tone } from '../types';
import { Smile, Briefcase, Coffee, Heart, Zap, BookOpen, Sparkles, Theater } from 'lucide-react';

interface ToneSelectorProps {
  selectedTone: Tone;
  onSelect: (tone: Tone) => void;
}

const ToneSelector: React.FC<ToneSelectorProps> = ({ selectedTone, onSelect }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const tones = [
    { value: Tone.CASUAL, icon: Coffee, label: "Casual", color: "text-amber-400" },
    { value: Tone.PROFESSIONAL, icon: Briefcase, label: "Professional", color: "text-blue-400" },
    { value: Tone.FRIENDLY, icon: Smile, label: "Friendly", color: "text-green-400" },
    { value: Tone.CONFIDENT, icon: Zap, label: "Confident", color: "text-yellow-400" },
    { value: Tone.EMPATHETIC, icon: Heart, label: "Empathetic", color: "text-pink-400" },
    { value: Tone.ACADEMIC, icon: BookOpen, label: "Academic", color: "text-slate-200" },
    { value: Tone.WITTY, icon: Sparkles, label: "Witty", color: "text-purple-400" },
    { value: Tone.DRAMATIC, icon: Theater, label: "Dramatic", color: "text-red-400" },
  ];

  // Auto-scroll to selected element on mount/change
  useEffect(() => {
    if (scrollContainerRef.current) {
      const selectedEl = scrollContainerRef.current.querySelector(`[data-tone="${selectedTone}"]`);
      if (selectedEl) {
        selectedEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [selectedTone]);

  return (
    <div className="w-full relative group">
      {/* Gradient masks for scroll indicators */}
      <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#0b1121] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#0b1121] to-transparent z-10 pointer-events-none" />

      <div 
        ref={scrollContainerRef}
        className="flex gap-3 overflow-x-auto pb-4 pt-1 px-1 scrollbar-hide snap-x"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {tones.map((t) => (
          <button
            key={t.value}
            data-tone={t.value}
            onClick={() => onSelect(t.value)}
            className={`
              snap-center flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-full border transition-all duration-200 whitespace-nowrap
              ${selectedTone === t.value 
                ? 'bg-surface border-primary text-white shadow-[0_0_15px_rgba(99,102,241,0.4)] scale-105' 
                : 'bg-surface/50 border-slate-700 text-slate-400 hover:border-slate-500 hover:bg-surface hover:text-slate-200'
              }
            `}
          >
            <t.icon size={16} className={selectedTone === t.value ? t.color : 'opacity-70'} />
            <span className="text-sm font-medium">{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ToneSelector;