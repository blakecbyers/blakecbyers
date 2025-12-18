import React from 'react';
import { ChevronLeft, Check, X } from 'lucide-react';

export default function ResultsView({ results, deck, onHome, onRestart }) {
    if (!results || !deck) {
        return <div className="p-20 text-center">Loading results...</div>;
    }
    return (
        <div className="h-full w-full flex flex-col bg-zinc-50 safe-area-inset-bottom">
            <div className="flex-none px-6 py-6 bg-white border-b border-zinc-200 shadow-sm z-10 flex justify-between items-center sticky top-0">
                <div>
                    <h2 className="text-2xl font-bold text-zinc-900">Game Over</h2>
                    <p className="text-zinc-500 text-sm font-medium">{deck.title}</p>
                </div>
                <div className="text-right">
                    <span className="block text-3xl font-bold text-[#34C759] leading-none">{results.correct.length}</span>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Correct</span>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {results.correct.map((word, i) => (
                    <div key={`c-${i}`} className="flex items-center px-4 py-3 bg-white rounded-xl shadow-sm border border-zinc-100">
                        <div className="w-8 h-8 rounded-full bg-[#34C759]/10 flex items-center justify-center text-[#34C759] mr-3 flex-shrink-0">
                            <Check size={14} strokeWidth={3} />
                        </div>
                        <span className="text-lg font-semibold text-zinc-900">{word}</span>
                    </div>
                ))}
                {results.skipped.map((word, i) => (
                    <div key={`s-${i}`} className="flex items-center px-4 py-3 bg-white/60 rounded-xl border border-zinc-100/50">
                        <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400 mr-3 flex-shrink-0">
                            <X size={14} strokeWidth={3} />
                        </div>
                        <span className="text-lg font-medium text-zinc-400 line-through decoration-zinc-300">{word}</span>
                    </div>
                ))}
            </div>

            <div className="flex-none p-6 bg-white border-t border-zinc-200 grid grid-cols-2 gap-4 pb-10">
                <button onClick={onHome} className="flex items-center justify-center px-6 py-3.5 rounded-xl bg-zinc-100 text-zinc-900 font-semibold text-base active:bg-zinc-200 transition-colors">
                    <ChevronLeft className="mr-2" size={18} /> Menu
                </button>
                <button onClick={onRestart} className="flex items-center justify-center px-6 py-3.5 rounded-xl bg-zinc-900 text-white font-semibold text-base shadow-lg active:scale-95 transition-transform">
                    Play Again
                </button>
            </div>
        </div>
    );
}
