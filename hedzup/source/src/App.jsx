import React, { useState, useEffect, useRef, useCallback } from 'react';
import { DECKS } from './data/decks';
import TiltLogic from './utils/tilt-logic';

// --- CONFIG ---
const TILT_THRESHOLD = 45;
const NEUTRAL_ZONE = 20;
const SMOOTHING = 0.3;
const Button = ({ onClick, children, className = "" }) => (
    <button
        onClick={onClick}
        className={`w-full py-4 px-6 font-bold rounded-2xl active:scale-95 transition-all shadow-lg text-xl uppercase ${className}`}
    >
        {children}
    </button>
);

// --- GAMEPLAY ---
const GameView = ({ deck, cards, onFinish, playSound, calibration }) => {
    const [status, setStatus] = useState('active'); // active, correct, pass
    const [index, setIndex] = useState(0);
    const [stats, setStats] = useState({ correct: [], skipped: [] });
    const [timer, setTimer] = useState(60);

    const card = cards[index] || null;
    const physics = useRef({ tilt: 0, state: 'NEUTRAL' });

    const handleAction = useCallback((type) => {
        if (status !== 'active') return;

        playSound(type === 'correct' ? 'success' : 'pass');
        setStatus(type);

        const newStats = { ...stats };
        if (type === 'correct') newStats.correct = [...newStats.correct, card];
        else newStats.skipped = [...newStats.skipped, card];
        setStats(newStats);

        setTimeout(() => {
            if (index + 1 >= cards.length) {
                onFinish(newStats);
            } else {
                setIndex(prev => prev + 1);
                setStatus('active');
            }
        }, 600);
    }, [status, index, cards, card, stats, playSound, onFinish]);

    // Swipe detection
    const touchStart = useRef(null);

    const onTouchStart = (e) => {
        touchStart.current = e.touches[0].clientY;
    };

    const onTouchEnd = (e) => {
        if (!touchStart.current) return;
        const touchEnd = e.changedTouches[0].clientY;
        const delta = touchEnd - touchStart.current;
        const threshold = 50;

        if (delta > threshold) {
            handleAction('correct'); // Swipe Down
        } else if (delta < -threshold) {
            handleAction('pass'); // Swipe Up
        }
        touchStart.current = null;
    };

    // Standalone Tilt Logic Integration
    useEffect(() => {
        const engine = new TiltLogic({
            threshold: TILT_THRESHOLD,
            neutralZone: NEUTRAL_ZONE,
            smoothing: SMOOTHING,
            onYes: () => handleAction('correct'),
            onSkip: () => handleAction('pass')
        });

        // Set the calibration from the countdown phase
        engine.calibration = calibration;
        engine.start();

        return () => engine.stop();
    }, [calibration, handleAction]);

    // Timer
    useEffect(() => {
        if (timer <= 0) {
            onFinish(stats);
            return;
        }
        const interval = setInterval(() => setTimer(t => t - 1), 1000);
        return () => clearInterval(interval);
    }, [timer, onFinish, stats]);

    const bg = status === 'correct' ? 'bg-green-500' : status === 'pass' ? 'bg-orange-500' : 'bg-stone-900';

    return (
        <div
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
            className={`fixed inset-0 flex items-center justify-center transition-colors duration-500 ${bg} touch-none overflow-hidden`}
        >
            {/* View rotated 90deg for audience - Container fills screen */}
            <div
                style={{
                    transform: 'rotate(90deg)',
                    width: '100vh',
                    height: '100vw',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '2rem'
                }}
            >
                {/* Timer Area */}
                <div className="mb-[5vh] shrink-0">
                    <div className="bg-black/30 backdrop-blur-2xl px-12 py-4 rounded-full border border-white/10 shadow-xl">
                        <span className="font-mono text-[9vh] leading-none font-black text-white">{timer}</span>
                    </div>
                </div>

                {/* Card Area - Wider and properly centered */}
                <div className={`
                    w-[94vw] flex-grow max-h-[60vh] bg-white rounded-[6vh] shadow-2xl flex flex-col items-center justify-center px-[8vw] py-[4vh] text-center
                    transition-all duration-300 transform
                    ${status !== 'active' ? 'opacity-0 scale-95 translate-y-8' : 'opacity-100 scale-100 translate-y-0'}
                `}>
                    {card?.type === 'country' && card?.code && (
                        <img
                            src={`https://raw.githubusercontent.com/djaiss/mapsicon/master/all/${card.code}/vector.svg`}
                            className="w-[18vh] h-[18vh] mb-[3vh] object-contain drop-shadow-sm"
                            alt="flag"
                        />
                    )}

                    <h1 className={`
                        ${card?.text.length > 15 ? 'text-[7.5vh]' : 'text-[11vh]'} 
                        font-black text-stone-900 leading-[1] w-full break-words tracking-tight
                    `}>
                        {card?.text}
                    </h1>
                </div>

                {/* Bottom spacer for balance */}
                <div className="h-[2vh] w-full mt-[4vh]" />
            </div>
        </div>
    );
};

// --- VIEWS ---

const Menu = ({ onSelect }) => (
    <div className="min-h-screen bg-stone-50 p-6 flex flex-col pt-12 overflow-y-auto">
        <header className="mb-10">
            <h1 className="text-6xl font-black text-stone-900 tracking-tighter mb-2">Hedzup</h1>
            <p className="text-lg text-stone-500 font-bold uppercase tracking-widest">Select Category</p>
        </header>

        <div className="grid grid-cols-1 gap-4 pb-20">
            {DECKS.map(deck => (
                <div
                    key={deck.id}
                    onClick={() => onSelect(deck)}
                    className="cursor-pointer bg-white p-6 rounded-3xl shadow-sm border border-stone-100 flex items-center gap-6 active:scale-[0.98] transition-all"
                >
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${deck.gradient} flex items-center justify-center shadow-md`}>
                        {deck.icon}
                    </div>
                    <div>
                        <h3 className="text-2xl font-black text-stone-900">{deck.title}</h3>
                        <p className="text-stone-400 font-bold text-xs uppercase tracking-tight">{deck.description}</p>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

const Instructions = ({ deck, onStart }) => {
    const handleStart = async () => {
        if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
            try {
                const res = await DeviceOrientationEvent.requestPermission();
                onStart(res === 'granted');
            } catch (e) { onStart(false); }
        } else { onStart(true); }
    };

    return (
        <div className="fixed inset-0 bg-white flex flex-col items-center justify-center p-6 text-center overflow-y-auto">
            <div className={`w-24 h-24 rounded-3xl bg-gradient-to-br ${deck.gradient} flex items-center justify-center shadow-xl mb-8`}>
                {deck.icon}
            </div>
            <h2 className="text-4xl font-black text-stone-950 mb-8">{deck.title}</h2>

            <div className="w-full max-w-xs space-y-4 mb-10 text-left">
                <div className="flex items-center bg-stone-50 p-4 rounded-2xl gap-4 border border-stone-100">
                    <div className="w-10 h-10 rounded-full bg-stone-900 text-white flex items-center justify-center font-black">1</div>
                    <span className="text-lg font-bold text-stone-600">Forehead, Screen Out</span>
                </div>
                <div className="flex items-center bg-green-50 p-4 rounded-2xl gap-4 border border-green-100">
                    <div className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center font-black">✓</div>
                    <span className="text-lg font-bold text-green-700">Tilt Down = Correct</span>
                </div>
                <div className="flex items-center bg-orange-50 p-4 rounded-2xl gap-4 border border-orange-100">
                    <div className="w-10 h-10 rounded-full bg-orange-500 text-white flex items-center justify-center font-black">X</div>
                    <span className="text-lg font-bold text-orange-700">Tilt Up = Pass</span>
                </div>
            </div>

            <div className="w-full max-w-xs">
                <Button onClick={handleStart} className="bg-stone-950 text-white">READY</Button>
            </div>
        </div>
    );
};

const Countdown = ({ onReady, active }) => {
    const [sec, setSec] = useState(3);
    const engine = useRef(null);

    useEffect(() => {
        if (!engine.current) {
            engine.current = new TiltLogic({ smoothing: 1 }); // Fast response for calibration
        }

        if (active) engine.current.start();

        if (sec > 0) {
            const t = setTimeout(() => setSec(sec - 1), 1000);
            return () => clearTimeout(t);
        } else {
            engine.current.stop();
            // Pass the final "neutral" orientation to the game
            onReady({ pitch: engine.current.smoothed.pitch });
        }
    }, [sec, onReady, active]);

    return (
        <div className="fixed inset-0 bg-stone-950 flex items-center justify-center z-[100] p-10">
            <div style={{ transform: 'rotate(90deg)' }} className="text-center">
                <div className="text-[12rem] font-black text-white leading-none">
                    {sec > 0 ? sec : "GO!"}
                </div>
                <p className="text-white/30 text-2xl font-black uppercase tracking-widest mt-8">Calibrating...</p>
            </div>
        </div>
    );
};

const Results = ({ stats, onHome, onPlayAgain }) => (
    <div className="min-h-screen bg-stone-50 flex flex-col p-6 overflow-y-auto pt-10">
        <h1 className="text-6xl font-black text-stone-900 mb-8">Results</h1>

        <div className="flex gap-8 mb-10">
            <div>
                <span className="text-6xl font-black text-green-500 block">{stats.correct.length}</span>
                <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">Correct</p>
            </div>
            <div>
                <span className="text-6xl font-black text-orange-500 block">{stats.skipped.length}</span>
                <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">Passed</p>
            </div>
        </div>

        <div className="space-y-3 mb-12">
            {[...stats.correct.map(c => ({ ...c, hit: true })), ...stats.skipped.map(c => ({ ...c, hit: false }))].map((item, i) => (
                <div key={i} className="bg-white p-4 rounded-2xl flex items-center justify-between shadow-sm border border-stone-100">
                    <span className="text-xl font-bold text-stone-800">{item.text}</span>
                    <span className={`font-black ${item.hit ? 'text-green-500' : 'text-orange-500'}`}>
                        {item.hit ? '✓' : 'X'}
                    </span>
                </div>
            ))}
        </div>

        <div className="mt-auto space-y-4 pb-10">
            <Button onClick={onPlayAgain} className="bg-stone-950 text-white">PLAY AGAIN</Button>
            <button onClick={onHome} className="w-full text-stone-400 font-bold uppercase text-sm tracking-widest">Menu</button>
        </div>
    </div>
);

// --- APP ---
export default function App() {
    const [view, setView] = useState('menu');
    const [deck, setDeck] = useState(null);
    const [cards, setCards] = useState([]);
    const [stats, setStats] = useState({ correct: [], skipped: [] });
    const [active, setActive] = useState(false);
    const [cal, setCal] = useState({ pitch: 0 });

    const playSound = (type) => {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return;
        const ctx = new AC();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        const t = ctx.currentTime;

        if (type === 'success') {
            osc.frequency.setValueAtTime(600, t);
            osc.frequency.exponentialRampToValueAtTime(1200, t + 0.1);
            gain.gain.setValueAtTime(0.1, t);
            gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);
            osc.start(); osc.stop(t + 0.2);
        } else if (type === 'pass') {
            osc.frequency.setValueAtTime(400, t);
            osc.frequency.linearRampToValueAtTime(100, t + 0.3);
            gain.gain.setValueAtTime(0.1, t);
            gain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);
            osc.start(); osc.stop(t + 0.3);
        }
    };

    const handleSelect = (d) => {
        setDeck(d);
        setCards([...d.data].sort(() => Math.random() - 0.5));
        setView('instructions');
    };

    return (
        <div className="min-h-screen bg-stone-50 font-sans selection:bg-orange-100 select-none text-stone-950 antialiased">
            {view === 'menu' && <Menu onSelect={handleSelect} />}
            {view === 'instructions' && <Instructions deck={deck} onStart={(ok) => { setActive(ok); setView('countdown'); }} />}
            {view === 'countdown' && <Countdown active={active} onReady={(c) => { setCal(c); setView('game'); }} />}
            {view === 'game' && (
                <GameView
                    deck={deck}
                    cards={cards}
                    onFinish={(res) => { setStats(res); setView('results'); }}
                    playSound={playSound}
                    calibration={cal}
                />
            )}
            {view === 'results' && <Results stats={stats} onHome={() => setView('menu')} onPlayAgain={() => handleSelect(deck)} />}
        </div>
    );
}
