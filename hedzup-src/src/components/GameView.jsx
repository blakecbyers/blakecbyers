import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Check, RotateCcw, X } from 'lucide-react';

export default function GameView({ deck, cards, currentIndex, setCurrentIndex, timer, setTimer, setResults, onFinish, playSound, motionActive, calibration }) {
    const [status, setStatus] = useState('active');
    const [isPortrait, setIsPortrait] = useState(window.innerHeight > window.innerWidth);

    // Safety check: if cards array is empty or index is out of bounds, avoid crashing
    const currentCard = (cards && cards.length > 0 && currentIndex < cards.length) ? cards[currentIndex] : null;

    const touchStartX = useRef(null);
    const touchStartY = useRef(null);
    const hasTriggeredRef = useRef(false); // New: prevent multi-trigger without return to neutral

    // Track orientation robustly
    useEffect(() => {
        const checkOrientation = () => setIsPortrait(window.innerHeight > window.innerWidth);
        window.addEventListener('resize', checkOrientation);
        checkOrientation(); // Initial check
        return () => window.removeEventListener('resize', checkOrientation);
    }, []);

    // Timer Logic
    useEffect(() => {
        if (timer <= 0) {
            // Game Over
            if (currentCard) {
                setResults(prev => ({ ...prev, skipped: [...prev.skipped, currentCard.text] }));
            }
            onFinish();
            return;
        }

        const interval = setInterval(() => {
            setTimer((t) => t - 1);
            if (timer <= 6 && timer > 1) playSound('tick');
        }, 1000);
        return () => clearInterval(interval);
    }, [timer, onFinish, playSound, currentCard, setResults, setTimer]);
    // Note: added setResults, setTimer to deps for linter correctness,
    // though they are stable from parent.

    const handlePass = useCallback(() => {
        if (status !== 'active' || !currentCard) return;
        setStatus('pass');
        playSound('pass');
        setResults(prev => ({ ...prev, skipped: [...prev.skipped, currentCard.text] }));
        setTimeout(() => {
            if (currentIndex < cards.length - 1) {
                setCurrentIndex(c => c + 1);
                setStatus('active');
                hasTriggeredRef.current = false; // Reset trigger lock
            } else {
                onFinish();
            }
        }, 800);
    }, [status, cards, currentIndex, setResults, setCurrentIndex, onFinish, playSound, currentCard]);

    const handleCorrect = useCallback(() => {
        if (status !== 'active' || !currentCard) return;
        setStatus('correct');
        playSound('success');
        setResults(prev => ({ ...prev, correct: [...prev.correct, currentCard.text] }));
        setTimeout(() => {
            if (currentIndex < cards.length - 1) {
                setCurrentIndex(c => c + 1);
                setStatus('active');
                hasTriggeredRef.current = false; // Reset trigger lock
            } else {
                onFinish();
            }
        }, 800);
    }, [status, cards, currentIndex, setResults, setCurrentIndex, onFinish, playSound, currentCard]);

    // --- TILT LOGIC ---
    useEffect(() => {
        if (!motionActive) return;

        let lastActionTime = 0;
        const ACTION_COOLDOWN = 500; // Shorter cooldown, rely on "Neutral" reset

        const handleOrientation = (event) => {
            if (status !== 'active') return;

            const now = performance.now();
            // Basic debounce
            if (now - lastActionTime < ACTION_COOLDOWN) return;

            const { beta, gamma } = event;
            if (beta === null || gamma === null) return;

            // Robust Orientation Check
            let tiltValue = 0;
            let calibrationValue = 0;

            if (isPortrait) {
                tiltValue = gamma;
                calibrationValue = calibration.gamma || 0;
            } else {
                tiltValue = beta;
                calibrationValue = calibration.beta || 0;
            }

            // Calculate Delta
            const delta = tiltValue - calibrationValue;

            // THRESHOLDS
            const TRIGGER_THRESHOLD = 35;
            const NEUTRAL_THRESHOLD = 10; // Reduced from 15 for faster reset

            // RESET LOGIC:
            if (hasTriggeredRef.current) {
                // If we are locked, we only unlock if we return to neutral
                if (Math.abs(delta) < NEUTRAL_THRESHOLD) {
                    hasTriggeredRef.current = false;
                }
                return; // Stop here if locked
            }

            // TRIGGER LOGIC:
            if (delta > TRIGGER_THRESHOLD) {
                lastActionTime = now;
                hasTriggeredRef.current = true;
                handleCorrect();
            } else if (delta < -TRIGGER_THRESHOLD) {
                lastActionTime = now;
                hasTriggeredRef.current = true;
                handlePass();
            }
        };

        window.addEventListener('deviceorientation', handleOrientation);
        return () => window.removeEventListener('deviceorientation', handleOrientation);
    }, [motionActive, status, handleCorrect, handlePass, calibration, isPortrait]);

    // --- SWIPE LOGIC ---
    const onTouchStart = (e) => {
        touchStartX.current = e.touches[0].clientX;
        touchStartY.current = e.touches[0].clientY;
    };

    const onTouchEnd = (e) => {
        if (!touchStartX.current || !touchStartY.current) return;
        const diffX = e.changedTouches[0].clientX - touchStartX.current;
        const diffY = e.changedTouches[0].clientY - touchStartY.current;

        // Determine swipe based on isPortrait?
        // Actually, swipe is always relative to screen coordinates.
        // Swipe "Right" on screen -> Correct.
        // Swipe "Left" on screen -> Pass.

        if (Math.abs(diffX) > Math.abs(diffY)) {
            // Horizontal Swipe
            if (Math.abs(diffX) > 50) {
                if (diffX > 0) handleCorrect(); // Right
                else handlePass(); // Left
            }
        }
        touchStartX.current = null;
        touchStartY.current = null;
    };

    let bgClass = "bg-zinc-900";
    let cardClass = "opacity-100 scale-100 translate-y-0";

    if (status === 'correct') {
        bgClass = "bg-[#34C759]";
        cardClass = "opacity-0 translate-y-[120%] rotate-6";
    } else if (status === 'pass') {
        bgClass = "bg-[#FF9500]";
        cardClass = "opacity-0 translate-y-[-120%] -rotate-6";
    }

    // Styles for rotation
    const containerStyle = isPortrait
        ? {
            transform: 'rotate(90deg)', transformOrigin: 'center center',
            width: '100vh', height: '100vw',
            position: 'absolute', top: '50%', left: '50%',
            marginLeft: '-50vh', marginTop: '-50vw',
        }
        : { width: '100%', height: '100%' };

    const cardStyle = isPortrait
        ? "w-[85vh] h-[80vw]"
        : "w-[80vw] h-[70vh]";

    // Dynamic Text Sizing Logic based on length
    const getFontSize = (text) => {
        const len = text?.length || 0;
        if (len < 5) return 'text-[8rem] md:text-[10rem]';
        if (len < 12) return 'text-7xl md:text-9xl';
        if (len < 20) return 'text-5xl md:text-7xl';
        return 'text-4xl md:text-6xl'; // Very long text
    };

    return (
        <div className={`fixed inset-0 z-50 flex flex-col transition-colors duration-500 ease-out ${bgClass} overflow-hidden`}>
            <div
                style={containerStyle}
                className="relative flex flex-col items-center justify-center w-full h-full"
                onTouchStart={onTouchStart}
                onTouchEnd={onTouchEnd}
            >
                {/* Timer Display */}
                <div className={`absolute z-20 ${isPortrait ? 'top-8 left-1/2 -translate-x-1/2' : 'top-6 left-1/2 -translate-x-1/2'}`}>
                    <div className="bg-white/20 backdrop-blur-md px-6 py-2 rounded-full border border-white/20">
                        <span className="font-mono text-3xl font-bold text-white tracking-widest">{timer}</span>
                    </div>
                </div>

                {/* Card */}
                <div className={`transform transition-all duration-500 ease-out ${cardClass} ${cardStyle} bg-white rounded-[3rem] shadow-2xl flex items-center justify-center p-8 text-center relative mx-auto my-auto overflow-hidden`}>
                    {status === 'active' && currentCard ? (
                        <div className="flex flex-col items-center justify-center h-full w-full max-w-full px-4">
                            {/* Optional Image */}
                            {currentCard?.type === 'country' && currentCard?.code && (
                                <img
                                    src={`https://raw.githubusercontent.com/djaiss/mapsicon/master/all/${currentCard.code}/vector.svg`}
                                    alt="country shape"
                                    className="w-48 h-48 md:w-64 md:h-64 object-contain mb-6 opacity-90 flex-shrink-0"
                                    onError={(e) => { e.target.style.display = 'none'; }}
                                />
                            )}

                            {/* Text */}
                            <div className="flex flex-col items-center w-full justify-center flex-1 min-h-0 overflow-hidden">
                                <h2 className={`font-black tracking-tighter text-zinc-900 leading-[0.9] break-words text-center w-full
                                    ${getFontSize(currentCard?.text)}`}
                                    style={{ overflowWrap: 'break-word', wordBreak: 'break-word' }}
                                >
                                    {currentCard?.text || "..."}
                                </h2>
                                {currentCard?.type === 'country' && (
                                    <p className="mt-4 text-zinc-400 text-xl font-bold uppercase tracking-widest flex-shrink-0">Country</p>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="text-zinc-300 font-black text-4xl uppercase italic">
                            {cards && cards.length === 0 ? "No Cards!" : "Ready?"}
                        </div>
                    )}

                    {/* Touch Areas (Invisible) */}
                    {status === 'active' && (
                        <>
                            <div onClick={handlePass} className="absolute inset-y-0 left-0 w-32 z-20 cursor-pointer" />
                            <div onClick={handleCorrect} className="absolute inset-y-0 right-0 w-32 z-20 cursor-pointer" />
                        </>
                    )}
                </div>

                {/* Feedback Icons */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
                    {status === 'correct' && <Check size={200} className="text-white/20 animate-ping duration-700" />}
                    {status === 'pass' && <RotateCcw size={200} className="text-white/20 animate-ping duration-700" />}
                </div>
            </div>
        </div>
    );
}
