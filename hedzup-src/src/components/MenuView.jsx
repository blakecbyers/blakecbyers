import React from 'react';
import { Play, Smartphone } from 'lucide-react';

export default function MenuView({ decks, onSelect }) {
    return (
        <div className="flex flex-col h-full safe-area-inset-bottom max-w-md mx-auto w-full bg-zinc-50">
            <div className="flex-none px-6 pt-12 pb-6">
                <h1 className="text-4xl font-bold tracking-tight text-zinc-900">
                    Heads Up
                </h1>
                <h2 className="text-2xl font-semibold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 -mt-1">
                    Blevnecked Edition
                </h2>
                <p className="text-zinc-500 mt-2 text-base font-medium">Select a deck.</p>
            </div>

            <div className="flex-1 overflow-y-auto px-6 pb-8 space-y-4">
                {decks.map((deck) => (
                    <button
                        key={deck.id}
                        onClick={() => onSelect(deck)}
                        className="w-full bg-white p-4 rounded-2xl shadow-sm border border-zinc-100 active:scale-[0.98] transition-all duration-200 flex items-center justify-between group"
                    >
                        <div className="flex items-center space-x-4">
                            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${deck.gradient} flex items-center justify-center shadow-inner`}>
                                {deck.icon}
                            </div>
                            <div className="text-left">
                                <h3 className="text-lg font-semibold text-zinc-900 leading-tight">{deck.title}</h3>
                                <p className="text-sm text-zinc-500 leading-tight mt-0.5">{deck.description}</p>
                            </div>
                        </div>
                        <div className="flex flex-col items-end justify-center">
                            <span className="text-[10px] font-bold text-zinc-400 mb-1 uppercase tracking-wider">{deck.data.length} Cards</span>
                            <div className="w-8 h-8 rounded-full bg-zinc-100 text-zinc-400 group-hover:bg-zinc-200 group-hover:text-zinc-600 transition-colors flex items-center justify-center">
                                <Play size={14} fill="currentColor" />
                            </div>
                        </div>
                    </button>
                ))}
            </div>
            <div className="p-6 text-center text-zinc-400 text-xs font-medium">
                <div className="flex items-center justify-center gap-2 mb-1">
                    <Smartphone size={16} />
                </div>
                <p>Works best on mobile. Tap deck to begin.</p>
            </div>
        </div>
    );
}
