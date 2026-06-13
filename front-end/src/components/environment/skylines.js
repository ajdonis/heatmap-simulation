export const SKYLINES = [
  { file: 'city1.png', bg: '#000000' },
  { file: 'city2.png', bg: '#E07C70' }, 
  { file: 'city3.png', bg: '#000000' },
  { file: 'city4.png', bg: '#000000' },
]

export function pickRandomSkyline() {
  return SKYLINES[Math.floor(Math.random() * SKYLINES.length)]
}