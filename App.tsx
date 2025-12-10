import React, { useState, useCallback, useEffect } from 'react';
import { Tone, Strength, Purpose, Readability, HistoryItem } from './types';
import { streamHumanizedText } from './services/geminiService';
import ToneSelector from './components/ToneSelector';
import StrengthSlider from './components/StrengthSlider';
import OutputDisplay from './components/OutputDisplay';
import AdvancedSettings from './components/AdvancedSettings';
import HistoryModal from './components/HistoryModal';
import InfoModal from './components/InfoModal';
import { Wand2, Eraser, AlertCircle, Quote, History as HistoryIcon, Info } from 'lucide-react';

const App: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Settings State
  const [tone, setTone] = useState<Tone>(Tone.CASUAL);
  const [strength, setStrength] = useState<Strength>(Strength.HIGH);
  const [purpose, setPurpose] = useState<Purpose>(Purpose.GENERAL);
  const [readability, setReadability] = useState<Readability>(Readability.STANDARD);

  // History State
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  
  // Info State
  const [showInfo, setShowInfo] = useState(false);

  // Load history from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('writeful_thinking_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  const addToHistory = (original: string, humanized: string) => {
    const newItem: HistoryItem = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      original,
      humanized,
      tone,
      strength
    };
    
    const newHistory = [newItem, ...history].slice(0, 10); // Keep last 10
    setHistory(newHistory);
    localStorage.setItem('writeful_thinking_history', JSON.stringify(newHistory));
  };

  const handleHumanize = async () => {
    if (!inputText.trim()) return;

    setIsStreaming(true);
    setOutputText('');
    setError(null);
    let fullOutput = '';

    try {
      await streamHumanizedText(
        inputText, 
        tone, 
        strength, 
        purpose, 
        readability, 
        (chunk) => {
          fullOutput += chunk;
          setOutputText(prev => prev + chunk);
        }
      );
      // Add to history after successful completion
      if (fullOutput) {
        addToHistory(inputText, fullOutput);
      }
    } catch (err: any) {
      setError(err.message || "Failed to humanize text. Please try again.");
    } finally {
      setIsStreaming(false);
    }
  };

  const clearAll = useCallback(() => {
    setInputText('');
    setOutputText('');
    setError(null);
  }, []);

  const handleHistorySelect = (item: HistoryItem) => {
    setInputText(item.original);
    setOutputText(item.humanized);
    setTone(item.tone);
    setStrength(item.strength);
  };

  const inputWordCount = inputText.trim().split(/\s+/).filter(w => w.length > 0).length;

  return (
    <div className="min-h-screen bg-[#0b1121] font-sans text-slate-200 selection:bg-primary/30 selection:text-white flex flex-col">
      
      {/* Navbar */}
      <nav className="sticky top-0 z-20 border-b border-slate-800 bg-[#0b1121]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 via-primary to-purple-600 flex items-center justify-center text-white font-bold shadow-lg shadow-primary/20 ring-1 ring-white/10">
              <span className="text-lg">W</span>
            </div>
            <div>
              <h1 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400">
                Writeful Thinking
              </h1>
              <p className="text-[10px] text-slate-500 font-medium tracking-wide uppercase">Undetectable Rewriter</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <button 
               onClick={() => setShowInfo(true)}
               className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-2"
               title="How to use"
             >
                <Info size={18} />
             </button>
             <button 
               onClick={() => setShowHistory(true)}
               className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-2"
               title="View History"
             >
                <HistoryIcon size={18} />
                <span className="text-xs font-semibold hidden md:block">History</span>
             </button>
             <div className="hidden md:block h-6 w-px bg-slate-800"></div>
             <a href="https://ai.google.dev" target="_blank" rel="noreferrer" className="text-xs font-semibold text-slate-500 hover:text-indigo-400 transition-colors flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                Gemini 2.5 Flash
             </a>
          </div>
        </div>
      </nav>

      <HistoryModal 
        isOpen={showHistory} 
        onClose={() => setShowHistory(false)} 
        history={history}
        onSelect={handleHistorySelect}
        onClear={() => {
          setHistory([]);
          localStorage.removeItem('writeful_thinking_history');
        }}
      />
      
      <InfoModal
        isOpen={showInfo}
        onClose={() => setShowInfo(false)}
      />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        
        {/* Tone Selector - Full Width Strip */}
        <div className="mb-8">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 px-1">Select Tone</label>
          <ToneSelector selectedTone={tone} onSelect={setTone} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-[600px]">
          
          {/* Left Column: Input & Controls */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            {/* Input Card */}
            <div className="flex-1 flex flex-col bg-surface-light rounded-2xl border border-slate-700 shadow-xl overflow-hidden group focus-within:ring-1 focus-within:ring-primary/50 transition-all">
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700/50 bg-slate-800/30">
                <div className="flex items-center gap-2 text-slate-300">
                  <Quote size={16} className="text-slate-500" />
                  <span className="text-sm font-semibold">Input Text</span>
                </div>
                {inputText && (
                  <button 
                    onClick={clearAll} 
                    className="text-xs font-medium text-slate-500 hover:text-red-400 flex items-center gap-1.5 transition-colors px-2 py-1 rounded-md hover:bg-slate-800"
                  >
                    <Eraser size={12} /> Clear
                  </button>
                )}
              </div>
              
              <div className="relative flex-1">
                <textarea
                  className="w-full h-full min-h-[280px] bg-transparent p-5 text-slate-300 placeholder:text-slate-600 focus:outline-none resize-none font-sans text-base leading-relaxed scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent"
                  placeholder="Paste your AI-generated text here to humanize it..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  spellCheck={false}
                />
              </div>

              <div className="px-5 py-3 border-t border-slate-700/50 bg-slate-800/50 flex justify-between items-center backdrop-blur-sm">
                <span className="text-xs font-medium text-slate-500">{inputWordCount} words</span>
                <span className={`text-xs font-medium ${inputWordCount > 500 ? 'text-orange-400' : 'text-slate-500'}`}>
                  {inputWordCount > 500 ? 'Long text may take longer' : 'Ready'}
                </span>
              </div>
            </div>

            {/* Settings Panel */}
            <div className="space-y-4">
              <div className="bg-surface-light rounded-2xl p-6 border border-slate-700 shadow-sm">
                <StrengthSlider strength={strength} onChange={setStrength} />
              </div>
              
              <AdvancedSettings 
                purpose={purpose} 
                setPurpose={setPurpose}
                readability={readability}
                setReadability={setReadability}
              />

              <button
                onClick={handleHumanize}
                disabled={!inputText.trim() || isStreaming}
                className={`
                  w-full relative group overflow-hidden rounded-xl p-4 font-bold text-base tracking-wide shadow-lg transition-all duration-300
                  ${!inputText.trim() || isStreaming
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                    : 'bg-primary hover:bg-indigo-500 text-white shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5'
                  }
                `}
              >
                 <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer" />
                 <div className="flex items-center justify-center gap-3 relative z-10">
                  {isStreaming ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Rewriting...</span>
                    </>
                  ) : (
                    <>
                      <Wand2 size={20} />
                      <span>Humanize Text</span>
                    </>
                  )}
                 </div>
              </button>
            </div>
          </div>

          {/* Right Column: Output */}
          <div className="lg:col-span-7 h-full min-h-[600px]">
            {error ? (
               <div className="w-full h-full flex items-center justify-center bg-surface-light rounded-2xl border border-red-900/50 p-10 animate-in fade-in zoom-in-95 duration-300">
                 <div className="text-center max-w-sm">
                   <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                     <AlertCircle size={32} className="text-red-500" />
                   </div>
                   <h3 className="text-xl font-bold text-red-400 mb-2">Generation Failed</h3>
                   <p className="text-slate-400 mb-8 leading-relaxed">{error}</p>
                   <button 
                     onClick={() => setError(null)}
                     className="px-6 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-200 transition-colors font-medium"
                   >
                     Try Again
                   </button>
                 </div>
               </div>
            ) : (
              <OutputDisplay 
                content={outputText} 
                originalContent={inputText}
                isStreaming={isStreaming} 
                onRegenerate={handleHumanize}
              />
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-slate-600 text-sm font-medium border-t border-slate-800/50 bg-[#0b1121]">
        <p>Made with love by <span className="text-indigo-400 hover:text-indigo-300 transition-colors cursor-default">Divyam</span></p>
      </footer>
    </div>
  );
};

export default App;