import React from 'react';

export default function InstructionsView({ deck, onStart }) {
    const handleStart = async () => {
        if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
            try {
                const response = await DeviceOrientationEvent.requestPermission();
                if (response === 'granted') {
                    onStart(true);
                } else {
                    onStart(false);
                }
            } catch (error) {
                onStart(false);
            }
        } else {
            onStart(true);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-white/95 backdrop-blur-xl flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-300">
            <div className="max-w-xs w-full">
                <div className={`w-24 h-24 mx-auto rounded-3xl bg-gradient-to-br ${deck.gradient} flex items-center justify-center shadow-xl mb-8`}>
                    {deck.icon}
                </div>
                <h2 className="text-3xl font-bold text-zinc-900 mb-2">{deck.title}</h2>
                <div className="bg-zinc-100 p-6 rounded-2xl mb-8 text-left space-y-4">
                    <div className="flex items-center text-zinc-600">
                        <span className="w-6 h-6 rounded-full bg-zinc-300 text-zinc-800 flex items-center justify-center text-xs font-bold mr-3">1</span>
                        <span>Place phone on forehead</span>
                    </div>
                    <div className="flex items-center text-zinc-600">
                        <span className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center text-xs font-bold mr-3">✓</span>
                        <span>Correct: <b>Tilt Down</b></span>
                    </div>
                    <div className="flex items-center text-zinc-600">
                        <span className="w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center text-xs font-bold mr-3">X</span>
                        <span>Pass: <b>Tilt Up</b></span>
                    </div>
                    <div className="flex items-center text-zinc-600">
                        <span className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold mr-3">i</span>
                        <span>Hold phone <b>Landscape</b></span>
                    </div>
                </div>

                <button
                    onClick={handleStart}
                    className="w-full py-4 bg-zinc-900 text-white font-bold rounded-2xl shadow-lg hover:scale-[1.02] transition-transform text-lg"
                >
                    Start Game
                </button>
            </div>
        </div>
    );
}
