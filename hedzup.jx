import React, { useState, useEffect } from 'react';

const WORDS = [
  "Bitcoin", "Longevity", "Coffee", "Tesla", "React", 
  "The Moon", "Silence", "Gravity", "Dinosaur", "Pizza"
];

export default function Hedzup() {
  const [gameState, setGameState] = useState('menu'); // menu, playing, finished
  const [wordIndex, setWordIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState(''); // 'correct', 'pass', ''

  // Request access to motion sensors (Required for iOS 13+)
  const requestPermission = async () => {
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
      try {
        const response = await DeviceOrientationEvent.requestPermission();
        if (response === 'granted') {
          startGame();
        } else {
          alert('Permission needed to play!');
        }
      } catch (e) {
        console.error(e);
      }
    } else {
      startGame(); // Non-iOS devices usually don't need permission
    }
  };

  const startGame = () => {
    setScore(0);
    setWordIndex(0);
    setGameState('playing');
  };

  const handleTilt = (event) => {
    if (gameState !== 'playing') return;

    const { beta } = event; // beta detects front/back tilt
    // Tilt Down (Screen facing floor) = Correct (~180 or -180, simplified check)
    if (beta > 130 || beta < -130) { 
        handleGuess(true);
    }
    // Tilt Up (Screen facing user) = Pass (~0 to 40)
    else if (beta > -10 && beta < 50) {
        // Resetting to neutral position, usually ignored or used to "pass"
        // For simple gameplay, let's tap to pass or use strict angles
    }
  };

  // Fallback: Click interaction for desktop/testing
  const handleGuess = (isCorrect) => {
    if (feedback !== '') return; // Prevent double trigger
    
    setFeedback(isCorrect ? 'CORRECT!' : 'PASS');
    setScore(prev => isCorrect ? prev + 1 : prev);

    setTimeout(() => {
        setFeedback('');
        nextWord();
    }, 1000);
  };

  const nextWord = () => {
    if (wordIndex >= WORDS.length - 1) {
        setGameState('finished');
    } else {
        setWordIndex(prev => prev + 1);
    }
  };

  // Add/Remove Event Listener
  useEffect(() => {
    window.addEventListener('deviceorientation', handleTilt);
    return () => window.removeEventListener('deviceorientation', handleTilt);
  }, [gameState, feedback]);

  return (
    <div style={{ 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      backgroundColor: feedback === 'CORRECT!' ? '#4ade80' : feedback === 'PASS' ? '#f87171' : '#1e1e1e',
      color: 'white',
      fontFamily: 'sans-serif',
      transition: 'background-color 0.3s'
    }}>
      
      {gameState === 'menu' && (
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>HedzUp</h1>
          <p style={{ marginBottom: '2rem' }}>Tilt phone down for correct, up to pass.</p>
          <button 
            onClick={requestPermission}
            style={{ padding: '15px 30px', fontSize: '1.5rem', borderRadius: '50px', border: 'none', cursor: 'pointer' }}
          >
            Start Game
          </button>
        </div>
      )}

      {gameState === 'playing' && (
        <div style={{ textAlign: 'center', width: '100%' }} onClick={() => handleGuess(true)}>
          <h1 style={{ fontSize: '5rem', fontWeight: 'bold' }}>
            {feedback || WORDS[wordIndex]}
          </h1>
          <p style={{ marginTop: '2rem', opacity: 0.6 }}>(Tap screen if tilt fails)</p>
        </div>
      )}

      {gameState === 'finished' && (
        <div style={{ textAlign: 'center' }}>
          <h1>Game Over!</h1>
          <h2>Score: {score} / {WORDS.length}</h2>
          <button 
            onClick={() => setGameState('menu')}
            style={{ marginTop: '20px', padding: '10px 20px', fontSize: '1.2rem' }}
          >
            Play Again
          </button>
        </div>
      )}
    </div>
  );
}
