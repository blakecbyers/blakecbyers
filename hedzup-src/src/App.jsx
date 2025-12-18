import React, { useState, useCallback } from 'react';
import { Play, RotateCcw, Check, X, ChevronLeft, Scroll, OctagonAlert, Smartphone, Globe } from 'lucide-react';
import GameView from './components/GameView';
import CountdownView from './components/CountdownView';

import { DECKS } from './data/decks';

export default function App() {
    const [view, setView] = useState('menu');
    const [selectedDeck, setSelectedDeck] = useState(null);
    const [shuffledCards, setShuffledCards] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [results, setResults] = useState({ correct: [], skipped: [] });
    const [timer, setTimer] = useState(60);
    const [motionActive, setMotionActive] = useState(false);
    const [calibration, setCalibration] = useState({ beta: 0, gamma: 0 });
    const [isPortrait, setIsPortrait] = useState(window.innerHeight > window.innerWidth);

    const playSound = (type) => {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        const now = ctx.currentTime;
        if (type === 'tick') { osc.frequency.setValueAtTime(800, now); gain.gain.setValueAtTime(0.02, now); osc.start(); osc.stop(now + 0.05); }
        else if (type === 'success') { osc.frequency.setValueAtTime(500, now); osc.frequency.exponentialRampToValueAtTime(1000, now + 0.1); gain.gain.setValueAtTime(0.1, now); osc.start(); osc.stop(now + 0.3); }
        else if (type === 'pass') { osc.frequency.setValueAtTime(300, now); osc.frequency.linearRampToValueAtTime(150, now + 0.2); gain.gain.setValueAtTime(0.1, now); osc.start(); osc.stop(now + 0.3); }
    };

    const selectDeck = (deck) => {
        setSelectedDeck(deck);
        setShuffledCards([...deck.data].sort(() => 0.5 - Math.random()));
        setCurrentIndex(0);
        setResults({ correct: [], skipped: [] });
        setTimer(60);
        setView('instructions');
    };

    return (
        <div className="fixed inset-0 bg-zinc-50 overflow-hidden touch-none select-none font-sans text-zinc-900">
            {view === 'menu' && <MenuView decks={DECKS} onSelect={selectDeck} />}
            {view === 'instructions' && <InstructionsView deck={selectedDeck} onStart={(m) => { setMotionActive(m); setView('countdown'); }} />}
            {view === 'countdown' && <CountdownView onFinished={(cal) => { setCalibration(cal); setView('game'); }} motionActive={motionActive} isPortrait={isPortrait} />}
            {view === 'game' && <GameView deck={selectedDeck} cards={shuffledCards} currentIndex={currentIndex} setCurrentIndex={setCurrentIndex} timer={timer} setTimer={setTimer} results={results} setResults={setResults} onFinish={() => setView('results')} playSound={playSound} motionActive={motionActive} calibration={calibration} isPortrait={isPortrait} />}
            {view === 'results' && <ResultsView results={results} deck={selectedDeck} onHome={() => setView('menu')} onRestart={() => selectDeck(selectedDeck)} />}
        </div>
    );
}

function MenuView({ decks, onSelect }) {
    return (
        <div className="flex flex-col h-full max-w-md mx-auto w-full p-6">
            <h1 className="text-4xl font-bold mt-8">Heads Up</h1>
            <h2 className="text-xl font-semibold text-blue-600 mb-8">Blevnecked Edition</h2>
            <div className="space-y-4">
                {decks.map(d => (
                    <button key={d.id} onClick={() => onSelect(d)} className="w-full bg-white p-4 rounded-2xl shadow-sm border border-zinc-100 flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${d.gradient} flex items-center justify-center text-white`}>{d.icon}</div>
                        <div className="text-left font-bold">{d.title}</div>
                    </button>
                ))}
            </div>
        </div>
    );
}

function InstructionsView({ deck, onStart }) {
    const request = async () => {
        if (typeof DeviceOrientationEvent?.requestPermission === 'function') {
            const res = await DeviceOrientationEvent.requestPermission();
            onStart(res === 'granted');
        } else onStart(true);
    };
    return (
        <div className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">{deck.title}</h2>
            <p className="mb-8 opacity-60">Place phone on forehead. \n Tilt down for Correct, up for Pass.</p>
            <button onClick={request} className="bg-zinc-900 text-white px-8 py-4 rounded-2xl font-bold">Start Game</button>
        </div>
    );
}

function ResultsView({ results, deck, onHome, onRestart }) {
    return (
        <div className="h-full flex flex-col bg-zinc-50">
            <div className="p-6 bg-white shadow-sm flex justify-between items-center">
                <h2 className="text-xl font-bold">Score: {results.correct.length}</h2>
                <button onClick={onHome} className="text-blue-600 font-bold">Home</button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
                {results.correct.map((w, i) => <div key={i} className="mb-2 p-3 bg-white rounded-lg border border-green-100 text-green-700">✓ {w}</div>)}
                {results.skipped.map((w, i) => <div key={i} className="mb-2 p-3 bg-white rounded-lg border border-orange-100 text-orange-400">X {w}</div>)}
            </div>
            <button onClick={onRestart} className="m-6 bg-zinc-900 text-white py-4 rounded-xl font-bold">Play Again</button>
        </div>
    );
}
