// — Audio playback management —
// Unlock audio on first click (autoplay policy) :contentReference[oaicite:7]{index=7}
const audioEl = document.getElementById('megalovania');
window.addEventListener('click', function unlock() {
  audioEl.play().then(() => audioEl.pause()).catch(() => {});
  window.removeEventListener('click', unlock);
}, { once: true });

let pauseTimeout;
const pauseDelay = 300; // milliseconds

function playOnBounce() {
  // Only start playback if it's currently paused :contentReference[oaicite:8]{index=8}
  if (audioEl.paused) {
    audioEl.play().catch(() => {});      // start playback :contentReference[oaicite:9]{index=9}
  }
  // Clear any pending pause, then schedule a new one :contentReference[oaicite:10]{index=10}
  clearTimeout(pauseTimeout);            // cancel prior timeout :contentReference[oaicite:11]{index=11}
  pauseTimeout = setTimeout(() => {
    audioEl.pause();                     // pause after delay :contentReference[oaicite:12]{index=12}
  }, pauseDelay);                        // 0.2s after final bounce :contentReference[oaicite:13]{index=13}
}

// — Canvas & physics setup —
const canvas = document.getElementById('canvas');
const ctx    = canvas.getContext('2d');
const info   = document.getElementById('info');
let W, H, cx, cy;
window.addEventListener('resize', resize);
function resize() {
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
  cx = W/2; cy = H/2;
}
resize();

// No gravity
const gravity = 0;

// Single closed circle
const ring = { R: 200 };

// Ball class
class Ball {
  constructor(color) {
    this.r = 8; this.color = color; this.reset();
  }
  reset() {
    this.x = cx; this.y = cy;
    const ang = Math.random() * 2 * Math.PI;
    const speed = 2 + Math.random() * 1.5;
    this.vx = Math.cos(ang) * speed;
    this.vy = Math.sin(ang) * speed;
    this.bounces = 0;
  }
  update() {
    // Previous distance from center :contentReference[oaicite:14]{index=14}
    const pdx = this.x - cx, pdy = this.y - cy;
    const prevDist = Math.hypot(pdx, pdy);

    // Move
    this.x += this.vx;
    this.y += this.vy;

    // New distance & angle
    const dx = this.x - cx, dy = this.y - cy;
    const dist = Math.hypot(dx, dy);
    const ang  = Math.atan2(dy, dx);

    const boundary = ring.R - this.r;
    // Detect outward crossing
    if (prevDist < boundary && dist >= boundary) {
      // Compute normal
      const nx = dx / dist, ny = dy / dist;
      // Snap back to boundary
      this.x = cx + nx * boundary;
      this.y = cy + ny * boundary;
      // Reflect velocity: v' = v - 2*(v·n)*n :contentReference[oaicite:15]{index=15}
      const dot = this.vx * nx + this.vy * ny;
      this.vx = (this.vx - 2 * dot * nx) * 1.02;
      this.vy = (this.vy - 2 * dot * ny) * 1.02;
      // Add slight random jitter so it doesn’t shuttle on one axis
      const jitter = (Math.random() - 0.5) * 0.2;
      const cos = Math.cos(jitter), sin = Math.sin(jitter);
      [this.vx, this.vy] = [
        this.vx * cos - this.vy * sin,
        this.vx * sin + this.vy * cos
      ];
      this.bounces++;
      playOnBounce();       // manage audio playback
      updateInfo();
    }
  }
  draw(ctx) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI);
    ctx.fillStyle = this.color;
    ctx.fill();
  }
}

const ball = new Ball('#bfe87f');

function updateInfo() {
  info.textContent = `Bounces: ${ball.bounces}`;
}

function drawRing() {
  ctx.strokeStyle = 'red'; ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(cx, cy, ring.R, 0, 2 * Math.PI);
  ctx.stroke();
}

function loop() {
  ctx.clearRect(0, 0, W, H);
  drawRing();
  ball.update();
  ball.draw(ctx);
  requestAnimationFrame(loop);
}

updateInfo();
loop();
