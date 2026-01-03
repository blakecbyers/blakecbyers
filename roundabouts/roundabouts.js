import React, { useState, useEffect, useRef } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Wind, ShieldCheck, Clock, Info, Quote, ArrowRight, Cpu, Zap, BatteryCharging, WifiOff, Car } from 'lucide-react';

// --- Animation Components ---

const RevealOnScroll = ({ children, delay = 0 }) => {
    const [isVisible, setIsVisible] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.unobserve(entry.target);
                }
            },
            { threshold: 0.1 }
        );
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, []);

    return (
        <div
            ref={ref}
            className={`transition-all duration-1000 ease-out transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
                }`}
            style={{ transitionDelay: `${delay}ms` }}
        >
            {children}
        </div>
    );
};

const RoundaboutAnimation = () => {
    return (
        <div className="relative w-64 h-64 md:w-80 md:h-80 mx-auto select-none pointer-events-none">
            {/* Style for custom spin animation */}
            <style>{`
        @keyframes spin-continuous {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-continuous 8s linear infinite;
        }
        .animate-spin-slower {
          animation: spin-continuous 12s linear infinite;
        }
      `}</style>

            {/* Roads */}
            <div className="absolute inset-0 flex items-center justify-center">
                {/* Vertical Road */}
                <div className="w-16 h-full bg-slate-200 absolute"></div>
                {/* Horizontal Road */}
                <div className="h-16 w-full bg-slate-200 absolute"></div>
            </div>

            {/* The Roundabout Circle (Asphalt) */}
            <div className="absolute inset-[15%] rounded-full bg-slate-200 border-8 border-slate-50 box-content shadow-inner"></div>

            {/* Center Island (Grass) */}
            <div className="absolute inset-[35%] rounded-full bg-emerald-500 border-4 border-emerald-600/20 shadow-lg z-10 flex items-center justify-center">
                <Wind className="text-emerald-100 animate-pulse" size={24} />
            </div>

            {/* Yield Lines */}
            <div className="absolute top-[16%] left-1/2 -translate-x-1/2 w-8 h-1 bg-slate-400/50"></div>
            <div className="absolute bottom-[16%] left-1/2 -translate-x-1/2 w-8 h-1 bg-slate-400/50"></div>
            <div className="absolute left-[16%] top-1/2 -translate-y-1/2 h-8 w-1 bg-slate-400/50"></div>
            <div className="absolute right-[16%] top-1/2 -translate-y-1/2 h-8 w-1 bg-slate-400/50"></div>

            {/* Cars Container - Rotates to move cars */}
            <div className="absolute inset-0 animate-spin-slow z-20">
                {/* Car 1 (Blue) */}
                <div className="absolute top-[18%] left-1/2 -translate-x-1/2 -translate-y-1/2 transform -rotate-90">
                    <div className="w-8 h-4 bg-blue-500 rounded-sm shadow-sm relative">
                        <div className="absolute right-0 top-0 bottom-0 w-1 bg-blue-700/50 rounded-r-sm"></div> {/* Windshield hint */}
                    </div>
                </div>
            </div>

            <div className="absolute inset-0 animate-spin-slow z-20" style={{ animationDelay: '-2.5s' }}>
                {/* Car 2 (Red) */}
                <div className="absolute top-[18%] left-1/2 -translate-x-1/2 -translate-y-1/2 transform -rotate-90">
                    <div className="w-8 h-4 bg-red-500 rounded-sm shadow-sm relative">
                        <div className="absolute right-0 top-0 bottom-0 w-1 bg-red-700/50 rounded-r-sm"></div>
                    </div>
                </div>
            </div>

            <div className="absolute inset-0 animate-spin-slow z-20" style={{ animationDelay: '-5s' }}>
                {/* Car 3 (Yellow) */}
                <div className="absolute top-[18%] left-1/2 -translate-x-1/2 -translate-y-1/2 transform -rotate-90">
                    <div className="w-8 h-4 bg-amber-400 rounded-sm shadow-sm relative">
                        <div className="absolute right-0 top-0 bottom-0 w-1 bg-amber-600/50 rounded-r-sm"></div>
                    </div>
                </div>
            </div>

            {/* Ambient particles (Clouds/Birds) */}
            <div className="absolute top-0 right-0 animate-bounce delay-700 text-slate-300">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L15 8L21 9L16 14L18 20L12 17L6 20L8 14L3 9L9 8L12 2Z" /></svg>
            </div>

        </div>
    );
};

// --- Data Constants & Sources ---
const CONSTANTS = {
    signal: {
        build: 400000,
        maint: 8000,
        replaceInterval: 15,
        replaceCost: 250000,
        userCost: 650000,
    },
    roundabout: {
        build: 1200000,
        maint: 1000,
        resurfaceInterval: 25,
        resurfaceCost: 100000,
        userCost: 150000,
    }
};

const RoundaboutRevolution = () => {
    const [activeTab, setActiveTab] = useState('agency');
    const [scrolled, setScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-emerald-200 overflow-x-hidden">

            {/* Navigation */}
            <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm py-3' : 'bg-transparent py-6'}`}>
                <div className="max-w-6xl mx-auto px-6 flex justify-between items-center">
                    <div className="flex items-center gap-2 group cursor-pointer">
                        <div className="bg-emerald-600 text-white p-2 rounded-lg transition-transform group-hover:rotate-180 duration-700">
                            <Wind size={20} />
                        </div>
                        <span className="font-bold text-xl tracking-tight text-slate-800">Flow<span className="text-emerald-600">State</span></span>
                    </div>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex gap-8 text-sm font-medium text-slate-600">
                        {['Impact', 'Cost', 'Future', 'Voices'].map((item) => (
                            <a key={item} href={`#${item.toLowerCase()}`} className="hover:text-emerald-600 transition-colors relative group">
                                {item}
                                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-emerald-500 transition-all group-hover:w-full"></span>
                            </a>
                        ))}
                    </div>

                    {/* Mobile Nav Button */}
                    <button
                        className="md:hidden text-slate-600"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? (
                            <span className="text-2xl font-bold">×</span>
                        ) : (
                            <span className="text-2xl font-bold">≡</span>
                        )}
                    </button>
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="md:hidden absolute top-full left-0 w-full bg-white border-b border-slate-100 p-4 flex flex-col gap-4 shadow-lg animate-fade-in-down">
                        {['Impact', 'Cost', 'Future', 'Voices'].map((item) => (
                            <a
                                key={item}
                                href={`#${item.toLowerCase()}`}
                                className="text-slate-600 font-medium py-2 px-4 hover:bg-slate-50 rounded-lg"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                {item}
                            </a>
                        ))}
                    </div>
                )}
            </nav>

            {/* Hero Section */}
            <header className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 px-6 overflow-hidden">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

                    <RevealOnScroll>
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wide mb-6">
                                Sustainable Infrastructure
                            </div>
                            <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight mb-6 leading-[1.1] text-slate-900">
                                Stop Stopping. <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500 animate-gradient-x">
                                    Start Moving.
                                </span>
                            </h1>
                            <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-lg leading-relaxed">
                                Traffic lights force waiting and fuel waste. Roundabouts keep life in motion—safer, greener, and cheaper by design.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <a href="#chart" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-emerald-600 text-white rounded-full font-bold shadow-lg hover:bg-emerald-700 hover:scale-105 active:scale-95 transition-all duration-200">
                                    See the Math <ArrowRight size={18} />
                                </a>
                                <a href="#future" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-full font-bold shadow-sm hover:bg-slate-50 transition-all duration-200">
                                    The AV Future
                                </a>
                            </div>
                        </div>
                    </RevealOnScroll>

                    <RevealOnScroll delay={300}>
                        <div className="relative flex justify-center lg:justify-end">
                            {/* Decorative Blob */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-emerald-100/50 to-teal-50/50 rounded-full blur-3xl -z-10"></div>

                            <RoundaboutAnimation />

                            {/* Floating Info Card */}
                            <div className="absolute -bottom-6 -left-6 md:bottom-0 md:left-10 bg-white/90 backdrop-blur p-4 rounded-xl shadow-xl border border-white/50 animate-bounce-slow hidden sm:block">
                                <div className="flex items-center gap-3">
                                    <div className="bg-emerald-100 p-2 rounded-full text-emerald-600">
                                        <Car size={20} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase">Avg Delay</p>
                                        <p className="text-lg font-bold text-slate-800">5.0 Seconds</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </RevealOnScroll>

                </div>
            </header>

            {/* KPI Section */}
            <section id="impact" className="py-24 bg-white">
                <div className="max-w-6xl mx-auto px-6">
                    <RevealOnScroll>
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-bold mb-4">By The Numbers</h2>
                            <p className="text-slate-500">Why civil engineers prefer circles.</p>
                        </div>
                    </RevealOnScroll>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <RevealOnScroll delay={100}>
                            <KPI
                                icon={<ShieldCheck size={32} />}
                                value="90%"
                                label="Reduction in Fatalities"
                                sub="Eliminates high-speed T-bone and head-on collisions."
                                color="emerald"
                            />
                        </RevealOnScroll>
                        <RevealOnScroll delay={200}>
                            <KPI
                                icon={<Wind size={32} />}
                                value="24k"
                                label="Gallons Saved / Yr"
                                sub="Per intersection. No idling means cleaner air for everyone."
                                color="teal"
                            />
                        </RevealOnScroll>
                        <RevealOnScroll delay={300}>
                            <KPI
                                icon={<Clock size={32} />}
                                value="89%"
                                label="Fewer Delays"
                                sub="Traffic keeps flowing, reducing rush hour backups."
                                color="cyan"
                            />
                        </RevealOnScroll>
                    </div>
                </div>
            </section>

            {/* Interactive Chart Section */}
            <section id="cost" className="py-24 px-6 bg-slate-50">
                <div className="max-w-5xl mx-auto">
                    <RevealOnScroll>
                        <div className="text-center mb-12">
                            <h2 className="text-3xl md:text-4xl font-bold mb-4">The 50-Year Economic Model</h2>
                            <p className="text-slate-600 max-w-2xl mx-auto">
                                Cities often choose traffic lights because they are cheap to build ($400k).
                                But roundabouts ($1.2M) are assets that pay dividends for decades.
                            </p>
                        </div>
                    </RevealOnScroll>

                    <RevealOnScroll delay={200}>
                        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
                            {/* Chart Controls */}
                            <div className="p-6 md:p-8 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6 bg-slate-50/50">
                                <div className="flex bg-slate-200/50 p-1 rounded-xl w-full md:w-auto">
                                    <button
                                        onClick={() => setActiveTab('agency')}
                                        className={`flex-1 md:flex-none px-6 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 ${activeTab === 'agency' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                    >
                                        City Budget
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('societal')}
                                        className={`flex-1 md:flex-none px-6 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 ${activeTab === 'societal' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                    >
                                        True Cost
                                    </button>
                                </div>

                                <div className="flex gap-4 text-xs font-medium text-slate-500">
                                    <div className="flex items-center gap-2">
                                        <span className="w-3 h-3 rounded-full bg-emerald-500"></span> Roundabout
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="w-3 h-3 rounded-full bg-red-500"></span> Traffic Light
                                    </div>
                                </div>
                            </div>

                            {/* Chart Area */}
                            <div className="p-4 md:p-10 h-[400px] md:h-[500px]">
                                <EconomicChart mode={activeTab} />
                            </div>

                            {/* Stats Breakdown Footer */}
                            <div className="grid grid-cols-1 md:grid-cols-2 border-t border-slate-100 divide-y md:divide-y-0 md:divide-x divide-slate-100">
                                <div className="p-6 md:p-8 bg-red-50/30">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="p-2 bg-red-100 text-red-600 rounded-lg"><Info size={18} /></div>
                                        <h3 className="font-bold text-slate-800">Traffic Light Economics</h3>
                                    </div>
                                    <ul className="space-y-3 text-sm text-slate-600">
                                        <li className="flex justify-between border-b border-slate-100 pb-2">
                                            <span>Upfront Cost</span>
                                            <span className="font-mono font-bold text-slate-900">$400k</span>
                                        </li>
                                        <li className="flex justify-between border-b border-slate-100 pb-2">
                                            <span>Annual Bill</span>
                                            <span className="font-mono font-bold text-red-600">~$8,000/yr</span>
                                        </li>
                                        <li className="flex justify-between">
                                            <span>Hardware Life</span>
                                            <span className="font-mono font-bold text-slate-900">15 Years</span>
                                        </li>
                                    </ul>
                                </div>

                                <div className="p-6 md:p-8 bg-emerald-50/30">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg"><Info size={18} /></div>
                                        <h3 className="font-bold text-slate-800">Roundabout Economics</h3>
                                    </div>
                                    <ul className="space-y-3 text-sm text-slate-600">
                                        <li className="flex justify-between border-b border-slate-100 pb-2">
                                            <span>Upfront Cost</span>
                                            <span className="font-mono font-bold text-slate-900">$1.2M</span>
                                        </li>
                                        <li className="flex justify-between border-b border-slate-100 pb-2">
                                            <span>Annual Bill</span>
                                            <span className="font-mono font-bold text-emerald-600">~$1,000/yr</span>
                                        </li>
                                        <li className="flex justify-between">
                                            <span>Structure Life</span>
                                            <span className="font-mono font-bold text-slate-900">50+ Years</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </RevealOnScroll>
                </div>
            </section>

            {/* Future Proofing Section */}
            <section id="future" className="py-24 bg-slate-900 text-slate-50 overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-20 pointer-events-none">
                    <div className="absolute top-10 left-10 w-64 h-64 bg-emerald-500 rounded-full blur-[128px] animate-pulse"></div>
                    <div className="absolute bottom-10 right-10 w-96 h-96 bg-teal-500 rounded-full blur-[128px]"></div>
                </div>

                <div className="max-w-6xl mx-auto px-6 relative z-10">
                    <RevealOnScroll>
                        <div className="flex flex-col md:flex-row gap-12 items-center mb-16">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 text-emerald-400 font-bold tracking-wider uppercase text-sm mb-4">
                                    <Cpu size={16} /> Future Proofing
                                </div>
                                <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
                                    Will Self-Driving Cars Kill the Roundabout?
                                </h2>
                                <p className="text-slate-400 text-lg leading-relaxed max-w-2xl">
                                    Quite the opposite. While some imagine a future of smart traffic lights talking to cars, the physics of electric autonomous vehicles (AVs) actually favor roundabouts even more.
                                </p>
                            </div>
                        </div>
                    </RevealOnScroll>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <RevealOnScroll delay={100}>
                            <FutureCard
                                icon={<BatteryCharging size={32} />}
                                title="The Momentum Factor"
                                desc="EVs hate stopping. Accelerating from a dead stop is the biggest drain on a battery. Roundabouts allow 'rolling yields', preserving momentum and extending the range of electric fleets."
                            />
                        </RevealOnScroll>
                        <RevealOnScroll delay={200}>
                            <FutureCard
                                icon={<WifiOff size={32} />}
                                title="No Expensive Upgrades"
                                desc="Making traffic lights 'smart' (V2I) costs billions in sensors and 5G tech. Roundabouts are 'dumb' infrastructure that works perfectly with onboard Lidar and cameras—no software updates required."
                            />
                        </RevealOnScroll>
                        <RevealOnScroll delay={300}>
                            <FutureCard
                                icon={<Zap size={32} />}
                                title="The 'Swarm' Effect"
                                desc="Simulations show that AVs can navigate roundabouts with smaller gaps than humans, potentially increasing roundabout capacity by 30-50% over signalized intersections."
                            />
                        </RevealOnScroll>
                    </div>
                </div>
            </section>

            {/* Voices Section */}
            <section id="voices" className="py-24 bg-emerald-900 text-emerald-50 relative overflow-hidden">
                {/* Subtle patterned background */}
                <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>

                <div className="max-w-6xl mx-auto px-6 relative z-10">
                    <RevealOnScroll>
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Voices from the Road</h2>
                            <p className="text-emerald-200/80">Leaders who did the math and made the change.</p>
                        </div>
                    </RevealOnScroll>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <RevealOnScroll delay={100}>
                            <QuoteCard
                                quote="We have more roundabouts than any other city in the US. Our accident rate has dropped by 80% and we save millions in electricity. It's simply the most sustainable choice."
                                author="Mayor Jim Brainard"
                                role="Carmel, Indiana (140+ Roundabouts)"
                            />
                        </RevealOnScroll>
                        <RevealOnScroll delay={200}>
                            <QuoteCard
                                quote="When you replace a traffic signal with a roundabout, you aren't just building a road. You are building a 24/7 safety system that works even when the power goes out."
                                author="Traffic Safety Institute"
                                role="Annual Report Summary"
                            />
                        </RevealOnScroll>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-slate-950 text-slate-500 py-12 border-t border-slate-900">
                <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2 text-white">
                        <Wind size={20} className="text-emerald-500" />
                        <span className="font-bold">FlowState</span>
                    </div>
                    <div className="text-sm text-center md:text-left">
                        Data visualization based on standard US infrastructure models.
                    </div>
                    <div className="flex gap-6 text-sm font-medium">
                        <a href="#" className="hover:text-white transition-colors">Methodology</a>
                        <a href="#" className="hover:text-white transition-colors">Sources</a>
                    </div>
                </div>
            </footer>

        </div>
    );
};

// --- Sub-Components ---

const KPI = ({ icon, value, label, sub, color }) => {
    const colors = {
        emerald: 'bg-emerald-50 text-emerald-600',
        teal: 'bg-teal-50 text-teal-600',
        cyan: 'bg-cyan-50 text-cyan-600',
    };

    return (
        <div className="p-8 rounded-2xl bg-white border border-slate-100 shadow-xl shadow-slate-200/40 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 h-full">
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 ${colors[color]} transform transition-transform group-hover:rotate-12`}>
                {icon}
            </div>
            <div className="text-5xl font-extrabold text-slate-900 mb-2 tracking-tight">{value}</div>
            <div className="text-lg font-bold text-slate-700 mb-2">{label}</div>
            <p className="text-slate-500 text-sm leading-relaxed">{sub}</p>
        </div>
    );
};

const FutureCard = ({ icon, title, desc }) => (
    <div className="bg-slate-800/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-700 hover:bg-slate-800 hover:border-emerald-500/30 transition-all duration-300 group h-full">
        <div className="text-emerald-400 mb-6 group-hover:scale-110 transition-transform duration-300">{icon}</div>
        <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
        <p className="text-slate-400 leading-relaxed text-sm">
            {desc}
        </p>
    </div>
);

const QuoteCard = ({ quote, author, role }) => (
    <div className="bg-emerald-800/50 p-8 rounded-2xl border border-emerald-700/50 relative h-full flex flex-col justify-between">
        <Quote className="absolute top-8 left-8 text-emerald-600/40 transform -scale-x-100" size={48} />
        <p className="text-xl md:text-2xl font-medium leading-relaxed mb-6 relative z-10 font-serif italic text-emerald-50">
            "{quote}"
        </p>
        <div>
            <div className="font-bold text-white text-lg">{author}</div>
            <div className="text-emerald-300 text-sm">{role}</div>
        </div>
    </div>
);

// --- The Chart Logic ---

const EconomicChart = ({ mode }) => {
    const generateData = () => {
        const data = [];
        const includeSocietal = mode === 'societal';

        // Initial Costs
        let signalTotal = CONSTANTS.signal.build;
        let roundTotal = CONSTANTS.roundabout.build;

        for (let year = 0; year <= 50; year++) {
            if (year > 0) {
                // Annual Costs
                signalTotal += CONSTANTS.signal.maint;
                roundTotal += CONSTANTS.roundabout.maint;

                if (includeSocietal) {
                    signalTotal += CONSTANTS.signal.userCost;
                    roundTotal += CONSTANTS.roundabout.userCost;
                }

                // Periodic Hardware Replacement (Signal)
                if (year % CONSTANTS.signal.replaceInterval === 0) {
                    signalTotal += CONSTANTS.signal.replaceCost;
                }

                // Periodic Resurfacing (Roundabout)
                if (year % CONSTANTS.roundabout.resurfaceInterval === 0) {
                    roundTotal += CONSTANTS.roundabout.resurfaceCost;
                }
            }

            data.push({ year, signal: signalTotal, roundabout: roundTotal });
        }
        return data;
    };

    const data = generateData();
    const breakEven = data.find(d => d.signal > d.roundabout);

    const formatMoney = (val) => {
        if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
        if (val >= 1000) return `$${(val / 1000).toFixed(0)}k`;
        return `$${val}`;
    };

    return (
        <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <defs>
                    <linearGradient id="colorSignal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1} />
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorRound" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis
                    dataKey="year"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                    dy={10}
                />
                <YAxis
                    tickFormatter={formatMoney}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                    width={60}
                />
                <Tooltip
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                    formatter={(value) => [new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value), '']}
                    labelStyle={{ color: '#64748b', marginBottom: '0.5rem' }}
                />

                {breakEven && (
                    <ReferenceLine x={breakEven.year} stroke="#cbd5e1" strokeDasharray="3 3">
                    </ReferenceLine>
                )}

                <Area
                    type="monotone"
                    dataKey="signal"
                    name="Traffic Signal"
                    stroke="#ef4444"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorSignal)"
                    animationDuration={1500}
                />
                <Area
                    type="monotone"
                    dataKey="roundabout"
                    name="Roundabout"
                    stroke="#10b981"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorRound)"
                    animationDuration={1500}
                />
            </AreaChart>
        </ResponsiveContainer>
    );
};

export default RoundaboutRevolution;