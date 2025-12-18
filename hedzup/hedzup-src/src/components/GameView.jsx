import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Check, RotateCcw, Smartphone } from 'lucide-react';

export default function GameView({ deck, cards, currentIndex, setCurrentIndex, timer, setTimer, setResults, onFinish, playSound, motionActive, calibration, isPortrait }) {
    const [status, setStatus] = useState('active');
    const currentCard = cards[currentIndex];
    const isLocked = useRef(false);

    useEffect(() => {
        if (timer <= 0) {
            setResults(prev => ({ ...prev, skipped: [...prev.skipped, currentCard.text] }));
            onFinish();
            return;
        }
        // Pause timer if looking at "Rotate Phone" screen? Maybe not, keep pressure on!
        // Actually for fairness, we should probably pause if isPortrait is true.
        if (isPortrait) return;

        const interval = setInterval(() => {
            setTimer((t) => t - 1);
            if (timer <= 5) playSound('tick');
        }, 1000);
        return () => clearInterval(interval);
    }, [timer, onFinish, playSound, currentCard, isPortrait]);

    const handlePass = useCallback(() => {
        if (status !== 'active') return;
        setStatus('pass');
        playSound('pass');
        setResults(prev => ({ ...prev, skipped: [...prev.skipped, currentCard.text] }));
        setTimeout(() => {
            if (currentIndex < cards.length - 1) {
                setCurrentIndex(c => c + 1);
                setStatus('active');
            } else {
                onFinish();
            }
        }, 600);
    }, [status, cards, currentIndex, setResults, setCurrentIndex, onFinish, playSound, currentCard]);

    const handleCorrect = useCallback(() => {
        if (status !== 'active') return;
        setStatus('correct');
        playSound('success');
        setResults(prev => ({ ...prev, correct: [...prev.correct, currentCard.text] }));
        setTimeout(() => {
            if (currentIndex < cards.length - 1) {
                setCurrentIndex(c => c + 1);
                setStatus('active');
            } else {
                onFinish();
            }
        }, 600);
    }, [status, cards, currentIndex, setResults, setCurrentIndex, onFinish, playSound, currentCard]);

    // --- ROBUST TILT LOGIC (Rethink) ---
    const lastTiltType = useRef('neutral'); // 'neutral', 'correct', or 'pass'

    useEffect(() => {
        if (!motionActive) return;

        const handleOrientation = (event) => {
            const { beta, gamma } = event;
            if (beta === null || gamma === null) return;

            // 1. Determine Handedness & Base Orientation from Calibration
            const startBeta = calibration.beta || 0;
            const isHomeButtonRight = startBeta > 0;

            // 2. Calculate Stable Pitch
            // When held in Landscape, "Nodding" (Tilt Down/Up) is usually gamma-dominant.
            // BUT near vertical (90 deg), gamma flips or gets erratic.
            // We use a blend or conditional logic.

            let currentTilt = 0;
            if (isHomeButtonRight) {
                // Home Button Right: beta ~ 90. Gamma runs from -90 to 90.
                // Tilting DOWN (chin to chest) usually makes the top of the phone move forward.
                currentTilt = -(gamma - (calibration.gamma || 0));
            } else {
                // Home Button Left: beta ~ -90.
                currentTilt = (gamma - (calibration.gamma || 0));
            }

            // 3. Thresholds & Hysteresis (State Machine)
            const TRIGGER_THRESHOLD = 40;
            const NEUTRAL_ZONE = 15; // Must return to < 15 deg to reset

            // State Machine Logic
            if (Math.abs(currentTilt) < NEUTRAL_ZONE) {
                if (lastTiltType.current !== 'neutral') {
                    lastTiltType.current = 'neutral';
                    isLocked.current = false;
                }
            }

            if (status !== 'active' || isLocked.current) return;

            if (currentTilt > TRIGGER_THRESHOLD) {
                // TILT DOWN -> CORRECT
                isLocked.current = true;
                lastTiltType.current = 'correct';
                handleCorrect();
            } else if (currentTilt < -TRIGGER_THRESHOLD) {
                // TILT UP -> PASS
                isLocked.current = true;
                lastTiltType.current = 'pass';
                handlePass();
            }
        };

        window.addEventListener('deviceorientation', handleOrientation);
        return () => window.removeEventListener('deviceorientation', handleOrientation);
    }, [motionActive, status, handleCorrect, handlePass, calibration, isPortrait]);

    // --- SWIPE LOGIC ---
    const touchStartX = useRef(null);
    const touchStartY = useRef(null);

    const onTouchStart = (e) => {
        touchStartX.current = e.touches[0].clientX;
        touchStartY.current = e.touches[0].clientY;
    };

    const onTouchEnd = (e) => {
        if (!touchStartX.current || !touchStartY.current) return;
        const diffX = e.changedTouches[0].clientX - touchStartX.current;
        const diffY = e.changedTouches[0].clientY - touchStartY.current;

        if (Math.max(Math.abs(diffX), Math.abs(diffY)) > 50) {
            if (isPortrait) {
                // In Portrait (which is rotated 90deg), X and Y are flipped relative to visual up/down
                // Actually, since we rotate the container, local swipes might be easier.
                // Let's use the same logic as the legacy code provided.
                if (Math.abs(diffX) > Math.abs(diffY)) {
                    if (diffX > 0) handleCorrect(); // Right -> Correct
                    else handlePass(); // Left -> Pass
                } else {
                    if (diffY > 0) handleCorrect(); // Down -> Correct
                    else handlePass(); // Up -> Pass
                }
            } else {
                if (Math.abs(diffX) > Math.abs(diffY)) {
                    if (diffX > 0) handleCorrect();
                    else handlePass();
                } else {
                    if (diffY > 0) handleCorrect();
                    else handlePass();
                }
            }
        }
        touchStartX.current = null;
        touchStartY.current = null;
    };

    // --- STYLES ---
    let bgClass = "bg-zinc-900";
    let cardClass = "opacity-100 scale-100 translate-y-0";

    if (status === 'correct') {
        bgClass = "bg-[#34C759]"; // iOS Green
        cardClass = "opacity-0 translate-y-[120%] rotate-6";
    } else if (status === 'pass') {
        bgClass = "bg-[#FF9500]"; // iOS Orange
        cardClass = "opacity-0 translate-y-[-120%] -rotate-6";
    }

    // Force Landscape Layout
    const containerStyle = isPortrait
        ? "fixed inset-0 z-50 w-[100dvh] h-[100dvw] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-90"
        : "fixed inset-0 z-50 w-full h-full landscape:p-safe";

    return (
        <div className={`flex flex-col transition-colors duration-500 ease-out ${bgClass} overflow-hidden ${containerStyle}`}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}>
            {/* The Main Stage */}
            <div className="relative flex flex-col w-full h-full items-center justify-center p-4">

                {/* HUD */}
                <div className="absolute top-0 left-0 w-full p-safe pt-4 px-6 flex justify-between items-center z-10 text-white/90">
                    <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10">
                        <span className="font-mono text-lg font-bold tracking-wider">{timer}</span>
                    </div>
                    <div className="font-semibold text-sm opacity-80 uppercase tracking-widest truncate max-w-[200px]">
                        {deck.title}
                    </div>
                </div>

                {/* The Card */}
                <div className={`transform transition-all duration-500 ease-out ${cardClass} w-full max-w-[80%] h-[70%] bg-white rounded-[2rem] shadow-2xl flex items-center justify-center p-8 text-center relative overflow-hidden`}>
                    {status === 'active' ? (
                        <div className="flex items-center justify-center h-full w-full space-x-8">
                            {/* Country Shape Logic */}
                            {currentCard.type === 'country' && (
                                <img
                                    src={`https://raw.githubusercontent.com/djaiss/mapsicon/master/all/${currentCard.code}/vector.svg`}
                                    alt="country shape"
                                    className="w-32 h-32 md:w-48 md:h-48 object-contain opacity-80 flex-shrink-0"
                                    onError={(e) => { e.target.style.display = 'none'; }}
                                />
                            )}

                            <div className="flex flex-col items-center justify-center min-w-0">
                                <h2 className="text-[12vmin] font-black tracking-tighter text-zinc-900 leading-none break-words uppercase">
                                    {currentCard.text}
                                </h2>
                                {currentCard.type === 'country' && (
                                    <p className="mt-4 text-zinc-400 text-[3vmin] font-bold tracking-widest uppercase">Country</p>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center">
                            {status === 'correct' && <Check size={120} className="text-[#34C759] animate-in zoom-in duration-300" />}
                            {status === 'pass' && <RotateCcw size={120} className="text-[#FF9500] animate-in zoom-in duration-300" />}
                        </div>
                    )}

                    {/* Hint labels matching legacy look */}
                    <div className="absolute bottom-8 w-full px-12 flex justify-between text-zinc-300 text-[1.5vmin] font-bold uppercase tracking-widest opacity-40">
                        <span>Pass (Tilt Up/Swipe)</span>
                        <span>Correct (Tilt Down/Swipe)</span>
                    </div>
                </div>

                {/* Fallback Taps */}
                {status === 'active' && (
                    <div className="absolute inset-0 flex pointer-events-none">
                        <div onClick={handlePass} className="w-1/4 h-full pointer-events-auto" />
                        <div className="flex-1" />
                        <div onClick={handleCorrect} className="w-1/4 h-full pointer-events-auto" />
                    </div>
                )}

                {/* Background Visual Feedback (Legacy Pings) */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
                    {status === 'correct' && <Check size={180} className="text-white/20 animate-ping" />}
                    {status === 'pass' && <RotateCcw size={180} className="text-white/20 animate-ping" />}
                </div>
            </div>
        </div>
    );
}
