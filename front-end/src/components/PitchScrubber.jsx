import { useEffect, useState } from "react"

// Base interval between auto-advances at 1× speed, in milliseconds.
// Actual interval = BASE / playbackSpeed.
const BASE_PLAY_INTERVAL_MS = 2500

const SPEED_OPTIONS = [0.5, 1, 2]

// Bottom-center overlay for stepping through pitches in a game.
//
// Layout (vertical stack):
//   Pitch [ N ] / total
//   ━━━━━━━━━━━━━━━━━━━━━━━━━
//   [← ▶/⏸ ⏹ →]    [0.5× 1× 2×]
//
// Keyboard shortcuts (when not typing in any input/textarea):
//   ←  →    prev / next
//   Home    jump to first
//   End     jump to last
//   Space   toggle play / pause
//
// Both `isPlaying` and `playbackSpeed` are lifted to the parent so that other
// components (Pitch, Heatmap) can react to them.
export default function PitchScrubber({
  pitches,
  selectedIndex,
  setSelectedIndex,
  isPlaying,
  setIsPlaying,
  playbackSpeed,
  setPlaybackSpeed,
}) {
  const total = pitches?.length ?? 0
  const [inputValue, setInputValue] = useState(String(selectedIndex + 1))

  const interval = BASE_PLAY_INTERVAL_MS / playbackSpeed
  const atStart  = selectedIndex === 0
  const atEnd    = selectedIndex === total - 1

  // Sync input box with selectedIndex when it changes from elsewhere
  useEffect(() => {
    setInputValue(String(selectedIndex + 1))
  }, [selectedIndex])

  // Auto-advance interval while playing
  useEffect(() => {
    if (!isPlaying || total === 0) return
    const id = setInterval(() => {
      setSelectedIndex(prev => (prev >= total - 1 ? prev : prev + 1))
    }, interval)
    return () => clearInterval(id)
  }, [isPlaying, total, interval, setSelectedIndex])

  // Auto-pause when we hit the last pitch
  useEffect(() => {
    if (isPlaying && selectedIndex >= total - 1) {
      setIsPlaying(false)
    }
  }, [selectedIndex, total, isPlaying, setIsPlaying])

  // Keyboard navigation
  // Note: isPlaying / selectedIndex / atEnd are included as deps so the handler
  // always has the latest values. The listener is re-attached on state change
  // — a tiny cost, but it's what makes the spacebar shortcut work reliably.
  useEffect(() => {
    if (total === 0) return
    function handleKey(e) {
      const tag = e.target?.tagName
      if (tag === "INPUT" || tag === "TEXTAREA") return

      if (e.key === "ArrowLeft") {
        e.preventDefault()
        setIsPlaying(false)
        setSelectedIndex(i => Math.max(0, i - 1))
      } else if (e.key === "ArrowRight") {
        e.preventDefault()
        setIsPlaying(false)
        setSelectedIndex(i => Math.min(total - 1, i + 1))
      } else if (e.key === "Home") {
        e.preventDefault()
        setIsPlaying(false)
        setSelectedIndex(0)
      } else if (e.key === "End") {
        e.preventDefault()
        setIsPlaying(false)
        setSelectedIndex(total - 1)
      } else if (e.key === " ") {
        e.preventDefault()
        // Inline toggle — also handles play-from-end restart
        if (isPlaying) {
          setIsPlaying(false)
        } else {
          if (selectedIndex >= total - 1) setSelectedIndex(0)
          setIsPlaying(true)
        }
      }
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [total, isPlaying, selectedIndex, setSelectedIndex, setIsPlaying])

  if (total === 0) return null

  // ─── Button handlers ───────────────────────────────────────────────────────
  function goPrev() {
    setIsPlaying(false)
    setSelectedIndex(i => Math.max(0, i - 1))
  }

  function goNext() {
    setIsPlaying(false)
    setSelectedIndex(i => Math.min(total - 1, i + 1))
  }

  function togglePlay() {
    if (isPlaying) {
      setIsPlaying(false)
    } else {
      if (atEnd) setSelectedIndex(0)
      setIsPlaying(true)
    }
  }

  function stopPlayback() {
    setIsPlaying(false)
    setSelectedIndex(0)
  }

  // ─── Input handlers ────────────────────────────────────────────────────────
  function commitInput() {
    const n = parseInt(inputValue, 10)
    if (Number.isNaN(n) || n < 1) {
      setInputValue(String(selectedIndex + 1))
      return
    }
    setIsPlaying(false)
    const clamped = Math.min(total, n)
    setSelectedIndex(clamped - 1)
    setInputValue(String(clamped))
  }

  function handleInputKey(e) {
    if (e.key === "Enter") {
      e.target.blur()
    } else if (e.key === "Escape") {
      setInputValue(String(selectedIndex + 1))
      e.target.blur()
    }
  }

  // ─── Styles ────────────────────────────────────────────────────────────────
  const btnClass =
    "w-7 h-7 flex items-center justify-center bg-white/10 rounded " +
    "disabled:opacity-25 hover:bg-white/20 transition cursor-pointer " +
    "disabled:cursor-not-allowed"

  const playBtnClass =
    btnClass + (isPlaying ? " bg-yellow-300/25 hover:bg-yellow-300/35" : "")

  const speedBtnClass = (s) =>
    "px-2 h-7 flex items-center justify-center rounded text-[10px] tabular-nums " +
    "transition cursor-pointer " +
    (playbackSpeed === s
      ? "bg-yellow-300/25 text-white hover:bg-yellow-300/35"
      : "bg-white/10 text-white/70 hover:bg-white/20")

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/75 text-white rounded-md font-ui text-[13px] select-none backdrop-blur-sm flex flex-col items-center gap-2 px-4 py-3 min-w-[360px]">

      {/* Pitch counter */}
      <div className="text-white/70 tabular-nums flex items-center gap-1">
        <span>Pitch</span>
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onFocus={() => setIsPlaying(false)}
          onBlur={commitInput}
          onKeyDown={handleInputKey}
          className="w-9 bg-white/10 rounded px-1 text-center text-white tabular-nums focus:outline-none focus:bg-white/20"
          aria-label="Pitch number"
        />
        <span>/ {total}</span>
      </div>

      {/* Slider */}
      <input
        type="range"
        min={0}
        max={total - 1}
        value={selectedIndex}
        onChange={(e) => {
          setIsPlaying(false)
          setSelectedIndex(Number(e.target.value))
        }}
        className="w-72 accent-yellow-300 cursor-pointer"
        aria-label="Pitch position"
      />

      {/* Bottom row: transport on the left, speed on the right */}
      <div className="flex items-center justify-between w-full gap-3">
        <div className="flex items-center gap-1">
          <button onClick={goPrev} disabled={atStart} aria-label="Previous pitch" className={btnClass}>←</button>
          <button onClick={togglePlay} aria-label={isPlaying ? "Pause" : "Play"} className={playBtnClass}>
            {isPlaying ? "⏸" : "▶"}
          </button>
          <button onClick={stopPlayback} disabled={!isPlaying && atStart} aria-label="Stop" className={btnClass}>⏹</button>
          <button onClick={goNext} disabled={atEnd} aria-label="Next pitch" className={btnClass}>→</button>
        </div>

        <div className="flex items-center gap-1">
          {SPEED_OPTIONS.map(s => (
            <button
              key={s}
              onClick={() => setPlaybackSpeed(s)}
              aria-label={`Speed ${s} times`}
              className={speedBtnClass(s)}
            >
              {s}×
            </button>
          ))}
        </div>
      </div>

    </div>
  )
}