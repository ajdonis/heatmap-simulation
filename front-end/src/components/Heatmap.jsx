import { useMemo } from 'react'
import * as THREE from 'three'
import { DoubleSide } from 'three'
import { useBayerDither } from '../utils/ps1Snap'

// ─── Canvas / world space bounds ─────────────────────────────────────────────
// Generous bounds — well beyond the strike zone or any realistic batter's
// position. A 7 ft × 8 ft heatmap region captures everything from balls in
// the dirt to pitches that sail over the catcher's head, with breathing room
// on either side of the plate for extreme outside/inside pitches.
const CANVAS_W = 384
const CANVAS_H = 432
const X_MIN = -3.5
const X_MAX =  3.5
const Y_MIN = -1.0
const Y_MAX =  7.0

// Blob radius in feet — controls how wide each pitch's gaussian spreads
const SIGMA = 0.28

// ─── Coordinate mapping ───────────────────────────────────────────────────────
// plate_x / plate_z are already in feet matching scene units — no conversion needed.
// We just map feet → canvas pixels, flipping Y since canvas Y grows downward.
function worldToCanvas(x, y) {
  const cx = ((x - X_MIN) / (X_MAX - X_MIN)) * CANVAS_W
  const cy = CANVAS_H - ((y - Y_MIN) / (Y_MAX - Y_MIN)) * CANVAS_H
  return [cx, cy]
}

// ─── Colormap ─────────────────────────────────────────────────────────────────
// 5-stop gradient: blue (cold) → cyan → green → yellow → red (hot)
const COLORMAP = [
  [25,  25,  230],
  [0,   200, 230],
  [25,  230, 25 ],
  [255, 230, 0  ],
  [230, 25,  25 ],
]

function applyColormap(t) {
  const clamped = Math.max(0, Math.min(1, t))
  const scaled = clamped * (COLORMAP.length - 1)
  const i = Math.floor(scaled)
  const f = scaled - i
  const a = COLORMAP[Math.min(i, COLORMAP.length - 1)]
  const b = COLORMAP[Math.min(i + 1, COLORMAP.length - 1)]
  return [
    Math.round(a[0] + (b[0] - a[0]) * f),
    Math.round(a[1] + (b[1] - a[1]) * f),
    Math.round(a[2] + (b[2] - a[2]) * f),
  ]
}

// HEATMAP
// Props
//   pitches: array of pitch objects. Each must have `plate_x` and `plate_z`
//      (Statcast landing coordinates in feet). The blob is placed at the exact landing spot.
export default function Heatmap({ pitches = [] }) {

  const heatmapMatRef = useBayerDither()

  const texture = useMemo(() => {
    // Build a floating-point density grid by accumulating one gaussian per pitch
    const grid = new Float32Array(CANVAS_W * CANVAS_H)

    const sigmaX = (SIGMA / (X_MAX - X_MIN)) * CANVAS_W
    const sigmaY = (SIGMA / (Y_MAX - Y_MIN)) * CANVAS_H
    const radius = Math.ceil(Math.max(sigmaX, sigmaY) * 3)

    for (const pitch of pitches) {
      if (pitch.plate_x == null || pitch.plate_z == null) continue
      const [cx, cy] = worldToCanvas(pitch.plate_x, pitch.plate_z)

      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          const px = Math.round(cx) + dx
          const py = Math.round(cy) + dy
          if (px < 0 || px >= CANVAS_W || py < 0 || py >= CANVAS_H) continue

          const value = Math.exp(
            -(dx * dx) / (2 * sigmaX * sigmaX)
            -(dy * dy) / (2 * sigmaY * sigmaY)
          )
          grid[py * CANVAS_W + px] += value
        }
      }
    }

    // Normalize to [0, 1]
    let maxVal = 0
    for (let i = 0; i < grid.length; i++) if (grid[i] > maxVal) maxVal = grid[i]
    if (maxVal === 0) maxVal = 1

    // Convert density -> RGBA pixels
    const imageData = new ImageData(CANVAS_W, CANVAS_H)
    for (let i = 0; i < grid.length; i++) {
      const t = grid[i] / maxVal
      if (t < 0.02) continue 

      const [r, g, b] = applyColormap(t)
      imageData.data[i * 4 + 0] = r
      imageData.data[i * 4 + 1] = g
      imageData.data[i * 4 + 2] = b
      // Alpha scales with intensity so the blob fades out naturally at the edges
      imageData.data[i * 4 + 3] = Math.round(55 + t * 200)
    }

    // Paint to an offscreen canvas so Three.js can read it as a texture
    const canvas = document.createElement('canvas')
    canvas.width  = CANVAS_W
    canvas.height = CANVAS_H
    canvas.getContext('2d').putImageData(imageData, 0, 0)

    return new THREE.CanvasTexture(canvas)
  }, [pitches])

  // Plane covers the full canvas bounds
  const width  = X_MAX - X_MIN
  const height = Y_MAX - Y_MIN
  const cx     = (X_MAX + X_MIN) / 2
  const cy     = (Y_MAX + Y_MIN) / 2

  return (
    <mesh position={[cx, cy, 0]}>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial ref={heatmapMatRef} map={texture} transparent depthWrite={false} side={DoubleSide}/>
    </mesh>
  )
}