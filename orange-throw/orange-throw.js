class OrangeThrowEngine {
    constructor(canvas, onFinish) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.onFinish = onFinish;

        this.dogs = [];
        this.oranges = [];
        this.player = { x: canvas.width / 2, y: canvas.height - 40 };
        this.particles = [];

        this.lastTime = 0;
        this.running = false;
        this.gamepadConnected = false;

        // Stats for current session
        this.sessionFed = 0;
        this.sessionOranges = 0;

        // Constants
        this.MAX_SATURATION = 10;
        this.ORANGE_SPEED = 12;
        this.PLAYER_SPEED = 8;
        this.DOG_COUNT = 5;

        // Binding
        this.handleGamepad = this.handleGamepad.bind(this);
        this.loop = this.loop.bind(this);

        this.init();
    }

    init() {
        for (let i = 0; i < this.DOG_COUNT; i++) {
            this.dogs.push(new Dog(this.canvas.width, this.canvas.height, this.MAX_SATURATION));
        }

        window.addEventListener("gamepadconnected", () => {
            console.log("Gamepad connected!");
            this.gamepadConnected = true;
        });

        window.addEventListener("gamepaddisconnected", () => {
            console.log("Gamepad disconnected!");
            this.gamepadConnected = false;
        });

        // Touch/Mouse click to throw
        this.canvas.addEventListener('mousedown', (e) => this.throwOrange(e.clientX));
        this.canvas.addEventListener('touchstart', (e) => {
            if (e.touches[0]) this.throwOrange(e.touches[0].clientX);
        });

        // Keyboard movement
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

    throwOrange(x = this.player.x) {
        this.oranges.push({ x: x, y: this.player.y - 20, active: true });
        this.sessionOranges++;
        this.playSfx('throw');
    }

    handleGamepad() {
        const gamepads = navigator.getGamepads();
        const gp = gamepads[0]; // Assuming first controller
        if (!gp) return;

        // Left Stick Horizontal
        const axisX = gp.axes[0];
        if (Math.abs(axisX) > 0.1) {
            this.player.x += axisX * this.PLAYER_SPEED * 1.5;
        }

        // Switch Buttons (A or B usually spawn the action)
        // Usually Button 0 is B, Button 1 is A on Nintendo
        const aButton = gp.buttons[1];
        const bButton = gp.buttons[0];

        if ((aButton?.pressed || bButton?.pressed) && !this.buttonWasPressed) {
            this.throwOrange();
            this.buttonWasPressed = true;
        } else if (!(aButton?.pressed || bButton?.pressed)) {
            this.buttonWasPressed = false;
        }
    }

    loop(now) {
        if (!this.running) return;

        const dt = (now - this.lastTime) / 1000;
        this.lastTime = now;

        this.update(dt);
        this.draw();

        requestAnimationFrame(this.loop);
    }

    update(dt) {
        this.handleGamepad();

        // Keyboard fallback
        if (this.keys['ArrowLeft'] || this.keys['KeyA']) this.player.x -= this.PLAYER_SPEED;
        if (this.keys['ArrowRight'] || this.keys['KeyD']) this.player.x += this.PLAYER_SPEED;
        if (this.keys['Space'] && !this.spaceWasPressed) {
            this.throwOrange();
            this.spaceWasPressed = true;
        } else if (!this.keys['Space']) {
            this.spaceWasPressed = false;
        }

        // Bound player
        this.player.x = Math.max(20, Math.min(this.canvas.width - 20, this.player.x));

        // Update Dogs
        this.dogs.forEach(dog => dog.update(dt, this.canvas.width, this.canvas.height));

        // Update Oranges
        this.oranges.forEach(orange => {
            orange.y -= this.ORANGE_SPEED;
            if (orange.y < -20) orange.active = false;

            // Collision
            this.dogs.forEach(dog => {
                if (!dog.isFull && Math.abs(orange.x - dog.x) < 30 && Math.abs(orange.y - dog.y) < 30) {
                    orange.active = false;
                    dog.feed();
                    this.playSfx('eat');
                    this.createParticles(dog.x, dog.y, '#FF8C00');
                    if (dog.isFull) {
                        this.sessionFed++;
                        this.playSfx('success');
                        this.createParticles(dog.x, dog.y, '#FFD700', 20);
                    }
                }
            });
        });

        this.oranges = this.oranges.filter(o => o.active);

        // Particles
        this.particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.life -= dt;
        });
        this.particles = this.particles.filter(p => p.life > 0);
    }

    draw() {
        const { ctx, canvas } = this;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Sky background (already handled by div)

        // Grass area
        ctx.fillStyle = '#2ECC71';
        ctx.fillRect(0, canvas.height - 100, canvas.width, 100);

        // Draw Dogs
        this.dogs.forEach(dog => dog.draw(ctx));

        // Draw Oranges
        this.oranges.forEach(o => {
            ctx.font = '30px serif';
            ctx.fillText('🍊', o.x - 15, o.y + 10);
        });

        // Draw Player (Small tray or hand)
        ctx.font = '40px serif';
        ctx.fillText('🧺', this.player.x - 20, this.player.y + 10);

        // Draw Particles
        this.particles.forEach(p => {
            ctx.globalAlpha = p.life;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.globalAlpha = 1.0;
    }

    createParticles(x, y, color, count = 10) {
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x, y,
                vx: (Math.random() - 0.5) * 10,
                vy: (Math.random() - 0.5) * 10,
                life: 0.5 + Math.random() * 0.5,
                color,
                size: 2 + Math.random() * 3
            });
        }
    }

    playSfx(type) {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        const now = ctx.currentTime;
        if (type === 'throw') {
            osc.frequency.setValueAtTime(600, now);
            osc.frequency.exponentialRampToValueAtTime(200, now + 0.1);
            gain.gain.setValueAtTime(0.1, now);
            osc.start(); osc.stop(now + 0.1);
        } else if (type === 'eat') {
            osc.frequency.setValueAtTime(400, now);
            gain.gain.setValueAtTime(0.1, now);
            osc.start(); osc.stop(now + 0.05);
        } else if (type === 'success') {
            osc.frequency.setValueAtTime(500, now);
            osc.frequency.exponentialRampToValueAtTime(1200, now + 0.3);
            gain.gain.setValueAtTime(0.1, now);
            osc.start(); osc.stop(now + 0.3);
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
        this.y = Math.random() * (h - 300) + 100;
        this.vx = (Math.random() - 0.5) * 200; // Pixels per second
        this.vy = (Math.random() - 0.5) * 100;
        this.saturation = 0;
        this.isFull = false;
        this.emoji = ['🐶', '🐕', '🐩', '🦮', '🐕‍🦺'][Math.floor(Math.random() * 5)];
    }

    update(dt, w, h) {
        if (this.isFull) {
            this.y += 100 * dt; // Run off bottom
            return;
        }

        this.x += this.vx * dt;
        this.y += this.vy * dt;

        if (this.x < 20 || this.x > w - 40) this.vx *= -1;
        if (this.y < 50 || this.y > h - 250) this.vy *= -1;
    }

    feed() {
        if (!this.isFull) {
            this.saturation++;
            if (this.saturation >= this.maxSaturation) {
                this.isFull = true;
            }
        }
    }

    draw(ctx) {
        ctx.font = '50px serif';
        ctx.fillText(this.isFull ? '✨' : this.emoji, this.x - 25, this.y + 20);

        if (!this.isFull) {
            // Draw saturation bar
            ctx.fillStyle = 'rgba(0,0,0,0.1)';
            ctx.fillRect(this.x - 25, this.y - 45, 50, 6);
            ctx.fillStyle = '#FF8C00';
            ctx.fillRect(this.x - 25, this.y - 45, (this.saturation / this.maxSaturation) * 50, 6);

            ctx.font = 'bold 10px Inter';
            ctx.fillStyle = 'rgba(0,0,0,0.4)';
            ctx.textAlign = 'center';
            ctx.fillText(this.saturation + '/' + this.maxSaturation, this.x, this.y - 50);
        }
    }
}