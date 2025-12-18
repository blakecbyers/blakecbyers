class OrangeThrowEngine {
    constructor(canvas, onUpdateFed) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.onUpdateFed = onUpdateFed;

        this.dogs = [];
        this.oranges = [];
        this.splats = [];
        this.particles = [];
        this.player = { x: canvas.width / 2, y: canvas.height - 80, angle: -Math.PI / 2 };

        this.totalFed = 0;
        this.lastTime = 0;
        this.running = false;

        // Constants
        this.GRAVITY = 1200;
        this.THROW_STRENGTH = 1000;
        this.PLAYER_SPEED = 600;
        this.DOG_COUNT = 3;

        this.init();
        this.initMotion();
        this.loop = this.loop.bind(this);
    }

    init() {
        for (let i = 0; i < this.DOG_COUNT; i++) {
            this.dogs.push(new Dog(this.canvas.width, this.canvas.height));
        }

        this.canvas.addEventListener('mousedown', (e) => this.throwAt(e.clientX, e.clientY));
        this.canvas.addEventListener('touchstart', (e) => {
            if (e.touches[0]) this.throwAt(e.touches[0].clientX, e.touches[0].clientY);
        });

        window.addEventListener('keydown', (e) => {
            if (e.code === 'Space') this.throwOrange();
        });
    }

    start() {
        this.running = true;
        this.lastTime = performance.now();
        requestAnimationFrame(this.loop);
    }

    throwOrange(strength = this.THROW_STRENGTH) {
        const vx = Math.cos(this.player.angle) * strength;
        const vy = Math.sin(this.player.angle) * strength;

        this.oranges.push({
            x: this.player.x,
            y: this.player.y - 20,
            vx, vy,
            rotation: 0,
            rotationSpeed: (Math.random() - 0.5) * 15,
            active: true
        });
        this.playSfx('throw');
        this.vibrate(100, 0.4);
    }

    throwAt(tx, ty) {
        const dx = tx - this.player.x;
        const dy = ty - this.player.y;
        this.player.angle = Math.atan2(dy, dx);
        this.throwOrange();
    }

    update(dt) {
        this.handleGamepad(dt);

        // Update Dogs
        this.dogs.forEach(dog => {
            dog.update(dt, this.canvas.width, this.canvas.height, this.oranges);
            if (dog.done && !dog.counted) {
                this.totalFed++;
                dog.counted = true;
                this.onUpdateFed(this.totalFed);
                this.vibrate(400, 0.7);
            }
        });

        // Update Oranges
        this.oranges.forEach(o => {
            o.vy += this.GRAVITY * dt;
            o.x += o.vx * dt;
            o.y += o.vy * dt;
            o.rotation += o.rotationSpeed * dt;

            if (o.y > this.canvas.height + 100) o.active = false;

            // Collision
            this.dogs.forEach(dog => {
                if (dog.checkCatch(o)) {
                    o.active = false;
                    this.createSplat(dog.x, dog.y);
                    this.playSfx('splat');
                }
            });
        });

        this.oranges = this.oranges.filter(o => o.active);

        // Update Splats (decay)
        this.splats.forEach(s => s.life -= dt);
        this.splats = this.splats.filter(s => s.life > 0);

        // Update Particles
        this.particles.forEach(p => {
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.vy += 800 * dt;
            p.life -= dt;
        });
        this.particles = this.particles.filter(p => p.life > 0);
    }

    handleGamepad(dt) {
        const gamepads = navigator.getGamepads();
        const gp = gamepads[0];
        if (!gp) return;

        // Move
        const stickX = gp.axes[0];
        if (Math.abs(stickX) > 0.1) this.player.x += stickX * this.PLAYER_SPEED * dt;

        // Aim
        // Standard mapping for Pro Controller / Joy-Cons:
        // Left Stick (0, 1), Right Stick (2, 3)
        const aimX = gp.axes[2];
        const aimY = gp.axes[3];

        if (Math.hypot(aimX, aimY) > 0.2) {
            this.player.angle = Math.atan2(aimY, aimX);
        } else {
            // Try gyro/tilt axes (Nintendo Pro Controller often maps gyro to extra axes)
            // Or use the DPAD for fine-tuning
            const dpadUp = gp.buttons[12]?.pressed;
            const dpadDown = gp.buttons[13]?.pressed;
            const dpadLeft = gp.buttons[14]?.pressed;
            const dpadRight = gp.buttons[15]?.pressed;

            if (dpadUp) this.player.angle -= 1.5 * dt;
            if (dpadDown) this.player.angle += 1.5 * dt;
            if (dpadLeft) this.player.x -= this.PLAYER_SPEED * dt;
            if (dpadRight) this.player.x += this.PLAYER_SPEED * dt;
        }

        // Throw - Buttons A(1), B(0), X(3), Y(2) or Triggers(6, 7)
        const pressed = gp.buttons.some((b, i) => b.pressed && (i < 4 || i === 7 || i === 6));
        if (pressed && !this.wasPressed) {
            this.throwOrange();
            this.wasPressed = true;
        } else if (!pressed) {
            this.wasPressed = false;
        }
    }

    initMotion() {
        // Request Permission for iOS 13+
        const requestPermission = () => {
            if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
                DeviceOrientationEvent.requestPermission()
                    .then(response => {
                        if (response === 'granted') {
                            this.bindMotionEvents();
                        }
                    })
                    .catch(console.error);
            } else {
                this.bindMotionEvents();
            }
        };

        window.addEventListener('click', requestPermission, { once: true });
        window.addEventListener('touchstart', requestPermission, { once: true });
    }

    bindMotionEvents() {
        // Gyro Aiming
        window.addEventListener('deviceorientation', (e) => {
            if (e.beta !== null && e.gamma !== null) {
                // Map phone tilt to aiming angle
                // In landscape, beta/gamma swap roles or behavior
                const isLandscape = window.innerWidth > window.innerHeight;
                if (isLandscape) {
                    // Gamma is typically the tilt when held sideways
                    const tilt = e.gamma; // -90 to 90
                    this.player.angle = (tilt / 90) * Math.PI;
                } else {
                    const tilt = e.beta;
                    this.player.angle = -(tilt / 180) * Math.PI;
                }
            }
        });

        // Flick to Throw
        let lastAccel = 0;
        window.addEventListener('devicemotion', (e) => {
            const acc = e.accelerationIncludingGravity;
            if (!acc) return;
            const total = Math.sqrt(acc.x * acc.x + acc.y * acc.y + acc.z * acc.z);
            const delta = Math.abs(total - lastAccel);
            lastAccel = total;

            if (delta > 25) { // Threshold for a "flick"
                const now = performance.now();
                if (now - (this.lastFlickTime || 0) > 500) {
                    this.throwOrange(this.THROW_STRENGTH * 1.2);
                    this.lastFlickTime = now;
                }
            }
        });
    }

    createSplat(x, y) {
        // Splat blob
        this.splats.push({ x, y, life: 1.0, scale: 0.8 + Math.random() * 0.5 });
        // Splat drops
        for (let i = 0; i < 15; i++) {
            this.particles.push({
                x, y,
                vx: (Math.random() - 0.5) * 600,
                vy: (Math.random() - 0.8) * 600,
                life: 0.5 + Math.random() * 0.5,
                color: '#FF8C00',
                size: 2 + Math.random() * 5
            });
        }
    }

    draw() {
        const { ctx, canvas } = this;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Horizon/Sun
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(canvas.width - 100, 100, 60, 0, Math.PI * 2);
        ctx.fill();

        // Floor
        ctx.fillStyle = '#2ecc71';
        ctx.fillRect(0, canvas.height - 60, canvas.width, 60);

        // Splats on ground/face
        this.splats.forEach(s => {
            ctx.globalAlpha = s.life;
            ctx.fillStyle = '#FF8C00';
            ctx.beginPath();
            ctx.ellipse(s.x, s.y, 40 * s.scale, 25 * s.scale, 0, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.globalAlpha = 1.0;

        // Trajectory
        this.drawTrajectory();

        this.dogs.forEach(dog => dog.draw(ctx));

        // Oranges
        this.oranges.forEach(o => {
            ctx.save();
            ctx.translate(o.x, o.y);
            ctx.rotate(o.rotation);
            ctx.font = '40px serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('🍊', 0, 0);
            ctx.restore();
        });

        // Player
        ctx.save();
        ctx.translate(this.player.x, this.player.y);
        ctx.rotate(this.player.angle + Math.PI / 2);
        ctx.font = '60px serif';
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
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        let tx = this.player.x, ty = this.player.y;
        let tvx = Math.cos(this.player.angle) * this.THROW_STRENGTH;
        let tvy = Math.sin(this.player.angle) * this.THROW_STRENGTH;
        ctx.moveTo(tx, ty);
        for (let i = 0; i < 15; i++) {
            tvy += this.GRAVITY * 0.06;
            tx += tvx * 0.06; ty += tvy * 0.06;
            ctx.lineTo(tx, ty);
        }
        ctx.stroke();
        ctx.setLineDash([]);
    }

    loop(now) {
        if (!this.running) return;
        const dt = Math.min((now - this.lastTime) / 1000, 0.1);
        this.lastTime = now;
        this.update(dt);
        this.draw();
        requestAnimationFrame(this.loop);
    }

    vibrate(d, i) {
        const gp = navigator.getGamepads()[0];
        if (gp?.vibrationActuator) gp.vibrationActuator.playEffect("dual-rumble", { duration: d, weakMagnitude: i, strongMagnitude: i });
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
            osc.frequency.setValueAtTime(600, now);
            osc.frequency.exponentialRampToValueAtTime(100, now + 0.1);
            gain.gain.setValueAtTime(0.1, now);
            osc.start(); osc.stop(now + 0.1);
        } else if (type === 'splat') {
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(150, now);
            gain.gain.setValueAtTime(0.2, now);
            osc.start(); osc.stop(now + 0.05);
        }
    }
}

class Dog {
    constructor(w, h) {
        this.reset(w, h);
    }
    reset(w, h) {
        this.x = Math.random() * (w - 100) + 50;
        this.y = h - 160;
        this.vx = (Math.random() - 0.5) * 200;
        this.emoji = ['🐶', '🐕', '🐩', '🦮', '🐕‍🦺'][Math.floor(Math.random() * 5)];
        this.done = false;
        this.counted = false;
        this.fed = 0;
        this.state = 'idle';
        this.timer = 0;
    }
    update(dt, w, h, oranges) {
        if (this.done) { this.y += 300 * dt; return; }
        this.timer -= dt;
        let nearest = oranges.find(o => Math.hypot(o.x - this.x, o.y - this.y) < 400);
        if (this.state === 'splat') {
            if (this.timer <= 0) this.state = 'idle';
        } else if (nearest) {
            this.state = 'tracking';
            this.x += (nearest.x - this.x) * 4 * dt;
        } else {
            this.state = 'idle';
            this.x += this.vx * dt;
            if (this.x < 50 || this.x > w - 50) this.vx *= -1;
        }
    }
    checkCatch(o) {
        if (Math.hypot(o.x - this.x, o.y - (this.y - 10)) < 50) {
            this.fed++;
            this.state = 'splat';
            this.timer = 0.5;
            if (this.fed >= 3) {
                this.done = true;
                setTimeout(() => this.reset(window.innerWidth, window.innerHeight), 2000);
            }
            return true;
        }
        return false;
    }
    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.font = '80px serif';
        ctx.textAlign = 'center';
        let e = this.state === 'splat' ? '😋' : this.emoji;
        if (this.done) e = '🥰';
        ctx.fillText(e, 0, 0);
        ctx.restore();
    }
}