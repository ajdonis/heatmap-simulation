import PitcherSelect from "./PitcherSelect"
import GameSelect from "./GameSelect"

export default function SelectionModal({
  pitcher, onSelectPitcher, onSelectGame, onChangePitcher,
}) {
  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/55 backdrop-blur-sm">
      <div className="w-full max-w-md mx-6 bg-[#001f1f]/95 border border-white/10 rounded-lg shadow-2xl text-[16px] text-white">
        <div className="text-center px-5 pt-5 pb-3 border-b border-white/10">
          <h1 className="text-[30px] tracking-[0.2em] uppercase">Heatmap Simulation</h1>
          {/* <p className="text-[20px] text-white/40 mt-0.5">Pitch visualization</p> */}
        </div>

        <div className="p-5">
          {pitcher == null ? (
            <PitcherSelect onSelect={onSelectPitcher} />
          ) : (
            <GameSelect
              pitcher={pitcher}
              onSelect={onSelectGame}
              onBack={onChangePitcher}
            />
          )}
        </div>
      </div>
    </div>
  )
}