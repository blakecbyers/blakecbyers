import React, { useState, useEffect, useRef, useCallback } from 'react';
import { DECKS } from './data/decks';

/**
 * HEDZUP: MASTER PRODUCTION EDITION
 * Produced for an elite codebase with perfect sensor handling and audience perspective.
 */

// --- DYNAMIC CONFIGURATION ---
const SENSOR_STABILIZATION = 0.28; // Low-pass filter weight
const TRIGGER_THRESHOLD = 45;      // Angle in degrees to trigger action
const HYSTERESIS_LIMIT = 15;        // Angle to return to neutral

// --- SHARED UI COMPONENTS ---
const ActionButton = ({ onClick, children, className = "" }) => (
    <button
        onClick={onClick}
        className={`w-full py-8 text-5xl font-black rounded-[4rem] active:scale-95 transition-all shadow-[0_20px_50px_rgba(0,0,0,0.2)] tracking-tighter uppercase ${className}`}
    >
        {children}
    </button>
);

/**
 * CORE GAME ENGINE
 * Engineered for industrial-grade orientation handling.
 */
const HedzupGame = ({ deck, cards, onFinish, playFeedback, initialCal }) => {
    const [status, setStatus] = useState('active'); // active | correct | pass
    const [index, setIndex] = useState(0);
    const [tally, setTally] = useState({ correct: [], skipped: [] });
    const [seconds, setSeconds] = useState(60);

    const activeItem = cards[index] || null;
    const bridge = useRef({ pitch: 0, state: 'NEUTRAL' });

    // Precise Game Action Dispatcher
    const processAction = useCallback((result) => {
        if (status !== 'active') return;

        playFeedback(result === 'correct' ? 'success' : 'pass');
        setStatus(result);

        const currentTally = { ...tally };
        if (result === 'correct') currentTally.correct = [...currentTally.correct, activeItem];
        else currentTally.skipped = [...currentTally.skipped, activeItem];
        setTally(currentTally);

        // Smooth transition to next card
        setTimeout(() => {
            if (index + 1 >= cards.length) {
                onFinish(currentTally);
            } else {
                setIndex(prev => prev + 1);
                setStatus('active');
            }
        }, 600);
    }, [status, index, cards, activeItem, tally, playFeedback, onFinish]);

    /**
     * SENSOR PROCESSING UNIT
     * Dual-orientation aware engine using relative pitch delta.
     */
    useEffect(() => {
        const onDeviceMotion = (e) => {
            const { beta, gamma } = e;
            if (beta === null || gamma === null) return;

            // In landscape-left orientation (standard for heads up):
            // Gamma is the primary pitch axis (tilting toward floor/ceiling).
            // Beta sign detects if the phone is flipped (Notch Left vs Notch Right).
            const multiplier = beta > 0 ? 1 : -1;
            const livePitch = gamma * multiplier;
            let delta = livePitch - (initialCal.gamma * multiplier);

            // Normalize angular distance
            if (delta > 180) delta -= 360;
            if (delta < -180) delta += 360;

            // Low-pass filter for butter-smooth state locking
            bridge.current.pitch = bridge.current.pitch + SENSOR_STABILIZATION * (delta - bridge.current.pitch);
            const currentVal = bridge.current.pitch;

            if (status !== 'active') return;

            // Hysteresis-based State Machine
            if (bridge.current.state === 'NEUTRAL') {
                if (currentVal > TRIGGER_THRESHOLD) {
                    bridge.current.state = 'TRIGGERED';
                    processAction('correct');
                } else if (currentVal < -TRIGGER_THRESHOLD) {
                    bridge.current.state = 'TRIGGERED';
                    processAction('pass');
                }
            } else if (Math.abs(currentVal) < HYSTERESIS_LIMIT) {
                bridge.current.state = 'NEUTRAL';
            }
        };

        window.addEventListener('deviceorientation', onDeviceMotion);
        return () => window.removeEventListener('deviceorientation', onDeviceMotion);
    }, [status, initialCal, processAction]);

    // Master Timer
    useEffect(() => {
        if (seconds <= 0) {
            onFinish(tally);
            return;
        }
        const clock = setInterval(() => setSeconds(t => t - 1), 1000);
        return () => clearInterval(clock);
    }, [seconds, onFinish, tally]);

    // Surface Touch Gestures
    const touchCoord = useRef(0);
    const handleStart = (e) => touchCoord.current = e.touches[0].clientY;
    const handleEnd = (e) => {
        const offset = e.changedTouches[0].clientY - touchCoord.current;
        if (Math.abs(offset) > 80) processAction(offset > 0 ? 'correct' : 'pass');
    };

    const sceneBg = status === 'correct' ? 'bg-green-500' : status === 'pass' ? 'bg-orange-500' : 'bg-zinc-950';

    return (
        <div className={`fixed inset-0 flex items-center justify-center transition-colors duration-500 ${sceneBg} touch-none`} onTouchStart={handleStart} onTouchEnd={handleEnd}>
            {/* AUDIENCE VIEWPORT: Flipped 90deg to ensure global readability */}
            <div style={{ transform: 'rotate(90deg)', transformOrigin: 'center' }} className="relative flex flex-col items-center justify-center w-[100vh] h-[100vw]">

                {/* TIMER: Industrial Impact Visibility */}
                <div className="absolute top-12 left-12 bg-black/90 backdrop-blur-3xl px-24 py-12 rounded-[4.5rem] shadow-[0_40px_100px_rgba(0,0,0,0.6)] z-50 border border-white/5 animate-in slide-in-from-top-20 duration-1000">
                    <span className="font-mono text-[12rem] font-black text-white leading-none tracking-tightest tabular-nums">{seconds}</span>
                </div>

                {/* THE CARD */}
                <div className={`
                    w-[92%] h-[82%] bg-white rounded-[8.5rem] shadow-[0_120px_240px_-50px_rgba(0,0,0,0.9)] flex flex-col items-center justify-center p-24 text-center
                    transition-all duration-500 cubic-bezier(0.34, 1.56, 0.64, 1) transform
                    ${status !== 'active' ? 'opacity-0 scale-75 translate-y-32' : 'opacity-100 scale-100 translate-y-0'}
                `}>
                    {activeItem?.type === 'country' && activeItem?.code && (
                        <img
                            src={`https://raw.githubusercontent.com/djaiss/mapsicon/master/all/${activeItem.code}/vector.svg`}
                            className="w-[35vh] h-[35vh] mb-20 object-contain drop-shadow-2xl"
                            alt="visual"
                        />
                    )}

                    <h1 className={`${activeItem?.text.length > 10 ? 'text-[12vh]' : 'text-[18vh]'} font-black text-zinc-950 leading-[0.8] tracking-tightest uppercase`}>
                        {activeItem?.text}
                    </h1>

                    <div className="mt-20 opacity-10 text-[6vh] font-black uppercase tracking-[1em] text-zinc-900 flex items-center gap-10">
                        <div className="w-24 h-1 bg-zinc-950"></div>
                        <span>{activeItem?.type === 'country' ? 'Geography' : deck.title}</span>
                        <div className="w-24 h-1 bg-zinc-950"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- SCENE IMPLEMENTATIONS ---

const Scene_Menu = ({ list, onPick }) => (
    <div className="min-h-screen bg-zinc-50 p-16 flex flex-col pt-40 overflow-y-auto">
        <header className="mb-32 px-4">
            <h1 className="text-[15rem] font-black text-zinc-950 tracking-tightest mb-4 leading-none inline-block border-b-[24px] border-zinc-950 pb-8 uppercase">Hedzup</h1>
            <p className="text-6xl text-zinc-400 font-bold uppercase tracking-[0.6em] mt-10 pl-6">Elite Edition</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16 pb-64">
            {list.map(d => (
                <div
                    key={d.id}
                    onClick={() => onPick(d)}
                    className="group cursor-pointer bg-white p-16 rounded-[6rem] shadow-[0_30px_90px_rgba(0,0,0,0.06)] hover:shadow-3xl hover:-translate-y-4 transition-all duration-700 border border-zinc-50 flex items-center gap-16"
                >
                    <div className={`w-44 h-44 rounded-[4.5rem] bg-gradient-to-br ${d.gradient} flex items-center justify-center shadow-3xl group-hover:rotate-12 transition-all duration-700`}>
                        {d.icon}
                    </div>
                    <div>
                        <h3 className="text-7xl font-black text-zinc-950 mb-3 tracking-tighter">{d.title}</h3>
                        <p className="text-zinc-400 font-black uppercase text-lg tracking-widest opacity-60 leading-relaxed">{d.description}</p>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

const Scene_Splash = ({ deck, onConfirm }) => {
    const handleMotionAccess = async () => {
        if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
            try {
                const res = await DeviceOrientationEvent.requestPermission();
                onConfirm(res === 'granted');
            } catch (e) { onConfirm(false); }
        } else { onConfirm(true); }
    };

    return (
        <div className="fixed inset-0 bg-white flex flex-col items-center justify-center p-24 text-center animate-in fade-in duration-1000">
            <div className={`w-72 h-72 rounded-[6.5rem] bg-gradient-to-br ${deck.gradient} flex items-center justify-center shadow-3xl mb-24`}>
                {deck.icon}
            </div>
            <h2 className="text-[8rem] font-black text-zinc-950 mb-24 tracking-tightest uppercase">{deck.title}</h2>

            <div className="w-full max-w-5xl space-y-12 mb-32">
                <div className="flex items-center bg-zinc-50 p-16 rounded-[6rem] gap-14 border border-zinc-100 shadow-sm transition-all hover:scale-105 duration-500">
                    <div className="w-24 h-24 rounded-full bg-zinc-950 text-white flex items-center justify-center font-black text-5xl">1</div>
                    <span className="text-6xl font-black text-zinc-600">Forehead, Screen Out</span>
                </div>
                <div className="flex flex-col md:flex-row gap-12 w-full">
                    <div className="flex-1 flex items-center bg-green-50 p-16 rounded-[6rem] gap-14 border border-green-200">
                        <div className="w-24 h-24 rounded-full bg-green-500 text-white flex items-center justify-center font-black text-5xl">✓</div>
                        <span className="text-5xl font-black text-green-700">TILT DOWN</span>
                    </div>
                    <div className="flex-1 flex items-center bg-orange-50 p-16 rounded-[6rem] gap-14 border border-orange-200">
                        <div className="w-24 h-24 rounded-full bg-orange-500 text-white flex items-center justify-center font-black text-5xl">X</div>
                        <span className="text-5xl font-black text-orange-700">TILT UP</span>
                    </div>
                </div>
            </div>

            <div className="w-full max-w-2xl">
                <ActionButton onClick={handleMotionAccess} className="bg-zinc-950 text-white py-14 shadow-3xl">LOCKED IN</ActionButton>
            </div>
        </div>
    );
};

const Scene_Warmup = ({ onReady, active }) => {
    const [count, setCount] = useState(3);
    const orientationBuffer = useRef({ gamma: 0 });

    useEffect(() => {
        const sampler = (e) => { if (e.gamma !== null) orientationBuffer.current = { gamma: e.gamma }; };
        if (active) window.addEventListener('deviceorientation', sampler);
        if (count > 0) {
            const lap = setTimeout(() => setCount(count - 1), 1000);
            return () => { clearTimeout(lap); window.removeEventListener('deviceorientation', sampler); };
        } else {
            onReady(orientationBuffer.current);
        }
    }, [count, onReady, active]);

    return (
        <div className="fixed inset-0 bg-zinc-950 flex items-center justify-center z-[100] p-24">
            <div style={{ transform: 'rotate(90deg)' }} className="text-center">
                <div className="text-[35rem] font-black text-white italic leading-none animate-pulse drop-shadow-[0_0_150px_rgba(255,255,255,0.4)]">
                    {count > 0 ? count : "GO!"}
                </div>
                <p className="text-white/20 text-7xl font-black uppercase tracking-[2.5em] mt-48 pl-14 white-space-nowrap leading-none">Calibrating...</p>
            </div>
        </div>
    );
};

const Scene_Results = ({ stats, onExit, onRetry }) => (
    <div className="min-h-screen bg-zinc-50 flex flex-col p-24 overflow-y-auto">
        <header className="mb-40 text-center pt-40">
            <h1 className="text-[15rem] font-black text-zinc-950 tracking-tightest leading-none">SESSION OVER</h1>
            <div className="flex justify-center gap-64 mt-32">
                <div className="text-center">
                    <span className="text-[20rem] font-black text-green-500 block mb-10 leading-none tabular-nums animate-in zoom-in-50 duration-700">{stats.correct.length}</span>
                    <p className="text-3xl font-black text-zinc-400 uppercase tracking-widest leading-none">Successes</p>
                </div>
                <div className="text-center opacity-40">
                    <span className="text-[20rem] font-black text-zinc-300 block mb-10 leading-none tabular-nums animate-in zoom-in-50 duration-1000">{stats.skipped.length}</span>
                    <p className="text-3xl font-black text-zinc-400 uppercase tracking-widest leading-none">Skips</p>
                </div>
            </div>
        </header>

        <div className="flex-1 space-y-16 mb-48 max-w-7xl mx-auto w-full">
            {[...stats.correct.map(c => ({ ...c, win: true })), ...stats.skipped.map(c => ({ ...c, win: false }))].map((item, i) => (
                <div key={i} className={`p-20 rounded-[7rem] flex items-center justify-between shadow-3xl transition-all duration-500 ${item.win ? 'bg-white border-green-50 scale-100' : 'bg-zinc-50/50 scale-95 opacity-50'}`}>
                    <span className="text-[10rem] font-black text-zinc-950 tracking-tightest leading-none uppercase">{item.text}</span>
                    <div className={`w-32 h-32 rounded-full flex items-center justify-center font-black text-6xl shadow-inner ${item.win ? 'bg-green-100 text-green-600' : 'bg-zinc-200 text-zinc-500'}`}>
                        {item.win ? '✓' : 'X'}
                    </div>
                </div>
            ))}
        </div>

        <div className="space-y-16 pb-64 mt-auto max-w-3xl mx-auto w-full">
            <ActionButton onClick={onRetry} className="bg-zinc-950 text-white py-14 shadow-4xl">PLAY AGAIN</ActionButton>
            <button onClick={onExit} className="w-full text-zinc-400 font-bold p-16 hover:text-zinc-950 tracking-[1.5em] uppercase text-3xl transition-all">Command Hub</button>
        </div>
    </div>
);

// --- MASTER APPLICATION HUB ---
export default function App() {
    const [view, setView] = useState('menu');
    const [deck, setDeck] = useState(null);
    const [cards, setCards] = useState([]);
    const [stats, setStats] = useState({ correct: [], skipped: [] });
    const [active, setActive] = useState(false);
    const [cal, setCal] = useState({ gamma: 0 });

    const handleSFX = (type) => {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;
        const ctx = new AudioCtx();
        if (ctx.state === 'suspended') ctx.resume();

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        const now = ctx.currentTime;

        if (type === 'success') {
            osc.frequency.setValueAtTime(800, now);
            osc.frequency.exponentialRampToValueAtTime(1800, now + 0.12);
            gain.gain.setValueAtTime(0.25, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
            osc.start(); osc.stop(now + 0.2);
        } else if (type === 'pass') {
            osc.frequency.setValueAtTime(400, now);
            osc.frequency.linearRampToValueAtTime(50, now + 0.4);
            gain.gain.setValueAtTime(0.25, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
            osc.start(); osc.stop(now + 0.4);
        } else if (type === 'finish') {
            osc.frequency.setValueAtTime(600, now);
            osc.frequency.exponentialRampToValueAtTime(1400, now + 0.7);
            gain.gain.setValueAtTime(0.25, now);
            gain.gain.linearRampToValueAtTime(0, now + 1.8);
            osc.start(); osc.stop(now + 1.8);
        }
    };

    const activateGame = (d) => {
        setDeck(d);
        setCards([...d.data].sort(() => Math.random() - 0.5));
        setView('splash');
    };

    const deactivateGame = (results) => {
        setStats(results);
        handleSFX('finish');
        setView('results');
    };

    return (
        <div className="min-h-screen bg-zinc-50 font-sans selection:bg-zinc-200 touch-none select-none text-zinc-950 antialiased overflow-hidden transition-all duration-1000">
            {view === 'menu' && <Scene_Menu list={DECKS} onPick={activateGame} />}
            {view === 'splash' && <Scene_Splash deck={deck} onConfirm={(ok) => { setActive(ok); setView('warmup'); }} />}
            {view === 'warmup' && <Scene_Warmup active={active} onReady={(c) => { setCal(c); setView('play'); }} />}
            {view === 'play' && (
                <HedzupGame
                    deck={deck}
                    cards={cards}
                    onFinish={deactivateGame}
                    playFeedback={handleSFX}
                    initialCal={cal}
                />
            )}
            {view === 'results' && <Scene_Results stats={stats} onExit={() => setView('menu')} onRetry={() => activateGame(deck)} />}
        </div>
    );
}
