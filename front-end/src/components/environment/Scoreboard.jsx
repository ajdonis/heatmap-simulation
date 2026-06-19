import { OUTFIELD_CENTER_Z, OUTFIELD_RADIUS, GAP_ANGLE } from './Walls'
import { DoubleSide } from 'three'

const SCOREBOARD_WIDTH = OUTFIELD_RADIUS * GAP_ANGLE * 1.05
const SCOREBOARD_HEIGHT = 28
const SCOREBOARD_Z = OUTFIELD_CENTER_Z - OUTFIELD_RADIUS

export default function Scoreboard({ pitch }) {
  return (
    <group position={[0, SCOREBOARD_HEIGHT / 2, SCOREBOARD_Z - 2]}>
        <mesh>
            <planeGeometry args={[SCOREBOARD_WIDTH, SCOREBOARD_HEIGHT]} />
            <meshBasicMaterial color="#0a0a0a" side={DoubleSide} />
        </mesh>
    </group>
  )
}