import Panel, { PanelHeader } from "../ui/Panel"
import PitcherSelect from "./PitcherSelect"
import GameSelect from "./GameSelect"

export default function SelectionModal({
  pitcher, onSelectPitcher, onSelectGame, onChangePitcher,
}) {
  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/55 backdrop-blur-sm">
      <Panel className="w-full max-w-md mx-6 text-white shadow-2xl">
        <PanelHeader className="text-center text-[30px] tracking-[0.2em] uppercase">
          Heatmap Simulation
        </PanelHeader>

        {pitcher == null ? (
          <PitcherSelect onSelect={onSelectPitcher} />
        ) : (
          <GameSelect
            pitcher={pitcher}
            onSelect={onSelectGame}
            onBack={onChangePitcher}
          />
        )}
      </Panel>
    </div>
  )
}