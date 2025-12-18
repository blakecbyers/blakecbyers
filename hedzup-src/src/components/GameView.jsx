import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Check, RotateCcw, X } from 'lucide-react';

export default function GameView({ deck, cards, currentIndex, setCurrentIndex, timer, setTimer, setResults, onFinish, playSound, motionActive, calibration }) {
    const [status, setStatus] = useState('active');
    const [isPortrait, setIsPortrait] = useState(false);
    const currentCard = cards[currentIndex];
    const touchStartX = useRef(null);
    const touchStartY = useRef(null);

    useEffect(() => {
        const checkOrientation = () => setIsPortrait(window.innerHeight > window.innerWidth);
        checkOrientation();
        window.addEventListener('resize', checkOrientation);
        return () => window.removeEventListener('resize', checkOrientation);
    }, []);

    useEffect(() => {
        if (timer <= 0) {
            // TIMEOUT LOGIC: Add current card to SKIPPED before finishing
            setResults(prev => ({ ...prev, skipped: [...prev.skipped, currentCard.text] }));
            onFinish();
            return;
        }
        const interval = setInterval(() => {
            setTimer((t) => t - 1);
            // Play tick sound when timer is low (e.g. 5 seconds)
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
        let debounce = false;
        const handleOrientation = (event) => {
            if (status !== 'active' || debounce) return;
            const { beta, gamma } = event;
            if (beta === null || gamma === null) return;

            const deltaBeta = beta - calibration.beta;
            const deltaGamma = gamma - calibration.gamma;
            const THRESHOLD = 35;

            // Tilt Down (Phone face to floor) -> Correct
            // Tilt Up (Phone face to ceiling) -> Pass

            if (Math.abs(deltaGamma) > THRESHOLD) {
                if (deltaGamma > THRESHOLD) {
                    debounce = true; handleCorrect(); setTimeout(() => { debounce = false; }, 1000);
                } else if (deltaGamma < -THRESHOLD) {
                    debounce = true; handlePass(); setTimeout(() => { debounce = false; }, 1000);
                }
            }
            else if (Math.abs(deltaBeta) > THRESHOLD) {
                if (deltaBeta < -THRESHOLD) {
                    debounce = true; handleCorrect(); setTimeout(() => { debounce = false; }, 1000);
                } else if (deltaBeta > THRESHOLD) {
                    debounce = true; handlePass(); setTimeout(() => { debounce = false; }, 1000);
                }
            }
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

        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;

        const diffX = touchEndX - touchStartX.current;
        const diffY = touchEndY - touchStartY.current;

        // We check which axis had more movement
        if (Math.abs(diffX) > Math.abs(diffY)) {
            // Horizontal Swipe
            if (Math.abs(diffX) > 50) {
                if (diffX > 0) handleCorrect(); // Right -> Correct
                else handlePass(); // Left -> Pass
            }
        } else {
            // Vertical Swipe (Backup)
            if (Math.abs(diffY) > 50) {
                if (diffY > 0) handleCorrect(); // Down -> Correct
                else handlePass(); // Up -> Pass
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

    const containerStyle = isPortrait
        ? {
            transform: 'rotate(90deg)', transformOrigin: 'center center',
            width: '100vh', height: '100vw',
            position: 'absolute', top: '50%', left: '50%',
            marginLeft: '-50vh', marginTop: '-50vw',
        }
        : { width: '100%', height: '100%' };

    return (
        <div className={`fixed inset-0 z-50 flex flex-col transition-colors duration-500 ease-out ${bgClass} overflow-hidden`}>
            <div
                style={containerStyle}
                className="relative flex flex-col w-full h-full"
                onTouchStart={onTouchStart}
                onTouchEnd={onTouchEnd}
            >
                <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-10 text-white/90">
                    <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10">
                        <span className="font-mono text-lg font-bold tracking-wider">{timer}</span>
                    </div>
                    <div className="font-semibold text-sm opacity-80 uppercase tracking-widest flex items-center gap-2">
                        {deck.title}
                    </div>
                </div>

                <div className="flex-1 flex items-center justify-center p-8 relative">
                    <div className={`transform transition-all duration-500 ease-out ${cardClass} w-full max-w-4xl aspect-[2/1] bg-white rounded-[2.5rem] shadow-2xl flex items-center justify-center p-8 text-center relative`}>
                        {status === 'active' ? (
                            <div className="flex items-center justify-center h-full w-full space-x-8">
                                {/* Country Shape Logic */}
                                {currentCard.type === 'country' && (
                                    <img
                                        src={`https://raw.githubusercontent.com/djaiss/mapsicon/master/all/${currentCard.code}/vector.svg`}
                                        alt="country shape"
                                        className="w-32 h-32 md:w-48 md:h-48 object-contain opacity-80"
                                        onError={(e) => { e.target.style.display = 'none'; }}
                                    />
                                )}

                                <div className="flex flex-col items-center">
                                    <h2 className="text-6xl md:text-8xl font-bold tracking-tight text-zinc-900 leading-none break-words max-w-full">
                                        {currentCard.text}
                                    </h2>
                                    {currentCard.type === 'country' && (
                                        <p className="mt-4 text-zinc-400 text-lg font-medium">Country</p>
                                    )}
                                </div>

                                <div className="absolute bottom-8 w-full px-12 flex justify-between text-zinc-300 text-xs font-bold uppercase tracking-widest opacity-60">
                                    <span>Pass (Tilt Up/Swipe Left)</span>
                                    <span>Correct (Tilt Down/Swipe Right)</span>
                                </div>
                            </div>
                        ) : <div />}

                        {/* Fallback Taps */}
                        {status === 'active' && (
                            <>
                                <div onClick={handlePass} className="absolute inset-y-0 left-0 w-24 z-20" />
                                <div onClick={handleCorrect} className="absolute inset-y-0 right-0 w-24 z-20" />
                            </>
                        )}
                    </div>
                </div>

                {/* Background Icons */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
                    {status === 'correct' && <Check size={180} className="text-white/25 animate-ping duration-700" />}
                    {status === 'pass' && <RotateCcw size={180} className="text-white/25 animate-ping duration-700" />}
                </div>
            </div>
        </div>
    );
}
