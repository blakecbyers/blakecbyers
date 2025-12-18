import React, { useState, useCallback, useEffect } from 'react';
import { DECKS } from './data/decks';
import MenuView from './components/MenuView';
import InstructionsView from './components/InstructionsView';
import CountdownView from './components/CountdownView';
import GameView from './components/GameView';
import ResultsView from './components/ResultsView';


class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({ error, errorInfo });
        console.error("Uncaught error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="p-8 text-center">
                    <h1 className="text-2xl font-bold text-red-600 mb-4">Something went wrong.</h1>
                    <details className="whitespace-pre-wrap text-left bg-gray-100 p-4 rounded text-sm text-gray-800">
                        {this.state.error && this.state.error.toString()}
                        <br />
                        {this.state.errorInfo && this.state.errorInfo.componentStack}
                    </details>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-8 px-6 py-3 bg-zinc-900 text-white rounded-lg"
                    >
                        Reload Game
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default function App() {
    return (
        <ErrorBoundary>
            <AppContent />
        </ErrorBoundary>
    );
}

function AppContent() {
    const [view, setView] = useState('menu');
    const [selectedDeck, setSelectedDeck] = useState(null);
    const [shuffledCards, setShuffledCards] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [results, setResults] = useState({ correct: [], skipped: [] });
    const [timer, setTimer] = useState(60);
    const [motionActive, setMotionActive] = useState(false);
    const [calibration, setCalibration] = useState({ beta: null, gamma: null });
    const [isPortrait, setIsPortrait] = useState(window.innerHeight > window.innerWidth);

    useEffect(() => {
        const handleResize = () => setIsPortrait(window.innerHeight > window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const playSound = (type) => {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        const now = ctx.currentTime;

        if (type === 'tick') {
            osc.frequency.setValueAtTime(800, now);
            gain.gain.setValueAtTime(0.02, now);
            osc.start();
            osc.stop(now + 0.05);
        } else if (type === 'success') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(500, now);
            osc.frequency.exponentialRampToValueAtTime(1000, now + 0.1);
            gain.gain.setValueAtTime(0.15, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
            osc.start();
            osc.stop(now + 0.3);
        } else if (type === 'pass') {
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(300, now);
            osc.frequency.linearRampToValueAtTime(150, now + 0.2);
            gain.gain.setValueAtTime(0.15, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
            osc.start();
            osc.stop(now + 0.3);
        } else if (type === 'finish') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(400, now);
            osc.frequency.exponentialRampToValueAtTime(800, now + 0.4);
            gain.gain.setValueAtTime(0.2, now);
            gain.gain.linearRampToValueAtTime(0, now + 0.8);
            osc.start();
            osc.stop(now + 0.8);
        }
    };

    const selectDeck = (deck) => {
        setSelectedDeck(deck);
        const shuffled = [...deck.data].sort(() => 0.5 - Math.random());
        setShuffledCards(shuffled);
        setCurrentIndex(0);
        setResults({ correct: [], skipped: [] });
        setTimer(60);
        setView('instructions');
    };

    const finishGame = useCallback(() => {
        playSound('finish');
        setView('results');
    }, []);

    return (
        <div className="fixed inset-0 bg-zinc-50 overflow-hidden touch-none select-none font-sans text-zinc-900 w-full h-[100dvh]">
            {view === 'menu' && (
                <MenuView decks={DECKS} onSelect={selectDeck} />
            )}

            {view === 'instructions' && (
                <InstructionsView
                    deck={selectedDeck}
                    onStart={(granted) => {
                        setMotionActive(granted);
                        setView('countdown');
                    }}
                />
            )}

            {view === 'countdown' && (
                <CountdownView
                    onFinished={(cal) => {
                        setCalibration(cal);
                        setView('game');
                    }}
                    motionActive={motionActive}
                    isPortrait={isPortrait}
                />
            )}

            {view === 'game' && (
                <GameView
                    deck={selectedDeck}
                    cards={shuffledCards}
                    currentIndex={currentIndex}
                    setCurrentIndex={setCurrentIndex}
                    timer={timer}
                    setTimer={setTimer}
                    setResults={setResults}

                    onFinish={finishGame}
                    playSound={playSound}
                    motionActive={motionActive}
                    calibration={calibration}
                    isPortrait={isPortrait}
                />
            )}

            {view === 'results' && (
                <ResultsView
                    results={results}
                    deck={selectedDeck}
                    onHome={() => setView('menu')}
                    onRestart={() => selectDeck(selectedDeck)}
                />
            )}
        </div>
    );
}
