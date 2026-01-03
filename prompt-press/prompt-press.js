import React, { useState, useEffect, useRef } from 'react';
import {
    Coffee, BookOpen, User, Star, ChevronRight, Award,
    Thermometer, Clock, Sparkles, Search, CheckCircle2,
    ArrowLeft, Send, Loader2, Zap, Layout, Terminal
} from 'lucide-react';

// --- CURRICULUM DATA (Derived from PDF) ---
const SYLLABUS = [
    {
        id: 1,
        tier: "The Green Bean",
        title: "The AI Essentials",
        source: "Google AI Essentials",
        concept: "Foundations & Productivity",
        lesson: "Understand how generative models work. Use AI to brainstorm ideas, turn them into outlines, and draft communications.",
        challenge: "Write a prompt to brainstorm 3 creative names for a new 'lavender-infused' espresso blend. Context: We are a high-end minimalist cafe.",
        criteria: ["Creativity", "Context provided", "Bullet points"],
        gradingInstruction: "Grade based on whether they provided context about the minimalist cafe and if they asked for exactly 3 names."
    },
    {
        id: 2,
        tier: "The Green Bean",
        title: "The 4D Framework",
        source: "Anthropic Academy",
        concept: "Delegation, Description, Discernment, Diligence",
        lesson: "Collaboration framework: Strategically delegate, describe precisely, discern outputs, and verify with diligence.",
        challenge: "Describe a task to an AI to 'discern' if a coffee bean description is too marketing-heavy or actually informative.",
        criteria: ["Clear description", "Discernment logic"],
        gradingInstruction: "The prompt must explicitly ask the AI to categorize the text based on informative vs marketing tone."
    },
    {
        id: 3,
        tier: "The Green Bean",
        title: "The TCRE Framework",
        source: "Google Prompting Essentials",
        concept: "Task, Context, Reference, Evaluation",
        lesson: "The core formula: Define the Task, provide Context, provide Reference data, and set Evaluation criteria.",
        challenge: "Use TCRE to ask for a coffee recipe summary. Task: Summarize; Context: For a trainee; Reference: Use '18g beans, 36g out, 30s'; Evaluation: Under 20 words.",
        criteria: ["Task included", "Context included", "Reference included", "Evaluation included"],
        gradingInstruction: "Check for all four elements of TCRE in the prompt."
    },
    {
        id: 4,
        tier: "The Precise Grind",
        title: "Role Prompting",
        source: "Anthropic / Google",
        concept: "System Personas",
        lesson: "Assign a specific role (e.g., 'Expert Barista') to set the tone and improve performance accuracy.",
        challenge: "Assign a role to the AI to act as a 'Critical Coffee Critic' reviewing a slightly burnt latte.",
        criteria: ["Specific persona", "Tone setting"],
        gradingInstruction: "The prompt must start by telling the AI who it is and what its specific expertise is."
    },
    {
        id: 5,
        tier: "The Precise Grind",
        title: "XML Ingredient Tags",
        source: "Anthropic (Claude-specific)",
        concept: "Structural Clarity",
        lesson: "Use XML-like tags (e.g., <instructions>, <data>) to separate different parts of your prompt.",
        challenge: "Write a prompt that uses <instructions> tags for the task and <context> tags for the background info about a cafe's morning rush.",
        criteria: ["Proper XML tags", "Clear separation"],
        gradingInstruction: "Verify the presence of matching opening and closing tags used as structural separators."
    },
    {
        id: 6,
        tier: "The Precise Grind",
        title: "The Multi-Shot Brew",
        source: "Anthropic / Google",
        concept: "Few-Shot Prompting",
        lesson: "Provide 3-5 diverse examples wrapped in <example> tags to guide the model's behavior.",
        challenge: "Provide two examples of how to respond to a customer complaint, then ask the AI to handle a new complaint about cold coffee.",
        criteria: ["At least 2 examples", "Consistent format"],
        gradingInstruction: "The prompt should contain clear 'Input/Output' or 'Example' pairs before the final task."
    },
    {
        id: 7,
        tier: "The Slow Steep",
        title: "Chain of Thought (CoT)",
        source: "Anthropic / Google",
        concept: "Guided Reasoning",
        lesson: "Instruct the model to 'think step-by-step' or use <thinking> tags to increase accuracy on complex tasks.",
        challenge: "Ask the AI to calculate the profit margin on a latte priced at $5.50 (cost $1.20) and explain its logic step-by-step.",
        criteria: ["Logic request", "Step-by-step instruction"],
        gradingInstruction: "The user must explicitly ask the AI to explain its reasoning or think through the steps."
    },
    {
        id: 8,
        tier: "The Slow Steep",
        title: "The Prefilled Pour",
        source: "Anthropic",
        concept: "Output Control",
        lesson: "Prefill the assistant's response with a specific phrase or JSON bracket to force a structured output.",
        challenge: "Write a prompt for a coffee menu in JSON format, and specify that the response should start with '{ \"menu\": '.",
        criteria: ["Format specification", "Prefill instruction"],
        gradingInstruction: "Check if the user tells the AI exactly how to start its response."
    },
    {
        id: 9,
        tier: "The Master Blend",
        title: "Hallucination Defense",
        source: "Anthropic Chapter 8",
        concept: "Quote Extraction",
        lesson: "Reduce errors by asking the model to extract relevant quotes from a document into a <scratchpad> before answering.",
        challenge: "Provide a mock 'Coffee Bean Origin' text and prompt the AI to extract direct quotes about the altitude before summarizing.",
        criteria: ["Quote extraction", "Scratchpad usage"],
        gradingInstruction: "The prompt should mandate finding evidence in the text before giving a final answer."
    },
    {
        id: 10,
        tier: "The Master Blend",
        title: "Prompt Chaining",
        source: "Anthropic / Google Course 4",
        concept: "Complex Workflows",
        lesson: "Split a massive problem into smaller subtasks, feeding the output of one step into the next.",
        challenge: "Describe a 2-step process where step 1 extracts flavor notes and step 2 writes a marketing blurb based only on those notes.",
        criteria: ["Process breakdown", "Dependency logic"],
        gradingInstruction: "The prompt must define two distinct, sequential tasks."
    }
    // ... Simplified to 10 for the demo UI, but structured to support all 30
];

const App = () => {
    const [activeTab, setActiveTab] = useState('journey');
    const [selectedLevel, setSelectedLevel] = useState(null);
    const [userPrompt, setUserPrompt] = useState("");
    const [isGrading, setIsGrading] = useState(false);
    const [gradeResult, setGradeResult] = useState(null);
    const [progress, setProgress] = useState(() => {
        const saved = localStorage.getItem('prompt_press_progress');
        return saved ? JSON.parse(saved) : { completed: [], stamps: 0, currentLevel: 1 };
    });

    const apiKey = ""; // Runtime provided

    useEffect(() => {
        localStorage.setItem('prompt_press_progress', JSON.stringify(progress));
    }, [progress]);

    const handleLevelSelect = (lvl) => {
        setSelectedLevel(lvl);
        setGradeResult(null);
        setUserPrompt("");
        setActiveTab('lab');
    };

    const gradePrompt = async () => {
        if (!userPrompt.trim()) return;
        setIsGrading(true);
        setGradeResult(null);

        // Simulation delay for "brewing" feel
        await new Promise(res => setTimeout(res, 1500));

        // Basic local validation logic
        const lowerPrompt = userPrompt.toLowerCase();
        let passed = true;
        let score = 85 + Math.floor(Math.random() * 15); // Random high score for "perfect" brews
        let feedback = "Your prompt looks like a high-quality extract! It clearly addresses the core concept of the lesson. The context is well-defined and the task is sharp.";

        // Simple heuristic check based on current level
        if (selectedLevel.id === 1 && !lowerPrompt.includes('minimalist')) {
            passed = false;
            score = 65;
            feedback = "A bit bitter! You missed the 'minimalist cafe' context. Try adding more flavor to the background details.";
        }

        const evaluation = {
            passed,
            score,
            feedback,
            ai_response: "BREW_SIMULATION: This prompt would successfully guide an AI to generate the specific coffee-themed output requested."
        };

        setGradeResult(evaluation);

        if (evaluation.passed && !progress.completed.includes(selectedLevel.id)) {
            setProgress(prev => ({
                ...prev,
                completed: [...prev.completed, selectedLevel.id],
                stamps: prev.stamps + 1,
                currentLevel: Math.max(prev.currentLevel, selectedLevel.id + 1)
            }));
        }
        setIsGrading(false);
    };

    // --- STYLES ---
    const theme = {
        bg: 'bg-[#FDFBF7]',
        card: 'bg-white',
        accent: 'text-[#4A3728]',
        border: 'border-[#EAE3D9]',
        textDim: 'text-[#8C7B6C]',
        textMain: 'text-[#4A3728]',
    };

    // --- SCREENS ---
    const renderHome = () => (
        <div className="p-6 space-y-6 max-w-2xl mx-auto">
            <div className="bg-[#4A3728] text-white p-8 rounded-[2.5rem] relative overflow-hidden shadow-xl">
                <div className="relative z-10">
                    <span className="text-[10px] font-bold tracking-widest uppercase opacity-60">Barista Status</span>
                    <h1 className="text-3xl font-serif mt-1">Hello, Master Roaster</h1>
                    <div className="mt-6 flex items-center gap-4">
                        <div className="flex-1 bg-white/10 h-2 rounded-full overflow-hidden">
                            <div
                                className="bg-[#D7C0AE] h-full transition-all duration-1000"
                                style={{ width: `${(progress.stamps / SYLLABUS.length) * 100}%` }}
                            ></div>
                        </div>
                        <span className="font-mono text-sm">{progress.stamps}/{SYLLABUS.length} Stamps</span>
                    </div>
                </div>
                <Coffee className="absolute -right-6 -bottom-6 opacity-10 w-48 h-48" />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white border border-[#EAE3D9] p-5 rounded-3xl flex items-center gap-4">
                    <div className="p-3 bg-[#FDFBF7] rounded-2xl text-[#4A3728]">
                        <Award size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold uppercase text-[#8C7B6C]">Level</p>
                        <p className="font-serif text-lg leading-tight">{progress.currentLevel > 10 ? 'Elite' : 'Apprentice'}</p>
                    </div>
                </div>
                <div className="bg-white border border-[#EAE3D9] p-5 rounded-3xl flex items-center gap-4">
                    <div className="p-3 bg-[#FDFBF7] rounded-2xl text-[#4A3728]">
                        <Thermometer size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold uppercase text-[#8C7B6C]">Recall</p>
                        <p className="font-serif text-lg leading-tight">100% Brewed</p>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-[#8C7B6C] px-2">Recommended Next Sip</h3>
                <button
                    onClick={() => handleLevelSelect(SYLLABUS[progress.currentLevel - 1] || SYLLABUS[0])}
                    className="w-full bg-white border border-[#EAE3D9] p-6 rounded-3xl text-left hover:border-[#4A3728] transition-all group flex items-center justify-between"
                >
                    <div>
                        <span className="text-[#D7C0AE] font-mono text-xs">Level {progress.currentLevel}</span>
                        <h4 className="text-xl font-serif text-[#4A3728] mt-1">{(SYLLABUS[progress.currentLevel - 1] || SYLLABUS[0]).title}</h4>
                        <p className="text-sm text-[#8C7B6C] mt-2 italic">Ready to grind this technique?</p>
                    </div>
                    <div className="bg-[#4A3728] p-3 rounded-2xl text-white group-hover:translate-x-1 transition-transform">
                        <ChevronRight size={20} />
                    </div>
                </button>
            </div>
        </div>
    );

    const renderJourney = () => (
        <div className="p-6 max-w-2xl mx-auto pb-24">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h2 className="text-3xl font-serif text-[#4A3728]">The Roastery Path</h2>
                    <p className="text-[#8C7B6C] text-xs uppercase tracking-widest mt-1">Mastering the Art of the Prompt</p>
                </div>
                <div className="flex gap-1">
                    {[...Array(3)].map((_, i) => <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#D7C0AE]"></div>)}
                </div>
            </div>

            <div className="space-y-4">
                {SYLLABUS.map((item) => {
                    const isCompleted = progress.completed.includes(item.id);
                    const isCurrent = progress.currentLevel === item.id;
                    const isLocked = item.id > progress.currentLevel;

                    return (
                        <button
                            key={item.id}
                            disabled={isLocked}
                            onClick={() => handleLevelSelect(item)}
                            className={`w-full text-left p-5 rounded-3xl border transition-all flex items-center gap-4 ${isCurrent ? 'bg-white border-[#4A3728] shadow-lg scale-[1.02]' :
                                isCompleted ? 'bg-white border-[#EAE3D9] opacity-80' :
                                    'bg-[#F9F6F2] border-[#EAE3D9] opacity-50'
                                }`}
                        >
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${isCompleted ? 'bg-[# MatchaGreen]/10 text-[#8BA888]' :
                                isCurrent ? 'bg-[#4A3728] text-white' : 'bg-gray-100 text-gray-400'
                                }`}>
                                {isCompleted ? <CheckCircle2 size={24} /> : <span className="font-mono text-sm">{item.id}</span>}
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#8C7B6C]">{item.tier}</span>
                                    {isCurrent && <span className="bg-[#D7C0AE] text-[#4A3728] text-[8px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-tighter">Current</span>}
                                </div>
                                <h4 className="text-lg font-serif text-[#4A3728]">{item.title}</h4>
                                <p className="text-xs text-[#8C7B6C] truncate max-w-[200px]">{item.concept}</p>
                            </div>
                            <ChevronRight className={isLocked ? 'text-gray-200' : 'text-[#D7C0AE]'} size={20} />
                        </button>
                    );
                })}
            </div>
        </div>
    );

    const renderLab = () => (
        <div className="h-full flex flex-col bg-[#FDFBF7] animate-in fade-in duration-500">
            <div className="p-6 border-b border-[#EAE3D9] bg-white flex items-center justify-between">
                <button onClick={() => setActiveTab('journey')} className="p-2 hover:bg-[#FDFBF7] rounded-xl transition-colors">
                    <ArrowLeft size={20} className="text-[#4A3728]" />
                </button>
                <div className="text-center">
                    <h3 className="font-serif text-[#4A3728]">{selectedLevel?.title}</h3>
                    <p className="text-[10px] uppercase font-bold text-[#8C7B6C] tracking-widest">{selectedLevel?.tier}</p>
                </div>
                <div className="w-10"></div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="bg-[#4A3728] text-white p-6 rounded-[2rem] shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                        <Search size={16} className="text-[#D7C0AE]" />
                        <span className="text-xs font-bold uppercase tracking-widest text-[#D7C0AE]">The Lesson</span>
                    </div>
                    <p className="text-sm leading-relaxed mb-4">{selectedLevel?.lesson}</p>
                    <div className="bg-white/10 p-4 rounded-2xl border border-white/10">
                        <p className="text-[10px] uppercase font-bold mb-2 text-[#D7C0AE]">Task for you:</p>
                        <p className="text-sm italic font-serif">"{selectedLevel?.challenge}"</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex justify-between items-center px-2">
                        <span className="text-[10px] font-bold uppercase text-[#8C7B6C]">Brew Lab Editor</span>
                        <div className="flex gap-2">
                            {selectedLevel?.criteria.map((c, i) => (
                                <span key={i} className="text-[8px] bg-white border border-[#EAE3D9] px-2 py-0.5 rounded-full text-[#8C7B6C]">{c}</span>
                            ))}
                        </div>
                    </div>
                    <textarea
                        value={userPrompt}
                        onChange={(e) => setUserPrompt(e.target.value)}
                        placeholder="Write your prompt recipe here..."
                        className="w-full h-48 bg-white border-2 border-[#EAE3D9] rounded-3xl p-6 text-[#4A3728] focus:border-[#4A3728] outline-none transition-all shadow-inner font-mono text-sm leading-relaxed resize-none"
                    />
                </div>

                {gradeResult && (
                    <div className={`p-6 rounded-3xl border animate-in slide-in-from-top-4 ${gradeResult.passed ? 'bg-[#8BA888]/10 border-[#8BA888]/30' : 'bg-red-50 border-red-100'}`}>
                        <div className="flex justify-between items-start mb-2">
                            <h4 className={`font-bold font-serif text-lg ${gradeResult.passed ? 'text-[#4A3728]' : 'text-red-800'}`}>
                                {gradeResult.passed ? 'A Perfect Pour! ✨' : 'Needs More Grind...'}
                            </h4>
                            <span className="font-mono text-xl">{gradeResult.score}%</span>
                        </div>
                        <p className="text-sm text-[#4A3728]/80 leading-relaxed mb-4">{gradeResult.feedback}</p>
                        {gradeResult.ai_response && (
                            <div className="bg-white/50 p-4 rounded-xl text-xs font-mono text-[#4A3728]">
                                <p className="mb-2 opacity-50 uppercase text-[8px] font-bold">AI Result Preview:</p>
                                {gradeResult.ai_response}
                            </div>
                        )}
                        {gradeResult.passed && (
                            <button
                                onClick={() => setActiveTab('journey')}
                                className="mt-4 w-full bg-[#4A3728] text-white py-3 rounded-2xl font-bold text-sm"
                            >
                                NEXT LESSON
                            </button>
                        )}
                    </div>
                )}
            </div>

            <div className="p-6 bg-white border-t border-[#EAE3D9]">
                <button
                    onClick={gradePrompt}
                    disabled={isGrading || !userPrompt.trim()}
                    className="w-full bg-[#4A3728] text-white py-5 rounded-2xl font-bold flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transition-all active:scale-[0.98] disabled:opacity-50"
                >
                    {isGrading ? <Loader2 className="animate-spin" /> : <><Send size={18} /> BREW PROMPT</>}
                </button>
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 bg-[#FDFBF7] flex flex-col font-sans max-w-lg mx-auto shadow-2xl overflow-hidden border-x border-[#EAE3D9]">
            {/* Header */}
            {activeTab !== 'lab' && (
                <header className="flex justify-between items-center p-6 bg-white border-b border-[#EAE3D9]">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#4A3728] rounded-2xl flex items-center justify-center -rotate-3">
                            <Coffee className="text-white" size={20} />
                        </div>
                        <div>
                            <h1 className="font-serif text-lg leading-tight text-[#4A3728]">The Prompt Press</h1>
                            <p className="text-[8px] font-bold tracking-[0.2em] text-[#8C7B6C] uppercase">Roastery Academy</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 bg-[#F9F6F2] px-3 py-1.5 rounded-full border border-[#EAE3D9]">
                        <Award size={14} className="text-[#D7C0AE]" />
                        <span className="font-mono text-xs font-bold text-[#4A3728]">{progress.stamps}</span>
                    </div>
                </header>
            )}

            {/* Main Area */}
            <main className="flex-1 overflow-y-auto bg-[#FDFBF7]">
                {activeTab === 'home' && renderHome()}
                {activeTab === 'journey' && renderJourney()}
                {activeTab === 'lab' && renderLab()}
                {activeTab === 'stash' && (
                    <div className="p-12 text-center space-y-4 opacity-50">
                        <Layout size={48} className="mx-auto text-[#D7C0AE]" />
                        <h3 className="font-serif text-xl">The Recipe Stash</h3>
                        <p className="text-sm">Store your master prompts here. Coming soon in the next roast!</p>
                    </div>
                )}
            </main>

            {/* Navigation */}
            {activeTab !== 'lab' && (
                <nav className="p-4 pb-8 bg-white border-t border-[#EAE3D9] flex justify-around items-center">
                    {[
                        { id: 'home', icon: Coffee, label: 'Cafe' },
                        { id: 'journey', icon: BookOpen, label: 'Journey' },
                        { id: 'lab', icon: Terminal, label: 'Roast' },
                        { id: 'stash', icon: Sparkles, label: 'Stash' }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => {
                                if (tab.id === 'lab') {
                                    handleLevelSelect(SYLLABUS[progress.currentLevel - 1] || SYLLABUS[0]);
                                } else {
                                    setActiveTab(tab.id);
                                }
                            }}
                            className={`flex flex-col items-center gap-1.5 transition-all ${activeTab === tab.id ? 'text-[#4A3728]' : 'text-[#8C7B6C] opacity-60'}`}
                        >
                            <div className={`p-2 rounded-2xl transition-all ${activeTab === tab.id ? 'bg-[#D7C0AE]/20' : ''}`}>
                                <tab.icon size={22} strokeWidth={activeTab === tab.id ? 2.5 : 2} />
                            </div>
                            <span className="text-[9px] uppercase tracking-widest font-bold">{tab.label}</span>
                        </button>
                    ))}
                </nav>
            )}
        </div>
    );
};

export default App;