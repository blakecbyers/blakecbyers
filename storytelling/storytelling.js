const { useState, useEffect, useMemo, useRef } = React;

// Custom Lucide Icon Component for Standalone Use
const Icon = ({ name, size = 24, className = "" }) => {
  const iconData = window.lucide ? window.lucide[name] : null;
  if (!iconData) return null;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {iconData.map(([tag, attrs], i) => React.createElement(tag, { key: i, ...attrs }))}
    </svg>
  );
};

const X = (props) => <Icon name="X" {...props} />;
const ChevronRight = (props) => <Icon name="ChevronRight" {...props} />;
const Zap = (props) => <Icon name="Zap" {...props} />;
const Trash2 = (props) => <Icon name="Trash2" {...props} />;
const PenTool = (props) => <Icon name="PenTool" {...props} />;
const Lock = (props) => <Icon name="Lock" {...props} />;

/**
 * THE ARC - Masterclass Edition
 * * Design Language: "Swiss Editorial meets Cinematic Noir"
 * Visual Rules:
 * - High Contrast: Obsidian (#050505) vs Parchment (#EBE9D8)
 * - Accent: Luxo Yellow (#FFD600) used sparingly.
 * - Motion: Physics-based, heavy damping.
 */

// --- DATA: THE 22 RULES ---
const RULES = [
  { id: 1, title: "The Struggle", content: "You admire a character for trying more than for their successes.", subtitle: "Admire the Attempt" },
  { id: 2, title: "Audience First", content: "You gotta keep in mind what's interesting to you as an audience, not what's fun to do as a writer.", subtitle: "Kill the Ego" },
  { id: 3, title: "Theme", content: "Trying for theme is important, but you won't see what the story is actually about til you're at the end of it.", subtitle: "Rewrite to Find It" },
  { id: 4, title: "The Spine", content: "Once upon a time there was ___. Every day, ___. One day ___. Because of that, ___. Until finally ___.", subtitle: "Structure is Safety" },
  { id: 5, title: "Simplify & Focus", content: "Simplify. Focus. Combine characters. Hop over detours. You'll feel like you're losing valuable stuff but it sets you free.", type: "interactive", mode: "crucible", subtitle: "The Crucible" },
  { id: 6, title: "Comfort", content: "What is your character good at, comfortable with? Throw the polar opposite at them.", subtitle: "Disrupt Comfort" },
  { id: 7, title: "Endings", content: "Come up with your ending before you figure out your middle. Seriously. Endings are hard, get yours working up front.", subtitle: "Land the Plane" },
  { id: 8, title: "Finish It", content: "Finish your story, let go even if it's not perfect. In an ideal world you have both, but move on.", subtitle: "Done > Perfect" },
  { id: 9, title: "The Anti-List", content: "When you're stuck, make a list of what WOULDN'T happen next.", subtitle: "Invert the Block" },
  { id: 10, title: "Deconstruct", content: "Pull apart the stories you like. What you like in them is a part of you.", subtitle: "Taste is Biology" },
  { id: 11, title: "Paper Fixes", content: "Putting it on paper lets you start fixing it. If it stays in your head, a perfect idea, you'll never share it with anyone.", subtitle: "Exorcise the Idea" },
  { id: 12, title: "Discount the 1st", content: "Discount the 1st thing that comes to mind. And the 2nd, 3rd, 4th, 5th – get the obvious out of the way.", type: "interactive", mode: "cut", subtitle: "The Cut" },
  { id: 13, title: "Opinions", content: "Give your characters opinions. Passive/malleable might seem likable to you as you write, but it's poison.", subtitle: "Passivity is Poison" },
  { id: 14, title: "Burning Belief", content: "Why must you tell THIS story? What's the belief burning within you that your story feeds off of?", subtitle: "The Heart" },
  { id: 15, title: "Honesty", content: "If you were your character, in this situation, how would you feel? Honesty lends credibility to unbelievable situations.", type: "interactive", mode: "mirror", subtitle: "The Mirror" },
  { id: 16, title: "Stakes", content: "What are the stakes? Give us reason to root for the character. What happens if they don't succeed?", subtitle: "Raise the Cost" },
  { id: 17, title: "No Waste", content: "No work is ever wasted. If it's not working, let go and move on.", subtitle: "Recycle Later" },
  { id: 18, title: "Know Yourself", content: "You have to know yourself: the difference between doing your best & fussing.", subtitle: "Testing vs. Refining" },
  { id: 19, title: "Coincidences", content: "Coincidences to get characters into trouble are great; coincidences to get them out of it are cheating.", subtitle: "Trouble is Free" },
  { id: 20, title: "Exercise", content: "Exercise: take the building blocks of a movie you dislike. How d'you rearrange them into what you DO like?", subtitle: "Fix the Bad" },
  { id: 21, title: "Identification", content: "You gotta identify with your situation/characters, can't just write 'cool'. What would make YOU act that way?", subtitle: "Be the Actor" },
  { id: 22, title: "Essence", content: "What's the essence of your story? Most economical telling of it? If you know that, you can build out from there.", subtitle: "Speak it or Silence" },
];

// --- COMPONENTS ---

// 1. THE CRUCIBLE (Rule 5)
const TheCrucible = ({ onComplete, onExit }) => {
  const [words, setWords] = useState([]);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    const sentence = [
      { text: "Simplify", keep: true },
      { text: "your", keep: false },
      { text: "process.", keep: false },
      { text: "Focus.", keep: true },
      { text: "Combine", keep: true },
      { text: "multiple", keep: false },
      { text: "characters.", keep: true },
      { text: "Hop", keep: true },
      { text: "over", keep: true },
      { text: "boring", keep: false },
      { text: "detours.", keep: true },
      { text: "It", keep: true },
      { text: "sets", keep: true },
      { text: "you", keep: true },
      { text: "totally", keep: false },
      { text: "free.", keep: true },
    ];
    setWords(sentence.map((w, i) => ({ ...w, id: i, visible: true })));
  }, []);

  const handleWordClick = (id, keep) => {
    if (completed) return;
    if (!keep) {
      setWords(prev => prev.map(w => w.id === id ? { ...w, visible: false } : w));
    } else {
      const container = document.getElementById('crucible-container');
      if (container) {
        container.classList.add('animate-shake-harsh');
        setTimeout(() => container.classList.remove('animate-shake-harsh'), 300);
      }
    }
  };

  useEffect(() => {
    const remainingBad = words.filter(w => !w.keep && w.visible);
    if (words.length > 0 && remainingBad.length === 0 && !completed) {
      setCompleted(true);
      setTimeout(onComplete, 1800);
    }
  }, [words, completed, onComplete]);

  return (
    <div id="crucible-container" className="flex flex-col h-full justify-center max-w-4xl mx-auto px-8 lg:px-16 relative">
      <div className="absolute right-0 top-1/2 -translate-y-1/2 text-[20rem] font-serif text-[#EBE9D8] opacity-[0.03] pointer-events-none select-none leading-none">
        05
      </div>

      <div className="mb-16 border-l-2 border-[#FFD600] pl-6">
        <h2 className="text-[#FFD600] font-sans text-xs tracking-[0.4em] uppercase mb-3">The Crucible</h2>
        <h1 className="text-4xl md:text-5xl font-serif text-[#EBE9D8] tracking-tight">Strip the scene to its bones.</h1>
      </div>

      <div className="flex flex-wrap gap-x-1 gap-y-2 md:gap-y-6 text-4xl md:text-6xl font-serif leading-none text-[#EBE9D8]">
        {words.map((word) => (
          <span
            key={word.id}
            onClick={() => handleWordClick(word.id, word.keep)}
            className={`
                cursor-pointer transition-all duration-500 ease-in-out overflow-hidden whitespace-nowrap
                ${word.visible ? 'max-w-[300px] opacity-100 mr-3' : 'max-w-0 opacity-0 mr-0'}
                ${word.keep ? 'hover:text-[#EBE9D8] cursor-crosshair' : 'hover:text-red-500 hover:scale-95'}
              `}
          >
            {word.text}
          </span>
        ))}
      </div>

      {completed && (
        <div className="absolute bottom-12 left-0 w-full text-center animate-fade-in-up">
          <div className="text-[#FFD600] font-sans text-sm tracking-[0.5em] uppercase border-t border-[#FFD600]/20 inline-block pt-4">
            Essence Revealed
          </div>
        </div>
      )}

      <button onClick={onExit} className="absolute top-8 right-8 text-[#EBE9D8]/20 hover:text-[#FFD600] transition-colors duration-300">
        <X size={24} />
      </button>
    </div>
  );
};

// 2. THE CUT (Rule 12)
const TheCut = ({ onComplete, onExit }) => {
  const [ideas, setIdeas] = useState([]);
  const [input, setInput] = useState("");
  const [shake, setShake] = useState(false);
  const [phase, setPhase] = useState("brainstorm");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    if (ideas.length < 5) {
      const newIdeas = [...ideas, { text: input, status: 'rejected' }];
      setIdeas(newIdeas);
      setInput("");
      setShake(true);
      setTimeout(() => setShake(false), 400);
    } else {
      const newIdeas = [...ideas, { text: input, status: 'accepted' }];
      setIdeas(newIdeas);
      setInput("");
      setPhase("success");
      setTimeout(onComplete, 2500);
    }
  };

  return (
    <div className="flex flex-col h-full max-w-2xl mx-auto px-8 pt-32 relative">
      <div className="absolute left-[-10%] top-20 text-[15rem] font-serif text-[#EBE9D8] opacity-[0.03] pointer-events-none select-none">
        12
      </div>

      <div className="mb-12">
        <h2 className="text-[#FFD600] font-sans text-xs tracking-[0.3em] uppercase mb-4">Rule #12</h2>
        <h1 className="text-4xl font-serif text-[#EBE9D8] tracking-tight mb-2">Discount the first five.</h1>
        <p className="text-[#EBE9D8]/40 font-serif italic">Get the obvious out of the way.</p>
      </div>

      <div className="flex-1 mb-8 relative h-[300px]">
        {ideas.map((idea, idx) => (
          <div
            key={idx}
            style={{
              top: idx * 40,
              scale: 1 - (idx * 0.05),
              zIndex: idx
            }}
            className={`
                absolute w-full p-6 border-b border-[#EBE9D8]/10 bg-[#050505] backdrop-blur-sm
                transition-all duration-700 ease-out
                ${idea.status === 'rejected' ? 'opacity-30 translate-y-4' : 'opacity-100 border-[#FFD600]/50 bg-[#FFD600]/5 translate-y-0'}
            `}
          >
            <div className="flex justify-between items-center">
              <span className={`font-serif text-xl ${idea.status === 'rejected' ? 'line-through decoration-red-900' : 'text-[#FFD600]'}`}>{idea.text}</span>
              {idea.status === 'rejected' && <span className="text-xs font-sans text-red-900 uppercase tracking-widest">Cliche</span>}
              {idea.status === 'accepted' && <span className="text-xs font-sans text-[#FFD600] uppercase tracking-widest">Gold</span>}
            </div>
          </div>
        ))}
      </div>

      {phase === 'brainstorm' && (
        <form onSubmit={handleSubmit} className={`relative mt-auto mb-20 ${shake ? 'animate-shake-harsh' : ''}`}>
          <input
            autoFocus
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={ideas.length < 5 ? `Idea No. ${ideas.length + 1}` : "The Sixth Idea."}
            className="w-full bg-transparent border-b-2 border-[#EBE9D8]/20 py-4 text-3xl font-serif text-[#EBE9D8] focus:outline-none focus:border-[#FFD600] placeholder-[#EBE9D8]/10 transition-colors"
          />
          <button type="submit" className="absolute right-0 top-4 text-[#EBE9D8]/20 hover:text-[#FFD600] transition-colors duration-300">
            <ChevronRight size={32} />
          </button>
        </form>
      )}

      <button onClick={onExit} className="absolute top-8 right-8 text-[#EBE9D8]/20 hover:text-[#EBE9D8] transition-colors">
        <X size={24} />
      </button>
    </div>
  );
};

// 3. THE MIRROR (Rule 15)
const TheMirror = ({ onComplete, onExit }) => {
  const [text, setText] = useState("");
  const [weight, setWeight] = useState(300);

  useEffect(() => {
    const baseWeight = 300;
    const honestWords = ['fear', 'love', 'hate', 'afraid', 'secret', 'never', 'truth', 'died', 'kill', 'wish'];
    const wordCount = text.split(' ').filter(w => honestWords.includes(w.toLowerCase().replace(/[.,]/g, ''))).length;
    const targetWeight = baseWeight + Math.min(text.length * 0.8, 300) + (wordCount * 80);
    setWeight(targetWeight);
  }, [text]);

  const handleComplete = () => {
    if (text.length > 20) onComplete();
  }

  return (
    <div className="flex flex-col h-full max-w-3xl mx-auto px-8 pt-24 relative">
      <div className="absolute right-10 bottom-10 text-[10rem] font-serif text-[#EBE9D8] opacity-[0.03] pointer-events-none select-none">
        15
      </div>

      <div className="mb-12 flex justify-between items-end border-b border-[#EBE9D8]/10 pb-6">
        <div>
          <h2 className="text-[#FFD600] font-sans text-xs tracking-[0.3em] uppercase mb-2">Rule #15</h2>
          <h1 className="text-3xl font-serif text-[#EBE9D8] tracking-tight">The Mirror</h1>
        </div>
        <p className="text-[#EBE9D8]/40 font-serif italic text-sm hidden md:block">Honesty lends credibility.</p>
      </div>

      <textarea
        autoFocus
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="How do you really feel?"
        style={{
          fontWeight: Math.min(weight, 900),
          letterSpacing: `${-0.02 * (weight / 900)}em`
        }}
        className="flex-1 w-full bg-transparent resize-none border-none focus:ring-0 text-3xl md:text-6xl font-serif text-[#EBE9D8] placeholder-[#EBE9D8]/5 transition-all duration-500 leading-[1.1]"
      />

      <div className="pb-12 pt-6">
        <button
          onClick={handleComplete}
          disabled={text.length < 20}
          className={`
                group w-full py-4 border-y border-[#EBE9D8]/10 text-[#EBE9D8]/40 hover:text-[#FFD600] hover:border-[#FFD600]/30
                font-sans text-xs tracking-[0.3em] uppercase transition-all duration-500 flex justify-between items-center
                ${text.length < 20 ? 'opacity-0 pointer-events-none' : 'opacity-100'}
            `}
        >
          <span>Confirm Truth</span>
          <span className="transform group-hover:translate-x-2 transition-transform duration-300">→</span>
        </button>
      </div>

      <button onClick={onExit} className="absolute top-8 right-8 text-[#EBE9D8]/20 hover:text-[#EBE9D8] transition-colors">
        <X size={24} />
      </button>
    </div>
  );
};

// 4. MAIN DASHBOARD (Story Spine)
const Dashboard = ({ progress, onSelectRule }) => {
  const nodes = useMemo(() => {
    return RULES.map((rule, i) => {
      const isUnlocked = i === 0 || progress[RULES[i - 1].id];
      const isCompleted = progress[rule.id];
      const align = i % 2 === 0 ? 'left' : 'right';
      return { ...rule, align, isUnlocked, isCompleted };
    });
  }, [progress]);

  const density = Object.keys(progress).length / 22;

  return (
    <div className="max-w-4xl mx-auto px-6 py-20 relative min-h-screen">
      <header className="mb-32 pl-4 md:pl-0 pt-10">
        <h1 className="text-7xl md:text-9xl font-serif text-[#EBE9D8] tracking-tighter mb-2 opacity-90 leading-[0.8]">
          The Arc
        </h1>
        <div className="flex items-center gap-4 mt-6">
          <div className="h-px w-12 bg-[#FFD600]"></div>
          <p className="text-[#EBE9D8]/60 font-sans text-xs tracking-[0.3em] uppercase">22 Rules of Storytelling</p>
        </div>
      </header>

      <div className="relative">
        <div
          className="absolute left-[20px] md:left-[50%] top-0 bottom-0 bg-[#EBE9D8] transition-all duration-1000 ease-out z-0"
          style={{ width: '1px', opacity: 0.1 }}
        />
        <div
          className="absolute left-[20px] md:left-[50%] top-0 bg-[#FFD600] transition-all duration-1000 ease-out z-0 shadow-[0_0_15px_rgba(255,214,0,0.3)]"
          style={{
            width: `${Math.max(1, density * 4)}px`,
            height: `${(Object.keys(progress).length / 22) * 100}%`,
            opacity: 0.8
          }}
        />

        <div className="space-y-32 pb-32">
          {nodes.map((rule, idx) => (
            <div
              key={rule.id}
              onClick={() => rule.isUnlocked && onSelectRule(rule)}
              className={`
                                relative flex items-center transition-all duration-700
                                ${rule.align === 'left' ? 'md:flex-row' : 'md:flex-row-reverse'}
                                ${rule.isUnlocked ? 'opacity-100 cursor-pointer' : 'opacity-20 blur-[1px] cursor-not-allowed'}
                                group
                            `}
            >
              <div className="absolute left-[16px] md:left-[50%] md:-ml-[4px] w-[9px] h-[9px] z-10">
                <div className={`
                                    w-full h-full rounded-full transition-all duration-500
                                    ${rule.isCompleted ? 'bg-[#FFD600] scale-125' : 'bg-[#EBE9D8]/30 group-hover:scale-125'}
                                `} />
              </div>

              <div className={`
                                pl-16 md:pl-0 w-full md:w-[42%] 
                                ${rule.align === 'left' ? 'md:text-right md:pr-16' : 'md:text-left md:pl-16'}
                            `}>
                <div className="overflow-hidden">
                  <h2 className={`
                                        text-xs font-sans tracking-[0.2em] uppercase mb-3 transition-transform duration-500 translate-y-2 group-hover:translate-y-0
                                        ${rule.isCompleted ? 'text-[#FFD600]' : 'text-[#EBE9D8]/40'}
                                    `}>
                    Rule {String(rule.id).padStart(2, '0')}
                  </h2>
                </div>

                <h3 className={`
                                    text-2xl md:text-3xl font-serif leading-tight mb-2 text-[#EBE9D8] transition-colors duration-300
                                    ${rule.isCompleted ? 'line-through decoration-[#FFD600]/50 text-[#EBE9D8]/50' : 'group-hover:text-white'}
                                `}>
                  {rule.subtitle}
                </h3>

                <p className="hidden md:block font-sans text-xs text-[#EBE9D8]/40 leading-relaxed max-w-xs ml-auto mr-auto">
                  {rule.content.substring(0, 60)}...
                </p>

                {rule.type === 'interactive' && !rule.isCompleted && (
                  <div className={`
                                        mt-4 inline-flex items-center gap-2 text-[10px] tracking-widest uppercase border border-[#EBE9D8]/10 px-3 py-1 rounded-full
                                        ${rule.align === 'left' ? 'md:flex-row-reverse' : ''}
                                    `}>
                    <PenTool size={10} className="text-[#FFD600]" />
                    <span className="text-[#EBE9D8]/60">Exercise</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// 5. STATIC RULE VIEW
const StaticRule = ({ rule, onComplete, onExit }) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 8000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="flex flex-col items-center justify-center h-full px-8 text-center max-w-4xl mx-auto animate-fade-in-up relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[30rem] font-serif text-[#EBE9D8] opacity-[0.02] pointer-events-none select-none leading-none">
        {rule.id}
      </div>

      <div className="mb-8 w-px h-16 bg-gradient-to-b from-transparent to-[#FFD600]"></div>

      <h2 className="text-3xl md:text-5xl font-serif text-[#EBE9D8] mb-12 leading-tight tracking-tight max-w-2xl">
        "{rule.content}"
      </h2>

      <div className="flex items-center gap-4 opacity-50">
        <div className="w-2 h-2 bg-[#FFD600] rounded-full animate-pulse"></div>
        <p className="text-[#EBE9D8] font-sans text-[10px] tracking-[0.3em] uppercase">
          Internalizing...
        </p>
      </div>

      <button onClick={onExit} className="absolute top-8 right-8 text-[#EBE9D8]/20 hover:text-[#EBE9D8] transition-colors">
        <X size={24} />
      </button>
    </div>
  );
};

// --- APP CONTAINER ---
function TheArcApp() {
  const [view, setView] = useState('dashboard');
  const [activeRule, setActiveRule] = useState(null);
  const [progress, setProgress] = useState({});
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('the_arc_progress_v2');
    if (saved) setProgress(JSON.parse(saved));
  }, []);

  const saveProgress = (newProgress) => {
    setProgress(newProgress);
    localStorage.setItem('the_arc_progress_v2', JSON.stringify(newProgress));
  };

  const handleSelectRule = (rule) => {
    setActiveRule(rule);
    setView('active-rule');
  };

  const handleCompleteRule = () => {
    if (!activeRule) return;

    setFlash(true);
    setTimeout(() => setFlash(false), 1200);

    const newProgress = { ...progress, [activeRule.id]: true };
    saveProgress(newProgress);

    setTimeout(() => {
      setView('dashboard');
      setActiveRule(null);
    }, 1500);
  };

  return (
    <div className="bg-[#050505] min-h-screen text-[#EBE9D8] overflow-hidden relative selection:bg-[#FFD600] selection:text-black">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,900;1,400&display=swap');
        
        .font-serif { font-family: 'Playfair Display', serif; }
        .font-sans { font-family: 'Inter', sans-serif; }
        
        @keyframes shakeHarsh {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px) rotate(-1deg); }
          40% { transform: translateX(8px) rotate(1deg); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
        }
        .animate-shake-harsh { animation: shakeHarsh 0.3s cubic-bezier(.36,.07,.19,.97) both; }
        
        @keyframes fadeInUp { 
          from { opacity: 0; transform: translateY(40px); } 
          to { opacity: 1; transform: translateY(0); } 
        }
        .animate-fade-in-up { animation: fadeInUp 1s cubic-bezier(0.16, 1, 0.3, 1) forwards; }

        ::-webkit-scrollbar { width: 0px; background: transparent; }
      `}</style>

      <div className={`
        fixed inset-0 z-50 pointer-events-none transition-all duration-1000 ease-out
        ${flash ? 'opacity-100 bg-white' : 'opacity-0 bg-transparent'}
      `} />

      <main className="h-screen overflow-y-auto scroll-smooth">
        {view === 'dashboard' && (
          <Dashboard progress={progress} onSelectRule={handleSelectRule} />
        )}

        {view === 'active-rule' && activeRule && (
          <div className="fixed inset-0 bg-[#050505] z-40 animate-fade-in-up flex flex-col">
            {activeRule.mode === 'crucible' ? (
              <TheCrucible onComplete={handleCompleteRule} onExit={() => setView('dashboard')} />
            ) : activeRule.mode === 'cut' ? (
              <TheCut onComplete={handleCompleteRule} onExit={() => setView('dashboard')} />
            ) : activeRule.mode === 'mirror' ? (
              <TheMirror onComplete={handleCompleteRule} onExit={() => setView('dashboard')} />
            ) : (
              <StaticRule rule={activeRule} onComplete={handleCompleteRule} onExit={() => setView('dashboard')} />
            )}
          </div>
        )}
      </main>

      <div className="fixed bottom-8 right-8 z-30 flex flex-col items-end gap-2 opacity-40 hover:opacity-100 transition-opacity">
        <span className="font-sans text-[9px] tracking-[0.3em] uppercase">Draft Density</span>
        <div className="h-1 w-24 bg-[#EBE9D8]/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#FFD600] transition-all duration-1000"
            style={{ width: `${(Object.keys(progress).length / 22) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}

// Initial Render
const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(<TheArcApp />);
}