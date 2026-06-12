import { DoubleSide } from 'three'
import { OUTFIELD_HEIGHT, OUTFIELD_RADIUS, OUTFIELD_CENTER_Z } from './Walls'

const SEATS_BOTTOM_RADIUS = OUTFIELD_RADIUS   // sits 5ft behind wall
const SEATS_TOP_RADIUS    = OUTFIELD_RADIUS + 45   // outward slope (top wider than base)
const SEATS_HEIGHT        = 24
const SEATS_COLOR         = '#5a5a5a'

export default function Seats() {
  return (
    <mesh position={[0, OUTFIELD_HEIGHT - 2 + SEATS_HEIGHT / 2, OUTFIELD_CENTER_Z]}>
      <cylinderGeometry
        args={[
          SEATS_TOP_RADIUS,
          SEATS_BOTTOM_RADIUS,
          SEATS_HEIGHT,
          64, 1, true,
          Math.PI / 2,      // thetaStart — matches outfield wall
          Math.PI,          // thetaLength — half circle
        ]}
      />
      <meshLambertMaterial color={SEATS_COLOR} side={DoubleSide} flatShading />
    </mesh>
  )
}