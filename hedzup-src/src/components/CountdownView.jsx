import React, { useState, useEffect } from 'react';

export default function CountdownView({ onFinished, motionActive, isPortrait }) {
    const [count, setCount] = useState(3);
    const [samples, setSamples] = useState([]);

    useEffect(() => {
        if (!motionActive) return;

        const handleCalibration = (e) => {
            // Collect gamma samples (Landscape tilt axis)
            if (e.gamma !== null) {
                setSamples(prev => [...prev, e.gamma]);
            }
        };

        window.addEventListener('deviceorientation', handleCalibration);

        // Timer Logic
        if (count > 0) {
            const timer = setTimeout(() => setCount(count - 1), 1000);
            return () => { clearTimeout(timer); window.removeEventListener('deviceorientation', handleCalibration); };
        } else {
            // "GO!" Phase
            const timer = setTimeout(() => {
                window.removeEventListener('deviceorientation', handleCalibration);

                // Calculate average gamma
                let avgGamma = 0;
                if (samples.length > 0) {
                    avgGamma = samples.reduce((a, b) => a + b, 0) / samples.length;
                } else {
                    // Fallback if no samples (e.g. desktop)
                    avgGamma = 90; // Assume landscape left upright
                }

                onFinished({ gamma: avgGamma });
            }, 1000);

            return () => clearTimeout(timer);
        }
    }, [count, motionActive, onFinished]);

    return (
        <div className="fixed inset-0 bg-blue-600 flex items-center justify-center">
            <div className="text-[12rem] font-black text-white animate-bounce">
                {count > 0 ? count : "GO!"}
            </div>
            <div className="absolute bottom-10 text-white/50 font-bold uppercase tracking-widest text-center px-4">
                Place on forehead • Screen facing out
            </div>
        </div>
    );
}
