
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score-display');
const powerEl = document.getElementById('power-display');
const msgEl = document.getElementById('msg-display');
const speechEl = document.getElementById('mailman-speech');
const instructEl = document.getElementById('instruction-text');

// --- Game Configuration ---
const CONFIG = {
    gravity: 0.6,
    groundFriction: 0.85,
    bounce: 0.5,
    baseKickPower: 18,
    powerGrowthRate: 1.07, // 7% exponential growth per level
    mailmanX: 100
};

// --- Game State ---
let state = {
    mode: 'IDLE',
    score: 0,
    level: 1,
    width: window.innerWidth,
    height: window.innerHeight,
    groundY: 0,
    cameraX: 0,
    skyColor: '#87CEEB',
    objects: [] // For scenery
};

// --- Asset Generation (Houses/Trees) ---
function generateScenery() {
    state.objects = [];
    // Generate scenery for the first 50,000 pixels
    for (let i = 0; i < 100; i++) {
        state.objects.push({
            x: 400 + (i * 600) + Math.random() * 200,
            type: Math.random() > 0.5 ? 'HOUSE' : 'TREE',
            color: ['#FCA5A5', '#93C5FD', '#FDE047', '#D8B4FE'][Math.floor(Math.random() * 4)],
            height: 100 + Math.random() * 50
        });
    }
}

const QUOTES = [
    "I had a long day...",
    "I deserve this.",
    "Just a little treat.",
    "Diet starts Monday.",
    "Self care time.",
    "I earned this.",
    "Cheat day!",
    "Don't judge me.",
    "One more won't hurt.",
    "It's for my health.",
    "I'm just so tired.",
    "Therapeutic kicking."
];

// --- Drawing Helpers ---
function drawMailman(ctx, x, y, legAngle) {
    ctx.save();
    ctx.translate(x, y);

    // Colors
    const uniformBlue = '#2563EB';
    const skin = '#FCA5A5';
    const bag = '#92400E';

    // Back Leg (Plant)
    ctx.fillStyle = '#1E40AF';
    ctx.fillRect(10, 60, 15, 40); // Leg
    ctx.fillStyle = '#111';
    ctx.fillRect(5, 95, 25, 10); // Shoe

    // Front Leg (Kicking)
    ctx.save();
    ctx.translate(25, 60); // Hip pivot
    ctx.rotate(legAngle);
    ctx.fillStyle = '#1E40AF';
    ctx.fillRect(-8, 0, 18, 45); // Thigh/Shin
    ctx.fillStyle = '#111';
    ctx.fillRect(-8, 45, 28, 12); // Shoe
    ctx.restore();

    // Body
    ctx.fillStyle = uniformBlue;
    ctx.fillRect(0, 20, 50, 50);

    // Mail Bag
    ctx.fillStyle = bag;
    ctx.beginPath();
    ctx.moveTo(50, 20);
    ctx.lineTo(0, 60);
    ctx.lineTo(10, 75);
    ctx.lineTo(60, 35);
    ctx.fill();
    ctx.fillRect(35, 50, 30, 30); // Bag pouch

    // Arms
    ctx.fillStyle = uniformBlue;
    ctx.save();
    ctx.translate(25, 30);
    ctx.rotate(legAngle * -0.5); // Arm swings opposite to leg
    ctx.fillRect(-5, 0, 12, 35);
    ctx.fillStyle = skin;
    ctx.beginPath();
    ctx.arc(1, 35, 8, 0, Math.PI * 2); // Hand
    ctx.fill();
    ctx.restore();

    // Head
    ctx.fillStyle = skin;
    ctx.fillRect(10, -10, 35, 35);

    // Face
    ctx.fillStyle = '#000';
    ctx.fillRect(35, 0, 4, 4); // Eye
    ctx.fillRect(35, 15, 8, 2); // Mouth (flat/tired)

    // Cap
    ctx.fillStyle = '#1E3A8A';
    ctx.fillRect(5, -15, 45, 12);
    ctx.fillRect(5, -15, 55, 5); // Brim

    ctx.restore();
}

// --- Entity: Mailman Controller ---
const mailman = {
    x: CONFIG.mailmanX,
    legAngle: 0,
    speechTimer: 0, // New timer for random speech
    draw(ctx) {
        const drawX = this.x - state.cameraX;
        const drawY = state.groundY - 110;

        // Update speech bubble position
        if (state.mode !== 'FLYING' && state.mode !== 'RESETTING') {
            speechEl.style.left = (drawX - 60) + 'px';
            speechEl.style.top = (drawY - 70) + 'px';

            // Randomly speak if idle (approx every 3-4 seconds)
            if (state.mode === 'IDLE' && speechEl.style.opacity == 0) {
                this.speechTimer++;
                if (this.speechTimer > 200 && Math.random() < 0.02) {
                    this.speak();
                    this.speechTimer = 0;
                }
            }
        } else if (state.cameraX > 300) {
            speechEl.style.opacity = 0;
        }

        drawMailman(ctx, drawX, drawY, this.legAngle);
    },
    speak() {
        const randomQuote = QUOTES[Math.floor(Math.random() * QUOTES.length)];
        speechEl.innerText = randomQuote;
        speechEl.style.opacity = 1;
        speechEl.style.transform = 'scale(1.1)';
        setTimeout(() => speechEl.style.transform = 'scale(1)', 100);

        // Auto hide after a few seconds if still idle
        setTimeout(() => {
            if (state.mode === 'IDLE' && speechEl.innerText === randomQuote) {
                speechEl.style.opacity = 0;
            }
        }, 3500);
    },
    kick() {
        instructEl.style.display = 'none';

        // INSTANTLY HIDE MESSAGE ON ACTION
        speechEl.style.opacity = 0;
        this.speechTimer = 0;

        let startTime = Date.now();
        let duration = 300;
        state.mode = 'KICKING';

        const animateKick = () => {
            let elapsed = Date.now() - startTime;
            let progress = Math.min(elapsed / duration, 1);

            // Realistic Kick Physics:
            // Positive Angle = Backwards (Wind up)
            // Negative Angle = Forwards (Strike)

            if (progress < 0.4) {
                // Phase 1: Wind up BACKWARDS
                // 0 to 90 degrees back
                this.legAngle = Math.PI / 2 * (progress / 0.4);
            } else {
                // Phase 2: Snap FORWARDS
                // 90 degrees back to -100 degrees forward
                let kickProgress = (progress - 0.4) / 0.6;
                // Ease out for snap effect
                kickProgress = kickProgress * (2 - kickProgress);

                let startAngle = Math.PI / 2;
                let endAngle = -Math.PI / 1.8;
                this.legAngle = startAngle + (endAngle - startAngle) * kickProgress;
            }

            if (progress < 1) {
                requestAnimationFrame(animateKick);
            } else {
                dog.launch();
                setTimeout(() => {
                    // Return leg to neutral slowly
                    const resetLeg = () => {
                        this.legAngle *= 0.9;
                        if (Math.abs(this.legAngle) > 0.01) requestAnimationFrame(resetLeg);
                        else this.legAngle = 0;
                    };
                    resetLeg();
                }, 300);
            }
        };
        animateKick();
    }
};

// --- Entity: Dog Controller ---
const dog = {
    x: CONFIG.mailmanX + 80,
    y: 0,
    vx: 0,
    vy: 0,
    rotation: 0,
    rotSpeed: 0,
    width: 50,
    height: 35,
    type: 0, // Visual variation

    draw(ctx) {
        const drawX = this.x - state.cameraX;
        const drawY = this.y - 15; // Offset to center anchor

        ctx.save();
        ctx.translate(drawX, drawY);
        ctx.rotate(this.rotation);

        // Colors
        const fur = this.type === 1 ? '#F59E0B' : '#8B4513'; // Gold or Brown
        const darkFur = this.type === 1 ? '#B45309' : '#5D4037';

        // Tail (Wagging logic)
        ctx.strokeStyle = fur;
        ctx.lineWidth = 6;
        ctx.lineCap = 'round';
        ctx.beginPath();
        const wag = state.mode === 'IDLE' ? Math.sin(Date.now() / 80) * 8 : -5;
        ctx.moveTo(-20, 0);
        ctx.quadraticCurveTo(-30, wag / 2, -40, wag);
        ctx.stroke();

        // Body Shape
        ctx.fillStyle = fur;
        ctx.beginPath();
        ctx.ellipse(0, 5, 22, 14, 0, 0, Math.PI * 2);
        ctx.fill();

        // Legs (Dynamic based on state)
        ctx.fillStyle = darkFur;
        const legOffset = state.mode === 'IDLE' ? 0 : Math.sin(Date.now() / 50) * 5;

        // Back Leg
        ctx.beginPath();
        ctx.ellipse(-12, 18 + legOffset, 6, 8, 0.5, 0, Math.PI * 2);
        ctx.fill();
        // Front Leg
        ctx.beginPath();
        ctx.ellipse(12, 18 - legOffset, 6, 8, -0.5, 0, Math.PI * 2);
        ctx.fill();

        // Head Group
        ctx.translate(18, -8);
        ctx.rotate(state.mode === 'FLYING' ? -0.2 : 0);

        // Ear
        ctx.fillStyle = darkFur;
        ctx.beginPath();
        ctx.ellipse(-2, -5, 6, 12, -0.5, 0, Math.PI * 2);
        ctx.fill();

        // Head Circle
        ctx.fillStyle = fur;
        ctx.beginPath();
        ctx.arc(5, 0, 14, 0, Math.PI * 2);
        ctx.fill();

        // Snout
        ctx.fillStyle = '#FFF';
        ctx.beginPath();
        ctx.ellipse(12, 2, 6, 5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Nose
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(16, 0, 3, 0, Math.PI * 2);
        ctx.fill();

        // Eye
        ctx.fillStyle = '#FFF';
        ctx.beginPath();
        ctx.arc(4, -4, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#000';
        ctx.beginPath();
        // Goofy eye physics
        let ex = state.mode === 'FLYING' ? (Math.random() * 2) : 4;
        let ey = state.mode === 'FLYING' ? (Math.random() * 2 - 4) : -4;
        ctx.arc(ex, ey, 2, 0, Math.PI * 2);
        ctx.fill();

        // Tongue
        if (state.mode === 'FLYING') {
            ctx.fillStyle = '#FB7185';
            ctx.beginPath();
            ctx.ellipse(14, 6, 4, 8, 0.5, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
        ctx.restore();
    },
    launch() {
        state.mode = 'FLYING';
        this.type = Math.floor(Math.random() * 2);

        // EXPONENTIAL POWER CALCULATION
        // Power = Base * (GrowthRate ^ (Level - 1))
        // Level 1: 18
        // Level 10: 33
        // Level 20: 65
        const powerMultiplier = Math.pow(CONFIG.powerGrowthRate, state.level - 1);
        const totalPower = CONFIG.baseKickPower * powerMultiplier;

        // Launch Angle: Always forward and up, slight variation
        const angle = -Math.PI / 4 + (Math.random() * 0.2 - 0.1);

        this.vx = Math.cos(angle) * totalPower;
        this.vy = Math.sin(angle) * totalPower;

        // Add spin
        this.rotSpeed = (Math.random() * 0.4) - 0.2;

        // Floating Text
        const phrases = ["YEET!", "BYE!", "ZOOM!", "AIR MAIL!", "WOOSH!", "SEE YA!"];
        msgEl.innerText = phrases[Math.floor(Math.random() * phrases.length)];
        msgEl.style.opacity = 1;
        msgEl.style.transform = `rotate(${Math.random() * 20 - 10}deg) scale(1.5)`;
        setTimeout(() => {
            msgEl.style.opacity = 0;
            msgEl.style.transform = 'scale(1)';
        }, 800);
    },
    update() {
        if (state.mode !== 'FLYING' && state.mode !== 'RESETTING') {
            this.y = state.groundY;
            this.rotation = 0;
            // Idle bob
            this.y += Math.sin(Date.now() / 200) * 2;
            return;
        }

        // Physics Integration
        this.x += this.vx;
        this.y += this.vy;
        this.vy += CONFIG.gravity; // Gravity
        this.vx *= 0.999; // Very slight air drag
        this.rotation += this.rotSpeed;

        // Camera Follow Logic
        // We want the dog to be roughly in the center-left, but stop following if dog goes left
        const targetCamX = this.x - state.width * 0.3;
        if (targetCamX > state.cameraX) {
            state.cameraX = targetCamX;
        }

        // Ground Collision
        if (this.y >= state.groundY) {
            this.y = state.groundY;
            this.vy *= -CONFIG.bounce; // Bounce
            this.vx *= CONFIG.groundFriction; // Friction
            this.rotSpeed *= 0.8;

            // Stop condition
            if (Math.abs(this.vx) < 0.5 && Math.abs(this.vy) < 2) {
                if (state.mode === 'FLYING') {
                    finishRun();
                }
                this.vx = 0;
                this.vy = 0;
                this.rotSpeed = 0;
            }
        }
    }
};

function finishRun() {
    state.mode = 'RESETTING';
    state.level++;

    // Update UI
    scoreEl.innerText = Math.floor(state.cameraX / 100); // Score is distance
    powerEl.innerText = state.level;

    setTimeout(resetGame, 1200);
}

function resetGame() {
    // Reset positions
    state.cameraX = 0;
    dog.x = CONFIG.mailmanX + 80;
    dog.y = state.groundY;
    dog.vx = 0;
    dog.vy = 0;
    dog.rotation = 0;
    state.mode = 'IDLE';
    speechEl.style.opacity = 0;
}

function resize() {
    state.width = window.innerWidth;
    state.height = window.innerHeight;
    canvas.width = state.width;
    canvas.height = state.height;
    state.groundY = state.height - 100; // Ground is 100px from bottom
}

function drawEnvironment(ctx) {
    // 1. Sky
    const gradient = ctx.createLinearGradient(0, 0, 0, state.height);
    gradient.addColorStop(0, '#60A5FA'); // Blue
    gradient.addColorStop(1, '#DBEAFE'); // Light Blue
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, state.width, state.height);

    // 2. Sun
    ctx.fillStyle = '#FCD34D';
    ctx.beginPath();
    ctx.arc(state.width - 100, 100, 50, 0, Math.PI * 2);
    ctx.fill();

    // 3. Parallax Background (Clouds)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    const cloudParallax = state.cameraX * 0.1;
    for (let i = 0; i < 5; i++) {
        let cx = ((i * 300) - cloudParallax) % (state.width + 400);
        if (cx < -200) cx += state.width + 400;
        ctx.beginPath();
        ctx.arc(cx, 100 + (i * 20), 40, 0, Math.PI * 2);
        ctx.arc(cx + 40, 120 + (i * 20), 50, 0, Math.PI * 2);
        ctx.arc(cx + 80, 100 + (i * 20), 40, 0, Math.PI * 2);
        ctx.fill();
    }

    // 4. Midground (Houses/Trees) - Parallax 0.5
    // We only draw objects that are visible on screen
    state.objects.forEach(obj => {
        const screenX = obj.x - state.cameraX;

        // Culling (only draw if close to screen)
        if (screenX > -200 && screenX < state.width + 200) {
            const baseY = state.groundY;

            if (obj.type === 'HOUSE') {
                // House body
                ctx.fillStyle = obj.color;
                ctx.fillRect(screenX, baseY - obj.height, 120, obj.height);
                // Roof
                ctx.fillStyle = '#4B5563';
                ctx.beginPath();
                ctx.moveTo(screenX - 10, baseY - obj.height);
                ctx.lineTo(screenX + 60, baseY - obj.height - 40);
                ctx.lineTo(screenX + 130, baseY - obj.height);
                ctx.fill();
                // Door
                ctx.fillStyle = '#92400E';
                ctx.fillRect(screenX + 45, baseY - 40, 30, 40);
                // Window
                ctx.fillStyle = '#93C5FD';
                ctx.fillRect(screenX + 10, baseY - obj.height + 20, 30, 30);
                ctx.fillRect(screenX + 80, baseY - obj.height + 20, 30, 30);
            } else {
                // Tree Trunk
                ctx.fillStyle = '#78350F';
                ctx.fillRect(screenX + 40, baseY - 60, 20, 60);
                // Leaves
                ctx.fillStyle = '#15803D';
                ctx.beginPath();
                ctx.arc(screenX + 50, baseY - 80, 40, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    });

    // 5. Ground
    ctx.fillStyle = '#10B981'; // Grass
    ctx.fillRect(0, state.groundY, state.width, state.height - state.groundY);

    // Sidewalk
    ctx.fillStyle = '#D1D5DB'; // Grey
    ctx.fillRect(0, state.groundY, state.width, 20);

    // Sidewalk lines (Scrolling)
    ctx.fillStyle = '#9CA3AF';
    const lineOffset = state.cameraX % 100;
    for (let x = -lineOffset; x < state.width; x += 100) {
        ctx.fillRect(x, state.groundY, 2, 20);
    }

    // Distance Markers
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.font = '16px "Press Start 2P"';
    const startMarker = Math.floor(state.cameraX / 500) * 500;
    for (let m = startMarker; m < startMarker + state.width + 500; m += 500) {
        if (m === 0) continue;
        const drawX = m - state.cameraX;
        if (drawX > -50 && drawX < state.width) {
            ctx.fillRect(drawX, state.groundY, 5, 50);
            ctx.fillText(m + "m", drawX - 20, state.groundY + 80);
        }
    }
}

function loop() {
    ctx.clearRect(0, 0, state.width, state.height);

    drawEnvironment(ctx);

    // Draw Mailman (Only if on screen)
    if (mailman.x - state.cameraX > -200) {
        mailman.draw(ctx);
    }

    dog.update();
    dog.draw(ctx);

    requestAnimationFrame(loop);
}

function init() {
    resize();
    generateScenery();
    window.addEventListener('resize', resize);
    window.addEventListener('mousedown', handleInput);
    window.addEventListener('touchstart', (e) => { e.preventDefault(); handleInput(); }, { passive: false });
    loop();
}

function handleInput() {
    if (state.mode === 'IDLE') {
        mailman.kick();
    }
}

init();


