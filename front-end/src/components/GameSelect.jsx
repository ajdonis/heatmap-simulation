import { useQuery } from "@tanstack/react-query"

const SEASON = 2026

async function fetchGames({ queryKey }) {
  const [, mlbamId] = queryKey
  const res = await fetch(
    `http://localhost:8080/api/pitchers/${mlbamId}/games?season=${SEASON}`
  )
  if (!res.ok) throw new Error(`Fetch failed (${res.status})`)
  return res.json()
}

function formatDate(iso) {
  const [y, m, d] = iso.split("-").map(Number)
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    weekday: "short", month: "short", day: "numeric",
  })
}

export default function GameSelect({ pitcher, onSelect, onBack }) {
  const { data: games, isLoading, error } = useQuery({
    queryKey: ["games", pitcher.mlbamId, SEASON],
    queryFn: fetchGames,
  })

  const sorted = (games ?? [])
    .slice()
    .sort((a, b) => b.game_date.localeCompare(a.game_date))

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-lg uppercase tracking-wider text-white/50">Step 2 · Select a game</p>
        <button
          onClick={onBack}
          className="text-lg text-accent/60 hover:text-accent transition cursor-pointer"
        >
          ← change pitcher
        </button>
      </div>

      <p className="text-lg text-center text-accent/90">{pitcher.name}</p>

      <div className="bg-black/30 border border-accent/10 max-h-[45vh] overflow-y-auto">
        {isLoading && <div className="px-3 py-4 text-md text-white/50">Loading games…</div>}
        {error && <div className="px-3 py-4 text-md text-red-400">Error loading games</div>}
        {!isLoading && !error && sorted.length === 0 && (
          <div className="px-3 py-4 text-md text-white/50">No games found for this season.</div>
        )}
        {sorted.map(g => (
          <button
            key={g.game_pk}
            onClick={() => onSelect(g.game_pk)}
            className="w-full text-left px-3 py-2.5 hover:bg-accent/10 hover:text-accent transition flex items-center justify-between cursor-pointer border-b border-accent/10 last:border-b-0"
          >
            <div className="flex flex-col">
              <span className="text-md">{g.away_team} @ {g.home_team}</span>
              <span className="text-sm text-white/40">{formatDate(g.game_date)}</span>
            </div>
            <span className="text-md text-white/40 tabular-nums">{g.total_pitches} pitches</span>
          </button>
        ))}
      </div>
    </div>
  )
}