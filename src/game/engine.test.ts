import test from "node:test";
import assert from "node:assert/strict";
import {
  BALLS,
  COURT,
  PLATFORMS,
  PLAYER_HALF_WIDTH,
  GIFT,
  STEP,
  createGame,
  startGame,
  pauseGame,
  resumeGame,
  openSurprise,
  stepGame,
} from "./engine.ts";
const idle = { left: false, right: false, jump: false };
const frames = (s: ReturnType<typeof createGame>, n: number, input = idle) => {
  for (let i = 0; i < n; i++) stepGame(s, input);
};
test("intro is still; movement is bounded and a jump lands", () => {
  const s = createGame();
  frames(s, 60, { ...idle, right: true });
  assert.equal(s.x, 1);
  startGame(s);
  frames(s, 30, { ...idle, right: true });
  assert.ok(s.x > 2);
  frames(s, 8, { ...idle, jump: true });
  assert.ok(s.y > 0);
  frames(s, 100);
  assert.equal(s.y, 0);
  assert.ok(s.grounded);
  frames(s, 300, { ...idle, left: true });
  assert.equal(s.x, 0.2);
});
test("platform blocks walking through its side and supports landings", () => {
  const s = createGame();
  startGame(s);
  frames(s, 180, { ...idle, right: true });
  assert.ok(s.x <= 5.1);
  assert.equal(s.y, 0);
  s.x = 7;
  s.y = 3;
  s.grounded = false;
  frames(s, 90);
  assert.equal(s.y, 0.65);
  assert.ok(s.grounded);
});
test("three pickups are unique and reveal requires all three", () => {
  const s = createGame();
  startGame(s);
  s.x = GIFT.x;
  frames(s, 50, { ...idle, jump: true });
  assert.equal(s.phase, "playing");
  BALLS.forEach((b) => {
    s.x = b.x;
    s.y = b.y - 1;
    s.vy = 0;
    stepGame(s, idle);
  });
  assert.equal(s.collected.filter(Boolean).length, 3);
  frames(s, 30);
  assert.equal(s.collected.filter(Boolean).length, 3);
  s.x = GIFT.x;
  s.y = 0;
  s.grounded = true;
  s.vy = 0;
  s.jumpHeld = false;
  frames(s, 35, { ...idle, jump: true });
  assert.equal(s.phase, "reveal");
  frames(s, 300);
  assert.equal(s.phase, "complete");
});
test("pause freezes movement and reveal; resume continues the same phase", () => {
  const s = createGame();
  startGame(s);
  frames(s, 20, { ...idle, right: true });
  pauseGame(s);
  const x = s.x;
  frames(s, 120);
  assert.equal(s.x, x);
  resumeGame(s);
  assert.equal(s.phase, "playing");
  openSurprise(s);
  frames(s, 30);
  pauseGame(s);
  const t = s.revealTime;
  frames(s, 300);
  assert.equal(s.revealTime, t);
  resumeGame(s);
  frames(s, 300);
  assert.equal(s.phase, "complete");
});
test("restart is a new run with no lingering reveal or pickups", () => {
  const previous = createGame();
  openSurprise(previous);
  frames(previous, 60);
  const next = createGame(previous.run + 1);
  frames(previous, 250);
  assert.equal(next.phase, "intro");
  assert.equal(next.revealTime, 0);
  assert.deepEqual(next.collected, [false, false, false]);
  assert.equal(next.run, 1);
});
test("jump buffering and edge grace tolerate slightly early or late presses", () => {
  const early = createGame();
  startGame(early);
  early.y = 0.08;
  early.vy = -2;
  early.grounded = false;
  early.coyote = 0;
  frames(early, 8, { ...idle, jump: true });
  assert.ok(early.vy > 0);
  const late = createGame();
  startGame(late);
  late.y = 0.8;
  late.grounded = false;
  late.coyote = 0.1;
  frames(late, 5, { ...idle, jump: true });
  assert.ok(late.vy > 0);
  assert.equal(STEP, 1 / 60);
});
const assertOutsideBlocks = (s: ReturnType<typeof createGame>) => {
  for (const p of PLATFORMS) {
    const intersects =
      s.y < p.height - 0.00001 &&
      s.x + PLAYER_HALF_WIDTH > p.x - p.width / 2 + 0.00001 &&
      s.x - PLAYER_HALF_WIDTH < p.x + p.width / 2 - 0.00001;
    assert.equal(
      intersects,
      false,
      `Body intersects block at ${p.x}: x=${s.x}, y=${s.y}`,
    );
  }
};
test("solid blocks reject sustained movement from either side", () => {
  for (const p of PLATFORMS)
    for (const side of [-1, 1]) {
      const s = createGame();
      startGame(s);
      s.x = p.x + side * 4;
      for (let i = 0; i < 360; i++) {
        stepGame(s, { ...idle, right: side < 0, left: side > 0 });
        assertOutsideBlocks(s);
      }
      assert.ok(
        Math.abs(s.x - p.x) >= p.width / 2 + PLAYER_HALF_WIDTH - 0.00001,
      );
    }
});
test("descending corners and overlapping starts cannot enter a block", () => {
  for (const p of PLATFORMS)
    for (const side of [-1, 1])
      for (const y of [0.1, p.height + 0.01]) {
        const s = createGame();
        startGame(s);
        s.x = p.x + side * (p.width / 2 + 0.25);
        s.y = y;
        s.vy = -2;
        s.grounded = false;
        for (let i = 0; i < 120; i++) {
          stepGame(s, { ...idle, right: side < 0, left: side > 0 });
          assertOutsideBlocks(s);
        }
      }
});
test("jumping and reversing against block edges never tunnels into them", () => {
  const s = createGame();
  startGame(s);
  s.x = 4.8;
  for (let i = 0; i < 600; i++) {
    const right = i % 200 < 140;
    stepGame(s, { right, left: !right, jump: i % 37 < 8 });
    assertOutsideBlocks(s);
  }
});
test("the second pickup is on a flat walkable tennis court", () => {
  const s = createGame();
  startGame(s);
  s.x = COURT.x - 4;
  for (let i = 0; i < 160; i++) {
    stepGame(s, { ...idle, right: true });
    assert.equal(s.y, 0);
    assertOutsideBlocks(s);
  }
  assert.ok(s.x > COURT.x + COURT.width / 2);
  assert.equal(s.collected[1], true);
});
test("the complete level is reachable using only ordinary movement and jumps", () => {
  const s = createGame();
  startGame(s);
  frames(s, 180, { ...idle, right: true });
  frames(s, 45, { ...idle, right: true, jump: true });
  frames(s, 45);
  assert.equal(s.collected[0], true);
  for (let i = 0; i < 300 && !s.collected[1]; i++)
    stepGame(s, { ...idle, right: true });
  assert.equal(s.collected[1], true);
  frames(s, 180, { ...idle, right: true });
  frames(s, 45, { ...idle, right: true, jump: true });
  frames(s, 45);
  assert.equal(s.collected[2], true);
  for (let i = 0; i < 300 && s.x < GIFT.x - 0.1; i++)
    stepGame(s, { ...idle, right: true });
  frames(s, 30);
  frames(s, 28, { ...idle, jump: true });
  assert.equal(s.phase, "reveal");
  frames(s, 300);
  assert.equal(s.phase, "complete");
});
