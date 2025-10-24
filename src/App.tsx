import React, { useEffect, useRef, useState } from "react";
import { motion, useAnimation } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Gift, RefreshCcw, Play } from "lucide-react";

/*************************
 * Character: Qiushui
 *************************/
const Qiushui = ({ walking }: { walking: boolean }) => {
  return (
    <motion.div
      aria-label="Qiushui"
      className="w-24 sm:w-28 md:w-32"
      animate={{ y: walking ? [0, -3, 0, -3, 0] : 0 }}
      transition={{ repeat: walking ? Infinity : 0, duration: 0.8 }}
    >
      <svg viewBox="0 0 180 260" className="w-full h-auto drop-shadow-[0_8px_16px_rgba(0,0,0,0.25)]">
        {/* Hair back */}
        <path d="M30 70 C30 30 80 12 120 26 C150 36 168 60 168 86 C168 150 130 162 90 162 C62 162 34 138 34 106" fill="#2b2b2b" opacity="0.85"/>
        {/* Face */}
        <defs>
          <linearGradient id="skin" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#ffdcca"/>
            <stop offset="100%" stopColor="#ffc9b0"/>
          </linearGradient>
          <linearGradient id="dress" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#ff9bc1"/>
            <stop offset="100%" stopColor="#ff78ae"/>
          </linearGradient>
          <linearGradient id="legGrad" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#3a3a3a"/>
            <stop offset="100%" stopColor="#202020"/>
          </linearGradient>
          <linearGradient id="shoeGrad" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#666"/>
            <stop offset="100%" stopColor="#444"/>
          </linearGradient>
        </defs>
        <ellipse cx="96" cy="92" rx="36" ry="42" fill="url(#skin)" />
        {/* Eyes */}
        <ellipse cx="82" cy="92" rx="6" ry="8" fill="#2a2a2a" />
        <ellipse cx="110" cy="92" rx="6" ry="8" fill="#2a2a2a" />
        <circle cx="80.5" cy="90" r="1.5" fill="#fff" />
        <circle cx="108.5" cy="90" r="1.5" fill="#fff" />
        {/* Nose + mouth */}
        <path d="M95 98 q2 6 -3 6" stroke="#e49a8b" strokeWidth="1.5" fill="none" />
        <path d="M86 112 q10 8 20 0" stroke="#e5728f" strokeWidth="2" fill="none" strokeLinecap="round"/>
        {/* Bangs */}
        <path d="M58 72 C70 54 120 54 136 78 C120 72 100 78 82 78" fill="#2b2b2b" />
        {/* Bow (pink) */}
        <path d="M58 60 c8-10 22 6 0 8 22 2 8 20 0 8 8 12-12 12-6 0-6 12-30 4-10-8-20 4-12-18 10-8-10-12 10-18 18-8 10-12 34 0z" fill="#ff7eb6" transform="translate(18,0) scale(.45)" />

        {/* Neck */}
        <rect x="88" y="128" width="16" height="12" rx="6" fill="url(#skin)" />

        {/* Dress (pink, subtle shading) */}
        <path d="M46 140 C46 122 64 108 96 108 C128 108 146 122 146 140 L146 166 C146 176 140 184 130 188 L112 196 L80 196 L62 188 C52 184 46 176 46 166 Z" fill="url(#dress)" />

        {/* Arms */}
        <rect x="38" y="156" width="18" height="28" rx="9" fill="url(#skin)" />
        <rect x="140" y="156" width="18" height="28" rx="9" fill="url(#skin)" />

        {/* Articulated Legs (prettier with subtle curves) */}
        <g>
          {/* Left leg (front) */}
          <motion.g
            style={{ transformOrigin: "88px 198px" }}
            animate={walking ? { rotate: [10, -6, 10] } : { rotate: 0 }}
            transition={{ repeat: walking ? Infinity : 0, duration: 0.6 }}
          >
            {/* Thigh */}
            <path d="M86 196 q-6 2 -6 12 v14 q0 10 10 10 h2 q8 0 8-8 v-18 q0-12 -14-10z" fill="url(#legGrad)" />
            {/* Shin */}
            <path d="M90 222 q-10 4 -8 14 v10 q0 8 10 8 h4 q8 0 8-8 v-12 q0-14 -14-12z" fill="url(#legGrad)" />
            {/* Foot */}
            <path d="M86 248 c10 0 20 0 26 4 c-2 6 -12 8 -22 8 c-8 0 -12-2 -12-6 c0-4 4-6 8-6z" fill="url(#shoeGrad)" />
          </motion.g>

          {/* Right leg (back) */}
          <motion.g
            style={{ transformOrigin: "108px 198px" }}
            animate={walking ? { rotate: [-6, 10, -6] } : { rotate: 0 }}
            transition={{ repeat: walking ? Infinity : 0, duration: 0.6 }}
          >
            <path d="M106 196 q6 2 6 12 v14 q0 10 -10 10 h-2 q-8 0 -8-8 v-18 q0-12 14-10z" fill="url(#legGrad)" />
            <path d="M104 222 q10 4 8 14 v10 q0 8 -10 8 h-4 q-8 0 -8-8 v-12 q0-14 14-12z" fill="url(#legGrad)" />
            <path d="M96 248 c10 0 20 0 28 4 c-2 6 -12 8 -22 8 c-10 0 -14-2 -14-6 c0-4 4-6 8-6z" fill="url(#shoeGrad)" />
          </motion.g>
        </g>
      </svg>

      {/* Name tag */}
      <div className="mt-2 w-fit mx-auto px-3 py-1 rounded-full text-xs font-medium bg-white/90 border border-black/10 shadow">Qiushui</div>
    </motion.div>
  );
};

/*************************
 * Floating Block
 *************************/
const FloatingBlock = React.forwardRef<HTMLDivElement, { bumped: boolean }>(
  ({ bumped }, ref) => (
    <motion.div
      ref={ref}
      aria-label="floating block"
      className="w-16 h-16 rounded-xl bg-amber-200 border border-amber-300 shadow-[0_10px_24px_rgba(0,0,0,0.18)] grid place-items-center relative overflow-hidden"
      animate={bumped ? { y: [0, -14, 0] } : { y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-amber-100/60 to-amber-300/20" />
      <div className="text-2xl font-black text-amber-800 drop-shadow">?</div>
    </motion.div>
  )
);
FloatingBlock.displayName = "FloatingBlock";

/*************************
 * Google-style Animated Mark
 *************************/
const GoogleMark = ({ size = 56, animateIn = false }: { size?: number; animateIn?: boolean }) => {
  const arc = (d: string, color: string, delay: number) => (
    <motion.path
      d={d}
      fill="none"
      stroke={color}
      strokeWidth={9}
      strokeLinecap="round"
      strokeLinejoin="round"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: animateIn ? 1 : 1 }}
      transition={{ duration: 0.6, delay }}
    />
  );
  return (
    <motion.div
      className="rounded-2xl border border-black/5 shadow-[0_8px_18px_rgba(0,0,0,0.18)] bg-white/90 backdrop-blur px-2 py-2"
      initial={{ opacity: animateIn ? 0 : 1, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      style={{ width: size + 16, height: size + 16 }}
    >
      <motion.svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        className="mx-auto"
        initial={{ rotate: 0 }}
        animate={{ rotate: animateIn ? [0, 2.5, 0] : 0 }}
        transition={{ duration: 0.8 }}
      >
        <defs>
          <radialGradient id="haloGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fff" />
            <stop offset="100%" stopColor="#fff" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="50" cy="50" r="36" fill="url(#haloGrad)" opacity="0.15" />
        {arc("M50 18 a32 32 0 1 1 -0.1 0", "#4285F4", 0.0)}
        {arc("M50 18 a32 32 0 0 1 22 9", "#34A853", 0.12)}
        {arc("M72 44 h-16", "#FBBC05", 0.24)}
        {arc("M50 82 a32 32 0 0 1 -22 -9", "#EA4335", 0.36)}
        <circle cx="50" cy="50" r="28" fill="none" stroke="#000" strokeOpacity="0.06" strokeWidth="2" />
        <motion.circle
          cx="50" cy="50" r="34" fill="none" stroke="#000" strokeOpacity="0.1" strokeWidth="2"
          strokeDasharray="6 8"
          initial={{ rotate: 0 }}
          animate={{ rotate: animateIn ? 360 : 0 }}
          transition={{ duration: 2.2, ease: "linear" }}
        />
      </motion.svg>
    </motion.div>
  );
};

export default function ContemporaryPlatformer() {
  const controls = useAnimation();
  const [phase, setPhase] = useState<
    "idle" | "walking" | "jumping" | "block" | "reward" | "claimed" | "done"
  >("idle");
  const [walking, setWalking] = useState(false);
  const [bumped, setBumped] = useState(false);
  const [showOffer, setShowOffer] = useState(false);
  const [walkProgress, setWalkProgress] = useState(0);

  const sceneRef = useRef<HTMLDivElement>(null);
  const blockRef = useRef<HTMLDivElement>(null);

  const [positions, setPositions] = useState({ startX: -140, stopX: 0 });

  useEffect(() => {
    const calc = () => {
      const scene = sceneRef.current;
      const block = blockRef.current;
      if (!scene || !block) return;
      const rect = scene.getBoundingClientRect();
      const blockRect = block.getBoundingClientRect();
      const startX = -140;
      const stopX = blockRect.left - rect.left - 26;
      setPositions({ startX, stopX });
    };
    calc();
    const ro = new ResizeObserver(calc);
    if (sceneRef.current) ro.observe(sceneRef.current);
    return () => ro.disconnect();
  }, []);

  const reset = () => {
    setPhase("idle");
    setWalking(false);
    setBumped(false);
    setShowOffer(false);
    setWalkProgress(0);
    controls.stop();
    controls.set({ x: positions.startX, y: 0 });
  };

  useEffect(() => {
    controls.set({ x: positions.startX, y: 0 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [positions.startX]);

  const start = async () => {
    if (phase !== "idle" && phase !== "done") reset();
    await new Promise((r) => setTimeout(r, 40));

    setPhase("walking");
    setWalking(true);

    const duration = 2000;
    const t0 = performance.now();
    let raf = 0 as unknown as number;
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / duration);
      setWalkProgress(p);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    await controls.start({ x: positions.stopX, transition: { duration: duration / 1000, ease: "easeInOut" } });
    cancelAnimationFrame(raf);
    setWalkProgress(1);

    setWalking(false);
    setPhase("jumping");
    await controls.start({ y: [0, -120, 0], transition: { duration: 0.75, ease: "easeOut" } });

    setPhase("block");
    setBumped(true);
    await new Promise((r) => setTimeout(r, 260));

    setPhase("reward");
    setShowOffer(true);
    await new Promise((r) => setTimeout(r, 650));

    setPhase("done");
  };

  const parallax = (base: number) => `translateX(${(-walkProgress * base).toFixed(1)}px)`;

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-sky-100 via-white to-rose-50 text-neutral-800">
      <div className="max-w-6xl mx-auto px-6 pt-6 pb-20">
        <header className="flex items-center justify-end gap-2">
          <div className="flex items-center gap-2">
            <Button onClick={start} className="gap-2">
              <Play className="w-4 h-4" /> Start
            </Button>
            <Button onClick={reset} className="gap-2" variant="secondary">
              <RefreshCcw className="w-4 h-4" /> Replay
            </Button>
          </div>
        </header>

        <div
          ref={sceneRef}
          className="relative mt-6 aspect-[16/9] w-full overflow-hidden rounded-3xl border border-black/5 bg-gradient-to-b from-sky-200/70 via-sky-100 to-amber-50 shadow-[0_20px_60px_rgba(0,0,0,0.12)]"
        >
          {/* SKY GLOW */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-10 left-6 w-48 h-24 rounded-full bg-white/70 blur-2xl" />
            <div className="absolute top-6 right-10 w-64 h-28 rounded-full bg-white/70 blur-2xl" />
          </div>

          {/* FAR LAYER: mountains (slow, extended width) */}
          <div className="absolute top-10 h-40 opacity-70 left-1/2 -translate-x-1/2 w-[300%]" style={{ transform: parallax(60) }}>
            <svg viewBox="0 0 1200 220" className="w-full h-full" preserveAspectRatio="none">
              <path d="M0 170 L100 120 L220 160 L330 110 L460 170 L560 98 L690 158 L800 118 L940 168 L1060 128 L1180 162 L1200 176 L1200 220 L0 220 Z" fill="#cbe5ff"/>
            </svg>
          </div>

          {/* MID LAYER: smooth hills + cohesive trees (medium, extended width) */}
          <div className="absolute bottom-28 h-44 left-1/2 -translate-x-1/2 w-[300%]" style={{ transform: parallax(120) }}>
            <svg viewBox="0 0 1200 200" className="w-full h-full" preserveAspectRatio="none">
              <path d="M0,144 C200,84 380,184 560,124 C740,64 920,174 1100,124 C1160,104 1200,128 1200,144 L1200,200 L0,200 Z" fill="#bfe8cf"/>
            </svg>
            {/* Tree group 1 (broad canopy) */}
            <div className="absolute left-[56px] bottom-2 w-[88px] h-[120px]">
              <div className="absolute bottom-0 left-[40px] w-[8px] h-[64px] bg-emerald-800 rounded-sm" />
              <div className="absolute bottom-[44px] left-[8px] w-[72px] h-[56px] bg-emerald-500/90 rounded-full" />
            </div>
            {/* Tree group 2 (broad canopy) */}
            <div className="absolute right-[72px] bottom-2 w-[96px] h-[136px]">
              <div className="absolute bottom-0 left-[44px] w-[8px] h-[72px] bg-emerald-800 rounded-sm" />
              <div className="absolute bottom-[52px] left-[12px] w-[72px] h-[64px] bg-emerald-500/90 rounded-full" />
            </div>
            {/* Tree group 3 (taller) */}
            <div className="absolute left-1/3 bottom-1 w-[90px] h-[150px]">
              <div className="absolute bottom-0 left-[41px] w-[8px] h-[86px] bg-emerald-900 rounded-sm" />
              <div className="absolute bottom-[66px] left-[12px] w-[66px] h-[62px] bg-emerald-600 rounded-full" />
            </div>
            {/* Tree group 4 (clustered canopies) */}
            <div className="absolute right-1/3 bottom-1 w-[140px] h-[140px]">
              <div className="absolute bottom-0 left-[64px] w-[8px] h-[80px] bg-emerald-900 rounded-sm" />
              <div className="absolute bottom-[60px] left-[28px] w-[56px] h-[52px] bg-emerald-600 rounded-full" />
              <div className="absolute bottom-[60px] left-[64px] w-[56px] h-[52px] bg-emerald-500 rounded-full" />
            </div>
          </div>

          {/* NEAR LAYER: cohesive bush groups + rock (fast, extended width) */}
          <div className="absolute bottom-20 h-16 left-1/2 -translate-x-1/2 w-[300%]" style={{ transform: parallax(220) }}>
            {/* Bush group A */}
            <div className="absolute left-[80px] bottom-0">
              <div className="relative w-[160px] h-[48px]">
                <div className="absolute left-0 bottom-0 w-[88px] h-[36px] bg-emerald-400 rounded-full" />
                <div className="absolute left-[64px] bottom-[4px] w-[64px] h-[28px] bg-emerald-500 rounded-full" />
                <div className="absolute left-[112px] bottom-0 w-[48px] h-[32px] bg-emerald-400 rounded-full" />
              </div>
            </div>
            {/* Bush group B */}
            <div className="absolute right-[96px] bottom-0">
              <div className="relative w-[172px] h-[48px]">
                <div className="absolute left-0 bottom-0 w-[92px] h-[36px] bg-emerald-400 rounded-full" />
                <div className="absolute left-[72px] bottom-[4px] w-[68px] h-[28px] bg-emerald-500 rounded-full" />
                <div className="absolute left-[128px] bottom-0 w-[56px] h-[32px] bg-emerald-400 rounded-full" />
              </div>
            </div>
            {/* Rock */}
            
          </div>

          {/* GROUND with tile line */}
          <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-b from-emerald-300 to-emerald-400">
            <div className="absolute -top-3 left-0 w-full h-3 bg-emerald-500/80" />
            <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_1px_1px,rgba(0,0,0,0.18)_1px,transparent_1.2px)] [background-size:16px_16px]" />
          </div>

          {/* Floating Block (center) */}
          <div className="absolute left-1/2 -translate-x-1/2 top-[22%]">
            <FloatingBlock ref={blockRef} bumped={bumped} />
          </div>

          {/* Offer emerging (no flying G now) */}
          <motion.div
            className="absolute left-1/2 -translate-x-1/2 top-[10%]"
            initial={{ opacity: 0 }}
            animate={{ opacity: showOffer ? 1 : 0 }}
          >
            <GoogleMark animateIn={showOffer} size={64} />
          </motion.div>

          {/* Character container */}
          <motion.div className="absolute bottom-5" animate={controls} style={{ x: positions.startX }}>
            <Qiushui walking={walking} />
          </motion.div>

          {/* Centered overlay badge to avoid layout shift */}
          {phase === "done" && (
            <motion.div
              className="pointer-events-none absolute left-1/2 bottom-28 -translate-x-1/2"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="inline-flex items-center gap-2 rounded-full bg-white/90 border border-black/10 px-3 py-1 text-xs font-medium shadow-sm">
                <Gift className="w-3.5 h-3.5" /> Google offer claimed
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
