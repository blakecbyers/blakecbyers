import React, { useState, useEffect, useRef, useCallback } from 'react';
import { DECKS } from './data/decks';

/**
 * HEDZUP ELITE: MASTER PRODUCTION
 * Critical Audit: Fixed rotation for audience perspective & industrial sensor stability.
 */

const SENSOR_STiffness = 0.28;
const ACTION_THRESHOLD = 45;
const RESET_ZONE = 15;

const UI_ActionButton = ({ onClick, children, className = "" }) => (
    <button
        onClick={onClick}
        className={`w-full py-8 font-black rounded-[4rem] active:scale-95 transition-all shadow-[0_30px_60px_rgba(0,0,0,0.3)] text-5xl tracking-tighter uppercase ${className}`}
    >
        {children}
    </button>
);

const GameEngine = ({ deck, cards, onComplete, playHaptic, baseline }) => {
    const [gameState, setGameState] = useState('active'); // active | correct | pass
    const [cardIndex, setCardIndex] = useState(0);
    const [results, setResults] = useState({ correct: [], skipped: [] });
    const [timeLeft, setTimeLeft] = useState(60);

    const activeCard = cards[cardIndex] || null;
    const bridge = useRef({ pitch: 0, state: 'NEUTRAL' });

    const handleAction = useCallback((outcome) => {
        if (gameState !== 'active') return;

        playHaptic(outcome === 'correct' ? 'success' : 'pass');
        setGameState(outcome);

        const newResults = { ...results };
        if (outcome === 'correct') newResults.correct = [...newResults.correct, activeCard];
        else newResults.skipped = [...newResults.skipped, activeCard];
        setResults(newResults);

        setTimeout(() => {
            if (cardIndex + 1 >= cards.length) {
                onComplete(newResults);
            } else {
                setCardIndex(prev => prev + 1);
                setGameState('active');
            }
        }, 550);
    }, [gameState, cardIndex, cards, activeCard, results, playHaptic, onComplete]);

    // SENSOR UNIT: Optimized for Horizontal Forehead Play
    useEffect(() => {
        const processMotion = (e) => {
            const { beta, gamma } = e;
            if (beta === null || gamma === null) return;

            // In landscape-left orientation (standard for heads up), 
            // gamma is the primary pitch axis (tilting toward floor/ceiling).
            // We use beta's sign to auto-detect if the phone is flipped (Notch L/R)
            const sideSign = beta > 0 ? 1 : -1;
            const currentPitch = gamma * sideSign;
            let pitchDelta = currentPitch - (baseline.gamma * sideSign);

            if (pitchDelta > 180) pitchDelta -= 360;
            if (pitchDelta < -180) pitchDelta += 360;

            // Low-pass filter for butter-smooth state transitions
            bridge.current.pitch = bridge.current.pitch + SENSOR_STiffness * (pitchDelta - bridge.current.pitch);
            const val = bridge.current.pitch;

            if (gameState !== 'active') return;

            if (bridge.current.state === 'NEUTRAL') {
                if (val > ACTION_THRESHOLD) {
                    bridge.current.state = 'TRIGGERED';
                    handleAction('correct');
                } else if (val < -ACTION_THRESHOLD) {
                    bridge.current.state = 'TRIGGERED';
                    handleAction('pass');
                }
            } else if (Math.abs(val) < RESET_ZONE) {
                bridge.current.state = 'NEUTRAL';
            }
        };

        window.addEventListener('deviceorientation', processMotion);
        return () => window.removeEventListener('deviceorientation', processMotion);
    }, [gameState, baseline, handleAction]);

    // Global Timer
    useEffect(() => {
        if (timeLeft <= 0) {
            onComplete(results);
            return;
        }
        const ticker = setInterval(() => setTimeLeft(t => t - 1), 1000);
        return () => clearInterval(ticker);
    }, [timeLeft, onComplete, results]);

    // Swipe Overlays
    const drag = useRef({ startY: 0 });
    const handleTS = (e) => drag.current.startY = e.touches[0].clientY;
    const handleTE = (e) => {
        const delta = e.changedTouches[0].clientY - drag.current.startY;
        if (Math.abs(delta) > 100) handleAction(delta > 0 ? 'correct' : 'pass');
    };

    const sceneColor = gameState === 'correct' ? 'bg-green-500' : gameState === 'pass' ? 'bg-orange-500' : 'bg-zinc-950';

    return (
        <div
            className={`fixed inset-0 flex items-center justify-center transition-colors duration-500 ${sceneColor} touch-none`}
            onTouchStart={handleTS}
            onTouchEnd={handleTE}
        >
            {/* ROTATED VIEWPORT: Critical correction (90deg) for audience perspective */}
            <div style={{ transform: 'rotate(90deg)', transformOrigin: 'center' }} className="relative flex flex-col items-center justify-center w-[100vh] h-[100vw]">

                {/* TIMER: High Contrast & Visibility */}
                <div className="absolute top-12 left-12 bg-black/90 backdrop-blur-3xl px-24 py-12 rounded-[4.5rem] shadow-[0_50px_100px_rgba(0,0,0,0.7)] z-50 border border-white/10 animate-in slide-in-from-top-10 duration-700">
                    <span className="font-mono text-[11rem] font-black text-white leading-none tracking-tightest tabular-nums">{timeLeft}</span>
                </div>

                {/* THE CARD */}
                <div className={`
                    w-[92%] h-[82%] bg-white rounded-[8.5rem] shadow-[0_120px_240px_-50px_rgba(0,0,0,0.9)] flex flex-col items-center justify-center p-24 text-center
                    transition-all duration-500 transform
                    ${gameState !== 'active' ? 'opacity-0 scale-75 translate-y-32' : 'opacity-100 scale-100 translate-y-0'}
                `}>
                    {activeCard?.type === 'country' && activeCard?.code && (
                        <img
                            src={`https://raw.githubusercontent.com/djaiss/mapsicon/master/all/${activeCard.code}/vector.svg`}
                            className="w-[30vh] h-[30vh] mb-20 object-contain drop-shadow-2xl"
                            alt="visual"
                        />
                    )}

                    <h1 className={`${activeCard?.text.length > 10 ? 'text-[12vh]' : 'text-[18vh]'} font-black text-zinc-950 leading-[0.8] uppercase tracking-tightest`}>
                        {activeCard?.text}
                    </h1>

                    <div className="mt-20 opacity-10 text-[6vh] font-black uppercase tracking-[1em] text-zinc-900 flex items-center gap-8">
                        <div className="w-16 h-1 bg-zinc-900"></div>
                        <span>{activeCard?.type === 'country' ? 'Geography' : deck.title}</span>
                        <div className="w-16 h-1 bg-zinc-900"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- SCENES ---

const MainMenu = ({ decks, onSelect }) => (
    <div className="min-h-screen bg-zinc-50 p-16 flex flex-col pt-40 overflow-y-auto">
        <header className="mb-32 px-4">
            <h1 className="text-[14rem] font-black text-zinc-950 tracking-tightest mb-4 leading-none inline-block border-b-[24px] border-zinc-950 pb-8 uppercase">Hedzup</h1>
            <p className="text-5xl text-zinc-400 font-bold uppercase tracking-[0.5em] mt-8 pl-4">Premium Play</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16 pb-64">
            {decks.map(d => (
                <div
                    key={d.id}
                    onClick={() => onSelect(d)}
                    className="group cursor-pointer bg-white p-16 rounded-[6rem] shadow-[0_30px_90px_rgba(0,0,0,0.06)] hover:shadow-[0_60px_120px_rgba(0,0,0,0.12)] transition-all duration-500 border border-zinc-50 flex items-center gap-16"
                >
                    <div className={`w-40 h-40 rounded-[4.5rem] bg-gradient-to-br ${d.gradient} flex items-center justify-center shadow-3xl group-hover:rotate-12 transition-all duration-700`}>
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
        <div className="fixed inset-0 bg-white flex flex-col items-center justify-center p-20 text-center animate-in fade-in duration-1000">
            <div className={`w-64 h-64 rounded-[6.5rem] bg-gradient-to-br ${deck.gradient} flex items-center justify-center shadow-3xl mb-24`}>
                {deck.icon}
            </div>
            <h2 className="text-8xl font-black text-zinc-950 mb-24 tracking-tightest uppercase">{deck.title}</h2>

            <div className="w-full max-w-4xl space-y-12 mb-32">
                <div className="flex items-center bg-zinc-50 p-14 rounded-[5.5rem] gap-12 border border-zinc-100 shadow-sm transition-all hover:scale-105 duration-500">
                    <div className="w-20 h-20 rounded-full bg-zinc-950 text-white flex items-center justify-center font-black text-4xl">1</div>
                    <span className="text-5xl font-black text-zinc-600">Forehead, Screen Out</span>
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
                <UI_Button onClick={handleAuth} className="bg-zinc-950 text-white py-12 shadow-3xl">START</UI_Button>
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
            <div style={{ transform: 'rotate(90deg)' }} className="text-center">
                <div className="text-[30rem] font-black text-white italic leading-none animate-pulse drop-shadow-[0_0_120px_rgba(255,255,255,0.4)]">
                    {counter > 0 ? counter : "GO!"}
                </div>
                <p className="text-white/20 text-6xl font-black uppercase tracking-[2em] mt-40 pl-12 white-space-nowrap">Place on forehead</p>
            </div>
        </div>
    );
};

const FinalStats = ({ stats, onMenu, onRepeat }) => (
    <div className="min-h-screen bg-zinc-50 flex flex-col p-24 overflow-y-auto">
        <header className="mb-32 text-center pt-32">
            <h1 className="text-[12rem] font-black text-zinc-950 tracking-tightest leading-none">THE RESULTS</h1>
            <div className="flex justify-center gap-48 mt-24">
                <div className="text-center">
                    <span className="text-[18rem] font-black text-green-500 block mb-6 leading-none tabular-nums">{stats.correct.length}</span>
                    <p className="text-2xl font-black text-zinc-400 uppercase tracking-widest leading-none">Correct</p>
                </div>
                <div className="text-center transform grayscale">
                    <span className="text-[18rem] font-black text-zinc-300 block mb-6 leading-none tabular-nums">{stats.skipped.length}</span>
                    <p className="text-2xl font-black text-zinc-400 uppercase tracking-widest leading-none">Skipped</p>
                </div>
            </div>
        </header>

        <div className="flex-1 space-y-12 mb-40 max-w-6xl mx-auto w-full">
            {[...stats.correct.map(c => ({ ...c, win: true })), ...stats.skipped.map(c => ({ ...c, win: false }))].map((item, i) => (
                <div key={i} className={`p-16 rounded-[6rem] flex items-center justify-between shadow-2xl transition-all duration-500 ${item.win ? 'bg-white border-green-50' : 'bg-zinc-50 opacity-60'}`}>
                    <span className="text-7xl font-black text-zinc-950 tracking-tightest leading-none uppercase">{item.text}</span>
                    <div className={`w-28 h-28 rounded-full flex items-center justify-center font-black text-5xl shadow-inner ${item.win ? 'bg-green-100 text-green-600' : 'bg-zinc-200 text-zinc-500'}`}>
                        {item.win ? '✓' : 'X'}
                    </div>
                </div>
            ))}
        </div>

        <div className="space-y-12 pb-64 mt-auto max-w-2xl mx-auto w-full">
            <UI_Button onClick={onRepeat} className="bg-zinc-950 text-white py-12 shadow-[0_40px_80px_rgba(0,0,0,0.4)]">PLAY AGAIN</UI_Button>
            <button onClick={onMenu} className="w-full text-zinc-400 font-bold p-16 hover:text-zinc-950 tracking-[1.2em] uppercase text-2xl transition-all">Main Menu</button>
        </div>
    </div>
);

// --- APP MASTER HUB ---
export default function App() {
    const [scene, setScene] = useState('menu');
    const [deck, setDeck] = useState(null);
    const [playlist, setPlaylist] = useState([]);
    const [stats, setStats] = useState({ correct: [], skipped: [] });
    const [authActive, setAuthActive] = useState(false);
    const [calibration, setCalibration] = useState({ gamma: 0 });

    const triggerSound = (type) => {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return;
        const ctx = new AC();
        const osc = ctx.createOscillator();
        const vol = ctx.createGain();
        osc.connect(vol); vol.connect(ctx.destination);
        const t = ctx.currentTime;

        if (type === 'success') {
            osc.frequency.setValueAtTime(850, t);
            osc.frequency.exponentialRampToValueAtTime(1900, t + 0.1);
            vol.gain.setValueAtTime(0.2, t);
            vol.gain.exponentialRampToValueAtTime(0.01, t + 0.2);
            osc.start(); osc.stop(t + 0.2);
        } else if (type === 'pass') {
            osc.frequency.setValueAtTime(450, t);
            osc.frequency.linearRampToValueAtTime(60, t + 0.35);
            vol.gain.setValueAtTime(0.2, t);
            vol.gain.exponentialRampToValueAtTime(0.01, t + 0.35);
            osc.start(); osc.stop(t + 0.35);
        } else if (type === 'finish') {
            osc.frequency.setValueAtTime(600, t);
            osc.frequency.exponentialRampToValueAtTime(1500, t + 0.6);
            vol.gain.setValueAtTime(0.2, t);
            vol.gain.linearRampToValueAtTime(0, t + 1.6);
            osc.start(); osc.stop(t + 1.6);
        }
    };

    const runGame = (d) => {
        setDeck(d);
        setPlaylist([...d.data].sort(() => Math.random() - 0.5));
        setScene('ready');
    };

    const stopGame = (results) => {
        setStats(results);
        triggerSound('finish');
        setScene('summary');
    };

    return (
        <div className="min-h-screen bg-zinc-50 font-sans selection:bg-zinc-200 touch-none select-none text-zinc-950 antialiased overflow-hidden">
            {scene === 'menu' && <MainMenu decks={DECKS} onSelect={runGame} />}
            {scene === 'ready' && <InstructionScreen deck={deck} onProceed={(ok) => { setAuthActive(ok); setScene('sync'); }} />}
            {scene === 'sync' && <CalibrationScreen active={authActive} onReady={(c) => { setCalibration(c); setScene('play'); }} />}
            {scene === 'play' && (
                <GameEngine
                    deck={deck}
                    cards={playlist}
                    onComplete={stopGame}
                    playHaptic={triggerSound}
                    baseline={calibration}
                />
            )}
            {scene === 'summary' && <FinalStats stats={stats} onMenu={() => setScene('menu')} onRepeat={() => runGame(deck)} />}
        </div>
    );
}
