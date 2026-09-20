const POINTS = 96;
const TAU = Math.PI * 2;
function radial(lobes, base, amplitude, phase = 0) {
    return Array.from({ length: POINTS }, (_, index) => {
        const angle = (index / POINTS) * TAU;
        const radius = base + amplitude * Math.cos(lobes * angle + phase);
        return [
            Math.cos(angle) * radius,
            Math.sin(angle) * radius,
        ];
    });
}
function regularPolygon(sides, roundness = 0.12, phase = -Math.PI / 2) {
    const sector = TAU / sides;
    const apothem = Math.cos(Math.PI / sides);
    return Array.from({ length: POINTS }, (_, index) => {
        const angle = (index / POINTS) * TAU + phase;
        const local = ((((angle + Math.PI / sides) % sector) + sector) %
            sector) -
            Math.PI / sides;
        const sharpRadius = apothem / Math.cos(local);
        const radius = sharpRadius * (1 - roundness) + roundness;
        return [
            Math.cos(angle) * radius,
            Math.sin(angle) * radius,
        ];
    });
}
function superellipse(width, height, power, rotation = 0) {
    return Array.from({ length: POINTS }, (_, index) => {
        const angle = (index / POINTS) * TAU;
        const c = Math.cos(angle);
        const s = Math.sin(angle);
        const exponent = 2 / power;
        const x = Math.sign(c) * Math.pow(Math.abs(c), exponent) * width;
        const y = Math.sign(s) * Math.pow(Math.abs(s), exponent) * height;
        const cr = Math.cos(rotation);
        const sr = Math.sin(rotation);
        return [
            x * cr - y * sr,
            x * sr + y * cr,
        ];
    });
}
function ellipse(width, height, rotation) {
    const cr = Math.cos(rotation);
    const sr = Math.sin(rotation);
    return Array.from({ length: POINTS }, (_, index) => {
        const angle = (index / POINTS) * TAU;
        const x = Math.cos(angle) * width;
        const y = Math.sin(angle) * height;
        return [
            x * cr - y * sr,
            x * sr + y * cr,
        ];
    });
}
const SHAPES = [
    radial(10, 0.82, 0.18, Math.PI / 10),
    radial(9, 0.88, 0.12, -Math.PI / 2),
    regularPolygon(5, 0.2, -Math.PI / 2),
    superellipse(1, 0.56, 4),
    radial(8, 0.9, 0.1, Math.PI / 8),
    radial(4, 0.74, 0.26, Math.PI / 4),
    ellipse(1, 0.64, -Math.PI / 4),
];
function interpolate(from, to, progress) {
    return from.map((point, index) => {
        const target = to[index];
        return [
            point[0] + (target[0] - point[0]) * progress,
            point[1] + (target[1] - point[1]) * progress,
        ];
    });
}
function spring(progress) {
    const value = 1 -
        Math.exp(-6 * progress) *
            (Math.cos(10 * progress) +
                0.22 * Math.sin(10 * progress));
    return Math.max(0, Math.min(1, value));
}
function polygonPoints(points, rotation, scale) {
    const cr = Math.cos(rotation);
    const sr = Math.sin(rotation);
    const radius = 28 * scale;
    return points
        .map(([x, y]) => {
        const rx = x * cr - y * sr;
        const ry = x * sr + y * cr;
        return `${50 + rx * radius},${50 + ry * radius}`;
    })
        .join(" ");
}
class M3ELoadingIndicator extends HTMLElement {
    frame = 0;
    startedAt = 0;
    connectedCallback() {
        if (!this.shadowRoot) {
            const root = this.attachShadow({ mode: "open" });
            root.innerHTML = `
        <style>
          :host {
            display: grid;
            place-items: center;
            width: 48px;
            height: 48px;
            margin: 18px auto;
          }

          .container {
            display: grid;
            width: 48px;
            height: 48px;
            place-items: center;
            overflow: hidden;
            border-radius: 50%;
            background: transparent;
          }

          :host([variant="contained"]) .container {
            background:
              var(--m3-primary-container, #eaddff);
          }

          svg {
            display: block;
            width: 42px;
            height: 42px;
            overflow: visible;
          }

          polygon {
            fill: var(--m3-primary, #65558f);
          }

          :host([variant="contained"]) polygon {
            fill:
              var(--m3-on-primary-container, #21005d);
          }

          @media (prefers-reduced-motion: reduce) {
            svg {
              transform: none !important;
            }
          }
        </style>

        <span
          class="container"
          role="progressbar"
          aria-label="loading"
          aria-valuetext="loading"
        >
          <svg viewBox="0 0 100 100" aria-hidden="true">
            <polygon></polygon>
          </svg>
        </span>
      `;
        }
        this.startedAt = performance.now();
        this.tickFrame(this.startedAt);
    }
    disconnectedCallback() {
        cancelAnimationFrame(this.frame);
    }
    tickFrame = (now) => {
        const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
        const polygon = this.shadowRoot?.querySelector("polygon");
        if (!(polygon instanceof SVGPolygonElement)) {
            return;
        }
        if (reduced) {
            polygon.setAttribute("points", polygonPoints(SHAPES[2], 0, 0.88));
            return;
        }
        const elapsed = now - this.startedAt;
        const morphInterval = 650;
        const rotationDuration = 4666;
        const morphPosition = elapsed / morphInterval;
        const current = Math.floor(morphPosition) % SHAPES.length;
        const next = (current + 1) % SHAPES.length;
        const local = morphPosition - Math.floor(morphPosition);
        const eased = spring(local);
        const points = interpolate(SHAPES[current], SHAPES[next], eased);
        const globalRotation = ((elapsed % rotationDuration) / rotationDuration) * TAU;
        const morphRotation = ((current + eased) * Math.PI) / 2;
        const bounce = 0.88 +
            Math.sin(Math.PI * Math.min(1, local)) * 0.07;
        polygon.setAttribute("points", polygonPoints(points, globalRotation + morphRotation, bounce));
        this.frame = requestAnimationFrame(this.tickFrame);
    };
}
if (!customElements.get("m3e-loading-indicator")) {
    customElements.define("m3e-loading-indicator", M3ELoadingIndicator);
}
export {};
