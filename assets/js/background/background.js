class Star {
    constructor(x, y, size, brightness, phase) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.brightness = brightness;
        this.phase = phase;
    }

    draw(context, time) {
        const currentBrightness = this.brightness * (0.5 + 0.5 * Math.sin(time + this.phase));
        context.globalAlpha = currentBrightness;
        context.fillRect(this.x, this.y, this.size, this.size);
    }
}

class StarField {
    constructor(canvas) {
        this.canvas = canvas;
        this.context = canvas.getContext('2d');
        this.stars = [];
        this.time = 0;
        this.lastTime = 0;
        this.running = false;
    }

    resize() {
        const width = window.innerWidth;
        // Size against the largest viewport height so the canvas does not need
        // to be rebuilt when the mobile address bar shows or hides.
        const height = Math.max(window.innerHeight, document.documentElement.clientHeight, window.screen ? window.screen.height : 0);

        // Ignore height-only changes (mobile toolbar) once the field exists
        if (this.stars.length && width === this.width && height <= this.height) {
            return;
        }

        this.width = width;
        this.height = Math.max(height, this.height || 0);

        const ratio = Math.min(window.devicePixelRatio || 1, 2);
        this.canvas.width = Math.round(this.width * ratio);
        this.canvas.height = Math.round(this.height * ratio);
        this.canvas.style.height = this.height + 'px';
        this.context.setTransform(ratio, 0, 0, ratio, 0, 0);

        const starCount = Math.floor(this.width * this.height / 800);
        this.createStars(starCount, this.width, this.height);
        this.draw();
    }

    createStars(count, width, height) {
        this.stars = [];

        for (let i = 0; i < count; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height;

            let size = 1;

            const chance = Math.random();
            if (chance > 0.6){
                size = 2;
            }
            else if (chance > 0.3){
                size = 1.5;
            }

            const brightness = 0.5 + Math.random() * 0.5;
            const phase = Math.random() * 6;

            this.stars.push(new Star(x, y, size, brightness, phase));
        }
    }

    draw() {
        this.context.clearRect(0, 0, this.width, this.height);
        this.context.fillStyle = '#ffffff';

        for (let i = 0; i < this.stars.length; i++) {
            this.stars[i].draw(this.context, this.time);
        }

        this.context.globalAlpha = 1;
    }

    update(currentTime) {
        if (!this.running){
            return;
        }

        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        this.time += deltaTime * 0.0005;

        // ~30fps is plenty for a slow twinkle and halves the work on phones
        if (currentTime - this.lastDraw >= 33) {
            this.lastDraw = currentTime;
            this.draw();
        }

        requestAnimationFrame((nextTime) => this.update(nextTime));
    }

    start() {
        if (this.running){
            return;
        }

        this.running = true;
        this.lastTime = performance.now();
        this.lastDraw = 0;
        requestAnimationFrame((currentTime) => this.update(currentTime));
    }

    stop() {
        this.running = false;
    }

    initialize() {
        this.resize();

        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
        const shouldAnimate = () => !reducedMotion.matches && document.visibilityState === 'visible';
        const refresh = () => (shouldAnimate() ? this.start() : this.stop());

        refresh();

        let resizeFrame = 0;
        window.addEventListener('resize', () => {
            cancelAnimationFrame(resizeFrame);
            resizeFrame = requestAnimationFrame(() => this.resize());
        }, { passive: true });

        document.addEventListener('visibilitychange', refresh);
        if (reducedMotion.addEventListener) {
            reducedMotion.addEventListener('change', refresh);
        }
    }
}

export function initialize() {
    const canvas = document.getElementById('background');

    if (!canvas){
        return;
    }

    const starField = new StarField(canvas);
    starField.initialize();

    return starField;
}