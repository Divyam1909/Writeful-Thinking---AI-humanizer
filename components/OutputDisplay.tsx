import React, { useState } from 'react';
import { Copy, Check, Sparkles, RefreshCw, Clock, AlignLeft, Split, FileText, Download, ScanEye, ShieldCheck, ShieldAlert } from 'lucide-react';
import { jsPDF } from "jspdf";
import { computeDiff } from '../utils/diff';
import { AIDetectionResult } from '../types';
import { analyzeAIProbability } from '../services/geminiService';

interface OutputDisplayProps {
  content: string;
  originalContent: string;
  isStreaming: boolean;
  onRegenerate: () => void;
  hasInput: boolean;
}

type ViewMode = 'text' | 'diff';

const OutputDisplay: React.FC<OutputDisplayProps> = ({ content, originalContent, isStreaming, onRegenerate, hasInput }) => {
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('text');
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectionResult, setDetectionResult] = useState<AIDetectionResult | null>(null);

  const handleCopy = () => {
    if (!content) return;
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportPDF = () => {
    if (!content) return;
    const doc = new jsPDF();
    const splitText = doc.splitTextToSize(content, 180);
    doc.text(splitText, 10, 10);
    doc.save("humanized-text.pdf");
  };

  const handleExportMarkdown = () => {
    if (!content) return;
    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "humanized-text.md";
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDetectionCheck = async () => {
    if (!content || isDetecting) return;
    setIsDetecting(true);
    setDetectionResult(null);
    try {
      const result = await analyzeAIProbability(content);
      setDetectionResult(result);
    } catch (e) {
      console.error(e);
    } finally {
      setIsDetecting(false);
    }
  };

  const wordCount = content.trim().split(/\s+/).filter(w => w.length > 0).length;
  const charCount = content.length;
  const readingTime = Math.ceil(wordCount / 200);

  // Compute Diff
  const diffParts = React.useMemo(() => {
    if (viewMode === 'diff' && content && originalContent) {
      return computeDiff(originalContent, content);
    }
    return [];
  }, [viewMode, content, originalContent]);

  return (
    <div className="flex flex-col h-full bg-surface-light rounded-2xl border border-slate-700 overflow-hidden shadow-xl">
      {/* Header Toolbar */}
      <div className="flex flex-wrap items-center justify-between px-4 py-3 border-b border-slate-700/50 bg-slate-800/50 gap-2">
        <div className="flex items-center gap-2">
          <Sparkles size={18} className="text-secondary" />
          <h2 className="font-semibold text-slate-200">Output</h2>
        </div>
        
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* View Toggle */}
          {content && !isStreaming && (
             <div className="flex bg-slate-900 rounded-lg p-0.5 border border-slate-700 mr-2">
               <button
                 onClick={() => setViewMode('text')}
                 className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${viewMode === 'text' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-200'}`}
               >
                 Text
               </button>
               <button
                 onClick={() => setViewMode('diff')}
                 className={`flex items-center gap-1 px-3 py-1 rounded-md text-xs font-medium transition-all ${viewMode === 'diff' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-200'}`}
               >
                 <Split size={12} /> Diff
               </button>
             </div>
          )}

          {/* Export Actions */}
          {content && !isStreaming && (
            <>
              <div className="h-4 w-px bg-slate-700 mx-1" />
              <button onClick={handleExportPDF} title="Export as PDF" className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-md transition-colors">
                <FileText size={16} />
              </button>
              <button onClick={handleExportMarkdown} title="Export as Markdown" className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-md transition-colors">
                <Download size={16} />
              </button>
              <div className="h-4 w-px bg-slate-700 mx-1" />
            </>
          )}

          {/* Main Actions */}
          {content && !isStreaming && (
            <button 
              onClick={onRegenerate}
              className="p-1.5 text-slate-400 hover:text-white transition-colors rounded-md hover:bg-slate-700"
              title="Regenerate"
            >
              <RefreshCw size={16} />
            </button>
          )}
          
          <button
            onClick={handleCopy}
            disabled={!content}
            className={`
              flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all
              ${copied 
                ? 'bg-secondary/20 text-secondary' 
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed'
              }
            `}
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="relative flex-1 p-0 overflow-hidden flex flex-col">
        {content ? (
          <>
             <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                {viewMode === 'diff' ? (
                  <div className="font-serif text-lg leading-relaxed text-slate-400">
                    {diffParts.map((part, index) => (
                      <span
                        key={index}
                        className={`
                          ${part.added ? 'bg-green-500/20 text-green-200 decoration-green-500/50' : ''}
                          ${part.removed ? 'bg-red-500/20 text-red-300 line-through decoration-red-500/50 decoration-2' : ''}
                        `}
                      >
                        {part.value}
                      </span>
                    ))}
                  </div>
                ) : (
                  <textarea
                    readOnly
                    value={content}
                    className="w-full h-full bg-transparent text-slate-100 font-serif text-lg leading-relaxed resize-none focus:outline-none"
                    spellCheck={false}
                  />
                )}
             </div>

             {/* AI Detection Section */}
             {!isStreaming && (
               <div className="border-t border-slate-700/50 bg-slate-800/20 p-4">
                  {!detectionResult ? (
                     <button 
                       onClick={handleDetectionCheck}
                       disabled={isDetecting}
                       className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-slate-600 hover:border-indigo-500 hover:bg-indigo-500/5 text-slate-400 hover:text-indigo-400 transition-all group"
                     >
                        {isDetecting ? (
                           <><div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /> Analyzing Patterns...</>
                        ) : (
                           <><ScanEye size={18} className="group-hover:scale-110 transition-transform"/> Check Bypass Probability</>
                        )}
                     </button>
                  ) : (
                    <div className="bg-slate-900 rounded-xl p-4 border border-slate-700 flex flex-col md:flex-row gap-4 items-center animate-in fade-in slide-in-from-bottom-2">
                       <div className={`
                          w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold border-4
                          ${detectionResult.score < 30 ? 'border-green-500 text-green-500' : detectionResult.score < 70 ? 'border-yellow-500 text-yellow-500' : 'border-red-500 text-red-500'}
                       `}>
                          {detectionResult.score}%
                       </div>
                       <div className="flex-1 text-center md:text-left">
                          <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                             <h4 className="font-bold text-white">Estimated AI Probability</h4>
                             {detectionResult.score < 30 ? <ShieldCheck size={18} className="text-green-500" /> : <ShieldAlert size={18} className={detectionResult.score < 70 ? "text-yellow-500" : "text-red-500"} />}
                          </div>
                          <p className="text-sm text-slate-400">{detectionResult.analysis}</p>
                          <p className="text-[10px] text-slate-600 mt-1 italic">*Estimates vary by detection platform.</p>
                       </div>
                       <button onClick={() => setDetectionResult(null)} className="text-xs underline text-slate-500 hover:text-white">Reset</button>
                    </div>
                  )}
               </div>
             )}
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 opacity-60 pointer-events-none p-8 text-center">
            {isStreaming ? (
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-slate-600 border-t-primary rounded-full animate-spin"></div>
                <p className="animate-pulse">Humanizing your text...</p>
              </div>
            ) : (
              <>
                 <Sparkles size={48} className="mb-4 text-slate-600" />
                 <p className="text-lg font-medium">Ready to rewrite</p>
                 <p className="text-sm max-w-xs mt-2">Select 'Maximum' strength to beat aggressive detectors.</p>
              </>
            )}
          </div>
        )}
      </div>

      {/* Footer Stats */}
      {content && (
         <div className="px-4 py-2.5 bg-slate-900/50 border-t border-slate-700/50 text-[11px] text-slate-400 flex justify-between items-center font-medium tracking-wide">
           <div className="flex items-center gap-4">
             <span className="flex items-center gap-1.5" title="Word Count">
               <AlignLeft size={12} className="text-slate-500" /> {wordCount} words
             </span>
             <span className="w-px h-3 bg-slate-700"></span>
             <span className="hidden sm:flex items-center gap-1.5" title="Character Count">
               <span className="text-slate-500">chars:</span> {charCount}
             </span>
             <span className="w-px h-3 bg-slate-700 hidden sm:block"></span>
             <span className="flex items-center gap-1.5" title="Estimated Reading Time">
               <Clock size={12} className="text-slate-500" /> ~{readingTime} min read
             </span>
           </div>
           
           {isStreaming && <span className="text-primary animate-pulse">Generative AI Active...</span>}
         </div>
      )}
    </div>
  );
};

export default OutputDisplay;
