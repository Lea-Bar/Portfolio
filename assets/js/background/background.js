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
        const height = window.innerHeight;

        this.canvas.width = width;
        this.canvas.height = height;

        const starCount = Math.floor(width * height / 8000);

        if (starCount !== this.stars.length) {
            this.createStars(starCount, width, height);
        }
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
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
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

        this.draw();
        requestAnimationFrame((nextTime) => this.update(nextTime));
    }

    start() {
        if (this.running){
            return;
        }

        this.running = true;
        this.lastTime = performance.now();
        requestAnimationFrame((currentTime) => this.update(currentTime));
    }

    initialize() {
        this.resize();
        this.start();
        window.addEventListener('resize', () => this.resize());
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