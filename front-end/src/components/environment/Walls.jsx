import { useMemo } from 'react'
import { useTexture } from '@react-three/drei'
import { DoubleSide, NearestFilter, RepeatWrapping } from 'three'

const OUTFIELD_HEIGHT  = 12
const LOW_WALL_HEIGHT  = 5

const FIELD_DEPTH = 135            // ← single knob to compress/expand the field
const FOUL_OFFSET = 30              // foul-territory width

const SQRT2_HALF  = Math.SQRT2 / 2

const SIDE_WALL_NEAR_X = FOUL_OFFSET * SQRT2_HALF
const SIDE_WALL_NEAR_Z = FOUL_OFFSET * SQRT2_HALF

const SIDE_WALL_FAR_X = (FIELD_DEPTH + FOUL_OFFSET) * SQRT2_HALF
const SIDE_WALL_FAR_Z = (FOUL_OFFSET - FIELD_DEPTH) * SQRT2_HALF

const SIDE_WALL_LENGTH = Math.hypot(SIDE_WALL_FAR_X - SIDE_WALL_NEAR_X,
                                    SIDE_WALL_FAR_Z - SIDE_WALL_NEAR_Z)
const SIDE_MID_X       = (SIDE_WALL_NEAR_X + SIDE_WALL_FAR_X) / 2
const SIDE_MID_Z       = (SIDE_WALL_NEAR_Z + SIDE_WALL_FAR_Z) / 2

const BACKSTOP_RADIUS = FOUL_OFFSET

const OUTFIELD_CENTER_Z = SIDE_WALL_FAR_Z
const OUTFIELD_RADIUS   = SIDE_WALL_FAR_X

export default function Walls() {
  const brickTexture = useTexture('/textures/stadium/wall.png')

  useMemo(() => {
    brickTexture.wrapS = RepeatWrapping
    brickTexture.wrapT = RepeatWrapping
    brickTexture.minFilter = NearestFilter
    brickTexture.magFilter = NearestFilter
    brickTexture.generateMipmaps = false
    const arcLength = OUTFIELD_RADIUS * Math.PI
    brickTexture.repeat.set(arcLength / 4, OUTFIELD_HEIGHT / 8)
    brickTexture.needsUpdate = true
  }, [brickTexture])

  return (
    <group>
      {/* Outfield wall — 180° half-circle */}
      <mesh position={[0, OUTFIELD_HEIGHT / 2, OUTFIELD_CENTER_Z]}>
        <cylinderGeometry
          args={[OUTFIELD_RADIUS, OUTFIELD_RADIUS, OUTFIELD_HEIGHT,
                 64, 1, true, Math.PI / 2, Math.PI]}
        />
        <meshLambertMaterial map={brickTexture} color="#ffffff"
                             side={DoubleSide} flatShading />
      </mesh>

      {/* 1B side wall */}
      <mesh position={[SIDE_MID_X, LOW_WALL_HEIGHT / 2, SIDE_MID_Z]}
            rotation={[0, Math.PI / 4, 0]}>
        <boxGeometry args={[SIDE_WALL_LENGTH, LOW_WALL_HEIGHT, 1]} />
        <meshLambertMaterial map={brickTexture} color="#ffffff"
                             side={DoubleSide} flatShading />
      </mesh>

      {/* 3B side wall — mirror */}
      <mesh position={[-SIDE_MID_X, LOW_WALL_HEIGHT / 2, SIDE_MID_Z]}
            rotation={[0, -Math.PI / 4, 0]}>
        <boxGeometry args={[SIDE_WALL_LENGTH, LOW_WALL_HEIGHT, 1]} />
        <meshLambertMaterial map={brickTexture} color="#ffffff"
                             side={DoubleSide} flatShading />
      </mesh>

      {/* Backstop — 90° arc behind home plate */}
      <mesh position={[0, LOW_WALL_HEIGHT / 2, 0]}>
        <cylinderGeometry
          args={[BACKSTOP_RADIUS, BACKSTOP_RADIUS, LOW_WALL_HEIGHT,
                 32, 1, true, -Math.PI / 4, Math.PI / 2]}
        />
        <meshLambertMaterial map={brickTexture} color="#ffffff"
                             side={DoubleSide} flatShading />
      </mesh>
    </group>
  )
}

export { OUTFIELD_HEIGHT, OUTFIELD_RADIUS, OUTFIELD_CENTER_Z }