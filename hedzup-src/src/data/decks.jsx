import React from 'react';
import { Scroll, Globe, AlertOctagon } from 'lucide-react';

// 1. Nouns Deck
const RAW_NOUNS = "Time,Year,People,Way,Day,Man,Thing,Woman,Life,Child,World,School,State,Family,Student,Group,Country,Problem,Hand,Part,Place,Case,Week,Company,System,Program,Question,Work,Government,Number,Night,Point,Home,Water,Room,Mother,Area,Money,Story,Fact,Month,Lot,Right,Study,Book,Eye,Job,Word,Business,Issue,Side,Kind,Head,House,Service,Friend,Father,Power,Hour,Game,Line,End,Member,Law,Car,City,Community,Name,President,Team,Minute,Idea,Kid,Body,Information,Back,Parent,Face,Others,Level,Office,Door,Health,Person,Art,War,History,Party,Result,Change,Morning,Reason,Research,Girl,Guy,Moment,Air,Teacher,Force,Order,Education,Foot,Car,Boy,Age,Policy,Process,Music,Market,Sense,Nation,Plan,College,Interest,Death,Experience,Effect,Use,Class,Control,Care,Field,Performance,Office,Project,Voice,Skill,Investment,Feeling,Action,Success,Quality,Response,Agreement,Role,Effort,Difference,Goal,Tax,Director,Analysis,Resource,Behavior,Defense,Growth,Nature,Sign,Thought,List,Security,Product,Loss,Region,Energy,Economy,Computer,Science,Medical,Board,Trade,Love,Internet,Card,Video,Bill,Data,Film,Knowledge,Structure,Fund,Character,Risk,Standard,Vote,Method,Theory,Option,Property,Player,Record,Site,Value,Task,Public,Contract,Crowd,Professor,Hospital,Image,Scale,University,Occupation,Incident,Argument,Device,Strategy,Theory,Campaign,Camera,Television,Culture,Model,Environment,Machine,Weapon,Movement,Organization,Generation,Reality,Television,Agency,Election,Safety,Partner,Reader,Network,Target,Bird,Screen,Language,Credit,Feature,Application,Network,Element,Conflict,Evidence,Context,Labor,Scale,Challenge,Communication,Village,Factor,Attempt,Website,Media,Library,Benefit,Message,Training,Perspective,Version,Shot,Access,Solution,Damage,Reaction,Phase,Audience,Discussion,Potential,Competition,Document,Impact,Review,Attitude,Department,Income,Supply,Failure,Relation,Statement,Career,Demand,Status,Assessment,Tool,Opinion,Address,Choice,Operation,Medicine,Video,Application,Sport,Vehicle,Association,Variety,Technology,Sample,Teaching,Software,Leadership,Concept,Safety,Union,Perspective,Priority,Credit,Link,Membership,Grant,Institute,Balance,Trial,Parameter,Contribution,Review,Distance,Writing,Freedom,Recommendation,Interaction,Election,Object,Length,Topic,Difficulty,Instruction,Distribution,Signal,Agent,Sequence,Pair,Limit,Creation,Strategy,Editor,Chairman,Proportion,Commitment,Challenge,Interaction,Improvement,Cross,Document,Shadow,Notion,Opposition,Sector,Volume,Measure,Combination,Significance,Literature,Requirement,Proposal,Inspiration,Definition,Inspection,Examination,Explanation,Journal,Quantity,Reaction,Recipe,Session,Extent,Interaction,Investment,Proposal,Permission,Definition,Volume,Passenger,Penalty,Atmosphere,Discovery,Resistance,Exposure,Temperature,Investment,Resolution,Negotiation,Refusal,Conclusion,Description,Assumption,Reflection,Regulation,Extension,Expansion,Substance,Efficiency,Complaint,Pollution,Possibility,Confidence,Intervention,Diversity,Suggestion,Transition,Psychology,Selection,Milestone,Intention,Criticism,Assistance,Independence,Conviction,Departure,Sympathy,Procedure,Imagination,Architecture,Proposal,Instruction,Foundation,Republic,Framework,Territory,Comparison,Dimension,Adjustment,Transformation,Civilization,Instruction,Variable,Extension,Competitor,Obligation,Evolution,Resolution,Initiative,Comparison,Celebration,Phenomenon,Publication,Infrastructure,Responsibility,Representation,Introduction,Investigation,Presentation,Arrangement,Conversation,Population,Requirement,Observation,Construction,Satisfaction,Contribution,Championship,Establishment,Significance,Intelligence,Consideration,Appointment,Improvement,Understanding,Independence,Communication,Manufacturer,Environment,Investigation,Expectation,Championship,Configuration,Participation,Concentration,Investigation,Entertainment,Representative,Transportation,Interpretation,Administration,Recommendation,Characteristic,Implementation,Transportation,Representation,Responsibility,Identification,Discrimination,Transformation,Administration,Recommendation,Infrastructure,Communication,Constituency,Classification,Rehabilitation,Representation,Identification,Administration,Transformation,Constituency,Recommendation,Classification,Infrastructure,Representation,Discrimination,Identification,Transformation,Administration,Rehabilitation,Constituency,Recommendation,Classification,Infrastructure,Representation,Identification,Discrimination,Transformation,Administration,Rehabilitation,Constituency,Recommendation,Classification,Infrastructure,Representation,Identification,Discrimination,Transformation,Administration,Rehabilitation,Constituency,Recommendation,Classification,Infrastructure,Representation,Identification,Discrimination,Transformation,Administration,Rehabilitation,Constituency,Recommendation,Classification,Infrastructure,Representation,Identification,Discrimination,Transformation,Administration,Rehabilitation,Constituency,Recommendation,Classification,Infrastructure,Representation,Identification,Discrimination,Transformation,Administration,Rehabilitation,Constituency,Recommendation,Classification,Infrastructure,Representation,Identification,Discrimination,Transformation,Administration,Rehabilitation,Constituency,Recommendation,Classification,Infrastructure,Representation,Identification,Discrimination,Transformation,Administration,Rehabilitation,Constituency";
const DECK_NOUNS_FULL = RAW_NOUNS.split(',').map(item => ({ text: item.trim(), type: 'text' }));

// 2. Difficult Deck
const RAW_DIFFICULT = "Internet,Karma,Deja Vu,Irony,Procrastination,Nostalgia,Cryptocurrency,Inflation,Cloud,Consciousness,Gravity,Black Hole,Wifi,Bluetooth,Algorithm,Sarcasm,Peer Pressure,Capitalism,Democracy,Bureaucracy,Etiquette,Coincidence,Miracle,Placebo,Illusion,Hallucination,Dream,Nightmare,Insomnia,Adrenaline,Metabolism,Photosynthesis,Evolution,Relativity,Quantum,Infinity,Time Travel,Multiverse,Dark Matter,Antimatter,Gene,DNA,Virus,Bacteria,Symbiosis,Ecosystem,Climate,Ozone,Sustainability,Energy,Fossil,Electricity,Magnetism,Friction,Momentum,Inertia,Velocity,Acceleration,Mass,Density,Volume,Geometry,Calculus,Statistics,Probability,Logic,Reason,Emotion,Instinct,Intuition,Subconscious,Personality,Reputation,Fame,Celebrity,Influencer,Media,Hashtag,Meme,Viral,Trend,Fad,Culture,Tradition,Ritual,Habit,Addiction,Obsession,Phobia,Anxiety,Stress,Trauma,Therapy,Meditation,Mindfulness,AI,VR,AR,Metaverse,Blockchain,NFT,Copyright,Trademark,Patent,Insurance,Mortgage,Stocks,Recession,Bankruptcy,Monopoly,Globalization,Censorship,Propaganda,Conspiracy,Paradox,Oxymoron,Metaphor,Simile,Allegory,Satire,Parody,Hyperbole,Euphemism,Nuance,Ambiguity,Context,Subtext,Semantics,Syntax,Dialect,Accent,Tone,Pitch,Rhythm,Tempo,Melody,Harmony,Genre,Abstract,Surrealism,Realism,Impressionism,Perspective,Composition,Aesthetics,Philosophy,Ethics,Morality,Existentialism,Nihilism,Stoicism,Hedonism,Utilitarianism,Altruism,Empathy,Compassion,Sympathy,Apathy,Narcissism,Ego,Superego,Id,Cognition,Perception,Memory,Amnesia,Focus,Attention,Distraction,Boredom,Curiosity,Creativity,Innovation,Invention,Discovery,Exploration,Adventure,Journey,Destiny,Fate,Luck,Chance,Serendipity,Misfortune,Tragedy,Comedy,Drama,Suspense,Mystery,Thriller,Horror,Fantasy,Sci-Fi,Romance,Satire,Dystopia,Utopia,Mythology,Folklore,Legend,Fable,Epiphany,Catharsis,Hubris,Nemesis,Archetype,Stereotype,Prejudice,Bias,Discrimination,Equality,Justice,Liberty,Freedom,Rights,Duty,Honor,Integrity,Loyalty,Betrayal,Revenge,Forgiveness,Redemption,Sacrifice,Courage,Cowardice,Heroism,Villainy,Ambition,Greed,Envy,Jealousy,Pride,Humility,Patience,Wisdom,Knowledge,Ignorance,Truth,Lie,Secret,Rumor,Gossip,Scandal,Hypocrisy,Corruption,Diplomacy,Negotiation,Compromise,Conflict,Peace,War,Strategy,Tactics,Logistics,Supply Chain,Infrastructure,Economy,Market,Demand,Supply,Capital,Labor,Wages,Taxes,Debt,Credit,Investment,Savings,Retirement,Pension,Welfare,Healthcare,Education,Curriculum,Syllabus,Degree,Diploma,Thesis,Dissertation,Research,Experiment,Hypothesis,Theory,Law,Principle,Axiom,Theorem,Proof,Variable,Constant,Function,Equation,Formula,Code,Software,Hardware,Database,Network,Server,Client,Interface,Platform,Browser,Search Engine,Website,App,Device,Gadget,Tool,Machine,Engine,Motor,Battery,Circuit,Sensor,Robot,Drone,Satellite,Telescope,Microscope,Atom,Molecule,Element,Compound,Mixture,Solution,Reaction,Catalyst,Enzyme,Cell,Tissue,Organ,System,Organism,Species,Population,Community,Habitat,Biome,Biosphere,Planet,Star,Galaxy,Universe,Dimension,Space,Time,Matter,Energy,Force,Field,Wave,Particle,Light,Sound,Heat,Cold,Pressure,Vacuum,Solid,Liquid,Gas,Plasma,Crystal,Metal,Plastic,Glass,Wood,Paper,Fabric,Textile,Ceramic,Concrete,Asphalt,Rubber,Oil,Gasoline,Diesel,Hydrogen,Solar,Wind,Hydro,Geothermal,Biomass,Agriculture,Farming,Harvest,Crop,Livestock,Fishery,Forestry,Mining,Drilling,Manufacturing,Production,Assembly,Logistics,Transport,Shipping,Aviation,Navigation,Exploration,Survey,Census,Demographics,Migration,Immigration,Emigration,Urbanization,Industrialization,Modernization,Digitization,Automation,Optimization,Efficiency,Productivity,Quality,Safety,Security,Privacy,Anonymity,Identity,Authentication,Encryption,Hacking,Phishing,Spam,Malware,Virus,Bug,Glitch,Error,Failure,Crash,Update,Upgrade,Patch,Version,Prototype,Beta,Alpha,Release,Launch,Debut,Premiere,Finale,Sequel,Prequel,Spin-off,Remake,Adaptation,Translation,Interpretation,Analysis,Critique,Review,Rating,Ranking,Award,Prize,Trophy,Medal,Certificate,License,Permit,Passport,Visa,Ticket,Token,Coupon,Voucher,Gift,Donation,Charity,Philanthropy,Volunteering,Activism,Protest,Strike,Riot,Revolution,Rebellion,Coup,Regime,Dynasty,Empire,Kingdom,Republic,Federation,Union,Alliance,Treaty,Pact,Contract,Agreement,Deal,Bargain,Auction,Sale,Purchase,Transaction,Payment,Currency,Exchange,Trade,Commerce,Industry,Business,Corporation,Start-up,Entrepreneur,Manager,Leader,Boss,Employee,Worker,Colleague,Partner,Client,Customer,Consumer,Audience,Viewer,Listener,Reader,User,Subscriber,Member,Citizen,Resident,Native,Foreigner,Tourist,Visitor,Guest,Host,Landlord,Tenant,Neighbor,Community,Society,Civilization,Humanity,Mankind,Person,Individual,Self,Soul,Spirit,Ghost,Angel,Demon,God,Deity,Religion,Faith,Belief,Doubt,Skepticism,Atheism,Agnosticism,Spirituality,Mysticism,Occult,Magic,Sorcery,Witchcraft,Alchemy,Astrology,Zodiac,Horoscope,Fortune,Prophecy,Omen,Sign,Symbol,Icon,Logo,Brand,Image,Style,Fashion,Design,Art,Music,Dance,Theater,Cinema,Literature,Poetry,Prose,Fiction,Non-fiction,Biography,History,Geography,Map,Chart,Graph,Table,List,Index,Glossary,Appendix,Chapter,Verse,Stanza,Paragraph,Sentence,Phrase,Word,Letter,Symbol,Number,Digit,Code,Cipher,Signal,Noise,Silence,Void,Nothingness,Everything,Universe,Cosmos,Nature,Life,Death,Birth,Growth,Decay,Entropy,Chaos,Order,Balance,Harmony,Conflict,Resolution,Beginning,End";
const DECK_DIFFICULT_FULL = RAW_DIFFICULT.split(',').map((item) => ({ text: item.trim(), type: 'text' }));

// 3. Blevnecked Deck
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

// 4. Countries Deck
const RAW_COUNTRIES = "Afghanistan:af,Albania:al,Algeria:dz,Andorra:ad,Angola:ao,Antigua and Barbuda:ag,Argentina:ar,Armenia:am,Australia:au,Austria:at,Azerbaijan:az,Bahamas:bs,Bahrain:bh,Bangladesh:bd,Barbados:bb,Belarus:by,Belgium:be,Belize:bz,Benin:bj,Bhutan:bt,Bolivia:bo,Bosnia and Herzegovina:ba,Botswana:bw,Brazil:br,Brunei:bn,Bulgaria:bg,Burkina Faso:bf,Burundi:bi,Cambodia:kh,Cameroon:cm,Canada:ca,Cape Verde:cv,Central African Republic:cf,Chad:td,Chile:cl,China:cn,Colombia:co,Comoros:km,Congo (Brazzaville):cg,Congo (Kinshasa):cd,Costa Rica:cr,Croatia:hr,Cuba:cu,Cyprus:cy,Czech Republic:cz,Denmark:dk,Djibouti:dj,Dominica:dm,Dominican Republic:do,Ecuador:ec,Egypt:eg,El Salvador:sv,Equatorial Guinea:gq,Eritrea:er,Estonia:ee,Ethiopia:et,Fiji:fj,Finland:fi,France:fr,Gabon:ga,Gambia:gm,Georgia:ge,Germany:de,Ghana:gh,Greece:gr,Grenada:gd,Guatemala:gt,Guinea:gn,Guinea-Bissau:gw,Guyana:gy,Haiti:ht,Honduras:hn,Hungary:hu,Iceland:is,India:in,Indonesia:id,Iran:ir,Iraq:iq,Ireland:ie,Israel:il,Italy:it,Jamaica:jm,Japan:jp,Jordan:jo,Kazakhstan:kz,Kenya:ke,Kiribati:ki,Kuwait:kw,Kyrgyzstan:kg,Laos:la,Latvia:lv,Lebanon:lb,Lesotho:ls,Liberia:lr,Libya:ly,Liechtenstein:li,Lithuania:lt,Luxembourg:lu,Madagascar:mg,Malawi:mw,Malaysia:my,Maldives:mv,Mali:ml,Malta:mt,Marshall Islands:mh,Mauritania:mr,Mauritius:mu,Mexico:mx,Micronesia:fm,Moldova:md,Monaco:mc,Mongolia:mn,Montenegro:me,Morocco:ma,Mozambique:mz,Myanmar:mm,Namibia:na,Nauru:nr,Nepal:np,Netherlands:nl,New Zealand:nz,Nicaragua:ni,Niger:ne,Nigeria:ng,North Korea:kp,North Macedonia:mk,Norway:no,Oman:om,Pakistan:pk,Palau:pw,Panama:pa,Papua New Guinea:pg,Paraguay:py,Peru:pe,Philippines:ph,Poland:pl,Portugal:pt,Qatar:qa,Romania:ro,Russia:ru,Rwanda:rw,Saint Kitts and Nevis:kn,Saint Lucia:lc,Saint Vincent and the Grenadines:vc,Samoa:ws,San Marino:sm,Sao Tome and Principe:st,Saudi Arabia:sa,Senegal:sn,Serbia:rs,Seychelles:sc,Sierra Leone:sl,Singapore:sg,Slovakia:sk,Slovenia:si,Solomon Islands:sb,Somalia:so,South Africa:za,South Korea:kr,South Sudan:ss,Spain:es,Sri Lanka:lk,Sudan:sd,Suriname:sr,Sweden:se,Switzerland:ch,Syria:sy,Taiwan:tw,Tajikistan:tj,Tanzania:tz,Thailand:th,Timor-Leste:tl,Togo:tg,Tonga:to,Trinidad and Tobago:tt,Tunisia:tn,Turkey:tr,Turkmenistan:tm,Tuvalu:tv,Uganda:ug,Ukraine:ua,United Arab Emirates:ae,United Kingdom:gb,United States:us,Uruguay:uy,Uzbekistan:uz,Vanuatu:vu,Vatican City:va,Venezuela:ve,Vietnam:vn,Yemen:ye,Zambia:zm,Zimbabwe:zw";

const DECK_COUNTRIES = RAW_COUNTRIES.split(',').map(entry => {
    const [name, code] = entry.split(':');
    return { text: name, code: code, type: 'country' };
});

// 5. West Wing Deck
const DECK_WEST_WING = [
    "Josiah Bartlet", "Leo McGarry", "Josh Lyman", "Toby Ziegler", "Sam Seaborn", "C.J. Cregg",
    "Donna Moss", "Charlie Young", "Abbey Bartlet", "Mrs. Landingham", "Vice President Hoynes",
    "Admiral Fitzwallace", "Danny Concannon", "Joey Lucas", "Ainsley Hayes", "Bruno Gianelli",
    "Nancy McNally", "Ron Butterfield", "Lord John Marbury", "Margaret Hooper", "Oliver Babbish",
    "Dolores Landingham", "Ginger", "Bonnie", "Carol Fitzpatrick"
];

const normalizeDeck = (data) => data.map(item => ({ text: item, type: 'text' }));

export const DECKS = [
    {
        id: 'nouns',
        title: 'Top 1000 Nouns',
        description: 'Simple, everyday words.',
        color: 'bg-cyan-500',
        gradient: 'from-cyan-500 to-blue-500',
        icon: <Scroll size={24} className="text-white" />,
        data: DECK_NOUNS_FULL
    },
    {
        id: 'countries',
        title: 'World Countries',
        description: 'Every recognized country + shape.',
        color: 'bg-emerald-500',
        gradient: 'from-emerald-500 to-teal-600',
        icon: <Globe size={24} className="text-white" />,
        data: DECK_COUNTRIES
    },
    {
        id: 'westwing',
        title: 'The West Wing',
        description: 'Major characters & staff.',
        color: 'bg-indigo-600',
        gradient: 'from-indigo-600 to-blue-700',
        icon: <span className="text-2xl">🏛️</span>,
        data: normalizeDeck(DECK_WEST_WING)
    },
    {
        id: 'blevnecked',
        title: 'Blevnecked',
        description: 'Family, Friends & Places.',
        color: 'bg-amber-500',
        gradient: 'from-amber-500 to-orange-600',
        icon: <span className="text-2xl">🦅</span>,
        data: normalizeDeck(DECK_BLEVNECKED)
    },
    {
        id: 'difficult',
        title: 'Difficult Deck',
        description: '500+ Abstract concepts & phenomena.',
        color: 'bg-rose-600',
        gradient: 'from-rose-600 to-red-700',
        icon: <AlertOctagon size={24} className="text-white" />,
        data: DECK_DIFFICULT_FULL
    },
];
