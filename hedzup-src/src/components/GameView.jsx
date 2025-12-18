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
            } else {
                onFinish();
            }
        }, 800);
    }, [status, cards, currentIndex, setResults, setCurrentIndex, onFinish, playSound, currentCard]);

    // --- TILT LOGIC ---
    useEffect(() => {
        if (!motionActive) return;

        let lastActionTime = 0;
        const ACTION_COOLDOWN = 1500; // 1.5s between tilts to prevent double-trigger

        const handleOrientation = (event) => {
            if (status !== 'active') return;

            const now = performance.now();
            if (now - lastActionTime < ACTION_COOLDOWN) return;

            // Beta is front-to-back tilt (-180 to 180)
            // Gamma is left-to-right tilt (-90 to 90)
            const { beta, gamma } = event;
            if (beta === null || gamma === null) return;

            // In Hedzup, the phone is typically held on the forehead.
            // Screen facing OUT. 
            // Landscape-Left: Beta is tilt, Gamma is tilt
            // We'll use a robust check:

            // Normalize for orientation
            // If phone is flat against forehead, gamma is roughly 90 or -90 depending on orientation
            // We want to detect if the TOP of the phone tilts AWAY from the face (DOWN) 
            // or TOWARDS the face (UP)

            const isLandscape = Math.abs(window.orientation) === 90;
            let tilt = 0;

            if (isLandscape) {
                // In landscape, beta is the primary tilt axis for "down/up"
                // if held on forehead.
                tilt = beta;
            } else {
                tilt = gamma;
            }

            const THRESHOLD = 35; // Sensitivity

            // Assuming calibration.beta is the "resting" position
            const delta = tilt - (isLandscape ? (calibration.beta || 0) : (calibration.gamma || 0));

            // LOGIC:
            // Tilt DOWN (Top away from forehead) -> Correct
            // Tilt UP (Top towards/over forehead) -> Skip

            if (delta > THRESHOLD) {
                lastActionTime = now;
                handleCorrect();
            } else if (delta < -THRESHOLD) {
                lastActionTime = now;
                handlePass();
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
        ? {
            transform: 'rotate(90deg)', transformOrigin: 'center center',
            width: '100vh', height: '100vw',
            position: 'absolute', top: '50%', left: '50%',
            marginLeft: '-50vh', marginTop: '-50vw',
        }
        : { width: '100%', height: '100%' };

    // Large Card Size
    const cardStyle = isPortrait
        ? "w-[85vh] h-[80vw]"
        : "w-[80vw] h-[70vh]";

    return (
        <div className={`fixed inset-0 z-50 flex flex-col transition-colors duration-500 ease-out ${bgClass} overflow-hidden`}>
            <div
                style={containerStyle}
                className="relative flex flex-col items-center justify-center w-full h-full"
                onTouchStart={onTouchStart}
                onTouchEnd={onTouchEnd}
            >
                {/* TIMER RESTORED (Top Center, Rotated safe) */}
                {!isPortrait && (
                    <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20">
                        <div className="bg-white/20 backdrop-blur-md px-6 py-2 rounded-full border border-white/20">
                            <span className="font-mono text-3xl font-bold text-white tracking-widest">{timer}</span>
                        </div>
                    </div>
                )}
                {isPortrait && (
                    // In rotated mode, "top" is actually left of screen physically, so we position relative to container
                    <div className="absolute top-8 left-1/2 -translate-x-1/2 z-20">
                        <div className="bg-white/20 backdrop-blur-md px-6 py-2 rounded-full border border-white/20">
                            <span className="font-mono text-3xl font-bold text-white tracking-widest">{timer}</span>
                        </div>
                    </div>
                )}

                <div className={`transform transition-all duration-500 ease-out ${cardClass} ${cardStyle} bg-white rounded-[3rem] shadow-2xl flex items-center justify-center p-8 text-center relative mx-auto my-auto`}>
                    {status === 'active' && currentCard ? (
                        <div className="flex flex-col items-center justify-center h-full w-full">
                            {currentCard?.type === 'country' && currentCard?.code && (
                                <img
                                    src={`https://raw.githubusercontent.com/djaiss/mapsicon/master/all/${currentCard.code}/vector.svg`}
                                    alt="country shape"
                                    className="w-48 h-48 md:w-64 md:h-64 object-contain mb-6 opacity-90"
                                    onError={(e) => { e.target.style.display = 'none'; }}
                                />
                            )}

                            <div className="flex flex-col items-center">
                                <h2 className={`font-black tracking-tighter text-zinc-900 leading-none break-words max-w-full 
                            ${(currentCard?.text?.length || 0) > 12 ? 'text-5xl md:text-7xl' : 'text-7xl md:text-9xl'}`}
                                >
                                    {currentCard?.text || "..."}
                                </h2>
                                {currentCard?.type === 'country' && (
                                    <p className="mt-4 text-zinc-400 text-xl font-bold uppercase tracking-widest">Country</p>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="text-zinc-300 font-black text-4xl uppercase italic">Ready?</div>
                    )}

                    {/* Fallback Taps */}
                    {status === 'active' && (
                        <>
                            <div onClick={handlePass} className="absolute inset-y-0 left-0 w-32 z-20" />
                            <div onClick={handleCorrect} className="absolute inset-y-0 right-0 w-32 z-20" />
                        </>
                    )}
                </div>

                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
                    {status === 'correct' && <Check size={200} className="text-white/20 animate-ping duration-700" />}
                    {status === 'pass' && <RotateCcw size={200} className="text-white/20 animate-ping duration-700" />}
                </div>
            </div>
        </div>
    );
}
