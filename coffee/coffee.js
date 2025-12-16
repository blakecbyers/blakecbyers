

(function () {
    // -- CONFIGURATION --
    const DATA = {
        frenchpress: { key: 'frenchpress', ratio: 16.7, clicks: "24-28", desc: "Med-Coarse", temp: "212°F (Boil)", time: 240 },
        aeropress: { key: 'aeropress', ratio: 18.2, clicks: "12-16", desc: "Med-Fine", temp: "212°F (Boil)", time: 120 },
        mokapot: { key: 'mokapot', ratio: 10, clicks: "10-14", desc: "Fine", temp: "212°F (Boil)", time: 0 }
    };
    const SCOOP_G = 6.5;
    const CUP_ML = 240;

    let currentKey = null;
    let timerInt = null;
    let secondsLeft = 0;

    // -- ELEMENT REFERENCES --
    const els = {
        btns: {
            fp: document.getElementById('btn-frenchpress'),
            ap: document.getElementById('btn-aeropress'),
            mp: document.getElementById('btn-mokapot'),
            start: document.getElementById('btn-timer-start'),
            reset: document.getElementById('btn-timer-reset')
        },
        inputs: {
            coffee: document.getElementById('input-coffee'),
            water: document.getElementById('input-water')
        },
        displays: {
            ratio: document.getElementById('ratio-val'),
            scoop: document.getElementById('scoop-val'),
            yield: document.getElementById('yield-val'),
            clicks: document.getElementById('info-clicks'),
            desc: document.getElementById('info-desc'),
            temp: document.getElementById('info-temp'),
            timer: document.getElementById('timer-clock'),
            fillText: document.getElementById('fp-fill-text'),
            fillBar: document.getElementById('fp-fill-bar')
        },
        sections: {
            calc: document.getElementById('calculator-area'),
            fp: document.getElementById('fp-only-stats')
        },
        adjusters: document.querySelectorAll('.adjust-btn')
    };

    // -- INITIALIZATION --
    function init() {
        // Click Handlers for Methods
        els.btns.fp.addEventListener('click', () => setMethod('frenchpress'));
        els.btns.ap.addEventListener('click', () => setMethod('aeropress'));
        els.btns.mp.addEventListener('click', () => setMethod('mokapot'));

        // Timer Handlers
        els.btns.start.addEventListener('click', startTimer);
        els.btns.reset.addEventListener('click', resetTimer);

        // Input Handlers
        els.inputs.coffee.addEventListener('input', () => recalc('coffee'));
        els.inputs.water.addEventListener('input', () => recalc('water'));

        // Plus/Minus Button Handlers
        els.adjusters.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const type = btn.dataset.target; // 'coffee' or 'water'
                const amt = parseFloat(btn.dataset.amt);
                modifyVal(type, amt);
            });
        });

        // Restore State or Default
        const savedKey = localStorage.getItem('cc_method');
        const savedWater = localStorage.getItem('cc_water');

        if (savedKey && DATA[savedKey]) {
            setMethod(savedKey, false); // Do not reset water to default if we have a save
            if (savedWater) {
                els.inputs.water.value = savedWater;
                recalc('water');
            }
        } else {
            setMethod('frenchpress');
        }
    }

    // -- CORE FUNCTIONS --
    function setMethod(key, resetValues = true) {
        currentKey = key;
        const d = DATA[key];

        // Update Button Styles
        ['fp', 'ap', 'mp'].forEach(k => {
            const btn = els.btns[k];
            // Map key to element ref
            const btnKey = (key === 'frenchpress' && k === 'fp') ||
                (key === 'aeropress' && k === 'ap') ||
                (key === 'mokapot' && k === 'mp');

            if (btnKey) {
                btn.classList.add('border-amber-500', 'text-amber-500', 'bg-stone-700');
                btn.classList.remove('border-stone-700', 'text-stone-300');
            } else {
                btn.classList.remove('border-amber-500', 'text-amber-500', 'bg-stone-700');
                btn.classList.add('border-stone-700', 'text-stone-300');
            }
        });

        // Update UI Texts
        els.displays.ratio.innerText = `1:${d.ratio.toFixed(1)}`;
        els.displays.clicks.innerText = d.clicks;
        els.displays.desc.innerText = d.desc;
        els.displays.temp.innerText = d.temp;
        els.sections.calc.classList.remove('opacity-50', 'pointer-events-none');

        // Show/Hide FP Bar
        if (key === 'frenchpress') els.sections.fp.classList.remove('hidden');
        else els.sections.fp.classList.add('hidden');

        // Set Defaults logic
        if (resetValues) {
            if (key === 'mokapot') els.inputs.water.value = 100;
            else els.inputs.water.value = 240;
            recalc('water');
        } else {
            recalc('water'); // just refresh stats
        }

        // Timer Logic
        resetTimer(false);
        if (key === 'mokapot') {
            els.displays.timer.innerText = "--:--";
            els.btns.start.disabled = true;
            els.btns.start.classList.add('opacity-50');
        } else {
            els.btns.start.disabled = false;
            els.btns.start.classList.remove('opacity-50');
        }

        save();
    }

    function recalc(source) {
        if (!currentKey) return;
        const ratio = DATA[currentKey].ratio;

        if (source === 'coffee') {
            const cVal = parseFloat(els.inputs.coffee.value) || 0;
            const wVal = Math.round(cVal * ratio);
            els.inputs.water.value = wVal;
        } else {
            const wVal = parseFloat(els.inputs.water.value) || 0;
            const cVal = (wVal / ratio).toFixed(1);
            els.inputs.coffee.value = cVal;
        }
        updateStats();
        save();
    }

    function modifyVal(type, amount) {
        const input = els.inputs[type];
        let val = parseFloat(input.value) || 0;
        val += amount;
        if (val < 0) val = 0;

        if (type === 'coffee') val = Math.round(val * 10) / 10;
        else val = Math.round(val);

        input.value = val;
        recalc(type);
    }

    function updateStats() {
        const wVal = parseFloat(els.inputs.water.value) || 0;
        const cVal = parseFloat(els.inputs.coffee.value) || 0;

        // Update derived displays
        els.displays.scoop.innerText = `≈ ${(cVal / SCOOP_G).toFixed(1)} scoops`;
        els.displays.yield.innerText = `${(wVal / CUP_ML).toFixed(1)} Cups`;

        // FP Fill Bar
        if (currentKey === 'frenchpress') {
            const pct = Math.min(100, Math.round((wVal / 1000) * 100));
            els.displays.fillBar.style.width = `${pct}%`;
            els.displays.fillText.innerText = `${pct}%`;

            if (wVal > 1000) {
                els.displays.fillText.innerText = "OVERFILL";
                els.displays.fillText.classList.add('text-red-500');
                els.displays.fillBar.classList.add('bg-red-500');
            } else {
                els.displays.fillText.classList.remove('text-red-500');
                els.displays.fillBar.classList.remove('bg-red-500');
            }
        }
    }

    // -- TIMER FUNCTIONS --
    function startTimer() {
        if (timerInt || !currentKey) return;
        secondsLeft = DATA[currentKey].time;
        if (!secondsLeft) return;

        els.displays.timer.innerText = fmtTime(secondsLeft);

        timerInt = setInterval(() => {
            secondsLeft--;
            els.displays.timer.innerText = fmtTime(secondsLeft);
            if (secondsLeft <= 0) {
                clearInterval(timerInt);
                timerInt = null;
                alert("Ready!");
            }
        }, 1000);
    }

    function resetTimer(uiUpdate = true) {
        clearInterval(timerInt);
        timerInt = null;
        if (currentKey && uiUpdate) {
            els.displays.timer.innerText = fmtTime(DATA[currentKey].time);
        }
    }

    function fmtTime(s) {
        const m = Math.floor(s / 60).toString().padStart(2, '0');
        const sec = (s % 60).toString().padStart(2, '0');
        return `${m}:${sec}`;
    }

    function save() {
        if (currentKey) {
            localStorage.setItem('cc_method', currentKey);
            localStorage.setItem('cc_water', els.inputs.water.value);
        }
    }

    // Initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
