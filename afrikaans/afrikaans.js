< !DOCTYPE html >
    <html lang="en">
        <head>
            <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
                    <title>Lekker Lingo: Afrikaans 101</title>
                    <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
                    <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
                    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
                    <script src="https://cdn.tailwindcss.com"></script>
                    <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js"></script>
                    <style>
                        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Space+Grotesk:wght@400;500;700&display=swap');

                        :root {
                            --app - bg: #FDF6E3; /* Bone/Sand */
                        --primary: #D35400; /* Burnt Orange/Terracotta */
                        --secondary: #27AE60; /* Bushveld Green */
                        --tab-bar-bg: rgba(255, 255, 255, 0.95);
        }

                        html, body {
                            height: 100%;
                        margin: 0;
                        padding: 0;
                        overflow: hidden; /* Prevent body scroll, handle inside app */
        }

                        body {
                            font - family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
                        background-color: var(--app-bg);
                        color: #2c3e50;
                        -webkit-tap-highlight-color: transparent;
        }

                        #root {
                            height: 100%;
                        width: 100%;
        }

                        input, textarea {font - size: 16px !important; }

                        .font-display {font - family: 'Space Grotesk', sans-serif; }
                        .page-enter {animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
                        .scale-tap:active {transform: scale(0.96); transition: transform 0.1s; }

                        @keyframes slideUp {from {opacity: 0; transform: translateY(20px); } to {opacity: 1; transform: translateY(0); } }

                        @keyframes shake {
                            0 %, 100 % { transform: translateX(0); } 
            25% {transform: translateX(-5px); }
                        75% {transform: translateX(5px); } 
        }
                        .animate-shake {animation: shake 0.3s ease-in-out; }

                        @keyframes splatExpand {
                            0 % { transform: scale(0); opacity: 0; }
            50% {opacity: 0.8; }
                        100% {transform: scale(3); opacity: 0; }
        }
                        .animate-splat {
                            animation: splatExpand 0.6s cubic-bezier(0.19, 1, 0.22, 1) forwards;
                        transform-origin: center center;
        }

                        /* Custom Scrollbar for better UX */
                        .custom-scrollbar::-webkit-scrollbar {
                            width: 6px;
        }
                        .custom-scrollbar::-webkit-scrollbar-track {
                            background: transparent;
        }
                        .custom-scrollbar::-webkit-scrollbar-thumb {
                            background - color: rgba(0,0,0,0.1);
                        border-radius: 20px;
        }

                        .glass {background: var(--tab-bar-bg); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border-top: 0.5px solid rgba(0,0,0,0.1); }
                        .bush-gradient {background: linear-gradient(135deg, #D35400 0%, #E67E22 100%); }
                        .veld-gradient {background: linear-gradient(135deg, #27AE60 0%, #2ECC71 100%); }

                        .safe-pb {padding - bottom: env(safe-area-inset-bottom); }
                    </style>
                </head>
                <body>
                    <div id="root"></div>

                    <script type="text/babel">
                        const {useState, useEffect, useRef, useMemo} = React;

                        // --- ICONS (SVG) ---
                        const Icons = {
                            Map: ({active}) => <svg className={`w-6 h-6 ${active ? 'text-[#D35400]' : 'text-gray-400'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round"><path d="M1 6v16l7-4 8 4 7-4V2l-7 4-8-4-7 4z" /><line x1="8" y1="2" x2="8" y2="18" /><line x1="16" y1="6" x2="16" y2="22" /></svg>,
                        Learn: ({active}) => <svg className={`w-6 h-6 ${active ? 'text-[#D35400]' : 'text-gray-400'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>,
                        Profile: ({active}) => <svg className={`w-6 h-6 ${active ? 'text-[#D35400]' : 'text-gray-400'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>,
            Play: () => <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>,
            Check: () => <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>,
            Lock: () => <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg>,
            Bulb: () => <svg className="w-5 h-5 text-yellow-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>,
            Speaker: () => <svg className="w-6 h-6 text-[#D35400]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>,
            Flame: () => <svg className="w-4 h-4 text-[#D35400]" viewBox="0 0 24 24" fill="currentColor"><path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-5-6.33-5-6.33S1 10.62 1 12a2.5 2.5 0 002.5 2.5 2.5 2.5 0 002.5-2.5 2.5 2.5 0 002.5 2.5zM12 2c0 0-1.84 2.13-2.5 4.5C11 5.5 14 3 14 3s-2.13 6.66-4.5 9.5c.34-3 3-5.5 3-5.5s1.84 3.16 1.84 6.5C14.34 18.25 10.5 22 10.5 22s5.66-2.17 7-6.5C18.16 13.16 16.5 9.83 12 2z" /></svg>,
            Reset: () => <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
        };

                        // --- LINGUISTIC ENGINE ---
                        // Native speaker nuance: Authentic slang, correct phonetics, and "brain glue" mnemonics.
                        const VOCAB_DATA = [
                        {
                            id: 1,
                        category: "The Basics",
                        title: "Goeie more",
                        english: ["good morning"],
                        phonetic: "Khoy-uh mor-uh",
                        mnemonic: "Go to the MOOR for a morning walk.",
                        desc: "The 'G' in Afrikaans is a guttural sound, like clearing your throat.",
                        xp: 50
            },
                        {
                            id: 2,
                        category: "The Basics",
                        title: "Baie dankie",
                        english: ["thank you very much", "thanks a lot", "thank you"],
                        phonetic: "Buy-a dunky",
                        mnemonic: "If you are grateful, BUY A DONKEY for someone.",
                        desc: "Standard polite response. Use it often, boet!",
                        xp: 50
            },
                        {
                            id: 3,
                        category: "Slang",
                        title: "Lekker",
                        english: ["nice", "good", "great", "tasty"],
                        phonetic: "Lack-err",
                        mnemonic: "I LACK A... good time? No, it's LEKKER!",
                        desc: "The most versatile word. Food is lekker. The vibe is lekker. You are lekker.",
                        xp: 75
            },
                        {
                            id: 4,
                        category: "Essentials",
                        title: "Asseblief",
                        english: ["please"],
                        phonetic: "Ass-uh-bleef",
                        mnemonic: "Ask for a LEAF, please.",
                        desc: "Politeness gets you everywhere in South Africa.",
                        xp: 75
            },
                        {
                            id: 5,
                        category: "Greetings",
                        title: "Hoe gaan dit?",
                        english: ["how are you", "how is it going", "how are you?"],
                        phonetic: "Who khan dit",
                        mnemonic: "WHO CAN DO IT? Hoe gaan dit?",
                        desc: "Standard greeting. The reply is usually 'Goed, dankie' (Good, thanks).",
                        xp: 100
            },
                        {
                            id: 6,
                        category: "Essentials",
                        title: "Ja / Nee",
                        english: ["yes / no", "yes no"],
                        phonetic: "Ya / Nee-uh",
                        mnemonic: "YA, I agree. Or NEAR (Nee) I don't.",
                        desc: "Simple and essential. 'Ja-nee' is also a phrase meaning 'Sure' or 'I guess so'.",
                        xp: 50
            },
                        {
                            id: 7,
                        category: "Food",
                        title: "Braai",
                        english: ["bbq", "barbecue", "grill"],
                        phonetic: "Bry",
                        mnemonic: "Don't CRY at the BRY (Braai).",
                        desc: "It is NOT a BBQ. It is a Braai. It is a spiritual experience.",
                        xp: 100
            },
                        {
                            id: 8,
                        category: "Animals",
                        title: "Bobbejaan",
                        english: ["baboon"],
                        phonetic: "Bub-ba-yahn",
                        mnemonic: "Bob and John are monkeys.",
                        desc: "Watch out, they steal your food at Cape Point.",
                        xp: 125
            },
                        {
                            id: 9,
                        category: "Slang",
                        title: "Eish",
                        english: ["wow", "oh no", "yikes", "oh dear"],
                        phonetic: "Aysh",
                        mnemonic: "Saying 'ACE' but you are disappointed.",
                        desc: "Expresses resignation, surprise, or shock. Dropped your ice cream? Eish.",
                        xp: 125
            },
                        {
                            id: 10,
                        category: "Slang",
                        title: "Jol",
                        english: ["party", "fun", "good time"],
                        phonetic: "Yawl",
                        mnemonic: "Y'ALL come to the party.",
                        desc: "A party or having a good time. 'We had a lekker jol last night.'",
                        xp: 150
            }
                        ];

                        // --- COMPONENTS ---

                        const TabBar = ({active, onChange}) => (
                        <div className="fixed bottom-0 w-full glass safe-pb flex justify-around items-center h-[83px] z-50 px-2 pb-2">
                            {[{ id: 'path', icon: Icons.Map, label: 'Safari' }, { id: 'learn', icon: Icons.Learn, label: 'Lingo' }, { id: 'profile', icon: Icons.Profile, label: 'Passport' }].map(tab => (
                                <button key={tab.id} onClick={() => onChange(tab.id)} className="flex-1 flex flex-col items-center justify-center pt-2 active:scale-95 transition-transform">
                                    <tab.icon active={active === tab.id} />
                                    <span className={`text-[10px] font-bold mt-1 ${active === tab.id ? 'text-[#D35400]' : 'text-gray-400'}`}>{tab.label}</span>
                                </button>
                            ))}
                        </div>
                        );

                        const Header = ({title, subtitle, rightAction}) => (
                        <div className="sticky top-0 z-40 bg-[rgba(253,246,227,0.95)] backdrop-blur-xl border-b border-orange-100 px-4 pb-3 pt-12 flex justify-between items-end min-h-[110px]">
                            <div>
                                <div className="text-xs font-bold text-[#D35400] uppercase tracking-wide mb-1 flex items-center gap-1"><Icons.Flame /> {subtitle}</div>
                                <h1 className="text-3xl font-extrabold text-[#2c3e50] tracking-tight font-display">{title}</h1>
                            </div>
                            {rightAction}
                        </div>
                        );

                        const LevelCard = ({level, status, onClick}) => {
            const isLocked = status === 'locked';
                        const isDone = status === 'completed';
                        return (
                        <button onClick={() => !isLocked && onClick()} disabled={isLocked} className={`w-full text-left mb-4 p-5 rounded-2xl relative overflow-hidden transition-all scale-tap shadow-sm border ${isLocked ? 'bg-gray-100 border-transparent opacity-60' : 'bg-white border-orange-100'} ${isDone ? 'border-green-500/30 bg-green-50/50' : ''}`}>
                            <div className="flex justify-between items-start mb-2">
                                <span className={`text-[10px] font-bold uppercase tracking-wider py-1 px-2 rounded-md ${isDone ? 'bg-green-100 text-green-700' : (isLocked ? 'bg-gray-200 text-gray-500' : 'bg-[#FADBD8] text-[#C0392B]')}`}>{level.category}</span>
                                {isDone && <div className="bg-green-500 rounded-full p-1"><Icons.Check /></div>}
                                {isLocked && <Icons.Lock />}
                            </div>
                            <h3 className={`text-xl font-bold mb-1 font-display ${isLocked ? 'text-gray-400' : 'text-gray-900'}`}>{level.title}</h3>
                            <p className="text-sm text-gray-500 leading-snug">XP Reward: {level.xp}</p>
                            {!isLocked && <div className="mt-4 flex items-center gap-2 text-xs font-bold text-[#D35400]">{isDone ? 'PRACTICE AGAIN' : 'START LESSON'} <Icons.Play /></div>}
                        </button>
                        );
        };

                        const Editor = ({level, onNext}) => {
            const [input, setInput] = useState('');
                        const [status, setStatus] = useState('idle'); // idle, error, success
                        const [showHint, setShowHint] = useState(false);
                        const inputRef = useRef(null);

            useEffect(() => {
                            setInput('');
                        setStatus('idle');
                        setShowHint(false);
                // Auto focus input
                setTimeout(() => inputRef.current?.focus(), 100);
            }, [level]);

            const checkAnswer = () => {
                if (!input.trim()) return;

                        // Fuzzy matching logic
                        const cleanInput = input.toLowerCase().trim();
                const isCorrect = level.english.some(ans => cleanInput === ans.toLowerCase());

                        if (isCorrect) {
                            setStatus('success');
                        confetti({colors: ['#D35400', '#27AE60', '#F1C40F'], particleCount: 100, spread: 70, origin: {y: 0.6 } });
                } else {
                            setStatus('error');
                    // Shake effect handles via CSS class
                    setTimeout(() => setStatus('idle'), 800);
                }
            };

            const handleKeyDown = (e) => {
                if (e.key === 'Enter') checkAnswer();
            }

                        return (
                        <div className="flex flex-col h-full bg-[#FDF6E3] pb-[85px] relative overflow-hidden">

                            {/* Flash Card Area */}
                            <div className="flex-1 flex flex-col items-center justify-center p-6 relative overflow-y-auto custom-scrollbar">
                                {/* Visual Splat for Error */}
                                {status === 'error' && (
                                    <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
                                        <div className="w-[80vmin] h-[80vmin] bg-red-500 rounded-full opacity-20 animate-splat filter blur-xl"></div>
                                    </div>
                                )}

                                <div className="bg-white w-full max-w-md rounded-3xl shadow-xl p-8 text-center border border-orange-100 z-10 relative my-auto">
                                    <div className="text-sm font-bold text-gray-400 uppercase mb-4 tracking-widest">{level.category}</div>

                                    {/* The Afrikaans Word */}
                                    <h2 className="text-4xl md:text-5xl font-black text-[#2c3e50] mb-2 font-display">{level.title}</h2>

                                    {/* Phonetic Helper */}
                                    <div className="inline-flex items-center gap-2 bg-orange-50 text-[#D35400] px-3 py-1 rounded-full text-sm font-mono mb-6">
                                        <Icons.Speaker />
                                        {level.phonetic}
                                    </div>

                                    {/* Description */}
                                    <p className="text-gray-600 mb-8 leading-relaxed">{level.desc}</p>

                                    {/* Input Area */}
                                    {status !== 'success' ? (
                                        <div className={`relative transition-all ${status === 'error' ? 'animate-shake' : ''}`}>
                                            <input
                                                ref={inputRef}
                                                value={input}
                                                onChange={e => setInput(e.target.value)}
                                                onKeyDown={handleKeyDown}
                                                placeholder="Type english translation..."
                                                className={`w-full bg-[#F2F4F6] text-gray-900 text-lg font-medium p-4 rounded-xl border-2 focus:outline-none focus:ring-4 transition-all text-center
                                            ${status === 'error' ? 'border-red-400 ring-red-100' : 'border-transparent focus:border-[#D35400] focus:ring-orange-100'}
                                        `}
                                            />
                                            <button
                                                onClick={checkAnswer}
                                                className="absolute right-2 top-2 bottom-2 aspect-square bush-gradient rounded-lg flex items-center justify-center shadow-md active:scale-95 transition-transform"
                                            >
                                                <Icons.Play />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="animate-enter">
                                            <div className="text-green-600 font-bold text-xl mb-2">Lekker! That's correct.</div>
                                            <div className="bg-green-50 p-4 rounded-xl border border-green-100 text-green-800 text-sm mb-4">
                                                <strong>Memory Hack:</strong> {level.mnemonic}
                                            </div>
                                            <button onClick={onNext} className="w-full bush-gradient text-white py-4 rounded-xl font-bold shadow-lg text-lg active:scale-95 transition-transform">
                                                Next Word
                                            </button>
                                        </div>
                                    )}

                                    {/* Hint Toggle */}
                                    {status !== 'success' && (
                                        <button onClick={() => setShowHint(!showHint)} className="mt-6 text-sm text-gray-400 hover:text-[#D35400] flex items-center justify-center gap-1 mx-auto transition-colors">
                                            <Icons.Bulb /> {showHint ? level.mnemonic : "Need a hint?"}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                        );
        };

                        const Profile = ({xp, completed}) => (
                        <div className="p-4 pb-[100px]">
                            <div className="bg-white rounded-2xl p-6 shadow-sm mb-6 text-center border border-orange-100">
                                <div className="w-24 h-24 veld-gradient rounded-full mx-auto mb-4 flex items-center justify-center text-4xl shadow-xl shadow-green-500/20">🦁</div>
                                <h2 className="text-2xl font-bold mb-1 font-display">Bushveld Legend</h2>
                                <p className="text-gray-500 text-sm">Level {Math.floor(xp / 500) + 1} Guide</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100"><div className="text-[10px] text-gray-400 font-bold uppercase mb-1">Total XP</div><div className="text-3xl font-black text-[#D35400] font-display">{xp}</div></div>
                                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100"><div className="text-[10px] text-gray-400 font-bold uppercase mb-1">Words Mastered</div><div className="text-3xl font-black text-green-600 font-display">{completed.length} <span className="text-sm text-gray-300 font-normal">/ {VOCAB_DATA.length}</span></div></div>
                            </div>
                            <h3 className="font-bold text-gray-900 mb-3 ml-1 font-display">Achievements</h3>
                            <div className="space-y-3">
                                <div className={`bg-white p-4 rounded-xl flex items-center gap-4 border border-gray-100 ${completed.length >= 1 ? 'opacity-100' : 'opacity-50 grayscale'}`}><div className="text-2xl">🦌</div><div><div className="font-bold text-sm">Springbok</div><div className="text-xs text-gray-500">Learned your first word</div></div></div>
                                <div className={`bg-white p-4 rounded-xl flex items-center gap-4 border border-gray-100 ${completed.length >= 4 ? 'opacity-100' : 'opacity-50 grayscale'}`}><div className="text-2xl">🔥</div><div><div className="font-bold text-sm">Braai Master</div><div className="text-xs text-gray-500">Learned 4 words</div></div></div>
                                <div className={`bg-white p-4 rounded-xl flex items-center gap-4 border border-gray-100 ${completed.length >= 8 ? 'opacity-100' : 'opacity-50 grayscale'}`}><div className="text-2xl">👑</div><div><div className="font-bold text-sm">King of the Veld</div><div className="text-xs text-gray-500">Completed all basics</div></div></div>
                            </div>
                        </div>
                        );

        const App = () => {
            const [tab, setTab] = useState('path');
                        const [completed, setCompleted] = useState([]);
                        const [currentLevelId, setCurrentLevelId] = useState(1);
                        const [xp, setXp] = useState(0);

            // Persistence
            useEffect(() => { 
                const save = JSON.parse(localStorage.getItem('lekker_lingo_v1') || '{ }');
                        if (save.completed) setCompleted(save.completed);
                        if (save.xp) setXp(save.xp);
                        if (save.current) setCurrentLevelId(save.current); 
            }, []);
            
            useEffect(() => {
                            localStorage.setItem('lekker_lingo_v1', JSON.stringify({ completed, xp, current: currentLevelId })); 
            }, [completed, xp, currentLevelId]);

            const handleLevelSelect = (id) => {setCurrentLevelId(id); setTab('learn'); };
            
            const handleNextLevel = () => { 
                if (!completed.includes(currentLevelId)) {
                            setCompleted(p => [...p, currentLevelId]); 
                    setXp(p => p + VOCAB_DATA.find(l=>l.id===currentLevelId).xp); 
                }
                        if (currentLevelId < VOCAB_DATA.length) {
                            setCurrentLevelId(p => p + 1); 
                } else {
                            setTab('profile'); 
                } 
            };
            
            const resetProgress = () => {
                if(confirm("Are you sure you want to reset your progress?")) {
                            setCompleted([]);
                        setXp(0);
                        setCurrentLevelId(1);
                        localStorage.removeItem('lekker_lingo_v1');
                }
            }

                        return (
                        <div className="h-full flex flex-col">
                            <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#FDF6E3]">
                                {tab === 'path' && (
                                    <div className="page-enter pb-[100px]">
                                        <Header title="Your Journey" subtitle="Lekker Lingo" rightAction={<div className="bg-[#FADBD8] text-[#C0392B] font-bold px-3 py-1 rounded-full text-xs border border-red-100">{xp} XP</div>} />
                                        <div className="px-4 mt-2">
                                            {VOCAB_DATA.map(l => (
                                                <LevelCard
                                                    key={l.id}
                                                    level={l}
                                                    status={completed.includes(l.id) ? 'completed' : (l.id === currentLevelId ? 'active' : (l.id < currentLevelId ? 'completed' : 'locked'))}
                                                    onClick={() => handleLevelSelect(l.id)}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {tab === 'learn' && (
                                    <Editor level={VOCAB_DATA.find(l => l.id === currentLevelId)} onNext={handleNextLevel} />
                                )}

                                {tab === 'profile' && (
                                    <div className="page-enter">
                                        <Header
                                            title="Passport"
                                            subtitle="Stats"
                                            rightAction={<button onClick={resetProgress} className="text-gray-400 hover:text-red-500 transition-colors"><Icons.Reset /></button>}
                                        />
                                        <Profile xp={xp} completed={completed} />
                                    </div>
                                )}
                            </div>
                            <TabBar active={tab} onChange={setTab} />
                        </div>
                        );
        };

                        const root = ReactDOM.createRoot(document.getElementById('root'));
                        root.render(<App />);
                    </script>
                </body>
            </html>