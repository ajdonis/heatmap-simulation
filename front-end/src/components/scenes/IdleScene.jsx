import { Canvas } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import StrikeZone from "../StrikeZone"
import Floor from "../Floor"

// Generic strike-zone
const IDLE_SZ_BOT = 1.5
const IDLE_SZ_TOP = 3.5

export default function IdleScene() {
  return (
    <div className="flex-1 relative">
      {/*
        dpr={0.4} renders the canvas at 40% of the CSS resolution, then the
        browser upscales it. Combined with `image-rendering: pixelated` in
        App.css, the upscale stays crisp instead of blurring — that's the
        PS1 chunky pixel look. Tune dpr lower (0.25–0.3) for harder pixelation,
        higher (0.5+) for cleaner edges.
      */}
      <Canvas camera={{ position: [5, 2.5, 10], fov: 50 }} dpr={0.45}>
        <ambientLight intensity={0.2} />
        <directionalLight position={[5, 5, 5]} />

        {/* Linear fog — clear out to 30 units, fully fogged at 140. Keeps the
            whole ball path readable while the distant floor dissolves into the
            void. Tune `near` up to push the haze back, `far` down to bring it in. */}
        <fog attach="fog" color="#003232" near={40} far={100} />

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          maxPolarAngle={Math.PI / 2 - 0.01}
          autoRotate
          autoRotateSpeed={1.0}
        />

        <Floor />
        <StrikeZone
          position={[0, 0, -0.5]}
          pitches={[]}
          szBot={IDLE_SZ_BOT}
          szTop={IDLE_SZ_TOP}
        />
      </Canvas>
    </div>
  )
}