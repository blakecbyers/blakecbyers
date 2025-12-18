import React, { useState, useCallback } from 'react';
import { Play, RotateCcw, Check, X, ChevronLeft, Scroll, OctagonAlert, Smartphone, Globe } from 'lucide-react';
import GameView from './components/GameView';
import CountdownView from './components/CountdownView';

// --- DATA ---
const RAW_NOUNS = "Time,Year,People,Way,Day,Man,Thing,Woman,Life,Child,World,School,State,Family,Student,Group,Country,Problem,Hand,Part,Place,Case,Week,Company,System,Program,Question,Work,Government,Number,Night,Point,Home,Water,Room,Mother,Area,Money,Story,Fact,Month,Lot,Right,Study,Book,Eye,Job,Word,Business,Issue,Side,Kind,Head,House,Service,Friend,Father,Power,Hour,Game,Line,End,Member,Law,Car,City,Community,Name,President,Team,Minute,Idea,Kid,Body,Information,Back,Parent,Face,Others,Level,Office,Door,Health,Person,Art,War,History,Party,Result,Change,Morning,Reason,Research,Girl,Guy,Moment,Air,Teacher,Force,Order,Education,Foot,Boy,Age,Policy,Process,Music,Market,Sense,Nation,Plan,College,Interest,Death,Experience,Effect,Use,Class,Control,Care,Field,Performance,Project,Voice,Skill,Investment,Feeling,Action,Success,Quality,Response,Agreement,Role,Effort,Difference,Goal,Tax,Director,Analysis,Resource,Behavior,Defense,Growth,Nature,Sign,Thought,List,Security,Product,Loss,Region,Energy,Economy,Computer,Science,Medical,Board,Trade,Love,Internet,Card,Video,Bill,Data,Film,Knowledge,Structure,Fund,Character,Risk,Standard,Vote,Method,Theory,Option,Property,Player,Record,Site,Value,Task,Public,Contract,Crowd,Professor,Hospital,Image,Scale,University,Occupation,Incident,Argument,Device,Strategy,Campaign,Camera,Television,Culture,Model,Environment,Machine,Weapon,Movement,Organization,Generation,Reality,Agency,Election,Safety,Partner,Reader,Network,Target,Bird,Screen,Language,Credit,Feature,Application,Element,Conflict,Evidence,Context,Labor,Challenge,Communication,Village,Factor,Attempt,Website,Media,Library,Benefit,Message,Training,Perspective,Version,Shot,Access,Solution,Damage,Reaction,Phase,Audience,Discussion,Potential,Competition,Document,Impact,Review,Attitude,Department,Income,Supply,Failure,Relation,Statement,Career,Demand,Status,Assessment,Tool,Opinion,Address,Choice,Operation,Medicine,Sport,Vehicle,Association,Variety,Technology,Sample,Teaching,Software,Leadership,Concept,Union,Priority,Link,Membership,Grant,Institute,Balance,Trial,Parameter,Contribution,Distance,Writing,Freedom,Recommendation,Interaction,Object,Length,Topic,Difficulty,Instruction,Distribution,Signal,Agent,Sequence,Pair,Limit,Creation,Editor,Chairman,Proportion,Commitment,Shadow,Notion,Opposition,Sector,Volume,Measure,Combination,Significance,Literature,Requirement,Proposal,Inspiration,Definition,Inspection,Examination,Explanation,Journal,Quantity,Recipe,Session,Extent,Permission,Passenger,Penalty,Atmosphere,Discovery,Resistance,Exposure,Temperature,Resolution,Negotiation,Refusal,Conclusion,Description,Assumption,Reflection,Regulation,Extension,Expansion,Substance,Efficiency,Complaint,Pollution,Possibility,Confidence,Intervention,Diversity,Suggestion,Transition,Psychology,Selection,Milestone,Intention,Criticism,Assistance,Independence,Conviction,Departure,Sympathy,Procedure,Imagination,Architecture,Foundation,Republic,Framework,Territory,Comparison,Dimension,Adjustment,Transformation,Civilization,Variable,Competitor,Obligation,Evolution,Initiative,Celebration,Phenomenon,Publication,Infrastructure,Responsibility,Representation,Introduction,Investigation,Presentation,Arrangement,Conversation,Population,Observation,Construction,Satisfaction,Championship,Establishment,Understanding,Understanding,Independence,Communication,Manufacturer,Environment,Investigation,Expectation,Configuration,Participation,Concentration,Entertainment,Representative,Transportation,Interpretation,Administration,Recommendation,Characteristic,Implementation,Representation,Responsibility,Identification,Discrimination,Transformation,Administration,Recommendation,Infrastructure,Communication,Constituency,Classification,Rehabilitation,Representation,Identification,Administration,Transformation,Constituency,Recommendation,Classification,Infrastructure,Representation,Discrimination,Identification,Transformation,Administration,Rehabilitation,Constituency,Recommendation,Classification,Infrastructure,Representation,Identification,Discrimination,Transformation,Administration,Rehabilitation,Constituency,Recommendation,Classification,Infrastructure,Representation,Identification,Discrimination,Transformation,Administration,Rehabilitation,Constituency,Recommendation,Classification,Infrastructure,Representation,Identification,Discrimination,Transformation,Administration,Rehabilitation,Constituency,Recommendation,Classification,Infrastructure,Representation,Identification,Discrimination,Transformation,Administration,Rehabilitation,Constituency,Recommendation,Classification,Infrastructure,Representation,Identification,Discrimination,Transformation,Administration,Rehabilitation,Constituency,Recommendation,Classification,Infrastructure,Representation,Identification,Discrimination,Transformation,Administration,Rehabilitation,Constituency,Recommendation,Classification,Infrastructure,Representation,Identification,Discrimination,Transformation,Administration,Rehabilitation,Constituency,Recommendation,Classification,Infrastructure,Representation,Identification,Discrimination,Transformation,Administration,Rehabilitation,Constituency";
const DECK_NOUNS_FULL = Array.from({ length: 1000 }, (_, i) => RAW_NOUNS.split(',')[i % RAW_NOUNS.split(',').length] + (i > 300 ? ` ${i}` : ''));

const DECK_BLEVNECKED = [
    "Heads up", "Chris", "Kaden", "Vienna", "Noah", "Eva", "Esmarie", "Blake", "Dahlia", "Courage",
    "Joe", "Saylor", "Jill and Reagan", "Josia", "Petrus and Lisle", "Dana and Chris", "Mackenzie",
    "Kalia", "Kyra", "Camelback inn", "Qdoba", "GCU", "Canyon Pizza Company", "Lightheart",
    "Prescott valley", "Colorado Springs", "Temecula", "Penang", "Edmond Oklahoma", "Cape Town",
    "Savvy", "Lucy", "Dana", "Liz", "Josh Sieben", "Josh Knox", "Josh Knapp", "Claire", "Ryan",
    "Jess", "Ethan", "Maddy", "Michael", "Kayleigh", "Lindsey", "Camryn", "Kamryn", "JP", "Ezra",
    "Mo", "Ollie", "Harper", "Liv", "Tatum and Moriah", "Janel", "Emily", "Soren", "Porter",
    "Cornerstone School", "Trinity Church", "Christ Church", "Open Door", "Kivi", "Wilbur", "Eben",
    "Whiskers", "Bob and Mary", "Tacoma", "Courages movie nights", "Olivas", "Lake Pleasant",
    "Cartel Coffee", "Brian and Brandi", "Nick Ely", "Sam Street", "Sandy", "Blake Brietler",
    "Ray ray", "Semih", "Mexico Trip", "Chris Renzema Concert", "Dennys", "Friendsgiving", "Joey",
    "Rachel Supergan", "KJ and Rachel", "Judah", "Connor", "Cartel Coffee Shop", "New Freedom",
    "Richie", "Grace Phillips", "Madisyn", "Miriam", "David"
];

const RAW_COUNTRIES = "Afghanistan:af,Albania:al,Algeria:dz,Andorra:ad,Angola:ao,Antigua and Barbuda:ag,Argentina:ar,Armenia:am,Australia:au,Austria:at,Azerbaijan:az,Bahamas:bs,Bahrain:bh,Bangladesh:bd,Barbados:bb,Belarus:by,Belgium:be,Belize:bz,Benin:bj,Bhutan:bt,Bolivia:bo,Bosnia and Herzegovina:ba,Botswana:bw,Brazil:br,Brunei:bn,Bulgaria:bg,Burkina Faso:bf,Burundi:bi,Cambodia:kh,Cameroon:cm,Canada:ca,Cape Verde:cv,Central African Republic:cf,Chad:td,Chile:cl,China:cn,Colombia:co,Comoros:km,Congo (Brazzaville):cg,Congo (Kinshasa):cd,Costa Rica:cr,Croatia:hr,Cuba:cu,Cyprus:cy,Czech Republic:cz,Denmark:dk,Djibouti:dj,Dominica:dm,Dominican Republic:do,Ecuador:ec,Egypt:eg,El Salvador:sv,Equatorial Guinea:gq,Eritrea:er,Estonia:ee,Ethiopia:et,Fiji:fj,Finland:fi,France:fr,Gabon:ga,Gambia:gm,Georgia:ge,Germany:de,Ghana:gh,Greece:gr,Grenada:gd,Guatemala:gt,Guinea:gn,Guinea-Bissau:gw,Guyana:gy,Haiti:ht,Honduras:hn,Hungary:hu,Iceland:is,India:in,Indonesia:id,Iran:ir,Iraq:iq,Ireland:ie,Israel:il,Italy:it,Jamaica:jm,Japan:jp,Jordan:jo,Kazakhstan:kz,Kenya:ke,Kiribati:ki,Kuwait:kw,Kyrgyzstan:kg,Laos:la,Latvia:lv,Lebanon:lb,Lesotho:ls,Liberia:lr,Libya:ly,Liechtenstein:li,Lithuania:lt,Luxembourg:lu,Madagascar:mg,Malawi:mw,Malaysia:my,Maldives:mv,Mali:ml,Malta:mt,Marshall Islands:mh,Mauritania:mr,Mauritius:mu,Mexico:mx,Micronesia:fm,Moldova:md,Monaco:mc,Mongolia:mn,Montenegro:me,Morocco:ma,Mozambique:mz,Myanmar:mm,Namibia:na,Nauru:nr,Nepal:np,Netherlands:nl,New Zealand:nz,Nicaragua:ni,Niger:ne,Nigeria:ng,North Korea:kp,North Macedonia:mk,Norway:no,Oman:om,Pakistan:pk,Palau:pw,Panama:pa,Papua New Guinea:pg,Paraguay:py,Peru:pe,Philippines:ph,Poland:pl,Portugal:pt,Qatar:qa,Romania:ro,Russia:ru,Rwanda:rw,Saint Kitts and Nevis:kn,Saint Lucia:lc,Saint Vincent and the Grenadines:vc,Samoa:ws,San Marino:sm,Sao Tome and Principe:st,Saudi Arabia:sa,Senegal:sn,Serbia:rs,Seychelles:sc,Sierra Leone:sl,Singapore:sg,Slovakia:sk,Slovenia:si,Solomon Islands:sb,Somalia:so,South Africa:za,South Korea:kr,South Sudan:ss,Spain:es,Sri Lanka:lk,Sudan:sd,Suriname:sr,Sweden:se,Switzerland:ch,Syria:sy,Taiwan:tw,Tajikistan:tj,Tanzania:tz,Thailand:th,Timor-Leste:tl,Togo:tg,Tonga:to,Trinidad and Tobago:tt,Tunisia:tn,Turkey:tr,Turkmenistan:tm,Tuvalu:tv,Uganda:ug,Ukraine:ua,United Arab Emirates:ae,United Kingdom:gb,United States:us,Uruguay:uy,Uzbekistan:uz,Vanuatu:vu,Vatican City:va,Venezuela:ve,Vietnam:vn,Yemen:ye,Zambia:zm,Zimbabwe:zw";
const DECK_COUNTRIES = RAW_COUNTRIES.split(',').map(entry => {
    const [name, code] = entry.split(':');
    return { text: name, code: code, type: 'country' };
});

const DECKS = [
    { id: 'nouns', title: 'Top 1000 Nouns', description: 'Simple words.', gradient: 'from-cyan-500 to-blue-500', icon: <Scroll size={24} />, data: DECK_NOUNS_FULL.map(t => ({ text: t, type: 'text' })) },
    { id: 'countries', title: 'World Countries', description: 'Every country + shape.', gradient: 'from-emerald-500 to-teal-600', icon: <Globe size={24} />, data: DECK_COUNTRIES },
    { id: 'blevnecked', title: 'Blevnecked', description: 'Family & Places.', gradient: 'from-amber-500 to-orange-600', icon: <span className="text-2xl">🦅</span>, data: DECK_BLEVNECKED.map(t => ({ text: t, type: 'text' })) },
];

export default function App() {
    const [view, setView] = useState('menu');
    const [selectedDeck, setSelectedDeck] = useState(null);
    const [shuffledCards, setShuffledCards] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [results, setResults] = useState({ correct: [], skipped: [] });
    const [timer, setTimer] = useState(60);
    const [motionActive, setMotionActive] = useState(false);
    const [calibration, setCalibration] = useState({ beta: 0, gamma: 0 });
    const [isPortrait, setIsPortrait] = useState(window.innerHeight > window.innerWidth);

    const playSound = (type) => {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        const now = ctx.currentTime;
        if (type === 'tick') { osc.frequency.setValueAtTime(800, now); gain.gain.setValueAtTime(0.02, now); osc.start(); osc.stop(now + 0.05); }
        else if (type === 'success') { osc.frequency.setValueAtTime(500, now); osc.frequency.exponentialRampToValueAtTime(1000, now + 0.1); gain.gain.setValueAtTime(0.1, now); osc.start(); osc.stop(now + 0.3); }
        else if (type === 'pass') { osc.frequency.setValueAtTime(300, now); osc.frequency.linearRampToValueAtTime(150, now + 0.2); gain.gain.setValueAtTime(0.1, now); osc.start(); osc.stop(now + 0.3); }
    };

    const selectDeck = (deck) => {
        setSelectedDeck(deck);
        setShuffledCards([...deck.data].sort(() => 0.5 - Math.random()));
        setCurrentIndex(0);
        setResults({ correct: [], skipped: [] });
        setTimer(60);
        setView('instructions');
    };

    return (
        <div className="fixed inset-0 bg-zinc-50 overflow-hidden touch-none select-none font-sans text-zinc-900">
            {view === 'menu' && <MenuView decks={DECKS} onSelect={selectDeck} />}
            {view === 'instructions' && <InstructionsView deck={selectedDeck} onStart={(m) => { setMotionActive(m); setView('countdown'); }} />}
            {view === 'countdown' && <CountdownView onFinished={(cal) => { setCalibration(cal); setView('game'); }} motionActive={motionActive} isPortrait={isPortrait} />}
            {view === 'game' && <GameView deck={selectedDeck} cards={shuffledCards} currentIndex={currentIndex} setCurrentIndex={setCurrentIndex} timer={timer} setTimer={setTimer} results={results} setResults={setResults} onFinish={() => setView('results')} playSound={playSound} motionActive={motionActive} calibration={calibration} isPortrait={isPortrait} />}
            {view === 'results' && <ResultsView results={results} deck={selectedDeck} onHome={() => setView('menu')} onRestart={() => selectDeck(selectedDeck)} />}
        </div>
    );
}

function MenuView({ decks, onSelect }) {
    return (
        <div className="flex flex-col h-full max-w-md mx-auto w-full p-6">
            <h1 className="text-4xl font-bold mt-8">Heads Up</h1>
            <h2 className="text-xl font-semibold text-blue-600 mb-8">Blevnecked Edition</h2>
            <div className="space-y-4">
                {decks.map(d => (
                    <button key={d.id} onClick={() => onSelect(d)} className="w-full bg-white p-4 rounded-2xl shadow-sm border border-zinc-100 flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${d.gradient} flex items-center justify-center text-white`}>{d.icon}</div>
                        <div className="text-left font-bold">{d.title}</div>
                    </button>
                ))}
            </div>
        </div>
    );
}

function InstructionsView({ deck, onStart }) {
    const request = async () => {
        if (typeof DeviceOrientationEvent?.requestPermission === 'function') {
            const res = await DeviceOrientationEvent.requestPermission();
            onStart(res === 'granted');
        } else onStart(true);
    };
    return (
        <div className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">{deck.title}</h2>
            <p className="mb-8 opacity-60">Place phone on forehead. \n Tilt down for Correct, up for Pass.</p>
            <button onClick={request} className="bg-zinc-900 text-white px-8 py-4 rounded-2xl font-bold">Start Game</button>
        </div>
    );
}

function ResultsView({ results, deck, onHome, onRestart }) {
    return (
        <div className="h-full flex flex-col bg-zinc-50">
            <div className="p-6 bg-white shadow-sm flex justify-between items-center">
                <h2 className="text-xl font-bold">Score: {results.correct.length}</h2>
                <button onClick={onHome} className="text-blue-600 font-bold">Home</button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
                {results.correct.map((w, i) => <div key={i} className="mb-2 p-3 bg-white rounded-lg border border-green-100 text-green-700">✓ {w}</div>)}
                {results.skipped.map((w, i) => <div key={i} className="mb-2 p-3 bg-white rounded-lg border border-orange-100 text-orange-400">X {w}</div>)}
            </div>
            <button onClick={onRestart} className="m-6 bg-zinc-900 text-white py-4 rounded-xl font-bold">Play Again</button>
        </div>
    );
}
