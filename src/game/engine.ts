export type Phase = "intro" | "playing" | "paused" | "reveal" | "complete";
export type Input = { left: boolean; right: boolean; jump: boolean };
export type Platform = { x: number; width: number; height: number };
export const PLATFORMS: Platform[] = [
  { x: 7, width: 3.4, height: 0.65 },
  { x: 25, width: 3.4, height: 0.65 },
];
export const COURT = { x: 16, z: -0.4, width: 6.6, depth: 4.2 };
export const BALLS = [
  { x: PLATFORMS[0].x, y: PLATFORMS[0].height + 1.45 },
  { x: COURT.x, y: 1.45 },
  { x: PLATFORMS[1].x, y: PLATFORMS[1].height + 1.45 },
];
export const PLAYER_HALF_WIDTH = 0.38;
const FOOT_HALF_WIDTH = 0.2;
const CONTACT_EPSILON = 0.00001;
export const REVEAL = { riseEnd: 0.7, flipEnd: 1.4, openEnd: 1.9, end: 4.6 };
export const GIFT = { x: 33, bottom: 3.15 };
export const STEP = 1 / 60;
export const EMPTY_INPUT: Input = { left: false, right: false, jump: false };
export type GameState = {
  phase: Phase;
  resumePhase: "playing" | "reveal";
  x: number;
  y: number;
  vx: number;
  vy: number;
  grounded: boolean;
  facing: number;
  collected: boolean[];
  coyote: number;
  buffer: number;
  jumpHeld: boolean;
  anticipation: number;
  landing: number;
  elapsed: number;
  revealTime: number;
  run: number;
};
export function createGame(run = 0): GameState {
  return {
    phase: "intro",
    resumePhase: "playing",
    x: 1,
    y: 0,
    vx: 0,
    vy: 0,
    grounded: true,
    facing: 1,
    collected: [false, false, false],
    coyote: 0.1,
    buffer: 0,
    jumpHeld: false,
    anticipation: 0,
    landing: 0,
    elapsed: 0,
    revealTime: 0,
    run,
  };
}
export function startGame(s: GameState) {
  if (s.phase === "intro") s.phase = "playing";
}
export function pauseGame(s: GameState) {
  if (s.phase === "playing" || s.phase === "reveal") {
    s.resumePhase = s.phase;
    s.phase = "paused";
    s.jumpHeld = false;
    s.buffer = 0;
  }
}
export function resumeGame(s: GameState) {
  if (s.phase === "paused") s.phase = s.resumePhase;
}
export function openSurprise(s: GameState) {
  s.phase = "reveal";
  s.revealTime = 0;
  s.x = GIFT.x;
  s.y = 0;
  s.vx = 0;
  s.vy = 0;
  s.grounded = true;
  s.collected = [true, true, true];
}
export function stepGame(s: GameState, input: Input, dt = STEP) {
  if (s.phase !== "playing" && s.phase !== "reveal") return;
  s.elapsed += dt;
  s.landing = Math.max(0, s.landing - dt);
  if (s.phase === "reveal") {
    s.revealTime += dt;
    // Let the final leap land while the envelope opens.
    if (s.y > 0) {
      s.vy -= 19 * dt;
      s.y = Math.max(0, s.y + s.vy * dt);
    }
    if (s.y === 0) {
      s.vy = 0;
      s.grounded = true;
    }
    if (s.revealTime >= REVEAL.end) s.phase = "complete";
    return;
  }
  const direction = Number(input.right) - Number(input.left);
  s.vx += (direction * 3.6 - s.vx) * Math.min(1, dt * 14);
  if (direction) s.facing = direction;
  s.coyote = s.grounded ? 0.12 : Math.max(0, s.coyote - dt);
  s.buffer = input.jump && !s.jumpHeld ? 0.14 : Math.max(0, s.buffer - dt);
  s.jumpHeld = input.jump;
  if (s.buffer > 0 && s.coyote > 0 && s.anticipation <= 0) {
    s.anticipation = 0.065;
    s.buffer = 0;
  }
  if (s.anticipation > 0) {
    s.anticipation -= dt;
    if (s.anticipation <= 0) {
      s.vy = 8.8;
      s.grounded = false;
      s.coyote = 0;
    }
  }
  const oldY = s.y;
  const oldX = s.x;
  s.x = Math.max(0.2, Math.min(35, s.x + s.vx * dt));
  s.vy -= 19 * dt;
  s.y += s.vy * dt;
  // Sweep the full body against side walls; checking only the destination
  // misses corners when a jump starts or ends at the edge of a platform.
  for (const p of PLATFORMS) {
    const left = p.x - p.width / 2 - PLAYER_HALF_WIDTH;
    const right = p.x + p.width / 2 + PLAYER_HALF_WIDTH;
    const dx = s.x - oldX;
    const crossingRight =
      dx > 0 && oldX <= left + CONTACT_EPSILON && s.x > left;
    const crossingLeft =
      dx < 0 && oldX >= right - CONTACT_EPSILON && s.x < right;
    if (crossingRight || crossingLeft) {
      const edge = crossingRight ? left : right;
      const impact = Math.max(0, Math.min(1, (edge - oldX) / dx));
      const feetAtImpact = oldY + (s.y - oldY) * impact;
      if (feetAtImpact < p.height - CONTACT_EPSILON) {
        s.x = edge;
        s.vx = 0;
      }
    }
  }
  let floor = 0;
  for (const p of PLATFORMS) {
    const supported = Math.abs(s.x - p.x) < p.width / 2 + FOOT_HALF_WIDTH;
    if (
      supported &&
      oldY >= p.height - CONTACT_EPSILON &&
      s.y <= p.height &&
      s.vy <= 0
    ) {
      floor = Math.max(floor, p.height);
    }
  }
  if (s.y <= floor && s.vy <= 0) {
    if (!s.grounded) s.landing = 0.16;
    s.y = floor;
    s.vy = 0;
    s.grounded = true;
  } else s.grounded = false;
  // Resolve any overlap from a descending corner or an already-overlapping
  // position. Never leave a frame with the character inside a solid block.
  for (const p of PLATFORMS) {
    const left = p.x - p.width / 2 - PLAYER_HALF_WIDTH;
    const right = p.x + p.width / 2 + PLAYER_HALF_WIDTH;
    if (
      s.y < p.height - CONTACT_EPSILON &&
      s.x > left + CONTACT_EPSILON &&
      s.x < right - CONTACT_EPSILON
    ) {
      s.x = s.x < p.x ? left : right;
      s.vx = 0;
    }
  }
  BALLS.forEach((b, i) => {
    if (
      !s.collected[i] &&
      Math.abs(s.x - b.x) < 0.7 &&
      Math.abs(s.y + 1 - b.y) < 1
    )
      s.collected[i] = true;
  });
  if (
    s.collected.every(Boolean) &&
    s.vy > 0 &&
    Math.abs(s.x - GIFT.x) < 0.7 &&
    oldY + 1.65 < GIFT.bottom &&
    s.y + 1.65 >= GIFT.bottom
  ) {
    s.phase = "reveal";
    s.revealTime = 0;
    s.vx = 0;
    s.vy = 0;
  }
}
