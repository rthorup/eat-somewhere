import { useState, useRef, useEffect } from 'react'
import { CUISINE_LIST } from '@/types'

interface Props {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export default function CuisineCombobox({
  value,
  onChange,
  placeholder = 'Cuisine type…',
  className = '',
}: Props) {
  const [open,  setOpen]  = useState(false)
  const [query, setQuery] = useState(value)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef     = useRef<HTMLInputElement>(null)
  const listRef      = useRef<HTMLDivElement>(null)

  useEffect(() => { setQuery(value) }, [value])

  const filtered = query.trim()
    ? CUISINE_LIST.filter(c => c.toLowerCase().includes(query.toLowerCase()))
    : [...CUISINE_LIST]

  function select(cuisine: string) {
    onChange(cuisine)
    setQuery(cuisine)
    setOpen(false)
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value
    setQuery(v)
    onChange(v)
    setOpen(true)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Escape') { setOpen(false); inputRef.current?.blur(); return }
    if (e.key === 'Enter' && open && filtered.length > 0) {
      e.preventDefault()
      select(filtered[0])
    }
  }

  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [])

  const baseCls = 'w-full bg-brand-900 border border-brand-700/50 text-brand-50 text-sm rounded-lg px-3 py-2 placeholder:text-brand-50/20 focus:outline-none focus:border-brand-500'

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={handleChange}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        autoComplete="off"
        className={baseCls}
      />

      {open && filtered.length > 0 && (
        <div
          ref={listRef}
          className="absolute z-50 top-full left-0 right-0 mt-1 bg-brand-900 border border-brand-700/50 rounded-lg shadow-2xl max-h-60 overflow-y-auto"
        >
          {filtered.slice(0, 60).map(c => (
            <button
              key={c}
              type="button"
              onPointerDown={e => { e.preventDefault(); select(c) }}
              className={`w-full text-left px-3 py-2 text-sm transition-colors hover:bg-brand-700/40 ${
                c === value ? 'text-brand-300' : 'text-brand-50/80'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
