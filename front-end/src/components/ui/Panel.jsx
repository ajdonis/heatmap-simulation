// Wrap any modal content. Provides gradient bg + corner brackets.
export default function Panel({ children, className = '' }) {
  return (
    <div className={`relative bg-gradient-to-b from-[#003838]/95 to-[#000c0c]/95 px-8 py-6 ${className}`}>
      {/* Four corner brackets */}
      <span className="absolute -top-px -left-px w-5 h-5 border-t-2 border-l-2 border-accent" />
      <span className="absolute -top-px -right-px w-5 h-5 border-t-2 border-r-2 border-accent" />
      <span className="absolute -bottom-px -left-px w-5 h-5 border-b-2 border-l-2 border-accent" />
      <span className="absolute -bottom-px -right-px w-5 h-5 border-b-2 border-r-2 border-accent" />
      {children}
    </div>
  )
}

// Title + thin divider underneath.
export function PanelHeader({ children, className = '' }) {
  return (
    <div className="mb-4">
      <h2 className="font-ui text-2xl text-center text-white tracking-wide">{children}</h2>
      <div className="mt-2 h-px bg-accent opacity-60" />
    </div>
  )
}

// Button with [ LABEL ] brackets baked in.
export function PanelButton({ children, onClick, className = '' }) {
  return (
    <button
      onClick={onClick}
      className={`font-ui text-accent hover:text-white transition-colors ${className}`}
    >
      [ {children} ]
    </button>
  )
}