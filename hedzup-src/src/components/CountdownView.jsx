import React, { useState, useEffect, useRef } from 'react';

export default function CountdownView({ onFinished, motionActive, isPortrait }) {
    const [count, setCount] = useState(3);
    const samplesRef = useRef([]);

    useEffect(() => {
        const handleCalibration = (e) => {
            if (e.beta !== null && e.gamma !== null) {
                // Collect samples to average out noise
                samplesRef.current.push({ beta: e.beta, gamma: e.gamma });
                // Keep only last 50 samples (~1 second at 50Hz)
                if (samplesRef.current.length > 50) samplesRef.current.shift();
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
            // Calculate average calibration from collected samples
            const avgCalibration = samplesRef.current.length > 0
                ? samplesRef.current.reduce(
                    (acc, val) => ({
                        beta: acc.beta + val.beta / samplesRef.current.length,
                        gamma: acc.gamma + val.gamma / samplesRef.current.length
                    }),
                    { beta: 0, gamma: 0 }
                )
                : { beta: 0, gamma: 0 };

            // Wait 1.2 seconds on "GO!" before starting (more breathing room)
            const timer = setTimeout(() => {
                window.removeEventListener('deviceorientation', handleCalibration);
                onFinished(avgCalibration.beta === 0 ? samplesRef.current[samplesRef.current.length - 1] || { beta: 0, gamma: 0 } : avgCalibration);
            }, 1200);
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
