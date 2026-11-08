import {
  Component,
  Suspense,
  useEffect,
  useMemo,
  useRef,
  type MutableRefObject,
  type ReactNode,
} from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import {
  BALLS,
  COURT,
  GIFT,
  PLATFORMS,
  REVEAL,
  type GameState,
} from "../game/engine";
import { Character, TennisBall } from "./Character";

const roundGeometry = new RoundedBoxGeometry(1, 1, 1, 3, 0.12);
const sphereGeometry = new THREE.SphereGeometry(1, 16, 12);
const cylinderGeometry = new THREE.CylinderGeometry(0.12, 0.18, 1.5, 10);
const palette = ["#84aa8c", "#a5bd8e", "#bacb9c", "#91b29c"];
const treeCrowns: {
  position: [number, number, number];
  scale: [number, number, number];
}[][] = [
  [
    { position: [0, 2.15, 0], scale: [0.85, 0.95, 0.72] },
    { position: [-0.43, 1.75, 0.12], scale: [0.5, 0.54, 0.5] },
  ],
  [
    { position: [-0.6, 1.85, 0], scale: [0.75, 0.6, 0.65] },
    { position: [0.55, 1.9, 0.08], scale: [0.78, 0.65, 0.67] },
    { position: [0, 2.3, -0.06], scale: [0.8, 0.65, 0.65] },
  ],
  [
    { position: [0, 1.95, 0], scale: [0.58, 0.85, 0.55] },
    { position: [0.03, 2.65, 0], scale: [0.43, 0.85, 0.42] },
    { position: [-0.03, 3.2, 0], scale: [0.26, 0.5, 0.26] },
  ],
  [
    { position: [-0.48, 1.9, 0.08], scale: [0.65, 0.66, 0.61] },
    { position: [0.5, 2.04, 0.06], scale: [0.64, 0.7, 0.61] },
    { position: [0.05, 2.55, -0.05], scale: [0.65, 0.67, 0.58] },
  ],
];
function Round({
  position,
  scale,
  color,
  ...props
}: {
  position: [number, number, number];
  scale: [number, number, number];
  color: string;
  rotation?: [number, number, number];
}) {
  return (
    <mesh
      geometry={roundGeometry}
      position={position}
      scale={scale}
      castShadow
      receiveShadow
      {...props}
    >
      <meshStandardMaterial color={color} roughness={0.9} />
    </mesh>
  );
}
function Tree({
  x,
  z = -2.3,
  scale = 1,
  color = "#96b399",
  variant = 0,
}: {
  x: number;
  z?: number;
  scale?: number;
  color?: string;
  variant?: number;
}) {
  return (
    <group position={[x, 0, z]} scale={scale}>
      <mesh geometry={cylinderGeometry} position={[0, 0.75, 0]} castShadow>
        <meshStandardMaterial color="#b09c7d" />
      </mesh>
      {(variant === 1 || variant === 3) &&
        [-1, 1].map((side) => (
          <mesh
            key={side}
            geometry={cylinderGeometry}
            position={[side * 0.25, 1.35, 0]}
            scale={[0.65, 0.5, 0.65]}
            rotation={[0, 0, -side * 0.65]}
            castShadow
          >
            <meshStandardMaterial color="#b09c7d" />
          </mesh>
        ))}
      {treeCrowns[variant].map((crown, i) => (
        <mesh
          key={i}
          geometry={sphereGeometry}
          position={crown.position}
          scale={crown.scale}
          castShadow
        >
          <meshStandardMaterial
            color={variant === 3 ? "#d5a8b6" : color}
            roughness={1}
          />
        </mesh>
      ))}
    </group>
  );
}
function Flower({ x, z, pink }: { x: number; z: number; pink: boolean }) {
  return (
    <group position={[x, 0.04, z]}>
      <mesh position={[0, 0.12, 0]}>
        <cylinderGeometry args={[0.012, 0.018, 0.22, 5]} />
        <meshStandardMaterial color="#6b9469" />
      </mesh>
      {[0, 1, 2, 3, 4].map((i) => (
        <mesh
          key={i}
          geometry={sphereGeometry}
          position={[
            Math.cos(i * 1.256) * 0.075,
            0.24 + Math.sin(i * 1.256) * 0.075,
            0,
          ]}
          scale={[0.065, 0.065, 0.03]}
        >
          <meshStandardMaterial color={pink ? "#edb9c7" : "#f6e7ad"} />
        </mesh>
      ))}
      <mesh geometry={sphereGeometry} position={[0, 0.24, 0.025]} scale={0.035}>
        <meshStandardMaterial color="#d8ae58" />
      </mesh>
    </group>
  );
}
function Backdrop() {
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 2;
    canvas.height = 256;
    const ctx = canvas.getContext("2d")!;
    const gradient = ctx.createLinearGradient(0, 0, 0, 256);
    gradient.addColorStop(0, "#dfedf0");
    gradient.addColorStop(0.55, "#f7f2e3");
    gradient.addColorStop(1, "#e7eddb");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 2, 256);
    const image = new THREE.CanvasTexture(canvas);
    image.colorSpace = THREE.SRGBColorSpace;
    return image;
  }, []);
  useEffect(() => () => texture.dispose(), [texture]);
  return <primitive object={texture} attach="background" />;
}
function TennisCourt() {
  const w = COURT.width / 2 - 0.35;
  const d = COURT.depth / 2 - 0.35;
  return (
    <group position={[COURT.x, 0, COURT.z]}>
      <Round
        position={[0, -0.027, 0]}
        scale={[COURT.width, 0.06, COURT.depth]}
        color="#92b5a3"
      />
      <Round
        position={[0, 0.006, 0]}
        scale={[COURT.width - 0.3, 0.006, COURT.depth - 0.3]}
        color="#b7cfb9"
      />
      {[-w, w].map((x) => (
        <Round
          key={x}
          position={[x, 0.012, 0]}
          scale={[0.035, 0.006, d * 2]}
          color="#fff9df"
        />
      ))}
      {[-d, d].map((z) => (
        <Round
          key={z}
          position={[0, 0.012, z]}
          scale={[w * 2, 0.006, 0.035]}
          color="#fff9df"
        />
      ))}
      {[-2.4, 2.4].map((x) => (
        <Round
          key={x}
          position={[x, 0.012, 0]}
          scale={[0.025, 0.006, d * 2]}
          color="#fff9df"
        />
      ))}
      {[-0.9, 0.9].map((z) => (
        <Round
          key={z}
          position={[0, 0.012, z]}
          scale={[4.8, 0.006, 0.025]}
          color="#fff9df"
        />
      ))}
      <Round
        position={[0, 0.012, 0]}
        scale={[0.025, 0.006, 1.8]}
        color="#fff9df"
      />
      {/* The net sits behind Qiushui's walking lane. */}
      {[-3.05, 3.05].map((x) => (
        <Round
          key={x}
          position={[x, 0.4, 0]}
          scale={[0.06, 0.8, 0.06]}
          color="#6b8279"
        />
      ))}
      <Round
        position={[0, 0.76, 0]}
        scale={[6.12, 0.035, 0.035]}
        color="#fff9df"
      />
      {Array.from({ length: 23 }, (_, i) => (
        <Round
          key={i}
          position={[-2.97 + i * 0.27, 0.43, 0]}
          scale={[0.012, 0.62, 0.012]}
          color="#d8e0cb"
        />
      ))}
      {[0.19, 0.38, 0.57].map((y) => (
        <Round
          key={y}
          position={[0, y, 0]}
          scale={[6, 0.012, 0.012]}
          color="#d8e0cb"
        />
      ))}
    </group>
  );
}
function Garden() {
  return (
    <group>
      <Round position={[17, -0.5, -0.2]} scale={[44, 1, 8]} color="#c6d3a4" />
      <Round
        position={[17, -0.055, 0.7]}
        scale={[43, 0.1, 2.5]}
        color="#eee4c6"
      />
      <Round
        position={[17, -0.58, -0.2]}
        scale={[44.05, 0.25, 8.05]}
        color="#acc095"
      />
      {Array.from({ length: 21 }, (_, i) => (
        <Round
          key={i}
          position={[i * 2 - 2, 0.008, 1.96]}
          scale={[0.48, 0.024, 0.045]}
          color="#fff9e8"
        />
      ))}
      {PLATFORMS.map((p, i) => (
        <group key={p.x}>
          <Round
            position={[p.x, p.height / 2, 0.65]}
            scale={[p.width, p.height, 2.3]}
            color={["#e3beab", "#e3c4cd"][i]}
          />
          <Round
            position={[p.x, p.height - 0.035, 0.65]}
            scale={[p.width - 0.12, 0.07, 2.18]}
            color={["#f0d1b8", "#efd4db"][i]}
          />
        </group>
      ))}
      {[-3, 2.5, 9.5, 13, 20, 28, 34.5, 37].map((x, i) => (
        <Tree
          key={x}
          x={x}
          z={i === 7 ? -2 : -2.4 - (i % 2) * 0.5}
          scale={0.75 + (i % 3) * 0.15}
          color={palette[i % 4]}
          variant={i % 4}
        />
      ))}
      {[-1, 5, 11, 21, 23, 30, 37].map((x, i) => (
        <group key={x}>
          <mesh
            geometry={sphereGeometry}
            position={[x, 0.26, 3.1]}
            scale={[0.6, 0.35, 0.4]}
            castShadow
          >
            <meshStandardMaterial color={palette[(i + 1) % 4]} />
          </mesh>
          <Flower x={x + 0.7} z={2.9} pink={i % 2 === 0} />
          <Flower x={x + 1.05} z={3.1} pink={i % 2 === 0} />
        </group>
      ))}
      <TennisCourt />
      {/* Lower, layered hills leave a clear horizon and sky. */}
      {[-10, 2, 14, 26, 38, 50].map((x, i) => (
        <mesh
          key={`far-${x}`}
          geometry={sphereGeometry}
          position={[x, -3.5, -13]}
          scale={[8.5, 3 + (i % 2) * 0.3, 3]}
        >
          <meshStandardMaterial
            color={i % 2 ? "#d8e2d3" : "#cdded4"}
            roughness={1}
          />
        </mesh>
      ))}
      {[-8, 4, 16, 28, 40, 52].map((x, i) => (
        <mesh
          key={`near-${x}`}
          geometry={sphereGeometry}
          position={[x, -2, -7.5]}
          scale={[7.5, 2.6 + (i % 2) * 0.25, 2]}
        >
          <meshStandardMaterial
            color={i % 2 ? "#c6d7bc" : "#d3dfc4"}
            roughness={1}
          />
        </mesh>
      ))}
      <mesh
        geometry={sphereGeometry}
        position={[6, 0.1, -14]}
        scale={[0.7, 0.7, 0.2]}
      >
        <meshBasicMaterial color="#fff1c8" />
      </mesh>
      {[-2, 8, 20, 29, 44].map((x, j) => (
        <group key={x} position={[x, 2.35 + (j % 2) * 0.15, -7]}>
          {[0, 1, 2].map((i) => (
            <mesh
              key={i}
              geometry={sphereGeometry}
              position={[i * 0.6, i === 1 ? 0.12 : 0, 0]}
              scale={[0.75, 0.3, 0.38]}
            >
              <meshStandardMaterial color="#fffaf0" roughness={1} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}
function Pickup({
  index,
  game,
  reduced,
}: {
  index: number;
  game: MutableRefObject<GameState>;
  reduced: boolean;
}) {
  const group = useRef<THREE.Group>(null!);
  const b = BALLS[index];
  useFrame(({ clock }) => {
    const s = game.current;
    group.current.visible = !s.collected[index];
    group.current.position.y =
      b.y +
      (!reduced && s.phase !== "paused"
        ? Math.sin(clock.elapsedTime * 2 + index) * 0.09
        : 0);
    if (!reduced && s.phase !== "paused")
      group.current.rotation.y = clock.elapsedTime * 0.7;
  });
  return (
    <group ref={group} position={[b.x, b.y, 0.65]}>
      <TennisBall size={0.25} />
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -0.4, 0]}>
        <torusGeometry args={[0.4, 0.015, 6, 36]} />
        <meshStandardMaterial color="#f6e7aa" />
      </mesh>
    </group>
  );
}
function Gift({
  game,
  reduced,
}: {
  game: MutableRefObject<GameState>;
  reduced: boolean;
}) {
  const block = useRef<THREE.Group>(null!);
  const letter = useRef<THREE.Group>(null!);
  const flap = useRef<THREE.Group>(null!);
  const mouth = useRef<THREE.Group>(null!);
  const texture = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 128;
    c.height = 128;
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "#fbefd0";
    ctx.fillRect(0, 0, 128, 128);
    ctx.fillStyle = "#ae8554";
    ctx.font = "bold 76px Georgia";
    ctx.textAlign = "center";
    ctx.fillText("?", 64, 92);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);
  useEffect(() => () => texture.dispose(), [texture]);
  useFrame(({ clock }) => {
    const s = game.current;
    const done =
      s.phase === "reveal" ||
      s.phase === "complete" ||
      (s.phase === "paused" && s.resumePhase === "reveal");
    const t = s.revealTime;
    block.current.position.y =
      GIFT.bottom +
      0.43 +
      (done && t < 0.35 ? Math.sin((t / 0.35) * Math.PI) * 0.22 : 0);
    block.current.rotation.y =
      !reduced && s.phase !== "paused" && !done
        ? Math.sin(clock.elapsedTime * 1.3) * 0.07
        : 0;
    letter.current.visible = done;
    letter.current.position.y =
      GIFT.bottom +
      0.5 +
      (reduced ? 1 : Math.min(t / REVEAL.riseEnd, 1)) * 1.35;
    letter.current.scale.setScalar(reduced ? 1 : Math.min(1, t * 3));
    // Turn end-over-end once, then open the attached paper flap to pour
    // the confetti out of the downward-facing mouth. There is no Y-axis spin.
    const flip = reduced
      ? 1
      : THREE.MathUtils.clamp(
          (t - REVEAL.riseEnd) / (REVEAL.flipEnd - REVEAL.riseEnd),
          0,
          1,
        );
    const easedFlip = flip * flip * (3 - 2 * flip);
    letter.current.rotation.set(easedFlip * Math.PI, 0, 0);
    const opening = reduced
      ? 1
      : THREE.MathUtils.clamp(
          (t - REVEAL.flipEnd) / (REVEAL.openEnd - REVEAL.flipEnd),
          0,
          1,
        );
    flap.current.rotation.x =
      opening * opening * (3 - 2 * opening) * Math.PI * 0.88;
    mouth.current.visible = opening > 0.1;
  });
  return (
    <group position={[GIFT.x, 0, 0.65]}>
      <Round position={[0, -0.03, 0]} scale={[2.2, 0.07, 2]} color="#e8d4b1" />
      <group ref={block}>
        <Round position={[0, 0, 0]} scale={[0.9, 0.9, 0.85]} color="#f1d395" />
        <mesh position={[0, 0, 0.432]}>
          <planeGeometry args={[0.67, 0.67]} />
          <meshStandardMaterial map={texture} />
        </mesh>
      </group>
      <group ref={letter} visible={false}>
        <Round position={[0, 0, 0]} scale={[1.3, 0.8, 0.08]} color="#fff9ec" />
        {/* Flat front folds and a rounded, hinged paper flap on the back. */}
        {[1].map((side) => (
          <group key={side} rotation={[0, side === -1 ? Math.PI : 0, 0]}>
            <Round
              position={[-0.29, 0.13, 0.046]}
              scale={[0.68, 0.012, 0.004]}
              rotation={[0, 0, -0.57]}
              color="#dbc5ab"
            />
            <Round
              position={[0.29, 0.13, 0.046]}
              scale={[0.68, 0.012, 0.004]}
              rotation={[0, 0, 0.57]}
              color="#dbc5ab"
            />
          </group>
        ))}
        <mesh position={[0, -0.045, 0.055]}>
          <circleGeometry args={[0.13, 24]} />
          <meshStandardMaterial color="#ce8193" />
        </mesh>
        <group ref={mouth} visible={false}>
          <Round
            position={[0, 0.32, -0.05]}
            scale={[1.08, 0.12, 0.012]}
            color="#bfa98f"
          />
        </group>
        <group ref={flap} position={[0, 0.39, -0.066]}>
          <Round
            position={[0, -0.19, 0]}
            scale={[1.22, 0.38, 0.018]}
            color="#f2e3cd"
          />
        </group>
      </group>
      <Round position={[2.2, 1, -1]} scale={[0.07, 2, 0.07]} color="#bb9c77" />
      <Round
        position={[2.6, 1.7, -1]}
        scale={[0.8, 0.45, 0.05]}
        color="#e9b1be"
      />
    </group>
  );
}
function Confetti({
  game,
  reduced,
}: {
  game: MutableRefObject<GameState>;
  reduced: boolean;
}) {
  const particles = useRef<THREE.InstancedMesh>(null!);
  const particle = useMemo(() => new THREE.Object3D(), []);
  const count = 144;
  useEffect(() => {
    const color = new THREE.Color();
    for (let i = 0; i < count; i++) {
      particles.current.setColorAt(
        i,
        color.set(
          ["#4285f4", "#ea4335", "#fbbc05", "#34a853", "#ed83ae", "#9c81da"][
            i % 6
          ],
        ),
      );
    }
    particles.current.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    particles.current.instanceColor!.needsUpdate = true;
  }, []);
  useFrame(() => {
    const t = game.current.revealTime;
    particles.current.visible =
      !reduced && t > REVEAL.openEnd && t < REVEAL.end;
    if (!particles.current.visible) return;
    for (let i = 0; i < count; i++) {
      const delay = REVEAL.openEnd + (i % 4) * 0.14;
      const age = Math.max(0, t - delay);
      const angle = i * 2.39996;
      const speed = 0.65 + (i % 7) * 0.24;
      const sourceY = GIFT.bottom + 1.45;
      particle.position.set(
        GIFT.x + Math.cos(angle) * age * speed,
        sourceY - (0.2 + (i % 5) * 0.1) * age - 0.75 * age * age,
        0.75 + Math.sin(angle) * age * 0.65,
      );
      particle.rotation.set(age * ((i % 3) + 1), angle + age * 3, age * 2);
      const fade = t < delay ? 0 : Math.max(0, Math.min(1, 2.7 - age));
      particle.scale.set(
        (i % 7 === 0 ? 0.07 : 0.13) * fade,
        (i % 7 === 0 ? 0.32 : 0.065) * fade,
        0.012 * fade,
      );
      particle.updateMatrix();
      particles.current.setMatrixAt(i, particle.matrix);
    }
    particles.current.instanceMatrix.needsUpdate = true;
  });
  return (
    <instancedMesh
      ref={particles}
      args={[undefined, undefined, count]}
      visible={false}
      frustumCulled={false}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial toneMapped={false} />
    </instancedMesh>
  );
}
function CameraRig({
  game,
  reduced,
}: {
  game: MutableRefObject<GameState>;
  reduced: boolean;
}) {
  const { camera, size } = useThree();
  const focus = useRef(4);
  const focusY = useRef(1.1);
  const run = useRef(-1);
  useFrame((_, dt) => {
    const s = game.current;
    const aspect = size.width / size.height;
    const target =
      s.phase === "intro"
        ? aspect < 1.1
          ? 1.8
          : 3.8
        : s.x + (aspect < 1.1 ? 0.6 : 2.4);
    const targetY = s.phase === "reveal" || s.phase === "complete" ? 1.9 : 1.1;
    if (run.current !== s.run || reduced || s.phase === "intro") {
      focus.current = target;
      focusY.current = targetY;
      run.current = s.run;
    } else if (s.phase !== "paused") {
      focus.current = THREE.MathUtils.damp(focus.current, target, 4, dt);
      focusY.current = THREE.MathUtils.damp(focusY.current, targetY, 3, dt);
    }
    camera.position.set(focus.current, focusY.current + 4.4, 13);
    camera.lookAt(focus.current, focusY.current, 0);
    const ortho = camera as THREE.OrthographicCamera;
    ortho.zoom = size.height / (aspect < 1 ? 7 : 8.3);
    ortho.updateProjectionMatrix();
  });
  return null;
}
function GardenLight() {
  const target = useMemo(() => {
    const object = new THREE.Object3D();
    object.position.set(17, 0, 0);
    return object;
  }, []);
  return (
    <>
      <primitive object={target} />
      <directionalLight
        position={[25, 12, 7]}
        target={target}
        intensity={2.1}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={16}
        shadow-camera-bottom={-16}
        shadow-camera-near={0.5}
        shadow-camera-far={60}
        shadow-normalBias={0.02}
      />
    </>
  );
}
function ContextGuard({ onFailure }: { onFailure: () => void }) {
  const { gl } = useThree();
  useEffect(() => {
    const lost = (e: Event) => {
      e.preventDefault();
      onFailure();
    };
    gl.domElement.addEventListener("webglcontextlost", lost);
    return () => gl.domElement.removeEventListener("webglcontextlost", lost);
  }, [gl, onFailure]);
  return null;
}
class SceneBoundary extends Component<
  { children: ReactNode; onFailure: () => void },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onFailure();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}
export default function World({
  game,
  reduced,
  onFailure,
}: {
  game: MutableRefObject<GameState>;
  reduced: boolean;
  onFailure: () => void;
}) {
  return (
    <SceneBoundary onFailure={onFailure}>
      <Canvas
        orthographic
        shadows
        dpr={[1, 1.5]}
        camera={{ position: [4, 5.5, 13], zoom: 60, near: 0.1, far: 100 }}
        gl={{ antialias: true, powerPreference: "high-performance" }}
        fallback={
          <p>Your celebration is available with “Open your surprise” below.</p>
        }
      >
        <Backdrop />
        <fog attach="fog" args={["#e9eddf", 22, 53]} />
        <ambientLight intensity={0.45} />
        <hemisphereLight args={["#fff9ee", "#a9b18a", 1.1]} />
        <GardenLight />
        <Suspense fallback={null}>
          <Garden />
          <Character game={game} reduced={reduced} />
          {BALLS.map((_, i) => (
            <Pickup key={i} index={i} game={game} reduced={reduced} />
          ))}
          <Gift game={game} reduced={reduced} />
          <Confetti game={game} reduced={reduced} />
        </Suspense>
        <CameraRig game={game} reduced={reduced} />
        <ContextGuard onFailure={onFailure} />
      </Canvas>
    </SceneBoundary>
  );
}
