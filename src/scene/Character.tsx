import { useRef, type MutableRefObject } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { GameState } from "../game/engine";

export function TennisBall({ size = 0.22 }: { size?: number }) {
  return (
    <group scale={size}>
      <mesh castShadow>
        <sphereGeometry args={[1, 20, 16]} />
        <meshStandardMaterial color="#d8e868" roughness={0.85} />
      </mesh>
      {[0, Math.PI / 2].map((a) => (
        <mesh key={a} rotation={[a, 0, 0.5]}>
          <torusGeometry args={[1.008, 0.025, 5, 40]} />
          <meshStandardMaterial color="#ffffdc" />
        </mesh>
      ))}
    </group>
  );
}
function Racket() {
  return (
    <group position={[0, 0.34, 0]}>
      <mesh position={[0, -0.18, 0]}>
        <cylinderGeometry args={[0.035, 0.045, 0.42, 10]} />
        <meshStandardMaterial color="#b9c9be" />
      </mesh>
      <mesh position={[0, -0.34, 0]}>
        <cylinderGeometry args={[0.052, 0.052, 0.18, 10]} />
        <meshStandardMaterial color="#f0d1a3" />
      </mesh>
      <group position={[0, 0.22, 0]} scale={[0.8, 1, 1]}>
        <mesh>
          <torusGeometry args={[0.27, 0.034, 8, 28]} />
          <meshStandardMaterial color="#748c75" metalness={0.15} />
        </mesh>
        {[-0.16, -0.08, 0, 0.08, 0.16].map((n) => (
          <group key={n}>
            <mesh position={[n, 0, 0]}>
              <boxGeometry
                args={[0.008, Math.sqrt(0.27 ** 2 - n ** 2) * 2, 0.008]}
              />
              <meshStandardMaterial color="#f3e6ca" />
            </mesh>
            <mesh position={[0, n, 0]}>
              <boxGeometry
                args={[Math.sqrt(0.27 ** 2 - n ** 2) * 2, 0.008, 0.008]}
              />
              <meshStandardMaterial color="#f3e6ca" />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
}
function Limb({
  color,
  length = 0.42,
  radius = 0.065,
}: {
  color: string;
  length?: number;
  radius?: number;
}) {
  return (
    <mesh position={[0, -length / 2, 0]} castShadow>
      <capsuleGeometry args={[radius, length - radius * 2, 5, 10]} />
      <meshStandardMaterial color={color} roughness={0.9} />
    </mesh>
  );
}
export function Character({
  game,
  reduced,
}: {
  game: MutableRefObject<GameState>;
  reduced: boolean;
}) {
  const root = useRef<THREE.Group>(null!);
  const body = useRef<THREE.Group>(null!);
  const upperBody = useRef<THREE.Group>(null!);
  const leftLeg = useRef<THREE.Group>(null!);
  const rightLeg = useRef<THREE.Group>(null!);
  const leftArm = useRef<THREE.Group>(null!);
  const rightArm = useRef<THREE.Group>(null!);
  const eyes = useRef<THREE.Group>(null!);
  const racket = useRef<THREE.Group>(null!);
  const animationTime = useRef(0);
  const animationRun = useRef(-1);
  useFrame((_, dt) => {
    const s = game.current;
    const moving = s.phase === "playing" && Math.abs(s.vx) > 0.15 && s.grounded;
    const celebration = s.phase === "complete" || s.phase === "reveal";
    const active = s.phase !== "paused" && !reduced;
    if (animationRun.current !== s.run) {
      animationRun.current = s.run;
      animationTime.current = 0;
    }
    if (active) animationTime.current += dt;
    const t = animationTime.current;
    root.current.position.set(s.x, s.y, 0.65);
    const targetRotation = s.facing > 0 ? 0.25 : -0.6;
    body.current.rotation.y = THREE.MathUtils.damp(
      body.current.rotation.y,
      targetRotation,
      10,
      dt,
    );
    const gait = moving && active ? Math.sin(s.elapsed * 13) : 0;
    // A short backswing and forehand follow-through while standing still.
    const swingTime = (t + 5) % 9;
    const swing =
      active && !moving && s.grounded && !celebration && swingTime < 2.2
        ? Math.sin((Math.PI * swingTime) / 2.2) ** 2
        : 0;
    const stroke = -Math.sin((Math.PI * 2 * swingTime) / 2.2) * swing;
    leftLeg.current.rotation.x = gait * 0.45;
    rightLeg.current.rotation.x = -gait * 0.45;
    leftArm.current.rotation.z = celebration
      ? -1.1 + (active ? Math.sin(t * 7) * 0.15 : 0)
      : -0.2;
    rightArm.current.rotation.z = celebration ? 1.9 : 0.45 + swing * 0.25;
    rightArm.current.rotation.y = stroke * 1.2;
    // Keep the racket upright in her hand, even when she raises her arm.
    racket.current.rotation.z = -rightArm.current.rotation.z - 0.25;
    racket.current.rotation.x = -swing * 0.3;
    racket.current.rotation.y = stroke * 0.35;
    leftArm.current.rotation.x = gait * 0.25;
    rightArm.current.rotation.x = -gait * 0.18 - swing * 0.95;
    upperBody.current.rotation.y = stroke * 0.12;
    const squash = s.anticipation > 0 ? -0.12 : s.landing > 0 ? -0.08 : 0;
    upperBody.current.scale.set(1 - squash * 0.4, 1 + squash, 1 - squash * 0.4);
    upperBody.current.rotation.z = active
      ? moving
        ? gait * 0.025
        : Math.sin(t * 1.7) * 0.014
      : 0;
    // Compute the lowest shoe sole after the leg rotation. At least the
    // supporting foot touches the physics surface throughout every stride.
    const sole = (angle: number) =>
      0.55 -
      0.39 * Math.cos(angle) -
      0.075 * Math.sin(angle) -
      Math.hypot(0.115 * 0.65 * Math.cos(angle), 0.115 * 1.6 * Math.sin(angle));
    body.current.position.y = -Math.min(sole(gait * 0.45), sole(-gait * 0.45));
    eyes.current.scale.y = active && t % 4.7 < 0.14 ? 0.12 : 1;
  });
  const skin = "#efbc9f";
  return (
    <group ref={root}>
      <group ref={body}>
        <group ref={leftLeg} position={[-0.14, 0.55, 0]}>
          <Limb color="#eac0ad" length={0.4} radius={0.07} />
          <mesh position={[0, -0.39, 0.075]} scale={[1, 0.65, 1.6]} castShadow>
            <sphereGeometry args={[0.115, 16, 12]} />
            <meshStandardMaterial color="#fff7e9" />
          </mesh>
        </group>
        <group ref={rightLeg} position={[0.14, 0.55, 0]}>
          <Limb color="#eac0ad" length={0.4} radius={0.07} />
          <mesh position={[0, -0.39, 0.075]} scale={[1, 0.65, 1.6]} castShadow>
            <sphereGeometry args={[0.115, 16, 12]} />
            <meshStandardMaterial color="#fff7e9" />
          </mesh>
        </group>
        <group ref={upperBody} position={[0, 0.55, 0]}>
          <group position={[0, -0.55, 0]}>
            <mesh position={[0, 0.78, 0]} castShadow>
              <cylinderGeometry args={[0.24, 0.36, 0.58, 24]} />
              <meshStandardMaterial color="#f3b4c4" roughness={0.95} />
            </mesh>
            <mesh position={[0, 1.04, 0]} castShadow>
              <sphereGeometry args={[0.25, 20, 16]} />
              <meshStandardMaterial color="#f7bfd0" />
            </mesh>
            <mesh position={[0, 1.19, 0.02]}>
              <cylinderGeometry args={[0.09, 0.1, 0.18, 12]} />
              <meshStandardMaterial color={skin} />
            </mesh>
            <group ref={leftArm} position={[-0.28, 1.04, 0.02]}>
              <Limb color={skin} length={0.43} />
              <mesh position={[0, -0.1, 0]}>
                <capsuleGeometry args={[0.09, 0.08, 5, 12]} />
                <meshStandardMaterial color="#f7bfd0" />
              </mesh>
              {game.current.phase === "intro" && (
                <group position={[0, -0.45, 0.05]}>
                  <TennisBall size={0.12} />
                </group>
              )}
            </group>
            <group ref={rightArm} position={[0.28, 1.04, 0.02]}>
              <Limb color={skin} length={0.43} />
              <mesh position={[0, -0.1, 0]}>
                <capsuleGeometry args={[0.09, 0.08, 5, 12]} />
                <meshStandardMaterial color="#f7bfd0" />
              </mesh>
              <group ref={racket} position={[0, -0.43, 0.12]}>
                <Racket />
              </group>
            </group>
            <group>
              <mesh
                position={[0, 1.18, -0.17]}
                scale={[1, 1.45, 0.65]}
                castShadow
              >
                <sphereGeometry args={[0.4, 24, 20]} />
                <meshStandardMaterial color="#29272b" roughness={0.75} />
              </mesh>
              <mesh
                position={[0, 1.59, -0.015]}
                scale={[1.07, 1.07, 1]}
                castShadow
              >
                <sphereGeometry args={[0.35, 24, 20]} />
                <meshStandardMaterial color="#29272b" />
              </mesh>
            </group>
            <mesh position={[0, 1.5, 0.14]} scale={[1, 1.08, 0.8]} castShadow>
              <sphereGeometry args={[0.31, 24, 20]} />
              <meshStandardMaterial color={skin} roughness={0.8} />
            </mesh>
            <group ref={eyes} position={[0, 1.53, 0.374]}>
              {[-0.105, 0.105].map((x) => (
                <group key={x}>
                  <mesh position={[x, 0, 0]} scale={[0.78, 1, 0.55]}>
                    <sphereGeometry args={[0.034, 12, 10]} />
                    <meshStandardMaterial color="#282830" />
                  </mesh>
                  <mesh position={[x - 0.008, 0.01, 0.02]}>
                    <sphereGeometry args={[0.009, 8, 8]} />
                    <meshBasicMaterial color="white" />
                  </mesh>
                </group>
              ))}
            </group>
            {[-0.17, 0.17].map((x) => (
              <mesh key={x} position={[x, 1.44, 0.35]} scale={[1, 0.5, 0.2]}>
                <sphereGeometry args={[0.05, 12, 10]} />
                <meshStandardMaterial color="#e994a0" />
              </mesh>
            ))}
            <mesh position={[0, 1.4, 0.384]} rotation={[0, 0, Math.PI]}>
              <torusGeometry args={[0.043, 0.009, 6, 16, Math.PI]} />
              <meshStandardMaterial color="#ac6264" />
            </mesh>
            <mesh
              position={[0.29, 1.77, 0.17]}
              rotation={[0, 0, 0.4]}
              scale={[1, 0.6, 0.4]}
            >
              <sphereGeometry args={[0.075, 12, 10]} />
              <meshStandardMaterial color="#ed92ae" />
            </mesh>
          </group>
        </group>
      </group>
    </group>
  );
}
