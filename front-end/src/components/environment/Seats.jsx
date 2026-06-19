import { useMemo } from 'react'
import { useTexture } from '@react-three/drei'
import { NearestFilter, RepeatWrapping } from 'three'
import {
  OUTFIELD_RADIUS,
  OUTFIELD_CENTER_Z,
  OUTFIELD_HEIGHT,
  LOW_WALL_HEIGHT,
  SIDE_WALL_LENGTH,
  SIDE_MID_X,
  SIDE_MID_Z,
  BACKSTOP_RADIUS,
  GAP_ANGLE,
  OUTFIELD_HALF_SWEEP,
} from './Walls'

// Outfield 
const OF_DEPTH = 25
const OF_HEIGHT = 35
const OF_BASE_Y = OUTFIELD_HEIGHT - 4     

// Side stands & backstop 
const SIDE_DEPTH = 10
const SIDE_HEIGHT = 25
const SIDE_SLANT_LENGTH = Math.hypot(SIDE_DEPTH, SIDE_HEIGHT)
const SIDE_SLANT_ANGLE = Math.atan2(SIDE_DEPTH, SIDE_HEIGHT)
const TILE_DENSITY = 44 
const SIDE_BASE_Y = LOW_WALL_HEIGHT - 2 

function configureTex(tex, repeatX) {
  tex.wrapS = RepeatWrapping
  tex.wrapT = RepeatWrapping
  tex.minFilter = NearestFilter
  tex.magFilter = NearestFilter
  tex.generateMipmaps = false
  tex.repeat.set(repeatX, 1)
  tex.needsUpdate = true
}

export default function Seats() {
  const baseTex = useTexture('/textures/stadium/stands.png')

  const { outfieldTex, sideTex, backstopTex } = useMemo(() => {
    const outfieldArc = OUTFIELD_RADIUS * OUTFIELD_HALF_SWEEP   // per-side
    const backstopArc = BACKSTOP_RADIUS * (Math.PI / 2)

    const outfield = baseTex.clone()
    configureTex(outfield, Math.max(1, Math.round(outfieldArc / TILE_DENSITY)))

    const side = baseTex.clone()
    configureTex(side, Math.max(1, Math.round(SIDE_WALL_LENGTH / TILE_DENSITY)))

    const backstop = baseTex.clone()
    configureTex(backstop, Math.max(1, Math.round(backstopArc / TILE_DENSITY)))

    return { outfieldTex: outfield, sideTex: side, backstopTex: backstop }
  }, [baseTex])

  return (
    <>
      {/* Right outfield stand */}
      <mesh position={[0, OF_BASE_Y + OF_HEIGHT / 2, OUTFIELD_CENTER_Z]}>
        <cylinderGeometry args={[
          OUTFIELD_RADIUS + OF_DEPTH, OUTFIELD_RADIUS, OF_HEIGHT,
          32, 1, true,
          Math.PI / 2, OUTFIELD_HALF_SWEEP,
        ]} />
        <meshLambertMaterial map={outfieldTex} color="#ffffff" side={2} />
      </mesh>

      {/* Left outfield stand */}
      <mesh position={[0, OF_BASE_Y + OF_HEIGHT / 2, OUTFIELD_CENTER_Z]}>
        <cylinderGeometry args={[
          OUTFIELD_RADIUS + OF_DEPTH, OUTFIELD_RADIUS, OF_HEIGHT,
          32, 1, true,
          Math.PI + GAP_ANGLE / 2, OUTFIELD_HALF_SWEEP,
        ]} />
        <meshLambertMaterial map={outfieldTex} color="#ffffff" side={2} />
      </mesh>

      {/* 1B side stand — slanted plane */}
      <group position={[SIDE_MID_X, 0, SIDE_MID_Z]} rotation={[0, Math.PI / 4, 0]}>
        <mesh
          position={[0, SIDE_BASE_Y + SIDE_HEIGHT / 2, SIDE_DEPTH / 2]}
          rotation={[SIDE_SLANT_ANGLE, 0, 0]}
        >
          <planeGeometry args={[SIDE_WALL_LENGTH, SIDE_SLANT_LENGTH]} />
          <meshLambertMaterial map={sideTex} color="#ffffff" side={2} />
        </mesh>
      </group>

      {/* 3B side stand — slanted plane (mirrored) */}
      <group position={[-SIDE_MID_X, 0, SIDE_MID_Z]} rotation={[0, -Math.PI / 4, 0]}>
        <mesh
          position={[0, SIDE_BASE_Y + SIDE_HEIGHT / 2, SIDE_DEPTH / 2]}
          rotation={[SIDE_SLANT_ANGLE, 0, 0]}
        >
          <planeGeometry args={[SIDE_WALL_LENGTH, SIDE_SLANT_LENGTH]} />
          <meshLambertMaterial map={sideTex} color="#ffffff" side={2} />
        </mesh>
      </group>

      {/* Backstop */}
      <mesh position={[0, SIDE_BASE_Y + SIDE_HEIGHT / 2, 0]}>
        <cylinderGeometry args={[
          BACKSTOP_RADIUS + SIDE_DEPTH,
          BACKSTOP_RADIUS,
          SIDE_HEIGHT,
          32, 1, true,
          -Math.PI / 4, Math.PI / 2,
        ]} />
        <meshLambertMaterial map={backstopTex} color="#ffffff" side={2} />
      </mesh>
    </>
  )
}