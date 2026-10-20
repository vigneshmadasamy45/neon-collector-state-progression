(() => {
  "use strict";

  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");
  const scoreEl = document.getElementById("score");
  const timerEl = document.getElementById("timer");
  const progressEl = document.getElementById("progress");
  const progressLabel = document.getElementById("progress-label");
  const overlay = document.getElementById("overlay");
  const overlayIcon = document.getElementById("overlay-icon");
  const overlayKicker = document.getElementById("overlay-kicker");
  const overlayTitle = document.getElementById("overlay-title");
  const overlayMessage = document.getElementById("overlay-message");
  const mainButton = document.getElementById("main-button");
  const pauseChip = document.getElementById("pause-chip");
  const statusText = document.getElementById("status-text");
  const bestScoreSidebar = document.getElementById("best-score-sidebar");
  const difficultyLabel = document.getElementById("difficulty-label");

  const W = canvas.width;
  const H = canvas.height;
  const TARGET = 10;
  const ROUND_SECONDS = 30;
  const STORAGE_KEY = "neonCollector.bestScore.v1";
  const ALLOWED_TRANSITIONS = {
    ready: ["playing"],
    playing: ["paused", "won", "lost"],
    paused: ["playing", "ready"],
    won: ["playing", "ready"],
    lost: ["playing", "ready"]
  };
  const keys = new Set();

  let state = "ready";
  let score = 0;
  let bestScore = loadBestScore();
  let timeLeft = ROUND_SECONDS;
  let lastTime = 0;
  let elapsed = 0;
  let orb = { x: W * 0.72, y: H * 0.45, r: 10 };
  let player = { x: W * 0.2, y: H * 0.5, r: 13, speed: 235 };
  let hazards = [];
  let particles = [];
  let floatingTexts = [];
  let touchVector = { x: 0, y: 0 };
  let lastHazardHit = 0;
  let lastButtonAction = 0;

  function loadBestScore() {
    try {
      const value = Number.parseInt(localStorage.getItem(STORAGE_KEY) || "0", 10);
      return Number.isFinite(value) && value >= 0 ? Math.min(value, TARGET) : 0;
    } catch (error) {
      // Private browsing or blocked storage should not prevent the game from running.
      return 0;
    }
  }

  function saveBestScore(value) {
    try {
      localStorage.setItem(STORAGE_KEY, String(value));
    } catch (error) {
      // The current round remains playable if storage is unavailable.
    }
  }

  function transition(nextState) {
    if (nextState === state) return true;
    const allowed = ALLOWED_TRANSITIONS[state] || [];
    if (!allowed.includes(nextState)) {
      statusText.textContent = `INVALID TRANSITION BLOCKED`;
      return false;
    }
    state = nextState;
    return true;
  }

  function random(min, max) { return Math.random() * (max - min) + min; }
  function distance(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }
  function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }

  function safePosition(minDistance = 95) {
    let point;
    let tries = 0;
    do {
      point = { x: random(40, W - 40), y: random(40, H - 40) };
      tries++;
    } while (tries < 100 && (distance(point, player) < minDistance || hazards.some(h => distance(point, h) < minDistance)));
    return point;
  }

  function spawnOrb() {
    const point = safePosition(105);
    orb = { ...point, r: 10, pulse: 0 };
  }

  function resetGame() {
    score = 0;
    timeLeft = ROUND_SECONDS;
    elapsed = 0;
    lastHazardHit = 0;
    player = { x: W * 0.2, y: H * 0.5, r: 13, speed: 235 };
    hazards = [
      { x: W * 0.45, y: H * 0.3, r: 15, vx: 75, vy: 65 },
      { x: W * 0.72, y: H * 0.68, r: 17, vx: -65, vy: 82 },
      { x: W * 0.56, y: H * 0.78, r: 12, vx: 95, vy: -58 }
    ];
    particles = [];
    floatingTexts = [];
    touchVector = { x: 0, y: 0 };
    keys.clear();
    spawnOrb();
    updateHUD();
  }

  function applyDifficulty() {
    // At 5 collected orbs, hazards become 35% faster for the rest of the round.
    const multiplier = score >= 5 ? 1.35 : 1;
    hazards.forEach(h => {
      const speed = Math.hypot(h.baseVx ?? h.vx, h.baseVy ?? h.vy);
      if (h.baseVx === undefined) { h.baseVx = h.vx; h.baseVy = h.vy; }
      const desired = Math.hypot(h.baseVx, h.baseVy) * multiplier;
      const base = Math.hypot(h.baseVx, h.baseVy) || 1;
      h.vx = h.baseVx * desired / base;
      h.vy = h.baseVy * desired / base;
    });
    if (difficultyLabel) difficultyLabel.textContent = score >= 5 ? "INTENSE" : "STANDARD";
  }

  function updateHUD() {
    scoreEl.textContent = String(score).padStart(2, "0");
    timerEl.innerHTML = `${Math.max(0, timeLeft).toFixed(1)}<span class="seconds">s</span>`;
    progressEl.style.width = `${Math.min(100, score / TARGET * 100)}%`;
    progressLabel.textContent = `${Math.round(score / TARGET * 100)}% CHARGED`;
    timerEl.style.color = timeLeft <= 8 ? "#ff536d" : "";
    if (bestScoreSidebar) bestScoreSidebar.textContent = String(bestScore).padStart(2, "0");
  }

  function showOverlay({ icon, kicker, title, message, button }) {
    overlayIcon.textContent = icon;
    overlayKicker.textContent = kicker;
    overlayTitle.textContent = title;
    overlayMessage.textContent = message;
    mainButton.innerHTML = `${button} <span>↗</span>`;
    overlay.classList.remove("hidden");
  }

  function startGame() {
    // Ignore rapid repeated clicks in the same short interval.
    const now = performance.now();
    if (now - lastButtonAction < 180) return;
    lastButtonAction = now;
    if (state === "playing") return;
    if (state === "paused") {
      resumeGame();
      return;
    }
    if (!["ready", "won", "lost"].includes(state)) return;
    if (!transition("playing")) return;
    resetGame();
    overlay.classList.add("hidden");
    pauseChip.hidden = true;
    statusText.textContent = "MISSION ACTIVE";
    lastTime = performance.now();
  }

  function pauseGame() {
    if (state !== "playing") return;
    if (!transition("paused")) return;
    pauseChip.hidden = false;
    statusText.textContent = "MISSION PAUSED";
    showOverlay({ icon: "Ⅱ", kicker: "TAKE A BREATHER", title: "Paused", message: "The arena is on hold. Resume when you are ready.", button: "Resume mission" });
  }

  function resumeGame() {
    if (state !== "paused" || !transition("playing")) return;
    pauseChip.hidden = true;
    overlay.classList.add("hidden");
    statusText.textContent = "MISSION ACTIVE";
    lastTime = performance.now();
  }

  function endGame(won) {
    if (state !== "playing") return;
    const nextState = won ? "won" : "lost";
    if (!transition(nextState)) return;
    pauseChip.hidden = true;
    if (score > bestScore) {
      bestScore = score;
      saveBestScore(bestScore);
    }
    updateHUD();
    statusText.textContent = won ? "MISSION COMPLETE" : "MISSION FAILED";
    showOverlay({
      icon: won ? "✦" : "↻",
      kicker: won ? "ENERGY RESTORED" : "TIME EXPIRED",
      title: won ? "You lit up the dark." : "Run ended.",
      message: won
        ? `Outstanding run. You collected all ${TARGET} energy orbs with ${timeLeft.toFixed(1)} seconds remaining. Best score: ${bestScore}.`
        : `You collected ${score} of ${TARGET} orbs. Best score: ${bestScore}. Keep moving and try another run.`,
      button: "Play again"
    });
  }

  function burst(x, y, color, count = 15) {
    for (let i = 0; i < count; i++) {
      const angle = random(0, Math.PI * 2);
      const speed = random(35, 155);
      particles.push({
        x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
        life: random(.3, .7), maxLife: .7, size: random(2, 4), color
      });
    }
  }

  function addText(x, y, text, color) {
    floatingTexts.push({ x, y, text, color, life: .8 });
  }

  function update(dt) {
    elapsed += dt;
    timeLeft -= dt;
    if (timeLeft <= 0) {
      timeLeft = 0;
      updateHUD();
      endGame(false);
      return;
    }

    let dx = 0, dy = 0;
    if (keys.has("ArrowLeft") || keys.has("a") || keys.has("A")) dx -= 1;
    if (keys.has("ArrowRight") || keys.has("d") || keys.has("D")) dx += 1;
    if (keys.has("ArrowUp") || keys.has("w") || keys.has("W")) dy -= 1;
    if (keys.has("ArrowDown") || keys.has("s") || keys.has("S")) dy += 1;
    dx += touchVector.x;
    dy += touchVector.y;
    const magnitude = Math.hypot(dx, dy);
    if (magnitude > 0) {
      dx /= magnitude;
      dy /= magnitude;
      player.x += dx * player.speed * dt;
      player.y += dy * player.speed * dt;
    }
    player.x = clamp(player.x, player.r + 5, W - player.r - 5);
    player.y = clamp(player.y, player.r + 5, H - player.r - 5);

    hazards.forEach(h => {
      h.x += h.vx * dt;
      h.y += h.vy * dt;
      if (h.x < h.r + 8 || h.x > W - h.r - 8) h.vx *= -1;
      if (h.y < h.r + 8 || h.y > H - h.r - 8) h.vy *= -1;
      h.x = clamp(h.x, h.r + 8, W - h.r - 8);
      h.y = clamp(h.y, h.r + 8, H - h.r - 8);
    });

    if (distance(player, orb) < player.r + orb.r + 2) {
      score++;
      burst(orb.x, orb.y, "#5df4ff", 20);
      addText(orb.x, orb.y - 15, "+1 ENERGY", "#5df4ff");
      applyDifficulty();
      if (score > bestScore) {
        bestScore = score;
        saveBestScore(bestScore);
      }
      if (score >= TARGET) {
        updateHUD();
        endGame(true);
        return;
      }
      spawnOrb();
    }

    hazards.forEach(h => {
      if (distance(player, h) < player.r + h.r && elapsed - lastHazardHit > 1.05) {
        lastHazardHit = elapsed;
        timeLeft = Math.max(0, timeLeft - 2);
        burst(player.x, player.y, "#ff536d", 17);
        addText(player.x, player.y - 18, "−2 SEC", "#ff536d");
        player.x = W * .2;
        player.y = H * .5;
        statusText.textContent = "HAZARD HIT · −2 SEC";
      }
    });

    particles.forEach(p => {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vx *= .985;
      p.vy *= .985;
      p.life -= dt;
    });
    particles = particles.filter(p => p.life > 0);
    floatingTexts.forEach(t => { t.y -= 24 * dt; t.life -= dt; });
    floatingTexts = floatingTexts.filter(t => t.life > 0);
    updateHUD();
  }

  function drawBackground() {
    ctx.clearRect(0, 0, W, H);
    const gradient = ctx.createRadialGradient(W * .5, H * .45, 15, W * .5, H * .45, W * .72);
    gradient.addColorStop(0, "#111a36");
    gradient.addColorStop(1, "#080d1e");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, W, H);
    ctx.save();
    ctx.strokeStyle = "rgba(110, 145, 220, .09)";
    ctx.lineWidth = 1;
    const grid = 32;
    for (let x = 0; x <= W; x += grid) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    for (let y = 0; y <= H; y += grid) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
    ctx.restore();
    for (let i = 0; i < 38; i++) {
      const x = (i * 137 + 19) % W, y = (i * 79 + 31) % H;
      ctx.fillStyle = `rgba(173, 195, 255, ${.12 + (i % 4) * .06})`;
      ctx.fillRect(x, y, 2, 2);
    }
    ctx.strokeStyle = "rgba(93, 244, 255, .24)";
    ctx.lineWidth = 2;
    ctx.strokeRect(8, 8, W - 16, H - 16);
  }

  function glowCircle(x, y, radius, color, glow = 18) {
    ctx.save(); ctx.shadowBlur = glow; ctx.shadowColor = color; ctx.fillStyle = color;
    ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI * 2); ctx.fill(); ctx.restore();
  }

  function drawOrb() {
    const pulse = 1 + Math.sin(elapsed * 6) * .12;
    ctx.save(); ctx.translate(orb.x, orb.y); ctx.rotate(elapsed * .8);
    ctx.shadowBlur = 25; ctx.shadowColor = "#5df4ff"; ctx.strokeStyle = "rgba(93, 244, 255, .8)"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, -orb.r * 1.5 * pulse); ctx.lineTo(orb.r * 1.15 * pulse, 0);
    ctx.lineTo(0, orb.r * 1.5 * pulse); ctx.lineTo(-orb.r * 1.15 * pulse, 0); ctx.closePath(); ctx.stroke();
    ctx.fillStyle = "#b9fcff"; ctx.beginPath(); ctx.arc(0, 0, orb.r * .58 * pulse, 0, Math.PI * 2); ctx.fill(); ctx.restore();
  }

  function drawPlayer() {
    ctx.save(); ctx.translate(player.x, player.y); ctx.shadowBlur = 25; ctx.shadowColor = "#a18aff"; ctx.fillStyle = "#a18aff";
    ctx.beginPath(); ctx.arc(0, 0, player.r, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0; ctx.fillStyle = "#f8f6ff";
    ctx.beginPath(); ctx.arc(-3, -3, 4, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = "rgba(219, 211, 255, .8)"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(0, 0, player.r + 5 + Math.sin(elapsed * 7) * 1.5, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
  }

  function drawHazards() {
    hazards.forEach((h, i) => {
      ctx.save(); ctx.translate(h.x, h.y); ctx.rotate(elapsed * (i % 2 ? -1.2 : 1.2));
      ctx.shadowBlur = 20; ctx.shadowColor = "#ff536d"; ctx.fillStyle = "rgba(255, 83, 109, .18)"; ctx.strokeStyle = "#ff536d"; ctx.lineWidth = 2;
      ctx.beginPath();
      for (let p = 0; p < 8; p++) {
        const a = p * Math.PI / 4, r = p % 2 === 0 ? h.r + 3 : h.r - 4;
        const x = Math.cos(a) * r, y = Math.sin(a) * r;
        if (p === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore();
    });
  }

  function drawEffects() {
    particles.forEach(p => { ctx.globalAlpha = Math.max(0, p.life / p.maxLife); glowCircle(p.x, p.y, p.size, p.color, 10); });
    ctx.globalAlpha = 1;
    floatingTexts.forEach(t => {
      ctx.globalAlpha = Math.min(1, t.life * 2); ctx.fillStyle = t.color; ctx.font = "bold 13px monospace"; ctx.textAlign = "center";
      ctx.shadowBlur = 10; ctx.shadowColor = t.color; ctx.fillText(t.text, t.x, t.y); ctx.shadowBlur = 0;
    });
    ctx.globalAlpha = 1;
  }

  function draw() {
    drawBackground(); drawOrb(); drawHazards(); drawPlayer(); drawEffects();
  }

  function loop(now) {
    const dt = Math.min((now - (lastTime || now)) / 1000, .035);
    if (state === "playing") {
      lastTime = now;
      update(dt);
    } else {
      lastTime = now;
      elapsed += dt * .4;
    }
    draw();
    requestAnimationFrame(loop);
  }

  mainButton.addEventListener("click", () => {
    if (state === "paused") resumeGame();
    else startGame();
  });

  window.addEventListener("keydown", event => {
    const key = event.key;
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(key)) event.preventDefault();
    keys.add(key);
    if (key === " " || key.toLowerCase() === "p") {
      if (state === "playing") pauseGame();
      else if (state === "paused") resumeGame();
    }
    if (key === "Enter" && ["ready", "won", "lost"].includes(state)) startGame();
  });
  window.addEventListener("keyup", event => keys.delete(event.key));
  window.addEventListener("blur", () => {
    keys.clear();
    if (state === "playing") pauseGame();
  });

  let touchStart = null;
  canvas.addEventListener("touchstart", event => {
    if (state !== "playing") return;
    const touch = event.changedTouches[0];
    touchStart = { x: touch.clientX, y: touch.clientY };
  }, { passive: true });
  canvas.addEventListener("touchmove", event => {
    if (!touchStart || state !== "playing") return;
    const touch = event.changedTouches[0], rect = canvas.getBoundingClientRect();
    const scaleX = W / rect.width, scaleY = H / rect.height;
    const dx = (touch.clientX - touchStart.x) * scaleX, dy = (touch.clientY - touchStart.y) * scaleY;
    const mag = Math.hypot(dx, dy) || 1;
    touchVector = { x: dx / mag, y: dy / mag };
  }, { passive: true });
  canvas.addEventListener("touchend", () => { touchStart = null; touchVector = { x: 0, y: 0 }; }, { passive: true });
  canvas.addEventListener("touchcancel", () => { touchStart = null; touchVector = { x: 0, y: 0 }; }, { passive: true });

  resetGame();
  updateHUD();
  showOverlay({ icon: "✦", kicker: "READY PLAYER ONE", title: "Enter the arena", message: "Collect 10 energy orbs before time runs out. Avoid the red hazards. Your best score is saved on this device.", button: "Start mission" });
  requestAnimationFrame(loop);
})();
