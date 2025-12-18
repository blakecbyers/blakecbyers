import React, { useState, useEffect, useRef } from 'react';
import { Check, RotateCcw } from 'lucide-react';

const TRIGGER_THRESHOLD = 35; // Degrees of tilt required
const RESET_THRESHOLD = 15;   // Must return within this range to unlock

export default function GameView({ deck, cards, currentIndex, setCurrentIndex, timer, setTimer, results, setResults, onFinish, playSound, motionActive, calibration, isPortrait }) {
    const [currentTilt, setCurrentTilt] = useState(0);
    const [status, setStatus] = useState('active'); // active, correct, pass
    const [debugInfo, setDebugInfo] = useState({ b: 0, g: 0 });

    const isLocked = useRef(false);
    const startGamma = useRef(null);

    // Initialize start gamma from calibration if available, else null to capture on first frame
    useEffect(() => {
        if (calibration && calibration.gamma) {
            startGamma.current = calibration.gamma;
        }
    }, [calibration]);

    useEffect(() => {
        if (timer > 0) {
            const interval = setInterval(() => setTimer(t => t - 1), 1000);
            return () => clearInterval(interval);
        } else {
            onFinish();
        }
    }, [timer, onFinish]);

    useEffect(() => {
        if (!motionActive) return;

        const handleOrientation = (event) => {
            const { gamma, beta } = event;

            // Capture baseline if not set (or if calibration was empty)
            if (startGamma.current === null && gamma !== null) {
                startGamma.current = gamma;
            }

            if (startGamma.current === null) return;

            setDebugInfo({ b: Math.round(beta), g: Math.round(gamma) });

            // Calculate Delta relative to start
            // In Landscape: Gamma is Pitch (looking down/up)
            // Standard: Landscape Left (Home Right): Upright=90. Down=0. Up=180.
            // Delta = Current - Start.
            // If Start=90:
            // Scan Down (Correct): Gamma -> 45. Delta = -45.
            // Scan Up (Pass): Gamma -> 135. Delta = +45.
            // Note: If Landscape Right (Home Left): Upright=-90. Down=0 (Delta=+90). Up=-180 (Delta=-90).

            let delta = gamma - startGamma.current;

            // Normalize for Landscape Right scenario where signs might be flipped relative to "Down/Up" intent
            // We assume "Down" (Face to floor) always moves Gamma towards 0 from 90/-90.
            // So magnitude decreases?
            // Actually simpler:
            // If start is positive (Landscape Left), Down is negative delta.
            // If start is negative (Landscape Right), Down is positive delta.

            let tilt = 0;
            if (startGamma.current > 0) {
                tilt = -delta; // Positive tilt = Down (Correct)
            } else {
                tilt = delta;  // Positive tilt = Down (Correct)
            }

            setCurrentTilt(tilt);

            // Reset Lock if back in neutral zone
            if (Math.abs(tilt) < RESET_THRESHOLD) {
                isLocked.current = false;
                if (status !== 'active') setStatus('active');
            }

            if (isLocked.current) return;

            // Trigger Logic
            if (tilt > TRIGGER_THRESHOLD) {
                // Tilted Down -> Correct
                handleCorrect();
            } else if (tilt < -TRIGGER_THRESHOLD) {
                // Tilted Up -> Pass
                handlePass();
            }
        };

        window.addEventListener('deviceorientation', handleOrientation);
        return () => window.removeEventListener('deviceorientation', handleOrientation);
    }, [motionActive, status, currentIndex]);

    const handleCorrect = () => {
        isLocked.current = true;
        setStatus('correct');
        playSound('success');

        // Add to effects immediately
        const currentCard = cards[currentIndex];
        setResults(prev => ({ ...prev, correct: [...prev.correct, currentCard.text] }));

        // Move to next card
        setTimeout(() => {
            if (currentIndex < cards.length - 1) {
                setCurrentIndex(prev => prev + 1);
            } else {
                onFinish();
            }
        }, 200);
    };

    const handlePass = () => {
        isLocked.current = true;
        setStatus('pass');
        playSound('pass');

        const currentCard = cards[currentIndex];
        setResults(prev => ({ ...prev, skipped: [...prev.skipped, currentCard.text] }));

        setTimeout(() => {
            if (currentIndex < cards.length - 1) {
                setCurrentIndex(prev => prev + 1);
            } else {
                onFinish();
            }
        }, 200);
    };

    const currentCard = cards[currentIndex];

    return (
        <div className={`fixed inset-0 flex flex-col items-center justify-center transition-colors duration-300 ${status === 'correct' ? 'bg-green-500' : (status === 'pass' ? 'bg-orange-500' : 'bg-blue-600')}`}>
            {/* Background Icon Effects */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden">
                {status === 'correct' && <Check size={300} className="text-white/20 animate-ping" />}
                {status === 'pass' && <RotateCcw size={300} className="text-white/20 animate-ping" />}
            </div>

            <div className="z-10 text-center p-8 w-full max-w-2xl">
                <div className="text-white/60 font-bold uppercase tracking-widest mb-4">
                    {status === 'active' ? 'Tilt Down (Correct) • Tilt Up (Pass)' : (status === 'correct' ? 'CORRECT!' : 'PASS')}
                </div>

                <h1 className="text-[5rem] md:text-[7rem] leading-none font-black text-white drop-shadow-lg break-words">
                    {currentCard?.text}
                </h1>

                {currentCard?.type === 'country' && (
                    <div className="mt-8">
                        <img
                            src={`https://flagcdn.com/w320/${currentCard.code}.png`}
                            alt="flag"
                            className="h-48 mx-auto rounded-xl shadow-2xl border-4 border-white/30"
                        />
                    </div>
                )}

                <div className="mt-12 text-2xl font-bold text-white/80">
                    {timer}
                </div>

                {/* Debug Overlay (Hidden in Prod usually, but user asked for robust fixes so useful to verify) */}
                {/* <div className="fixed top-2 left-2 text-[10px] text-white/50 font-mono text-left">
           G: {debugInfo.g}<br/>
           Start: {startGamma.current}<br/>
           Tilt: {Math.round(currentTilt)}
        </div> */}
            </div>
        </div>
    );
}
