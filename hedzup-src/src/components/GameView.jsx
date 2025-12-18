import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Check, RotateCcw } from 'lucide-react';

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
        const interval = setInterval(() => {
            setTimer((t) => t - 1);
            if (timer <= 5) playSound('tick');
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

            // In native landscape: tilt is gamma (front/back)
            // In portrait (rotated): tilt is beta
            const deltaValue = isPortrait ? (beta - calibration.beta) : (gamma - calibration.gamma);

            const THRESHOLD = 35;
            const NEUTRAL_THRESHOLD = 15;

            // Check if we are in neutral position to unlock
            if (Math.abs(deltaValue) < NEUTRAL_THRESHOLD) {
                isLocked.current = false;
            }

            if (status !== 'active' || isLocked.current) return;

            // Handle Correct/Pass based on device orientation
            // Note: delta direction might need inversion depending on iOS vs Android
            // On iOS: Positive delta usually means tilt "Down" (towards face)
            if (deltaValue > THRESHOLD) { // Tilt towards player (Correct)
                isLocked.current = true;
                handleCorrect();
            } else if (deltaValue < -THRESHOLD) { // Tilt away from player (Pass)
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

    return (
        <div className={`fixed inset-0 z-50 flex flex-col transition-colors duration-500 ease-out ${bgClass} overflow-hidden landscape:p-safe`}>
            {/* The Main Stage */}
            <div className="relative flex flex-col w-full h-full items-center justify-center p-4">

                {/* HUD */}
                <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-10 text-white/90">
                    <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10">
                        <span className="font-mono text-lg font-bold tracking-wider">{timer}</span>
                    </div>
                    <div className="font-semibold text-sm opacity-80 uppercase tracking-widest">
                        {deck.title}
                    </div>
                </div>

                {/* The Card */}
                <div className={`transform transition-all duration-500 ease-out ${cardClass} w-full max-w-5xl aspect-video bg-white rounded-[2.5rem] shadow-2xl flex items-center justify-center p-8 text-center relative overflow-hidden`}>
                    {status === 'active' ? (
                        <div className="flex items-center justify-center h-full w-full space-x-8">
                            {/* Country Shape Logic */}
                            {currentCard.type === 'country' && (
                                <img
                                    src={`https://raw.githubusercontent.com/djaiss/mapsicon/master/all/${currentCard.code}/vector.svg`}
                                    alt="country shape"
                                    className="w-32 h-32 md:w-64 md:h-64 object-contain opacity-80 flex-shrink-0"
                                    onError={(e) => { e.target.style.display = 'none'; }}
                                />
                            )}

                            <div className="flex flex-col items-center justify-center min-w-0">
                                <h2 className="text-6xl md:text-9xl font-black tracking-tighter text-zinc-900 leading-none break-words uppercase">
                                    {currentCard.text}
                                </h2>
                                {currentCard.type === 'country' && (
                                    <p className="mt-4 text-zinc-400 text-lg font-bold tracking-widest uppercase">Country</p>
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
