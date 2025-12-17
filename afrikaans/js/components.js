const { useState, useEffect, useRef, useMemo } = React;

const TabBar = ({ active, onChange }) => (
    <div className="fixed bottom-0 w-full glass safe-pb flex justify-around items-center h-[83px] z-50 px-2 pb-2">
        {[{ id: 'path', icon: Icons.Map, label: 'Safari' }, { id: 'learn', icon: Icons.Learn, label: 'Lingo' }, { id: 'profile', icon: Icons.Profile, label: 'Passport' }].map(tab => (
            <button key={tab.id} onClick={() => onChange(tab.id)} className="flex-1 flex flex-col items-center justify-center pt-2 active:scale-95 transition-transform">
                <tab.icon active={active === tab.id} />
                <span className={`text-[10px] font-bold mt-1 ${active === tab.id ? 'text-[#D35400]' : 'text-gray-400'}`}>{tab.label}</span>
            </button>
        ))}
    </div>
);

const Header = ({ title, subtitle, rightAction }) => (
    <div className="sticky top-0 z-40 bg-[rgba(253,246,227,0.95)] backdrop-blur-xl border-b border-orange-100 px-4 pb-3 pt-12 flex justify-between items-end min-h-[110px]">
        <div>
            <div className="text-xs font-bold text-[#D35400] uppercase tracking-wide mb-1 flex items-center gap-1"><Icons.Flame /> {subtitle}</div>
            <h1 className="text-3xl font-extrabold text-[#2c3e50] tracking-tight font-display">{title}</h1>
        </div>
        {rightAction}
    </div>
);

const LevelCard = ({ level, status, onClick }) => {
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

const Editor = ({ level, onNext }) => {
    const [input, setInput] = useState('');
    const [status, setStatus] = useState('idle'); // idle, error, success
    const [showHint, setShowHint] = useState(false);
    const inputRef = useRef(null);

    useEffect(() => {
        setInput('');
        setStatus('idle');
        setShowHint(false);
        setTimeout(() => inputRef.current?.focus(), 100);
    }, [level]);

    const checkAnswer = () => {
        if (!input.trim()) return;
        const cleanInput = input.toLowerCase().trim();
        const isCorrect = level.english.some(ans => cleanInput === ans.toLowerCase());

        if (isCorrect) {
            setStatus('success');
            confetti({ colors: ['#D35400', '#27AE60', '#F1C40F'], particleCount: 100, spread: 70, origin: { y: 0.6 } });
        } else {
            setStatus('error');
            setTimeout(() => setStatus('idle'), 800);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') checkAnswer();
    }

    return (
        <div className="flex flex-col h-full bg-[#FDF6E3] pb-[85px] relative overflow-hidden">
            <div className="flex-1 flex flex-col items-center justify-center p-6 relative overflow-y-auto custom-scrollbar">
                {status === 'error' && (
                    <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
                        <div className="w-[80vmin] h-[80vmin] bg-red-500 rounded-full opacity-20 animate-splat filter blur-xl"></div>
                    </div>
                )}

                <div className="bg-white w-full max-w-md rounded-3xl shadow-xl p-8 text-center border border-orange-100 z-10 relative my-auto">
                    <div className="text-sm font-bold text-gray-400 uppercase mb-4 tracking-widest">{level.category}</div>
                    <h2 className="text-4xl md:text-5xl font-black text-[#2c3e50] mb-2 font-display">{level.title}</h2>
                    <div className="inline-flex items-center gap-2 bg-orange-50 text-[#D35400] px-3 py-1 rounded-full text-sm font-mono mb-6">
                        <Icons.Speaker />
                        {level.phonetic}
                    </div>
                    <p className="text-gray-600 mb-8 leading-relaxed">{level.desc}</p>

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
                            <button onClick={checkAnswer} className="absolute right-2 top-2 bottom-2 aspect-square bush-gradient rounded-lg flex items-center justify-center shadow-md active:scale-95 transition-transform"><Icons.Play /></button>
                        </div>
                    ) : (
                        <div className="animate-enter">
                            <div className="text-green-600 font-bold text-xl mb-2">Lekker! That's correct.</div>
                            <div className="bg-green-50 p-4 rounded-xl border border-green-100 text-green-800 text-sm mb-4">
                                <strong>Memory Hack:</strong> {level.mnemonic}
                            </div>
                            <button onClick={onNext} className="w-full bush-gradient text-white py-4 rounded-xl font-bold shadow-lg text-lg active:scale-95 transition-transform">Next Word</button>
                        </div>
                    )}

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

const Profile = ({ xp, completed }) => (
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
