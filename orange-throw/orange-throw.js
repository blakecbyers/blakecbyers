class OrangeThrowEngine {
    constructor(canvas, onFinish) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.onFinish = onFinish;

        this.dogs = [];
        this.oranges = [];
        this.player = { x: canvas.width / 2, y: canvas.height - 60, angle: -Math.PI / 2 };
        this.particles = [];

        this.lastTime = 0;
        this.running = false;
        this.gamepadConnected = false;

        // Stats
        this.sessionFed = 0;
        this.sessionOranges = 0;

        // Constants
        this.MAX_SATURATION = 5;
        this.GRAVITY = 600; // Pixels per second squared
        this.THROW_STRENGTH = 800;
        this.PLAYER_SPEED = 400;
        this.DOG_COUNT = 4;

        this.handleGamepad = this.handleGamepad.bind(this);
        this.loop = this.loop.bind(this);

        this.init();
    }

    init() {
        // Create initial dogs
        for (let i = 0; i < this.DOG_COUNT; i++) {
            this.dogs.push(new Dog(this.canvas.width, this.canvas.height, this.MAX_SATURATION));
        }

        window.addEventListener("gamepadconnected", (e) => {
            console.log("Gamepad connected:", e.gamepad.id);
            this.gamepadConnected = true;
        });

        window.addEventListener("gamepaddisconnected", () => {
            this.gamepadConnected = false;
        });

        // Fallback Mouse click to throw
        this.canvas.addEventListener('mousedown', (e) => this.throwAt(e.clientX, e.clientY));

        this.keys = {};
        window.addEventListener('keydown', (e) => this.keys[e.code] = true);
        window.addEventListener('keyup', (e) => this.keys[e.code] = false);
    }

    start() {
        this.running = true;
        this.lastTime = performance.now();
        requestAnimationFrame(this.loop);
    }

    stop() {
        this.running = false;
        if (this.sessionFed > 0 || this.sessionOranges > 0) {
            this.onFinish(this.sessionFed, this.sessionOranges);
        }
    }

    throwOrange(strength = this.THROW_STRENGTH) {
        // Calculate velocity based on aiming angle
        const vx = Math.cos(this.player.angle) * strength;
        const vy = Math.sin(this.player.angle) * strength;

        this.oranges.push({
            x: this.player.x,
            y: this.player.y - 20,
            vx: vx,
            vy: vy,
            rotation: 0,
            rotationSpeed: (Math.random() - 0.5) * 10,
            active: true
        });
        this.sessionOranges++;
        this.playSfx('throw');

        // Vibration feedback
        this.vibrate(100, 0.5);
    }

    throwAt(targetX, targetY) {
        const dx = targetX - this.player.x;
        const dy = targetY - this.player.y;
        this.player.angle = Math.atan2(dy, dx);
        this.throwOrange();
    }

    handleGamepad() {
        const gamepads = navigator.getGamepads();
        const gp = gamepads[0];
        if (!gp) return;

        // --- MOVEMENT ---
        // Left Stick Horizontal or D-Pad
        const axisX = gp.axes[0];
        const dpadLeft = gp.buttons[14]?.pressed;
        const dpadRight = gp.buttons[15]?.pressed;

        if (Math.abs(axisX) > 0.1) {
            this.player.x += axisX * this.PLAYER_SPEED * 0.016;
        } else if (dpadLeft) {
            this.player.x -= this.PLAYER_SPEED * 0.016;
        } else if (dpadRight) {
            this.player.x += this.PLAYER_SPEED * 0.016;
        }

        // --- AIMING (Gyro / Tilt Simulation) ---
        // Many browsers map Gyro to axes 2 & 3 or 4 & 5.
        // We'll prioritize Right Stick for "Manual Aim" and check for Gyro-like axes.
        const aimX = gp.axes[2] || 0;
        const aimY = gp.axes[3] || 0;

        // If movement is detected on second stick, update angle
        if (Math.abs(aimX) > 0.1 || Math.abs(aimY) > 0.1) {
            this.player.angle = Math.atan2(aimY, aimX);
        } else {
            // Check for Tilt/Gyro (Axes 4, 5 are often tilt on some HID drivers)
            const tiltX = gp.axes[4] || 0;
            const tiltY = gp.axes[5] || 0;
            if (Math.abs(tiltX) > 0.1 || Math.abs(tiltY) > 0.1) {
                this.player.angle += tiltX * 0.1; // Rotates aiming
            }
        }

        // --- ACTION (Throw) ---
        // Any face button (A:1, B:0, X:3, Y:2) or Trigger (7: ZR)
        const throwPressed = gp.buttons[0]?.pressed || gp.buttons[1]?.pressed ||
            gp.buttons[2]?.pressed || gp.buttons[3]?.pressed ||
            gp.buttons[7]?.pressed;

        if (throwPressed && !this.buttonWasPressed) {
            this.throwOrange();
            this.buttonWasPressed = true;
        } else if (!throwPressed) {
            this.buttonWasPressed = false;
        }
    }

    vibrate(duration, intensity) {
        const gp = navigator.getGamepads()[0];
        if (gp && gp.vibrationActuator) {
            gp.vibrationActuator.playEffect("dual-rumble", {
                startDelay: 0,
                duration: duration,
                weakMagnitude: intensity,
                strongMagnitude: intensity,
            });
        }
    }

    loop(now) {
        if (!this.running) return;
        const dt = Math.min((now - this.lastTime) / 1000, 0.1);
        this.lastTime = now;

        this.update(dt);
        this.draw();

        requestAnimationFrame(this.loop);
    }

    update(dt) {
        this.handleGamepad();

        // Keyboard Movement
        if (this.keys['ArrowLeft'] || this.keys['KeyA']) this.player.x -= this.PLAYER_SPEED * dt;
        if (this.keys['ArrowRight'] || this.keys['KeyD']) this.player.x += this.PLAYER_SPEED * dt;
        if (this.keys['Space'] && !this.spaceWasPressed) {
            this.throwOrange();
            this.spaceWasPressed = true;
        } else if (!this.keys['Space']) {
            this.spaceWasPressed = false;
        }

        this.player.x = Math.max(40, Math.min(this.canvas.width - 40, this.player.x));

        // Update Dogs
        this.dogs.forEach(dog => {
            dog.update(dt, this.canvas.width, this.canvas.height, this.oranges);
            if (dog.done && !dog.counted) {
                this.sessionFed++;
                dog.counted = true;
                this.vibrate(300, 0.8);
            }
        });

        // Update Oranges with Projectile Physics
        this.oranges.forEach(orange => {
            orange.vy += this.GRAVITY * dt;
            orange.x += orange.vx * dt;
            orange.y += orange.vy * dt;
            orange.rotation += orange.rotationSpeed * dt;

            // Bounds check
            if (orange.y > this.canvas.height + 50 || orange.x < -50 || orange.x > this.canvas.width + 50) {
                orange.active = false;
            }

            // Collision
            this.dogs.forEach(dog => {
                if (!dog.isFull && dog.checkCatch(orange)) {
                    orange.active = false;
                    this.playSfx('eat');
                    this.createParticles(dog.x, dog.y, '#FF8C00');
                }
            });
        });

        this.oranges = this.oranges.filter(o => o.active);

        // Particles
        this.particles.forEach(p => {
            p.vx *= 0.95;
            p.vy += 200 * dt; // Tiny gravity for juice
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.life -= dt;
        });
        this.particles = this.particles.filter(p => p.life > 0);
    }

    draw() {
        const { ctx, canvas } = this;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Ground
        ctx.fillStyle = '#27ae60';
        ctx.fillRect(0, canvas.height - 40, canvas.width, 40);

        // Trajectory Preview (Subtle)
        this.drawTrajectory();

        this.dogs.forEach(dog => dog.draw(ctx));

        // Oranges
        this.oranges.forEach(o => {
            ctx.save();
            ctx.translate(o.x, o.y);
            ctx.rotate(o.rotation);
            ctx.font = '36px serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('🍊', 0, 0);
            ctx.restore();
        });

        // Player (Hand/Basket)
        ctx.save();
        ctx.translate(this.player.x, this.player.y);
        ctx.rotate(this.player.angle + Math.PI / 2);
        ctx.font = '50px serif';
        ctx.textAlign = 'center';
        ctx.fillText('🧺', 0, 0);
        ctx.restore();

        // Particles
        this.particles.forEach(p => {
            ctx.globalAlpha = p.life;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.globalAlpha = 1.0;
    }

    drawTrajectory() {
        const ctx = this.ctx;
        ctx.beginPath();
        ctx.setLineDash([5, 10]);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';

        let tx = this.player.x;
        let ty = this.player.y - 20;
        let tvx = Math.cos(this.player.angle) * this.THROW_STRENGTH;
        let tvy = Math.sin(this.player.angle) * this.THROW_STRENGTH;

        ctx.moveTo(tx, ty);
        for (let i = 0; i < 20; i++) {
            tvy += this.GRAVITY * 0.05;
            tx += tvx * 0.05;
            ty += tvy * 0.05;
            ctx.lineTo(tx, ty);
        }
        ctx.stroke();
        ctx.setLineDash([]);
    }

    createParticles(x, y, color, count = 12) {
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x, y,
                vx: (Math.random() - 0.5) * 400,
                vy: (Math.random() - 0.5) * 400 - 100,
                life: 0.6 + Math.random() * 0.4,
                color,
                size: 2 + Math.random() * 4
            });
        }
    }

    playSfx(type) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        const now = ctx.currentTime;
        if (type === 'throw') {
            osc.frequency.setValueAtTime(400, now);
            osc.frequency.exponentialRampToValueAtTime(800, now + 0.1);
            gain.gain.setValueAtTime(0.1, now);
            osc.start(); osc.stop(now + 0.1);
        } else if (type === 'eat') {
            osc.className = 'triangle';
            osc.frequency.setValueAtTime(200, now);
            gain.gain.setValueAtTime(0.1, now);
            osc.start(); osc.stop(now + 0.05);
        } else if (type === 'success') {
            osc.frequency.setValueAtTime(600, now);
            osc.frequency.exponentialRampToValueAtTime(1200, now + 0.4);
            gain.gain.setValueAtTime(0.15, now);
            osc.start(); osc.stop(now + 0.4);
        }
    }
}

class Dog {
    constructor(w, h, maxSat) {
        this.maxSaturation = maxSat;
        this.reset(w, h);
    }

    reset(w, h) {
        this.x = Math.random() * (w - 100) + 50;
        this.y = h - 150;
        this.vx = (Math.random() - 0.5) * 150;
        this.saturation = 0;
        this.isFull = false;
        this.done = false;
        this.counted = false;
        this.emoji = ['🐶', '🐕', '🐩', '🦮', '🐕‍🦺'][Math.floor(Math.random() * 5)];
        this.state = 'idle'; // idle, tracking, eating
        this.stateTimer = 0;
        this.scale = 1;
    }

    update(dt, w, h, oranges) {
        if (this.done) {
            this.y += 200 * dt; // Exit
            return;
        }

        this.stateTimer -= dt;

        // Find nearest orange
        let nearest = null;
        let minDist = 300;
        oranges.forEach(o => {
            const d = Math.hypot(o.x - this.x, o.y - this.y);
            if (d < minDist) {
                minDist = d;
                nearest = o;
            }
        });

        if (this.state === 'eating') {
            if (this.stateTimer <= 0) this.state = 'idle';
        } else if (nearest) {
            this.state = 'tracking';
            // Move toward orange horizontally
            const dx = nearest.x - this.x;
            this.x += dx * 2 * dt;
        } else {
            this.state = 'idle';
            this.x += this.vx * dt;
            if (this.x < 50 || this.x > w - 50) this.vx *= -1;
        }
    }

    checkCatch(orange) {
        const dist = Math.hypot(orange.x - this.x, orange.y - (this.y - 10));
        if (dist < 40) {
            this.saturation++;
            this.state = 'eating';
            this.stateTimer = 0.5;
            if (this.saturation >= this.maxSaturation) {
                this.isFull = true;
                this.stateTimer = 1.0;
                setTimeout(() => { this.done = true; }, 1000);
            }
            return true;
        }
        return false;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);

        // Bounce animation
        const bounce = this.state === 'tracking' ? Math.sin(Date.now() / 50) * 5 : 0;

        ctx.font = '60px serif';
        ctx.textAlign = 'center';

        let displayEmoji = this.emoji;
        if (this.state === 'eating') displayEmoji = '😋';
        if (this.isFull) displayEmoji = '🥰';

        ctx.fillText(displayEmoji, 0, bounce);

        if (!this.isFull) {
            // Heart/Sat bar
            const barW = 60;
            ctx.fillStyle = 'rgba(0,0,0,0.2)';
            ctx.roundRect(-barW / 2, -80, barW, 8, 4);
            ctx.fill();

            ctx.fillStyle = '#f39c12';
            ctx.roundRect(-barW / 2, -80, (this.saturation / this.maxSaturation) * barW, 8, 4);
            ctx.fill();
        } else {
            ctx.font = '24px serif';
            ctx.fillText('✨', 0, -80);
        }

        ctx.restore();
    }
}