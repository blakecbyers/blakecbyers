import React, { useState, useEffect, useRef, useCallback } from 'react';

export default function Game({ deck, cards, onFinish, playSound, motionActive, calibration }) {
    const [status, setStatus] = useState('active'); // active, correct, pass
    const [currentIndex, setCurrentIndex] = useState(0);
    const [stats, setStats] = useState({ correct: [], skipped: [] });
    const [timer, setTimer] = useState(60);

    const currentCard = cards[currentIndex] || null;
    const physicsRef = useRef({ tilt: 0, state: 'NEUTRAL' });

    // Handle game completion
    const handleFinish = useCallback((finalStats) => {
        onFinish(finalStats);
    }, [onFinish]);

    // Card Action Logic
    const handleAction = useCallback((type) => {
        if (status !== 'active') return;

        playSound(type === 'correct' ? 'success' : 'pass');
        setStatus(type);

        // Capture snapshot for state updates
        const nextStats = { ...stats };
        if (type === 'correct') nextStats.correct = [...nextStats.correct, currentCard];
        else nextStats.skipped = [...nextStats.skipped, currentCard];
        setStats(nextStats);

        setTimeout(() => {
            if (currentIndex + 1 >= cards.length) {
                handleFinish(nextStats);
            } else {
                setCurrentIndex(prev => prev + 1);
                setStatus('active');
            }
        }, 600);
    }, [status, currentIndex, cards, currentCard, stats, playSound, handleFinish]);

    // Sensor Logic
    useEffect(() => {
        if (!motionActive) return;

        const handleOrientation = (e) => {
            const { beta } = e;
            if (beta === null) return;

            // 1. Calculate relative delta with wrap handling
            let delta = beta - (calibration.beta || 0);
            if (delta > 180) delta -= 360;
            if (delta < -180) delta += 360;

            // 2. Filter & Logic
            physicsRef.current.tilt = physicsRef.current.tilt + 0.2 * (delta - physicsRef.current.tilt);
            const val = physicsRef.current.tilt;

            if (status !== 'active') return;

            // Thresholds: Correct > 45 (Down), Pass < -45 (Up)
            if (physicsRef.current.state === 'NEUTRAL') {
                if (val > 45) {
                    physicsRef.current.state = 'TRIGGERED';
                    handleAction('correct');
                } else if (val < -45) {
                    physicsRef.current.state = 'TRIGGERED';
                    handleAction('pass');
                }
            } else if (Math.abs(val) < 20) {
                physicsRef.current.state = 'NEUTRAL';
            }
        };

        window.addEventListener('deviceorientation', handleOrientation);
        return () => window.removeEventListener('deviceorientation', handleOrientation);
    }, [motionActive, status, calibration, handleAction]);

    // Timer Logic
    useEffect(() => {
        if (timer <= 0) {
            handleFinish(stats);
            return;
        }
        const interval = setInterval(() => setTimer(t => t - 1), 1000);
        return () => clearInterval(interval);
    }, [timer, handleFinish, stats]);

    // Swipe Handling
    const touchY = useRef(0);
    const onTouchStart = (e) => touchY.current = e.touches[0].clientY;
    const onTouchEnd = (e) => {
        const delta = e.changedTouches[0].clientY - touchY.current;
        if (Math.abs(delta) > 80) handleAction(delta > 0 ? 'correct' : 'pass');
    };

    const bg = status === 'correct' ? 'bg-green-500' : status === 'pass' ? 'bg-orange-500' : 'bg-zinc-900';

    return (
        <div
            className={`fixed inset-0 flex items-center justify-center transition-colors duration-500 ${bg} touch-none`}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
        >
            <div style={{ transform: 'rotate(90deg)', transformOrigin: 'center' }} className="relative flex flex-col items-center justify-center w-[100vh] h-[100vw]">

                {/* Timer: High Visibility */}
                <div className="absolute top-12 left-12 bg-black/50 backdrop-blur-xl px-10 py-5 rounded-[2.5rem] shadow-2xl border border-white/10 z-50">
                    <span className="font-mono text-6xl font-black text-white leading-none">{timer}</span>
                </div>

                {/* THE CARD */}
                <div className={`
                    w-[85%] h-[75%] bg-white rounded-[4.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.4)] flex flex-col items-center justify-center p-12 text-center
                    transition-all duration-300 transform
                    ${status !== 'active' ? 'opacity-0 scale-90 translate-y-10' : 'opacity-100 scale-100 translate-y-0'}
                `}>
                    {currentCard?.type === 'country' && currentCard?.code && (
                        <img
                            src={`https://raw.githubusercontent.com/djaiss/mapsicon/master/all/${currentCard.code}/vector.svg`}
                            className="w-48 h-48 mb-10 object-contain"
                            alt="flag"
                        />
                    )}

                    <h1 className="text-7xl md:text-9xl font-black text-zinc-900 tracking-tight leading-none">
                        {currentCard?.text}
                    </h1>

                    <div className="mt-12 opacity-30 text-3xl font-bold uppercase tracking-[0.5em] text-zinc-400">
                        {currentCard?.type === 'country' ? 'Country' : deck.title}
                    </div>
                </div>
            </div>
        </div>
    );
}
