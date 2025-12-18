import React, { useState, useEffect, useRef } from 'react';

export default function CountdownView({ onFinished, motionActive, isPortrait }) {
    const [count, setCount] = useState(3);
    const calibrationRef = useRef({ beta: 0, gamma: 0 });

    useEffect(() => {
        // Removed internal orientation listeners

        const handleCalibration = (e) => {
            if (e.beta !== null && e.gamma !== null) {
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
                window.removeEventListener('deviceorientation', handleCalibration);
            };
        } else {
            // Wait 1 second on "GO!" before starting
            const timer = setTimeout(() => {
                window.removeEventListener('deviceorientation', handleCalibration);
                onFinished(calibrationRef.current);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [count, onFinished, motionActive]);

    const containerStyle = isPortrait
        ? "fixed inset-0 z-50 w-[100dvh] h-[100dvw] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-90"
        : "fixed inset-0 z-50 w-full h-full landscape:p-safe";

    return (
        <div className={`flex items-center justify-center bg-zinc-900 text-white transition-all duration-500 overflow-hidden ${containerStyle}`}>
            <div className="flex flex-col items-center transition-transform duration-500">
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
