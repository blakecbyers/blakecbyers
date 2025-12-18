// Matter.js engine wrapper for React integration
const { Engine, Render, Runner, Bodies, Composite, Mouse, MouseConstraint, Events } = Matter;

class GravityEngine {
    constructor(container, options = {}) {
        this.container = container;
        this.options = {
            width: window.innerWidth,
            height: window.innerHeight,
            gravity: 1,
            friction: 0.1,
            restitution: 0.5,
            ...options
        };

        this.engine = Engine.create();
        this.world = this.engine.world;
        this.engine.gravity.y = this.options.gravity;

        this.render = Render.create({
            element: container,
            engine: this.engine,
            options: {
                width: this.options.width,
                height: this.options.height,
                wireframes: false,
                background: 'transparent',
                pixelRatio: window.devicePixelRatio
            }
        });

        this.runner = Runner.create();
        this.boundaries = [];
        this.shapes = [];

        this.init();
    }

    init() {
        Render.run(this.render);
        Runner.run(this.runner, this.engine);
        this.createBoundaries();
        this.addMouseControl();

        // Window resize
        this.resizeHandler = () => {
            this.render.canvas.width = window.innerWidth;
            this.render.canvas.height = window.innerHeight;
            this.createBoundaries();
        };
        window.addEventListener('resize', this.resizeHandler);
    }

    destroy() {
        Render.stop(this.render);
        Runner.stop(this.runner);
        Engine.clear(this.engine);
        this.render.canvas.remove();
        this.render.canvas = null;
        this.render.context = null;
        this.render.textures = {};
        window.removeEventListener('resize', this.resizeHandler);
    }

    createBoundaries() {
        if (this.boundaries.length) {
            Composite.remove(this.world, this.boundaries);
        }

        const thickness = 100;
        const wallOptions = {
            isStatic: true,
            render: { fillStyle: 'transparent' },
            friction: this.options.friction,
            restitution: this.options.restitution
        };

        const w = window.innerWidth;
        const h = window.innerHeight;

        this.boundaries = [
            Bodies.rectangle(w / 2, h + thickness / 2, w, thickness, wallOptions),
            Bodies.rectangle(w / 2, -thickness / 2, w, thickness, wallOptions),
            Bodies.rectangle(-thickness / 2, h / 2, thickness, h, wallOptions),
            Bodies.rectangle(w + thickness / 2, h / 2, thickness, h, wallOptions)
        ];

        Composite.add(this.world, this.boundaries);
    }

    addMouseControl() {
        const mouse = Mouse.create(this.render.canvas);
        const mouseConstraint = MouseConstraint.create(this.engine, {
            mouse: mouse,
            constraint: {
                stiffness: 0.2,
                render: { visible: false }
            }
        });

        Composite.add(this.world, mouseConstraint);
        this.render.mouse = mouse;
    }

    addRandomShape() {
        const size = Math.min(window.innerWidth, window.innerHeight) * (0.05 + Math.random() * 0.1);
        const x = Math.random() * window.innerWidth;
        const y = -size;
        const color = this.getRandomColor();

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

        this.shapes.push(body);
        Composite.add(this.world, body);
        return body;
    }

    setGravity(g) {
        this.engine.gravity.y = g;
    }

    clear() {
        Composite.remove(this.world, this.shapes);
        this.shapes = [];
    }

    getRandomColor() {
        const colors = ['#F2F2F7', '#E5E5EA', '#D1D1D6', '#007AFF', '#5856D6', '#FF2D55', '#FF9500', '#AF52DE'];
        return colors[Math.floor(Math.random() * colors.length)];
    }
}
