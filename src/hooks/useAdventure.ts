import { useCallback, useEffect, useRef, useState } from "react";
import {
  createGame,
  EMPTY_INPUT,
  openSurprise,
  pauseGame,
  resumeGame,
  startGame,
  stepGame,
  STEP,
  type Input,
  type Phase,
} from "../game/engine";

function chime(kind: "ball" | "win", audio: AudioContext) {
  const notes = kind === "ball" ? [660, 880] : [523, 659, 784, 1046];
  notes.forEach((frequency, i) => {
    const o = audio.createOscillator();
    const g = audio.createGain();
    const t = audio.currentTime + i * 0.12;
    o.type = "sine";
    o.frequency.value = frequency;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.065, t + 0.015);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
    o.connect(g);
    g.connect(audio.destination);
    o.start(t);
    o.stop(t + 0.32);
  });
}
export function useAdventure() {
  const game = useRef(createGame());
  const input = useRef<Input>({ ...EMPTY_INPUT });
  const [view, setView] = useState({
    phase: "intro" as Phase,
    count: 0,
    run: 0,
  });
  const [muted, setMuted] = useState(true);
  const mutedRef = useRef(true);
  const audio = useRef<AudioContext | null>(null);
  const [reduced, setReduced] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const clearInput = useCallback(() => {
    input.current = { ...EMPTY_INPUT };
  }, []);
  const publish = useCallback(() => {
    const s = game.current;
    setView((v) =>
      v.phase === s.phase &&
      v.count === s.collected.filter(Boolean).length &&
      v.run === s.run
        ? v
        : {
            phase: s.phase,
            count: s.collected.filter(Boolean).length,
            run: s.run,
          },
    );
  }, []);
  const start = useCallback(() => {
    startGame(game.current);
    publish();
  }, [publish]);
  const pause = useCallback(() => {
    clearInput();
    pauseGame(game.current);
    publish();
  }, [clearInput, publish]);
  const resume = useCallback(() => {
    clearInput();
    resumeGame(game.current);
    publish();
  }, [clearInput, publish]);
  const restart = useCallback(() => {
    clearInput();
    game.current = createGame(game.current.run + 1);
    if (audio.current) {
      void audio.current.close();
      audio.current = null;
    }
    if (!mutedRef.current) {
      try {
        audio.current = new AudioContext();
      } catch {
        mutedRef.current = true;
        setMuted(true);
      }
    }
    publish();
  }, [clearInput, publish]);
  const surprise = useCallback(() => {
    clearInput();
    openSurprise(game.current);
    publish();
  }, [clearInput, publish]);
  const toggleSound = useCallback(() => {
    mutedRef.current = !mutedRef.current;
    setMuted(mutedRef.current);
    if (!mutedRef.current) {
      try {
        audio.current ??= new AudioContext();
        void audio.current.resume().catch(() => {});
      } catch {
        mutedRef.current = true;
        setMuted(true);
      }
    } else if (audio.current) {
      void audio.current.close();
      audio.current = null;
    }
  }, []);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const changed = () => setReduced(media.matches);
    media.addEventListener("change", changed);
    return () => media.removeEventListener("change", changed);
  }, []);
  useEffect(() => {
    let frame = 0;
    let last = 0;
    let accumulator = 0;
    const tick = (now: number) => {
      const dt = last ? Math.min((now - last) / 1000, 0.1) : 0;
      last = now;
      accumulator += dt;
      const beforeCount = game.current.collected.filter(Boolean).length;
      const beforePhase = game.current.phase;
      while (accumulator >= STEP) {
        stepGame(game.current, input.current);
        accumulator -= STEP;
      }
      if (!mutedRef.current && audio.current) {
        if (beforeCount < game.current.collected.filter(Boolean).length)
          chime("ball", audio.current);
        if (beforePhase === "playing" && game.current.phase === "reveal")
          chime("win", audio.current);
      }
      publish();
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    const hide = () => {
      if (document.hidden) pause();
    };
    window.addEventListener("blur", pause);
    document.addEventListener("visibilitychange", hide);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("blur", pause);
      document.removeEventListener("visibilitychange", hide);
    };
  }, [pause, publish]);
  useEffect(
    () => () => {
      void audio.current?.close();
    },
    [],
  );
  return {
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
  };
}
