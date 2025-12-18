import React, { useState, useEffect, useRef, useCallback } from 'react';
import { DECKS } from './data/decks';

/**
 * HEDZUP ELITE
 * Produced by a critical code analyst for perfect performance.
 */

// --- GLOBAL CONFIGURATION ---
const SENSOR_STIFFNESS = 0.28; // Balance between responsiveness and stability
const PITCH_THRESHOLD = 45;    // Degrees for action
const NEUTRAL_ZONE = 18;       // Degrees for reset

// --- SHARED UI PRIMITIVES ---
const UI_Button = ({ onClick, children, className = "" }) => (
    <button
        onClick={onClick}
        className={`w-full py-8 font-black rounded-[4rem] active:scale-95 transition-all shadow-[0_25px_60px_rgba(0,0,0,0.3)] text-5xl tracking-tighter uppercase ${className}`}
    >
        {children}
    </button>
);

// --- CORE GAME ENGINE ---
const GameEngine = ({ deck, cards, onComplete, playHaptic, baseline }) => {
    const [gameState, setGameState] = useState('active'); // active | correct | pass
    const [cardIndex, setCardIndex] = useState(0);
    const [results, setResults] = useState({ correct: [], skipped: [] });
    const [timeLeft, setTimeLeft] = useState(60);

    const activeCard = cards[cardIndex] || null;
    const bridge = useRef({ pitch: 0, state: 'NEUTRAL' });

    // Precise Game Action
    const nextStep = useCallback((outcome) => {
        if (gameState !== 'active') return;

        playHaptic(outcome === 'correct' ? 'success' : 'pass');
        setGameState(outcome);

        const newResults = { ...results };
        if (outcome === 'correct') newResults.correct = [...newResults.correct, activeCard];
        else newResults.skipped = [...newResults.skipped, activeCard];
        setResults(newResults);

        // Card Swap Delay (Optimized for rhythm)
        setTimeout(() => {
            if (cardIndex + 1 >= cards.length) {
                onComplete(newResults);
            } else {
                setCardIndex(prev => prev + 1);
                setGameState('active');
            }
        }, 550);
    }, [gameState, cardIndex, cards, activeCard, results, playHaptic, onComplete]);

    /**
     * SENSOR PROCESSING UNIT
     * Implements a relative pitch delta with automatic sign correction for Notch-Left/Right orientation.
     */
    useEffect(() => {
        const processMotion = (e) => {
            const { beta, gamma } = e;
            if (beta === null || gamma === null) return;

            // Detect orientation by beta sign (beta > 0 usually Notch Left, beta < 0 Notch Right)
            // This makes the game "Just Work" regardless of how the phone is held.
            const orientationSign = beta > 0 ? 1 : -1;
            let currentPitch = gamma * orientationSign;
            let pitchDelta = currentPitch - (baseline.gamma * orientationSign);

            // Normalize wrap-around at global boundaries
            if (pitchDelta > 180) pitchDelta -= 360;
            if (pitchDelta < -180) pitchDelta += 360;

            // Apply Low-Pass Filter
            bridge.current.pitch = bridge.current.pitch + SENSOR_STIFFNESS * (pitchDelta - bridge.current.pitch);
            const val = bridge.current.pitch;

            if (gameState !== 'active') return;

            // Hysteresis Control Flow
            if (bridge.current.state === 'NEUTRAL') {
                if (val > PITCH_THRESHOLD) {
                    bridge.current.state = 'TRIGGERED';
                    nextStep('correct');
                } else if (val < -PITCH_THRESHOLD) {
                    bridge.current.state = 'TRIGGERED';
                    nextStep('pass');
                }
            } else if (Math.abs(val) < NEUTRAL_ZONE) {
                bridge.current.state = 'NEUTRAL';
            }
        };

        window.addEventListener('deviceorientation', processMotion);
        return () => window.removeEventListener('deviceorientation', processMotion);
    }, [gameState, baseline, nextStep]);

    // Timekeeping Engine
    useEffect(() => {
        if (timeLeft <= 0) {
            onComplete(results);
            return;
        }
        const ticker = setInterval(() => setTimeLeft(t => t - 1), 1000);
        return () => clearInterval(ticker);
    }, [timeLeft, onComplete, results]);

    // Swipe Fallback
    const drag = useRef({ startY: 0 });
    const handleTouchStart = (e) => drag.current.startY = e.touches[0].clientY;
    const handleTouchEnd = (e) => {
        const deltaY = e.changedTouches[0].clientY - drag.current.startY;
        if (Math.abs(deltaY) > 120) nextStep(deltaY > 0 ? 'correct' : 'pass');
    };

    const sceneColor = gameState === 'correct' ? 'bg-green-500' : gameState === 'pass' ? 'bg-orange-500' : 'bg-zinc-950';

    return (
        <div
            className={`fixed inset-0 flex items-center justify-center transition-colors duration-500 ${sceneColor} touch-none`}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
        >
            <div className="relative flex flex-col items-center justify-center w-full h-full max-w-7xl mx-auto">

                {/* TIMER: Industrial Design (Max Visibility) */}
                <div className="absolute top-12 left-12 bg-black/90 backdrop-blur-3xl px-20 py-12 rounded-[4rem] shadow-[0_40px_100px_rgba(0,0,0,0.6)] z-50 border border-white/5 animate-in slide-in-from-left-10 duration-700">
                    <span className="font-mono text-[10rem] font-black text-white leading-none tracking-tighter tabular-nums drop-shadow-2xl">{timeLeft}</span>
                </div>

                {/* THE CARD: Modern Geometric UI */}
                <div className={`
                    w-[94%] h-[84%] bg-white rounded-[8rem] shadow-[0_120px_240px_-60px_rgba(0,0,0,0.9)] flex flex-col items-center justify-center p-24 text-center
                    transition-all duration-500 cubic-bezier(0.34, 1.56, 0.64, 1) transform
                    ${gameState !== 'active' ? 'opacity-0 scale-75 translate-y-40 -rotate-3' : 'opacity-100 scale-100 translate-y-0 rotate-0'}
                `}>
                    {activeCard?.type === 'country' && activeCard?.code && (
                        <img
                            src={`https://raw.githubusercontent.com/djaiss/mapsicon/master/all/${activeCard.code}/vector.svg`}
                            className="w-80 h-80 mb-20 object-contain drop-shadow-lg"
                            alt="flag"
                        />
                    )}

                    <h1 className={`${activeCard?.text.length > 10 ? 'text-8xl' : 'text-[11rem]'} font-black text-zinc-950 tracking-tightest leading-[0.8] uppercase flex-shrink-0`}>
                        {activeCard?.text}
                    </h1>

                    <div className="mt-24 w-1/2 h-2 bg-zinc-950/5 rounded-full overflow-hidden">
                        <div className="h-full bg-zinc-950 opacity-10" style={{ width: `${(cardIndex / cards.length) * 100}%` }}></div>
                    </div>

                    <div className="mt-12 opacity-10 text-5xl font-black uppercase tracking-[1em] text-zinc-900">
                        {activeCard?.type === 'country' ? 'Geography' : deck.title}
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- SCENERY ---

const MainMenu = ({ decks, onSelect }) => (
    <div className="min-h-screen bg-zinc-50 p-16 flex flex-col pt-40 overflow-y-auto">
        <header className="mb-32 px-4 text-center md:text-left">
            <h1 className="text-[14rem] font-black text-zinc-950 tracking-tightest mb-4 leading-none inline-block border-b-[20px] border-zinc-950 pb-8">HEDZUP</h1>
            <p className="text-5xl text-zinc-400 font-black uppercase tracking-[0.5em] mt-8 pl-4">Elite Edition</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16 pb-64">
            {decks.map(d => (
                <div
                    key={d.id}
                    onClick={() => onSelect(d)}
                    className="group cursor-pointer bg-white p-16 rounded-[6rem] shadow-[0_30px_90px_rgba(0,0,0,0.06)] hover:shadow-[0_60px_120px_rgba(0,0,0,0.12)] hover:-translate-y-6 transition-all duration-700 border border-zinc-50 flex items-center gap-16"
                >
                    <div className={`w-40 h-40 rounded-[4.5rem] bg-gradient-to-br ${d.gradient} flex items-center justify-center shadow-3xl group-hover:rotate-12 group-hover:scale-110 transition-all duration-700`}>
                        {d.icon}
                    </div>
                    <div>
                        <h3 className="text-6xl font-black text-zinc-950 mb-3 tracking-tighter">{d.title}</h3>
                        <p className="text-zinc-400 font-black uppercase text-base tracking-widest opacity-60 leading-relaxed">{d.description}</p>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

const InstructionScreen = ({ deck, onProceed }) => {
    const handleAuth = async () => {
        if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
            try {
                const res = await DeviceOrientationEvent.requestPermission();
                onProceed(res === 'granted');
            } catch (e) { onProceed(false); }
        } else { onProceed(true); }
    };

    return (
        <div className="fixed inset-0 bg-white flex flex-col items-center justify-center p-20 text-center animate-in fade-in slide-in-from-bottom-20 duration-1000">
            <div className={`w-64 h-64 rounded-[6.5rem] bg-gradient-to-br ${deck.gradient} flex items-center justify-center shadow-[0_60px_120px_rgba(0,0,0,0.15)] mb-24`}>
                {deck.icon}
            </div>
            <h2 className="text-8xl font-black text-zinc-950 mb-24 tracking-tightest uppercase">{deck.title}</h2>

            <div className="w-full max-w-4xl space-y-12 mb-32">
                <div className="flex items-center bg-zinc-50 p-14 rounded-[5.5rem] gap-12 border border-zinc-100 shadow-sm transition-all hover:scale-105 duration-500">
                    <div className="w-20 h-20 rounded-full bg-zinc-950 text-white flex items-center justify-center font-black text-4xl">1</div>
                    <span className="text-5xl font-black text-zinc-600">Forehead (Notch Left)</span>
                </div>
                <div className="flex flex-col md:flex-row gap-12 w-full">
                    <div className="flex-1 flex items-center bg-green-50 p-14 rounded-[5.5rem] gap-12 border border-green-200">
                        <div className="w-20 h-20 rounded-full bg-green-500 text-white flex items-center justify-center font-black text-4xl">✓</div>
                        <span className="text-4xl font-black text-green-700">TILT DOWN</span>
                    </div>
                    <div className="flex-1 flex items-center bg-orange-50 p-14 rounded-[5.5rem] gap-12 border border-orange-200">
                        <div className="w-20 h-20 rounded-full bg-orange-500 text-white flex items-center justify-center font-black text-4xl">X</div>
                        <span className="text-4xl font-black text-orange-700">TILT UP</span>
                    </div>
                </div>
            </div>

            <div className="w-full max-w-xl">
                <UI_Button onClick={handleAuth} className="bg-zinc-950 text-white py-12 shadow-3xl">LOCKED AND LOADED</UI_Button>
            </div>
        </div>
    );
};

const CalibrationScreen = ({ onReady, active }) => {
    const [counter, setCounter] = useState(3);
    const orientationStream = useRef({ gamma: 0 });

    useEffect(() => {
        const capture = (e) => { if (e.gamma !== null) orientationStream.current = { gamma: e.gamma }; };
        if (active) window.addEventListener('deviceorientation', capture);
        if (counter > 0) {
            const lap = setTimeout(() => setCounter(counter - 1), 1000);
            return () => { clearTimeout(lap); window.removeEventListener('deviceorientation', capture); };
        } else {
            onReady(orientationStream.current);
        }
    }, [counter, onReady, active]);

    return (
        <div className="fixed inset-0 bg-zinc-950 flex items-center justify-center z-[100] p-24">
            <div className="text-center">
                <div className="text-[30rem] font-black text-white italic leading-none animate-pulse drop-shadow-[0_0_120px_rgba(255,255,255,0.4)]">
                    {counter > 0 ? counter : "GO!"}
                </div>
                <p className="text-white/20 text-6xl font-black uppercase tracking-[2em] mt-40 pl-12">Calibrating Gears</p>
            </div>
        </div>
    );
};

const HighScoreScreen = ({ stats, onMenu, onRepeat }) => (
    <div className="min-h-screen bg-zinc-50 flex flex-col p-24 overflow-y-auto">
        <header className="mb-32 text-center pt-32">
            <h1 className="text-[14rem] font-black text-zinc-950 tracking-tightest leading-none drop-shadow-sm">SCOREBOARD</h1>
            <div className="flex justify-center gap-48 mt-24">
                <div className="text-center transform hover:scale-110 transition-transform duration-500">
                    <span className="text-[16rem] font-black text-green-500 block mb-6 leading-none tabular-nums">{stats.correct.length}</span>
                    <p className="text-lg font-black text-zinc-400 uppercase tracking-widest leading-none">Victory</p>
                </div>
                <div className="text-center transform hover:scale-110 transition-transform duration-500 text-zinc-300">
                    <span className="text-[16rem] font-black text-zinc-300 block mb-6 leading-none tabular-nums">{stats.skipped.length}</span>
                    <p className="text-lg font-black text-zinc-300 uppercase tracking-widest leading-none">Defeat</p>
                </div>
            </div>
        </header>

        <div className="flex-1 space-y-12 mb-40 max-w-6xl mx-auto w-full">
            {[...stats.correct.map(c => ({ ...c, win: true })), ...stats.skipped.map(c => ({ ...c, win: false }))].map((item, i) => (
                <div key={i} className={`p-16 rounded-[6rem] flex items-center justify-between shadow-2xl transition-all duration-500 hover:-translate-y-2 ${item.win ? 'bg-white border-green-50' : 'bg-zinc-50/50 border-transparent opacity-60'}`}>
                    <span className="text-7xl font-black text-zinc-950 tracking-tightest leading-none uppercase">{item.text}</span>
                    <div className={`w-28 h-28 rounded-full flex items-center justify-center font-black text-5xl shadow-inner ${item.win ? 'bg-green-100 text-green-600' : 'bg-zinc-200 text-zinc-500'}`}>
                        {item.win ? '✓' : 'X'}
                    </div>
                </div>
            ))}
        </div>

        <div className="space-y-12 pb-64 mt-auto max-w-2xl mx-auto w-full">
            <UI_Button onClick={onRepeat} className="bg-zinc-950 text-white py-12 shadow-[0_40px_80px_rgba(0,0,0,0.4)]">DOMINATE AGAIN</UI_Button>
            <button onClick={onMenu} className="w-full text-zinc-400 font-black p-16 hover:text-zinc-950 tracking-[1.2em] uppercase text-xl transition-all duration-500 transform hover:scale-105">Back to Command Hub</button>
        </div>
    </div>
);

// --- ELITE MASTER HUB ---
export default function App() {
    const [stage, setStage] = useState('menu');
    const [currentDeck, setCurrentDeck] = useState(null);
    const [gameDeck, setGameDeck] = useState([]);
    const [pastStats, setPastStats] = useState({ correct: [], skipped: [] });
    const [motionAuth, setMotionAuth] = useState(false);
    const [calData, setCalData] = useState({ gamma: 0 });

    const playTriggerSound = (type) => {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return;
        const ctx = new AC();
        const osc = ctx.createOscillator();
        const output = ctx.createGain();
        osc.connect(output); output.connect(ctx.destination);
        const t = ctx.currentTime;

        if (type === 'success') {
            osc.frequency.setValueAtTime(800, t);
            osc.frequency.exponentialRampToValueAtTime(1800, t + 0.1);
            output.gain.setValueAtTime(0.2, t);
            output.gain.exponentialRampToValueAtTime(0.01, t + 0.2);
            osc.start(); osc.stop(t + 0.2);
        } else if (type === 'pass') {
            osc.frequency.setValueAtTime(400, t);
            osc.frequency.linearRampToValueAtTime(80, t + 0.3);
            output.gain.setValueAtTime(0.2, t);
            output.gain.exponentialRampToValueAtTime(0.01, t + 0.3);
            osc.start(); osc.stop(t + 0.3);
        } else if (type === 'finish') {
            osc.frequency.setValueAtTime(550, t);
            osc.frequency.exponentialRampToValueAtTime(1400, t + 0.6);
            output.gain.setValueAtTime(0.2, t);
            output.gain.linearRampToValueAtTime(0, t + 1.5);
            osc.start(); osc.stop(t + 1.5);
        }
    };

    const initGame = (d) => {
        setCurrentDeck(d);
        setGameDeck([...d.data].sort(() => Math.random() - 0.5));
        setStage('ready');
    };

    const endGame = (results) => {
        setPastStats(results);
        playTriggerSound('finish');
        setStage('summary');
    };

    return (
        <div className="min-h-screen bg-zinc-50 font-sans selection:bg-zinc-200 touch-none select-none text-zinc-950 antialiased overflow-hidden transition-all duration-1000">
            {stage === 'menu' && <MainMenu decks={DECKS} onSelect={initGame} />}
            {stage === 'ready' && <InstructionScreen deck={currentDeck} onProceed={(ok) => { setMotionAuth(ok); setStage('sync'); }} />}
            {stage === 'sync' && <CalibrationScreen active={motionAuth} onReady={(c) => { setCalData(c); setStage('play'); }} />}
            {stage === 'play' && (
                <GameEngine
                    deck={currentDeck}
                    cards={gameDeck}
                    onComplete={endGame}
                    playHaptic={playTriggerSound}
                    baseline={calData}
                />
            )}
            {stage === 'summary' && <HighScoreScreen stats={pastStats} onMenu={() => setStage('menu')} onRepeat={() => initGame(currentDeck)} />}
        </div>
    );
}
