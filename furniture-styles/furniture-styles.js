import React, { useState, useEffect } from 'react';
import { ChevronRight, Info, X, ArrowRight, Circle, BookOpen, Layers, MousePointer2 } from 'lucide-react';

const FurnitureNerd = () => {
    const [activeView, setActiveView] = useState('home'); // 'home', 'detail', 'lesson'
    const [activeLessonStep, setActiveLessonStep] = useState(0);

    // Load Fonts
    useEffect(() => {
        const link = document.createElement('link');
        link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&display=swap';
        link.rel = 'stylesheet';
        document.head.appendChild(link);
        return () => document.head.removeChild(link);
    }, []);

    // Theme Colors
    const theme = {
        bg: 'bg-[#F9F8F6]', // Warm Alabaster
        text: 'text-[#1A1A1A]', // Onyx
        subtext: 'text-[#4A4A4A]', // Deep Charcoal
        accent: 'text-[#C95D46]', // Terracotta for interactions
        cardBg: 'bg-white',
        border: 'border-[#E5E5E5]',
    };

    const eras = [
        {
            id: 'bauhaus',
            name: 'Bauhaus',
            years: '1919–1933',
            tagline: 'Form Follows Function',
            image: 'linear-gradient(135deg, #e0e0e0 0%, #f5f5f5 100%)', // Placeholder for generated image
            icon: <Layers size={24} />,
            traits: ['Tubular Steel', 'Geometry', 'Industrial']
        },
        {
            id: 'mcm',
            name: 'Mid-Century Modern',
            years: '1945–1969',
            tagline: 'Design for the Masses',
            image: 'linear-gradient(135deg, #d4c4a8 0%, #e6dccf 100%)',
            icon: <Circle size={24} />,
            traits: ['Organic Curves', 'Teak/Walnut', 'Functionality']
        },
        {
            id: 'memphis',
            name: 'Post-Modern / Memphis',
            years: '1981–1987',
            tagline: 'Less is a Bore',
            image: 'linear-gradient(135deg, #ffcdd2 0%, #b3e5fc 100%)',
            icon: <BookOpen size={24} />,
            traits: ['Bold Pattern', 'Asymmetry', 'Kitsch']
        }
    ];

    // --- VIEWS ---

    const HomeView = () => (
        <div className={`min-h-screen ${theme.bg} p-6 pb-24 font-sans`}>
            <header className="mb-12 pt-8">
                <h1 className={`${theme.text} font-serif text-4xl font-semibold tracking-tight mb-2`}>
                    Furniture Nerd.
                </h1>
                <p className={`${theme.subtext} text-sm uppercase tracking-widest font-medium opacity-80`}>
                    The Curated Archive
                </p>
            </header>

            <div className="space-y-8">
                {/* Featured Lesson Card */}
                <div
                    onClick={() => setActiveView('lesson')}
                    className="group relative cursor-pointer overflow-hidden rounded-xl bg-[#2A2A2A] text-[#F9F8F6] p-8 shadow-xl transition-transform hover:scale-[1.01] duration-500 ease-out"
                >
                    <div className="relative z-10">
                        <span className="inline-block px-3 py-1 mb-4 text-xs font-semibold tracking-wider uppercase border border-white/20 rounded-full">
                            Interactive Lesson
                        </span>
                        <h2 className="font-serif text-3xl mb-2">MCM vs. Scandinavian</h2>
                        <p className="text-white/70 max-w-xs mb-6 font-light leading-relaxed">
                            Can you spot the difference? Learn to distinguish between American Mid-Century and Nordic design through wood grain and joinery.
                        </p>
                        <div className="flex items-center text-sm font-medium tracking-wide">
                            Start Lesson <ChevronRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                    </div>
                    {/* Abstract BG element */}
                    <div className="absolute right-[-20px] bottom-[-40px] opacity-10 rotate-12">
                        <Layers size={200} />
                    </div>
                </div>

                <h3 className={`${theme.text} font-serif text-2xl mt-12 mb-6`}>Eras & Movements</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {eras.map((era) => (
                        <div
                            key={era.id}
                            onClick={() => setActiveView('detail')}
                            className={`${theme.cardBg} group cursor-pointer rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border ${theme.border}`}
                        >
                            <div
                                className="h-48 w-full bg-cover bg-center relative"
                                style={{ background: era.image }}
                            >
                                <div className="absolute inset-0 flex items-center justify-center opacity-30 group-hover:opacity-40 transition-opacity">
                                    {/* Placeholder visual for the furniture */}
                                    {era.id === 'bauhaus' ? (
                                        <div className="w-32 h-32 border-4 border-black/20 rounded-sm transform rotate-45"></div>
                                    ) : era.id === 'mcm' ? (
                                        <div className="w-40 h-24 border-4 border-black/20 rounded-full"></div>
                                    ) : (
                                        <div className="w-24 h-32 border-t-4 border-l-4 border-black/20 transform -skew-x-12"></div>
                                    )}
                                </div>
                            </div>
                            <div className="p-6">
                                <div className="flex justify-between items-baseline mb-2">
                                    <h4 className={`${theme.text} font-serif text-xl`}>{era.name}</h4>
                                    <span className={`${theme.subtext} text-xs font-mono`}>{era.years}</span>
                                </div>
                                <p className={`${theme.subtext} text-sm italic mb-4 opacity-80`}>{era.tagline}</p>
                                <div className="flex gap-2">
                                    {era.traits.map(t => (
                                        <span key={t} className="text-[10px] uppercase tracking-wider bg-stone-100 px-2 py-1 rounded-sm text-stone-600">
                                            {t}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const LessonView = () => {
        // Lesson Content State
        const steps = [
            {
                title: "The Core Philosophy",
                content: "While both styles emerged mid-century, they have different roots. American MCM was about post-war optimism and new industrial materials. Scandinavian design was rooted in craft, harsh winters, and 'hygge'.",
                interactive: false
            },
            {
                title: "Spot the Difference: The Leg",
                content: "Tap the legs below. Notice the finish and shape. American MCM often used darker, polished woods like Walnut or Rosewood. Scandinavian pieces preferred lighter, matte native woods like Teak, Oak, or Birch.",
                interactive: true,
                type: 'legs'
            }
        ];

        const [selectedLeg, setSelectedLeg] = useState(null);

        return (
            <div className={`min-h-screen ${theme.bg} flex flex-col`}>
                {/* Nav */}
                <div className="p-6 flex justify-between items-center">
                    <button onClick={() => setActiveView('home')} className={`${theme.subtext} hover:${theme.text} transition-colors flex items-center gap-2 text-sm uppercase tracking-widest`}>
                        <X size={16} /> Close Lesson
                    </button>
                    <div className="flex gap-1">
                        <div className={`h-1 w-8 rounded-full ${activeLessonStep === 0 ? 'bg-stone-800' : 'bg-stone-300'}`}></div>
                        <div className={`h-1 w-8 rounded-full ${activeLessonStep === 1 ? 'bg-stone-800' : 'bg-stone-300'}`}></div>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 flex flex-col max-w-2xl mx-auto w-full p-6">
                    <div className="flex-1">
                        <h2 className={`${theme.text} font-serif text-3xl md:text-4xl mb-6`}>
                            {steps[activeLessonStep].title}
                        </h2>
                        <p className={`${theme.subtext} text-lg font-light leading-relaxed mb-12`}>
                            {steps[activeLessonStep].content}
                        </p>

                        {steps[activeLessonStep].interactive && steps[activeLessonStep].type === 'legs' && (
                            <div className="grid grid-cols-2 gap-8 mb-12">
                                {/* Option A: American MCM */}
                                <div
                                    onClick={() => setSelectedLeg('mcm')}
                                    className={`cursor-pointer group relative p-8 rounded-xl border-2 transition-all duration-300 ${selectedLeg === 'mcm' ? 'border-stone-800 bg-white shadow-lg' : 'border-transparent hover:bg-white/50'}`}
                                >
                                    <div className="h-48 w-full flex items-center justify-center relative">
                                        {/* Abstract Leg Representation */}
                                        <svg viewBox="0 0 100 200" className="h-full drop-shadow-xl">
                                            <path d="M 20,0 Q 25,100 35,180 L 45,180 Q 35,100 40,0" fill="#5D4037" /> {/* Dark Walnut Hex */}
                                        </svg>
                                        {/* Hotspot Pulse */}
                                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                                            <div className="w-8 h-8 rounded-full bg-white/30 animate-ping absolute"></div>
                                            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                                                <MousePointer2 size={14} className="text-white opacity-80" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-center mt-4">
                                        <span className="text-xs font-bold tracking-widest uppercase text-stone-400">Option A</span>
                                    </div>
                                    {selectedLeg === 'mcm' && (
                                        <div className="absolute inset-x-0 bottom-full mb-4 mx-4 p-4 bg-stone-900 text-white text-sm rounded shadow-xl animate-in fade-in slide-in-from-bottom-2 z-20">
                                            <strong className="block text-amber-200 mb-1">American MCM</strong>
                                            Darker Walnut/Rosewood. Often highly polished/lacquered finish. A status symbol.
                                        </div>
                                    )}
                                </div>

                                {/* Option B: Scandi */}
                                <div
                                    onClick={() => setSelectedLeg('scandi')}
                                    className={`cursor-pointer group relative p-8 rounded-xl border-2 transition-all duration-300 ${selectedLeg === 'scandi' ? 'border-stone-800 bg-white shadow-lg' : 'border-transparent hover:bg-white/50'}`}
                                >
                                    <div className="h-48 w-full flex items-center justify-center relative">
                                        {/* Abstract Leg Representation */}
                                        <svg viewBox="0 0 100 200" className="h-full drop-shadow-xl">
                                            <path d="M 25,0 L 35,180 L 45,180 L 45,0" fill="#D7CCC8" /> {/* Light Oak/Birch Hex */}
                                        </svg>
                                        {/* Hotspot Pulse */}
                                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                                            <div className="w-8 h-8 rounded-full bg-stone-900/10 animate-ping absolute"></div>
                                            <div className="w-8 h-8 rounded-full bg-stone-900/5 flex items-center justify-center backdrop-blur-sm">
                                                <MousePointer2 size={14} className="text-stone-600 opacity-80" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-center mt-4">
                                        <span className="text-xs font-bold tracking-widest uppercase text-stone-400">Option B</span>
                                    </div>
                                    {selectedLeg === 'scandi' && (
                                        <div className="absolute inset-x-0 bottom-full mb-4 mx-4 p-4 bg-stone-900 text-white text-sm rounded shadow-xl animate-in fade-in slide-in-from-bottom-2 z-20">
                                            <strong className="block text-amber-200 mb-1">Scandinavian</strong>
                                            Lighter Oak/Birch/Ash. Matte, soaped, or oiled finishes. Focus on natural texture.
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end pt-6 border-t border-stone-200">
                        {activeLessonStep < steps.length - 1 ? (
                            <button
                                onClick={() => setActiveLessonStep(prev => prev + 1)}
                                className="flex items-center gap-3 px-6 py-3 bg-[#1A1A1A] text-white rounded-full hover:bg-black transition-colors"
                            >
                                Next Concept <ArrowRight size={18} />
                            </button>
                        ) : (
                            <button
                                onClick={() => setActiveView('home')}
                                className="flex items-center gap-3 px-6 py-3 bg-[#1A1A1A] text-white rounded-full hover:bg-black transition-colors"
                            >
                                Complete Lesson <ChevronRight size={18} />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    const DetailView = () => {
        // Mock Data for Wassily Chair
        const [hotspotActive, setHotspotActive] = useState(null);

        const hotspots = [
            { id: 1, x: 30, y: 40, label: "Tubular Steel", desc: "Inspired by bicycle handlebars, Breuer used seamless steel tubing for structural lightness." },
            { id: 2, x: 65, y: 55, label: "Eisengarn", desc: "'Iron Yarn' fabric was originally used before leather versions became standard." },
        ];

        return (
            <div className={`min-h-screen bg-stone-100 flex flex-col relative`}>
                {/* Sticky Header */}
                <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-stone-200 px-6 py-4 flex justify-between items-center">
                    <button onClick={() => setActiveView('home')} className="p-2 -ml-2 hover:bg-black/5 rounded-full transition-colors">
                        <ChevronRight className="rotate-180 w-6 h-6" />
                    </button>
                    <div className="text-center">
                        <h2 className="font-serif text-lg font-semibold">Wassily Chair</h2>
                        <span className="text-[10px] uppercase tracking-widest block text-stone-500">Marcel Breuer, 1925</span>
                    </div>
                    <div className="w-8"></div> {/* Spacer for balance */}
                </div>

                {/* Hero Section */}
                <div className="relative h-[60vh] bg-[#E8E8E8] flex items-center justify-center overflow-hidden">
                    {/* Abstract Representation of Wassily Chair */}
                    <div className="relative w-64 h-64 md:w-96 md:h-96">
                        {/* This SVG represents the chair visually in a simple way for the prototype */}
                        <svg viewBox="0 0 400 400" className="w-full h-full drop-shadow-2xl">
                            {/* Frame */}
                            <path d="M 50,350 L 50,150 L 150,150" fill="none" stroke="#333" strokeWidth="8" strokeLinecap="round" />
                            <path d="M 350,350 L 350,200 L 250,200" fill="none" stroke="#333" strokeWidth="8" strokeLinecap="round" />
                            <path d="M 50,300 L 350,300" fill="none" stroke="#333" strokeWidth="8" />
                            {/* Leather Straps */}
                            <path d="M 50,180 L 350,220" stroke="#111" strokeWidth="25" opacity="0.9" /> {/* Seat */}
                            <path d="M 50,100 L 50,150" stroke="#111" strokeWidth="25" opacity="0.9" /> {/* Back */}
                            <path d="M 350,150 L 350,200" stroke="#111" strokeWidth="25" opacity="0.9" />
                        </svg>

                        {/* Hotspots */}
                        {hotspots.map(spot => (
                            <button
                                key={spot.id}
                                onClick={() => setHotspotActive(hotspotActive === spot.id ? null : spot.id)}
                                style={{ top: `${spot.y}%`, left: `${spot.x}%` }}
                                className="absolute z-20 group"
                            >
                                <div className="relative flex items-center justify-center w-8 h-8">
                                    <span className="absolute inline-flex h-full w-full rounded-full bg-white opacity-75 animate-ping"></span>
                                    <span className={`relative inline-flex rounded-full h-4 w-4 bg-white border-2 border-stone-800 transition-transform ${hotspotActive === spot.id ? 'scale-125' : 'group-hover:scale-110'}`}></span>
                                </div>

                                {/* Tooltip */}
                                {hotspotActive === spot.id && (
                                    <div className="absolute left-1/2 bottom-full mb-4 -translate-x-1/2 w-64 bg-[#1A1A1A] text-[#F9F8F6] p-4 rounded-lg shadow-2xl text-left animate-in zoom-in-95 duration-200">
                                        <h4 className="font-serif text-lg mb-1 text-white">{spot.label}</h4>
                                        <p className="text-xs font-light opacity-80 leading-relaxed">{spot.desc}</p>
                                        <div className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-3 h-3 bg-[#1A1A1A] rotate-45"></div>
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>

                    <div className="absolute bottom-8 text-center w-full">
                        <p className="text-xs uppercase tracking-widest text-stone-500 animate-pulse">Tap the pulsing dots to explore</p>
                    </div>
                </div>

                {/* Scrollytelling Content */}
                <div className="px-6 py-12 max-w-lg mx-auto space-y-12">
                    <section>
                        <h3 className="font-serif text-2xl mb-4 text-[#1A1A1A]">Radical Simplification</h3>
                        <p className="font-sans text-stone-600 leading-relaxed">
                            The Wassily Chair marked a departure from the "overstuffed" furniture of the Edwardian era. Breuer reduced the club chair to its barest lines.
                        </p>
                    </section>

                    <section className="bg-white p-6 -mx-6 md:mx-0 md:rounded-lg shadow-sm border border-stone-100">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 bg-stone-100 rounded-full flex items-center justify-center">
                                <Info size={20} className="text-stone-800" />
                            </div>
                            <div>
                                <h4 className="font-bold text-sm uppercase tracking-wide">Did you know?</h4>
                                <p className="text-xs text-stone-500">The Bicycle Connection</p>
                            </div>
                        </div>
                        <p className="text-sm text-stone-700 italic border-l-2 border-stone-300 pl-4">
                            "I thought that this bent tube could serve as my elastic frame." — Marcel Breuer
                        </p>
                    </section>
                </div>
            </div>
        );
    };

    return (
        <div className="font-sans text-slate-900 bg-stone-50">
            {activeView === 'home' && <HomeView />}
            {activeView === 'lesson' && <LessonView />}
            {activeView === 'detail' && <DetailView />}
        </div>
    );
};

export default FurnitureNerd;