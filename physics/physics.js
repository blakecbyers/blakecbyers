// Matter.js engine initialization
const { Engine, Render, Runner, Bodies, Composite, Mouse, MouseConstraint, Events } = Matter;

// Create engine
const engine = Engine.create();
const world = engine.world;

// Create renderer
const render = Render.create({
    element: document.body,
    engine: engine,
    options: {
        width: window.innerWidth,
        height: window.innerHeight,
        wireframes: false,
        background: '#ffffff',
        pixelRatio: window.devicePixelRatio
    }
});

Render.run(render);

// Create runner
const runner = Runner.create();
Runner.run(runner, engine);

// Function to create boundaries
function createBoundaries() {
    Composite.clear(world, true);
    const thickness = 100;
    const wallOptions = {
        isStatic: true,
        render: { fillStyle: 'transparent' },
        friction: 0.1,
        restitution: 0.5
    };

    const ground = Bodies.rectangle(window.innerWidth / 2, window.innerHeight + thickness / 2, window.innerWidth, thickness, wallOptions);
    const ceiling = Bodies.rectangle(window.innerWidth / 2, -thickness / 2, window.innerWidth, thickness, wallOptions);
    const leftWall = Bodies.rectangle(-thickness / 2, window.innerHeight / 2, thickness, window.innerHeight, wallOptions);
    const rightWall = Bodies.rectangle(window.innerWidth + thickness / 2, window.innerHeight / 2, thickness, window.innerHeight, wallOptions);

    Composite.add(world, [ground, ceiling, leftWall, rightWall]);
}

createBoundaries();

// Helper to get random Apple-styled colors
const colors = [
    '#F2F2F7', // System Gray 6
    '#E5E5EA', // System Gray 5
    '#D1D1D6', // System Gray 4
    '#007AFF', // System Blue
    '#5856D6', // System Purple
    '#FF2D55', // System Pink
    '#FF9500', // System Orange
    '#AF52DE'  // System Purple (alt)
];

const getRandomColor = () => colors[Math.floor(Math.random() * colors.length)];

// Add shapes
function addShapes() {
    const shapes = [];
    const size = Math.min(window.innerWidth, window.innerHeight) * 0.15;

    for (let i = 0; i < 15; i++) {
        const x = Math.random() * window.innerWidth;
        const y = Math.random() * (window.innerHeight / 2);
        const color = getRandomColor();

        let body;
        if (Math.random() > 0.5) {
            body = Bodies.circle(x, y, size / 2, {
                restitution: 0.6,
                friction: 0.05,
                render: { fillStyle: color }
            });
        } else {
            body = Bodies.rectangle(x, y, size, size, {
                restitution: 0.6,
                friction: 0.05,
                chamfer: { radius: size * 0.2 },
                render: { fillStyle: color }
            });
        }
        shapes.push(body);
    }
    Composite.add(world, shapes);
}

addShapes();

// Add mouse control
const mouse = Mouse.create(render.canvas);
const mouseConstraint = MouseConstraint.create(engine, {
    mouse: mouse,
    constraint: {
        stiffness: 0.2,
        render: { visible: false }
    }
});

Composite.add(world, mouseConstraint);

// Keep mouse in sync with rendering
render.mouse = mouse;

// Handle window resize
window.addEventListener('resize', () => {
    render.canvas.width = window.innerWidth;
    render.canvas.height = window.innerHeight;
    createBoundaries();
});
