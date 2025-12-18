/**
 * DOGGO MEADOW FETCH
 * Enhanced with custom MP3 barks and mobile polish.
 */

let scene, camera, renderer, video, hands;
let targets = [];
let balls = [];
let score = 0, shots = 0, hits = 0;
let crosshair;
let lastDetectionTime = 0;
let lastFireTime = 0;
const DETECTION_INTERVAL = 30;
const FIRE_RATE = 150;

const DOG_EMOJIS = ['🐕', '🦮', '🐩', '🐶'];
const BALL_EMOJI = '⚾';
const EXPLOSION_EMOJI = '💥';
const PLUS_CROSSHAIR = '+';

let audioCtx;
let barkBuffers = [];
const BARK_FILES = [
    'small-dog-snarl-and-bark-84705.mp3',
    'slap-hurt-pain-sound-effect-262618.mp3',
    'woofsmall2-40266.mp3'
];

const initAudio = async () => {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
        await audioCtx.resume();
    }

    // Pre-load barks if not already loaded
    if (barkBuffers.length === 0) {
        for (const file of BARK_FILES) {
            try {
                const response = await fetch(file);
                const arrayBuffer = await response.arrayBuffer();
                const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
                barkBuffers.push(audioBuffer);
            } catch (e) {
                console.warn("Failed to load bark:", file);
            }
        }
    }
};

const playBark = () => {
    if (!audioCtx || barkBuffers.length === 0) return;
    const source = audioCtx.createBufferSource();
    source.buffer = barkBuffers[Math.floor(Math.random() * barkBuffers.length)];
    const gainNode = audioCtx.createGain();
    gainNode.gain.value = 0.6;
    source.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    source.start(0);
};

const playSfx = (freq, type, duration, vol = 0.1) => {
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(10, audioCtx.currentTime + duration);
    g.gain.setValueAtTime(vol, audioCtx.currentTime);
    g.gain.linearRampToValueAtTime(0, audioCtx.currentTime + duration);
    osc.connect(g);
    g.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
};

function createTextTexture(text, size = 256, color = "#ef4444") {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = color;
    ctx.font = `bold ${size * 0.8}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, size / 2, size / 2);
    return new THREE.CanvasTexture(canvas);
}

function createGrassTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#15803d';
    ctx.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 15000; i++) {
        ctx.fillStyle = Math.random() > 0.5 ? '#166534' : '#1e8a44';
        ctx.fillRect(Math.random() * 512, Math.random() * 512, 2, 6);
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(12, 12);
    return tex;
}

async function startApp() {
    document.getElementById('tap-to-start').style.display = 'none';
    document.getElementById('loading').style.display = 'flex';

    await initAudio();
    await init();
}

async function init() {
    video = document.getElementById('input-video');

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xbae6fd);
    scene.fog = new THREE.Fog(0xbae6fd, 30, 80);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    document.body.appendChild(renderer.domElement);

    const crosshairTex = createTextTexture(PLUS_CROSSHAIR, 256, "#ef4444");
    const crosshairMat = new THREE.SpriteMaterial({ map: crosshairTex, transparent: true });
    crosshair = new THREE.Sprite(crosshairMat);
    crosshair.scale.set(2, 2, 1);
    scene.add(crosshair);

    const grassGeo = new THREE.PlaneGeometry(300, 300);
    const grassMat = new THREE.MeshPhongMaterial({ map: createGrassTexture() });
    const grass = new THREE.Mesh(grassGeo, grassMat);
    grass.rotation.x = -Math.PI / 2;
    grass.position.y = -10;
    scene.add(grass);

    const hemi = new THREE.HemisphereLight(0xffffff, 0x14532d, 1.4);
    scene.add(hemi);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.6);
    dirLight.position.set(10, 20, 10);
    scene.add(dirLight);

    for (let i = 0; i < 8; i++) {
        setTimeout(() => spawnTarget(true), i * 1000);
    }

    try {
        hands = new Hands({ locateFile: (f) => `https://unpkg.com/@mediapipe/hands@0.4.1646424915/${f}` });
        hands.setOptions({ maxNumHands: 1, modelComplexity: 1, minDetectionConfidence: 0.7, minTrackingConfidence: 0.7 });
        hands.onResults(onResults);

        const cam = new Camera(video, {
            onFrame: async () => {
                const now = performance.now();
                if (now - lastDetectionTime > DETECTION_INTERVAL) {
                    try { await hands.send({ image: video }); lastDetectionTime = now; } catch (e) { }
                }
            },
            width: 720, height: 1280 // Standard vertical mobile ratio
        });

        // Add a timeout for camera start on mobile
        const cameraStartPromise = cam.start();
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Camera initialization timed out (30s). Try refreshing or check permissions.")), 30000)
        );

        await Promise.race([cameraStartPromise, timeoutPromise]);

        document.getElementById('loading').style.display = 'none';
        animate();
    } catch (err) {
        console.error(err);
        const log = document.getElementById('error-log');
        if (log) log.innerText = `Camera Error: ${err.message}`;
        document.getElementById('loading').style.display = 'none';
    }
}

function spawnTarget(randomPosition = false) {
    const randomDog = DOG_EMOJIS[Math.floor(Math.random() * DOG_EMOJIS.length)];
    const tex = createTextTexture(randomDog, 256, "black");
    const mat = new THREE.SpriteMaterial({ map: tex });
    const sprite = new THREE.Sprite(mat);
    sprite.scale.set(6, 6, 1);

    const startX = randomPosition ? (Math.random() * 70 - 35) : 40;
    const startY = (Math.random() - 0.5) * 14;
    const startZ = -20 - Math.random() * 20;

    sprite.position.set(startX, startY, startZ);

    const speed = 0.07 + Math.random() * 0.12;
    sprite.userData.velocity = new THREE.Vector3(-speed, 0, 0);
    sprite.userData.phase = Math.random() * Math.PI * 2;

    scene.add(sprite);
    targets.push(sprite);
}

function throwBall(origin, targetPos) {
    shots++;
    // Synth whoosh sound
    playSfx(450, 'sine', 0.1, 0.08);

    const ballTex = createTextTexture(BALL_EMOJI, 256, "black");
    const ballMat = new THREE.SpriteMaterial({ map: ballTex });
    const ball = new THREE.Sprite(ballMat);
    ball.scale.set(1.5, 1.5, 1);
    ball.position.copy(origin);
    const dir = new THREE.Vector3().subVectors(targetPos, origin).normalize();
    ball.userData.velocity = dir.multiplyScalar(1.5);
    ball.userData.gravity = -0.015;
    scene.add(ball);
    balls.push(ball);
}

function createVFX(txt, pos) {
    const tex = createTextTexture(txt, 256, "black");
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true }));
    sprite.position.copy(pos);
    sprite.scale.set(7, 7, 1);
    scene.add(sprite);
    let t = 0;
    const anim = () => {
        t += 0.05;
        sprite.position.y += 0.06;
        sprite.material.opacity = 1 - t;
        if (t < 1) requestAnimationFrame(anim); else scene.remove(sprite);
    };
    anim();
}

function onResults(results) {
    const hint = document.getElementById('hint-container');
    if (!results.multiHandLandmarks || results.multiHandLandmarks.length === 0) {
        crosshair.visible = false;
        hint.style.opacity = '1';
        return;
    }
    hint.style.opacity = '0';
    crosshair.visible = true;

    const pts = results.multiHandLandmarks[0];
    const thumb = pts[4];
    const index = pts[8];
    const wrist = pts[0];

    const x = (1 - index.x - 0.5) * 60;
    const y = (0.5 - index.y) * 45;
    const aimPoint = new THREE.Vector3(x, y, -35);

    let best = null;
    let dMin = 8.0;
    targets.forEach(t => {
        const d = aimPoint.distanceTo(t.position);
        if (d < dMin) { dMin = d; best = t; }
    });
    if (best) aimPoint.lerp(best.position, 0.5);

    crosshair.position.copy(aimPoint);

    const pinchDist = Math.hypot(thumb.x - index.x, thumb.y - index.y);
    const isPinching = pinchDist < 0.045;

    if (isPinching) {
        const now = performance.now();
        if (now - lastFireTime > FIRE_RATE) {
            const throwOrigin = new THREE.Vector3((1 - wrist.x - 0.5) * 60, (0.5 - wrist.y) * 45, -5);
            throwBall(throwOrigin, aimPoint);
            lastFireTime = now;
        }
    }
}

function updateGameUI() {
    document.getElementById('score-val').innerText = score;
    const acc = shots > 0 ? Math.round((hits / shots) * 100) : 100;
    document.getElementById('accuracy-val').innerText = acc + "%";
}

function animate() {
    requestAnimationFrame(animate);
    const now = Date.now();

    for (let i = targets.length - 1; i >= 0; i--) {
        const t = targets[i];
        t.position.add(t.userData.velocity);
        t.position.y += Math.sin(now * 0.008 + t.userData.phase) * 0.04;
        if (t.position.x < -40) {
            scene.remove(t);
            targets.splice(i, 1);
            spawnTarget();
        }
    }

    for (let i = balls.length - 1; i >= 0; i--) {
        const b = balls[i];
        b.position.add(b.userData.velocity);
        b.userData.velocity.y += b.userData.gravity;

        let hitFound = false;
        for (let j = targets.length - 1; j >= 0; j--) {
            const t = targets[j];
            if (b.position.distanceTo(t.position) < 4.5) {
                hitFound = true;
                hits++;
                score += 500;

                // Play custom MP3 bark
                playBark();

                createVFX(EXPLOSION_EMOJI, t.position);
                scene.remove(t);
                targets.splice(j, 1);
                spawnTarget();
                break;
            }
        }
        if (hitFound || b.position.z < -75 || b.position.y < -20 || Math.abs(b.position.x) > 60) {
            scene.remove(b);
            balls.splice(i, 1);
            updateGameUI();
        }
    }
    renderer.render(scene, camera);
}

// Mobile Helper: Swipe/Tap to throw for devices without gesture capability or for backup
window.addEventListener('touchstart', (e) => {
    if (document.getElementById('tap-to-start').style.display !== 'none') {
        startApp();
        return;
    }

    // Simple tap-to-throw at crosshair for mobile ease
    if (crosshair && crosshair.visible) {
        const throwOrigin = new THREE.Vector3(0, -10, -5);
        throwBall(throwOrigin, crosshair.position);
    }
});

window.addEventListener('resize', () => {
    if (camera && renderer) {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }
});

document.getElementById('tap-to-start').onclick = startApp;