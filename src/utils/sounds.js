/**
 * Sound effects using Web Audio API — no external files needed.
 */

let audioCtx = null;

function getCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === "suspended") audioCtx.resume();
  return audioCtx;
}

/* ── helpers ── */
function playTone(freq, duration, type = "sine", gain = 0.3) {
  const ctx = getCtx();
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  g.gain.setValueAtTime(gain, ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  osc.connect(g).connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + duration);
}

function playNotes(notes, type = "sine", gain = 0.25) {
  notes.forEach(([freq, time, dur]) => {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    g.gain.setValueAtTime(gain, ctx.currentTime + time);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + time + dur);
    osc.connect(g).connect(ctx.destination);
    osc.start(ctx.currentTime + time);
    osc.stop(ctx.currentTime + time + dur);
  });
}

/* ═══════════════════════════════════════════════
   Public sound effects
   ═══════════════════════════════════════════════ */

/** Happy ascending jingle — correct answer */
export function playCorrect() {
  playNotes([
    [523, 0, 0.15],    // C5
    [659, 0.12, 0.15], // E5
    [784, 0.24, 0.25], // G5
    [1047, 0.4, 0.35], // C6
  ], "sine", 0.22);
}

/** Descending sad tone — wrong answer */
export function playWrong() {
  playNotes([
    [400, 0, 0.2],
    [320, 0.18, 0.3],
  ], "triangle", 0.2);
}

/** Soft click — button press / navigation */
export function playClick() {
  playTone(800, 0.08, "sine", 0.15);
}

/** Whoosh-like transition — page navigation */
export function playSwipe() {
  const ctx = getCtx();
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(600, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.15);
  g.gain.setValueAtTime(0.1, ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
  osc.connect(g).connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.2);
}

/** Star earned — short sparkle */
export function playStar() {
  playNotes([
    [880, 0, 0.1],
    [1100, 0.08, 0.1],
    [1320, 0.16, 0.15],
  ], "sine", 0.18);
}

/** Celebration fanfare — completion screen */
export function playCelebration() {
  playNotes([
    [523, 0, 0.2],     // C5
    [523, 0.15, 0.1],  // C5
    [523, 0.25, 0.1],  // C5
    [659, 0.38, 0.15], // E5
    [784, 0.55, 0.2],  // G5
    [1047, 0.75, 0.4], // C6
    [784, 0.95, 0.15], // G5
    [1047, 1.1, 0.5],  // C6
  ], "sine", 0.2);
}

/** Game start — upbeat intro */
export function playStart() {
  playNotes([
    [392, 0, 0.15],    // G4
    [523, 0.13, 0.15], // C5
    [659, 0.26, 0.15], // E5
    [784, 0.4, 0.3],   // G5
  ], "square", 0.12);
}

/** Drop item — for drag-and-drop activities */
export function playDrop() {
  playTone(500, 0.1, "triangle", 0.18);
}

/** Select / toggle — for options */
export function playSelect() {
  playTone(660, 0.1, "sine", 0.15);
}

/** Streak milestone — ascending power-up */
export function playStreak(level = 1) {
  const base = 600 + level * 100;
  playNotes([
    [base, 0, 0.08],
    [base * 1.25, 0.06, 0.08],
    [base * 1.5, 0.12, 0.12],
  ], "square", 0.15);
}

/** Combo achieved — power chord */
export function playCombo() {
  playNotes([
    [440, 0, 0.1],
    [554, 0, 0.1],
    [659, 0, 0.1],
    [880, 0.1, 0.2],
  ], "sine", 0.15);
}

/** Message sent — chat bubble pop */
export function playSend() {
  playTone(900, 0.06, "sine", 0.18);
}

/** Stamp sound — for fact checker */
export function playStamp() {
  playTone(200, 0.12, "triangle", 0.25);
}

/** Scroll reveal — magical discovery */
export function playReveal() {
  playNotes([
    [600, 0, 0.1],
    [800, 0.08, 0.1],
    [1000, 0.16, 0.15],
    [1200, 0.26, 0.2],
  ], "sine", 0.15);
}
