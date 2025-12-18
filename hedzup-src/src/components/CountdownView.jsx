import React, { useState, useEffect, useRef } from 'react';

export default function CountdownView({ onFinished, motionActive }) {
    const [count, setCount] = useState(3);
    const [isPortrait, setIsPortrait] = useState(false);
    const calibrationRef = useRef({ beta: 0, gamma: 0 });

    useEffect(() => {
        const checkOrientation = () => setIsPortrait(window.innerHeight > window.innerWidth);
        checkOrientation();
        window.addEventListener('resize', checkOrientation);

        const handleCalibration = (e) => {
            if (e.beta !== null && e.gamma !== null && calibrationRef.current.beta === 0) {
                calibrationRef.current = { beta: e.beta, gamma: e.gamma };
            }
        };

        if (motionActive) {
            window.addEventListener('deviceorientation', handleCalibration);
        }

        if (count > 0) {
            const timer = setTimeout(() => setCount(count - 1), 1000);
            return () => {
                clearTimeout(timer);
                window.removeEventListener('resize', checkOrientation);
                window.removeEventListener('deviceorientation', handleCalibration);
            };
        } else {
            window.removeEventListener('deviceorientation', handleCalibration);
            onFinished(calibrationRef.current);
        }
    }, [count, onFinished, motionActive]);

    const rotateStyle = isPortrait ? { transform: 'rotate(90deg)' } : {};

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900 text-white transition-all duration-500">
            <div style={rotateStyle} className="flex flex-col items-center transition-transform duration-500">
                <div className="text-[10rem] font-bold leading-none tracking-tighter animate-pulse text-white">
                    {count > 0 ? count : "GO!"}
                </div>
                <p className="mt-8 text-white/50 font-medium text-xl uppercase tracking-widest text-center px-8">
                    Place on Forehead
                </p>
            </div>
        </div>
    );
}
