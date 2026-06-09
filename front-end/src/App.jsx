import { useState } from "react"
import IdleScene from "./components/IdleScene"
import StrikeZoneScene from "./components/StrikeZoneScene"
import SelectionModal from "./components/SelectionModal"
import Welcome from "./components/Welcome"
import './App.css'

function App() {
  const [pitcher, setPitcher] = useState(null)   // { mlbamId, name }
  const [gamePk, setGamePk] = useState(null)
  const [hasSeenWelcome, setHasSeenWelcome] = useState(false)

  // The modal is open whenever no game is locked in.
  const modalOpen = gamePk == null

  return (
    <div className="h-screen bg-[#87CEEB] text-white flex relative font-data">
      {gamePk == null ? (
        <IdleScene />
      ) : (
        <StrikeZoneScene
          mlbamId={pitcher.mlbamId}
          gamePk={gamePk}
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