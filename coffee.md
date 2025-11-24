        ---
        layout: jekyll-theme-minimal
        title: "Coffee"
        permalink: /coffee/
        ---


<!-- WRAPPER: Sets the dark background and centers the app like a mobile screen -->
<div id="coffee-companion-root" class="relative w-full min-h-[700px] flex flex-col items-center justify-center bg-[#1c1917] text-[#f5f5f4] p-4 font-sans rounded-xl my-8">

    <!-- Load Tailwind for styling -->
    <script src="https://cdn.tailwindcss.com"></script>
    
    <!-- Internal CSS for scrollbars and input overrides -->
    <style>
        #coffee-companion-root { font-family: 'Inter', sans-serif; }
        
        /* Custom Scrollbar */
        #coffee-companion-root ::-webkit-scrollbar { width: 8px; }
        #coffee-companion-root ::-webkit-scrollbar-track { background: transparent; }
        #coffee-companion-root ::-webkit-scrollbar-thumb { background: #44403c; border-radius: 4px; }
        
        /* Remove default number input arrows */
        #coffee-companion-root input[type=number]::-webkit-inner-spin-button, 
        #coffee-companion-root input[type=number]::-webkit-outer-spin-button { 
            -webkit-appearance: none; margin: 0; 
        }
        #coffee-companion-root input[type=number] { -moz-appearance: textfield; }
        #coffee-companion-root .hidden { display: none; }
    </style>

    <!-- APP CARD -->
    <div class="max-w-md w-full bg-stone-900 rounded-2xl shadow-2xl overflow-hidden border border-stone-800">
        
        <!-- Header -->
        <div class="bg-stone-800 p-6 text-center">
            <h2 class="text-2xl font-bold text-amber-500 tracking-tight m-0">Coffee Companion</h2>
            <p class="text-stone-400 text-sm mt-1">Timemore Edition • Fahrenheit</p>
        </div>

        <!-- Content Container -->
        <div class="p-6 space-y-6">
            
            <!-- Method Buttons -->
            <div>
                <label class="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-3">Select Method</label>
                <div class="grid grid-cols-3 gap-3">
                    <!-- French Press -->
                    <button id="btn-frenchpress" class="method-select-btn p-3 rounded-xl bg-stone-800 border border-stone-700 text-stone-300 hover:border-amber-500 hover:text-amber-500 transition-colors flex flex-col items-center gap-2 w-full group">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 group-hover:text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                        <span class="text-xs font-medium text-center">French Press</span>
                    </button>
                    <!-- Aeropress -->
                    <button id="btn-aeropress" class="method-select-btn p-3 rounded-xl bg-stone-800 border border-stone-700 text-stone-300 hover:border-amber-500 hover:text-amber-500 transition-colors flex flex-col items-center gap-2 w-full group">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 group-hover:text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m8-10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                        <span class="text-xs font-medium text-center">Aeropress</span>
                    </button>
                    <!-- Moka Pot -->
                    <button id="btn-mokapot" class="method-select-btn p-3 rounded-xl bg-stone-800 border border-stone-700 text-stone-300 hover:border-amber-500 hover:text-amber-500 transition-colors flex flex-col items-center gap-2 w-full group">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 group-hover:text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        <span class="text-xs font-medium text-center">Moka Pot</span>
                    </button>
                </div>
            </div>

            <!-- Calculator Section -->
            <div id="calculator-area" class="space-y-6 opacity-50 pointer-events-none transition-opacity">
                
                <!-- Input Card -->
                <div class="bg-stone-800/50 rounded-xl p-4 border border-stone-700/50">
                    <div class="flex justify-between items-center mb-4">
                        <span class="text-stone-400 text-sm">Ratio</span>
                        <span id="ratio-val" class="text-amber-500 font-mono font-bold">1:16.7</span>
                    </div>
                    
                    <div class="grid grid-cols-2 gap-4">
                        <!-- Coffee -->
                        <div>
                            <label class="block text-xs text-stone-500 mb-1">Coffee (g)</label>
                            <div class="flex items-center bg-stone-900 border border-stone-700 rounded-lg overflow-hidden group focus-within:border-amber-500 transition-colors">
                                <button class="adjust-btn px-2 py-3 text-stone-500 hover:text-white bg-stone-900 hover:bg-stone-800 transition-colors" data-target="coffee" data-amt="-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" /></svg>
                                </button>
                                <input type="number" id="input-coffee" value="14.4" class="w-full bg-transparent text-center text-lg font-bold text-white focus:outline-none border-none h-full m-0 p-0">
                                <button class="adjust-btn px-2 py-3 text-stone-500 hover:text-white bg-stone-900 hover:bg-stone-800 transition-colors" data-target="coffee" data-amt="1">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
                                </button>
                            </div>
                            <div class="text-center mt-2"><span id="scoop-val" class="text-xs text-amber-500 font-medium">≈ 2.2 scoops</span></div>
                        </div>

                        <!-- Water -->
                        <div>
                            <label class="block text-xs text-stone-500 mb-1">Water (ml)</label>
                            <div class="flex items-center bg-stone-900 border border-stone-700 rounded-lg overflow-hidden group focus-within:border-blue-500 transition-colors">
                                <button class="adjust-btn px-2 py-3 text-stone-500 hover:text-blue-400 bg-stone-900 hover:bg-stone-800 transition-colors" data-target="water" data-amt="-10">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" /></svg>
                                </button>
                                <input type="number" id="input-water" value="240" class="w-full bg-transparent text-center text-lg font-bold text-blue-400 focus:outline-none border-none h-full m-0 p-0">
                                <button class="adjust-btn px-2 py-3 text-stone-500 hover:text-blue-400 bg-stone-900 hover:bg-stone-800 transition-colors" data-target="water" data-amt="10">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
                                </button>
                            </div>
                            <div class="text-center mt-2"><span id="yield-val" class="text-xs text-blue-400 font-medium">1.0 Cups</span></div>
                        </div>
                    </div>
                </div>

                <!-- French Press Fill Bar -->
                <div id="fp-only-stats" class="hidden bg-stone-800/50 rounded-xl p-4 border border-stone-700/50">
                    <div class="flex justify-between text-sm mb-2">
                        <span class="text-stone-400">1L Carafe Fill</span>
                        <span id="fp-fill-text" class="text-amber-500 font-bold">0%</span>
                    </div>
                    <div class="w-full bg-stone-700 rounded-full h-2.5 mb-3 overflow-hidden">
                        <div id="fp-fill-bar" class="bg-amber-600 h-2.5 rounded-full transition-all duration-500" style="width: 0%"></div>
                    </div>
                </div>

                <!-- Info Grid -->
                <div class="grid grid-cols-2 gap-4">
                    <div class="bg-stone-800/50 rounded-xl p-4 border border-stone-700/50 flex flex-col items-center justify-center text-center">
                        <span class="text-xs text-stone-500 uppercase tracking-wider mb-2">Timemore</span>
                        <div class="flex items-center gap-2">
                            <span id="info-clicks" class="text-xl font-bold text-white">--</span>
                        </div>
                        <span id="info-desc" class="text-xs text-stone-400 mt-1">--</span>
                    </div>
                    <div class="bg-stone-800/50 rounded-xl p-4 border border-stone-700/50 flex flex-col items-center justify-center text-center">
                        <span class="text-xs text-stone-500 uppercase tracking-wider mb-2">Temp</span>
                        <div class="flex items-center gap-2">
                            <span id="info-temp" class="text-xl font-bold text-white">--</span>
                        </div>
                        <span class="text-xs text-stone-400 mt-1">Water Temp</span>
                    </div>
                </div>

                <!-- Timer -->
                <div class="bg-stone-800 rounded-xl p-6 text-center border border-stone-700">
                    <div id="timer-clock" class="text-5xl font-mono font-bold text-white mb-4">04:00</div>
                    <div class="flex justify-center gap-3">
                        <button id="btn-timer-start" class="px-6 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-full font-semibold transition-colors">Start</button>
                        <button id="btn-timer-reset" class="px-6 py-2 bg-stone-700 hover:bg-stone-600 text-white rounded-full font-semibold transition-colors">Reset</button>
                    </div>
                </div>

            </div>
        </div>
    </div>

    <script src="/js/coffee.js"></script>
