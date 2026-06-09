import { useRef, useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { NearestFilter } from 'three'
import { usePS1Snap } from '../utils/ps1Snap.js'


const PAUSE_DURATION = 0.5 // seconds to hold at landing before resetting

export default function Pitch({ pitchData, playbackSpeed = 1, isPlaying = false, onLanded }) {
  const meshRef = useRef()
  const matRef = usePS1Snap(320, 240)

  const { nodes, materials, scene } = useGLTF('/models/baseball.glb')
  const albedoTexture = useMemo(() => {
    const tex = materials.Material.map
    tex.minFilter = NearestFilter
    tex.magFilter = NearestFilter
    tex.generateMipmaps = false
    tex.needsUpdate = true
    return tex
  }, [materials])

  const tRef = useRef(0)
  const pauseRef = useRef(0)
  const hasLandedRef = useRef(false)

  const t_release_to_50 = useRef(0)
  const t_50_to_plate = useRef(0)
  const handoff = useRef({ x: 0, z: 0 })
  const vRel = useRef({ vx: 0, vz: 0 })



  useEffect(() => {
    if (!pitchData || !meshRef.current) return

    tRef.current        = 0
    pauseRef.current    = 0
    hasLandedRef.current = false

    const { vx0, vy0, vz0, ax, ay, az,
            release_pos_x, release_pos_y, release_pos_z,
            plate_x, plate_z } = pitchData

    const A1   = 0.5 * ay
    const B1   = vy0
    const C1   = release_pos_y - 50
    const disc1 = B1 * B1 - 4 * A1 * C1
    t_release_to_50.current = (-B1 - Math.sqrt(disc1)) / (2 * A1)

    const disc2 = vy0 * vy0 - 4 * (0.5 * ay) * 50
    t_50_to_plate.current = (-vy0 - Math.sqrt(disc2)) / ay

    const tp = t_50_to_plate.current
    handoff.current = {
      x: plate_x - vx0 * tp - 0.5 * ax * tp * tp,
      z: plate_z - vz0 * tp - 0.5 * az * tp * tp,
    }

    const t50 = t_release_to_50.current
    vRel.current = {
      vx: (handoff.current.x - release_pos_x - 0.5 * ax * t50 * t50) / t50,
      vz: (handoff.current.z - release_pos_z - 0.5 * az * t50 * t50) / t50,
    }
  }, [pitchData])

  useEffect(() => {
    if (isPlaying && hasLandedRef.current) {
      tRef.current        = 0
      pauseRef.current    = 0
      hasLandedRef.current = false
    }
  }, [isPlaying])

  useFrame((state, delta) => {
    if (!meshRef.current || !pitchData) return

    const { vx0, vy0, vz0, ax, ay, az,
            release_pos_x, release_pos_y, release_pos_z,
            plate_x, plate_z } = pitchData

    const totalDuration = t_release_to_50.current + t_50_to_plate.current

    if (tRef.current >= totalDuration) {
      meshRef.current.position.set(plate_x, plate_z, 0)

      if (!hasLandedRef.current) {
        hasLandedRef.current = true
        onLanded?.()
      }

      if (!isPlaying) return

      pauseRef.current += delta * playbackSpeed
      if (pauseRef.current >= PAUSE_DURATION) {
        tRef.current        = 0
        pauseRef.current    = 0
        hasLandedRef.current = false
      }
      return
    }

    tRef.current += delta * 0.25 * playbackSpeed
    const elapsed = tRef.current

    let x, y, z

    if (elapsed <= t_release_to_50.current) {
      const s  = elapsed
      const vy_rel = vy0 - ay * t_release_to_50.current
      x = release_pos_x + vRel.current.vx * s + 0.5 * ax * s * s
      y = release_pos_y + vy_rel * s + 0.5 * ay * s * s
      z = release_pos_z + vRel.current.vz * s + 0.5 * az * s * s
    } else {
      const s = elapsed - t_release_to_50.current
      x = handoff.current.x + vx0 * s + 0.5 * ax * s * s
      y = 50 + vy0 * s + 0.5 * ay * s * s
      z = handoff.current.z + vz0 * s + 0.5 * az * s * s
    }

    meshRef.current.position.set(x, z, -y)
  })

  if (!pitchData) return null

  // return (
  //   <mesh ref={meshRef}>
  //     <sphereGeometry args={[0.08, 8, 6]} />
  //     <meshLambertMaterial ref={matRef} color="#f0ece0" flatShading />
  //   </mesh>
  // )
  return (
    // <mesh ref={meshRef} scale={0.08}>
    //   <primitive object={nodes.Baseball.geometry} attach="geometry" />
    //   <meshLambertMaterial ref={matRef} map={albedoTexture} flatShading />
    // </mesh>
    <mesh ref={meshRef} scale={4}>
      <primitive object={nodes.Baseball.geometry} attach="geometry" />
      <meshLambertMaterial
      ref={matRef}
      map={albedoTexture}
      emissive="#ffffff"
      emissiveIntensity={0.025}
      flatShading />
    </mesh>
  )
}

useGLTF.preload('/models/baseball.glb')