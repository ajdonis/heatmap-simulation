import { useState, useLayoutEffect } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import { useQuery } from "@tanstack/react-query"
import { FlyControls } from "@react-three/drei"
import { PointerLockControls } from "@react-three/drei"
import StrikeZone from "../simulation/StrikeZone"
import Pitch from "../simulation/Pitch"
import Floor from "../environment/Floor"
import Walls from "../environment/Walls"
import Seats from "../environment/Seats"
import Backdrop from "../environment/Backdrop"
import Scorebug from "../hud/Scorebug"
import PitchScrubber from "../hud/PitchScrubber"
import Scoreboard from "../environment/Scoreboard"

async function fetchPitches({ queryKey }) {
  const [, mlbamId, gamePk] = queryKey
  const res = await fetch(
    `http://localhost:8080/api/pitchers/${mlbamId}/games/${gamePk}/pitches`
  )
  if (!res.ok) throw new Error(`Fetch failed (${res.status})`)
  return res.json()
}

export default function StrikeZoneScene({ mlbamId, gamePk, skyline, onEndSimulation }) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [currentPitchLanded, setCurrentPitchLanded] = useState(false)

  useLayoutEffect(() => { setCurrentPitchLanded(false) }, [selectedIndex, isPlaying])

  const { data: pitches, isLoading, error } = useQuery({
    queryKey: ["pitches", mlbamId, gamePk],
    queryFn: fetchPitches,
  })

  const endButton = (
    <button
      onClick={onEndSimulation}
      className="absolute top-4 right-4 z-10 bg-black/75 text-accent font-ui text-base px-3 py-2 border border-accent/40 hover:bg-red-500/30 hover:text-white hover:border-red-400/60 transition cursor-pointer backdrop-blur-sm"
    >
      [ End Simulation ]
    </button>
  )

  if (isLoading) {
    return (
      <div className="flex-1 relative flex items-center justify-center text-white">
        {endButton}Loading pitches…
      </div>
    )
  }
  if (error) {
    return (
      <div className="flex-1 relative flex items-center justify-center text-red-400">
        {endButton}Error loading pitches: {error.message}
      </div>
    )
  }
  if (!pitches || pitches.length === 0) {
    return (
      <div className="flex-1 relative flex items-center justify-center text-white text-center px-6">
        {endButton}
        <span>
          No pitches stored for this game yet.<br />
          <span className="text-xs text-white/60">
            Run POST /api/pitchers/{mlbamId}/fetch for this game's date range.
          </span>
        </span>
      </div>
    )
  }

  const selectedPitch  = pitches[selectedIndex]
  const includeCurrent = currentPitchLanded
  const heatmapPitches = pitches.slice(0, includeCurrent ? selectedIndex + 1 : selectedIndex)

  return (
    <div className="flex-1 relative">
      <Canvas 
        camera={{ position: [0, 1, 8.5], fov: 50 }} dpr={0.45}>
        <ambientLight intensity={0.7} />
        <directionalLight position={[5, 5, 5]} />

        {/* Linear fog — clear to 30, opaque at 140. See IdleScene for full notes. */}
        {/* LOOK INTO THIS ONCE STADIUM IS MORE BUILT OUT */}
        {/* <fogExp2 attach="fog" color="#003232" density={0.03} /> */}

        {/* FOR DEBUGGING */}
        {/* <FlyControls movementSpeed={20} rollSpeed={0.5} dragToLook /> */}

        {/* FOR  POTENTIAL CAMERA OPTIONS*/}
        {/* <PointerLockControls /> */}

        <OrbitControls 
          enableZoom={false} 
          target={[0, 2.5, -10]}
          minAzimuthAngle={-Math.PI / 5}           // can't rotate more than ~30° to the left
          maxAzimuthAngle={Math.PI / 5} 
          maxPolarAngle={Math.PI / 2 - 0.01}

           />


        <Floor />
        <Walls />
        <Seats />
        <Scoreboard/>
        <Backdrop choice={skyline}/>

        <Pitch
          pitchData={selectedPitch}
          playbackSpeed={playbackSpeed}
          isPlaying={isPlaying}
          onLanded={() => setCurrentPitchLanded(true)}
        />
        <StrikeZone
          position={[0, 0, -0.5]}
          pitches={heatmapPitches}
          szBot={selectedPitch.sz_bot}
          szTop={selectedPitch.sz_top}
        />
      </Canvas>

      {endButton}

      <Scorebug pitch={selectedPitch} />
      <PitchScrubber
        pitches={pitches}
        selectedIndex={selectedIndex}
        setSelectedIndex={setSelectedIndex}
        isPlaying={isPlaying}
        setIsPlaying={setIsPlaying}
        playbackSpeed={playbackSpeed}
        setPlaybackSpeed={setPlaybackSpeed}
      />
    </div>
  )
}