
function BasesDiamond({ on1b, on2b, on3b }) {
  const occupied = "fill-yellow-300 stroke-yellow-300"
  const empty    = "fill-transparent stroke-white/40"
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" className="shrink-0">
      <rect x="13" y="5"  width="6" height="6"
            transform="rotate(45 16 8)"  strokeWidth="1.5"
            className={on2b != null ? occupied : empty} />
      <rect x="5"  y="13" width="6" height="6"
            transform="rotate(45 8 16)"  strokeWidth="1.5"
            className={on3b != null ? occupied : empty} />
      <rect x="21" y="13" width="6" height="6"
            transform="rotate(45 24 16)" strokeWidth="1.5"
            className={on1b != null ? occupied : empty} />
    </svg>
  )
}

function OutsDisplay({ count = 0 }) {
  return (
    <span className="flex gap-0.5 items-center">
      {[0, 1, 2].map(i => (
        <span
          key={i}
          className={
            "w-1.5 h-1.5 rounded-full " +
            (i < count ? "bg-yellow-300" : "bg-white/25")
          }
        />
      ))}
    </span>
  )
}

export default function Scorebug({ pitch }) {
  if (!pitch) return null

  const {
    home_team, away_team,
    home_score, away_score,
    inning, inning_topbot,
    balls, strikes, outs_when_up,
    on_1b, on_2b, on_3b,
    batter_name,
    pitch_name, description, events,
    release_speed, plate_x, plate_z, zone,
    release_spin_rate,
    api_break_x_batter_in, api_break_z_with_gravity,
    at_bat_number, pitch_number,
  } = pitch

  const isTopHalf   = inning_topbot === "Top"
  const battingTeam = isTopHalf ? away_team : home_team
  const isBatting   = (team) => team === battingTeam

  const rawResult   = (events && events.trim()) ? events : description
  const humanResult = rawResult ? rawResult.replace(/_/g, " ") : "—"

  const fmt = (v, digits = 2) => v != null ? v.toFixed(digits) : "—"

  return (
    <div className="absolute top-4 left-4 bg-black/75 text-white rounded-md font-ui text-[12px] pointer-events-none select-none backdrop-blur-sm overflow-hidden">

      {/* ─── 1. Scorebug ──────────────────────────────────────────────── */}
      <div className="px-3 py-2 flex items-center gap-3 font-ui">
        <div className="flex flex-col gap-0.5 min-w-[60px]">
          <div className={"flex justify-between gap-3 " + (isBatting(away_team) ? "font-bold" : "")}>
            <span>{away_team ?? "—"}</span>
            <span>{away_score ?? 0}</span>
          </div>
          <div className={"flex justify-between gap-3 " + (isBatting(home_team) ? "font-bold" : "")}>
            <span>{home_team ?? "—"}</span>
            <span>{home_score ?? 0}</span>
          </div>
        </div>

        <div className="w-px h-8 bg-white/20" />

        <BasesDiamond on1b={on_1b} on2b={on_2b} on3b={on_3b} />

        <div className="w-px h-8 bg-white/20" />

        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1.5">
            <span className="text-white/70">{isTopHalf ? "▲" : "▼"}</span>
            <span className="font-bold">{inning ?? "?"}</span>
            <span className="ml-1 text-white/50">OUT</span>
            <OutsDisplay count={outs_when_up ?? 0} />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-white/50">CT</span>
            <span className="font-bold">{balls ?? 0}-{strikes ?? 0}</span>
          </div>
        </div>
      </div>

      {/* ─── 2. Batter + Result ───────────────────────────────────────── */}
      <div className="px-3 py-2 bg-white/10 text-center font-ui">
        <div className="text-white">
          {batter_name ?? "—"}
        </div>
        <div className="uppercase tracking-wider mt-0.5 text-white/90">
          {humanResult}
        </div>
      </div>

      {/* ─── 3. Pitch data ────────────────────────────────────────────── */}
      <div className="px-3 py-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 text-white/85 font-ui">
        <span className="text-white/50">AB / Pitch:</span>
        <span>{at_bat_number ?? "—"} / {pitch_number ?? "—"}</span>

        <span className="text-white/50">Pitch:</span>
        <span>{pitch_name ?? "—"}</span>

        <span className="text-white/50">Release:</span>
        <span>{release_speed != null ? `${release_speed.toFixed(1)} mph` : "—"}</span>

        <span className="text-white/50">Spin:</span>
        <span>{release_spin_rate != null ? `${release_spin_rate} rpm` : "—"}</span>

        <span className="text-white/50">Break H/V:</span>
        <span>
          {api_break_x_batter_in != null && api_break_z_with_gravity != null
            ? `${fmt(api_break_x_batter_in, 1)} / ${fmt(api_break_z_with_gravity, 1)} in`
            : "—"}
        </span>

        <span className="text-white/50">Plate:</span>
        <span>({fmt(plate_x)}, {fmt(plate_z)})</span>

        <span className="text-white/50">Zone:</span>
        <span>{zone ?? "—"}</span>
      </div>

    </div>
  )
}