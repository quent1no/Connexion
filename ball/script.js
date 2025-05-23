// ——————————————
// Audio playback management
// ——————————————
const audioEl    = document.getElementById('megalovania');
const pauseDelay = 200;              // ms per snippet
let pauseTimeout;

// Unlock audio on first click (autoplay policy)
window.addEventListener('click', function unlock() {
  audioEl.play().then(() => audioEl.pause()).catch(() => {});
  window.removeEventListener('click', unlock);
}, { once: true });

function handleBounceAudio(speed) {
  // playbackRate proportional to speed/20 (min 1×) :contentReference[oaicite:3]{index=3}
  audioEl.playbackRate = Math.max(speed / 50, 1);

  // if already playing, just reset the pause timer 
  if (!audioEl.paused) {
    clearTimeout(pauseTimeout);
    pauseTimeout = setTimeout(() => audioEl.pause(), pauseDelay);
    return;
  }

  // otherwise start playback for this bounce
  audioEl.play().catch(() => {});
  pauseTimeout = setTimeout(() => {
    audioEl.pause();
  }, pauseDelay);
}

// — Canvas & physics setup —
const canvas = document.getElementById('canvas');
const ctx    = canvas.getContext('2d');
const info   = document.getElementById('info');
const resetBtn = document.getElementById('resetButton');
let W, H, cx, cy;

function resize() {
  W = canvas.width  = window.innerWidth;
  H = canvas.height = window.innerHeight;
  cx = W/2; cy = H/2;
}
window.addEventListener('resize', resize);
resize();

// No gravity, one closed circle
const ring = { R: 200 };
// Speed caps
const MAX_SPEED = 250;
const MIN_SPEED = 20;

class Ball {
  constructor(color) {
    this.r = 8;
    this.color = color;
    this.reset();
  }

  reset() {
    this.x = cx;  this.y = cy;
    const ang   = Math.random() * Math.PI * 2;
    const speed = 5;
    this.vx     = Math.cos(ang) * speed;
    this.vy     = Math.sin(ang) * speed;
    this.bounces = 0;
  }

  update() {
    // record previous radius
    const pdx = this.x - cx, pdy = this.y - cy;
    const prevDist = Math.hypot(pdx, pdy);

    // move
    this.x += this.vx;
    this.y += this.vy;

    // current distance & angle
    const dx = this.x - cx, dy = this.y - cy;
    const dist = Math.hypot(dx, dy);

    const boundary = ring.R - this.r;
    // detect outward crossing 
    if (prevDist < boundary && dist >= boundary) {
      // compute normal
      const nx = dx / dist, ny = dy / dist;
      // snap back to surface
      this.x = cx + nx * boundary;
      this.y = cy + ny * boundary;

      // reflect: v' = v - 2(v·n)n
      const dot = this.vx * nx + this.vy * ny;

      // choose boost multiplier by speed zone
      let speed = Math.hypot(this.vx, this.vy);
      let m = 1.01;
      if (speed > 200)      m = 1.001;
      else if (speed > 150) m = 1.002;
      else if (speed > 100) m = 1.003;
      else if (speed > 50)  m = 1.005;

      // apply reflection + boost
      this.vx = (this.vx - 2 * dot * nx) * m;
      this.vy = (this.vy - 2 * dot * ny) * m;

      // jitter so it doesn’t ping-pong 
      const jitter = (Math.random() - 0.5) * 0.2;
      const cosJ = Math.cos(jitter), sinJ = Math.sin(jitter);
      [this.vx, this.vy] = [
        this.vx * cosJ - this.vy * sinJ,
        this.vx * sinJ + this.vy * cosJ
      ];

      // enforce cap at ≥ MAX_SPEED → reset to MIN_SPEED
      speed = Math.hypot(this.vx, this.vy);
      if (speed >= MAX_SPEED) {
        const scale = MIN_SPEED / speed;
        this.vx *= scale;
        this.vy *= scale;
        speed = MIN_SPEED;
      }

      this.bounces++;
      handleBounceAudio(speed);
      updateInfo();
    }
  }

  draw(ctx) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
  }
}

const ball = new Ball('#bfe87f');

function updateInfo() {
  info.textContent = `Bounces: ${ball.bounces}`;
}

function drawRing() {
  ctx.strokeStyle = 'red';
  ctx.lineWidth   = 4;
  ctx.beginPath();
  ctx.arc(cx, cy, ring.R, 0, Math.PI * 2);
  ctx.stroke();
}

function drawSpeed() {
  const speed = Math.hypot(ball.vx, ball.vy);
  ctx.font        = '18px sans-serif';
  ctx.fillStyle   = 'white';
  ctx.textAlign   = 'right';
  ctx.fillText(
    `Speed: ${speed.toFixed(2)}`,
    cx - ring.R - 10,
    cy
  );
}

// Reset button handler: reposition ball & reset audio
resetBtn.addEventListener('click', () => {
  ball.reset();
  updateInfo();
  // reset audio state
  clearTimeout(pauseTimeout);
  audioEl.pause();
  audioEl.currentTime = 0;           // rewind :contentReference[oaicite:7]{index=7}
  audioEl.playbackRate = 1.0;        // normal speed :contentReference[oaicite:8]{index=8}
});

function loop() {
  ctx.clearRect(0, 0, W, H);
  drawRing();
  ball.update();
  ball.draw(ctx);
  drawSpeed();
  requestAnimationFrame(loop);
}

updateInfo();
loop();
