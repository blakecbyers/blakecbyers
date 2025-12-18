import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Check, RotateCcw } from 'lucide-react';

export default function GameView({ deck, cards, currentIndex, setCurrentIndex, timer, setTimer, setResults, onFinish, playSound, motionActive, calibration, isPortrait }) {
    const [status, setStatus] = useState('active');
    const currentCard = cards[currentIndex];
    const isLocked = useRef(false);
    const lastTiltType = useRef('neutral');

    // Swipe Refs
    const touchStartX = useRef(null);
    const touchStartY = useRef(null);

    useEffect(() => {
        if (timer <= 0) {
            setResults(prev => ({ ...prev, skipped: [...prev.skipped, currentCard.text] }));
            onFinish();
            return;
        }
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

    // --- TILT LOGIC ---
    useEffect(() => {
        if (!motionActive) return;

        const handleOrientation = (event) => {
            const { beta, gamma } = event;
            if (beta === null || gamma === null) return;

            const startBeta = calibration.beta || 0;
            const isHomeButtonRight = startBeta > 0;

            let currentTilt = 0;
            if (isHomeButtonRight) {
                // Home Button Right: beta ~ 90
                currentTilt = -(gamma - (calibration.gamma || 0));
            } else {
                // Home Button Left: beta ~ -90
                currentTilt = (gamma - (calibration.gamma || 0));
            }

            // --- TUNED PARAMETERS ---
            const TRIGGER_THRESHOLD = 50; // Increased for less sensitivity
            const NEUTRAL_ZONE = 25;      // Widened to prevent "sticky" logic

            // Check for return to neutral
            if (Math.abs(currentTilt) < NEUTRAL_ZONE) {
                if (lastTiltType.current !== 'neutral') {
                    lastTiltType.current = 'neutral';
                    isLocked.current = false;
                }
            }

            if (status !== 'active' || isLocked.current) return;

            // Mapping: Down (Positive) = Correct, Up (Negative) = Pass
            if (currentTilt > TRIGGER_THRESHOLD) {
                isLocked.current = true;
                lastTiltType.current = 'correct';
                handleCorrect();
            } else if (currentTilt < -TRIGGER_THRESHOLD) {
                isLocked.current = true;
                lastTiltType.current = 'pass';
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

        if (Math.max(Math.abs(diffX), Math.abs(diffY)) > 50) {
            if (Math.abs(diffX) > Math.abs(diffY)) {
                if (diffX > 0) handleCorrect(); // Swipe Right
                else handlePass();             // Swipe Left
            } else {
                if (diffY > 0) handleCorrect(); // Swipe Down
                else handlePass();             // Swipe Up
            }
        }
        touchStartX.current = null;
        touchStartY.current = null;
    };

    // --- STYLES ---
    let bgClass = "bg-zinc-900";
    let cardClass = "opacity-100 scale-100 translate-y-0";

    if (status === 'correct') {
        bgClass = "bg-[#34C759]";
        cardClass = "opacity-0 translate-y-[120%] rotate-6";
    } else if (status === 'pass') {
        bgClass = "bg-[#FF9500]";
        cardClass = "opacity-0 translate-y-[-120%] -rotate-6";
    }

    const containerStyle = isPortrait
        ? "fixed inset-0 z-50 w-[100dvh] h-[100dvw] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-90"
        : "fixed inset-0 z-50 w-full h-full landscape:p-safe";

    return (
        <div className={`flex flex-col transition-colors duration-500 ease-out ${bgClass} overflow-hidden ${containerStyle}`}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}>
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
                            {currentCard.type === 'country' && (
                                <img
                                    src={`https://raw.githubusercontent.com/djaiss/mapsicon/master/all/${currentCard.code}/vector.svg`}
                                    alt="country shape"
                                    className="w-32 h-32 object-contain opacity-80 flex-shrink-0"
                                    onError={(e) => { e.target.style.display = 'none'; }}
                                />
                            )}
                            <div className="flex flex-col items-center justify-center min-w-0 text-zinc-900">
                                <h2 className="text-[10vmin] font-black tracking-tighter uppercase leading-none break-words">
                                    {currentCard.text}
                                </h2>
                                {currentCard.type === 'country' && (
                                    <p className="mt-4 opacity-40 text-[2vmin] font-bold uppercase tracking-widest">Country</p>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center">
                            {status === 'correct' && <Check size={120} className="text-[#34C759] animate-in zoom-in duration-300" />}
                            {status === 'pass' && <RotateCcw size={120} className="text-[#FF9500] animate-in zoom-in duration-300" />}
                        </div>
                    )}
                    <div className="absolute bottom-6 w-full px-12 flex justify-between text-zinc-300 text-[1.4vmin] font-bold uppercase tracking-widest opacity-30">
                        <span>Pass (Up)</span>
                        <span>Correct (Down)</span>
                    </div>
                </div>

                {/* Background Pings */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
                    {status === 'correct' && <Check size={180} className="text-white/20 animate-ping" />}
                    {status === 'pass' && <RotateCcw size={180} className="text-white/20 animate-ping" />}
                </div>

                {/* Touch Tap Fallbacks */}
                {status === 'active' && (
                    <div className="absolute inset-0 flex pointer-events-none">
                        <div onClick={handlePass} className="w-1/4 h-full pointer-events-auto" />
                        <div className="flex-1" />
                        <div onClick={handleCorrect} className="w-1/4 h-full pointer-events-auto" />
                    </div>
                )}
            </div>
        </div>
    );
}
