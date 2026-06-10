import Panel, { PanelHeader, PanelButton } from '../ui/Panel'

export default function Welcome({ onContinue }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-sm">
      <Panel className="max-w-md">
        
      {/* <div className="bg-[#001f1f]/95 max-w-lg w-[90%] p-8 rounded-sm"> */}
        {/* <h2 className="font-ui text-3xl text-center mb-4">Heatmap Simulation</h2> */}
        <PanelHeader>Heatmap Simulation</PanelHeader>

        <div className="font-data text-lg text-white/90 space-y-3 mb-6">
          <p>
            Visualize any MLB pitcher's outing in 3D! Pick a pitcher and a game from this current season,
            then watch each pitch thrown from release to the plate, with full
            pitch stats and results. Each pitch adds to a cumulative heatmap of where they land in the strike zone.
          </p>
          <p className="text-white/70">
            Drag to rotate the camera. Use the controls at the bottom to slide through pitches.
          </p>
        </div>

        <div className="flex justify-end">
          {/* <button
            onClick={onContinue}
            className="font-ui text-base px-4 py-2 bg-white/10 hover:bg-white/20 rounded-sm"
          >
            Continue
          </button> */}
          <PanelButton onClick={onContinue}>Continue</PanelButton>
        </div>
      {/* </div> */}
    </Panel>
    </div>
  )
}