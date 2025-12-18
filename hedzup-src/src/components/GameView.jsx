import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Check, RotateCcw, X } from 'lucide-react';

export default function GameView({ deck, cards, currentIndex, setCurrentIndex, timer, setTimer, setResults, onFinish, playSound, motionActive, calibration }) {
    const [status, setStatus] = useState('active');
    const [isPortrait, setIsPortrait] = useState(false);
    const currentCard = cards[currentIndex];
    // Logic for swipe
    const touchStartX = useRef(null);
    const touchStartY = useRef(null);

    // Logic for tilt debounce
    const lastTilt = useRef(0);

    useEffect(() => {
        const checkOrientation = () => setIsPortrait(window.innerHeight > window.innerWidth);
        checkOrientation();
        window.addEventListener('resize', checkOrientation);
        return () => window.removeEventListener('resize', checkOrientation);
    }, []);

    useEffect(() => {
        if (timer <= 0) {
            setResults(prev => ({ ...prev, skipped: [...prev.skipped, currentCard.text] }));
            onFinish();
            return;
        }
        const interval = setInterval(() => {
            setTimer((t) => t - 1);
            if (timer <= 6 && timer > 1) playSound('tick');
        }, 1000);
        return () => clearInterval(interval);
    }, [timer, onFinish, playSound, currentCard]);

    const handlePass = useCallback(() => {
        if (status !== 'active') return;
        setStatus('pass');
        playSound('pass');
        setResults(prev => ({ ...prev, skipped: [...prev.skipped, currentCard.text] }));
        setTimeout(() => {
            if (currentIndex < cards.length - 1) {
                setCurrentIndex(c => c + 1);
                setStatus('active');
                lastTilt.current = 0; // Reset tilt debounce
            } else {
                onFinish();
            }
        }, 800);
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
                lastTilt.current = 0; // Reset tilt debounce
            } else {
                onFinish();
            }
        }, 800);
    }, [status, cards, currentIndex, setResults, setCurrentIndex, onFinish, playSound, currentCard]);

    // --- TILT LOGIC ---
    useEffect(() => {
        if (!motionActive) return;
        const handleOrientation = (event) => {
            if (status !== 'active') return;
            const { beta, gamma } = event;
            if (beta === null || gamma === null) return;

            const deltaGamma = gamma - calibration.gamma;
            const THRESHOLD = 35; // Increased threshold to avoid accidental triggers

            // When held on forehead in landscape:
            // Gamma is usually pitch (looking up/down).
            // If we tilt DOWN (face to floor), Gamma usually INCREASES (or decreases depending on browser).
            // If we tilt UP (face to ceiling), it goes the other way.
            // logic: We separate them clearly.

            if (deltaGamma > THRESHOLD) {
                // Tilt Direction A
                // User reported "Correct" for both directions. Simplest fix: Just allow one to trigger Correct.
                handleCorrect();
                // We don't verify if it's strictly "Down" vs "Up" because sensors vary, 
                // but we ensure only ONE branch is taken based on sign.
            } else if (deltaGamma < -THRESHOLD) {
                // Tilt Direction B
                handlePass();
            }

            // We ignore Beta for now to avoid confusion, as Gamma is the primary axis in landscape forehead mode.
        };
        window.addEventListener('deviceorientation', handleOrientation);
        return () => window.removeEventListener('deviceorientation', handleOrientation);
    }, [motionActive, status, handleCorrect, handlePass, calibration]);

    // --- SWIPE LOGIC ---
    const onTouchStart = (e) => {
        touchStartX.current = e.touches[0].clientX;
        touchStartY.current = e.touches[0].clientY;
    };

    const onTouchEnd = (e) => {
        if (!touchStartX.current || !touchStartY.current) return;
        const diffX = e.changedTouches[0].clientX - touchStartX.current;
        const diffY = e.changedTouches[0].clientY - touchStartY.current;

        // Horizontal mainly
        if (Math.abs(diffX) > Math.abs(diffY)) {
            if (Math.abs(diffX) > 50) {
                if (diffX > 0) handleCorrect();
                else handlePass();
            }
        } else {
            if (Math.abs(diffY) > 50) {
                if (diffY > 0) handleCorrect();
                else handlePass();
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

    // SIZING FIX:
    // When rotated 90deg, the "width" of the container is the height of the screen.
    // We want the card to fill most of the view but leave space.
    // We use `w-[85vh]` (85% of physical height, which is container width) and `h-[60vw]`.
    const containerStyle = isPortrait
        ? {
            transform: 'rotate(90deg)', transformOrigin: 'center center',
            width: '100vh', height: '100vw',
            position: 'absolute', top: '50%', left: '50%',
            marginLeft: '-50vh', marginTop: '-50vw',
        }
        : { width: '100%', height: '100%' };

    // Adjust card size: Bigger but with padding.
    const cardStyle = isPortrait
        ? "w-[85vh] h-[80vw]" // Large in portrait-turned-landscape
        : "w-[80vw] h-[70vh]";

    return (
        <div className={`fixed inset-0 z-50 flex flex-col transition-colors duration-500 ease-out ${bgClass} overflow-hidden`}>
            <div
                style={containerStyle}
                className="relative flex flex-col items-center justify-center w-full h-full"
                onTouchStart={onTouchStart}
                onTouchEnd={onTouchEnd}
            >
                {/* Removed Header with Timer as requested */}

                <div className={`transform transition-all duration-500 ease-out ${cardClass} ${cardStyle} bg-white rounded-[3rem] shadow-2xl flex items-center justify-center p-8 text-center relative mx-auto my-auto`}>
                    {status === 'active' ? (
                        <div className="flex flex-col items-center justify-center h-full w-full">
                            {/* Country Shape Logic */}
                            {currentCard.type === 'country' && (
                                <img
                                    src={`https://raw.githubusercontent.com/djaiss/mapsicon/master/all/${currentCard.code}/vector.svg`}
                                    alt="country shape"
                                    className="w-48 h-48 md:w-64 md:h-64 object-contain mb-6 opacity-90"
                                    onError={(e) => { e.target.style.display = 'none'; }}
                                />
                            )}

                            <div className="flex flex-col items-center">
                                {/* Auto-scale text based on length */}
                                <h2 className={`font-black tracking-tighter text-zinc-900 leading-none break-words max-w-full 
                            ${currentCard.text.length > 12 ? 'text-5xl md:text-7xl' : 'text-7xl md:text-9xl'}`}
                                >
                                    {currentCard.text}
                                </h2>
                                {currentCard.type === 'country' && (
                                    <p className="mt-4 text-zinc-400 text-xl font-bold uppercase tracking-widest">Country</p>
                                )}
                            </div>

                            {/* Hints at bottom of card */}
                            <div className="absolute bottom-10 w-full px-12 flex justify-between text-zinc-300 text-xs font-bold uppercase tracking-widest opacity-40">
                                <span>Pass (Tilt Up)</span>
                                <span>Correct (Tilt Down)</span>
                            </div>
                        </div>
                    ) : <div />}

                    {/* Fallback Taps */}
                    {status === 'active' && (
                        <>
                            <div onClick={handlePass} className="absolute inset-y-0 left-0 w-32 z-20" />
                            <div onClick={handleCorrect} className="absolute inset-y-0 right-0 w-32 z-20" />
                        </>
                    )}
                </div>

                {/* Background Icons */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
                    {status === 'correct' && <Check size={200} className="text-white/20 animate-ping duration-700" />}
                    {status === 'pass' && <RotateCcw size={200} className="text-white/20 animate-ping duration-700" />}
                </div>
            </div>
        </div>
    );
}
