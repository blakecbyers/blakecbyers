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

    // --- TILT LOGIC (Latched) ---
    useEffect(() => {
        if (!motionActive) return;

        const handleOrientation = (event) => {
            const { beta, gamma } = event;
            if (beta === null || gamma === null) return;

            // --- UNIVERSAL LANDSCAPE TILT LOGIC ---
            // Whether "Native Landscape" or "Forced Portrait", the user is holding the phone
            // such that the Long Edge is horizontal.
            // In this position, "Bowing Head" (Tilt Down) is ROTATION AROUND THE LONG AXIS.
            // This is ALWAYS GAMMA.

            // The only variable is the SIGN of Gamma, which depends on handedness (Home Button Left vs Right).
            // obtaining 'beta' (Gravity on Short Axis) tells us which way is "Down" for the short edge.

            // IF phone is vertical (on forehead):
            // - Home Button Right: X-axis points DOWN. Gravity is +90 on Beta.
            // - Home Button Left: X-axis points UP. Gravity is -90 on Beta.

            // We can detect handedness from Beta.

            const isHomeButtonRight = beta > 0; // Approx +90

            // IF Home Button RIGHT:
            // - Y-axis points LEFT.
            // - Tilt Down (Screen to floor): Right side of phone (Bottom) goes UP? Top goes DOWN.
            // - "Right" (Bottom) Up = Negative Gamma? (Usually Right Down is Positive).
            // - So Tilt Down is NEGATIVE Gamma?
            // Let's rely on relative change from calibration.

            // Calibrated Delta
            const rawDelta = gamma - (calibration.gamma || 0);

            // We need to flip the sign if Home Button is LEFT (Beta < 0).
            // Hypothesis:
            // Home Right (Beta > 0): Tilt Down is -Delta?
            // Home Left (Beta < 0): Tilt Down is +Delta?

            // Let's normalize Delta so POSITIVE means TILT DOWN.
            // If Beta > 0 (Home Right), we invert?
            // Let's assume standard right-hand rule.
            // Actually, let's just reverse one.

            let normalizedDelta = rawDelta;
            if (!isHomeButtonRight) {
                normalizedDelta = -rawDelta;
            }

            // WAIT. If I am in "Native Landscape", browser might have already flipped Gamma?
            // No, deviceorientation is raw (usually).
            // So this logic holds for both.

            // TUNED THRESHOLDS
            const THRESHOLD = 35;
            const NEUTRAL_THRESHOLD = 20;

            if (Math.abs(normalizedDelta) < NEUTRAL_THRESHOLD) {
                isLocked.current = false;
            }

            if (status !== 'active' || isLocked.current) return;

            // Logic:
            // Delta > THRESHOLD => DOWN => CORRECT
            // Delta < -THRESHOLD => UP => SKIP
            // Note: I might have the sign flip wrong, but based on "Home Right = Negative",
            // if I flip Home Left, then "Home Right" path is default.
            // Let's try:
            // If Beta > 0 (Home Right), Tilt Down = Negative Gamma.
            // So we want normalizedDelta to be Positive for Correct.
            // So normalizedDelta = -rawDelta.

            let finalDelta = 0;
            if (beta > 0) {
                // Home Right
                finalDelta = -rawDelta;
            } else {
                // Home Left
                finalDelta = rawDelta;
            }

            if (finalDelta > THRESHOLD) {
                isLocked.current = true;
                handleCorrect();
            } else if (finalDelta < -THRESHOLD) {
                isLocked.current = true;
                handlePass();
            }
        };

        window.addEventListener('deviceorientation', handleOrientation);
        return () => window.removeEventListener('deviceorientation', handleOrientation);
    }, [motionActive, status, handleCorrect, handlePass, calibration, isPortrait]);

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
        <div className={`flex flex-col transition-colors duration-500 ease-out ${bgClass} overflow-hidden ${containerStyle}`}>
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
                </div>

                {/* Touch Overrides for Debugging/Accessibility */}
                {status === 'active' && (
                    <div className="absolute inset-0 flex pointer-events-none">
                        <div onClick={handlePass} className="w-1/4 h-full pointer-events-auto" />
                        <div className="flex-1" />
                        <div onClick={handleCorrect} className="w-1/4 h-full pointer-events-auto" />
                    </div>
                )}

                {/* Background Visual Feedback */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
                    {status === 'correct' && <div className="absolute inset-0 bg-white/10 animate-pulse" />}
                    {status === 'pass' && <div className="absolute inset-0 bg-white/10 animate-pulse" />}
                </div>
            </div>
        </div>
    );
}
