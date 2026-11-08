import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
} from "react";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowUpRight,
  Check,
  Heart,
  MoveRight,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useAdventure } from "./hooks/useAdventure";
import type { Input } from "./game/engine";
const World = lazy(() => import("./scene/World"));

function BallIcon({ collected = false }: { collected?: boolean }) {
  return (
    <span
      className={`ball-icon ${collected ? "collected" : ""}`}
      aria-hidden="true"
    >
      {collected ? (
        <Check size={13} strokeWidth={2.5} />
      ) : (
        <>
          <i />
          <i />
        </>
      )}
    </span>
  );
}
function GoogleWord() {
  return (
    <span className="google-word" aria-label="Google">
      {"Google".split("").map((c, i) => (
        <span
          key={i}
          style={{
            color: [
              "#4285f4",
              "#ea4335",
              "#dba400",
              "#4285f4",
              "#34a853",
              "#ea4335",
            ][i],
          }}
        >
          {c}
        </span>
      ))}
    </span>
  );
}

export default function App() {
  const adventure = useAdventure();
  const {
    game,
    input,
    view,
    reduced,
    muted,
    start,
    pause,
    resume,
    restart,
    surprise,
    toggleSound,
    clearInput,
  } = adventure;
  const [failed, setFailed] = useState(false);
  const region = useRef<HTMLDivElement>(null);
  const card = useRef<HTMLDivElement>(null);
  const heldPointers = useRef(new Map<number, keyof Input>());
  const keyboard = useRef(new Set<string>());
  const previousPhase = useRef(view.phase);
  const celebrate = view.phase === "complete" || failed;
  const keyInput: Record<string, keyof Input> = {
    ArrowLeft: "left",
    a: "left",
    A: "left",
    ArrowRight: "right",
    d: "right",
    D: "right",
    " ": "jump",
    ArrowUp: "jump",
    w: "jump",
    W: "jump",
  };
  const syncInput = () => {
    for (const action of ["left", "right", "jump"] as const)
      input.current[action] =
        [...keyboard.current].some((k) => keyInput[k] === action) ||
        [...heldPointers.current.values()].includes(action);
  };
  const resetControls = useCallback(() => {
    heldPointers.current.clear();
    keyboard.current.clear();
    clearInput();
  }, [clearInput]);
  useEffect(() => {
    if (view.phase !== "playing") resetControls();
    if (view.phase === "complete" && previousPhase.current !== "complete") {
      card.current?.focus({ preventScroll: true });
      card.current?.scrollIntoView({
        behavior: reduced ? "auto" : "smooth",
        block: "center",
      });
    }
    previousPhase.current = view.phase;
  }, [view.phase, reduced, resetControls]);
  useEffect(() => {
    const up = (e: globalThis.KeyboardEvent) => {
      keyboard.current.delete(e.key);
      syncInput();
    };
    const blur = () => resetControls();
    window.addEventListener("keyup", up);
    window.addEventListener("blur", blur);
    return () => {
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", blur);
    };
  });
  const onFailure = useCallback(() => {
    setFailed(true);
    pause();
  }, [pause]);
  const begin = () => {
    resetControls();
    start();
    region.current?.focus({ preventScroll: true });
  };
  const continueGame = () => {
    resume();
    region.current?.focus({ preventScroll: true });
  };
  const replay = () => {
    resetControls();
    setFailed(false);
    restart();
    region.current?.focus({ preventScroll: true });
  };
  const keyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") {
      e.preventDefault();
      view.phase === "paused" ? continueGame() : pause();
      return;
    }
    if (
      e.target instanceof HTMLButtonElement ||
      e.target instanceof HTMLAnchorElement
    )
      return;
    if (keyInput[e.key] && view.phase === "playing") {
      e.preventDefault();
      keyboard.current.add(e.key);
      syncInput();
    }
  };
  const pointerDown =
    (action: keyof Input) => (e: PointerEvent<HTMLButtonElement>) => {
      e.preventDefault();
      if (view.phase !== "playing") return;
      e.currentTarget.setPointerCapture(e.pointerId);
      heldPointers.current.set(e.pointerId, action);
      syncInput();
    };
  const pointerUp = (e: PointerEvent<HTMLButtonElement>) => {
    heldPointers.current.delete(e.pointerId);
    syncInput();
  };
  return (
    <div className="app-shell">
      <a href="#adventure" className="skip-link">
        Skip to the adventure
      </a>
      <header className="site-header">
        <a href="#" className="brand" aria-label="Qiushui's little world, home">
          <span className="brand-symbol">
            <BallIcon />
          </span>
          <span>
            Qiushui’s <em>little world</em>
          </span>
        </a>
        <div className="header-note">
          <span className="status-dot" /> made for a new beginning
        </div>
        <div className="header-actions">
          <button
            className={`icon-button ${!muted ? "sound-on" : ""}`}
            onClick={toggleSound}
            aria-label={muted ? "Turn sound on" : "Mute sound"}
            title={muted ? "Sound off" : "Sound on"}
          >
            {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
          <button
            className="icon-button"
            onClick={replay}
            aria-label="Restart adventure"
            title="Start over"
          >
            <RotateCcw size={17} />
          </button>
        </div>
      </header>
      <main>
        <section className="introduction" aria-labelledby="page-title">
          <div>
            <p className="eyebrow">
              <span /> A little adventure for Qiushui
            </p>
            <h1 id="page-title">
              Good things are
              <br />
              <em>on their way.</em>
              <span className="title-star" aria-hidden="true">
                ✳
              </span>
            </h1>
          </div>
          <div className="intro-aside">
            <p>
              A few little leaps.
              <br />A very big new chapter.
            </p>
            <span>
              Help Qiushui find the surprise
              <br className="desktop-break" /> waiting at the end of the garden.
            </span>
            <MoveRight size={26} strokeWidth={1.2} />
          </div>
        </section>

        <div
          id="adventure"
          className="adventure"
          ref={region}
          tabIndex={0}
          role="region"
          aria-label="Qiushui's Offer Adventure"
          aria-describedby="game-instructions"
          onKeyDown={keyDown}
          onBlur={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget)) resetControls();
          }}
        >
          <div
            className={`scene-frame ${view.phase === "paused" ? "is-paused" : ""}`}
          >
            {!failed && (
              <Suspense
                fallback={
                  <div className="scene-loading">
                    <BallIcon />
                    <p>Growing your little garden…</p>
                  </div>
                }
              >
                <World game={game} reduced={reduced} onFailure={onFailure} />
              </Suspense>
            )}
            <div className="scene-topline">
              <div className="chapter">
                <span className="chapter-number">01</span>
                <div>
                  THE LITTLE GARDEN
                  <small>
                    {view.phase === "reveal" || celebrate
                      ? "A new chapter begins"
                      : "Every little step counts"}
                  </small>
                </div>
              </div>
              <div
                className="collection"
                role="img"
                aria-label={`${view.count} of 3 tennis balls collected`}
              >
                <div>
                  {[0, 1, 2].map((i) => (
                    <BallIcon key={i} collected={i < view.count} />
                  ))}
                </div>
                <span>
                  {view.count}
                  <i> / 3</i>
                </span>
              </div>
            </div>
            {view.phase === "intro" && !failed && (
              <div className="scene-caption">
                <span className="caption-dot" /> A little courage. A little
                curiosity. A lovely surprise.
              </div>
            )}
            {view.phase === "playing" && (
              <div className="scene-caption playing-hint">
                {view.count === 3 ? (
                  <>
                    <Sparkles size={14} /> All three! Jump beneath the gift
                    block.
                  </>
                ) : (
                  <>
                    <ArrowUp size={14} /> Hop onto the platforms to collect the
                    tennis balls.
                  </>
                )}
              </div>
            )}
            {view.phase === "reveal" && (
              <div className="scene-caption reveal-caption">
                <Sparkles size={15} /> Something wonderful is opening…
              </div>
            )}
            {view.phase === "paused" && !failed && (
              <div className="pause-overlay">
                <div>
                  <span className="eyebrow">TAKE YOUR TIME</span>
                  <h2>A little breather.</h2>
                  <p>Your next chapter will be right here.</p>
                  <button className="primary-button" onClick={continueGame}>
                    <Play size={16} fill="currentColor" /> Keep exploring
                  </button>
                </div>
              </div>
            )}
            {failed && (
              <div className="fallback-scene">
                <Heart size={36} strokeWidth={1.2} />
                <h2>
                  A lovely surprise,
                  <br />
                  just for you.
                </h2>
                <p>
                  The 3D garden couldn’t open on this device.
                  <br />
                  Your celebration is waiting below.
                </p>
              </div>
            )}
            <div className="scene-corner" aria-hidden="true">
              a small world, a big possibility
            </div>
          </div>

          <div className="game-bottom">
            <div className="game-status">
              {view.phase === "intro" && !failed && (
                <button className="primary-button" onClick={begin}>
                  <Play size={15} fill="currentColor" /> Let’s go, Qiushui{" "}
                  <ArrowRight size={17} />
                </button>
              )}
              {view.phase === "playing" && (
                <button className="secondary-button" onClick={pause}>
                  <Pause size={16} /> Pause adventure
                </button>
              )}
              {view.phase === "paused" && !failed && (
                <button className="primary-button" onClick={continueGame}>
                  <Play size={15} /> Keep exploring
                </button>
              )}
              {view.phase === "reveal" && (
                <span className="reveal-status">
                  <Heart size={17} /> This moment is yours.
                </span>
              )}
              {celebrate && (
                <button className="secondary-button" onClick={replay}>
                  <RotateCcw size={16} />{" "}
                  {failed
                    ? "Try the garden again"
                    : "One more little adventure"}
                </button>
              )}
            </div>
            <p id="game-instructions" className="keyboard-instructions">
              <span>
                <kbd>←</kbd>
                <kbd>→</kbd> or <kbd>A</kbd>
                <kbd>D</kbd> to move
              </span>
              <span className="instruction-divider" />
              <span>
                <kbd className="space-key">space</kbd> to jump
              </span>
            </p>
            <span className="no-rush">No rush. No wrong turns.</span>
          </div>

          {view.phase === "playing" && (
            <div
              className="touch-controls"
              aria-label="Touch movement controls"
            >
              <div>
                {(["left", "right"] as const).map((action) => (
                  <button
                    key={action}
                    className="touch-button"
                    aria-label={`Move ${action}`}
                    onPointerDown={pointerDown(action)}
                    onPointerUp={pointerUp}
                    onPointerCancel={pointerUp}
                    onLostPointerCapture={pointerUp}
                    onContextMenu={(e) => e.preventDefault()}
                  >
                    {action === "left" ? <ArrowLeft /> : <ArrowRight />}
                  </button>
                ))}
              </div>
              <button
                className="touch-button jump-button"
                aria-label="Jump"
                onPointerDown={pointerDown("jump")}
                onPointerUp={pointerUp}
                onPointerCancel={pointerUp}
                onLostPointerCapture={pointerUp}
                onContextMenu={(e) => e.preventDefault()}
              >
                <ArrowUp size={21} />
                <span>JUMP</span>
              </button>
            </div>
          )}
        </div>
        <p
          className="sr-only"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          {celebrate
            ? "Congratulations, Qiushui! Your next chapter starts at Google."
            : view.phase === "reveal"
              ? "Your surprise is opening."
              : view.count > 0
                ? `${view.count} of 3 tennis balls collected. ${view.count === 3 ? "Find the gift block and jump beneath it." : "Keep exploring the garden."}`
                : ""}
        </p>

        {celebrate ? (
          <section
            className="celebration"
            ref={card}
            tabIndex={-1}
            aria-labelledby="congratulations"
          >
            <div className="letter-seal">
              <Heart size={23} strokeWidth={1.3} />
            </div>
            <p className="eyebrow">HERE’S TO YOUR NEXT CHAPTER</p>
            <h2 id="congratulations">Congratulations, Qiushui!</h2>
            <p className="congrats-message">
              Your next chapter starts at <GoogleWord />.
            </p>
            <div className="celebration-rule">
              <span />
              <Sparkles size={16} />
              <span />
            </div>
            <p className="letter-note">
              For all the little steps that brought you here.
              <br />
              And all the wonderful things still to come.
            </p>
            <span className="signature">
              <span className="sr-only">This is only the beginning.</span>
              <span aria-hidden="true">
                {["This", "is", "only", "the", "beginning."].map(
                  (word, index) => (
                    <span
                      key={index}
                      style={{
                        color: [
                          "#4285f4",
                          "#ea4335",
                          "#fbbc05",
                          "#4285f4",
                          "#34a853",
                          "#ea4335",
                        ][index],
                      }}
                    >
                      {index > 0 ? " " : ""}
                      {word}
                    </span>
                  ),
                )}
              </span>
            </span>
          </section>
        ) : (
          <section className="journey-notes" aria-label="How to play">
            <div>
              <span className="note-number">01</span>
              <div>
                <h3>Follow your curiosity</h3>
                <p>A little stroll through a softer world.</p>
              </div>
            </div>
            <div>
              <span className="note-number">02</span>
              <div>
                <h3>Collect a little joy</h3>
                <p>Three tennis balls. A few happy hops.</p>
              </div>
            </div>
            <div>
              <span className="note-number">03</span>
              <div>
                <h3>Meet your next chapter</h3>
                <p>There’s something lovely waiting for you.</p>
              </div>
            </div>
          </section>
        )}
        <div className="quiet-actions">
          {!celebrate && (
            <button onClick={surprise}>
              Just here for the surprise? <span>Open it</span>{" "}
              <ArrowUpRight size={13} />
            </button>
          )}
          {reduced && <span>Gentle motion is on</span>}
        </div>
      </main>
      <footer className="site-footer">
        <span>Made by Kaiyue and Codex</span>
        <span>For Qiushui, and everything ahead.</span>
        <span className="footer-flower" aria-hidden="true">
          ✳
        </span>
      </footer>
    </div>
  );
}
