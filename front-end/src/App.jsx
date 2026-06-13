import { useState, useMemo } from "react"
import IdleScene from "./components/scenes/IdleScene"
import StrikeZoneScene from "./components/scenes/StrikeZoneScene"
import SelectionModal from "./components/modals/SelectionModal"
import Welcome from "./components/modals/Welcome"
import { pickRandomSkyline } from "./components/environment/skylines"
import './App.css'

function App() {
  const [pitcher, setPitcher] = useState(null)
  const [gamePk, setGamePk] = useState(null)
  const [hasSeenWelcome, setHasSeenWelcome] = useState(false)

  const modalOpen = gamePk == null

  // Re-pick whenever a new game is locked in
  const skyline = useMemo(
    () => (gamePk ? pickRandomSkyline() : null),
    [gamePk]
  )

  const bgStyle = skyline
    ? { background: skyline.bg }
    : { background: '#87CEEB' }

  return (
    <div className="h-screen text-white flex relative font-data" style={bgStyle}>
      {gamePk == null ? (
        <IdleScene />
      ) : (
        <StrikeZoneScene
          mlbamId={pitcher.mlbamId}
          gamePk={gamePk}
          skyline={skyline}
          onEndSimulation={() => setGamePk(null)}
        />
      )}

      {modalOpen && (
        <SelectionModal
          pitcher={pitcher}
          onSelectPitcher={setPitcher}
          onSelectGame={setGamePk}
          onChangePitcher={() => setPitcher(null)}
        />
      )}

      {!hasSeenWelcome && (
        <Welcome onContinue={() => setHasSeenWelcome(true)} />
      )}
    </div>
  )
}

export default App