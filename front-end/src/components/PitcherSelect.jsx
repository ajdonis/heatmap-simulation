import { useState } from "react"
import { useQuery } from "@tanstack/react-query"

async function fetchActivePitchers() {
  const res = await fetch("http://localhost:8080/api/pitchers/active")
  if (!res.ok) throw new Error(`Fetch failed (${res.status})`)
  return res.json()
}

export default function PitcherSelect({ onSelect }) {
  const [search, setSearch] = useState("")

  const { data: pitchers, isLoading, error } = useQuery({
    queryKey: ["active-pitchers"],
    queryFn: fetchActivePitchers,
  })

  const q = search.toLowerCase().trim()
  const filtered = (pitchers ?? [])
    .filter(p => (p.name ?? "").toLowerCase().includes(q))
    .sort((a, b) => (a.name ?? "").localeCompare(b.name ?? ""))

  return (
    <div className="flex flex-col gap-3">
      <p className="text-md uppercase tracking-wider text-white/50">Step 1 · Select a pitcher</p>

      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by name…"
        autoFocus
        className="bg-black/40 rounded px-3 py-2 text-md outline-none focus:bg-black/60 placeholder:text-white/30"
      />

      <div className="bg-black/30 rounded max-h-[45vh] overflow-y-auto">
        {isLoading && <div className="px-3 py-4 text-md text-white/50">Loading pitchers…</div>}
        {error && <div className="px-3 py-4 text-md text-red-400">Error loading pitchers</div>}
        {!isLoading && !error && filtered.length === 0 && (
          <div className="px-3 py-4 text-lg text-white/50">No pitchers match.</div>
        )}
        {filtered.map(p => (
          <button
            key={p.mlbam_id}
            onClick={() => onSelect({ mlbamId: p.mlbam_id, name: p.name })}
            className="w-full text-left px-3 py-2 text-md hover:bg-yellow-300/15 transition flex items-center justify-between cursor-pointer border-b border-white/5 last:border-b-0"
          >
            <span>{p.name}</span>
            <span className="text-md text-white/40 tabular-nums">{p.pa_against ?? "—"} PA</span>
          </button>
        ))}
      </div>
    </div>
  )
}