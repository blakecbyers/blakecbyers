import React, { useState, useEffect, useRef } from 'react';
import { DECKS } from './data/decks';
import Game from './components/Game';

// UI Helpers
const Button = ({ onClick, children, className = "" }) => (
    <button onClick={onClick} className={`w-full py-5 font-bold rounded-[2rem] active:scale-95 transition-all shadow-xl hover:shadow-2xl text-xl ${className}`}>
        {children}
    </button>
);

// --- MENU VIEW ---
const MenuView = ({ onSelect }) => (
    <div className="min-h-screen bg-zinc-50 p-6 flex flex-col pt-20 overflow-y-auto">
        <header className="mb-12">
            <h1 className="text-7xl font-black text-zinc-900 tracking-tighter mb-2">Hedzup</h1>
            <p className="text-xl text-zinc-500 font-medium italic">Place on forehead to play!</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
            {DECKS.map(deck => (
                <div
                    key={deck.id}
                    onClick={() => onSelect(deck)}
                    className="group cursor-pointer bg-white p-8 rounded-[3.5rem] shadow-sm hover:shadow-2xl hover:scale-[1.02] transition-all border border-zinc-100 flex items-center gap-8"
                >
                    <div className={`w-24 h-24 rounded-[2.5rem] bg-gradient-to-br ${deck.gradient} flex items-center justify-center shadow-lg group-hover:rotate-6 transition-transform`}>
                        {deck.icon}
                    </div>
                    <div>
                        <h3 className="text-3xl font-bold text-zinc-900 mb-1">{deck.title}</h3>
                        <p className="text-zinc-500 font-bold opacity-60 uppercase text-xs tracking-widest">{deck.description}</p>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

// --- INSTRUCTIONS VIEW ---
const InstructionsView = ({ deck, onStart }) => {
    const handleStart = async () => {
        if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
            try {
                const res = await DeviceOrientationEvent.requestPermission();
                onStart(res === 'granted');
            } catch (e) { onStart(false); }
        } else { onStart(true); }
    };

    return (
        <div className="fixed inset-0 bg-white flex flex-col items-center justify-center p-8 text-center animate-in fade-in slide-in-from-bottom-5 duration-500">
            <div className={`w-32 h-32 rounded-[3.5rem] bg-gradient-to-br ${deck.gradient} flex items-center justify-center shadow-2xl mb-10`}>
                {deck.icon}
            </div>
            <h2 className="text-4xl font-black text-zinc-900 mb-10">{deck.title}</h2>

            <div className="w-full max-w-sm space-y-4 mb-14">
                <div className="flex items-center bg-zinc-50 p-6 rounded-[2.5rem] gap-4 border border-zinc-100">
                    <div className="w-10 h-10 rounded-full bg-zinc-900 text-white flex items-center justify-center font-black">1</div>
                    <span className="text-lg font-bold text-zinc-600">Place phone on forehead</span>
                </div>
                <div className="flex items-center bg-green-50 p-6 rounded-[2.5rem] gap-4 border border-green-100">
                    <div className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center font-black">✓</div>
                    <span className="text-lg font-bold text-green-700 text-left">Correct: <b>Tilt Down</b></span>
                </div>
                <div className="flex items-center bg-orange-50 p-6 rounded-[2.5rem] gap-4 border border-orange-100">
                    <div className="w-10 h-10 rounded-full bg-orange-500 text-white flex items-center justify-center font-black">X</div>
                    <span className="text-lg font-bold text-orange-700 text-left">Pass: <b>Tilt Up</b></span>
                </div>
            </div>

            <div className="w-full max-w-xs">
                <Button onClick={handleStart} className="bg-zinc-900 text-white">I'M READY</Button>
            </div>
        </div>
    );
};

// --- COUNTDOWN VIEW ---
const CountdownView = ({ onFinished, motionActive }) => {
    const [count, setCount] = useState(3);
    const calibrationRef = useRef({ beta: 0, gamma: 0 });

    useEffect(() => {
        const handleCalibration = (e) => {
            if (e.beta !== null) calibrationRef.current = { beta: e.beta, gamma: e.gamma };
        };
        if (motionActive) window.addEventListener('deviceorientation', handleCalibration);

        if (count > 0) {
            const t = setTimeout(() => setCount(count - 1), 1000);
            return () => { clearTimeout(t); window.removeEventListener('deviceorientation', handleCalibration); };
        } else {
            onFinished(calibrationRef.current);
        }
    }, [count, onFinished, motionActive]);

    return (
        <div className="fixed inset-0 bg-zinc-900 flex items-center justify-center z-[100] p-10">
            <div style={{ transform: 'rotate(90deg)', transformOrigin: 'center' }} className="text-center">
                <div className="text-[15rem] font-black text-white italic animate-pulse leading-none">
                    {count > 0 ? count : "GO!"}
                </div>
                <p className="text-white/30 text-2xl font-black uppercase tracking-[0.8em] mt-12 pl-4">Forehead Ready!</p>
            </div>
        </div>
    );
};

// --- RESULTS VIEW ---
const ResultsView = ({ stats, onHome, onRestart, deck }) => (
    <div className="min-h-screen bg-zinc-50 flex flex-col p-8 overflow-y-auto">
        <header className="mb-12 text-center pt-12">
            <h1 className="text-7xl font-black text-zinc-900 tracking-tighter">Results</h1>
            <div className="flex justify-center gap-12 mt-10">
                <div className="text-center">
                    <span className="text-6xl font-black text-green-500 block mb-1">{stats.correct.length}</span>
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Correct</p>
                </div>
                <div className="text-center">
                    <span className="text-6xl font-black text-orange-500 block mb-1">{stats.skipped.length}</span>
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Skipped</p>
                </div>
            </div>
        </header>

        <div className="flex-1 space-y-4 mb-16">
            {[...stats.correct.map(c => ({ ...c, hit: true })), ...stats.skipped.map(c => ({ ...c, hit: false }))].map((item, i) => (
                <div key={i} className="bg-white p-6 rounded-[2.5rem] flex items-center justify-between shadow-sm border border-zinc-100">
                    <span className="text-3xl font-black text-zinc-800 tracking-tight leading-none">{item.text}</span>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black ${item.hit ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                        {item.hit ? '✓' : 'X'}
                    </div>
                </div>
            ))}
        </div>

        <div className="space-y-4 pb-20 mt-auto">
            <Button onClick={onRestart} className="bg-zinc-900 text-white">PLAY AGAIN</Button>
            <button onClick={onHome} className="w-full text-zinc-400 font-bold p-6 hover:text-zinc-600 tracking-widest uppercase text-xs">Return to Menu</button>
        </div>
    </div>
);

// --- MAIN APP ---
export default function App() {
    const [view, setView] = useState('menu');
    const [deck, setDeck] = useState(null);
    const [cards, setCards] = useState([]);
    const [stats, setStats] = useState({ correct: [], skipped: [] });
    const [motionActive, setMotionActive] = useState(false);
    const [calibration, setCalibration] = useState({ beta: 0, gamma: 0 });

    const playSound = (type) => {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        const now = ctx.currentTime;

        if (type === 'success') {
            osc.frequency.setValueAtTime(500, now);
            osc.frequency.exponentialRampToValueAtTime(1200, now + 0.1);
            gain.gain.setValueAtTime(0.1, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
            osc.start(); osc.stop(now + 0.2);
        } else if (type === 'pass') {
            osc.frequency.setValueAtTime(300, now);
            osc.frequency.linearRampToValueAtTime(100, now + 0.3);
            gain.gain.setValueAtTime(0.1, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
            osc.start(); osc.stop(now + 0.3);
        } else if (type === 'finish') {
            osc.frequency.setValueAtTime(400, now);
            osc.frequency.exponentialRampToValueAtTime(800, now + 0.4);
            gain.gain.setValueAtTime(0.1, now);
            gain.gain.linearRampToValueAtTime(0, now + 0.8);
            osc.start(); osc.stop(now + 0.8);
        }
    };

    const startPrep = (selectedDeck) => {
        setDeck(selectedDeck);
        setCards([...selectedDeck.data].sort(() => 0.5 - Math.random()));
        setView('instructions');
    };

    const onFinish = (results) => {
        setStats(results);
        playSound('finish');
        setView('results');
    };

    return (
        <div className="min-h-screen bg-zinc-50 font-sans selection:bg-orange-100 touch-none select-none text-zinc-900 transition-colors duration-700">
            {view === 'menu' && <MenuView onSelect={startPrep} />}
            {view === 'instructions' && <InstructionsView deck={deck} onStart={(granted) => { setMotionActive(granted); setView('countdown'); }} />}
            {view === 'countdown' && <CountdownView motionActive={motionActive} onFinished={(cal) => { setCalibration(cal); setView('game'); }} />}
            {view === 'game' && (
                <Game
                    deck={deck}
                    cards={cards}
                    onFinish={onFinish}
                    playSound={playSound}
                    motionActive={motionActive}
                    calibration={calibration}
                />
            )}
            {view === 'results' && <ResultsView stats={stats} deck={deck} onHome={() => setView('menu')} onRestart={() => startPrep(deck)} />}
        </div>
    );
}
