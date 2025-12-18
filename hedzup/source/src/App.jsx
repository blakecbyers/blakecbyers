import React, { useState, useEffect, useRef, useCallback } from 'react';
import { DECKS } from './data/decks';

// --- SHARED UI ---
const Button = ({ onClick, children, className = "" }) => (
    <button onClick={onClick} className={`w-full py-5 font-black rounded-[2.5rem] active:scale-95 transition-all shadow-xl hover:shadow-2xl text-2xl tracking-tight ${className}`}>
        {children}
    </button>
);

// --- GAMEPLAY COMPONENT ---
const Gameplay = ({ deck, cards, onFinish, playSound, motionActive, calibration }) => {
    const [status, setStatus] = useState('active'); // active, correct, pass
    const [currentIndex, setCurrentIndex] = useState(0);
    const [stats, setStats] = useState({ correct: [], skipped: [] });
    const [timer, setTimer] = useState(60);

    const currentCard = cards[currentIndex] || null;
    const physics = useRef({ tilt: 0, state: 'NEUTRAL' });

    // Move to next card or finish
    const handleAction = useCallback((type) => {
        if (status !== 'active') return;

        playSound(type === 'correct' ? 'success' : 'pass');
        setStatus(type);

        const newStats = { ...stats };
        if (type === 'correct') newStats.correct = [...newStats.correct, currentCard];
        else newStats.skipped = [...newStats.skipped, currentCard];
        setStats(newStats);

        setTimeout(() => {
            if (currentIndex + 1 >= cards.length) {
                onFinish(newStats);
            } else {
                setCurrentIndex(prev => prev + 1);
                setStatus('active');
            }
        }, 500); // Super snappy transitions
    }, [status, currentIndex, cards, currentCard, stats, playSound, onFinish]);

    // Robust Tilt Sensor
    useEffect(() => {
        if (!motionActive) return;

        const processOrientation = (e) => {
            const { beta } = e;
            if (beta === null) return;

            // 1. Calculate relative tilt with 180-deg wrap handling
            let delta = beta - (calibration.beta || 0);
            if (delta > 180) delta -= 360;
            if (delta < -180) delta += 360;

            // 2. Low-pass filter (smoothing)
            physics.current.tilt = physics.current.tilt + 0.25 * (delta - physics.current.tilt);
            const val = physics.current.tilt;

            if (status !== 'active') return;

            // Thresholds: Tilt Down (>45) = Correct, Tilt Up (<-45) = Pass
            if (physics.current.state === 'NEUTRAL') {
                if (val > 45) {
                    physics.current.state = 'TRIGGERED';
                    handleAction('correct');
                } else if (val < -45) {
                    physics.current.state = 'TRIGGERED';
                    handleAction('pass');
                }
            } else if (Math.abs(val) < 20) {
                physics.current.state = 'NEUTRAL';
            }
        };

        window.addEventListener('deviceorientation', processOrientation);
        return () => window.removeEventListener('deviceorientation', processOrientation);
    }, [motionActive, status, calibration, handleAction]);

    // Timer
    useEffect(() => {
        if (timer <= 0) {
            onFinish(stats);
            return;
        }
        const interval = setInterval(() => setTimer(t => t - 1), 1000);
        return () => clearInterval(interval);
    }, [timer, onFinish, stats]);

    // Enhanced Swipe Support
    const touch = useRef({ y: 0, time: 0 });
    const onStart = (e) => { touch.current = { y: e.touches[0].clientY, time: Date.now() }; };
    const onEnd = (e) => {
        const deltaY = e.changedTouches[0].clientY - touch.current.y;
        const duration = Date.now() - touch.current.time;
        // Require significant swipe distance and speed
        if (Math.abs(deltaY) > 60 && duration < 300) {
            handleAction(deltaY > 0 ? 'correct' : 'pass');
        }
    };

    const bg = status === 'correct' ? 'bg-green-500' : status === 'pass' ? 'bg-orange-500' : 'bg-zinc-950';

    return (
        <div className={`fixed inset-0 flex items-center justify-center transition-colors duration-300 ${bg} touch-none`} onTouchStart={onStart} onTouchEnd={onEnd}>
            {/* AUDIENCE ORIENTATION (Locked at -90deg) */}
            <div style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }} className="relative flex flex-col items-center justify-center w-[100vh] h-[100vw]">

                {/* Timer: Ultra High Visibility */}
                <div className="absolute top-10 left-10 bg-black px-12 py-6 rounded-[2.5rem] shadow-2xl z-50 animate-in zoom-in duration-300">
                    <span className="font-mono text-7xl font-black text-white leading-none tabular-nums">{timer}</span>
                </div>

                {/* THE CARD */}
                <div className={`
                    w-[88%] h-[78%] bg-white rounded-[5rem] shadow-[0_60px_120px_-20px_rgba(0,0,0,0.6)] flex flex-col items-center justify-center p-12 text-center
                    transition-all duration-300 transform
                    ${status !== 'active' ? 'opacity-0 scale-95 translate-y-10' : 'opacity-100 scale-100 translate-y-0'}
                `}>
                    {currentCard?.type === 'country' && currentCard?.code && (
                        <img
                            src={`https://raw.githubusercontent.com/djaiss/mapsicon/master/all/${currentCard.code}/vector.svg`}
                            className="w-56 h-56 mb-12 object-contain filter drop-shadow-xl"
                            alt="flag"
                        />
                    )}

                    <h1 className={`${currentCard?.text.length > 12 ? 'text-6xl' : 'text-8xl'} md:text-9xl font-black text-zinc-950 tracking-tighter leading-tight`}>
                        {currentCard?.text}
                    </h1>

                    <div className="mt-14 opacity-20 text-4xl font-black uppercase tracking-[0.6em] text-zinc-900">
                        {currentCard?.type === 'country' ? 'Country' : deck.title}
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- SCENE COMPONENTS ---

const MenuScene = ({ onSelect }) => (
    <div className="min-h-screen bg-zinc-50 p-8 flex flex-col pt-24 overflow-y-auto">
        <header className="mb-16">
            <h1 className="text-8xl font-black text-zinc-950 tracking-tightest mb-4">Hedzup</h1>
            <p className="text-2xl text-zinc-400 font-bold uppercase tracking-widest pl-1">Choose a category</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-24">
            {DECKS.map(deck => (
                <div
                    key={deck.id}
                    onClick={() => onSelect(deck)}
                    className="group cursor-pointer bg-white p-10 rounded-[4rem] shadow-xl hover:shadow-2xl hover:scale-[1.03] transition-all border border-zinc-100 flex items-center gap-8"
                >
                    <div className={`w-28 h-28 rounded-[3rem] bg-gradient-to-br ${deck.gradient} flex items-center justify-center shadow-lg transition-transform group-hover:rotate-12`}>
                        {deck.icon}
                    </div>
                    <div>
                        <h3 className="text-4xl font-black text-zinc-950 mb-2">{deck.title}</h3>
                        <p className="text-zinc-400 font-black uppercase text-xs tracking-widest opacity-80">{deck.description}</p>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

const ReadyScene = ({ deck, onStart }) => {
    const handleAuth = async () => {
        if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
            try {
                const res = await DeviceOrientationEvent.requestPermission();
                onStart(res === 'granted');
            } catch (e) { onStart(false); }
        } else { onStart(true); }
    };

    return (
        <div className="fixed inset-0 bg-white flex flex-col items-center justify-center p-12 text-center animate-in fade-in duration-500">
            <div className={`w-40 h-40 rounded-[4rem] bg-gradient-to-br ${deck.gradient} flex items-center justify-center shadow-2xl mb-12`}>
                {deck.icon}
            </div>
            <h2 className="text-5xl font-black text-zinc-950 mb-12">{deck.title}</h2>

            <div className="w-full max-w-md space-y-6 mb-16">
                <div className="flex items-center bg-zinc-50 p-8 rounded-[3rem] gap-6 border border-zinc-100">
                    <div className="w-12 h-12 rounded-full bg-zinc-950 text-white flex items-center justify-center font-black text-xl">1</div>
                    <span className="text-2xl font-black text-zinc-600">Forehead, Screen Out</span>
                </div>
                <div className="flex items-center bg-green-50 p-8 rounded-[3rem] gap-6 border border-green-100">
                    <div className="w-12 h-12 rounded-full bg-green-500 text-white flex items-center justify-center font-black text-xl">✓</div>
                    <span className="text-2xl font-black text-green-700">Tilt Down = Correct</span>
                </div>
                <div className="flex items-center bg-orange-50 p-8 rounded-[3rem] gap-6 border border-orange-100">
                    <div className="w-12 h-12 rounded-full bg-orange-500 text-white flex items-center justify-center font-black text-xl">X</div>
                    <span className="text-2xl font-black text-orange-700">Tilt Up = Pass</span>
                </div>
            </div>

            <div className="w-full max-w-xs">
                <Button onClick={handleAuth} className="bg-zinc-950 text-white text-3xl py-6">START</Button>
            </div>
        </div>
    );
};

const SyncScene = ({ onReady, motionActive }) => {
    const [seconds, setSeconds] = useState(3);
    const calRef = useRef({ beta: 0 });

    useEffect(() => {
        const track = (e) => { if (e.beta !== null) calRef.current = { beta: e.beta }; };
        if (motionActive) window.addEventListener('deviceorientation', track);

        if (seconds > 0) {
            const t = setTimeout(() => setSeconds(seconds - 1), 1000);
            return () => { clearTimeout(t); window.removeEventListener('deviceorientation', track); };
        } else {
            onReady(calRef.current);
        }
    }, [seconds, onReady, motionActive]);

    return (
        <div className="fixed inset-0 bg-zinc-950 flex items-center justify-center z-[100] p-10">
            <div style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }} className="text-center">
                <div className="text-[18rem] font-black text-white italic leading-none animate-bounce">
                    {seconds > 0 ? seconds : "GO!"}
                </div>
                <p className="text-white/20 text-3xl font-black uppercase tracking-[1em] mt-16 pl-4 whitespace-nowrap">Calibrating...</p>
            </div>
        </div>
    );
};

const SummaryScene = ({ stats, onHome, onPlayAgain }) => (
    <div className="min-h-screen bg-zinc-50 flex flex-col p-10 overflow-y-auto">
        <header className="mb-16 text-center pt-16">
            <h1 className="text-8xl font-black text-zinc-950 tracking-tighter">Summary</h1>
            <div className="flex justify-center gap-16 mt-12">
                <div className="text-center">
                    <span className="text-8xl font-black text-green-500 block mb-2">{stats.correct.length}</span>
                    <p className="text-xs font-black text-zinc-400 uppercase tracking-widest">Correct</p>
                </div>
                <div className="text-center">
                    <span className="text-8xl font-black text-orange-500 block mb-2">{stats.skipped.length}</span>
                    <p className="text-xs font-black text-zinc-400 uppercase tracking-widest">Skipped</p>
                </div>
            </div>
        </header>

        <div className="flex-1 space-y-6 mb-20 max-w-2xl mx-auto w-full">
            {[...stats.correct.map(c => ({ ...c, hit: true })), ...stats.skipped.map(c => ({ ...c, hit: false }))].map((item, i) => (
                <div key={i} className="bg-white p-8 rounded-[3rem] flex items-center justify-between shadow-sm border border-zinc-100">
                    <span className="text-4xl font-black text-zinc-900 tracking-tight leading-none">{item.text}</span>
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center font-black text-2xl ${item.hit ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                        {item.hit ? '✓' : 'X'}
                    </div>
                </div>
            ))}
        </div>

        <div className="space-y-6 pb-24 mt-auto max-w-md mx-auto w-full">
            <Button onClick={onPlayAgain} className="bg-zinc-950 text-white py-6">PLAY AGAIN</Button>
            <button onClick={onHome} className="w-full text-zinc-400 font-bold p-8 hover:text-zinc-600 tracking-[0.4em] uppercase text-sm">Main Menu</button>
        </div>
    </div>
);

// --- APP HUB ---
export default function App() {
    const [scene, setScene] = useState('menu');
    const [deck, setDeck] = useState(null);
    const [cards, setCards] = useState([]);
    const [stats, setStats] = useState({ correct: [], skipped: [] });
    const [motionActive, setMotionActive] = useState(false);
    const [calibration, setCalibration] = useState({ beta: 0 });

    const playAudio = (type) => {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        const t = ctx.currentTime;

        if (type === 'success') {
            osc.frequency.setValueAtTime(600, t);
            osc.frequency.exponentialRampToValueAtTime(1400, t + 0.1);
            gain.gain.setValueAtTime(0.1, t);
            gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);
            osc.start(); osc.stop(t + 0.2);
        } else if (type === 'pass') {
            osc.frequency.setValueAtTime(400, t);
            osc.frequency.linearRampToValueAtTime(100, t + 0.3);
            gain.gain.setValueAtTime(0.1, t);
            gain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);
            osc.start(); osc.stop(t + 0.3);
        } else if (type === 'finish') {
            osc.frequency.setValueAtTime(500, t);
            osc.frequency.exponentialRampToValueAtTime(1000, t + 0.5);
            gain.gain.setValueAtTime(0.1, t);
            gain.gain.linearRampToValueAtTime(0, t + 1);
            osc.start(); osc.stop(t + 1);
        }
    };

    const prepare = (d) => {
        setDeck(d);
        setCards([...d.data].sort(() => Math.random() - 0.5));
        setScene('ready');
    };

    const complete = (results) => {
        setStats(results);
        playAudio('finish');
        setScene('summary');
    };

    return (
        <div className="min-h-screen bg-zinc-50 font-sans selection:bg-orange-100 touch-none select-none text-zinc-950 transition-all duration-700 antialiased">
            {scene === 'menu' && <MenuScene onSelect={prepare} />}
            {scene === 'ready' && <ReadyScene deck={deck} onStart={(active) => { setMotionActive(active); setScene('sync'); }} />}
            {scene === 'sync' && <SyncScene motionActive={motionActive} onReady={(cal) => { setCalibration(cal); setScene('play'); }} />}
            {scene === 'play' && (
                <Gameplay
                    deck={deck}
                    cards={cards}
                    onFinish={complete}
                    playSound={playAudio}
                    motionActive={motionActive}
                    calibration={calibration}
                />
            )}
            {scene === 'summary' && <SummaryScene stats={stats} onHome={() => setScene('menu')} onPlayAgain={() => prepare(deck)} />}
        </div>
    );
}
