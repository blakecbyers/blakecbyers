const { useState, useEffect, useRef, useMemo } = React;

const CoffeeSpill = () => (
    <div className="absolute inset-0 z-[60] flex items-center justify-center overflow-hidden pointer-events-none">
        <svg viewBox="0 0 200 200" className="w-[150vmin] h-[150vmin] animate-spill fill-[#3E2723] opacity-95 drop-shadow-2xl">
            <path d="M44.7,-76.4C58.9,-69.2,71.8,-59.1,79.6,-46.3C87.4,-33.5,90.1,-17.9,89.3,-2.6C88.5,12.7,84.2,27.7,75.6,40.6C67,53.5,54.1,64.2,40.3,71.3C26.5,78.4,11.8,81.8,-1.8,84.9C-15.4,88,-29.4,90.8,-41.8,84.6C-54.2,78.4,-65,63.2,-73.4,48.2C-81.8,33.2,-87.8,18.4,-86.9,4.1C-86,-10.2,-78.2,-24,-68.6,-36.2C-59,-48.4,-47.6,-59,-35.3,-67.2C-23,-75.4,-9.8,-81.2,4.1,-88.3C18,-95.4,30.5,-103.8,44.7,-76.4Z" transform="translate(100 100)" />
        </svg>
    </div>
);

const TabBar = ({ active, onChange }) => (
    <div className="fixed bottom-0 w-full glass safe-pb flex justify-around items-center h-[83px] z-50 px-2 pb-2">
        {[{ id: 'curriculum', icon: Icons.Map, label: 'Board' }, { id: 'editor', icon: Icons.Code, label: 'Brewer' }, { id: 'profile', icon: Icons.Profile, label: 'Barista' }].map(tab => (
            <button key={tab.id} onClick={() => onChange(tab.id)} className="flex-1 flex flex-col items-center justify-center pt-2 active:scale-95 transition-transform">
                <tab.icon active={active === tab.id} />
                <span className={`text-[10px] font-bold mt-1 ${active === tab.id ? 'text-[#A97142]' : 'text-gray-400'}`}>{tab.label}</span>
            </button>
        ))}
    </div>
);

const Header = ({ title, subtitle, rightAction }) => (
    <div className="sticky top-0 z-40 bg-[rgba(242,242,247,0.85)] backdrop-blur-xl border-b border-gray-200 px-4 pb-3 pt-12 flex justify-between items-end min-h-[110px]">
        <div>
            <div className="text-xs font-bold text-[#A97142] uppercase tracking-wide mb-1 flex items-center gap-1"><Icons.Bean /> {subtitle}</div>
            <h1 className="text-3xl font-extrabold text-black tracking-tight">{title}</h1>
        </div>
        {rightAction}
    </div>
);

const LevelCard = ({ level, status, onClick }) => {
    const isLocked = status === 'locked';
    const isDone = status === 'completed';
    return (
        <button onClick={() => !isLocked && onClick()} disabled={isLocked} className={`w-full text-left mb-4 p-5 rounded-2xl relative overflow-hidden transition-all scale-tap shadow-sm border ${isLocked ? 'bg-gray-100 border-transparent opacity-60' : 'bg-white border-gray-200'} ${isDone ? 'border-green-500/30 bg-green-50/50' : ''}`}>
            <div className="flex justify-between items-start mb-2">
                <span className={`text-[10px] font-bold uppercase tracking-wider py-1 px-2 rounded-md ${isDone ? 'bg-green-100 text-green-700' : (isLocked ? 'bg-gray-200 text-gray-500' : 'bg-[#EAD7C7] text-[#8B5E3C]')}`}>Order #{level.id}</span>
                {isDone && <div className="bg-green-500 rounded-full p-1"><Icons.Check /></div>}
                {isLocked && <Icons.Lock />}
            </div>
            <h3 className={`text-xl font-bold mb-1 ${isLocked ? 'text-gray-400' : 'text-gray-900'}`}>{level.title}</h3>
            <p className="text-sm text-gray-500 leading-snug">{level.desc}</p>
            {!isLocked && <div className="mt-4 flex items-center gap-2 text-xs font-bold text-[#A97142]">{isDone ? 'RE-BREW' : 'START BREWING'} <Icons.Play /></div>}
        </button>
    );
};

const Editor = ({ level, onNext, engine }) => {
    const [input, setInput] = useState('');
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [isCleaning, setIsCleaning] = useState(false);
    const [showHint, setShowHint] = useState(false);
    const [success, setSuccess] = useState(false);
    const textareaRef = useRef(null);

    useEffect(() => { setInput(''); setResult(null); setError(null); setSuccess(false); setShowHint(false); setIsCleaning(false); }, [level]);

    const run = () => {
        if (isCleaning) return;
        if (textareaRef.current) textareaRef.current.blur();

        setError(null);
        const res = engine.execute(input);
        if (res.success) {
            setResult(res.data);
            if (res.data.length > 0 && level.check(res.data)) {
                setSuccess(true);
                confetti({ colors: ['#A97142', '#D4A373', '#FFFFFF'], particleCount: 100, spread: 70, origin: { y: 0.6 } });
            } else {
                triggerSpill("Order incorrect! Taste is awful.");
            }
        } else {
            triggerSpill(res.error);
        }
    };

    const triggerSpill = (msg) => {
        setResult(null);
        setError(msg);
        setIsCleaning(true);
        setTimeout(() => setIsCleaning(false), 3000);
    };

    const insert = (txt) => {
        if (!isCleaning) setInput(prev => prev + txt + " ");
    };

    return (
        <div className="flex flex-col h-full bg-gray-50 pb-[85px] relative overflow-hidden">
            {isCleaning && <CoffeeSpill />}

            <div className="bg-white p-4 shadow-sm z-10 shrink-0">
                <div className="flex justify-between items-start mb-2">
                    <h2 className="font-bold text-gray-900">{level.title}</h2>
                    <button onClick={() => setShowHint(!showHint)} className="text-yellow-500 p-1 bg-yellow-50 rounded-full"><Icons.Bulb /></button>
                </div>
                <p className="text-sm text-gray-600 mb-3">{level.task}</p>
                {showHint && <div className="text-xs font-mono bg-yellow-50 text-yellow-800 p-2 rounded border border-yellow-200 mb-2 animate-enter">Hint: {level.hint}</div>}
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                    {["SELECT", "*", "FROM", "WHERE", "price", "caffeine", "menu", "customers"].map(t => (
                        <button key={t} onClick={() => insert(t)} disabled={isCleaning} className="px-3 py-1 bg-[#F2F2F7] border border-gray-200 active:bg-gray-200 rounded-full text-xs font-semibold text-gray-700 whitespace-nowrap transition-colors disabled:opacity-50">{t}</button>
                    ))}
                </div>
            </div>

            <div className="flex-1 relative bg-[#1E1E1E] min-h-[150px]">
                <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    disabled={isCleaning}
                    placeholder={isCleaning ? "Cleaning up the mess..." : "Pour your SQL here..."}
                    className="w-full h-full bg-transparent text-[#D4D4D4] font-mono p-4 text-base resize-none focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                    spellCheck="false"
                />
                <button onClick={run} disabled={isCleaning} className={`absolute bottom-4 right-4 coffee-gradient text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg transition-transform z-20 ${isCleaning ? 'scale-90 opacity-80' : 'active:scale-90'}`}>
                    {isCleaning ? <Icons.Clean /> : <Icons.Play />}
                </button>
            </div>

            <div className={`shrink-0 h-1/3 bg-white border-t border-gray-200 overflow-y-auto p-4 transition-all safe-pb`}>
                {error && (
                    <div className="text-red-500 text-sm font-semibold flex items-center gap-2 animate-shake">
                        <span className="text-lg">☕️</span> <span>Spilled! {isCleaning ? "Wait for cleanup..." : error}</span>
                    </div>
                )}
                {success && (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                        <h3 className="text-2xl font-bold text-[#A97142] mb-1">Delicious!</h3>
                        <p className="text-gray-500 mb-4 text-sm">Order served. +{level.xp} XP</p>
                        <button onClick={onNext} className="coffee-gradient text-white px-8 py-3 rounded-full font-bold shadow-lg active:scale-95 transition-transform">Next Order</button>
                    </div>
                )}
                {!error && !success && result && (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead><tr className="border-b">{Object.keys(result[0]).map(k => <th key={k} className="py-2 px-3 text-gray-400 font-bold text-[10px] uppercase">{k}</th>)}</tr></thead>
                            <tbody>{result.map((r, i) => <tr key={i} className="border-b last:border-0 border-gray-100">{Object.values(r).map((v, j) => <td key={j} className="py-2 px-3 font-mono text-gray-800 text-xs">{v}</td>)}</tr>)}</tbody>
                        </table>
                    </div>
                )}
                {!result && !error && !success && (
                    <div className="text-center text-gray-400 mt-8 text-sm flex flex-col items-center gap-2"><span className="text-2xl opacity-50">🍵</span>Waiting for the brew...</div>
                )}
            </div>
        </div>
    );
};

const Profile = ({ xp, completed }) => (
    <div className="p-4 pb-[100px]">
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6 text-center border border-gray-100">
            <div className="w-24 h-24 coffee-gradient rounded-full mx-auto mb-4 flex items-center justify-center text-4xl shadow-xl shadow-[#A97142]/20">👨‍🍳</div>
            <h2 className="text-2xl font-bold mb-1">Head Barista</h2>
            <p className="text-gray-500 text-sm">Level {Math.floor(xp / 500) + 1} Roaster</p>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100"><div className="text-[10px] text-gray-400 font-bold uppercase mb-1">Experience</div><div className="text-3xl font-black text-[#A97142]">{xp}</div></div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100"><div className="text-[10px] text-gray-400 font-bold uppercase mb-1">Orders Filled</div><div className="text-3xl font-black text-green-600">{completed.length} <span className="text-sm text-gray-300 font-normal">/ {LEVELS.length}</span></div></div>
        </div>
        <h3 className="font-bold text-gray-900 mb-3 ml-1">Certifications</h3>
        <div className="space-y-3">
            <div className={`bg-white p-4 rounded-xl flex items-center gap-4 border border-gray-100 ${completed.length >= 1 ? 'opacity-100' : 'opacity-50 grayscale'}`}><div className="text-2xl">🍼</div><div><div className="font-bold text-sm">Milk Steamer</div><div className="text-xs text-gray-500">Completed the first order</div></div></div>
            <div className={`bg-white p-4 rounded-xl flex items-center gap-4 border border-gray-100 ${completed.length >= 4 ? 'opacity-100' : 'opacity-50 grayscale'}`}><div className="text-2xl">☕️</div><div><div className="font-bold text-sm">Latte Artist</div><div className="text-xs text-gray-500">Completed 4 orders</div></div></div>
            <div className={`bg-white p-4 rounded-xl flex items-center gap-4 border border-gray-100 ${completed.length >= 8 ? 'opacity-100' : 'opacity-50 grayscale'}`}><div className="text-2xl">👑</div><div><div className="font-bold text-sm">Coffee King</div><div className="text-xs text-gray-500">Mastered the menu (All Levels)</div></div></div>
        </div>
    </div>
);
