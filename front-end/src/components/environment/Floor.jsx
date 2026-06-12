import { useState, useEffect, useMemo } from 'react'
import {
  Shape,
  Path,
  TextureLoader,
  RepeatWrapping,
  NearestFilter,
  SRGBColorSpace,
} from 'three'
import { OUTFIELD_RADIUS } from './Walls'

// ─── Ground plane bounds ─────────────────────────────────────────────────────
const PLANE_W = 700
const PLANE_D = 500
const PLANE_Z_CENTER = -200

// ─── Dirt regions (world units) ──────────────────────────────────────────────
const MOUND_Z = -58
const MOUND_R = 11

// ─── Tiling scale ────────────────────────────────────────────────────────────
const FT_PER_TILE = 3

// ─── Infield geometry ────────────────────────────────────────────────────────
const INFIELD_RADIUS = 110
const HOME_PLATE_AREA_RADIUS = 8
const BASE_PATH_WIDTH = 8    // ← TUNED DOWN from 12: narrower base paths
const BACK_DIRT_BAND  = 20   // ← TUNED DOWN from 25: thinner back band

const DIRT_SEGMENTS = 12

// Foul line extends from edge of batter's box to where it hits the outfield wall
const FOUL_LINE_END_DIST = OUTFIELD_RADIUS                    // ≈ 120 ft along each axis
const FOUL_LINE_LENGTH   = (FOUL_LINE_END_DIST - 3) * Math.SQRT2
const FOUL_LINE_MID      = (3 + FOUL_LINE_END_DIST) / 2

export default function Floor() {
  const [textures, setTextures] = useState(null)

  useEffect(() => {
    const loader = new TextureLoader()
    const load = (url) => new Promise((res, rej) => loader.load(url, res, undefined, rej))

    let cancelled = false
    Promise.all([load('/textures/stadium/grass.png'), load('/textures/stadium/dirt.png')]).then(([grass, dirt]) => {
      if (cancelled) return

      const moundDirt = dirt.clone()
      moundDirt.needsUpdate = true

      // ← NEW: clone for the back catcher's area (its own scale)
      const backDirt = dirt.clone()
      backDirt.needsUpdate = true

      for (const t of [grass, dirt, moundDirt, backDirt]) {
        t.wrapS = RepeatWrapping
        t.wrapT = RepeatWrapping
        t.magFilter = NearestFilter
        t.minFilter = NearestFilter
        t.colorSpace = SRGBColorSpace
      }

      grass.repeat.set(PLANE_W / FT_PER_TILE, PLANE_D / FT_PER_TILE)

      // // Wedge: bounding box is (INFIELD_RADIUS * √2) wide × INFIELD_RADIUS tall
      // const bboxW = 2 * INFIELD_RADIUS * Math.sin(Math.PI / 4)
      // dirt.repeat.set(bboxW / FT_PER_TILE, INFIELD_RADIUS / FT_PER_TILE)
      // // ← CHANGED: no longer adding HOME_PLATE_AREA_RADIUS to bboxH
      // //   since wedge no longer wraps behind home plate

      const halfWidthShape = (BASE_PATH_WIDTH / 2) * Math.SQRT2
      const xIntForBbox = (halfWidthShape + Math.sqrt(2 * INFIELD_RADIUS * INFIELD_RADIUS - halfWidthShape * halfWidthShape)) / 2
      const bboxW = 2 * xIntForBbox
      const bboxH = INFIELD_RADIUS + halfWidthShape
      dirt.repeat.set(bboxW / FT_PER_TILE, bboxH / FT_PER_TILE)

      moundDirt.repeat.set((2 * MOUND_R) / FT_PER_TILE, (2 * MOUND_R) / FT_PER_TILE)

      backDirt.repeat.set((2 * HOME_PLATE_AREA_RADIUS) / FT_PER_TILE, (2 * HOME_PLATE_AREA_RADIUS) / FT_PER_TILE)

      setTextures({ grass, dirt, moundDirt, backDirt })
    })

    return () => { cancelled = true }
  }, [])

  const homePlate = useMemo(() => {
    const s = new Shape()
    s.moveTo(-0.708, 0.5)
    s.lineTo( 0.708, 0.5)
    s.lineTo( 0.708, -0.2)
    s.lineTo( 0, -0.708)
    s.lineTo(-0.708, -0.2)
    s.closePath()
    return s
  }, [])

  const batterBox = useMemo(() => {
    const s = new Shape()
    const w = 4, l = 6, t = 0.2  // 4ft × 6ft box, 0.2ft chalk line
    s.moveTo(-w/2, -l/2)
    s.lineTo( w/2, -l/2)
    s.lineTo( w/2, l/2)
    s.lineTo(-w/2, l/2)
    s.lineTo(-w/2, -l/2)
    const h = new Path()
    h.moveTo(-w/2 + t, -l/2 + t)
    h.lineTo( w/2 - t, -l/2 + t)
    h.lineTo( w/2 - t, l/2 - t)
    h.lineTo(-w/2 + t, l/2 - t)
    h.lineTo(-w/2 + t, -l/2 + t)
    s.holes.push(h)
    return s
  }, [])


  const wedgeShape = useMemo(() => {
    const s = new Shape()
    const halfWidth = BASE_PATH_WIDTH / 2
    const foulLineOffset = halfWidth * Math.SQRT2  

    // Outer foul-line edges shifted into foul territory by halfWidth
    const xInt = (foulLineOffset + Math.sqrt(2 * INFIELD_RADIUS * INFIELD_RADIUS - foulLineOffset * foulLineOffset)) / 2
    const yInt = xInt - foulLineOffset
    const outerAngle = Math.atan2(yInt, xInt)

    // Wedge now starts behind home plate at (0, -foulLineOffset) — covered by catcher's circle on top
    s.moveTo(0, -foulLineOffset)
    s.lineTo(xInt, yInt)
    // s.absarc(0, 0, INFIELD_RADIUS, outerAngle, Math.PI - outerAngle, false)
    const ARCH_DEPTH = 150   // tune — higher arches the middle more without raising the corners
    s.quadraticCurveTo(0, ARCH_DEPTH, -xInt, yInt)

    s.lineTo(0, -foulLineOffset)

    // Grass hole — only offset by halfWidth from foul line (instead of full BASE_PATH_WIDTH)
    // const grassPath = new Path()
    // const innerR = INFIELD_RADIUS - BACK_DIRT_BAND
    // const innerApexY = halfWidth * Math.SQRT2
    // const innerDisc = 2 * innerR * innerR - innerApexY * innerApexY
    // const innerX = (-innerApexY + Math.sqrt(innerDisc)) / 2
    // const innerY = innerX + innerApexY
    // const innerStartAngle = Math.atan2(innerY, innerX)

    // grassPath.moveTo(0, innerApexY)
    // grassPath.lineTo(innerX, innerY)
    // grassPath.absarc(0, 0, innerR, innerStartAngle, Math.PI - innerStartAngle, false)
    // grassPath.lineTo(0, innerApexY)

    // grassPath.moveTo(0, 10)         // home-plate corner (10ft past home in field direction)
    // grassPath.lineTo(60, 60)        // 1B corner
    // grassPath.lineTo(0, 110)        // 2B corner (back of diamond)
    // grassPath.lineTo(-60, 60)       // 3B corner
    // grassPath.lineTo(0, 10)         // close

    // Grass diamond — corners at the bases, with rounded corners and offset edges
const BASE_DIST_FULL = 100          // 2B distance from home plate
const PATH_OFFSET    = halfWidth * Math.SQRT2   // grass inset from foul line (same as foulLineOffset)
const FILLET_R       = 8                         // rounding radius at each base

const oneB_x = (BASE_DIST_FULL - PATH_OFFSET) / 2
const oneB_y = (BASE_DIST_FULL + PATH_OFFSET) / 2
const FR_HALF = FILLET_R / Math.SQRT2

const grassPath = new Path()

// Home corner — sits behind the catcher's circle, no rounding needed
grassPath.moveTo(0, PATH_OFFSET)

// → 1B (along Home-1B edge, stop at fillet tangent)
grassPath.lineTo(oneB_x - FR_HALF, oneB_y - FR_HALF)

// 1B fillet
grassPath.absarc(oneB_x - FILLET_R * Math.SQRT2, oneB_y, FILLET_R, -Math.PI/4, Math.PI/4, false)

// → 2B
grassPath.lineTo(FR_HALF, BASE_DIST_FULL - FR_HALF)

// 2B fillet
// grassPath.absarc(0, BASE_DIST_FULL - FILLET_R * Math.SQRT2, FILLET_R, Math.PI/4, 3*Math.PI/4, false)

// Flat top — cut off the 2B corner
const CUT_Y = 90   // tune — lower cuts more aggressively
const cutX = BASE_DIST_FULL - CUT_Y
grassPath.lineTo(cutX, CUT_Y)                          // along 1B-2B edge to cut point
const ARC_DEPTH = 3   // tune — how deep the arc dips below the chord
const offset = (cutX * cutX - ARC_DEPTH * ARC_DEPTH) / (2 * ARC_DEPTH)
const R = (cutX * cutX + ARC_DEPTH * ARC_DEPTH) / (2 * ARC_DEPTH)
grassPath.absarc(0, CUT_Y + offset, R,
                 Math.atan2(-offset, cutX),
                 Math.atan2(-offset, -cutX),
                 true)
grassPath.lineTo(-oneB_x + FR_HALF, oneB_y + FR_HALF)  // along 2B-3B edge to 3B tangent

// → 3B
grassPath.lineTo(-oneB_x + FR_HALF, oneB_y + FR_HALF)

// 3B fillet
grassPath.absarc(-oneB_x + FILLET_R * Math.SQRT2, oneB_y, FILLET_R, 3*Math.PI/4, 5*Math.PI/4, false)

// → Home
grassPath.lineTo(0, PATH_OFFSET)

    s.holes.push(grassPath)
    return s
  }, [])

  const backDirtShape = useMemo(() => {
    const s = new Shape()
    const r = HOME_PLATE_AREA_RADIUS
    s.moveTo(r, 0)
    s.absarc(0, 0, r, 0, Math.PI, true) 
    s.lineTo(r, 0)
    return s
  }, [])

  if (!textures) return null

  return (
    <group>
      {/* Grass — full ground extent */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, PLANE_Z_CENTER]} receiveShadow>
        <planeGeometry args={[PLANE_W, PLANE_D]} />
        <meshLambertMaterial map={textures.grass} flatShading />
      </mesh>

      {/* ← CHANGED: wedge with sharp apex at home plate, grass hole inside */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]}>
        <shapeGeometry args={[wedgeShape]} />
        <meshLambertMaterial color="#ffffff" map={textures.dirt} flatShading />
      </mesh>


      {/* 1B */}
      <mesh rotation={[-Math.PI/2, 0, Math.PI/4]} position={[FOUL_LINE_MID, 0.0025, -FOUL_LINE_MID]}>
        <planeGeometry args={[FOUL_LINE_LENGTH, 0.3]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>

      {/* 3B */}
      <mesh rotation={[-Math.PI/2, 0, 3*Math.PI/4]} position={[-FOUL_LINE_MID, 0.0025, -FOUL_LINE_MID]}>
        <planeGeometry args={[FOUL_LINE_LENGTH, 0.3]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>

      {/* Right-handed batter's box (3B side) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-3, 0.0028, 0]}>
        <shapeGeometry args={[batterBox]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>

      {/* Left-handed batter's box (1B side) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[3, 0.0028, 0]}>
        <shapeGeometry args={[batterBox]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>

      {/* Home plate dirt circle — surrounds home plate on all sides */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.0015, 0]}>
        <circleGeometry args={[HOME_PLATE_AREA_RADIUS, DIRT_SEGMENTS]} />
        <meshLambertMaterial map={textures.backDirt} flatShading />
      </mesh>

      {/* Pitcher's mound */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, MOUND_Z]}>
        <circleGeometry args={[MOUND_R, DIRT_SEGMENTS]} />
        <meshLambertMaterial map={textures.moundDirt} flatShading />
      </mesh>

      {/* Home plate */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.003, 0]}>
        <shapeGeometry args={[homePlate]} />
        <meshLambertMaterial color="#ffffff" flatShading />
      </mesh>

      
    </group>
  )
}