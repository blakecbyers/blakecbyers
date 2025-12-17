const sqlEngine = new SQLEngine(DB);

const App = () => {
    const [tab, setTab] = useState('curriculum');
    const [completed, setCompleted] = useState([]);
    const [currentLevelId, setCurrentLevelId] = useState(1);
    const [xp, setXp] = useState(0);

    useEffect(() => { const save = JSON.parse(localStorage.getItem('sql_coffee_v3') || '{}'); if (save.completed) setCompleted(save.completed); if (save.xp) setXp(save.xp); if (save.current) setCurrentLevelId(save.current); }, []);
    useEffect(() => { localStorage.setItem('sql_coffee_v3', JSON.stringify({ completed, xp, current: currentLevelId })); }, [completed, xp, currentLevelId]);

    const handleLevelSelect = (id) => { setCurrentLevelId(id); setTab('editor'); };
    const handleNextLevel = () => { if (!completed.includes(currentLevelId)) { setCompleted(p => [...p, currentLevelId]); setXp(p => p + LEVELS.find(l => l.id === currentLevelId).xp); } if (currentLevelId < LEVELS.length) { setCurrentLevelId(p => p + 1); } else { setTab('profile'); } };

    return (
        <div className="h-full flex flex-col">
            <div className="flex-1 overflow-y-auto no-scrollbar bg-[#F2F2F7]">
                {tab === 'curriculum' && (
                    <div className="page-enter pb-[100px]">
                        <Header title="Orders" subtitle="Daily Grind" rightAction={<div className="bg-[#EAD7C7] text-[#8B5E3C] font-bold px-3 py-1 rounded-full text-xs">{xp} XP</div>} />
                        <div className="px-4 mt-2">
                            {LEVELS.map(l => (
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
                {tab === 'editor' && <Editor level={LEVELS.find(l => l.id === currentLevelId)} onNext={handleNextLevel} engine={sqlEngine} />}
                {tab === 'profile' && <div className="page-enter"><Header title="My Career" subtitle="Barista Stats" /><Profile xp={xp} completed={completed} /></div>}
            </div>
            <TabBar active={tab} onChange={setTab} />
        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
