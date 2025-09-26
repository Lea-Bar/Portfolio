import { Renderer, Program, Mesh, Color, Triangle } from 'https://cdn.skypack.dev/ogl';

export class BackgroundService {
    constructor(container, {color = [0.5, 0.5, 0.5], speed = 1.0, amplitude = 0.1} = {}) {
        this.container = container;
        this.color = color;
        this.speed = speed;
        this.amplitude = amplitude;
        this.mousePos = { x: 0.5, y: 0.5 };

        this.renderer = new Renderer();
        this.gl = this.renderer.gl;
    }

    load() {
        const vertex = `
            attribute vec2 uv;
            attribute vec2 position;
            varying vec2 vUv;
            void main() {
                vUv = uv;
                gl_Position = vec4(position, 0, 1);
            }
        `;

        const fragment = `
            precision highp float;
            uniform float uTime;
            uniform vec3 uColor;
            uniform vec3 uResolution;
            uniform vec2 uMouse;
            uniform float uAmplitude;
            uniform float uSpeed;
            varying vec2 vUv;
            void main() {
                float mr = min(uResolution.x, uResolution.y);
                vec2 uv = (vUv.xy * 2.0 - 1.0) * uResolution.xy / mr;
                uv += (uMouse - vec2(0.5)) * uAmplitude;
                float d = -uTime * 0.5 * uSpeed;
                float a = 0.0;
                for (float i = 0.0; i < 8.0; ++i) {
                    a += cos(i - d - a * uv.x);
                    d += sin(uv.y * i + a);
                }
                d += uTime * 0.5 * uSpeed;
                vec3 col = vec3(cos(uv * vec2(d, a)) * 0.6 + 0.4, cos(a + d) * 0.5 + 0.5);
                col = cos(col * cos(vec3(d, a, 2.5)) * 0.5 + 0.5) * uColor;
                gl_FragColor = vec4(col, 1.0);
            }
        `;

        this.gl.clearColor(1, 1, 1, 1);

        const geometry = new Triangle(this.gl);
        this.program = new Program(this.gl, {
            vertex,
            fragment,
            uniforms: {
                uTime: { value: 0 },
                uColor: { value: new Color(...this.color) },
                uResolution: {
                    value: new Color(this.gl.canvas.width, this.gl.canvas.height, this.gl.canvas.width / this.gl.canvas.height)
                },
                uMouse: { value: new Float32Array([this.mousePos.x, this.mousePos.y]) },
                uAmplitude: { value: this.amplitude },
                uSpeed: { value: this.speed }
            }
        });

        this.mesh = new Mesh(this.gl, { geometry, program: this.program });
        this.container.appendChild(this.gl.canvas);

        const resize = () => {
            this.renderer.setSize(this.container.offsetWidth, this.container.offsetHeight);
            this.program.uniforms.uResolution.value = new Color(
                this.gl.canvas.width,
                this.gl.canvas.height,
                this.gl.canvas.width / this.gl.canvas.height
            );
        };

        window.addEventListener("resize", resize);
        resize();

        const update = (t) => {
            this.program.uniforms.uTime.value = t * 0.001;
            this.renderer.render({ scene: this.mesh });
            requestAnimationFrame(update);
        };

        requestAnimationFrame(update);
    }
}
