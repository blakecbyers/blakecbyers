import React, { useState, useEffect, useMemo } from 'react';
import { BookOpen, Code, Globe, PenTool, CheckCircle, ChevronRight, Star, Coffee, Server, Layout, ArrowRight, X, Trophy, Zap, Shield, Menu, List, Eye, PlayCircle, Award } from 'lucide-react';

// --- THEME & BRAND CONFIGURATION ---
const THEME = {
    colors: {
        spark: '#FAAA4D',
        magma: '#FF8C3D',
        lava: '#EF6653',
        glacier: '#72DEFF',
        ash: '#EFEFEF',
        obsidian: '#2B2B2B',
        white: '#FFFFFF',
        success: '#4ADE80',
        error: '#EF6653',
        textMain: '#2B2B2B',
        textLight: '#696969'
    },
    fonts: {
        primary: "system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    }
};

// --- DATA: CURRICULUM & RUBRICS ---
const CURRICULUM = {
    lava: {
        title: "Lava Templating",
        icon: <Code size={24} />,
        description: "Master the Fluid Engine, Entities, and Logic.",
        color: THEME.colors.lava,
        levels: [
            { level: 1, title: "Foundational Awareness", xpRequired: 0, criteria: ["Read basic Lava", "Small template changes", "Awareness of Lava Apps"] },
            { level: 2, title: "Operational Competence", xpRequired: 300, criteria: ["Filter knowledge", "Basic logic (if/for)", "Caching strategies"] },
            { level: 3, title: "Applied Practitioner", xpRequired: 800, criteria: ["Entity & SQL Commands", "Shortcodes", "Debugging", "HTMX Basics"] },
            { level: 4, title: "Solution Crafter", xpRequired: 1500, criteria: ["Performance optimization", "Advanced execution models", "Secure interaction patterns"] },
            { level: 5, title: "Domain Leader", xpRequired: 2500, criteria: ["Persisted Datasets", "Reusable Shortcode Libraries", "Reading C# for Merge Fields"] },
            { level: 6, title: "Force Multiplier", xpRequired: 4000, criteria: ["Coaches peers", "Authors documentation", "Public speaking/sharing"] },
            { level: 7, title: "Strategic Pioneer", xpRequired: 6000, criteria: ["Shapes strategy", "Innovates product", "Filters signal from noise"] },
        ],
        modules: [
            {
                id: "lava-101",
                title: "Topic 1: Architectural Foundations",
                description: "The Fluid Landscape & Data Model.",
                levelReq: 1,
                lessons: [
                    {
                        id: "l1-1",
                        type: "teach",
                        title: "Guide 1: The Liquid Landscape",
                        content: `
              <h3 class="font-bold text-lg mb-2 text-gray-800">The Barista of Rock RMS</h3>
              <p class="mb-4">In 'The Daily Grind', Lava is the barista. It extracts raw ingredients (SQL Data), filters them (Brewing), and presents the experience (HTML). The evolution to Rock v17 brought the <strong>Fluid Engine</strong>.</p>
              <div class="bg-red-50 p-4 border-l-4 border-red-500 my-4 text-sm">
                <strong>Critical: Fluid vs. DotLiquid</strong><br/>
                Fluid allows zero syntax ambiguity. It enforces strict discipline. Code that worked through leniency before will fail now. This is a "Fluid-First" curriculum.
              </div>
              <p>Lava is <strong>Server-Side Rendered</strong>. We verify inventory and loyalty points securely on the server before sending static HTML to the browser.</p>
            `
                    },
                    {
                        id: "l1-quiz",
                        type: "quiz",
                        question: "Why is the migration to the Fluid engine critical for a developer at 'The Daily Grind'?",
                        options: [
                            "It moves rendering to the client-side for faster animations.",
                            "It enforces strict syntax, meaning 'loose' legacy code will cause rendering failures.",
                            "It automatically converts SQL to JavaScript.",
                            "It removes the need for caching."
                        ],
                        correctIndex: 1,
                        explanation: "Fluid enforces syntactical discipline. Code that functioned through leniency in DotLiquid will result in critical rendering failures in Fluid."
                    },
                    {
                        id: "l1-2",
                        type: "teach",
                        title: "Guide 2: The Data Model",
                        content: `
              <p class="mb-2"><strong>Person (Type 15):</strong> Customers/Staff. <br/>Attributes: <em>CoffeePreference, LifetimeValue</em>.</p>
              <p class="mb-2"><strong>ContentChannelItem (Type 209):</strong> The Product Catalog.<br/>Attributes: <em>RoastLevel, Origin, Price, TastingNotes, InventoryCount</em>.</p>
              <p class="mb-2"><strong>FinancialTransaction (Type 53):</strong> Sales data (Amount, Date).</p>
              <p class="mb-2"><strong>DefinedValue (Type 31):</strong> System constants (Roast Levels: Light, Medium, Dark).</p>
            `
                    }
                ]
            },
            {
                id: "lava-102",
                title: "Topic 2: Syntax & Semantics",
                description: "Strictness, Quoting, and Variables.",
                levelReq: 1,
                lessons: [
                    {
                        id: "l2-1",
                        type: "teach",
                        title: "Strict Quoting",
                        content: `
              <p class="mb-2"><strong>Rule 1:</strong> Consistent Encapsulation.</p>
              <div class="bg-gray-800 text-gray-100 p-3 rounded font-mono text-xs mb-2">
                <span class="text-red-400">BAD:</span> {% assign slogan = 'It's coffee time' %}<br/>
                <span class="text-green-400">GOOD:</span> {% assign slogan = "It's coffee time" %}
              </div>
              <p class="text-sm">The parser interprets the apostrophe in "It's" as a closing quote if you aren't careful.</p>
            `
                    },
                    {
                        id: "l2-2",
                        type: "teach",
                        title: "Variable Assignment & Scope",
                        content: `
              <p class="mb-2"><strong>Rule 2:</strong> Variable Names. In Fluid, variables <em>cannot</em> start with a number.</p>
              <ul class="list-disc pl-5 text-sm mb-2">
                <li>Legacy: <code>1stBatch</code> (Allowed)</li>
                <li>Fluid: <code>firstBatch</code> (Required)</li>
              </ul>
              <p class="text-sm"><strong>Rule 3:</strong> Scope Leakage. Variables defined inside an <code>{% include %}</code> do NOT persist in the parent template in Fluid.</p>
            `
                    },
                    {
                        id: "l2-quiz",
                        type: "quiz",
                        question: "Which variable assignment will FAIL in the Fluid engine?",
                        options: [
                            "{% assign dailyGrind = 'Open' %}",
                            "{% assign 2ndRoast = 'Dark' %}",
                            "{% assign roast_date = 'Now' %}",
                            "{% assign 'key' = 'value' %}"
                        ],
                        correctIndex: 1,
                        explanation: "Variables cannot start with a number in Fluid. '2ndRoast' is invalid."
                    },
                    {
                        id: "l2-3",
                        type: "teach",
                        title: "Whitespace Control",
                        content: `
              <p class="mb-2">To prevent blank rows in CSV exports:</p>
              <div class="bg-gray-800 text-gray-100 p-3 rounded font-mono text-xs mb-2">
                {%- for bean in Batch -%}<br/>
                {{ bean.Name }},{{ bean.Weight }}<br/>
                {%- endfor -%}
              </div>
              <p class="text-sm">The hyphen <code>-</code> trims whitespace on the side of the tag it is placed.</p>
            `
                    }
                ]
            },
            {
                id: "lava-103",
                title: "Topic 3: The Filter Framework",
                description: "Transforming Data: Text, Dates, Math.",
                levelReq: 2,
                lessons: [
                    {
                        id: "l3-1",
                        type: "teach",
                        title: "Text & Sanitization",
                        content: `
              <p class="mb-2"><strong>Case:</strong> <code>{{ 'sale' | Upcase }}</code> -> SALE.</p>
              <p class="mb-2"><strong>Truncate:</strong> <code>{{ Description | Truncate:100 }}</code> adds '...'.</p>
              <p class="mb-2"><strong>Sanitize:</strong> <code>{{ SearchTerm | SanitizeSql }}</code> is vital for security.</p>
              <p class="mb-2"><strong>Split:</strong> In Fluid, splitting a null string returns an empty array, not an array with an empty string.</p>
            `
                    },
                    {
                        id: "l3-2",
                        type: "teach",
                        title: "Date Filters",
                        content: `
              <p class="mb-2"><strong>Humanize:</strong> <code>{{ RoastDate | HumanizeDateTime }}</code> -> "2 days ago".</p>
              <p class="mb-2"><strong>Math:</strong> <code>{{ RoastDate | DateAdd:14,'d' }}</code> calculates expiry.</p>
              <p class="mb-2"><strong>DateDiff:</strong> <code>{{ 'Now' | DateDiff:RoastDate,'d' }}</code>.</p>
            `
                    },
                    {
                        id: "l3-3",
                        type: "teach",
                        title: "Math & Collections",
                        content: `
              <p class="mb-2"><strong>Math:</strong> Fluid respects types. <code>10 | DividedBy:3</code> is 3 (Integer). <code>10 | DividedBy:3.0</code> is 3.33 (Float).</p>
              <p class="mb-2"><strong>Sorting:</strong> Use <code>OrderBy:'Property'</code> for objects in Rock v17+. It handles case-insensitivity better than Sort.</p>
            `
                    },
                    {
                        id: "l3-quiz",
                        type: "quiz",
                        question: "You need to sort a list of Beans by RoastDate (newest first). What is the preferred Rock v17 syntax?",
                        options: [
                            "{{ Beans | Sort:'RoastDate' }}",
                            "{% assign sorted = Beans | OrderBy:'RoastDate desc' %}",
                            "{{ Beans | SortDescending:'RoastDate' }}",
                            "{{ Beans | Order:'RoastDate' }}"
                        ],
                        correctIndex: 1,
                        explanation: "OrderBy is the preferred filter for sorting lists of entities, and it supports 'desc' for descending order."
                    }
                ]
            },
            {
                id: "lava-104",
                title: "Topic 4: Entity Commands",
                description: "Direct Database Access.",
                levelReq: 3,
                lessons: [
                    {
                        id: "l4-1",
                        type: "teach",
                        title: "Command Pattern",
                        content: `
              <p class="mb-2">Syntax: <code>{% entityname parameter:'value' %}</code></p>
              <ul class="list-disc pl-5 text-sm mb-2">
                <li><code>where</code>: Filter (e.g., <code>where:'Status == 2'</code>).</li>
                <li><code>limit</code>: Restrict count.</li>
                <li><code>iterator</code>: Rename variable (default is [entity]Items).</li>
              </ul>
              <p class="text-sm">Operators: <code>==, !=, >, <, ^=</code> (Starts With), <code>*=</code> (Contains).</p>
            `
                    },
                    {
                        id: "l4-2",
                        type: "teach",
                        title: "Specific Entities",
                        content: `
              <div class="bg-gray-800 text-gray-100 p-3 rounded font-mono text-xs mb-2">
                {% contentchannelitem where:'ContentChannelId == 5' iterator:'coffees' %}<br/>
                ...<br/>
                {% endcontentchannelitem %}
              </div>
              <p class="text-sm mb-2"><strong>FinancialTransaction:</strong> <code>{% financialtransaction where:'AuthorizedPersonAlias.PersonId == {{ pid }}' %}</code></p>
            `
                    },
                    {
                        id: "l4-quiz",
                        type: "quiz",
                        question: "How do you securely find the last 5 transactions for the current user?",
                        options: [
                            "{% sql select top 5 * from FinancialTransaction ... %}",
                            "{% financialtransaction where:'AuthorizedPersonAlias.PersonId == CurrentPerson.Id' limit:'5' sort:'TransactionDateTime desc' %}",
                            "{% financialtransaction limit:'5' %}",
                            "{% transactions count:'5' %}"
                        ],
                        correctIndex: 1,
                        explanation: "You must filter by the PersonId and use 'limit' and 'sort' to get the most recent 5."
                    }
                ]
            },
            {
                id: "lava-105",
                title: "Topic 5: Workflows",
                description: "Business Logic and Automation.",
                levelReq: 3,
                lessons: [
                    {
                        id: "l5-1",
                        type: "teach",
                        title: "Contextual Execution",
                        content: `
              <p class="mb-2"><strong>Attributes:</strong> <code>{{ Workflow | Attribute:'OrderTotal' }}</code>.</p>
              <p class="mb-2"><strong>Raw Value:</strong> <code>{{ Workflow | Attribute:'Customer','RawValue' }}</code> gets the GUID for SQL use.</p>
              <p class="mb-2"><strong>Setting Dates:</strong> Must be strict ISO format: <code>yyyy-MM-ddTHH:mm:ss</code>.</p>
            `
                    },
                    {
                        id: "l5-2",
                        type: "teach",
                        title: "Personalization",
                        content: `
              <p class="mb-2"><strong>InteractionWrite:</strong> Logs behavior (e.g., 'Viewed Sumatra Blend').</p>
              <p class="mb-2"><strong>Personalize:</strong> Segments content.</p>
              <div class="bg-gray-800 text-gray-100 p-2 rounded font-mono text-xs">
                {% personalize segment:'HighSpenders' %}...{% endpersonalize %}
              </div>
            `
                    }
                ]
            },
            {
                id: "lava-106",
                title: "Topic 6: Advanced Architecture",
                description: "Web Requests, Caching, Shortcodes.",
                levelReq: 4,
                lessons: [
                    {
                        id: "l6-1",
                        type: "teach",
                        title: "Performance",
                        content: `
              <p class="mb-2"><strong>WebRequest:</strong> Fetch external data (weather, shipping). <code>{% webrequest url:'...' ... %}</code></p>
              <p class="mb-2"><strong>Caching:</strong> <code>{% cache key:'menu' duration:'3600' %}</code>.</p>
              <p class="text-sm font-bold">Two-Pass Caching:</p>
              <p class="text-sm">Use <code>twopass:'true'</code> if you need personalization (like "Hello {{ Name }}") inside a cached block.</p>
            `
                    },
                    {
                        id: "l6-quiz",
                        type: "quiz",
                        question: "What is the primary purpose of 'twopass' caching?",
                        options: [
                            "It caches the data twice for redundancy.",
                            "It allows the cached content to be processed again by Lava, enabling personalization within cached blocks.",
                            "It caches the data on both the client and the server.",
                            "It refreshes the cache every 2 minutes."
                        ],
                        correctIndex: 1,
                        explanation: "Two-pass caching processes the cached output again, allowing you to have static heavy data (the menu) cached, but still render 'Hello Dave' dynamically."
                    }
                ]
            },
            {
                id: "lava-lab",
                title: "Practice Lab: Final Exam",
                description: "Apply your skills to solve business problems.",
                levelReq: 4,
                lessons: [
                    {
                        id: "lab-1",
                        type: "teach",
                        title: "Problem: Inventory Alert",
                        content: `
              <p class="mb-2"><strong>Objective:</strong> List coffees with low inventory (< 10) AND 'Dark Roast'.</p>
              <div class="bg-gray-800 text-gray-100 p-3 rounded font-mono text-xs">
                 {% for coffee in coffees %}<br/>
                  {% assign inv = coffee | Attribute:'Inventory' | AsInteger %}<br/>
                  {% assign roast = coffee | Attribute:'RoastLevel' %}<br/>
                  {% if inv < 10 and roast == 'Dark' %}<br/>
                    ALERT: {{ coffee.Title }}<br/>
                  {% endif %}<br/>
                 {% endfor %}
              </div>
            `
                    },
                    {
                        id: "lab-2",
                        type: "quiz",
                        question: "In the Inventory Alert solution, why is 'AsInteger' used on the Inventory attribute?",
                        options: [
                            "It's not necessary, Lava handles it automatically.",
                            "Attributes are stored as strings. To compare mathematically (< 10), it must be cast to an integer.",
                            "To remove decimal places.",
                            "To format it as currency."
                        ],
                        correctIndex: 1,
                        explanation: "Attributes are strings by default. Mathematical comparison might fail or behave unexpectedly if not cast to a number."
                    }
                ]
            }
        ]
    },
    html: {
        title: "HTML & CSS",
        icon: <Layout size={24} />,
        description: "Structure and style the web presence.",
        color: THEME.colors.spark,
        levels: [
            { level: 1, title: "Foundational Awareness", xpRequired: 0, criteria: ["Basic HTML/CSS", "Semantic HTML", "Theme Editor basics"] },
            { level: 2, title: "Operational Competence", xpRequired: 300, criteria: ["Bootstrap Grid", "Utility Classes", "Block vs Inline"] },
            { level: 3, title: "Applied Practitioner", xpRequired: 800, criteria: ["Flexbox basics", "Image Handler parameters", "Themes & Layouts"] },
            { level: 4, title: "Solution Crafter", xpRequired: 1500, criteria: ["Advanced Flexbox/Grid", "Building full Themes", "Content Components"] },
            { level: 5, title: "Domain Leader", xpRequired: 2500, criteria: ["Complex layouts", "Deep web dev expertise", "Lava Level 4+"] },
            { level: 6, title: "Force Multiplier", xpRequired: 4000, criteria: ["Coaches peers", "Authors patterns/docs", "Maintains internal tools"] },
            { level: 7, title: "Strategic Pioneer", xpRequired: 6000, criteria: ["Shapes approach", "Product innovation", "Ecosystem trends"] },
        ],
        modules: [
            {
                id: "html-101",
                title: "Semantic Structure",
                description: "HTML5 foundations for Rock.",
                levelReq: 1,
                lessons: [
                    {
                        id: "h1-1",
                        type: "teach",
                        title: "Semantic HTML",
                        content: `
              <p class="mb-2"><strong>Meaning over Appearance.</strong></p>
              <p>Use <code>&lt;header&gt;, &lt;nav&gt;, &lt;main&gt;, &lt;footer&gt;</code> rather than just <code>&lt;div&gt;</code>.</p>
              <p>This is crucial for Accessibility (screen readers) and SEO.</p>
            `
                    },
                    {
                        id: "h1-quiz",
                        type: "quiz",
                        question: "Which tag should wrap the main navigation of the coffee shop site?",
                        options: ["<div class='nav'>", "<nav>", "<section>", "<menu>"],
                        correctIndex: 1,
                        explanation: "<nav> is the semantic standard for navigation blocks."
                    }
                ]
            },
            {
                id: "html-102",
                title: "Rock's Grid System",
                description: "Bootstrap Layouts.",
                levelReq: 2,
                lessons: [
                    {
                        id: "h2-1",
                        type: "teach",
                        title: "The 12-Column Grid",
                        content: `
              <p>Rock uses Bootstrap. Layouts are rows divided into 12 columns.</p>
              <p><code>col-md-6</code>: Half width on desktop.</p>
              <p><code>col-xs-12</code>: Full width on mobile.</p>
              <p><strong>Utility Classes:</strong> Use <code>margin-top-md</code> or <code>p-3</code> (padding) instead of custom CSS.</p>
            `
                    },
                    {
                        id: "h2-quiz",
                        type: "quiz",
                        question: "To display 4 coffee bags in a single row on desktop, which class applies?",
                        options: ["col-md-4", "col-md-3", "col-md-2", "col-md-6"],
                        correctIndex: 1,
                        explanation: "12 columns / 4 items = 3 columns each. So, col-md-3."
                    }
                ]
            },
            {
                id: "html-103",
                title: "Modern Layouts",
                description: "Flexbox and CSS Grid.",
                levelReq: 3,
                lessons: [
                    {
                        id: "h3-1",
                        type: "teach",
                        title: "Flexbox",
                        content: `
              <p><strong>Flexbox</strong> is essential for alignment (centering items vertically).</p>
              <p>Container: <code>display: flex; align-items: center; justify-content: space-between;</code></p>
              <p>Rock has utility classes for this: <code>d-flex flex-row align-items-center</code>.</p>
            `
                    },
                    {
                        id: "h3-quiz",
                        type: "quiz",
                        question: "Which flex property distributes space evenly between coffee cups in a row?",
                        options: ["align-items: center", "justify-content: space-between", "flex-direction: column", "flex-wrap: wrap"],
                        correctIndex: 1,
                        explanation: "justify-content controls horizontal (main axis) spacing. 'space-between' pushes items to the edges."
                    }
                ]
            }
        ]
    },
    net: {
        title: "Internet & Networking",
        icon: <Globe size={24} />,
        description: "DNS, CDNs, and Connectivity.",
        color: THEME.colors.glacier,
        levels: [
            { level: 1, title: "Foundational Awareness", xpRequired: 0, criteria: ["Public vs Private IP", "DNS Basics (A, CNAME)", "HTTP vs HTTPS"] },
            { level: 2, title: "Operational Competence", xpRequired: 300, criteria: ["DNS Records", "TTL vs Propagation", "CDN Basics", "SSL"] },
            { level: 3, title: "Applied Practitioner", xpRequired: 800, criteria: ["Troubleshoot DNS (nslookup)", "CDN Headers", "HTTP Response Codes"] },
            { level: 4, title: "Solution Crafter", xpRequired: 1500, criteria: ["Reverse Proxy (X-Forwarded-For)", "SSL Handshake", "Azure App Gateway"] },
            { level: 5, title: "Domain Leader", xpRequired: 2500, criteria: ["DNS Strategy multi-site", "Geo-redundancy", "TCP/IP Layers"] },
            { level: 6, title: "Force Multiplier", xpRequired: 4000, criteria: ["Coaches peers", "Authors docs", "Advocates scalable solutions"] },
            { level: 7, title: "Strategic Pioneer", xpRequired: 6000, criteria: ["Shapes approach", "Service innovation", "Ecosystem trends"] },
        ],
        modules: [
            {
                id: "net-101",
                title: "The Plumbing of the Web",
                description: "IPs and DNS.",
                levelReq: 1,
                lessons: [
                    {
                        id: "n1-1",
                        type: "teach",
                        title: "DNS: The Phonebook",
                        content: `
              <p class="mb-2"><strong>A Record:</strong> Maps Name -> IP Address (dailygrind.com -> 104.23.1.1).</p>
              <p class="mb-2"><strong>CNAME:</strong> Maps Name -> Name (shop.dailygrind.com -> dailygrind.com).</p>
              <p><strong>TTL (Time To Live):</strong> How long a computer caches this record. Lower TTL = faster updates, more traffic.</p>
            `
                    },
                    {
                        id: "n1-quiz",
                        type: "quiz",
                        question: "You updated the IP for dailygrind.com but users still see the old site. Why?",
                        options: ["The server is down.", "Propagation Delay / TTL has not expired.", "SSL Certificate expired.", "The CNAME is wrong."],
                        correctIndex: 1,
                        explanation: "DNS records are cached globally based on TTL. It takes time for changes to propagate."
                    }
                ]
            },
            {
                id: "net-102",
                title: "Secure Delivery",
                description: "SSL and CDNs.",
                levelReq: 2,
                lessons: [
                    {
                        id: "n2-1",
                        type: "teach",
                        title: "CDN (Content Delivery Network)",
                        content: `
              <p>A CDN caches static assets (images, CSS) on servers closer to the user.</p>
              <p><strong>Benefit:</strong> Faster load times, less load on the Rock server.</p>
              <p><strong>Triumph CDN:</strong> Configured to cache specific paths.</p>
            `
                    },
                    {
                        id: "n2-quiz",
                        type: "quiz",
                        question: "Which of these is best suited for a CDN?",
                        options: ["The Checkout Page (Dynamic)", "The Logo.png file (Static)", "Real-time Inventory Count", "User Profile Data"],
                        correctIndex: 1,
                        explanation: "Static assets that don't change often (like images) are perfect for CDNs. Dynamic data (Checkout) must come from the server."
                    }
                ]
            }
        ]
    },
    design: {
        title: "Rock Design",
        icon: <PenTool size={24} />,
        description: "Visuals, Themes, and UX.",
        color: THEME.colors.magma,
        levels: [
            { level: 1, title: "Foundational Awareness", xpRequired: 0, criteria: ["Understand themes/blocks", "Apply branding (logo/colors)", "Basic Accessibility"] },
            { level: 2, title: "Operational Competence", xpRequired: 300, criteria: ["Consistent pages", "Mobile-friendly layouts", "Lava personalization"] },
            { level: 3, title: "Applied Practitioner", xpRequired: 800, criteria: ["Reusable elements", "UX Best Practices (WCAG)", "Performance impacts"] },
            { level: 4, title: "Solution Crafter", xpRequired: 1500, criteria: ["User Journeys", "Advanced Personalization", "Cross-functional collaboration"] },
            { level: 5, title: "Domain Leader", xpRequired: 2500, criteria: ["Digital Ministry Strategy", "Design Systems", "Journey Mapping"] },
            { level: 6, title: "Force Multiplier", xpRequired: 4000, criteria: ["Coaches peers", "Authors best practices", "Internal templates"] },
            { level: 7, title: "Strategic Pioneer", xpRequired: 6000, criteria: ["Shapes approach", "Product innovation", "Ecosystem trends"] },
        ],
        modules: [
            {
                id: "des-101",
                title: "Brand Fundamentals",
                description: "Colors and Typography.",
                levelReq: 1,
                lessons: [
                    {
                        id: "d1-1",
                        type: "teach",
                        title: "The Palette",
                        content: `
              <p class="mb-1"><strong style="color:#FAAA4D">Spark (#FAAA4D):</strong> Energy, Highlights.</p>
              <p class="mb-1"><strong style="color:#EF6653">Lava (#EF6653):</strong> Alerts, Call to Action.</p>
              <p class="mb-1"><strong style="color:#2B2B2B">Obsidian (#2B2B2B):</strong> Text, Structure.</p>
              <p class="mb-2"><strong style="color:#72DEFF">Glacier (#72DEFF):</strong> Accents.</p>
              <p><em>Typography:</em> Proxima Nova. Clean, legible, modern.</p>
            `
                    },
                    {
                        id: "d1-quiz",
                        type: "quiz",
                        question: "Which color should be used for a critical 'Delete' button or error message?",
                        options: ["Spark", "Glacier", "Lava", "Ash"],
                        correctIndex: 2,
                        explanation: "Lava (Red/Orange) signals caution or attention."
                    }
                ]
            },
            {
                id: "des-102",
                title: "User Experience (UX)",
                description: "Accessibility and Hierarchy.",
                levelReq: 2,
                lessons: [
                    {
                        id: "d2-1",
                        type: "teach",
                        title: "Hierarchy & Accessibility",
                        content: `
              <p class="mb-2"><strong>Visual Hierarchy:</strong> Use font size (H1 vs p) and color to guide the eye.</p>
              <p><strong>Accessibility (WCAG):</strong> Ensure contrast ratios are high. Don't rely on color alone (use icons/labels).</p>
            `
                    }
                ]
            }
        ]
    }
};

// --- COMPONENTS ---

const RockAcademy = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [selectedTrack, setSelectedTrack] = useState(null);
    const [activeModule, setActiveModule] = useState(null);
    const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
    const [userXP, setUserXP] = useState({ lava: 50, html: 20, net: 0, design: 10 });
    const [showFeedback, setShowFeedback] = useState(null);
    const [feedbackMsg, setFeedbackMsg] = useState('');
    const [viewRubric, setViewRubric] = useState(false);

    // --- LOGIC ---
    const getLevel = (trackKey, xp) => {
        const track = CURRICULUM[trackKey];
        let currentLvl = track.levels[0];
        for (let lvl of track.levels) {
            if (xp >= lvl.xpRequired) currentLvl = lvl;
        }
        return currentLvl;
    };

    const handleStartModule = (mod) => {
        setActiveModule(mod);
        setCurrentLessonIndex(0);
        setActiveTab('learning');
        setShowFeedback(null);
    };

    const handleAnswer = (isCorrect, explanation) => {
        if (isCorrect) {
            setShowFeedback('success');
            setFeedbackMsg(`Correct! +100 XP. ${explanation}`);
            setUserXP(prev => ({
                ...prev,
                [selectedTrack]: prev[selectedTrack] + 100
            }));
        } else {
            setShowFeedback('error');
            setFeedbackMsg(`Not quite. ${explanation}`);
        }
    };

    const nextLesson = () => {
        if (currentLessonIndex < activeModule.lessons.length - 1) {
            setCurrentLessonIndex(prev => prev + 1);
            setShowFeedback(null);
        } else {
            setActiveTab('dashboard');
            setActiveModule(null);
            setSelectedTrack(null);
        }
    };

    // --- SUB-COMPONENTS ---
    const ProgressCard = ({ trackKey, data }) => {
        const xp = userXP[trackKey];
        const level = getLevel(trackKey, xp);
        const nextLevel = data.levels.find(l => l.level === level.level + 1);
        const progressPercent = nextLevel
            ? ((xp - level.xpRequired) / (nextLevel.xpRequired - level.xpRequired)) * 100
            : 100;

        // RUBRIC VIEW
        if (viewRubric) {
            return (
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden h-[450px] flex flex-col relative group hover:shadow-xl transition-shadow duration-300">
                    <div className="p-4 text-white font-bold flex items-center justify-between" style={{ backgroundColor: data.color }}>
                        <div className="flex items-center">{data.icon} <span className="ml-2">{data.title}</span></div>
                        <Award size={18} className="opacity-50" />
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-gray-50">
                        {data.levels.map((lvl) => (
                            <div key={lvl.level} className={`mb-4 pb-4 border-b border-gray-200 last:border-0 ${level.level === lvl.level ? 'bg-white p-3 rounded shadow-sm border-l-4' : ''}`} style={level.level === lvl.level ? { borderLeftColor: data.color } : {}}>
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-xs font-bold uppercase text-gray-400">Level {lvl.level}</span>
                                    {level.level >= lvl.level && <CheckCircle size={14} className="text-green-500" />}
                                </div>
                                <div className={`font-bold text-sm mb-2 ${level.level === lvl.level ? 'text-gray-900' : 'text-gray-600'}`}>{lvl.title}</div>
                                <ul className="list-disc pl-4 space-y-1">
                                    {lvl.criteria.map((c, i) => (
                                        <li key={i} className="text-xs text-gray-500">{c}</li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            )
        }

        // STANDARD CARD VIEW
        return (
            <div
                onClick={() => { setSelectedTrack(trackKey); setActiveTab('modules'); }}
                className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer overflow-hidden border border-gray-100 flex flex-col h-[450px]"
            >
                <div className="p-6 flex-1 relative overflow-hidden">
                    {/* Decorative Background Blob */}
                    <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full opacity-10" style={{ backgroundColor: data.color }}></div>

                    <div className="flex justify-between items-start mb-6 relative z-10">
                        <div className="p-3 rounded-lg text-white shadow-md" style={{ backgroundColor: data.color }}>{data.icon}</div>
                        <div className="text-right">
                            <span className="text-xs font-extrabold text-gray-300 uppercase tracking-widest">Level {level.level}</span>
                            <div className="font-bold text-gray-800 leading-tight">{level.title}</div>
                        </div>
                    </div>

                    <h3 className="text-2xl font-extrabold text-gray-800 mb-2">{data.title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed mb-6">{data.description}</p>
                </div>

                {/* Progress Footer */}
                <div className="bg-gray-50 p-6 border-t border-gray-100">
                    <div className="flex justify-between text-xs font-bold text-gray-400 mb-2">
                        <span>PROGRESS</span>
                        <span>{Math.round(progressPercent)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-3 overflow-hidden">
                        <div
                            className="h-2 rounded-full transition-all duration-1000 ease-out"
                            style={{ width: `${progressPercent}%`, backgroundColor: data.color }}
                        ></div>
                    </div>
                    <div className="flex justify-between items-center text-xs text-gray-400 font-mono">
                        <span className="flex items-center"><Zap size={12} className="mr-1 text-yellow-500" /> {xp} XP</span>
                        <span>NEXT: {nextLevel ? nextLevel.xpRequired : 'MAX'} XP</span>
                    </div>
                </div>
            </div>
        );
    };

    // --- VIEW: DASHBOARD ---
    const DashboardView = () => (
        <div className="min-h-screen bg-gray-50 p-6 md:p-12 font-sans">
            <div className="max-w-7xl mx-auto">
                <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between border-b border-gray-200 pb-8">
                    <div>
                        <h1 className="text-4xl font-black text-gray-800 tracking-tight mb-2">
                            Rock Solid <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500">Academy.</span>
                        </h1>
                        <p className="text-gray-500 font-medium">Your interactive path to mastery by May 1st.</p>
                    </div>
                    <button
                        onClick={() => setViewRubric(!viewRubric)}
                        className={`mt-4 md:mt-0 px-5 py-2.5 rounded-full font-bold text-sm transition-all shadow-md flex items-center ${viewRubric ? 'bg-gray-800 text-white hover:bg-black' : 'bg-white text-gray-700 hover:text-orange-500 border border-gray-200'}`}
                    >
                        {viewRubric ? <Layout size={16} className="mr-2" /> : <List size={16} className="mr-2" />}
                        {viewRubric ? 'View Progress Cards' : 'View Full Rubric'}
                    </button>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {Object.keys(CURRICULUM).map(key => (
                        <ProgressCard key={key} trackKey={key} data={CURRICULUM[key]} />
                    ))}
                </div>
            </div>
        </div>
    );

    // --- VIEW: MODULE LIST ---
    const ModuleListView = () => {
        const track = CURRICULUM[selectedTrack];
        return (
            <div className="min-h-screen bg-white p-6 md:p-12">
                <div className="max-w-4xl mx-auto">
                    <button
                        onClick={() => { setActiveTab('dashboard'); setSelectedTrack(null); }}
                        className="group text-gray-400 hover:text-gray-900 mb-8 flex items-center text-sm font-bold transition-colors"
                    >
                        <div className="bg-gray-100 p-2 rounded-full mr-3 group-hover:bg-gray-200"><ArrowRight className="transform rotate-180" size={16} /></div>
                        BACK TO DASHBOARD
                    </button>

                    <div className="flex items-center mb-12">
                        <div className="p-6 rounded-2xl mr-6 text-white shadow-xl transform rotate-3" style={{ backgroundColor: track.color }}>
                            {track.icon}
                        </div>
                        <div>
                            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Curriculum Path</div>
                            <h1 className="text-4xl font-black text-gray-800 mb-2">{track.title}</h1>
                            <p className="text-gray-500">{track.description}</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {track.modules.map((mod, idx) => (
                            <div key={mod.id} className="group bg-white rounded-xl border border-gray-200 p-6 hover:border-gray-300 hover:shadow-lg transition-all flex flex-col sm:flex-row sm:items-center justify-between">
                                <div className="mb-4 sm:mb-0">
                                    <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 flex items-center">
                                        <span className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: track.color }}></span>
                                        Module {idx + 1}
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-800 mb-1 group-hover:text-orange-600 transition-colors">{mod.title}</h3>
                                    <p className="text-sm text-gray-500">{mod.description}</p>
                                </div>
                                <button
                                    onClick={() => handleStartModule(mod)}
                                    className="px-6 py-3 rounded-lg text-white font-bold text-sm shadow-md transform transition hover:scale-105 flex items-center justify-center sm:justify-start"
                                    style={{ backgroundColor: track.color }}
                                >
                                    <PlayCircle size={18} className="mr-2" /> START
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    // --- VIEW: LEARNING ---
    const LearningView = () => {
        const lesson = activeModule.lessons[currentLessonIndex];
        const isQuiz = lesson.type === 'quiz';
        const trackColor = CURRICULUM[selectedTrack].color;
        const progress = ((currentLessonIndex + 1) / activeModule.lessons.length) * 100;

        return (
            <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
                {/* Top Bar */}
                <div className="bg-white px-6 py-4 border-b border-gray-200 flex justify-between items-center z-20">
                    <div className="flex items-center">
                        <button onClick={() => setActiveTab('modules')} className="mr-4 text-gray-400 hover:text-red-500 transition-colors">
                            <X size={24} />
                        </button>
                        <div className="hidden sm:block">
                            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">{activeModule.title}</div>
                            <div className="font-bold text-gray-800">Lesson {currentLessonIndex + 1} of {activeModule.lessons.length}</div>
                        </div>
                    </div>
                    <div className="flex-1 max-w-xs mx-4 bg-gray-100 rounded-full h-2">
                        <div
                            className="h-2 rounded-full transition-all duration-500 ease-out shadow-[0_0_10px_rgba(0,0,0,0.1)]"
                            style={{ width: `${progress}%`, backgroundColor: trackColor }}
                        ></div>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 flex flex-col justify-center items-center p-4 md:p-8 relative overflow-hidden">
                    {/* Background Decor */}
                    <div className="absolute top-20 left-10 w-72 h-72 rounded-full opacity-5 filter blur-3xl animate-pulse" style={{ backgroundColor: trackColor }}></div>
                    <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full opacity-5 filter blur-3xl animate-pulse" style={{ backgroundColor: THEME.colors.spark }}></div>

                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden relative z-10 border border-gray-100">

                        {/* Header */}
                        <div className="p-8 md:p-10 border-b border-gray-100">
                            <span
                                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold mb-4 uppercase tracking-wider ${isQuiz ? 'bg-indigo-50 text-indigo-600' : 'bg-orange-50 text-orange-600'}`}
                            >
                                {isQuiz ? <Star size={12} className="mr-1" /> : <BookOpen size={12} className="mr-1" />}
                                {isQuiz ? 'Knowledge Check' : 'Concept'}
                            </span>
                            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 leading-tight">{isQuiz ? lesson.question : lesson.title}</h2>
                        </div>

                        {/* Body */}
                        <div className="p-8 md:p-10">
                            {isQuiz ? (
                                <div className="space-y-4">
                                    {lesson.options.map((opt, idx) => (
                                        <button
                                            key={idx}
                                            disabled={showFeedback !== null}
                                            onClick={() => handleAnswer(idx === lesson.correctIndex, lesson.explanation)}
                                            className={`w-full text-left p-5 rounded-xl border-2 transition-all flex items-center group ${showFeedback
                                                    ? idx === lesson.correctIndex
                                                        ? 'border-green-500 bg-green-50 text-green-800'
                                                        : 'border-gray-100 text-gray-400 opacity-50'
                                                    : 'border-gray-100 hover:border-gray-300 hover:bg-gray-50 text-gray-700'
                                                }`}
                                        >
                                            <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm mr-4 transition-colors ${showFeedback && idx === lesson.correctIndex ? 'bg-green-200 text-green-700' : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'}`}>
                                                {String.fromCharCode(65 + idx)}
                                            </span>
                                            <span className="font-medium text-lg">{opt}</span>
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="prose prose-lg prose-orange text-gray-600 max-w-none">
                                    <div dangerouslySetInnerHTML={{ __html: lesson.content }} />
                                </div>
                            )}
                        </div>

                        {/* Footer / Feedback */}
                        <div className="bg-gray-50 p-6 md:p-8 flex justify-between items-center border-t border-gray-100 min-h-[100px]">
                            {showFeedback ? (
                                <div className={`w-full rounded-lg p-4 flex items-start ${showFeedback === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-50 text-red-800'}`}>
                                    {showFeedback === 'success' ? <CheckCircle className="mr-3 mt-1 flex-shrink-0" /> : <Zap className="mr-3 mt-1 flex-shrink-0" />}
                                    <div className="flex-1 mr-4">
                                        <div className="font-bold mb-1">{showFeedback === 'success' ? 'Correct!' : 'Incorrect'}</div>
                                        <div className="text-sm opacity-90">{feedbackMsg}</div>
                                    </div>
                                    <button
                                        onClick={nextLesson}
                                        className="px-6 py-2 rounded-lg bg-gray-900 text-white font-bold text-sm hover:bg-black transition-colors flex-shrink-0 shadow-lg"
                                    >
                                        CONTINUE
                                    </button>
                                </div>
                            ) : (
                                !isQuiz && (
                                    <div className="w-full flex justify-end">
                                        <button
                                            onClick={nextLesson}
                                            className="px-8 py-3 rounded-full text-white font-bold text-sm shadow-lg transform transition hover:-translate-y-1 hover:shadow-xl flex items-center"
                                            style={{ backgroundColor: trackColor }}
                                        >
                                            GOT IT <ArrowRight size={18} className="ml-2" />
                                        </button>
                                    </div>
                                )
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="font-sans text-gray-800 selection:bg-orange-200 selection:text-orange-900">
            {activeTab === 'dashboard' && <DashboardView />}
            {activeTab === 'modules' && <ModuleListView />}
            {activeTab === 'learning' && <LearningView />}
        </div>
    );
};

export default RockAcademy;