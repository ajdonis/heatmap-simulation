import { Line } from '@react-three/drei'
import Heatmap from './Heatmap'



const GRID_COLOR = '#ffffff'
// PROPS
// pitches – array of pitch objects forwarded to Heatmap (MIGHT WANT TO INCLUDE THE ZONE FIELD?)
// szBot – strike zone bottom from sz_bot in the data (per batter)
// szTop – strike zone top from sz_top in the data (per batter)
export default function StrikeZone({ pitches = [], szBot = 1.5, szTop = 3.2, ...props }) {

  const szHeight = szTop - szBot
  const szWidth  = 1.66

  const left  = -szWidth / 2
  const right =  szWidth / 2
  const cellW = szWidth / 3
  const cellH = szHeight / 3

  // Positive z keeps grid lines in front of the heatmap planes
  const z = 0.03

  

  return (
    <group {...props}>

      {/* Heatmap — zone counts drive the cell colors */}
      <Heatmap pitches={pitches} szBot={szBot} szTop={szTop} />

      {/* Outer strike-zone border */}
      <Line
        points={[
          [left,  szBot, z],
          [right, szBot, z],
          [right, szTop, z],
          [left,  szTop, z],
          [left,  szBot, z],
        ]}
        color={GRID_COLOR}
        lineWidth={2}
      />

      {/* Shadow zone outer border */}
      {/* <Line
        points={[
          [-1.0, 1.0, z],
          [ 1.0, 1.0, z],
          [ 1.0, 4.0, z],
          [-1.0, 4.0, z],
          [-1.0, 1.0, z],
        ]}
        color={GRID_COLOR}
        lineWidth={1}
      /> */}

      {/* Vertical inner grid lines */}
      <Line points={[[left + cellW, szBot, z], [left + cellW, szTop, z]]} color={GRID_COLOR} lineWidth={1} />
      <Line points={[[left + cellW * 2, szBot, z], [left + cellW * 2, szTop, z]]} color={GRID_COLOR} lineWidth={1} />

      {/* Horizontal inner grid lines */}
      <Line points={[[left, szBot + cellH, z], [right, szBot + cellH, z]]} color={GRID_COLOR} lineWidth={1} />
      <Line points={[[left, szBot + cellH * 2, z], [right, szBot + cellH * 2, z]]} color={GRID_COLOR} lineWidth={1} />

    </group>
  )
}