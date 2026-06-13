import { useMemo } from 'react'
import { useTexture } from '@react-three/drei'
import { NearestFilter, RepeatWrapping } from 'three'

const SKYLINE_WIDTH = 1300
const SKYLINE_HEIGHT = 200
const BACKDROP_RADIUS = 450        
const BACKDROP_SWEEP = SKYLINE_WIDTH / BACKDROP_RADIUS 

export default function Backdrop({ choice }) {
  const tex = useTexture(`/textures/skylines/${choice.file}`)

  useMemo(() => {
    tex.minFilter = NearestFilter
    tex.magFilter = NearestFilter
    tex.generateMipmaps = false
    // Flip U so texture reads correctly from inside the cylinder
    tex.wrapS = RepeatWrapping
    tex.repeat.x = -1
    tex.offset.x = 1
    tex.needsUpdate = true
  }, [tex])

  // Center the arc on the -Z direction (deep center field)
  const thetaStart = Math.PI - BACKDROP_SWEEP / 2

  return (
    <mesh position={[0, SKYLINE_HEIGHT / 2, -25]}>
      <cylinderGeometry args={[
        BACKDROP_RADIUS,
        BACKDROP_RADIUS,
        SKYLINE_HEIGHT,
        64, 1, true,
        thetaStart, BACKDROP_SWEEP
      ]} />
      <meshBasicMaterial map={tex} transparent side={2} />
    </mesh>
  )
}