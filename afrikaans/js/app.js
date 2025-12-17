const App = () => {
    const [tab, setTab] = useState('path');
    const [completed, setCompleted] = useState([]);
    const [currentLevelId, setCurrentLevelId] = useState(1);
    const [xp, setXp] = useState(0);

    // Persistence
    useEffect(() => {
        const save = JSON.parse(localStorage.getItem('lekker_lingo_v1') || '{}');
        if (save.completed) setCompleted(save.completed);
        if (save.xp) setXp(save.xp);
        if (save.current) setCurrentLevelId(save.current);
    }, []);

    useEffect(() => {
        localStorage.setItem('lekker_lingo_v1', JSON.stringify({ completed, xp, current: currentLevelId }));
    }, [completed, xp, currentLevelId]);

    const handleLevelSelect = (id) => { setCurrentLevelId(id); setTab('learn'); };

    const handleNextLevel = () => {
        if (!completed.includes(currentLevelId)) {
            setCompleted(p => [...p, currentLevelId]);
            setXp(p => p + VOCAB_DATA.find(l => l.id === currentLevelId).xp);
        }
        if (currentLevelId < VOCAB_DATA.length) {
            setCurrentLevelId(p => p + 1);
        } else {
            setTab('profile');
        }
    };

    const resetProgress = () => {
        if (confirm("Are you sure you want to reset your progress?")) {
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
